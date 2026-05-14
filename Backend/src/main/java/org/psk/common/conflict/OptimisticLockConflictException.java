package org.psk.common.conflict;

import jakarta.persistence.OptimisticLockException;
import lombok.Getter;

@Getter
public class OptimisticLockConflictException extends OptimisticLockException {

  private final String entityType;
  private final Long entityId;
  private final Long submittedVersion;
  private final Object submittedState;

  public OptimisticLockConflictException(
      String entityType,
      Long entityId,
      Long submittedVersion,
      Object submittedState,
      String message) {
    super(message);
    this.entityType = entityType;
    this.entityId = entityId;
    this.submittedVersion = submittedVersion;
    this.submittedState = submittedState;
  }
}
