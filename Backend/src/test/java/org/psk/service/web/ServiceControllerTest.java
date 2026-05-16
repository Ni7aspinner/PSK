package org.psk.service.web;

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
import org.psk.security.jwt.JwtService;
import org.psk.service.ServiceController;
import org.psk.service.ServiceManagementService;
import org.psk.service.dto.CreateServiceRequest;
import org.psk.service.dto.ServiceDto;
import org.psk.service.dto.UpdateServiceRequest;
import org.psk.service.exception.ServiceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ServiceController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "USER")
class ServiceControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ServiceManagementService serviceManagementService;
  @MockitoBean private JwtService jwtService;

  @Test
  void getAll_returnsList() throws Exception {
    ServiceDto dto =
        ServiceDto.builder().id(1L).name("Hosting").supplierId(10L).contractId(20L).build();
    when(serviceManagementService.findAll()).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/services"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Hosting"))
        .andExpect(jsonPath("$[0].supplierId").value(10))
        .andExpect(jsonPath("$[0].contractId").value(20));
  }

  @Test
  void getSupplierServices_returnsList() throws Exception {
    ServiceDto dto = ServiceDto.builder().id(1L).name("Hosting").supplierId(10L).build();
    when(serviceManagementService.findBySupplierId(10L)).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/suppliers/10/services"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].supplierId").value(10));
  }

  @Test
  void getById_notFound_returns404() throws Exception {
    when(serviceManagementService.findById(99L))
        .thenThrow(new ServiceNotFoundException("Not found"));

    mockMvc.perform(get("/api/services/99")).andExpect(status().isNotFound());
  }

  @Test
  void create_blankName_returns400WithFieldErrors() throws Exception {
    String body = "{\"name\":\" \",\"supplierId\":1}";

    mockMvc
        .perform(post("/api/services").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors").isArray());
  }

  @Test
  void create_valid_returns201WithLocation() throws Exception {
    String body =
        "{\"name\":\"Hosting\",\"description\":\"Managed\",\"active\":true,"
            + "\"supplierId\":10,\"contractId\":20}";
    ServiceDto created =
        ServiceDto.builder().id(5L).name("Hosting").supplierId(10L).contractId(20L).build();
    when(serviceManagementService.create(any(CreateServiceRequest.class))).thenReturn(created);

    mockMvc
        .perform(post("/api/services").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(header().exists("Location"));
  }

  @Test
  void update_valid_returnsUpdatedService() throws Exception {
    String body =
        "{\"name\":\"Updated\",\"description\":\"Updated\",\"active\":false,"
            + "\"supplierId\":10,\"contractId\":20,\"version\":1}";
    ServiceDto updated =
        ServiceDto.builder().id(5L).name("Updated").active(false).supplierId(10L).build();
    when(serviceManagementService.update(eq(5L), any(UpdateServiceRequest.class)))
        .thenReturn(updated);

    mockMvc
        .perform(put("/api/services/5").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated"))
        .andExpect(jsonPath("$.active").value(false));
  }

  @Test
  void delete_notFound_returns404() throws Exception {
    doThrow(new ServiceNotFoundException("Not found")).when(serviceManagementService).delete(99L);

    mockMvc.perform(delete("/api/services/99")).andExpect(status().isNotFound());
  }
}
