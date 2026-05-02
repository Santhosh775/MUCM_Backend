-- Run on PostgreSQL before enabling the new support ticket modules in production.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS support_ticket_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE support_tickets
    ADD COLUMN IF NOT EXISTS category_id UUID NULL,
    ADD COLUMN IF NOT EXISTS admin_reply_message TEXT NULL,
    ADD COLUMN IF NOT EXISTS admin_replied_at TIMESTAMP NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'support_tickets_category_id_fkey'
          AND table_name = 'support_tickets'
    ) THEN
        ALTER TABLE support_tickets
            ADD CONSTRAINT support_tickets_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES support_ticket_categories(id)
            ON DELETE SET NULL;
    END IF;
END $$;
