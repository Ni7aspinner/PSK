package org.psk.service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.psk.contract.domain.Contract;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.repository.ContractRepository;
import org.psk.service.domain.Service;
import org.psk.service.dto.CreateServiceRequest;
import org.psk.service.dto.ServiceDto;
import org.psk.service.dto.ServiceMapper;
import org.psk.service.dto.UpdateServiceRequest;
import org.psk.service.exception.ServiceContractSupplierMismatchException;
import org.psk.service.exception.ServiceNotFoundException;
import org.psk.service.repository.ServiceRepository;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class ServiceManagementServiceTest {

  @Mock private ServiceRepository serviceRepository;
  @Mock private SupplierRepository supplierRepository;
  @Mock private ContractRepository contractRepository;

  private final ServiceMapper serviceMapper = new ServiceMapper();

  private ServiceManagementService serviceManagementService;

  @BeforeEach
  void setUp() {
    serviceManagementService =
        new ServiceManagementService(
            serviceRepository, supplierRepository, contractRepository, serviceMapper);
  }

  @Test
  void findById_notFound_throwsServiceNotFoundException() {
    when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> serviceManagementService.findById(99L))
        .isInstanceOf(ServiceNotFoundException.class)
        .hasMessageContaining("99");
  }

  @Test
  void findBySupplierId_missingSupplier_throwsSupplierNotFoundException() {
    when(supplierRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> serviceManagementService.findBySupplierId(1L))
        .isInstanceOf(SupplierNotFoundException.class);
  }

  @Test
  void create_missingSupplier_throwsSupplierNotFoundException() {
    CreateServiceRequest req = createRequest(1L, null);
    when(supplierRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> serviceManagementService.create(req))
        .isInstanceOf(SupplierNotFoundException.class);
  }

  @Test
  void create_missingContract_throwsContractNotFoundException() {
    Supplier supplier = supplier(1L);
    CreateServiceRequest req = createRequest(1L, 10L);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contractRepository.findById(10L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> serviceManagementService.create(req))
        .isInstanceOf(ContractNotFoundException.class);
  }

  @Test
  void create_contractFromDifferentSupplier_throwsMismatchException() {
    Supplier supplier = supplier(1L);
    Contract contract = contract(10L, supplier(2L));
    CreateServiceRequest req = createRequest(1L, 10L);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contractRepository.findById(10L)).thenReturn(Optional.of(contract));

    assertThatThrownBy(() -> serviceManagementService.create(req))
        .isInstanceOf(ServiceContractSupplierMismatchException.class);
  }

  @Test
  void create_validRequest_savesAndReturnsDto() {
    Supplier supplier = supplier(1L);
    Contract contract = contract(10L, supplier);
    CreateServiceRequest req = createRequest(1L, 10L);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contractRepository.findById(10L)).thenReturn(Optional.of(contract));
    when(serviceRepository.save(any(Service.class)))
        .thenAnswer(
            invocation -> {
              Service service = invocation.getArgument(0);
              service.setId(5L);
              return service;
            });

    ServiceDto result = serviceManagementService.create(req);

    assertThat(result.getId()).isEqualTo(5L);
    assertThat(result.getSupplierId()).isEqualTo(1L);
    assertThat(result.getContractId()).isEqualTo(10L);
  }

  @Test
  void update_existingService_updatesAndReturnsDto() {
    Supplier supplier = supplier(1L);
    Service existing = service(5L, supplier, null);
    UpdateServiceRequest req = updateRequest(1L, null);
    when(serviceRepository.findById(5L)).thenReturn(Optional.of(existing));
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(serviceRepository.save(existing)).thenReturn(existing);

    ServiceDto result = serviceManagementService.update(5L, req);

    assertThat(result.getName()).isEqualTo("Updated service");
    assertThat(result.getActive()).isFalse();
  }

  @Test
  void delete_existingService_callsRepositoryDelete() {
    Service existing = service(5L, supplier(1L), null);
    when(serviceRepository.findById(5L)).thenReturn(Optional.of(existing));

    serviceManagementService.delete(5L);

    verify(serviceRepository).delete(existing);
  }

  private CreateServiceRequest createRequest(Long supplierId, Long contractId) {
    CreateServiceRequest req = new CreateServiceRequest();
    req.setName("Hosting");
    req.setDescription("Managed hosting");
    req.setSupplierId(supplierId);
    req.setContractId(contractId);
    return req;
  }

  private UpdateServiceRequest updateRequest(Long supplierId, Long contractId) {
    UpdateServiceRequest req = new UpdateServiceRequest();
    req.setName("Updated service");
    req.setDescription("Updated");
    req.setActive(false);
    req.setSupplierId(supplierId);
    req.setContractId(contractId);
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

  private Contract contract(Long id, Supplier supplier) {
    Contract contract = new Contract();
    contract.setId(id);
    contract.setContractNumber("C-" + id);
    contract.setSupplier(supplier);
    return contract;
  }

  private Service service(Long id, Supplier supplier, Contract contract) {
    Service service = new Service();
    service.setId(id);
    service.setName("Hosting");
    service.setSupplier(supplier);
    service.setContract(contract);
    service.setActive(true);
    return service;
  }
}
