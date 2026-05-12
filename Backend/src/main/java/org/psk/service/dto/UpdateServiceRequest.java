package org.psk.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateServiceRequest {

  @NotBlank
  @Size(max = 255)
  private String name;

  private String description;

  @NotNull private Boolean active;

  @NotNull private Long supplierId;

  private Long contractId;

  @NotNull private Long version;
}
