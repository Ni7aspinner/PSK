package org.psk.report.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.psk.contact.ContactRepository;
import org.psk.contract.Contract;
import org.psk.contract.ContractRepository;
import org.psk.contract.ContractStatus;
import org.psk.report.dto.ActiveSupplierRow;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.service.ServiceRepository;
import org.psk.supplier.Supplier;
import org.psk.supplier.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ReportServiceTest {

  @Autowired private ReportService reportService;
  @Autowired private SupplierRepository supplierRepository;
  @Autowired private ContractRepository contractRepository;
  @Autowired private ServiceRepository serviceRepository;
  @Autowired private ContactRepository contactRepository;

  @BeforeEach
  void setUp() {
    serviceRepository.deleteAll();
    contactRepository.deleteAll();
    contractRepository.deleteAll();
    supplierRepository.deleteAll();
  }

  @Test
  void getActiveSuppliersReport_returnsRowsForSuppliersWithAndWithoutActiveItems()
      throws Exception {
    Supplier supplierWithActiveItems =
        supplierRepository.save(supplier("Active Supplier", "A-001"));
    Supplier supplierWithoutActiveItems =
        supplierRepository.save(supplier("Inactive Supplier", "I-001"));
    Contract activeContract =
        contractRepository.save(
            contract(
                "C-ACTIVE",
                supplierWithActiveItems,
                ContractStatus.ACTIVE,
                LocalDate.now().plusDays(30)));
    serviceRepository.save(
        service("Managed hosting", supplierWithActiveItems, activeContract, true));
    serviceRepository.save(service("Inactive hosting", supplierWithoutActiveItems, null, false));

    CompletableFuture<ActiveSuppliersReportDto> future = reportService.getActiveSuppliersReport();
    ActiveSuppliersReportDto report = future.get(5, TimeUnit.SECONDS);

    assertThat(future).isCompleted();
    assertThat(report.getGeneratedAt()).isNotNull();
    assertThat(report.getRows())
        .hasSize(2)
        .extracting(
            ActiveSupplierRow::getRegistrationCode,
            ActiveSupplierRow::getActiveContracts,
            ActiveSupplierRow::getActiveServices)
        .containsExactlyInAnyOrder(tuple("A-001", 1L, 1L), tuple("I-001", 0L, 0L));
  }

  @Test
  void generateActiveSuppliersPdf_returnsPdf() throws Exception {
    Supplier s = supplierRepository.save(supplier("Supplier", "S-001"));
    contractRepository.save(
        contract("C-001", s, ContractStatus.ACTIVE, LocalDate.now().plusDays(1)));

    CompletableFuture<byte[]> future = reportService.generateActiveSuppliersPdf();
    byte[] pdf = future.get(5, TimeUnit.SECONDS);

    assertThat(future).isCompleted();
    assertThat(pdf).startsWith("%PDF".getBytes());
  }

  @Test
  void getActiveSuppliersReport_complexFiltering() throws Exception {
    Supplier s1 = supplierRepository.save(supplier("Supplier 1", "S-001"));

    // Active contract
    contractRepository.save(
        contract("C-ACTIVE", s1, ContractStatus.ACTIVE, LocalDate.now().plusDays(1)));
    // Expired contract (should be ignored)
    contractRepository.save(
        contract("C-EXPIRED", s1, ContractStatus.ACTIVE, LocalDate.now().minusDays(1)));
    // Inactive status contract (should be ignored)
    contractRepository.save(
        contract("C-INACTIVE", s1, ContractStatus.TERMINATED, LocalDate.now().plusDays(10)));

    // Active service
    serviceRepository.save(service("S-ACTIVE", s1, null, true));
    // Inactive service (should be ignored)
    serviceRepository.save(service("S-INACTIVE", s1, null, false));

    ActiveSuppliersReportDto report =
        reportService.getActiveSuppliersReport().get(5, TimeUnit.SECONDS);

    assertThat(report.getRows())
        .filteredOn(r -> r.getRegistrationCode().equals("S-001"))
        .singleElement()
        .satisfies(
            row -> {
              assertThat(row.getActiveContracts()).isEqualTo(1);
              assertThat(row.getActiveServices()).isEqualTo(1);
            });
  }

  @Test
  void getActiveSuppliersReport_multipleSuppliers() throws Exception {
    Supplier s1 = supplierRepository.save(supplier("A", "S-1"));
    Supplier s2 = supplierRepository.save(supplier("B", "S-2"));

    contractRepository.save(contract("C1", s1, ContractStatus.ACTIVE, LocalDate.now().plusDays(1)));
    contractRepository.save(contract("C2", s2, ContractStatus.ACTIVE, LocalDate.now().plusDays(1)));
    contractRepository.save(contract("C3", s2, ContractStatus.ACTIVE, LocalDate.now().plusDays(1)));

    ActiveSuppliersReportDto report =
        reportService.getActiveSuppliersReport().get(5, TimeUnit.SECONDS);

    assertThat(report.getRows())
        .extracting(ActiveSupplierRow::getName, ActiveSupplierRow::getActiveContracts)
        .containsExactlyInAnyOrder(tuple("A", 1L), tuple("B", 2L));
  }

  private Supplier supplier(String name, String registrationCode) {
    Supplier supplier = new Supplier();
    supplier.setName(name);
    supplier.setRegistrationCode(registrationCode);
    return supplier;
  }

  private Contract contract(
      String contractNumber, Supplier supplier, ContractStatus status, LocalDate endDate) {
    Contract contract = new Contract();
    contract.setContractNumber(contractNumber);
    contract.setTitle(contractNumber + " title");
    contract.setStartDate(LocalDate.now().minusDays(1));
    contract.setEndDate(endDate);
    contract.setStatus(status);
    contract.setSupplier(supplier);
    return contract;
  }

  private org.psk.service.Service service(
      String name, Supplier supplier, Contract contract, boolean active) {
    org.psk.service.Service service = new org.psk.service.Service();
    service.setName(name);
    service.setDescription(name + " description");
    service.setSupplier(supplier);
    service.setContract(contract);
    service.setActive(active);
    return service;
  }
}
