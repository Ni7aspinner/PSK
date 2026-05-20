CREATE TABLE contact_person
(
    id                BIGSERIAL    PRIMARY KEY,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    position          VARCHAR(150),
    email             VARCHAR(255),
    phone             VARCHAR(50),
    "primary"         BOOLEAN      NOT NULL DEFAULT FALSE,
    supplier_id       BIGINT       NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opt_lock_version  BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT fk_contact_person_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id)
);

CREATE INDEX idx_contact_person_supplier_id ON contact_person (supplier_id);
CREATE INDEX idx_contact_person_email ON contact_person (email);
CREATE UNIQUE INDEX idx_one_primary_per_supplier ON contact_person (supplier_id) WHERE "primary" = TRUE;
