package org.psk.contract.repository;

import java.time.LocalDate;
import java.util.List;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {

  List<Contract> findBySupplierId(Long supplierId);

  List<Contract> findByEndDateBeforeAndStatus(LocalDate date, ContractStatus status);

  boolean existsByContractNumber(String number);
}
