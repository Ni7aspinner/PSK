package org.psk.audit.aspect;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.psk.audit.domain.AuditLog;
import org.psk.audit.repository.AuditLogRepository;
import org.psk.supplier.SupplierRepository;
import org.psk.supplier.SupplierService;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BusinessLogicAuditAspectTest {

  @Autowired private SupplierService supplierService;
  @Autowired private SupplierRepository supplierRepository;
  @Autowired private AuditLogRepository auditLogRepository;

  @BeforeEach
  void setUp() {
    SecurityContextHolder.clearContext();
    auditLogRepository.deleteAll();
    supplierRepository.deleteAll();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void businessServiceSuccess_writesAuditLog() throws Exception {
    authenticate();

    supplierService.create(supplierRequest("Audited Supplier", "AUD-001"));

    AuditLog auditLog = awaitSingleAuditLog();
    assertThat(auditLog.getClassName()).isEqualTo("org.psk.supplier.SupplierService");
    assertThat(auditLog.getMethodName()).isEqualTo("create");
    assertThat(auditLog.getUsername()).isEqualTo("audit-user");
    assertThat(auditLog.getRoles()).isEqualTo("ROLE_USER");
    assertThat(auditLog.getOutcome()).isEqualTo("SUCCESS");
    assertThat(auditLog.getErrorMessage()).isNull();
    assertThat(auditLog.getOccurredAt()).isNotNull();
    assertThat(auditLog.getDurationMs()).isNotNegative();
  }

  @Test
  void businessServiceFailure_writesFailureAuditLog() throws Exception {
    authenticate();

    assertThatThrownBy(() -> supplierService.findById(9999L))
        .isInstanceOf(SupplierNotFoundException.class);

    AuditLog auditLog = awaitSingleAuditLog();
    assertThat(auditLog.getClassName()).isEqualTo("org.psk.supplier.SupplierService");
    assertThat(auditLog.getMethodName()).isEqualTo("findById");
    assertThat(auditLog.getUsername()).isEqualTo("audit-user");
    assertThat(auditLog.getOutcome()).isEqualTo("FAILURE");
    assertThat(auditLog.getArguments()).contains("9999");
    assertThat(auditLog.getErrorMessage()).contains("Supplier not found");
  }

  private void authenticate() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "audit-user", null, List.of(new SimpleGrantedAuthority("ROLE_USER"))));
  }

  private CreateSupplierRequest supplierRequest(String name, String registrationCode) {
    CreateSupplierRequest request = new CreateSupplierRequest();
    request.setName(name);
    request.setRegistrationCode(registrationCode);
    return request;
  }

  private AuditLog awaitSingleAuditLog() throws Exception {
    Instant deadline = Instant.now().plusSeconds(5);
    List<AuditLog> rows = auditLogRepository.findAll();
    while (rows.size() != 1 && Instant.now().isBefore(deadline)) {
      Thread.sleep(50);
      rows = auditLogRepository.findAll();
    }
    assertThat(rows).hasSize(1);
    return rows.get(0);
  }
}
