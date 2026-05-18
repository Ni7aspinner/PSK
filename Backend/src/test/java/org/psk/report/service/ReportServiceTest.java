package org.psk.report.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.psk.contact.repository.ContactRepository;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.psk.contract.repository.ContractRepository;
import org.psk.report.dto.ActiveSupplierRow;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.service.repository.ServiceRepository;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.repository.SupplierRepository;
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

    assertThat(future).isDone();
    assertThat(report.getGeneratedAt()).isNotNull();
    assertThat(report.getRows()).hasSize(2);
    Map<String, ActiveSupplierRow> rowsByCode =
        report.getRows().stream()
            .collect(Collectors.toMap(ActiveSupplierRow::getRegistrationCode, Function.identity()));
    assertThat(rowsByCode.get("A-001").getSupplierId()).isEqualTo(supplierWithActiveItems.getId());
    assertThat(rowsByCode.get("A-001").getActiveContracts()).isEqualTo(1);
    assertThat(rowsByCode.get("A-001").getActiveServices()).isEqualTo(1);
    assertThat(rowsByCode.get("I-001").getSupplierId())
        .isEqualTo(supplierWithoutActiveItems.getId());
    assertThat(rowsByCode.get("I-001").getActiveContracts()).isZero();
    assertThat(rowsByCode.get("I-001").getActiveServices()).isZero();
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

  private org.psk.service.domain.Service service(
      String name, Supplier supplier, Contract contract, boolean active) {
    org.psk.service.domain.Service service = new org.psk.service.domain.Service();
    service.setName(name);
    service.setDescription(name + " description");
    service.setSupplier(supplier);
    service.setContract(contract);
    service.setActive(active);
    return service;
  }
}
