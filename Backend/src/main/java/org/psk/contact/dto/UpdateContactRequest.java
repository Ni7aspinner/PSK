package org.psk.contact.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.psk.common.conflict.ForceOverwriteRequiredException;

@Data
@EqualsAndHashCode(callSuper = true)
public class UpdateContactRequest extends ContactRequest {

  @NotNull private Long version;

  private Boolean forceOverwrite;

  public void requireForceOverwrite() {
    if (!Boolean.TRUE.equals(forceOverwrite)) {
      throw new ForceOverwriteRequiredException("forceOverwrite must be true");
    }
  }
}
