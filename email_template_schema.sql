-- Email templates for admin communications (PostgreSQL).
-- Tables are also ensured at startup via utils/ensureEmailTemplateSchema.js when sync runs.

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Other',
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    merge_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_templates_deleted_at ON email_templates (deleted_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates (category);
