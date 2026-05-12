package org.psk.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateServiceRequest {

  @NotBlank
  @Size(max = 255)
  private String name;

  private String description;

  private Boolean active = true;

  @NotNull private Long supplierId;

  private Long contractId;
}
