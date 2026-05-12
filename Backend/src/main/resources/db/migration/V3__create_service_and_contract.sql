CREATE TABLE contract
(
    id                BIGSERIAL    PRIMARY KEY,
    contract_number   VARCHAR(100) NOT NULL,
    title             VARCHAR(255) NOT NULL,
    start_date        DATE         NOT NULL,
    end_date          DATE         NOT NULL,
    status            VARCHAR(20)  NOT NULL,
    supplier_id       BIGINT       NOT NULL,
    opt_lock_version  BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT uk_contract_contract_number UNIQUE (contract_number),
    CONSTRAINT fk_contract_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id),
    CONSTRAINT chk_contract_date_range CHECK (end_date >= start_date)
);

CREATE TABLE supplier_service
(
    id                BIGSERIAL    PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    supplier_id       BIGINT       NOT NULL,
    contract_id       BIGINT,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opt_lock_version  BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT fk_supplier_service_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id),
    CONSTRAINT fk_supplier_service_contract FOREIGN KEY (contract_id) REFERENCES contract (id)
);

CREATE INDEX idx_contract_supplier_id ON contract (supplier_id);
CREATE INDEX idx_contract_number ON contract (contract_number);
CREATE INDEX idx_supplier_service_supplier_id ON supplier_service (supplier_id);
CREATE INDEX idx_supplier_service_contract_id ON supplier_service (contract_id);
