CREATE TABLE audit_log
(
    id            BIGSERIAL    PRIMARY KEY,
    occurred_at   TIMESTAMPTZ  NOT NULL,
    username      VARCHAR(255),
    roles         VARCHAR(255),
    class_name    VARCHAR(255) NOT NULL,
    method_name   VARCHAR(255) NOT NULL,
    arguments     TEXT,
    outcome       VARCHAR(20)  NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE')),
    error_message TEXT,
    duration_ms   BIGINT
);

CREATE INDEX idx_audit_log_occurred_at ON audit_log (occurred_at);
CREATE INDEX idx_audit_log_class_method ON audit_log (class_name, method_name);
