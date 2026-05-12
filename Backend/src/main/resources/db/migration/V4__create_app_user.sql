CREATE TABLE app_user
(
    id                BIGSERIAL    PRIMARY KEY,
    username          VARCHAR(100) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    role              VARCHAR(20)  NOT NULL,
    enabled           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opt_lock_version  BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_app_user_username ON app_user (username);

INSERT INTO app_user (username, password_hash, role, enabled)
VALUES ('admin', '$2a$10$dO7C85XfNtGevKRPgiIQ3OeoDWb0m4neMZQzeZ6jLXyE4fuXClVSe', 'ADMIN', TRUE);

INSERT INTO app_user (username, password_hash, role, enabled)
VALUES ('user', '$2a$10$k0Gn6WSNwXfcuzCBk6rvOO3rWCssxITwd14f4T5rnIJZIfdO65WgO', 'USER', TRUE);
