package org.psk.contract.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.psk.contract.ContractStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractDto {

  private Long id;
  private String contractNumber;
  private String title;
  private LocalDate startDate;
  private LocalDate endDate;
  private ContractStatus status;
  private Long supplierId;
  private List<Long> serviceIds;
  private Long version;
}
