-- Settings modules: programs/intakes constraints, pipeline UI fields, fee rules,
-- document requirement definitions, dropdown categories (run once on existing DBs).

-- Programs: allow same code per tenant; keep single-tenant uniqueness when tenant_id IS NULL
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_code_unique;
CREATE UNIQUE INDEX IF NOT EXISTS programs_tenant_code_uidx
  ON programs (tenant_id, code) WHERE deleted_at IS NULL AND tenant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS programs_code_null_tenant_uidx
  ON programs (code) WHERE deleted_at IS NULL AND tenant_id IS NULL;

-- Intakes: optional dates (admin UI allows blanks); status values Open | Planned | Closed
ALTER TABLE intakes ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE intakes ALTER COLUMN application_deadline DROP NOT NULL;
ALTER TABLE intakes ALTER COLUMN status SET DEFAULT 'Open';

-- Pipeline stages: UI fields + per-tenant stage_key uniqueness
ALTER TABLE pipeline_stages DROP CONSTRAINT IF EXISTS pipeline_stages_stage_key_unique;
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS active BOOLEAN NULL DEFAULT TRUE;
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS notification_template VARCHAR(500) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pipeline_stages_tenant_stage_uidx
  ON pipeline_stages (tenant_id, stage_key) WHERE deleted_at IS NULL AND tenant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pipeline_stages_stage_null_tenant_uidx
  ON pipeline_stages (stage_key) WHERE deleted_at IS NULL AND tenant_id IS NULL;

-- Fee structure (program + intake context; snapshots match admin UI free-text fields)
CREATE TABLE IF NOT EXISTS fee_structure_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id UUID NULL,
  program_id UUID NULL,
  intake_id UUID NULL,
  program_code VARCHAR(50) NOT NULL DEFAULT '',
  intake_name VARCHAR(100) NOT NULL DEFAULT '',
  fee_type VARCHAR(120) NOT NULL,
  amount_text VARCHAR(64) NOT NULL DEFAULT '0',
  amount_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  refund_policy TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS fee_structure_items_tenant_id_index ON fee_structure_items (tenant_id);
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_program_id_foreign;
ALTER TABLE fee_structure_items
  ADD CONSTRAINT fee_structure_items_program_id_foreign FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE SET NULL;
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_intake_id_foreign;
ALTER TABLE fee_structure_items
  ADD CONSTRAINT fee_structure_items_intake_id_foreign FOREIGN KEY (intake_id) REFERENCES intakes (id) ON DELETE SET NULL;
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_tenant_id_foreign;
ALTER TABLE fee_structure_items
  ADD CONSTRAINT fee_structure_items_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE SET NULL;

-- Portal document requirement definitions (settings; not per-application uploads)
CREATE TABLE IF NOT EXISTS settings_document_requirements (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id UUID NULL,
  name VARCHAR(500) NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  accepted_types VARCHAR(255) NOT NULL DEFAULT 'PDF',
  max_size_mb INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS settings_document_requirements_tenant_id_index ON settings_document_requirements (tenant_id);
ALTER TABLE settings_document_requirements DROP CONSTRAINT IF EXISTS settings_document_requirements_tenant_id_foreign;
ALTER TABLE settings_document_requirements
  ADD CONSTRAINT settings_document_requirements_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE SET NULL;

-- Dropdown categories (admin UI: category label, description, list of options)
CREATE TABLE IF NOT EXISTS dropdown_option_categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id UUID NULL,
  category VARCHAR(200) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS dropdown_option_categories_tenant_id_index ON dropdown_option_categories (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS dropdown_option_categories_tenant_label_uidx
  ON dropdown_option_categories (tenant_id, lower(category)) WHERE deleted_at IS NULL AND tenant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS dropdown_option_categories_label_null_tenant_uidx
  ON dropdown_option_categories (lower(category)) WHERE deleted_at IS NULL AND tenant_id IS NULL;
ALTER TABLE dropdown_option_categories DROP CONSTRAINT IF EXISTS dropdown_option_categories_tenant_id_foreign;
ALTER TABLE dropdown_option_categories
  ADD CONSTRAINT dropdown_option_categories_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS dropdown_option_values (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL,
  option_value VARCHAR(500) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS dropdown_option_values_category_id_index ON dropdown_option_values (category_id);
ALTER TABLE dropdown_option_values DROP CONSTRAINT IF EXISTS dropdown_option_values_category_id_foreign;
ALTER TABLE dropdown_option_values
  ADD CONSTRAINT dropdown_option_values_category_id_foreign FOREIGN KEY (category_id) REFERENCES dropdown_option_categories (id) ON DELETE CASCADE;
