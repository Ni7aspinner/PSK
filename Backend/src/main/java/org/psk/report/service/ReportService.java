package org.psk.report.service;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.report.mapper.ActiveSuppliersMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

  private final ActiveSuppliersMapper activeSuppliersMapper;

  @Async("reportExecutor")
  @Transactional(readOnly = true)
  public CompletableFuture<ActiveSuppliersReportDto> getActiveSuppliersReport() {
    ActiveSuppliersReportDto report =
        ActiveSuppliersReportDto.builder()
            .rows(activeSuppliersMapper.findActiveSuppliers())
            .generatedAt(Instant.now())
            .build();
    return CompletableFuture.completedFuture(report);
  }
}
