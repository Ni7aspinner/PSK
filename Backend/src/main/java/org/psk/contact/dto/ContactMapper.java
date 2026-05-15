package org.psk.contact.dto;

import org.psk.contact.domain.Contact;
import org.psk.supplier.domain.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper {

  public ContactDto toDto(Contact contact) {
    return ContactDto.builder()
        .id(contact.getId())
        .firstName(contact.getFirstName())
        .lastName(contact.getLastName())
        .position(contact.getPosition())
        .email(contact.getEmail())
        .phone(contact.getPhone())
        .primary(contact.isPrimary())
        .supplierId(contact.getSupplier() != null ? contact.getSupplier().getId() : null)
        .createdAt(contact.getCreatedAt())
        .version(contact.getVersion())
        .build();
  }

  public Contact toEntity(CreateContactRequest req, Supplier supplier) {
    Contact contact = new Contact();
    contact.setFirstName(req.getFirstName());
    contact.setLastName(req.getLastName());
    contact.setPosition(req.getPosition());
    contact.setEmail(req.getEmail());
    contact.setPhone(req.getPhone());
    contact.setPrimary(req.isPrimary());
    contact.setSupplier(supplier);
    return contact;
  }

  public void updateEntity(Contact existing, UpdateContactRequest req, Supplier supplier) {
    existing.setFirstName(req.getFirstName());
    existing.setLastName(req.getLastName());
    existing.setPosition(req.getPosition());
    existing.setEmail(req.getEmail());
    existing.setPhone(req.getPhone());
    existing.setPrimary(req.isPrimary());
    existing.setSupplier(supplier);
  }
}
