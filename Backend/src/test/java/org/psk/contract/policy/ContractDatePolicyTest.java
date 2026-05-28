package org.psk.contract.policy;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.psk.contract.exception.InvalidContractDateRangeException;

class ContractDatePolicyTest {

  @Test
  void strictPolicy_requiresStartBeforeEnd() {
    ContractDatePolicy policy = new StrictContractDatePolicy();

    assertThatCode(() -> policy.validate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 2)))
        .doesNotThrowAnyException();

    assertThatThrownBy(() -> policy.validate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 1)))
        .isInstanceOf(InvalidContractDateRangeException.class);
  }

  @Test
  void sameDayAllowedPolicy_acceptsEqualDatesButRejectsReversedRange() {
    ContractDatePolicy policy = new SameDayAllowedContractDatePolicy();

    assertThatCode(() -> policy.validate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 1)))
        .doesNotThrowAnyException();

    assertThatThrownBy(() -> policy.validate(LocalDate.of(2026, 1, 2), LocalDate.of(2026, 1, 1)))
        .isInstanceOf(InvalidContractDateRangeException.class);
  }
}
