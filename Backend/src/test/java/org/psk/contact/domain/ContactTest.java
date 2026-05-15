package org.psk.contact.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.psk.supplier.domain.Supplier;

class ContactTest {

  @Test
  void equals_sameInstance_returnsTrue() {
    Contact contact = contact(1L, "alice@example.com", supplier(1L));

    assertThat(contact.equals(contact)).isTrue();
  }

  @Test
  void equals_nonContact_returnsFalse() {
    Contact contact = contact(1L, "alice@example.com", supplier(1L));

    assertThat(contact.equals("not a contact")).isFalse();
  }

  @Test
  void equals_sameId_returnsTrue() {
    Contact left = contact(1L, "alice@example.com", supplier(1L));
    Contact right = contact(1L, "bob@example.com", supplier(2L));

    assertThat(left).isEqualTo(right);
    assertThat(left.hashCode()).isEqualTo(right.hashCode());
  }

  @Test
  void equals_differentId_returnsFalse() {
    Contact left = contact(1L, "alice@example.com", supplier(1L));
    Contact right = contact(2L, "alice@example.com", supplier(1L));

    assertThat(left).isNotEqualTo(right);
  }

  @Test
  void equals_sameEmailAndSupplierIdButDifferentIds_returnsFalse() {
    Contact left = contact(1L, "alice@example.com", supplier(1L));
    Contact right = contact(2L, "alice@example.com", supplier(1L));

    assertThat(left).isNotEqualTo(right);
  }

  @Test
  void equals_missingId_returnsFalse() {
    Contact missingId = contact(null, "alice@example.com", supplier(1L));
    Contact expected = contact(1L, "alice@example.com", supplier(1L));

    assertThat(missingId).isNotEqualTo(expected);
  }

  @Test
  void equals_twoNewContactsWithSameEmailAndSupplier_returnsFalse() {
    Contact left = contact(null, "alice@example.com", supplier(1L));
    Contact right = contact(null, "alice@example.com", supplier(1L));

    assertThat(left).isNotEqualTo(right);
  }

  @Test
  void hashCode_withoutId_doesNotFail() {
    Contact contact = contact(null, "alice@example.com", null);

    assertThat(contact.hashCode()).isNotZero();
  }

  private Contact contact(Long id, String email, Supplier supplier) {
    Contact contact = new Contact();
    contact.setId(id);
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
