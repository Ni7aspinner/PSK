package org.psk.supplier;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

  private final SupplierService supplierService;

  @GetMapping
  public List<SupplierDto> findAll() {
    return supplierService.findAll();
  }

  @GetMapping("/{id}")
  public SupplierDto findById(@PathVariable Long id) {
    return supplierService.findById(id);
  }

  @PostMapping
  public ResponseEntity<SupplierDto> create(@Valid @RequestBody CreateSupplierRequest request) {
    SupplierDto created = supplierService.create(request);
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  @PutMapping("/{id}")
  public SupplierDto update(
      @PathVariable Long id, @Valid @RequestBody UpdateSupplierRequest request) {
    return supplierService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    supplierService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
