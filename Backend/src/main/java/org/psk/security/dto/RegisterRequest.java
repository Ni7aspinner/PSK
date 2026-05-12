package org.psk.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

  @NotBlank
  @Size(max = 100)
  private String username;

  @NotBlank
  @Size(min = 6, max = 100)
  private String password;
}
