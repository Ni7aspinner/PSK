

INSERT INTO supplier (name, registration_code, email, phone)
VALUES
  ('Amber Logistics', 'REG-2001', 'contact@amber-logistics.example', '+37060002001'),
  ('Baltic IT Solutions', 'REG-2002', 'contact@baltic-it.example', '+37060002002'),
  ('Nordic Facilities', 'REG-2003', 'contact@nordic-facilities.example', '+37060002003'),
  ('Vilnius Office Supply', 'REG-2004', 'contact@vilnius-office.example', '+37060002004'),
  ('Kaunas Maintenance', 'REG-2005', 'contact@kaunas-maintenance.example', '+37060002005'),
  ('Aquila Security', 'REG-2006', 'contact@aquila-security.example', '+37060002006'),
  ('Greenfield Catering', 'REG-2007', 'contact@greenfield-catering.example', '+37060002007'),
  ('Riverside Cleaning', 'REG-2008', 'contact@riverside-cleaning.example', '+37060002008'),
  ('Stonebridge Consulting', 'REG-2009', 'contact@stonebridge-consulting.example', '+37060002009'),
  ('Sunrise Telecom', 'REG-2010', 'contact@sunrise-telecom.example', '+37060002010'),
  ('Ironwood Construction', 'REG-2011', 'contact@ironwood-construction.example', '+37060002011'),
  ('Seaside Transport', 'REG-2012', 'contact@seaside-transport.example', '+37060002012'),
  ('Blue Oak Software', 'REG-2013', 'contact@blue-oak.example', '+37060002013'),
  ('Amberline Energy', 'REG-2014', 'contact@amberline-energy.example', '+37060002014'),
  ('Cobalt Repairs', 'REG-2015', 'contact@cobalt-repairs.example', '+37060002015'),
  ('Aurum Health Services', 'REG-2016', 'contact@aurum-health.example', '+37060002016'),
  ('Prisma Accounting', 'REG-2017', 'contact@prisma-accounting.example', '+37060002017'),
  ('Delta Security Systems', 'REG-2018', 'contact@delta-security.example', '+37060002018'),
  ('Lighthouse Training', 'REG-2019', 'contact@lighthouse-training.example', '+37060002019'),
  ('Clearwater Rentals', 'REG-2020', 'contact@clearwater-rentals.example', '+37060002020'),
  ('Forestline Waste', 'REG-2021', 'contact@forestline-waste.example', '+37060002021'),
  ('Silver Peak Printing', 'REG-2022', 'contact@silver-peak.example', '+37060002022'),
  ('Citywide Landscaping', 'REG-2023', 'contact@citywide-landscaping.example', '+37060002023'),
  ('Northgate Audits', 'REG-2024', 'contact@northgate-audits.example', '+37060002024'),
  ('Vertex Cloud', 'REG-2025', 'contact@vertex-cloud.example', '+37060002025');

INSERT INTO contract (contract_number, title, start_date, end_date, status, supplier_id)
SELECT
  'C-' || (2000 + gs)::text AS contract_number,
  'Service Agreement ' || (2000 + gs)::text AS title,
  CASE
    WHEN gs % 3 = 0 THEN DATE '2025-01-01' + (gs % 300)
    WHEN gs % 3 = 1 THEN DATE '2022-01-01' + (gs % 300)
    ELSE DATE '2023-01-01' + (gs % 300)
  END AS start_date,
  CASE
    WHEN gs % 3 = 0 THEN DATE '2026-01-01' + (gs % 300)
    WHEN gs % 3 = 1 THEN DATE '2023-01-01' + (gs % 200)
    ELSE DATE '2024-01-01' + (gs % 200)
  END AS end_date,
  CASE
    WHEN gs % 3 = 0 THEN 'ACTIVE'
    WHEN gs % 3 = 1 THEN 'EXPIRED'
    ELSE 'TERMINATED'
  END AS status,
  (SELECT id
   FROM supplier
   WHERE registration_code = 'REG-' || (2000 + ((gs - 1) % 25) + 1)::text)
FROM generate_series(1, 200) AS gs;


INSERT INTO supplier_service (name, description, active, supplier_id, contract_id)
SELECT
  'Service Package ' || (2000 + gs)::text,
  'Service package for contract C-' || (2000 + gs)::text,
  CASE WHEN gs % 5 = 0 THEN FALSE ELSE TRUE END,
  c.supplier_id,
  c.id
FROM generate_series(1, 150) AS gs
JOIN contract c ON c.contract_number = 'C-' || (2000 + gs)::text;


WITH supplier_seed AS (
  SELECT s.*, regexp_replace(s.registration_code, '\D', '', 'g') AS reg_digits
  FROM supplier s
  WHERE s.registration_code LIKE 'REG-20%'
)
INSERT INTO contact_person
  (first_name, last_name, position, email, phone, "primary", supplier_id)
SELECT
  (ARRAY['Aiste', 'Tomas', 'Rasa', 'Mantas', 'Egle', 'Lina', 'Paulius', 'Ieva', 'Justas', 'Greta'])[(s.id % 10) + 1],
  (ARRAY['Kazlauskas', 'Petrauskas', 'Jankauskas', 'Vaitkus', 'Zukauskas', 'Sabaliauskas', 'Norkus', 'Stankevicius', 'Pocius', 'Urbonas'])[(s.id % 10) + 1],
  'Account Manager',
  lower(replace(s.name, ' ', '.')) || '@contacts.example',
  '+3706' || lpad(s.reg_digits, 6, '0'),
  TRUE,
  s.id
FROM supplier_seed s;

WITH supplier_seed AS (
  SELECT s.*, regexp_replace(s.registration_code, '\D', '', 'g') AS reg_digits
  FROM supplier s
  WHERE s.registration_code LIKE 'REG-20%'
)
INSERT INTO contact_person
  (first_name, last_name, position, email, phone, "primary", supplier_id)
SELECT
  (ARRAY['Rokas', 'Ieva', 'Simonas', 'Giedre', 'Darius', 'Jurga', 'Saulius', 'Vita', 'Andrius', 'Milda'])[(s.id % 10) + 1],
  (ARRAY['Kavaliauskas', 'Balciunas', 'Mikalauskas', 'Juodaitis', 'Pavardenis', 'Marciulionis', 'Rimkus', 'Zemaitis', 'Sadauskas', 'Navickas'])[(s.id % 10) + 1],
  'Service Lead',
  lower(replace(s.name, ' ', '.')) || '.service@contacts.example',
  '+3706' || lpad((s.reg_digits::int + 5000)::text, 6, '0'),
  FALSE,
  s.id
FROM supplier_seed s
WHERE (s.id % 2) = 0;


INSERT INTO app_user (username, password_hash, role, enabled)
SELECT
  'staff' || lpad(gs::text, 2, '0'),
  '$2a$10$k0Gn6WSNwXfcuzCBk6rvOO3rWCssxITwd14f4T5rnIJZIfdO65WgO',
  'USER',
  TRUE
FROM generate_series(1, 20) AS gs;
