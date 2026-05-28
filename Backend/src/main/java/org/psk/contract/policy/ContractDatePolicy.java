package org.psk.contract.policy;

import java.time.LocalDate;

public interface ContractDatePolicy {

  void validate(LocalDate startDate, LocalDate endDate);
}
