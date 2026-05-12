package org.psk.service.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {

  private Long id;
  private String name;
  private String description;
  private Boolean active;
  private Long supplierId;
  private Long contractId;
  private Instant createdAt;
  private Long version;
}
