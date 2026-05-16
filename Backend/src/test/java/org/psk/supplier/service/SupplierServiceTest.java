package org.psk.supplier.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.psk.supplier.Supplier;
import org.psk.supplier.SupplierRepository;
import org.psk.supplier.SupplierService;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.SupplierMapper;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.psk.supplier.exception.DuplicateSupplierException;
import org.psk.supplier.exception.SupplierNotFoundException;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

  @Mock private SupplierRepository supplierRepository;

  private final SupplierMapper supplierMapper = new SupplierMapper();

  private SupplierService supplierService;

  @BeforeEach
  void setUp() {
    supplierService = new SupplierService(supplierRepository, supplierMapper);
  }

  @Test
  void findAll_returnsAllSuppliers() {
    Supplier s = new Supplier();
    s.setName("Alpha");
    s.setRegistrationCode("A-001");
    when(supplierRepository.findAll()).thenReturn(List.of(s));

    List<SupplierDto> result = supplierService.findAll();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getName()).isEqualTo("Alpha");
  }

  @Test
  void findById_notFound_throwsSupplierNotFoundException() {
    when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> supplierService.findById(99L))
        .isInstanceOf(SupplierNotFoundException.class)
        .hasMessageContaining("99");
  }

  @Test
  void create_duplicateCode_throwsDuplicateSupplierException() {
    CreateSupplierRequest req = new CreateSupplierRequest();
    req.setName("New");
    req.setRegistrationCode("DUPE");
    when(supplierRepository.existsByRegistrationCode("DUPE")).thenReturn(true);

    assertThatThrownBy(() -> supplierService.create(req))
        .isInstanceOf(DuplicateSupplierException.class)
        .hasMessageContaining("DUPE");
  }

  @Test
  void create_uniqueCode_savesAndReturnsDto() {
    CreateSupplierRequest req = new CreateSupplierRequest();
    req.setName("Beta");
    req.setRegistrationCode("B-001");
    when(supplierRepository.existsByRegistrationCode("B-001")).thenReturn(false);

    Supplier saved = new Supplier();
    saved.setName("Beta");
    saved.setRegistrationCode("B-001");
    when(supplierRepository.save(any(Supplier.class))).thenReturn(saved);

    SupplierDto result = supplierService.create(req);

    assertThat(result.getName()).isEqualTo("Beta");
    assertThat(result.getRegistrationCode()).isEqualTo("B-001");
  }

  @Test
  void update_existingSupplier_updatesAndReturnsDto() {
    Supplier existing = new Supplier();
    existing.setName("Old");
    existing.setRegistrationCode("C-001");
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));
    when(supplierRepository.save(existing)).thenReturn(existing);

    UpdateSupplierRequest req = new UpdateSupplierRequest();
    req.setName("New");
    req.setVersion(0L);

    SupplierDto result = supplierService.update(1L, req);

    assertThat(result.getName()).isEqualTo("New");
  }

  @Test
  void update_notFound_throwsSupplierNotFoundException() {
    when(supplierRepository.findById(42L)).thenReturn(Optional.empty());

    UpdateSupplierRequest req = new UpdateSupplierRequest();
    req.setName("X");
    req.setVersion(0L);

    assertThatThrownBy(() -> supplierService.update(42L, req))
        .isInstanceOf(SupplierNotFoundException.class);
  }

  @Test
  void delete_existingSupplier_callsRepositoryDelete() {
    Supplier existing = new Supplier();
    existing.setRegistrationCode("D-001");
    when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));

    supplierService.delete(1L);

    verify(supplierRepository).delete(existing);
  }

  @Test
  void delete_notFound_throwsSupplierNotFoundException() {
    when(supplierRepository.findById(7L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> supplierService.delete(7L))
        .isInstanceOf(SupplierNotFoundException.class);
  }
}
