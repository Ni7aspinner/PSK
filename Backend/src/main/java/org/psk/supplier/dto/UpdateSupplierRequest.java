package org.psk.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateSupplierRequest {

  @NotBlank
  @Size(max = 255)
  private String name;

  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 50)
  private String phone;

  @NotNull private Long version;
}
