package org.psk.security.web;

import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.psk.security.domain.AppRole;
import org.psk.security.domain.AppUser;
import org.psk.security.dto.LoginRequest;
import org.psk.security.dto.LoginResponse;
import org.psk.security.dto.RegisterRequest;
import org.psk.security.dto.UserDto;
import org.psk.security.dto.UserMapper;
import org.psk.security.exception.UsernameAlreadyExistsException;
import org.psk.security.jwt.JwtService;
import org.psk.security.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final AppUserRepository appUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final UserMapper userMapper;

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
    AppUser user =
        appUserRepository
            .findByUsername(request.getUsername())
            .orElseThrow(
                () ->
                    new org.springframework.security.core.AuthenticationException(
                        "User not found") {});
    String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
    return LoginResponse.builder()
        .token(token)
        .username(user.getUsername())
        .role(user.getRole().name())
        .expiresInMs(jwtService.getExpirationMs())
        .build();
  }

  @PostMapping("/register")
  public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
    if (appUserRepository.existsByUsername(request.getUsername())) {
      throw new UsernameAlreadyExistsException(
          "User already exists with username: " + request.getUsername());
    }

    AppUser user = new AppUser();
    user.setUsername(request.getUsername());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole(AppRole.USER);
    user.setEnabled(true);

    UserDto created = userMapper.toDto(appUserRepository.save(user));
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }
}
