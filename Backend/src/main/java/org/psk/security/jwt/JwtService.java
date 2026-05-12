package org.psk.security.jwt;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey secretKey;
  private final long expirationMs;
  private final Clock clock;

  @Autowired
  public JwtService(
      @Value("${app.security.jwt.secret}") String secret,
      @Value("${app.security.jwt.expiration-ms}") long expirationMs) {
    this(secret, expirationMs, Clock.systemUTC());
  }

  JwtService(String secret, long expirationMs, Clock clock) {
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
    this.clock = clock;
  }

  public String generateToken(String username, String role) {
    Instant now = Instant.now(clock);
    return Jwts.builder()
        .subject(username)
        .claim("role", role)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expirationMs)))
        .signWith(secretKey, Jwts.SIG.HS256)
        .compact();
  }

  public Optional<JwtClaims> parseToken(String token) {
    try {
      io.jsonwebtoken.Claims claims =
          Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
      String username = claims.getSubject();
      String role = claims.get("role", String.class);
      if (username == null || username.isBlank() || role == null || role.isBlank()) {
        return Optional.empty();
      }
      return Optional.of(new JwtClaims(username, role));
    } catch (JwtException | IllegalArgumentException ex) {
      return Optional.empty();
    }
  }

  public long getExpirationMs() {
    return expirationMs;
  }
}
