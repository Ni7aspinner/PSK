package org.psk.contract.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.ContractMapper;
import org.psk.contract.dto.CreateContractRequest;
import org.psk.contract.dto.UpdateContractRequest;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.exception.ContractNumberDuplicateException;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.psk.contract.repository.ContractRepository;
import org.psk.service.repository.ServiceRepository;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

  private final ContractRepository contractRepository;
  private final SupplierRepository supplierRepository;
  private final ServiceRepository serviceRepository;
  private final ContractMapper contractMapper;

  public List<ContractDto> findAll() {
    return contractRepository.findAll().stream().map(contractMapper::toDto).toList();
  }

  public ContractDto findById(Long id) {
    return contractRepository
        .findById(id)
        .map(contractMapper::toDto)
        .orElseThrow(() -> new ContractNotFoundException("Contract not found with id: " + id));
  }

  public List<ContractDto> findBySupplierId(Long supplierId) {
    ensureSupplierExists(supplierId);
    return contractRepository.findBySupplierId(supplierId).stream()
        .map(contractMapper::toDto)
        .toList();
  }

  @Transactional
  public ContractDto create(CreateContractRequest req) {
    if (contractRepository.existsByContractNumber(req.getContractNumber())) {
      throw new ContractNumberDuplicateException(
          "Contract already exists with number: " + req.getContractNumber());
    }
    validateDateRange(req.getStartDate(), req.getEndDate());
    Supplier supplier = findSupplier(req.getSupplierId());
    return contractMapper.toDto(contractRepository.save(contractMapper.toEntity(req, supplier)));
  }

  @Transactional
  public ContractDto update(Long id, UpdateContractRequest req) {
    validateDateRange(req.getStartDate(), req.getEndDate());
    Contract existing =
        contractRepository
            .findById(id)
            .orElseThrow(() -> new ContractNotFoundException("Contract not found with id: " + id));
    contractMapper.updateEntity(existing, req);
    return contractMapper.toDto(contractRepository.save(existing));
  }

  @Transactional
  public ContractDto terminate(Long id) {
    Contract existing =
        contractRepository
            .findById(id)
            .orElseThrow(() -> new ContractNotFoundException("Contract not found with id: " + id));
    existing.setStatus(ContractStatus.TERMINATED);
    return contractMapper.toDto(contractRepository.save(existing));
  }

  @Transactional
  public void delete(Long id) {
    Contract existing =
        contractRepository
            .findById(id)
            .orElseThrow(() -> new ContractNotFoundException("Contract not found with id: " + id));
    List<org.psk.service.domain.Service> services = serviceRepository.findByContractId(id);
    services.forEach(service -> service.setContract(null));
    serviceRepository.saveAll(services);
    contractRepository.delete(existing);
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

  private void validateDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
    if (startDate == null || endDate == null || !startDate.isBefore(endDate)) {
      throw new InvalidContractDateRangeException("Contract start date must be before end date");
    }
  }
}
