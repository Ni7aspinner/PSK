package org.psk.report.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.psk.report.dto.ActiveSupplierRow;
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

  @Async("reportExecutor")
  @Transactional(readOnly = true)
  public CompletableFuture<byte[]> generateActiveSuppliersPdf() {
    List<ActiveSupplierRow> rows = activeSuppliersMapper.findActiveSuppliers();
    byte[] pdfBytes = generatePdf(rows);
    return CompletableFuture.completedFuture(pdfBytes);
  }

  private byte[] generatePdf(List<ActiveSupplierRow> rows) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document()) {
      PdfWriter.getInstance(document, baos);
      document.open();

      Paragraph title = new Paragraph("Active Suppliers Report");
      title.setAlignment(Element.ALIGN_CENTER);
      title.setSpacingAfter(20);
      document.add(title);

      PdfPTable table = new PdfPTable(5);
      table.setWidthPercentage(100);
      table.addCell("ID");
      table.addCell("Name");
      table.addCell("Reg. Code");
      table.addCell("Active Contracts");
      table.addCell("Active Services");

      for (ActiveSupplierRow row : rows) {
        table.addCell(String.valueOf(row.getSupplierId()));
        table.addCell(row.getName());
        table.addCell(row.getRegistrationCode());
        table.addCell(String.valueOf(row.getActiveContracts()));
        table.addCell(String.valueOf(row.getActiveServices()));
      }

      document.add(table);
      document.close();

      return baos.toByteArray();
    } catch (Exception e) {
      throw new RuntimeException("Error generating PDF", e);
    }
  }
}
