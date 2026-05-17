package org.psk.supplier.dto;

import org.psk.supplier.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

  public SupplierDto toDto(Supplier supplier) {
    return SupplierDto.builder()
        .id(supplier.getId())
        .name(supplier.getName())
        .registrationCode(supplier.getRegistrationCode())
        .email(supplier.getEmail())
        .phone(supplier.getPhone())
        .createdAt(supplier.getCreatedAt())
        .version(supplier.getVersion())
        .build();
  }

  public Supplier toEntity(CreateSupplierRequest req) {
    Supplier supplier = new Supplier();
    supplier.setName(req.getName());
    supplier.setRegistrationCode(req.getRegistrationCode());
    supplier.setEmail(req.getEmail());
    supplier.setPhone(req.getPhone());
    return supplier;
  }

  public void updateEntity(Supplier existing, UpdateSupplierRequest req) {
    existing.setName(req.getName());
    existing.setEmail(req.getEmail());
    existing.setPhone(req.getPhone());
  }
}
