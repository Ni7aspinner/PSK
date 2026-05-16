package org.psk.contract.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.psk.contract.Contract;
import org.psk.contract.ContractRepository;
import org.psk.contract.ContractStatus;
import org.psk.supplier.Supplier;
import org.psk.supplier.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class ContractRepositoryTest {

  @Autowired private ContractRepository contractRepository;
  @Autowired private SupplierRepository supplierRepository;

  @Test
  void findBySupplierId_returnsSupplierContracts() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    Supplier otherSupplier = supplierRepository.save(supplier("Supplier B", "S-B"));
    Contract expected = contractRepository.save(contract(supplier, "C-001", ContractStatus.ACTIVE));
    contractRepository.save(contract(otherSupplier, "C-002", ContractStatus.ACTIVE));

    List<Contract> result = contractRepository.findBySupplierId(supplier.getId());

    assertThat(result).containsExactly(expected);
  }

  @Test
  void findByEndDateBeforeAndStatus_returnsMatchingContracts() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    Contract expected = contractRepository.save(contract(supplier, "C-001", ContractStatus.ACTIVE));
    contractRepository.save(contract(supplier, "C-002", ContractStatus.TERMINATED));
    Contract future = contract(supplier, "C-003", ContractStatus.ACTIVE);
    future.setEndDate(LocalDate.of(2027, 12, 31));
    contractRepository.save(future);

    List<Contract> result =
        contractRepository.findByEndDateBeforeAndStatus(
            LocalDate.of(2027, 1, 1), ContractStatus.ACTIVE);

    assertThat(result).containsExactly(expected);
  }

  @Test
  void existsByContractNumber_existingNumber_returnsTrue() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    contractRepository.save(contract(supplier, "C-001", ContractStatus.ACTIVE));

    boolean result = contractRepository.existsByContractNumber("C-001");

    assertThat(result).isTrue();
  }

  private Supplier supplier(String name, String registrationCode) {
    Supplier supplier = new Supplier();
    supplier.setName(name);
    supplier.setRegistrationCode(registrationCode);
    return supplier;
  }

  private Contract contract(Supplier supplier, String number, ContractStatus status) {
    Contract contract = new Contract();
    contract.setContractNumber(number);
    contract.setTitle("Contract " + number);
    contract.setStartDate(LocalDate.of(2026, 1, 1));
    contract.setEndDate(LocalDate.of(2026, 12, 31));
    contract.setStatus(status);
    contract.setSupplier(supplier);
    return contract;
  }
}
