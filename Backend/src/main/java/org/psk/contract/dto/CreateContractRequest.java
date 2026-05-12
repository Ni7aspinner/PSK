package org.psk.contract.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import org.psk.contract.domain.ContractStatus;

@Data
public class CreateContractRequest {

  @NotBlank
  @Size(max = 100)
  private String contractNumber;

  @NotBlank
  @Size(max = 255)
  private String title;

  @NotNull private LocalDate startDate;

  @NotNull private LocalDate endDate;

  private ContractStatus status = ContractStatus.ACTIVE;

  @NotNull private Long supplierId;
}
