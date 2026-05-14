package org.psk.contact.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.contact.dto.ContactDto;
import org.psk.contact.dto.CreateContactRequest;
import org.psk.contact.dto.UpdateContactRequest;
import org.psk.contact.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {

  private final ContactService contactService;

  @GetMapping("/contacts")
  public List<ContactDto> findAll() {
    return contactService.findAll();
  }

  @GetMapping("/contacts/{id}")
  public ContactDto findById(@PathVariable Long id) {
    return contactService.findById(id);
  }

  @GetMapping("/suppliers/{supplierId}/contacts")
  public List<ContactDto> findBySupplierId(@PathVariable Long supplierId) {
    return contactService.findBySupplierId(supplierId);
  }

  @PostMapping("/contacts")
  public ResponseEntity<ContactDto> create(@Valid @RequestBody CreateContactRequest request) {
    ContactDto created = contactService.create(request);
    return ResponseEntity.created(URI.create("/api/contacts/" + created.getId())).body(created);
  }

  @PutMapping("/contacts/{id}")
  public ContactDto update(
      @PathVariable Long id, @Valid @RequestBody UpdateContactRequest request) {
    return contactService.update(id, request);
  }

  @PutMapping("/contacts/{id}/set-primary")
  public ContactDto setPrimary(@PathVariable Long id) {
    return contactService.setPrimary(id);
  }

  @DeleteMapping("/contacts/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    contactService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
