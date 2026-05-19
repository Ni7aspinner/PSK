package org.psk.contract.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.psk.common.conflict.OptimisticLockConflictException;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.ContractMapper;
import org.psk.contract.dto.CreateContractRequest;
import org.psk.contract.dto.UpdateContractRequest;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.exception.ContractNumberDuplicateException;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.psk.contract.repository.ContractRepository;
import org.psk.service.domain.Service;
import org.psk.service.repository.ServiceRepository;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

  @Mock private ContractRepository contractRepository;
  @Mock private SupplierRepository supplierRepository;
  @Mock private ServiceRepository serviceRepository;

  private final ContractMapper contractMapper = new ContractMapper();

  private ContractService contractService;

  @BeforeEach
  void setUp() {
    contractService =
        new ContractService(
            contractRepository, supplierRepository, serviceRepository, contractMapper);
  }

  @Test
  void create_duplicateNumber_throwsContractNumberDuplicateException() {
    CreateContractRequest req = createRequest(1L);
    when(contractRepository.existsByContractNumber("C-001")).thenReturn(true);

    assertThatThrownBy(() -> contractService.create(req))
        .isInstanceOf(ContractNumberDuplicateException.class);
  }

  @Test
  void create_invalidDateRange_throwsInvalidContractDateRangeException() {
    CreateContractRequest req = createRequest(1L);
    req.setStartDate(LocalDate.of(2026, 12, 31));
    req.setEndDate(LocalDate.of(2026, 1, 1));
    when(contractRepository.existsByContractNumber("C-001")).thenReturn(false);

    assertThatThrownBy(() -> contractService.create(req))
        .isInstanceOf(InvalidContractDateRangeException.class);
  }

  @Test
  void create_validRequest_savesAndReturnsDto() {
    Supplier supplier = supplier(1L);
    CreateContractRequest req = createRequest(1L);
    when(contractRepository.existsByContractNumber("C-001")).thenReturn(false);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contractRepository.save(any(Contract.class)))
        .thenAnswer(
            invocation -> {
              Contract contract = invocation.getArgument(0);
              contract.setId(5L);
              return contract;
            });

    ContractDto result = contractService.create(req);

    assertThat(result.getId()).isEqualTo(5L);
    assertThat(result.getContractNumber()).isEqualTo("C-001");
    assertThat(result.getSupplierId()).isEqualTo(1L);
  }

  @Test
  void update_doesNotChangeContractNumber() {
    Contract existing = contract(5L, supplier(1L), "C-001");
    UpdateContractRequest req = updateRequest();
    when(contractRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(contractRepository.save(existing)).thenReturn(existing);

    ContractDto result = contractService.update(5L, req);

    assertThat(result.getContractNumber()).isEqualTo("C-001");
    assertThat(result.getTitle()).isEqualTo("Updated contract");
  }

  @Test
  void update_staleVersion_throwsOptimisticLockConflictException() {
    Contract existing = contract(5L, supplier(1L), "C-001");
    existing.setVersion(2L);
    UpdateContractRequest req = updateRequest();
    req.setVersion(1L);
    when(contractRepository.findById(5L)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> contractService.update(5L, req))
        .isInstanceOf(OptimisticLockConflictException.class)
        .hasMessageContaining("Contract was modified by another user");
  }

  @Test
  void forceOverwrite_staleVersion_updatesWithoutVersionCheck() {
    Contract existing = contract(5L, supplier(1L), "C-001");
    existing.setVersion(2L);
    UpdateContractRequest req = updateRequest();
    req.setVersion(0L);
    req.setForceOverwrite(true);
    when(contractRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(contractRepository.save(existing)).thenReturn(existing);

    ContractDto result = contractService.forceOverwrite(5L, req);

    assertThat(result.getTitle()).isEqualTo("Updated contract");
  }

  @Test
  void terminate_existingContract_setsTerminatedStatus() {
    Contract existing = contract(5L, supplier(1L), "C-001");
    when(contractRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(contractRepository.save(existing)).thenReturn(existing);

    ContractDto result = contractService.terminate(5L);

    assertThat(result.getStatus()).isEqualTo(ContractStatus.TERMINATED);
  }

  @Test
  void terminate_notFound_throwsContractNotFoundException() {
    when(contractRepository.findById(5L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contractService.terminate(5L))
        .isInstanceOf(ContractNotFoundException.class);
  }

  @Test
  void delete_existingContract_unlinksServicesAndDeletesContract() {
    Contract existing = contract(5L, supplier(1L), "C-001");
    Service service = new Service();
    service.setName("Hosting");
    service.setSupplier(existing.getSupplier());
    service.setContract(existing);
    when(contractRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(serviceRepository.findByContractId(5L)).thenReturn(List.of(service));

    contractService.delete(5L);

    assertThat(service.getContract()).isNull();
    verify(serviceRepository).saveAll(List.of(service));
    verify(contractRepository).delete(existing);
  }

  private CreateContractRequest createRequest(Long supplierId) {
    CreateContractRequest req = new CreateContractRequest();
    req.setContractNumber("C-001");
    req.setTitle("Contract");
    req.setStartDate(LocalDate.of(2026, 1, 1));
    req.setEndDate(LocalDate.of(2026, 12, 31));
    req.setStatus(ContractStatus.ACTIVE);
    req.setSupplierId(supplierId);
    return req;
  }

  private UpdateContractRequest updateRequest() {
    UpdateContractRequest req = new UpdateContractRequest();
    req.setTitle("Updated contract");
    req.setStartDate(LocalDate.of(2026, 1, 1));
    req.setEndDate(LocalDate.of(2026, 12, 31));
    req.setStatus(ContractStatus.ACTIVE);
    req.setVersion(0L);
    return req;
  }

  private Supplier supplier(Long id) {
    Supplier supplier = new Supplier();
    supplier.setId(id);
    supplier.setName("Supplier " + id);
    supplier.setRegistrationCode("S-" + id);
    return supplier;
  }

  private Contract contract(Long id, Supplier supplier, String number) {
    Contract contract = new Contract();
    contract.setId(id);
    contract.setContractNumber(number);
    contract.setTitle("Contract");
    contract.setStartDate(LocalDate.of(2026, 1, 1));
    contract.setEndDate(LocalDate.of(2026, 12, 31));
    contract.setStatus(ContractStatus.ACTIVE);
    contract.setSupplier(supplier);
    contract.setVersion(0L);
    return contract;
  }
}
