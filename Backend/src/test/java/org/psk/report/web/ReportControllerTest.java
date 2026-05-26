package org.psk.report.web;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;
import org.psk.report.dto.ActiveSupplierRow;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.report.service.ReportService;
import org.psk.security.config.SecurityConfig;
import org.psk.security.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(ReportController.class)
@Import(SecurityConfig.class)
class ReportControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ReportService reportService;
  @MockitoBean private JwtService jwtService;

  @Test
  void activeSuppliers_authenticatedUser_returnsReport() throws Exception {
    ActiveSuppliersReportDto report =
        ActiveSuppliersReportDto.builder()
            .rows(
                List.of(
                    ActiveSupplierRow.builder()
                        .supplierId(1L)
                        .name("Alpha")
                        .registrationCode("A-001")
                        .activeContracts(2)
                        .activeServices(3)
                        .build()))
            .generatedAt(Instant.parse("2026-05-18T16:00:00Z"))
            .build();
    when(reportService.getActiveSuppliersReport())
        .thenReturn(CompletableFuture.completedFuture(report));

    MvcResult result =
        mockMvc
            .perform(get("/reports/active-suppliers").with(user("report-user").roles("USER")))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(asyncDispatch(result))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.generatedAt").value("2026-05-18T16:00:00Z"))
        .andExpect(jsonPath("$.rows").isArray())
        .andExpect(jsonPath("$.rows[0].supplierId").value(1))
        .andExpect(jsonPath("$.rows[0].name").value("Alpha"))
        .andExpect(jsonPath("$.rows[0].registrationCode").value("A-001"))
        .andExpect(jsonPath("$.rows[0].activeContracts").value(2))
        .andExpect(jsonPath("$.rows[0].activeServices").value(3));
  }

  @Test
  @WithAnonymousUser
  void activeSuppliers_unauthenticated_returns401() throws Exception {
    mockMvc.perform(get("/reports/active-suppliers")).andExpect(status().isUnauthorized());
  }
}
