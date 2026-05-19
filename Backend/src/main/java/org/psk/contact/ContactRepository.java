package org.psk.contact;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {

  List<Contact> findBySupplierId(Long supplierId);

  Optional<Contact> findBySupplierIdAndPrimaryTrue(Long supplierId);

  long countBySupplierIdAndPrimaryTrue(Long supplierId);
}
