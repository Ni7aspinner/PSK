package org.psk.audit.aspect;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;
import org.psk.audit.annotation.Audited;
import org.springframework.stereotype.Component;

@Component
class AuditArgumentFormatter {

  String format(Method method, Object[] args) {
    Parameter[] parameters = method.getParameters();
    List<String> values = new ArrayList<>();
    for (int index = 0; index < args.length; index++) {
      Parameter parameter = index < parameters.length ? parameters[index] : null;
      Object arg = args[index];
      if (isSensitive(parameter, arg)) {
        continue;
      }

      boolean audited = parameter != null && parameter.isAnnotationPresent(Audited.class);
      String value = formatArgument(arg, audited);
      if (value != null) {
        values.add(parameterName(parameter, index) + "=" + value);
      }
    }
    return String.join(", ", values);
  }

  private boolean isSensitive(Parameter parameter, Object arg) {
    String typeName = arg != null ? arg.getClass().getSimpleName() : "";
    String parameterName = parameter != null ? parameter.getName() : "";
    String parameterTypeName = parameter != null ? parameter.getType().getSimpleName() : "";
    return containsSensitiveWord(typeName)
        || containsSensitiveWord(parameterName)
        || containsSensitiveWord(parameterTypeName);
  }

  private boolean containsSensitiveWord(String value) {
    String lower = value.toLowerCase();
    return lower.contains("password") || lower.contains("credential");
  }

  private String formatArgument(Object arg, boolean audited) {
    if (arg == null) {
      return audited ? "null" : null;
    }
    if (isSafeScalar(arg)) {
      return String.valueOf(arg);
    }

    Object id = entityId(arg);
    if (id != null) {
      return arg.getClass().getSimpleName() + "#" + id;
    }
    return audited ? arg.getClass().getSimpleName() : null;
  }

  private boolean isSafeScalar(Object arg) {
    return arg instanceof String
        || arg instanceof Number
        || arg instanceof Boolean
        || arg instanceof Character
        || arg.getClass().isPrimitive();
  }

  private Object entityId(Object arg) {
    try {
      Method getId = arg.getClass().getMethod("getId");
      if (getId.getParameterCount() == 0) {
        return getId.invoke(arg);
      }
    } catch (ReflectiveOperationException ex) {
      return null;
    }
    return null;
  }

  private String parameterName(Parameter parameter, int index) {
    if (parameter == null || parameter.getName().startsWith("arg")) {
      return "arg" + index;
    }
    return parameter.getName();
  }
}
