package org.psk.contract;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {

  List<Contract> findBySupplierId(Long supplierId);

  List<Contract> findByEndDateBeforeAndStatus(LocalDate date, ContractStatus status);

  boolean existsByContractNumber(String number);
}
