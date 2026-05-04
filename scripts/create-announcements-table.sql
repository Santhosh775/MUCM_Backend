-- Applicant-facing announcements (admin CRUD at /api/v1/announcements).
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    target_program_id UUID NULL,
    target_intake_id UUID NULL,
    target_pipeline_stage_key VARCHAR(120) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active_updated
    ON announcements (is_active, updated_at DESC)
    WHERE deleted_at IS NULL;
