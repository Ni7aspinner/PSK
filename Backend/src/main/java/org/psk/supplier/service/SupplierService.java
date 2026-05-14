package org.psk.supplier.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.psk.common.conflict.OptimisticLockConflictException;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.SupplierMapper;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.psk.supplier.exception.DuplicateSupplierException;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

  private final SupplierRepository supplierRepository;
  private final SupplierMapper supplierMapper;

  public List<SupplierDto> findAll() {
    return supplierRepository.findAll().stream().map(supplierMapper::toDto).toList();
  }

  public SupplierDto findById(Long id) {
    return supplierRepository
        .findById(id)
        .map(supplierMapper::toDto)
        .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with id: " + id));
  }

  @Transactional
  public SupplierDto create(CreateSupplierRequest req) {
    if (supplierRepository.existsByRegistrationCode(req.getRegistrationCode())) {
      throw new DuplicateSupplierException(
          "Supplier already exists with registration code: " + req.getRegistrationCode());
    }
    return supplierMapper.toDto(supplierRepository.save(supplierMapper.toEntity(req)));
  }

  @Transactional
  public SupplierDto update(Long id, UpdateSupplierRequest req) {
    org.psk.supplier.domain.Supplier supplier =
        supplierRepository
            .findById(id)
            .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with id: " + id));
    ensureVersionMatches("Supplier", id, supplier.getVersion(), req.getVersion(), req);
    supplierMapper.updateEntity(supplier, req);
    return supplierMapper.toDto(supplierRepository.save(supplier));
  }

  @Transactional
  public SupplierDto forceOverwrite(Long id, UpdateSupplierRequest req) {
    org.psk.supplier.domain.Supplier supplier =
        supplierRepository
            .findById(id)
            .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with id: " + id));
    supplierMapper.updateEntity(supplier, req);
    return supplierMapper.toDto(supplierRepository.save(supplier));
  }

  @Transactional
  public void delete(Long id) {
    supplierRepository.delete(
        supplierRepository
            .findById(id)
            .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with id: " + id)));
  }

  private void ensureVersionMatches(
      String entityType, Long entityId, Long currentVersion, Long submittedVersion, Object req) {
    if (!Objects.equals(currentVersion, submittedVersion)) {
      throw new OptimisticLockConflictException(
          entityType,
          entityId,
          submittedVersion,
          req,
          entityType + " was modified by another user");
    }
  }
}
