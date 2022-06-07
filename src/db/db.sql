ALTER SEQUENCE drivers_id_seq RESTART WITH 1

/* -------------------------------------------------------------------------- */

CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  registered_on TIMESTAMPTZ NOT NULL,
  registered_with VARCHAR(6) NOT NULL, -- (local, google)
  accumulated_time INTEGER DEFAULT 0
)

/* -------------------------------------------------------------------------- */

CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  password_changed BOOLEAN NOT NULL
)

INSERT INTO admins(first_name, last_name, display_name, email, password, password_changed) VALUES('Konstantinos', 'Panos', 'Konstantinos Panos', 'kpanos@upark.com', 'kp1234', false)
/* -------------------------------------------------------------------------- */

CREATE TABLE inspectors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  password_changed BOOLEAN NOT NULL
)

/* -------------------------------------------------------------------------- */

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  license_plate VARCHAR(10) NOT NULL,
  driver_id INT,
  CONSTRAINT fk_driver
    FOREIGN KEY(driver_id) 
      REFERENCES drivers(id)
      ON DELETE CASCADE
)

/* -------------------------------------------------------------------------- */

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  available INT,
  occupied INT,
  position NUMERIC[]
)

INSERT INTO 
addresses(name, available, occupied, position)
VALUES
('Λεωνίδου 8-14', 8, 0, ARRAY [38.899054710586164, 22.436231155587485]),
('Όθωνος 4-14', 16, 0, ARRAY [38.90147594258852, 22.4344295819291]),
('Όθωνος 14-24', 16, 0, ARRAY [38.90125253411168, 22.435539599976444]),
('Όθωνος 24-32', 12, 0, ARRAY [38.901025702087644, 22.43668047887059]),
('Χατζοπούλου 1-5', 10, 0, ARRAY [38.89951847360332, 22.435043861994966]),
('Χατζοπούλου 2-6,5-13', 16, 0, ARRAY [38.89923681669934, 22.43441734896569]);

/* -------------------------------------------------------------------------- */

CREATE TABLE active_cards (
  id SERIAL PRIMARY KEY,
  license_plate VARCHAR(10) NOT NULL,
  vehicle_name VARCHAR(50) NOT NULL,
  duration NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  driver_id INT NOT NULL,
  address_id INT NOT NULL,
  CONSTRAINT fk_driver
    FOREIGN KEY(driver_id) 
      REFERENCES drivers(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_address
    FOREIGN KEY(address_id) 
      REFERENCES addresses(id)
      ON DELETE CASCADE
);

INSERT INTO active_cards
SELECT * FROM json_populate_recordset(NULL::active_cards,
  '');
  
CREATE TABLE inactive_cards (
  id SERIAL PRIMARY KEY,
  license_plate VARCHAR(10) NOT NULL,
  vehicle_name VARCHAR(50) NOT NULL,
  duration NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  expired BOOLEAN NOT NULL,
  cancelled BOOLEAN NOT NULL,
  driver_id INT NOT NULL,
  address_id INT NOT NULL,
  CONSTRAINT fk_driver
    FOREIGN KEY(driver_id) 
      REFERENCES drivers(id),
  CONSTRAINT fk_address
    FOREIGN KEY(address_id) 
      REFERENCES addresses(id)
);

/* -------------------------------------------------------------------------- */

CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  amount NUMERIC NOT NULL,
  datetime TIMESTAMPTZ NOT NULL
);

/* -------------------------------------------------------------------------- */

WITH new_card AS (
  INSERT INTO active_cards(
    license_plate, vehicle_name, duration, 
    cost, starts_at, expires_at, driver_id, 
    address_id
  ) 
  VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
) 
UPDATE 
  addresses 
SET 
  occupied = occupied + 1 
WHERE 
  addresses.id = (SELECT address_id FROM new_card)

/* -------------------------------------------------------------------------- */

WITH inactive AS (
  DELETE FROM 
    active_cards 
  WHERE 
    expires_at < NOW() RETURNING *
) INSERT INTO inactive_cards(
  license_plate, vehicle_name, duration, 
  cost, starts_at, expires_at, driver_id, 
  address_id
) 
SELECT 
  license_plate, 
  vehicle_name, 
  duration, 
  cost, 
  starts_at, 
  expires_at, 
  driver_id, 
  address_id 
FROM 
  inactive;

/* -------------------------------------------------------------------------- */

UPDATE 
  addresses 
SET 
  occupied = t.occupied 
FROM 
  (
    SELECT 
      addresses.id, 
      COALESCE(tmp.counter, 0) as occupied 
    FROM 
      addresses 
      LEFT JOIN (
        SELECT 
          address_id, 
          count(*) as counter 
        FROM 
          active_cards
        GROUP BY 
          address_id
      ) tmp ON addresses.id = tmp.address_id
  ) t 
WHERE 
  addresses.id = t.id

/* -------------------------------------------------------------------------- */

SELECT 
  active_cards.id, 
  addresses.name, 
  active_cards.license_plate, 
  active_cards.vehicle_name, 
  active_cards.starts_at, 
  active_cards.expires_at 
FROM 
  active_cards 
  JOIN addresses ON active_cards.address_id = addresses.id 
WHERE 
  driver_id = $1 
ORDER BY 
  id DESC

/* -------------------------------------------------------------------------- */

WITH cancelled AS (
  DELETE FROM 
    active_cards 
  WHERE 
    id = 13 RETURNING *
), 
insert_cancelled AS (
  INSERT INTO inactive_cards(
    license_plate, vehicle_name, duration, 
    cost, starts_at, expires_at, expired, 
    cancelled, driver_id, address_id
  ) 
  SELECT 
    license_plate, 
    vehicle_name, 
    duration, 
    cost, 
    starts_at, 
    expires_at, 
    false as expired, 
    true as cancelled, 
    driver_id, 
    address_id 
  FROM 
    cancelled RETURNING *
) 
UPDATE 
  drivers 
SET 
  accumulated_time = accumulated_time + 37 
WHERE 
  id = 1



