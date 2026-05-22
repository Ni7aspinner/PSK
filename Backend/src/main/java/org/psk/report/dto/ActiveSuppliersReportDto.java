package org.psk.report.dto;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSuppliersReportDto {

  private List<ActiveSupplierRow> rows;
  private Instant generatedAt;
}
