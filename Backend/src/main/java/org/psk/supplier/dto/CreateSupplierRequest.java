package org.psk.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSupplierRequest {

  @NotBlank
  @Size(max = 255)
  private String name;

  @NotBlank
  @Size(max = 50)
  private String registrationCode;

  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 50)
  private String phone;
}
