package org.psk.common.conflict;

import lombok.Data;

@Data
public class ForceOverwriteRequest {

  private Boolean forceOverwrite;

  public void requireForceOverwrite() {
    if (!Boolean.TRUE.equals(forceOverwrite)) {
      throw new ForceOverwriteRequiredException("forceOverwrite must be true");
    }
  }
}
