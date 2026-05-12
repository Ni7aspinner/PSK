package org.psk.security.dto;

import org.psk.security.domain.AppUser;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public UserDto toDto(AppUser user) {
    return UserDto.builder()
        .id(user.getId())
        .username(user.getUsername())
        .role(user.getRole())
        .enabled(user.isEnabled())
        .createdAt(user.getCreatedAt())
        .version(user.getVersion())
        .build();
  }
}
