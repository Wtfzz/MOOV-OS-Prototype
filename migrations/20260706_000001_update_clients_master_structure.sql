-- Client master data single-table structure.
-- Based on Client_Master_Data_Single_Table.docx.

CREATE SEQUENCE IF NOT EXISTS clients_client_id_seq START WITH 10001;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS client_id BIGINT,
  ADD COLUMN IF NOT EXISTS client_type VARCHAR(20) NOT NULL DEFAULT 'Global',
  ADD COLUMN IF NOT EXISTS operational_country CHAR(2),
  ADD COLUMN IF NOT EXISTS industry_sector VARCHAR(50),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS invoice_legal_entity VARCHAR(50) NOT NULL DEFAULT 'NL',
  ADD COLUMN IF NOT EXISTS invoice_currency CHAR(3) NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(30),
  ADD COLUMN IF NOT EXISTS tax_registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS invoice_format VARCHAR(20),
  ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(18,4),
  ADD COLUMN IF NOT EXISTS discount_profile VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50) DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE clients
SET
  client_id = COALESCE(client_id, nextval('clients_client_id_seq')),
  client_code = upper(client_code),
  contact_phone = COALESCE(contact_phone, phone),
  client_type = COALESCE(client_type, 'Global'),
  status = COALESCE(status, CASE WHEN active IS FALSE THEN 'Inactive' ELSE 'Active' END),
  invoice_legal_entity = COALESCE(invoice_legal_entity, 'NL'),
  invoice_currency = COALESCE(invoice_currency, 'EUR'),
  created_by = COALESCE(created_by, 'system'),
  updated_by = COALESCE(updated_by, 'system')
WHERE client_id IS NULL
   OR contact_phone IS NULL
   OR client_code <> upper(client_code)
   OR client_type IS NULL
   OR status IS NULL
   OR invoice_legal_entity IS NULL
   OR invoice_currency IS NULL
   OR created_by IS NULL
   OR updated_by IS NULL;

SELECT setval('clients_client_id_seq', GREATEST((SELECT COALESCE(MAX(client_id), 10000) FROM clients), 10000), true);

ALTER TABLE clients
  ALTER COLUMN client_id SET DEFAULT nextval('clients_client_id_seq'),
  ALTER COLUMN client_id SET NOT NULL,
  ALTER COLUMN client_code TYPE VARCHAR(20),
  ALTER COLUMN client_name TYPE VARCHAR(100),
  ALTER COLUMN address_line1 TYPE VARCHAR(255),
  ALTER COLUMN address_line2 TYPE VARCHAR(255),
  ALTER COLUMN city TYPE VARCHAR(50),
  ALTER COLUMN state_province TYPE VARCHAR(30),
  ALTER COLUMN postal_code TYPE VARCHAR(20),
  ALTER COLUMN country TYPE CHAR(2),
  ALTER COLUMN contact_person TYPE VARCHAR(100),
  ALTER COLUMN contact_email TYPE VARCHAR(100);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_client_id_key') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_client_id_key UNIQUE (client_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_client_code_format_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_client_code_format_chk CHECK (client_code = upper(client_code) AND client_code ~ '^[A-Z0-9-]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_client_type_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_client_type_chk CHECK (client_type IN ('Global', 'Country'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_operational_country_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_operational_country_chk CHECK (
      (client_type = 'Country' AND operational_country IS NOT NULL AND operational_country ~ '^[A-Z]{2}$')
      OR (client_type = 'Global')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_status_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_status_chk CHECK (status IN ('Active', 'Inactive', 'Prospect', 'On Hold'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_invoice_currency_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_invoice_currency_chk CHECK (invoice_currency ~ '^[A-Z]{3}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_address_country_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_address_country_chk CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_contact_email_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_contact_email_chk CHECK (contact_email IS NULL OR contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_contact_phone_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_contact_phone_chk CHECK (contact_phone IS NULL OR contact_phone ~ '^[+()0-9 -]{1,20}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_credit_limit_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_credit_limit_chk CHECK (credit_limit IS NULL OR credit_limit >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_timezone_chk') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_timezone_chk CHECK (timezone IS NULL OR timezone ~ '^[A-Za-z_]+/[A-Za-z_]+(/[A-Za-z_]+)?$');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION validate_clients_master()
RETURNS trigger AS $$
BEGIN
  NEW.client_code := upper(NEW.client_code);
  NEW.updated_at := now();

  IF TG_OP = 'INSERT' THEN
    NEW.created_at := COALESCE(NEW.created_at, now());
    NEW.created_by := COALESCE(NEW.created_by, 'system');
    NEW.updated_by := COALESCE(NEW.updated_by, NEW.created_by, 'system');
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    NEW.updated_by := COALESCE(NEW.updated_by, OLD.updated_by, 'system');
    IF NEW.client_id <> OLD.client_id THEN
      RAISE EXCEPTION 'Client ID is immutable';
    END IF;
    IF NEW.client_code <> OLD.client_code THEN
      RAISE EXCEPTION 'Client Code is immutable';
    END IF;
    IF OLD.status = 'Active' AND NEW.status NOT IN ('Active', 'On Hold', 'Inactive') THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
    IF OLD.status = 'On Hold' AND NEW.status NOT IN ('On Hold', 'Active', 'Inactive') THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
    IF OLD.status = 'Prospect' AND NEW.status NOT IN ('Prospect', 'Active', 'On Hold', 'Inactive') THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_clients_master ON clients;
CREATE TRIGGER trg_validate_clients_master
BEFORE INSERT OR UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION validate_clients_master();
