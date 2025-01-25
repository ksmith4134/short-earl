CREATE DATABASE short_earl;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CREATE TYPE BROWSER as ENUM('Chrome', 'Firefox', 'Edge', 'Safari', 'Other', 'Unknown');
-- CREATE TYPE DEVICE as ENUM('Desktop', 'Mobile', 'Tablet', 'Other', 'Unknown');

CREATE OR REPLACE FUNCTION update_modified_at()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.modified_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slugs (
  slug_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  url VARCHAR(255),
  slugHash VARCHAR(12),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logging (
  logging_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  slug_id UUID NOT NULL,
  browser VARCHAR(25),
  device VARCHAR(25),
  os VARCHAR(25),
  cpu VARCHAR(25),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slug FOREIGN KEY (slug_id) REFERENCES slugs(slug_id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER user_modified
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_at();

CREATE OR REPLACE TRIGGER slug_modified
BEFORE UPDATE ON slugs
FOR EACH ROW
EXECUTE FUNCTION update_modified_at();

CREATE OR REPLACE TRIGGER logging_modified
BEFORE UPDATE ON logging
FOR EACH ROW
EXECUTE FUNCTION update_modified_at();