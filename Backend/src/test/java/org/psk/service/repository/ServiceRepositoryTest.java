package org.psk.service.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.psk.contract.repository.ContractRepository;
import org.psk.service.domain.Service;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class ServiceRepositoryTest {

  @Autowired private ServiceRepository serviceRepository;
  @Autowired private SupplierRepository supplierRepository;
  @Autowired private ContractRepository contractRepository;

  @Test
  void findBySupplierId_returnsSupplierServices() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    Supplier otherSupplier = supplierRepository.save(supplier("Supplier B", "S-B"));
    Contract contract = contractRepository.save(contract(supplier, "C-001"));
    Service expected = serviceRepository.save(service("Hosting", supplier, contract));
    serviceRepository.save(service("Consulting", otherSupplier, null));

    List<Service> result = serviceRepository.findBySupplierId(supplier.getId());

    assertThat(result).containsExactly(expected);
  }

  @Test
  void findByContractId_returnsCoveredServices() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    Contract contract = contractRepository.save(contract(supplier, "C-001"));
    Contract otherContract = contractRepository.save(contract(supplier, "C-002"));
    Service expected = serviceRepository.save(service("Hosting", supplier, contract));
    serviceRepository.save(service("Consulting", supplier, otherContract));

    List<Service> result = serviceRepository.findByContractId(contract.getId());

    assertThat(result).containsExactly(expected);
  }

  private Supplier supplier(String name, String registrationCode) {
    Supplier supplier = new Supplier();
    supplier.setName(name);
    supplier.setRegistrationCode(registrationCode);
    return supplier;
  }

  private Contract contract(Supplier supplier, String number) {
    Contract contract = new Contract();
    contract.setContractNumber(number);
    contract.setTitle("Contract " + number);
    contract.setStartDate(LocalDate.of(2026, 1, 1));
    contract.setEndDate(LocalDate.of(2026, 12, 31));
    contract.setStatus(ContractStatus.ACTIVE);
    contract.setSupplier(supplier);
    return contract;
  }

  private Service service(String name, Supplier supplier, Contract contract) {
    Service service = new Service();
    service.setName(name);
    service.setSupplier(supplier);
    service.setContract(contract);
    return service;
  }
}
