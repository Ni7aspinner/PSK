package org.psk.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET =
      "PSK-2026-tiekejai-development-secret-key-NEEDS-CHANGE-IN-PRODUCTION-min-256-bits";

  @Test
  void generateToken_andParseToken_returnsClaims() {
    JwtService jwtService =
        new JwtService(SECRET, 3_600_000, Clock.fixed(Instant.now(), ZoneOffset.UTC));

    String token = jwtService.generateToken("alice", "USER");

    assertThat(jwtService.parseToken(token))
        .hasValueSatisfying(
            claims -> {
              assertThat(claims.username()).isEqualTo("alice");
              assertThat(claims.role()).isEqualTo("USER");
            });
  }

  @Test
  void parseToken_invalidToken_returnsEmpty() {
    JwtService jwtService = new JwtService(SECRET, 3_600_000);

    assertThat(jwtService.parseToken("not-a-jwt")).isEmpty();
  }

  @Test
  void parseToken_expiredToken_returnsEmpty() {
    JwtService jwtService = new JwtService(SECRET, 1, Clock.fixed(Instant.EPOCH, ZoneOffset.UTC));
    String token = jwtService.generateToken("alice", "USER");

    assertThat(jwtService.parseToken(token)).isEmpty();
  }
}
