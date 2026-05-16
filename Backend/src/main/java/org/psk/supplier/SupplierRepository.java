package org.psk.supplier;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

  Optional<Supplier> findByRegistrationCode(String code);

  boolean existsByRegistrationCode(String code);
}
