package org.psk.contact.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.psk.supplier.domain.Supplier;

@Entity
@Table(name = "contact_person")
@Getter
@Setter
@NoArgsConstructor
@ToString(of = {"id", "firstName", "lastName", "email", "primary"})
public class Contact {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 100)
  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @NotBlank
  @Size(max = 100)
  @Column(name = "last_name", nullable = false, length = 100)
  private String lastName;

  @Size(max = 150)
  @Column(length = 150)
  private String position;

  @Email
  @Size(max = 255)
  @Column(length = 255)
  private String email;

  @Size(max = 50)
  @Column(length = 50)
  private String phone;

  @Column(name = "\"primary\"", nullable = false)
  private boolean primary;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "supplier_id", nullable = false)
  private Supplier supplier;

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
    if (!(o instanceof Contact other)) return false;
    Long supplierId = supplier != null ? supplier.getId() : null;
    Long otherSupplierId = other.supplier != null ? other.supplier.getId() : null;
    return email != null
        && supplierId != null
        && email.equals(other.email)
        && supplierId.equals(otherSupplierId);
  }

  @Override
  public int hashCode() {
    Long supplierId = supplier != null ? supplier.getId() : null;
    return Objects.hash(email, supplierId);
  }
}
