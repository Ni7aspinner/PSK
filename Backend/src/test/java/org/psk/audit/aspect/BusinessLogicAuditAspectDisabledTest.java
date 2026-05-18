package org.psk.audit.aspect;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.psk.audit.repository.AuditLogRepository;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.repository.SupplierRepository;
import org.psk.supplier.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "app.audit.enabled=false")
class BusinessLogicAuditAspectDisabledTest {

  @Autowired private SupplierService supplierService;
  @Autowired private SupplierRepository supplierRepository;
  @Autowired private AuditLogRepository auditLogRepository;

  @BeforeEach
  void setUp() {
    auditLogRepository.deleteAll();
    supplierRepository.deleteAll();
  }

  @Test
  void auditDisabled_doesNotWriteAuditRows() throws Exception {
    CreateSupplierRequest request = new CreateSupplierRequest();
    request.setName("No Audit Supplier");
    request.setRegistrationCode("NO-AUDIT-001");

    supplierService.create(request);
    Thread.sleep(200);

    assertThat(auditLogRepository.findAll()).isEmpty();
  }
}
