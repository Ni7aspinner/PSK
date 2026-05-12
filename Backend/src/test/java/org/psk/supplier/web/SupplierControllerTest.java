package org.psk.supplier.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.psk.common.exception.GlobalExceptionHandler;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.psk.supplier.service.SupplierService;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@WithMockUser(roles = "USER")
class SupplierControllerTest {

  @Mock private SupplierService supplierService;

  private MockMvc mockMvc;
  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new SupplierController(supplierService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void getAll_returnsEmptyList() throws Exception {
    when(supplierService.findAll()).thenReturn(List.of());

    mockMvc
        .perform(get("/api/suppliers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  void getAll_returnsList() throws Exception {
    SupplierDto dto = SupplierDto.builder().id(1L).name("Alpha").registrationCode("A-001").build();
    when(supplierService.findAll()).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/suppliers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Alpha"));
  }

  @Test
  void getById_found_returnsSupplier() throws Exception {
    SupplierDto dto = SupplierDto.builder().id(1L).name("Beta").registrationCode("B-001").build();
    when(supplierService.findById(1L)).thenReturn(dto);

    mockMvc
        .perform(get("/api/suppliers/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.name").value("Beta"));
  }

  @Test
  void getById_notFound_returns404() throws Exception {
    when(supplierService.findById(99L)).thenThrow(new SupplierNotFoundException("Not found"));

    mockMvc.perform(get("/api/suppliers/99")).andExpect(status().isNotFound());
  }

  @Test
  void create_blankName_returns400WithFieldErrors() throws Exception {
    CreateSupplierRequest req = new CreateSupplierRequest();
    req.setName("   ");
    req.setRegistrationCode("CODE-001");

    mockMvc
        .perform(
            post("/api/suppliers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors").isArray());
  }

  @Test
  void create_valid_returns201WithLocation() throws Exception {
    CreateSupplierRequest req = new CreateSupplierRequest();
    req.setName("Gamma");
    req.setRegistrationCode("G-001");

    SupplierDto created =
        SupplierDto.builder().id(5L).name("Gamma").registrationCode("G-001").version(0L).build();
    when(supplierService.create(any(CreateSupplierRequest.class))).thenReturn(created);

    mockMvc
        .perform(
            post("/api/suppliers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(header().exists("Location"));
  }

  @Test
  void update_valid_returnsUpdatedSupplier() throws Exception {
    UpdateSupplierRequest req = new UpdateSupplierRequest();
    req.setName("Delta Updated");
    req.setVersion(1L);

    SupplierDto updated =
        SupplierDto.builder()
            .id(2L)
            .name("Delta Updated")
            .registrationCode("D-001")
            .version(2L)
            .build();
    when(supplierService.update(eq(2L), any(UpdateSupplierRequest.class))).thenReturn(updated);

    mockMvc
        .perform(
            put("/api/suppliers/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Delta Updated"));
  }

  @Test
  void delete_existing_returns204() throws Exception {
    doNothing().when(supplierService).delete(1L);

    mockMvc.perform(delete("/api/suppliers/1")).andExpect(status().isNoContent());
  }

  @Test
  void delete_notFound_returns404() throws Exception {
    doThrow(new SupplierNotFoundException("Not found")).when(supplierService).delete(99L);

    mockMvc.perform(delete("/api/suppliers/99")).andExpect(status().isNotFound());
  }
}
