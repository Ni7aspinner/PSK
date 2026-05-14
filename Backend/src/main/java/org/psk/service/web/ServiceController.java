package org.psk.service.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.service.dto.CreateServiceRequest;
import org.psk.service.dto.ServiceDto;
import org.psk.service.dto.UpdateServiceRequest;
import org.psk.service.service.ServiceManagementService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class ServiceController {

  private final ServiceManagementService serviceManagementService;

  @GetMapping("/services")
  public List<ServiceDto> findAll() {
    return serviceManagementService.findAll();
  }

  @GetMapping("/services/{id}")
  public ServiceDto findById(@PathVariable Long id) {
    return serviceManagementService.findById(id);
  }

  @GetMapping("/suppliers/{supplierId}/services")
  public List<ServiceDto> findBySupplierId(@PathVariable Long supplierId) {
    return serviceManagementService.findBySupplierId(supplierId);
  }

  @PostMapping("/services")
  public ResponseEntity<ServiceDto> create(@Valid @RequestBody CreateServiceRequest request) {
    ServiceDto created = serviceManagementService.create(request);
    URI location =
        ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/services/{id}")
            .buildAndExpand(created.getId())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  @PutMapping("/services/{id}")
  public ServiceDto update(
      @PathVariable Long id, @Valid @RequestBody UpdateServiceRequest request) {
    return serviceManagementService.update(id, request);
  }

  @PutMapping("/services/{id}/force")
  public ServiceDto forceOverwrite(
      @PathVariable Long id, @Valid @RequestBody UpdateServiceRequest request) {
    request.requireForceOverwrite();
    return serviceManagementService.forceOverwrite(id, request);
  }

  @DeleteMapping("/services/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    serviceManagementService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
