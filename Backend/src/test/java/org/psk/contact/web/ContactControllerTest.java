package org.psk.contact.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.psk.common.exception.GlobalExceptionHandler;
import org.psk.contact.dto.ContactDto;
import org.psk.contact.dto.CreateContactRequest;
import org.psk.contact.dto.UpdateContactRequest;
import org.psk.contact.exception.ContactNotFoundException;
import org.psk.contact.service.ContactService;
import org.psk.security.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ContactController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "USER")
class ContactControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ContactService contactService;
  @MockitoBean private JwtService jwtService;

  @Test
  void getAll_returnsList() throws Exception {
    ContactDto dto =
        ContactDto.builder()
            .id(1L)
            .firstName("Alice")
            .lastName("Contact")
            .email("alice@example.com")
            .primary(true)
            .supplierId(10L)
            .build();
    when(contactService.findAll()).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/contacts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].firstName").value("Alice"))
        .andExpect(jsonPath("$[0].primary").value(true))
        .andExpect(jsonPath("$[0].supplierId").value(10));
  }

  @Test
  void getSupplierContacts_returnsList() throws Exception {
    ContactDto dto = ContactDto.builder().id(1L).firstName("Alice").supplierId(10L).build();
    when(contactService.findBySupplierId(10L)).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/suppliers/10/contacts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].supplierId").value(10));
  }

  @Test
  void getById_existingContact_returnsContact() throws Exception {
    ContactDto dto =
        ContactDto.builder().id(5L).firstName("Alice").lastName("Contact").supplierId(10L).build();
    when(contactService.findById(5L)).thenReturn(dto);

    mockMvc
        .perform(get("/api/contacts/5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.firstName").value("Alice"));
  }

  @Test
  void getById_notFound_returns404() throws Exception {
    when(contactService.findById(99L)).thenThrow(new ContactNotFoundException("Not found"));

    mockMvc.perform(get("/api/contacts/99")).andExpect(status().isNotFound());
  }

  @Test
  void create_blankFirstName_returns400WithFieldErrors() throws Exception {
    String body = "{\"firstName\":\" \",\"lastName\":\"Contact\",\"supplierId\":1}";

    mockMvc
        .perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors").isArray());
  }

  @Test
  void create_valid_returns201WithLocation() throws Exception {
    String body =
        "{\"firstName\":\"Alice\",\"lastName\":\"Contact\",\"position\":\"Manager\","
            + "\"email\":\"alice@example.com\",\"phone\":\"+37060000000\","
            + "\"primary\":true,\"supplierId\":10}";
    ContactDto created =
        ContactDto.builder()
            .id(5L)
            .firstName("Alice")
            .lastName("Contact")
            .primary(true)
            .supplierId(10L)
            .build();
    when(contactService.create(any(CreateContactRequest.class))).thenReturn(created);

    mockMvc
        .perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.primary").value(true))
        .andExpect(header().exists("Location"));
  }

  @Test
  void update_valid_returnsUpdatedContact() throws Exception {
    String body =
        "{\"firstName\":\"Alice\",\"lastName\":\"Updated\",\"position\":\"Director\","
            + "\"email\":\"alice@example.com\",\"phone\":\"+37060000000\","
            + "\"primary\":false,\"supplierId\":10,\"version\":1}";
    ContactDto updated =
        ContactDto.builder()
            .id(5L)
            .firstName("Alice")
            .lastName("Updated")
            .primary(false)
            .supplierId(10L)
            .build();
    when(contactService.update(eq(5L), any(UpdateContactRequest.class))).thenReturn(updated);

    mockMvc
        .perform(put("/api/contacts/5").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.lastName").value("Updated"))
        .andExpect(jsonPath("$.primary").value(false));
  }

  @Test
  void setPrimary_existingContact_returnsPrimaryContact() throws Exception {
    ContactDto primary =
        ContactDto.builder().id(5L).firstName("Alice").primary(true).supplierId(10L).build();
    when(contactService.setPrimary(5L)).thenReturn(primary);

    mockMvc
        .perform(put("/api/contacts/5/set-primary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.primary").value(true));
  }

  @Test
  void delete_notFound_returns404() throws Exception {
    doThrow(new ContactNotFoundException("Not found")).when(contactService).delete(99L);

    mockMvc.perform(delete("/api/contacts/99")).andExpect(status().isNotFound());
  }

  @Test
  void delete_existingContact_returns204() throws Exception {
    mockMvc.perform(delete("/api/contacts/5")).andExpect(status().isNoContent());
  }
}
