package org.psk.service;

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.psk.contract.Contract;
import org.psk.supplier.Supplier;

@Entity
@Table(name = "supplier_service")
@Getter
@Setter
@NoArgsConstructor
@ToString(of = {"id", "name", "active"})
public class Service {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @NotNull
  @Column(nullable = false)
  private Boolean active = true;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "supplier_id", nullable = false)
  private Supplier supplier;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "contract_id")
  private Contract contract;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Version
  @Column(name = "opt_lock_version", nullable = false)
  private Long version;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
    if (active == null) {
      active = true;
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Service other)) return false;
    Long supplierId = supplier != null ? supplier.getId() : null;
    Long otherSupplierId = other.supplier != null ? other.supplier.getId() : null;
    return name != null
        && supplierId != null
        && name.equals(other.name)
        && supplierId.equals(otherSupplierId);
  }

  @Override
  public int hashCode() {
    Long supplierId = supplier != null ? supplier.getId() : null;
    return Objects.hash(name, supplierId);
  }
}
