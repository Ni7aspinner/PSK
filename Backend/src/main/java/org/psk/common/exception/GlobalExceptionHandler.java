package org.psk.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.psk.contract.exception.ContractNotFoundException;
import org.psk.contract.exception.ContractNumberDuplicateException;
import org.psk.contract.exception.InvalidContractDateRangeException;
import org.psk.security.exception.UsernameAlreadyExistsException;
import org.psk.service.exception.ServiceContractSupplierMismatchException;
import org.psk.service.exception.ServiceNotFoundException;
import org.psk.supplier.exception.DuplicateSupplierException;
import org.psk.supplier.exception.SupplierNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler({
    SupplierNotFoundException.class,
    ServiceNotFoundException.class,
    ContractNotFoundException.class
  })
  public ResponseEntity<Map<String, Object>> handleNotFound(
      RuntimeException ex, HttpServletRequest request) {
    return error(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler({
    DuplicateSupplierException.class,
    ContractNumberDuplicateException.class,
    UsernameAlreadyExistsException.class
  })
  public ResponseEntity<Map<String, Object>> handleConflict(
      RuntimeException ex, HttpServletRequest request) {
    return error(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler({
    InvalidContractDateRangeException.class,
    ServiceContractSupplierMismatchException.class
  })
  public ResponseEntity<Map<String, Object>> handleBusinessRuleViolation(
      RuntimeException ex, HttpServletRequest request) {
    return error(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleBadCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", "Invalid credentials"));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<Map<String, Object>> handleAuthentication(
      AuthenticationException ex, HttpServletRequest request) {
    return error(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(
      AccessDeniedException ex, HttpServletRequest request) {
    return error(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<Map<String, String>> fieldErrors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> Map.of("field", fe.getField(), "message", message(fe)))
            .toList();
    Map<String, Object> body =
        body(HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI());
    body.put("fieldErrors", fieldErrors);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneral(
      Exception ex, HttpServletRequest request) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getRequestURI());
  }

  private ResponseEntity<Map<String, Object>> error(
      HttpStatus status, String message, String path) {
    return ResponseEntity.status(status).body(body(status, message, path));
  }

  private Map<String, Object> body(HttpStatus status, String message, String path) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("timestamp", Instant.now().toString());
    m.put("status", status.value());
    m.put("error", status.getReasonPhrase());
    m.put("message", message);
    m.put("path", path);
    return m;
  }

  private String message(FieldError fe) {
    return fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value";
  }
}
