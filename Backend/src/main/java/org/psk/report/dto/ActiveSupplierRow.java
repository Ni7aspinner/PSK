package org.psk.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSupplierRow {

  private Long supplierId;
  private String name;
  private String registrationCode;
  private long activeContracts;
  private long activeServices;
}
