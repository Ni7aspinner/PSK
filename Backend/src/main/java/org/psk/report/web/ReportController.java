package org.psk.report.web;

import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.psk.report.dto.ActiveSuppliersReportDto;
import org.psk.report.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;

  @GetMapping("/active-suppliers")
  public CompletableFuture<ResponseEntity<ActiveSuppliersReportDto>> activeSuppliers() {
    return reportService.getActiveSuppliersReport().thenApply(ResponseEntity::ok);
  }

  @GetMapping("/active-suppliers/pdf")
  public CompletableFuture<ResponseEntity<byte[]>> activeSuppliersPdf() {
    return reportService
        .generateActiveSuppliersPdf()
        .thenApply(
            pdf ->
                ResponseEntity.ok()
                    .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"active-suppliers-report.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf));
  }
}
