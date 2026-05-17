package org.psk.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.psk.common.exception.GlobalExceptionHandler;
import org.psk.security.domain.AppRole;
import org.psk.security.domain.AppUser;
import org.psk.security.dto.UserMapper;
import org.psk.security.jwt.JwtService;
import org.psk.security.repository.AppUserRepository;
import org.psk.security.web.AuthController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, UserMapper.class})
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private AuthenticationManager authenticationManager;
  @MockitoBean private AppUserRepository appUserRepository;
  @MockitoBean private PasswordEncoder passwordEncoder;
  @MockitoBean private JwtService jwtService;

  @Test
  void login_validCredentials_returnsToken() throws Exception {
    AppUser user = user(1L, "user", AppRole.USER);
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenReturn(new UsernamePasswordAuthenticationToken("user", null, java.util.List.of()));
    when(appUserRepository.findByUsername("user")).thenReturn(Optional.of(user));
    when(jwtService.generateToken("user", "USER")).thenReturn("jwt-token");
    when(jwtService.getExpirationMs()).thenReturn(3_600_000L);

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"user\",\"password\":\"user123\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").value("jwt-token"))
        .andExpect(jsonPath("$.username").value("user"))
        .andExpect(jsonPath("$.role").value("USER"))
        .andExpect(jsonPath("$.expiresInMs").value(3_600_000));
  }

  @Test
  void login_invalidCredentials_returns401() throws Exception {
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenThrow(new BadCredentialsException("Bad credentials"));

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"user\",\"password\":\"wrong\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("Invalid credentials"));
  }

  @Test
  void register_validRequest_createsUserRole() throws Exception {
    when(appUserRepository.existsByUsername("newuser")).thenReturn(false);
    when(passwordEncoder.encode("secret123")).thenReturn("bcrypt-hash");
    when(appUserRepository.save(any(AppUser.class)))
        .thenAnswer(
            invocation -> {
              AppUser saved = invocation.getArgument(0);
              saved.setId(5L);
              return saved;
            });

    mockMvc
        .perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"newuser\",\"password\":\"secret123\"}"))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.username").value("newuser"))
        .andExpect(jsonPath("$.role").value("USER"))
        .andExpect(jsonPath("$.enabled").value(true));

    ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
    verify(appUserRepository).save(captor.capture());
    assertThat(captor.getValue().getPasswordHash()).isEqualTo("bcrypt-hash");
    assertThat(captor.getValue().getRole()).isEqualTo(AppRole.USER);
  }

  private AppUser user(Long id, String username, AppRole role) {
    AppUser user = new AppUser();
    user.setId(id);
    user.setUsername(username);
    user.setPasswordHash("hash");
    user.setRole(role);
    user.setEnabled(true);
    return user;
  }
}
