package org.psk.contact.exception;

public class ContactNotFoundException extends RuntimeException {

  public ContactNotFoundException(String message) {
    super(message);
  }
}
