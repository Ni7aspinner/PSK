CREATE TABLE supplier
(
    id                BIGSERIAL    PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    registration_code VARCHAR(50)  NOT NULL UNIQUE,
    email             VARCHAR(255),
    phone             VARCHAR(50),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opt_lock_version  BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_supplier_name ON supplier (name);
