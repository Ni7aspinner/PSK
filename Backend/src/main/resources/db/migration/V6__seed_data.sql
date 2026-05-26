INSERT INTO temp_data (name) VALUES ('EEEEE');
INSERT INTO temp_data (name) VALUES ('FFFFF');
INSERT INTO temp_data (name) VALUES ('GGGGG');

INSERT INTO supplier (name, registration_code, email, phone)
VALUES ('Acme Supplies', 'REG-1001', 'contact@acme.example', '+37060000001');
INSERT INTO supplier (name, registration_code, email, phone)
VALUES ('Baltic Services', 'REG-1002', 'info@baltic.example', '+37060000002');
INSERT INTO supplier (name, registration_code, email, phone)
VALUES ('Nordic Partners', 'REG-1003', 'hello@nordic.example', '+37060000003');

INSERT INTO contract (contract_number, title, start_date, end_date, status, supplier_id)
VALUES (
    'C-1001',
    'Office Supplies 2025',
    '2025-01-01',
    '2025-12-31',
    'ACTIVE',
    (SELECT id FROM supplier WHERE registration_code = 'REG-1001')
);
INSERT INTO contract (contract_number, title, start_date, end_date, status, supplier_id)
VALUES (
    'C-1002',
    'IT Support 2025',
    '2025-02-01',
    '2025-11-30',
    'ACTIVE',
    (SELECT id FROM supplier WHERE registration_code = 'REG-1002')
);
INSERT INTO contract (contract_number, title, start_date, end_date, status, supplier_id)
VALUES (
    'C-1003',
    'Facility Maintenance 2025',
    '2025-03-01',
    '2025-12-31',
    'ACTIVE',
    (SELECT id FROM supplier WHERE registration_code = 'REG-1003')
);

INSERT INTO supplier_service (name, description, active, supplier_id, contract_id)
VALUES (
    'Stationery Supply',
    'Monthly stationery deliveries',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1001'),
    (SELECT id FROM contract WHERE contract_number = 'C-1001')
);
INSERT INTO supplier_service (name, description, active, supplier_id, contract_id)
VALUES (
    'Helpdesk Support',
    'Remote support for employees',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1002'),
    (SELECT id FROM contract WHERE contract_number = 'C-1002')
);
INSERT INTO supplier_service (name, description, active, supplier_id, contract_id)
VALUES (
    'Building Maintenance',
    'Quarterly building inspections',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1003'),
    (SELECT id FROM contract WHERE contract_number = 'C-1003')
);

INSERT INTO app_user (username, password_hash, role, enabled)
VALUES ('manager', '$2a$10$k0Gn6WSNwXfcuzCBk6rvOO3rWCssxITwd14f4T5rnIJZIfdO65WgO', 'USER', TRUE);

INSERT INTO contact_person (first_name, last_name, position, email, phone, "primary", supplier_id)
VALUES (
    'Aiste',
    'Kazlauskiene',
    'Account Manager',
    'aiste.kazlauskiene@acme.example',
    '+37060001001',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1001')
);
INSERT INTO contact_person (first_name, last_name, position, email, phone, "primary", supplier_id)
VALUES (
    'Tomas',
    'Petrauskas',
    'Service Lead',
    'tomas.petrauskas@baltic.example',
    '+37060001002',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1002')
);
INSERT INTO contact_person (first_name, last_name, position, email, phone, "primary", supplier_id)
VALUES (
    'Rasa',
    'Jankauskaite',
    'Operations Manager',
    'rasa.jankauskaite@nordic.example',
    '+37060001003',
    TRUE,
    (SELECT id FROM supplier WHERE registration_code = 'REG-1003')
);

