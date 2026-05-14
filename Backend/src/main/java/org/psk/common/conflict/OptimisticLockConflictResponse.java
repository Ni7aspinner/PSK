package org.psk.common.conflict;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimisticLockConflictResponse {

  private String entityType;
  private Long entityId;
  private Long submittedVersion;
  private Long currentVersion;
  private Object currentState;
  private Object submittedState;
  private String message;
}
