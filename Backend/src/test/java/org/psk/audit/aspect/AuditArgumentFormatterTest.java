package org.psk.audit.aspect;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;
import org.psk.audit.annotation.Audited;

class AuditArgumentFormatterTest {

  private final AuditArgumentFormatter formatter = new AuditArgumentFormatter();

  @Test
  void format_includesSafeScalarsAndEntityIdsOnly() throws Exception {
    Method method =
        SampleMethods.class.getDeclaredMethod(
            "mixedArgs", Long.class, String.class, EntityArg.class, RequestArg.class);

    String formatted =
        formatter.format(
            method, new Object[] {10L, "code-1", new EntityArg(5L), new RequestArg("hidden")});

    assertThat(formatted).contains("10", "code-1", "EntityArg#5");
    assertThat(formatted).doesNotContain("hidden");
  }

  @Test
  void format_excludesSensitiveArguments() throws Exception {
    Method method =
        SampleMethods.class.getDeclaredMethod(
            "sensitiveArgs", String.class, PasswordCredential.class);

    String formatted =
        formatter.format(method, new Object[] {"raw-password", new PasswordCredential()});

    assertThat(formatted).isEmpty();
  }

  @Test
  void format_includesAuditedNonScalarTypeNameWithoutBody() throws Exception {
    Method method = SampleMethods.class.getDeclaredMethod("auditedArg", RequestArg.class);

    String formatted = formatter.format(method, new Object[] {new RequestArg("body")});

    assertThat(formatted).contains("RequestArg");
    assertThat(formatted).doesNotContain("body");
  }

  static class SampleMethods {

    void mixedArgs(Long id, String code, EntityArg entity, RequestArg request) {}

    void sensitiveArgs(String password, PasswordCredential credentials) {}

    void auditedArg(@Audited RequestArg request) {}
  }

  record EntityArg(Long id) {

    public Long getId() {
      return id;
    }
  }

  record RequestArg(String value) {}

  static class PasswordCredential {}
}
