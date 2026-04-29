package org.psk.repository;

import org.psk.entity.Data;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DataRepository extends JpaRepository<Data, String> {

    List<Data> findAll();

    Optional<Data> findById(String id);
}
