package org.psk.contact.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.psk.common.conflict.OptimisticLockConflictException;
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

  private final ContactRepository contactRepository;
  private final SupplierRepository supplierRepository;
  private final ContactMapper contactMapper;

  public List<ContactDto> findAll() {
    return contactRepository.findAll().stream().map(contactMapper::toDto).toList();
  }

  public ContactDto findById(Long id) {
    return contactRepository
        .findById(id)
        .map(contactMapper::toDto)
        .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id));
  }

  public List<ContactDto> findBySupplierId(Long supplierId) {
    ensureSupplierExists(supplierId);
    return contactRepository.findBySupplierId(supplierId).stream()
        .map(contactMapper::toDto)
        .toList();
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
    Contact existing =
        contactRepository
            .findById(id)
            .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id));
    ensureVersionMatches("Contact", id, existing.getVersion(), req.getVersion(), req);
    Supplier supplier = findSupplier(req.getSupplierId());
    if (req.isPrimary()) {
      clearPrimaryForSupplier(supplier.getId(), existing.getId());
    }
    contactMapper.updateEntity(existing, req, supplier);
    return contactMapper.toDto(contactRepository.save(existing));
  }

  @Transactional
  public ContactDto forceOverwrite(Long id, UpdateContactRequest req) {
    Contact existing =
        contactRepository
            .findById(id)
            .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id));
    Supplier supplier = findSupplier(req.getSupplierId());
    if (req.isPrimary()) {
      clearPrimaryForSupplier(supplier.getId(), existing.getId());
    }
    contactMapper.updateEntity(existing, req, supplier);
    return contactMapper.toDto(contactRepository.save(existing));
  }

  @Transactional
  public void delete(Long id) {
    contactRepository.delete(
        contactRepository
            .findById(id)
            .orElseThrow(() -> new ContactNotFoundException("Contact not found with id: " + id)));
  }

  @Transactional
  public ContactDto setPrimary(Long contactId) {
    Contact contact =
        contactRepository
            .findById(contactId)
            .orElseThrow(
                () -> new ContactNotFoundException("Contact not found with id: " + contactId));
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
