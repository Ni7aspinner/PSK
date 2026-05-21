package org.psk.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.Test;
import org.psk.common.conflict.ConflictResolutionHelper;
import org.psk.common.conflict.OptimisticLockConflictException;
import org.psk.common.conflict.OptimisticLockConflictResponse;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.UpdateSupplierRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

class GlobalExceptionHandlerTest {

  @Test
  void handleOptimisticLockConflict_returnsSubmittedAndCurrentState() {
    GlobalExceptionHandler handler = new GlobalExceptionHandler();
    ConflictResolutionHelper helper = org.mockito.Mockito.mock(ConflictResolutionHelper.class);
    handler.setConflictResolutionHelper(helper);
    UpdateSupplierRequest submitted = new UpdateSupplierRequest();
    submitted.setVersion(1L);
    SupplierDto current = SupplierDto.builder().id(5L).version(2L).build();
    OptimisticLockConflictException exception =
        new OptimisticLockConflictException("Supplier", 5L, 1L, submitted, "changed");

    when(helper.normalizeEntityType("Supplier")).thenReturn("Supplier");
    when(helper.loadCurrentState("Supplier", 5L)).thenReturn(current);
    when(helper.extractVersion(current)).thenReturn(2L);

    ResponseEntity<OptimisticLockConflictResponse> response =
        handler.handleOptimisticLock(exception);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody())
        .usingRecursiveComparison()
        .isEqualTo(
            OptimisticLockConflictResponse.builder()
                .entityType("Supplier")
                .entityId(5L)
                .submittedVersion(1L)
                .currentVersion(2L)
                .currentState(current)
                .submittedState(submitted)
                .message("changed")
                .build());
  }

  @Test
  void handleOptimisticLock_extractsEntityDetailsWithoutHelper() {
    GlobalExceptionHandler handler = new GlobalExceptionHandler();
    OptimisticLockException exception =
        new OptimisticLockException("stale", null, new VersionedEntity());

    ResponseEntity<OptimisticLockConflictResponse> response =
        handler.handleOptimisticLock(exception);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody().getEntityType()).isEqualTo("VersionedEntity");
    assertThat(response.getBody().getEntityId()).isEqualTo(7L);
    assertThat(response.getBody().getCurrentState()).isNull();
    assertThat(response.getBody().getCurrentVersion()).isNull();
  }

  @Test
  void handleObjectOptimisticLock_normalizesClassNameAndNumericIdentifier() {
    GlobalExceptionHandler handler = new GlobalExceptionHandler();
    ConflictResolutionHelper helper = org.mockito.Mockito.mock(ConflictResolutionHelper.class);
    handler.setConflictResolutionHelper(helper);
    SupplierDto current = SupplierDto.builder().id(9L).version(4L).build();
    ObjectOptimisticLockingFailureException exception =
        new ObjectOptimisticLockingFailureException("org.psk.supplier.domain.Supplier", 9);

    when(helper.normalizeEntityType("org.psk.supplier.domain.Supplier")).thenReturn("Supplier");
    when(helper.loadCurrentState("Supplier", 9L)).thenReturn(current);
    when(helper.extractVersion(current)).thenReturn(4L);

    ResponseEntity<OptimisticLockConflictResponse> response =
        handler.handleObjectOptimisticLock(exception);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody().getEntityType()).isEqualTo("Supplier");
    assertThat(response.getBody().getEntityId()).isEqualTo(9L);
    assertThat(response.getBody().getCurrentVersion()).isEqualTo(4L);
  }

  private static class VersionedEntity {

    public Long getId() {
      return 7L;
    }
  }
}
