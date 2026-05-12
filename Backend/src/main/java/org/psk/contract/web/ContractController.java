package org.psk.contract.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.CreateContractRequest;
import org.psk.contract.dto.UpdateContractRequest;
import org.psk.contract.service.ContractService;
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
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

  private final ContractService contractService;

  @GetMapping
  public List<ContractDto> findAll() {
    return contractService.findAll();
  }

  @GetMapping("/{id}")
  public ContractDto findById(@PathVariable Long id) {
    return contractService.findById(id);
  }

  @PostMapping
  public ResponseEntity<ContractDto> create(@Valid @RequestBody CreateContractRequest request) {
    ContractDto created = contractService.create(request);
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  @PutMapping("/{id}")
  public ContractDto update(
      @PathVariable Long id, @Valid @RequestBody UpdateContractRequest request) {
    return contractService.update(id, request);
  }

  @PostMapping("/{id}/terminate")
  public ContractDto terminate(@PathVariable Long id) {
    return contractService.terminate(id);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    contractService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
