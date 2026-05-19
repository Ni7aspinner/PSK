package org.psk.contract;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.psk.supplier.Supplier;

class ContractTest {

  private static Validator validator;

  @BeforeAll
  static void setUpValidator() {
    try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
      validator = factory.getValidator();
    }
  }

  @Test
  void onCreate_resetsStatusToActive_ifStatusIsNull() {
    Contract contract = new Contract();
    contract.setStatus(null);

    contract.onCreate();

    assertThat(contract.getStatus()).isEqualTo(ContractStatus.ACTIVE);
  }

  @Test
  void equalsAndHashCode_areBasedOnContractNumber() {
    Contract c1 = new Contract();
    c1.setContractNumber("CONT-2026-001");

    Contract c2 = new Contract();
    c2.setContractNumber("CONT-2026-001");

    Contract c3 = new Contract();
    c3.setContractNumber("CONT-2026-999");

    Contract cNull1 = new Contract();
    Contract cNull2 = new Contract();

    assertThat(c1).isEqualTo(c2);
    assertThat(c1.hashCode()).isEqualTo(c2.hashCode());

    assertThat(c1).isNotEqualTo(c3);
    assertThat(c1.hashCode()).isNotEqualTo(c3.hashCode());

    assertThat(cNull1).isNotEqualTo(c1);
    assertThat(cNull1).isNotEqualTo(cNull2);

    assertThat(c1).isNotEqualTo(new Object());
  }

  @Test
  void validation_failsIfMandatoryFieldsAreMissing() {
    Contract contract = new Contract();

    var violations = validator.validate(contract);

    assertThat(violations).hasSize(5);

    assertThat(violations)
        .extracting(v -> v.getPropertyPath().toString())
        .containsExactlyInAnyOrder("contractNumber", "title", "startDate", "endDate", "supplier");
  }

  @Test
  void validation_passesWithValidData() {
    Supplier validSupplier = new Supplier();

    Contract contract = new Contract();
    contract.setContractNumber("CONT-2026-001");
    contract.setTitle("Cloud Infrastructure SLA");
    contract.setStartDate(LocalDate.of(2026, 1, 1));
    contract.setEndDate(LocalDate.of(2026, 12, 31));
    contract.setSupplier(validSupplier);

    var violations = validator.validate(contract);

    assertThat(violations).isEmpty();
  }
}
