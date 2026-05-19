package org.psk.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.psk.security.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtService jwtService;

  @Test
  void getSuppliers_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/api/suppliers")).andExpect(status().isUnauthorized());
  }

  @Test
  void getSuppliers_withValidToken_returns200() throws Exception {
    String token = jwtService.generateToken("user", "USER");

    mockMvc
        .perform(get("/api/suppliers").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
  }

  @Test
  void getSwaggerAPIDocs_withoutToken_returns200() throws Exception {
    mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
  }

  @Test
  void getSwaggerUi_withoutToken_isAllowed() throws Exception {
    mockMvc.perform(get("/swagger-ui.html")).andExpect(status().is3xxRedirection());

    mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
  }

  @Test
  void getAdminEndpoint_withUserRole_returns403() throws Exception {
    String token = jwtService.generateToken("user", "USER");

    mockMvc
        .perform(get("/api/admin/anything").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }
}
