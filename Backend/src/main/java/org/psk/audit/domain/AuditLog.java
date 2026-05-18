package org.psk.audit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "occurred_at", nullable = false)
  private Instant occurredAt;

  @Column(length = 255)
  private String username;

  @Column(length = 255)
  private String roles;

  @Column(name = "class_name", nullable = false, length = 255)
  private String className;

  @Column(name = "method_name", nullable = false, length = 255)
  private String methodName;

  @Column(columnDefinition = "TEXT")
  private String arguments;

  @Column(nullable = false, length = 20)
  private String outcome;

  @Column(name = "error_message", columnDefinition = "TEXT")
  private String errorMessage;

  @Column(name = "duration_ms")
  private Long durationMs;
}
