package org.psk.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.psk.audit.domain.AuditLog;
import org.psk.audit.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogWriter {

  private final AuditLogRepository auditLogRepository;

  @Async("auditExecutor")
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void persist(AuditLog auditLog) {
    try {
      auditLogRepository.save(auditLog);
    } catch (RuntimeException ex) {
      log.warn("Failed to persist audit log entry", ex);
    }
  }
}
