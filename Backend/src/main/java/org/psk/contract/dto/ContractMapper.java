package org.psk.contract.dto;

import java.util.Comparator;
import java.util.List;
import org.psk.contract.domain.Contract;
import org.psk.contract.domain.ContractStatus;
import org.psk.service.domain.Service;
import org.psk.supplier.domain.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ContractMapper {

  public ContractDto toDto(Contract contract) {
    return ContractDto.builder()
        .id(contract.getId())
        .contractNumber(contract.getContractNumber())
        .title(contract.getTitle())
        .startDate(contract.getStartDate())
        .endDate(contract.getEndDate())
        .status(contract.getStatus())
        .supplierId(contract.getSupplier() != null ? contract.getSupplier().getId() : null)
        .serviceIds(serviceIds(contract))
        .version(contract.getVersion())
        .build();
  }

  public Contract toEntity(CreateContractRequest req, Supplier supplier) {
    Contract contract = new Contract();
    contract.setContractNumber(req.getContractNumber());
    contract.setTitle(req.getTitle());
    contract.setStartDate(req.getStartDate());
    contract.setEndDate(req.getEndDate());
    contract.setStatus(req.getStatus() != null ? req.getStatus() : ContractStatus.ACTIVE);
    contract.setSupplier(supplier);
    return contract;
  }

  public void updateEntity(Contract existing, UpdateContractRequest req) {
    existing.setTitle(req.getTitle());
    existing.setStartDate(req.getStartDate());
    existing.setEndDate(req.getEndDate());
    existing.setStatus(req.getStatus());
  }

  private List<Long> serviceIds(Contract contract) {
    if (contract.getServices() == null) {
      return List.of();
    }
    return contract.getServices().stream()
        .map(Service::getId)
        .filter(id -> id != null)
        .sorted(Comparator.naturalOrder())
        .toList();
  }
}
