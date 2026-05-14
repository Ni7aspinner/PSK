package org.psk.contract.web;

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

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.psk.common.exception.GlobalExceptionHandler;
import org.psk.contract.domain.ContractStatus;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.CreateContractRequest;
import org.psk.contract.dto.UpdateContractRequest;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.exception.ContractNumberDuplicateException;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.psk.contract.service.ContractService;
import org.psk.security.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ContractController.class)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "USER")
class ContractControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ContractService contractService;
  @MockitoBean private JwtService jwtService;

  @Test
  void getAll_returnsList() throws Exception {
    ContractDto dto =
        ContractDto.builder()
            .id(1L)
            .contractNumber("C-001")
            .title("Contract")
            .status(ContractStatus.ACTIVE)
            .supplierId(10L)
            .serviceIds(List.of(5L))
            .build();
    when(contractService.findAll()).thenReturn(List.of(dto));

    mockMvc
        .perform(get("/api/contracts"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].contractNumber").value("C-001"))
        .andExpect(jsonPath("$[0].serviceIds[0]").value(5));
  }

  @Test
  void getById_notFound_returns404() throws Exception {
    when(contractService.findById(99L)).thenThrow(new ContractNotFoundException("Not found"));

    mockMvc.perform(get("/api/contracts/99")).andExpect(status().isNotFound());
  }

  @Test
  void create_valid_returns201WithLocation() throws Exception {
    String body =
        "{\"contractNumber\":\"C-001\",\"title\":\"Contract\","
            + "\"startDate\":\"2026-01-01\",\"endDate\":\"2026-12-31\","
            + "\"status\":\"ACTIVE\",\"supplierId\":10}";
    ContractDto created =
        ContractDto.builder()
            .id(5L)
            .contractNumber("C-001")
            .title("Contract")
            .startDate(LocalDate.of(2026, 1, 1))
            .endDate(LocalDate.of(2026, 12, 31))
            .status(ContractStatus.ACTIVE)
            .supplierId(10L)
            .serviceIds(List.of())
            .build();
    when(contractService.create(any(CreateContractRequest.class))).thenReturn(created);

    mockMvc
        .perform(post("/api/contracts").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(header().exists("Location"));
  }

  @Test
  void create_duplicateNumber_returns409() throws Exception {
    String body =
        "{\"contractNumber\":\"C-001\",\"title\":\"Contract\","
            + "\"startDate\":\"2026-01-01\",\"endDate\":\"2026-12-31\","
            + "\"status\":\"ACTIVE\",\"supplierId\":10}";
    when(contractService.create(any(CreateContractRequest.class)))
        .thenThrow(new ContractNumberDuplicateException("Duplicate"));

    mockMvc
        .perform(post("/api/contracts").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isConflict());
  }

  @Test
  void update_invalidDateRange_returns400() throws Exception {
    String body =
        "{\"title\":\"Updated\",\"startDate\":\"2026-12-31\","
            + "\"endDate\":\"2026-01-01\",\"status\":\"ACTIVE\",\"version\":1}";
    when(contractService.update(eq(5L), any(UpdateContractRequest.class)))
        .thenThrow(new InvalidContractDateRangeException("Invalid"));

    mockMvc
        .perform(put("/api/contracts/5").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest());
  }

  @Test
  void forceOverwrite_staleVersion_returnsUpdatedContract() throws Exception {
    String body =
        "{\"title\":\"Forced\",\"startDate\":\"2026-01-01\","
            + "\"endDate\":\"2026-12-31\",\"status\":\"ACTIVE\","
            + "\"version\":0,\"forceOverwrite\":true}";
    ContractDto updated =
        ContractDto.builder()
            .id(5L)
            .contractNumber("C-001")
            .title("Forced")
            .status(ContractStatus.ACTIVE)
            .version(3L)
            .build();
    when(contractService.forceOverwrite(eq(5L), any(UpdateContractRequest.class)))
        .thenReturn(updated);

    mockMvc
        .perform(
            put("/api/contracts/5/force").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Forced"))
        .andExpect(jsonPath("$.version").value(3));
  }

  @Test
  void terminate_existing_returnsTerminatedContract() throws Exception {
    ContractDto terminated =
        ContractDto.builder()
            .id(5L)
            .contractNumber("C-001")
            .title("Contract")
            .status(ContractStatus.TERMINATED)
            .supplierId(10L)
            .serviceIds(List.of())
            .build();
    when(contractService.terminate(5L)).thenReturn(terminated);

    mockMvc
        .perform(post("/api/contracts/5/terminate"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("TERMINATED"));
  }

  @Test
  void delete_notFound_returns404() throws Exception {
    doThrow(new ContractNotFoundException("Not found")).when(contractService).delete(99L);

    mockMvc.perform(delete("/api/contracts/99")).andExpect(status().isNotFound());
  }
}
