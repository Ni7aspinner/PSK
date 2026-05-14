package org.psk.contract.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.psk.common.conflict.ForceOverwriteRequest;
import org.psk.contract.domain.ContractStatus;

@Data
@EqualsAndHashCode(callSuper = true)
public class UpdateContractRequest extends ForceOverwriteRequest {

  @NotBlank
  @Size(max = 255)
  private String title;

  @NotNull private LocalDate startDate;

  @NotNull private LocalDate endDate;

  @NotNull private ContractStatus status;

  @NotNull private Long version;
}
