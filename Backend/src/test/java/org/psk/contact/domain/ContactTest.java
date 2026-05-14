package org.psk.contact.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.psk.supplier.domain.Supplier;

class ContactTest {

  @Test
  void equals_sameInstance_returnsTrue() {
    Contact contact = contact("alice@example.com", supplier(1L));

    assertThat(contact.equals(contact)).isTrue();
  }

  @Test
  void equals_nonContact_returnsFalse() {
    Contact contact = contact("alice@example.com", supplier(1L));

    assertThat(contact.equals("not a contact")).isFalse();
  }

  @Test
  void equals_sameEmailAndSupplierId_returnsTrue() {
    Contact left = contact("alice@example.com", supplier(1L));
    Contact right = contact("alice@example.com", supplier(1L));

    assertThat(left).isEqualTo(right);
    assertThat(left.hashCode()).isEqualTo(right.hashCode());
  }

  @Test
  void equals_differentEmail_returnsFalse() {
    Contact left = contact("alice@example.com", supplier(1L));
    Contact right = contact("bob@example.com", supplier(1L));

    assertThat(left).isNotEqualTo(right);
  }

  @Test
  void equals_differentSupplierId_returnsFalse() {
    Contact left = contact("alice@example.com", supplier(1L));
    Contact right = contact("alice@example.com", supplier(2L));

    assertThat(left).isNotEqualTo(right);
  }

  @Test
  void equals_missingEmailOrSupplierId_returnsFalse() {
    Contact missingEmail = contact(null, supplier(1L));
    Contact missingSupplier = contact("alice@example.com", null);
    Contact expected = contact("alice@example.com", supplier(1L));

    assertThat(missingEmail).isNotEqualTo(expected);
    assertThat(missingSupplier).isNotEqualTo(expected);
  }

  @Test
  void hashCode_withoutSupplier_doesNotFail() {
    Contact contact = contact("alice@example.com", null);

    assertThat(contact.hashCode()).isNotZero();
  }

  private Contact contact(String email, Supplier supplier) {
    Contact contact = new Contact();
    contact.setEmail(email);
    contact.setSupplier(supplier);
    return contact;
  }

  private Supplier supplier(Long id) {
    Supplier supplier = new Supplier();
    supplier.setId(id);
    supplier.setName("Supplier " + id);
    supplier.setRegistrationCode("S-" + id);
    return supplier;
  }
}
