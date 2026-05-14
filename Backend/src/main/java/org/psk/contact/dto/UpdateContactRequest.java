package org.psk.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateContactRequest {

  @NotBlank
  @Size(max = 100)
  private String firstName;

  @NotBlank
  @Size(max = 100)
  private String lastName;

  @Size(max = 150)
  private String position;

  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 50)
  private String phone;

  private boolean primary;

  @NotNull private Long supplierId;

  @NotNull private Long version;
}
