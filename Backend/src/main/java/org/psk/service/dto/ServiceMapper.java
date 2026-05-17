package org.psk.service.dto;

import org.psk.contract.Contract;
import org.psk.service.Service;
import org.psk.supplier.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ServiceMapper {

  public ServiceDto toDto(Service service) {
    return ServiceDto.builder()
        .id(service.getId())
        .name(service.getName())
        .description(service.getDescription())
        .active(service.getActive())
        .supplierId(service.getSupplier() != null ? service.getSupplier().getId() : null)
        .contractId(service.getContract() != null ? service.getContract().getId() : null)
        .createdAt(service.getCreatedAt())
        .version(service.getVersion())
        .build();
  }

  public Service toEntity(CreateServiceRequest req, Supplier supplier, Contract contract) {
    Service service = new Service();
    service.setName(req.getName());
    service.setDescription(req.getDescription());
    service.setActive(req.getActive() != null ? req.getActive() : true);
    service.setSupplier(supplier);
    service.setContract(contract);
    return service;
  }

  public void updateEntity(
      Service existing, UpdateServiceRequest req, Supplier supplier, Contract contract) {
    existing.setName(req.getName());
    existing.setDescription(req.getDescription());
    existing.setActive(req.getActive());
    existing.setSupplier(supplier);
    existing.setContract(contract);
  }
}
