package org.psk.contract.policy;

import java.time.LocalDate;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    name = "app.contract.date-policy",
    havingValue = "strict",
    matchIfMissing = true)
public class StrictContractDatePolicy implements ContractDatePolicy {

  @Override
  public void validate(LocalDate startDate, LocalDate endDate) {
    if (startDate == null || endDate == null || !startDate.isBefore(endDate)) {
      throw new InvalidContractDateRangeException("Contract start date must be before end date");
    }
  }
}
