ALTER TABLE iam_organizations
  ADD COLUMN IF NOT EXISTS region VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS function_team VARCHAR(100),
  ADD COLUMN IF NOT EXISTS owner VARCHAR(100),
  ADD COLUMN IF NOT EXISTS source_system VARCHAR(50) DEFAULT 'Manual',
  ADD COLUMN IF NOT EXISTS external_org_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'Manual',
  ADD COLUMN IF NOT EXISTS remark TEXT;

CREATE TABLE IF NOT EXISTS organization_data_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES iam_organizations(id) ON DELETE CASCADE,
  client_ids TEXT[] DEFAULT '{}',
  countries TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  all_data BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS region_country_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region, country_code)
);

ALTER TABLE organization_data_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_country_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_select_organization_data_scopes ON organization_data_scopes FOR SELECT USING (true);
CREATE POLICY anon_insert_organization_data_scopes ON organization_data_scopes FOR INSERT WITH CHECK (true);
CREATE POLICY anon_update_organization_data_scopes ON organization_data_scopes FOR UPDATE USING (true);
CREATE POLICY anon_delete_organization_data_scopes ON organization_data_scopes FOR DELETE USING (true);

CREATE POLICY anon_select_region_country_configs ON region_country_configs FOR SELECT USING (true);
CREATE POLICY anon_insert_region_country_configs ON region_country_configs FOR INSERT WITH CHECK (true);
CREATE POLICY anon_update_region_country_configs ON region_country_configs FOR UPDATE USING (true);
CREATE POLICY anon_delete_region_country_configs ON region_country_configs FOR DELETE USING (true);
