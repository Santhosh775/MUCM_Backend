-- PostgreSQL: portal application draft columns on application_users
ALTER TABLE application_users ADD COLUMN IF NOT EXISTS portal_form_draft JSONB;
ALTER TABLE application_users ADD COLUMN IF NOT EXISTS portal_draft_step_index INTEGER;
ALTER TABLE application_users ADD COLUMN IF NOT EXISTS portal_draft_updated_at TIMESTAMP WITH TIME ZONE;
