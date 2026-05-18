package org.psk.common.conflict;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ForceOverwriteRequestTest {

  @Test
  void requireForceOverwrite_allowsExplicitTrue() {
    ForceOverwriteRequest request = new ForceOverwriteRequest();
    request.setForceOverwrite(true);

    assertThatCode(request::requireForceOverwrite).doesNotThrowAnyException();
  }

  @Test
  void requireForceOverwrite_rejectsMissingOrFalseFlag() {
    ForceOverwriteRequest request = new ForceOverwriteRequest();

    assertThatThrownBy(request::requireForceOverwrite)
        .isInstanceOf(ForceOverwriteRequiredException.class)
        .hasMessage("forceOverwrite must be true");

    request.setForceOverwrite(false);

    assertThatThrownBy(request::requireForceOverwrite)
        .isInstanceOf(ForceOverwriteRequiredException.class)
        .hasMessage("forceOverwrite must be true");
  }

  @Test
  void forceOverwriteRequiredException_keepsMessage() {
    ForceOverwriteRequiredException exception =
        new ForceOverwriteRequiredException("confirm overwrite");

    assertThat(exception).hasMessage("confirm overwrite");
  }
}
