package org.psk.contact.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.psk.contact.domain.Contact;
import org.psk.supplier.domain.Supplier;
import org.psk.supplier.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class ContactRepositoryTest {

  @Autowired private ContactRepository contactRepository;
  @Autowired private SupplierRepository supplierRepository;

  @Test
  void findBySupplierId_returnsSupplierContacts() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    Supplier otherSupplier = supplierRepository.save(supplier("Supplier B", "S-B"));
    Contact expected = contactRepository.save(contact("Alice", supplier, true));
    contactRepository.save(contact("Bob", otherSupplier, false));

    List<Contact> result = contactRepository.findBySupplierId(supplier.getId());

    assertThat(result).containsExactly(expected);
  }

  @Test
  void findBySupplierIdAndPrimaryTrue_returnsPrimaryContact() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    contactRepository.save(contact("Alice", supplier, false));
    Contact expected = contactRepository.save(contact("Bob", supplier, true));

    Optional<Contact> result = contactRepository.findBySupplierIdAndPrimaryTrue(supplier.getId());

    assertThat(result).contains(expected);
  }

  @Test
  void countBySupplierIdAndPrimaryTrue_returnsPrimaryCount() {
    Supplier supplier = supplierRepository.save(supplier("Supplier A", "S-A"));
    contactRepository.save(contact("Alice", supplier, false));
    contactRepository.save(contact("Bob", supplier, true));

    long result = contactRepository.countBySupplierIdAndPrimaryTrue(supplier.getId());

    assertThat(result).isEqualTo(1);
  }

  private Supplier supplier(String name, String registrationCode) {
    Supplier supplier = new Supplier();
    supplier.setName(name);
    supplier.setRegistrationCode(registrationCode);
    return supplier;
  }

  private Contact contact(String firstName, Supplier supplier, boolean primary) {
    Contact contact = new Contact();
    contact.setFirstName(firstName);
    contact.setLastName("Contact");
    contact.setEmail(firstName.toLowerCase() + "@example.com");
    contact.setSupplier(supplier);
    contact.setPrimary(primary);
    return contact;
  }
}
