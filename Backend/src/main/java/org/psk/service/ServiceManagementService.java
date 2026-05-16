package org.psk.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.contract.Contract;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.ContractRepository;
import org.psk.service.dto.CreateServiceRequest;
import org.psk.service.dto.ServiceDto;
import org.psk.service.dto.ServiceMapper;
import org.psk.service.dto.UpdateServiceRequest;
import org.psk.service.exception.ServiceContractSupplierMismatchException;
import org.psk.service.exception.ServiceNotFoundException;
import org.psk.supplier.Supplier;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.SupplierRepository;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceManagementService {

  private final ServiceRepository serviceRepository;
  private final SupplierRepository supplierRepository;
  private final ContractRepository contractRepository;
  private final ServiceMapper serviceMapper;

  public List<ServiceDto> findAll() {
    return serviceRepository.findAll().stream().map(serviceMapper::toDto).toList();
  }

  public ServiceDto findById(Long id) {
    return serviceRepository
        .findById(id)
        .map(serviceMapper::toDto)
        .orElseThrow(() -> new ServiceNotFoundException("Service not found with id: " + id));
  }

  public List<ServiceDto> findBySupplierId(Long supplierId) {
    ensureSupplierExists(supplierId);
    return serviceRepository.findBySupplierId(supplierId).stream()
        .map(serviceMapper::toDto)
        .toList();
  }

  @Transactional
  public ServiceDto create(CreateServiceRequest req) {
    Supplier supplier = findSupplier(req.getSupplierId());
    Contract contract = resolveContract(req.getContractId(), supplier.getId());
    return serviceMapper.toDto(
        serviceRepository.save(serviceMapper.toEntity(req, supplier, contract)));
  }

  @Transactional
  public ServiceDto update(Long id, UpdateServiceRequest req) {
    Service existing =
        serviceRepository
            .findById(id)
            .orElseThrow(() -> new ServiceNotFoundException("Service not found with id: " + id));
    Supplier supplier = findSupplier(req.getSupplierId());
    Contract contract = resolveContract(req.getContractId(), supplier.getId());
    serviceMapper.updateEntity(existing, req, supplier, contract);
    return serviceMapper.toDto(serviceRepository.save(existing));
  }

  @Transactional
  public void delete(Long id) {
    serviceRepository.delete(
        serviceRepository
            .findById(id)
            .orElseThrow(() -> new ServiceNotFoundException("Service not found with id: " + id)));
  }

  private Supplier findSupplier(Long supplierId) {
    return supplierRepository
        .findById(supplierId)
        .orElseThrow(
            () -> new SupplierNotFoundException("Supplier not found with id: " + supplierId));
  }

  private void ensureSupplierExists(Long supplierId) {
    if (!supplierRepository.existsById(supplierId)) {
      throw new SupplierNotFoundException("Supplier not found with id: " + supplierId);
    }
  }

  private Contract resolveContract(Long contractId, Long supplierId) {
    if (contractId == null) {
      return null;
    }
    Contract contract =
        contractRepository
            .findById(contractId)
            .orElseThrow(
                () -> new ContractNotFoundException("Contract not found with id: " + contractId));
    Long contractSupplierId =
        contract.getSupplier() != null ? contract.getSupplier().getId() : null;
    if (!supplierId.equals(contractSupplierId)) {
      throw new ServiceContractSupplierMismatchException(
          "Contract " + contractId + " does not belong to supplier " + supplierId);
    }
    return contract;
  }
}
