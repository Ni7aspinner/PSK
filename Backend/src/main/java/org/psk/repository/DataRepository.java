package org.psk.repository;

import java.util.List;
import java.util.Optional;
import org.psk.entity.Data;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataRepository extends JpaRepository<Data, Long> {

  List<Data> findAll();

  Optional<Data> findById(Long id);
}
