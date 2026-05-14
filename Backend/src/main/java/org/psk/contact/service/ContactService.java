package org.psk.contact.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.contact.domain.Contact;
import org.psk.contact.dto.ContactDto;
import org.psk.contact.dto.ContactMapper;
import org.psk.contact.dto.CreateContactRequest;
import org.psk.contact.dto.UpdateContactRequest;
import org.psk.contact.exception.ContactNotFoundException;
import org.psk.contact.repository.ContactRepository;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactService {

  private static final String CONTACT_NOT_FOUND_WITH_ID = "Contact not found with id: ";

  private final ContactRepository contactRepository;
  private final SupplierRepository supplierRepository;
  private final ContactMapper contactMapper;

  public List<ContactDto> findAll() {
    return toDtos(contactRepository.findAll());
  }

  public ContactDto findById(Long id) {
    return contactMapper.toDto(requireContact(id));
  }

  public List<ContactDto> findBySupplierId(Long supplierId) {
    ensureSupplierExists(supplierId);
    return toDtos(contactRepository.findBySupplierId(supplierId));
  }

  @Transactional
  public ContactDto create(CreateContactRequest req) {
    Supplier supplier = findSupplier(req.getSupplierId());
    if (req.isPrimary()) {
      clearPrimaryForSupplier(supplier.getId(), null);
    }
    Contact contact = contactMapper.toEntity(req, supplier);
    return contactMapper.toDto(contactRepository.save(contact));
  }

  @Transactional
  public ContactDto update(Long id, UpdateContactRequest req) {
    Contact existing = requireContact(id);
    Supplier supplier = findSupplier(req.getSupplierId());
    if (req.isPrimary()) {
      clearPrimaryForSupplier(supplier.getId(), existing.getId());
    }
    contactMapper.updateEntity(existing, req, supplier);
    return contactMapper.toDto(contactRepository.save(existing));
  }

  @Transactional
  public void delete(Long id) {
    contactRepository.delete(requireContact(id));
  }

  @Transactional
  public ContactDto setPrimary(Long contactId) {
    Contact contact = requireContact(contactId);
    Long supplierId = contact.getSupplier().getId();
    clearPrimaryForSupplier(supplierId, contact.getId());
    contact.setPrimary(true);
    return contactMapper.toDto(contactRepository.save(contact));
  }

  private Supplier findSupplier(Long supplierId) {
    return supplierRepository
        .findById(supplierId)
        .orElseThrow(
            () -> new SupplierNotFoundException("Supplier not found with id: " + supplierId));
  }

  private Contact requireContact(Long id) {
    return contactRepository
        .findById(id)
        .orElseThrow(() -> new ContactNotFoundException(CONTACT_NOT_FOUND_WITH_ID + id));
  }

  private List<ContactDto> toDtos(List<Contact> contacts) {
    return contacts.stream().map(contactMapper::toDto).toList();
  }

  private void ensureSupplierExists(Long supplierId) {
    if (!supplierRepository.existsById(supplierId)) {
      throw new SupplierNotFoundException("Supplier not found with id: " + supplierId);
    }
  }

  private void clearPrimaryForSupplier(Long supplierId, Long exceptContactId) {
    List<Contact> primaryContacts =
        contactRepository.findBySupplierId(supplierId).stream()
            .filter(Contact::isPrimary)
            .filter(contact -> exceptContactId == null || !exceptContactId.equals(contact.getId()))
            .toList();
    primaryContacts.forEach(contact -> contact.setPrimary(false));
    if (!primaryContacts.isEmpty()) {
      contactRepository.saveAllAndFlush(primaryContacts);
    }
  }
}
