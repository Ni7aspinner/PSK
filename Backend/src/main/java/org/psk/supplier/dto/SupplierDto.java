package org.psk.supplier.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {

  private Long id;
  private String name;
  private String registrationCode;
  private String email;
  private String phone;
  private Instant createdAt;
  private Long version;
}
