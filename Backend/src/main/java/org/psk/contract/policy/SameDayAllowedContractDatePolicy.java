package org.psk.contract.policy;

import java.time.LocalDate;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.contract.date-policy", havingValue = "same-day-allowed")
public class SameDayAllowedContractDatePolicy implements ContractDatePolicy {

  @Override
  public void validate(LocalDate startDate, LocalDate endDate) {
    if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
      throw new InvalidContractDateRangeException(
          "Contract start date must be before or equal to end date");
    }
  }
}
