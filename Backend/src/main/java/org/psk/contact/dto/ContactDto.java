package org.psk.contact.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDto {

  private Long id;
  private String firstName;
  private String lastName;
  private String position;
  private String email;
  private String phone;
  private boolean primary;
  private Long supplierId;
  private Instant createdAt;
  private Long version;
}
