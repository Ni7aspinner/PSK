package org.psk.supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SupplierRepositoryTest {

  @Autowired private SupplierRepository supplierRepository;

  @Test
  void save_and_findById_returnsSupplier() {
    Supplier s = new Supplier();
    s.setName("Test Supplier");
    s.setRegistrationCode("CODE-001");
    supplierRepository.save(s);

    Optional<Supplier> found = supplierRepository.findById(s.getId());

    assertThat(found).isPresent();
    assertThat(found.get().getName()).isEqualTo("Test Supplier");
    assertThat(found.get().getRegistrationCode()).isEqualTo("CODE-001");
  }

  @Test
  void findByRegistrationCode_existingCode_returnsSupplier() {
    Supplier s = new Supplier();
    s.setName("Supplier A");
    s.setRegistrationCode("REG-100");
    supplierRepository.save(s);

    Optional<Supplier> found = supplierRepository.findByRegistrationCode("REG-100");

    assertThat(found).isPresent();
    assertThat(found.get().getName()).isEqualTo("Supplier A");
  }

  @Test
  void findByRegistrationCode_missingCode_returnsEmpty() {
    Optional<Supplier> found = supplierRepository.findByRegistrationCode("NONEXISTENT");
    assertThat(found).isEmpty();
  }

  @Test
  void save_duplicateRegistrationCode_throwsException() {
    Supplier s1 = new Supplier();
    s1.setName("First");
    s1.setRegistrationCode("DUP-001");
    supplierRepository.saveAndFlush(s1);

    Supplier s2 = new Supplier();
    s2.setName("Second");
    s2.setRegistrationCode("DUP-001");

    assertThatThrownBy(() -> supplierRepository.saveAndFlush(s2)).isInstanceOf(Exception.class);
  }
}
