package org.psk.service.repository;

import java.util.List;
import org.psk.service.domain.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {

  List<Service> findBySupplierId(Long supplierId);

  List<Service> findByContractId(Long contractId);
}
