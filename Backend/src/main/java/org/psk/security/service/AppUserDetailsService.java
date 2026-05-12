package org.psk.security.service;

import lombok.RequiredArgsConstructor;
import org.psk.security.domain.AppUser;
import org.psk.security.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

  private final AppUserRepository appUserRepository;

  @Override
  public UserDetails loadUserByUsername(String username) {
    AppUser appUser =
        appUserRepository
            .findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

    return User.withUsername(appUser.getUsername())
        .password(appUser.getPasswordHash())
        .authorities(new SimpleGrantedAuthority("ROLE_" + appUser.getRole().name()))
        .disabled(!appUser.isEnabled())
        .build();
  }
}
