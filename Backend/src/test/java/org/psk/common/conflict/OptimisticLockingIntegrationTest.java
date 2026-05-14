package org.psk.common.conflict;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.Test;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.psk.supplier.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OptimisticLockingIntegrationTest {

  @Autowired private SupplierService supplierService;

  @Test
  void concurrentUpdateDetected() {
    SupplierDto created = supplierService.create(supplierRequest("LOCK-SUP-001"));
    SupplierDto loadedA = supplierService.findById(created.getId());
    SupplierDto loadedB = supplierService.findById(created.getId());

    supplierService.update(created.getId(), updateRequest("Supplier A", loadedA.getVersion()));
    SupplierDto afterFirstUpdate = supplierService.findById(created.getId());

    assertThat(afterFirstUpdate.getVersion()).isEqualTo(loadedA.getVersion() + 1);
    assertThatThrownBy(
            () ->
                supplierService.update(
                    created.getId(), updateRequest("Supplier B", loadedB.getVersion())))
        .isInstanceOf(OptimisticLockException.class)
        .hasMessageContaining("Supplier was modified by another user");
  }

  @Test
  void forceOverwriteIgnoresVersion() {
    SupplierDto created = supplierService.create(supplierRequest("LOCK-SUP-002"));
    SupplierDto loadedA = supplierService.findById(created.getId());
    SupplierDto loadedB = supplierService.findById(created.getId());

    supplierService.update(created.getId(), updateRequest("Supplier A", loadedA.getVersion()));

    UpdateSupplierRequest forceRequest = updateRequest("Supplier B", loadedB.getVersion());
    forceRequest.setForceOverwrite(true);
    SupplierDto overwritten = supplierService.forceOverwrite(created.getId(), forceRequest);
    SupplierDto reloaded = supplierService.findById(created.getId());

    assertThat(overwritten.getName()).isEqualTo("Supplier B");
    assertThat(reloaded.getName()).isEqualTo("Supplier B");
  }

  private CreateSupplierRequest supplierRequest(String registrationCode) {
    CreateSupplierRequest request = new CreateSupplierRequest();
    request.setName("Lock Supplier");
    request.setRegistrationCode(registrationCode);
    request.setEmail(registrationCode.toLowerCase() + "@example.com");
    return request;
  }

  private UpdateSupplierRequest updateRequest(String name, Long version) {
    UpdateSupplierRequest request = new UpdateSupplierRequest();
    request.setName(name);
    request.setEmail(name.toLowerCase().replace(" ", ".") + "@example.com");
    request.setVersion(version);
    return request;
  }
}
