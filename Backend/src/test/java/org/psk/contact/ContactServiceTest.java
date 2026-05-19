package org.psk.contact.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

  @Mock private ContactRepository contactRepository;
  @Mock private SupplierRepository supplierRepository;

  private final ContactMapper contactMapper = new ContactMapper();

  private ContactService contactService;

  @BeforeEach
  void setUp() {
    contactService = new ContactService(contactRepository, supplierRepository, contactMapper);
  }

  @Test
  void findById_notFound_throwsContactNotFoundException() {
    when(contactRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contactService.findById(99L))
        .isInstanceOf(ContactNotFoundException.class)
        .hasMessageContaining("99");
  }

  @Test
  void findAll_returnsContactDtos() {
    Supplier supplier = supplier(1L);
    Contact contact = contact(10L, "Alice", supplier, true);
    when(contactRepository.findAll()).thenReturn(List.of(contact));

    List<ContactDto> result = contactService.findAll();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getId()).isEqualTo(10L);
    assertThat(result.get(0).getSupplierId()).isEqualTo(1L);
  }

  @Test
  void findById_existingContact_returnsDto() {
    Contact contact = contact(10L, "Alice", supplier(1L), true);
    when(contactRepository.findById(10L)).thenReturn(Optional.of(contact));

    ContactDto result = contactService.findById(10L);

    assertThat(result.getId()).isEqualTo(10L);
    assertThat(result.isPrimary()).isTrue();
  }

  @Test
  void findBySupplierId_existingSupplier_returnsContacts() {
    Supplier supplier = supplier(1L);
    Contact contact = contact(10L, "Alice", supplier, false);
    when(supplierRepository.existsById(1L)).thenReturn(true);
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(contact));

    List<ContactDto> result = contactService.findBySupplierId(1L);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getId()).isEqualTo(10L);
  }

  @Test
  void findBySupplierId_missingSupplier_throwsSupplierNotFoundException() {
    when(supplierRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> contactService.findBySupplierId(1L))
        .isInstanceOf(SupplierNotFoundException.class);
  }

  @Test
  void create_missingSupplier_throwsSupplierNotFoundException() {
    CreateContactRequest req = createRequest(1L, false);
    when(supplierRepository.findById(1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contactService.create(req))
        .isInstanceOf(SupplierNotFoundException.class);
  }

  @Test
  void create_nonPrimaryContact_savesWithoutClearingPrimaryContacts() {
    Supplier supplier = supplier(1L);
    CreateContactRequest req = createRequest(1L, false);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.save(any(Contact.class)))
        .thenAnswer(
            invocation -> {
              Contact saved = invocation.getArgument(0);
              saved.setId(20L);
              return saved;
            });

    ContactDto result = contactService.create(req);

    assertThat(result.getId()).isEqualTo(20L);
    assertThat(result.isPrimary()).isFalse();
  }

  @Test
  void create_primaryContact_existingPrimaryBecomesNonPrimary() {
    Supplier supplier = supplier(1L);
    Contact existingPrimary = contact(10L, "Alice", supplier, true);
    CreateContactRequest req = createRequest(1L, true);
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(existingPrimary));
    when(contactRepository.save(any(Contact.class)))
        .thenAnswer(
            invocation -> {
              Contact saved = invocation.getArgument(0);
              saved.setId(20L);
              return saved;
            });

    ContactDto result = contactService.create(req);

    assertThat(existingPrimary.isPrimary()).isFalse();
    assertThat(result.isPrimary()).isTrue();
    assertThat(result.getSupplierId()).isEqualTo(1L);
    verify(contactRepository).saveAllAndFlush(List.of(existingPrimary));
  }

  @Test
  void update_existingContact_updatesAndReturnsDto() {
    Supplier supplier = supplier(1L);
    Contact existing = contact(10L, "Alice", supplier, false);
    UpdateContactRequest req = updateRequest(1L, false);
    when(contactRepository.findById(10L)).thenReturn(Optional.of(existing));
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.save(existing)).thenReturn(existing);

    ContactDto result = contactService.update(10L, req);

    assertThat(result.getFirstName()).isEqualTo("Updated");
    assertThat(result.getPosition()).isEqualTo("Operations manager");
    assertThat(result.isPrimary()).isFalse();
  }

  @Test
  void update_staleVersion_throwsOptimisticLockConflictException() {
    Supplier supplier = supplier(1L);
    Contact existing = contact(10L, "Alice", supplier, false);
    existing.setVersion(2L);
    UpdateContactRequest req = updateRequest(1L, false);
    req.setVersion(1L);
    when(contactRepository.findById(10L)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> contactService.update(10L, req))
        .isInstanceOf(OptimisticLockConflictException.class)
        .hasMessageContaining("Contact was modified by another user");
  }

  @Test
  void forceOverwrite_staleVersion_updatesWithoutVersionCheck() {
    Supplier supplier = supplier(1L);
    Contact existing = contact(10L, "Alice", supplier, false);
    existing.setVersion(2L);
    UpdateContactRequest req = updateRequest(1L, false);
    req.setVersion(0L);
    req.setForceOverwrite(true);
    when(contactRepository.findById(10L)).thenReturn(Optional.of(existing));
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.save(existing)).thenReturn(existing);

    ContactDto result = contactService.forceOverwrite(10L, req);

    assertThat(result.getFirstName()).isEqualTo("Updated");
  }

  @Test
  void update_primaryContact_clearsOtherPrimaryContact() {
    Supplier supplier = supplier(1L);
    Contact existingPrimary = contact(10L, "Alice", supplier, true);
    Contact target = contact(20L, "Bob", supplier, false);
    UpdateContactRequest req = updateRequest(1L, true);
    when(contactRepository.findById(20L)).thenReturn(Optional.of(target));
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(existingPrimary, target));
    when(contactRepository.save(target)).thenReturn(target);

    ContactDto result = contactService.update(20L, req);

    assertThat(existingPrimary.isPrimary()).isFalse();
    assertThat(result.isPrimary()).isTrue();
    verify(contactRepository).saveAllAndFlush(List.of(existingPrimary));
  }

  @Test
  void update_primaryContactAlreadyPrimary_doesNotClearItself() {
    Supplier supplier = supplier(1L);
    Contact existing = contact(20L, "Bob", supplier, true);
    UpdateContactRequest req = updateRequest(1L, true);
    when(contactRepository.findById(20L)).thenReturn(Optional.of(existing));
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(existing));
    when(contactRepository.save(existing)).thenReturn(existing);

    ContactDto result = contactService.update(20L, req);

    assertThat(result.isPrimary()).isTrue();
  }

  @Test
  void setPrimary_existingContact_clearsOtherPrimaryAndSetsCurrent() {
    Supplier supplier = supplier(1L);
    Contact existingPrimary = contact(10L, "Alice", supplier, true);
    Contact target = contact(20L, "Bob", supplier, false);
    when(contactRepository.findById(20L)).thenReturn(Optional.of(target));
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(existingPrimary, target));
    when(contactRepository.save(target)).thenReturn(target);

    ContactDto result = contactService.setPrimary(20L);

    assertThat(existingPrimary.isPrimary()).isFalse();
    assertThat(target.isPrimary()).isTrue();
    assertThat(result.getId()).isEqualTo(20L);
    assertThat(result.isPrimary()).isTrue();
  }

  @Test
  void setPrimary_withoutExistingPrimary_setsCurrentContact() {
    Supplier supplier = supplier(1L);
    Contact target = contact(20L, "Bob", supplier, false);
    when(contactRepository.findById(20L)).thenReturn(Optional.of(target));
    when(contactRepository.findBySupplierId(1L)).thenReturn(List.of(target));
    when(contactRepository.save(target)).thenReturn(target);

    ContactDto result = contactService.setPrimary(20L);

    assertThat(result.isPrimary()).isTrue();
  }

  @Test
  void setPrimary_notFound_throwsContactNotFoundException() {
    when(contactRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contactService.setPrimary(99L))
        .isInstanceOf(ContactNotFoundException.class)
        .hasMessageContaining("99");
  }

  @Test
  void delete_existingContact_callsRepositoryDelete() {
    Contact existing = contact(10L, "Alice", supplier(1L), false);
    when(contactRepository.findById(10L)).thenReturn(Optional.of(existing));

    contactService.delete(10L);

    verify(contactRepository).delete(existing);
  }

  private CreateContactRequest createRequest(Long supplierId, boolean primary) {
    CreateContactRequest req = new CreateContactRequest();
    req.setFirstName("Bob");
    req.setLastName("Contact");
    req.setPosition("Manager");
    req.setEmail("bob@example.com");
    req.setPhone("+37060000000");
    req.setPrimary(primary);
    req.setSupplierId(supplierId);
    return req;
  }

  private UpdateContactRequest updateRequest(Long supplierId, boolean primary) {
    UpdateContactRequest req = new UpdateContactRequest();
    req.setFirstName("Updated");
    req.setLastName("Contact");
    req.setPosition("Operations manager");
    req.setEmail("updated@example.com");
    req.setPhone("+37060000001");
    req.setPrimary(primary);
    req.setSupplierId(supplierId);
    req.setVersion(0L);
    return req;
  }

  private Supplier supplier(Long id) {
    Supplier supplier = new Supplier();
    supplier.setId(id);
    supplier.setName("Supplier " + id);
    supplier.setRegistrationCode("S-" + id);
    return supplier;
  }

  private Contact contact(Long id, String firstName, Supplier supplier, boolean primary) {
    Contact contact = new Contact();
    contact.setId(id);
    contact.setFirstName(firstName);
    contact.setLastName("Contact");
    contact.setEmail(firstName.toLowerCase() + "@example.com");
    contact.setSupplier(supplier);
    contact.setPrimary(primary);
    contact.setVersion(0L);
    return contact;
  }
}
