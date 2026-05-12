package org.psk.security.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.psk.security.domain.AppRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

  private Long id;
  private String username;
  private AppRole role;
  private boolean enabled;
  private Instant createdAt;
  private Long version;
}
