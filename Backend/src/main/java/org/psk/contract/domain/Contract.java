package org.psk.contract.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.psk.service.domain.Service;
import org.psk.supplier.domain.Supplier;

@Entity
@Table(name = "contract")
@Getter
@Setter
@NoArgsConstructor
@ToString(of = {"id", "contractNumber", "status"})
public class Contract {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 100)
  @Column(name = "contract_number", nullable = false, unique = true, length = 100)
  private String contractNumber;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false)
  private String title;

  @NotNull
  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @NotNull
  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ContractStatus status = ContractStatus.ACTIVE;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "supplier_id", nullable = false)
  private Supplier supplier;

  @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
  private Set<Service> services = new HashSet<>();

  @Version
  @Column(name = "opt_lock_version", nullable = false)
  private Long version;

  @PrePersist
  protected void onCreate() {
    if (status == null) {
      status = ContractStatus.ACTIVE;
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Contract other)) return false;
    return contractNumber != null && contractNumber.equals(other.contractNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(contractNumber);
  }
}
