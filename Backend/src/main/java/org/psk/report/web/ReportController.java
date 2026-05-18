package org.psk.report.web;

import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;

  @GetMapping("/active-suppliers")
  public CompletableFuture<ResponseEntity<ActiveSuppliersReportDto>> activeSuppliers() {
    return reportService.getActiveSuppliersReport().thenApply(ResponseEntity::ok);
  }
}
