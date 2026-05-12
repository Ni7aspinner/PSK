package org.psk.supplier.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "supplier")
@Getter
@Setter
@NoArgsConstructor
@ToString(of = {"id", "name", "registrationCode"})
public class Supplier {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false)
  private String name;

  @NotBlank
  @Size(max = 50)
  @Column(name = "registration_code", nullable = false, unique = true)
  private String registrationCode;

  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 50)
  private String phone;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Version
  @Column(name = "opt_lock_version", nullable = false)
  private Long version;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Supplier other)) return false;
    return registrationCode != null && registrationCode.equals(other.registrationCode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(registrationCode);
  }
}
