package org.psk.audit.aspect;

import java.time.Duration;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.psk.audit.domain.AuditLog;
import org.psk.audit.service.AuditLogWriter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.audit.enabled", havingValue = "true", matchIfMissing = true)
public class BusinessLogicAuditAspect {

  private static final String SUCCESS = "SUCCESS";
  private static final String FAILURE = "FAILURE";
  private static final String ANONYMOUS = "anonymous";
  private static final String ANONYMOUS_ROLE = "ANONYMOUS";

  private final AuditLogWriter auditLogWriter;
  private final AuditArgumentFormatter auditArgumentFormatter;

  @Pointcut(
      "(execution(* org.psk..service..*(..))"
          + " || execution(* org.psk.contact.*Service.*(..))"
          + " || execution(* org.psk.contract.*Service.*(..))"
          + " || execution(* org.psk.service.*Service.*(..))"
          + " || execution(* org.psk.supplier.*Service.*(..)))"
          + " && !execution(* org.psk.audit..*(..))")
  void businessLogic() {}

  @Around("businessLogic()")
  public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
    Instant startedAt = Instant.now();
    try {
      Object result = joinPoint.proceed();
      write(joinPoint, startedAt, SUCCESS, null);
      return result;
    } catch (Throwable ex) {
      write(joinPoint, startedAt, FAILURE, ex.getMessage());
      throw ex;
    }
  }

  private void write(
      ProceedingJoinPoint joinPoint, Instant startedAt, String outcome, String errorMessage) {
    AuditLog auditLog = new AuditLog();
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    auditLog.setOccurredAt(startedAt);
    auditLog.setUsername(username());
    auditLog.setRoles(roles());
    auditLog.setClassName(signature.getDeclaringTypeName());
    auditLog.setMethodName(signature.getName());
    auditLog.setArguments(
        auditArgumentFormatter.format(signature.getMethod(), joinPoint.getArgs()));
    auditLog.setOutcome(outcome);
    auditLog.setErrorMessage(errorMessage);
    auditLog.setDurationMs(Duration.between(startedAt, Instant.now()).toMillis());
    auditLogWriter.persist(auditLog);
  }

  private String username() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) {
      return ANONYMOUS;
    }
    return authentication.getName();
  }

  private String roles() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null
        || authentication.getAuthorities() == null
        || authentication.getAuthorities().isEmpty()) {
      return ANONYMOUS_ROLE;
    }
    return authentication.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .sorted()
        .collect(Collectors.joining(","));
  }
}
