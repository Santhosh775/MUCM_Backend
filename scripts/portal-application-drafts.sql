CREATE TABLE IF NOT EXISTS portal_application_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    application_id UUID NULL,
    form_values JSONB NULL,
    current_step_index INTEGER NOT NULL DEFAULT 0,
    saved_from_action VARCHAR(50) NULL,
    saved_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS portal_application_drafts_user_application_unique
ON portal_application_drafts (user_id, application_id);

CREATE INDEX IF NOT EXISTS portal_application_drafts_user_id_index
ON portal_application_drafts (user_id);

CREATE INDEX IF NOT EXISTS portal_application_drafts_application_id_index
ON portal_application_drafts (application_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'portal_application_drafts_user_id_foreign'
    ) THEN
        ALTER TABLE portal_application_drafts
        ADD CONSTRAINT portal_application_drafts_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES application_users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'portal_application_drafts_application_id_foreign'
    ) THEN
        ALTER TABLE portal_application_drafts
        ADD CONSTRAINT portal_application_drafts_application_id_foreign
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
    END IF;
END $$;
