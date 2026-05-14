package org.psk.common.conflict;

import java.lang.reflect.Method;
import lombok.RequiredArgsConstructor;
import org.psk.contact.dto.ContactMapper;
import org.psk.contact.repository.ContactRepository;
import org.psk.contract.dto.ContractMapper;
import org.psk.contract.repository.ContractRepository;
import org.psk.service.dto.ServiceMapper;
import org.psk.service.repository.ServiceRepository;
import org.psk.supplier.dto.SupplierMapper;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ConflictResolutionHelper {

  private final SupplierRepository supplierRepository;
  private final SupplierMapper supplierMapper;
  private final ServiceRepository serviceRepository;
  private final ServiceMapper serviceMapper;
  private final ContractRepository contractRepository;
  private final ContractMapper contractMapper;
  private final ContactRepository contactRepository;
  private final ContactMapper contactMapper;

  public Object loadCurrentState(String entityType, Long entityId) {
    if (entityId == null) {
      return null;
    }
    return switch (normalizeEntityType(entityType)) {
      case "Supplier" ->
          supplierRepository.findById(entityId).map(supplierMapper::toDto).orElse(null);
      case "Service" -> serviceRepository.findById(entityId).map(serviceMapper::toDto).orElse(null);
      case "Contract" ->
          contractRepository.findById(entityId).map(contractMapper::toDto).orElse(null);
      case "Contact" -> contactRepository.findById(entityId).map(contactMapper::toDto).orElse(null);
      default -> null;
    };
  }

  public Long extractVersion(Object state) {
    if (state == null) {
      return null;
    }
    try {
      Method getter = state.getClass().getMethod("getVersion");
      Object value = getter.invoke(state);
      return value instanceof Long version ? version : null;
    } catch (ReflectiveOperationException ex) {
      return null;
    }
  }

  public String normalizeEntityType(String entityType) {
    if (entityType == null || entityType.isBlank()) {
      return "Unknown";
    }
    if (entityType.endsWith("Supplier")) {
      return "Supplier";
    }
    if (entityType.endsWith("Service")) {
      return "Service";
    }
    if (entityType.endsWith("Contract")) {
      return "Contract";
    }
    if (entityType.endsWith("Contact")) {
      return "Contact";
    }
    return entityType.contains(".")
        ? entityType.substring(entityType.lastIndexOf('.') + 1)
        : entityType;
  }
}
