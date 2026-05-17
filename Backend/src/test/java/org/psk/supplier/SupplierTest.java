package org.psk.supplier;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.Instant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class SupplierTest {

  private static Validator validator;

  @BeforeAll
  static void setUpValidator() {
    try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
      validator = factory.getValidator();
    }
  }

  @Test
  void onCreate_setsCreatedAtTimestamp() {
    Supplier supplier = new Supplier();
    assertThat(supplier.getCreatedAt()).isNull();

    supplier.onCreate();

    assertThat(supplier.getCreatedAt()).isNotNull();
    assertThat(supplier.getCreatedAt()).isBeforeOrEqualTo(Instant.now());
  }

  @Test
  void equalsAndHashCode_areBasedOnRegistrationCode() {
    Supplier s1 = new Supplier();
    s1.setRegistrationCode("REG-123");

    Supplier s2 = new Supplier();
    s2.setRegistrationCode("REG-123");

    Supplier s3 = new Supplier();
    s3.setRegistrationCode("REG-999");

    Supplier sNull1 = new Supplier();
    Supplier sNull2 = new Supplier();

    assertThat(s1).isEqualTo(s2);
    assertThat(s1.hashCode()).isEqualTo(s2.hashCode());

    assertThat(s1).isNotEqualTo(s3);
    assertThat(s1.hashCode()).isNotEqualTo(s3.hashCode());

    assertThat(sNull1).isNotEqualTo(s1);
    assertThat(sNull1).isNotEqualTo(sNull2);

    assertThat(s1).isNotEqualTo(new Object());
  }

  @Test
  void validation_failsIfNameOrRegistrationCodeIsBlank() {
    Supplier supplier = new Supplier();
    supplier.setName("");
    supplier.setRegistrationCode(null);
    supplier.setEmail("invalid-email");

    var violations = validator.validate(supplier);

    assertThat(violations).hasSize(3);

    assertThat(violations)
        .extracting(v -> v.getPropertyPath().toString())
        .containsExactlyInAnyOrder("name", "registrationCode", "email");
  }

  @Test
  void validation_passesWithValidData() {
    Supplier supplier = new Supplier();
    supplier.setName("Valid Name");
    supplier.setRegistrationCode("REG-123");
    supplier.setEmail("test@example.com");

    var violations = validator.validate(supplier);

    assertThat(violations).isEmpty();
  }
}
