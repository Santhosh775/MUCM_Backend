-- Run after `application_users` exists. Optional referential integrity for support_tickets.
ALTER TABLE support_tickets
    DROP CONSTRAINT IF EXISTS support_tickets_user_id_foreign;
ALTER TABLE support_tickets
    ADD CONSTRAINT support_tickets_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES application_users (id) ON DELETE CASCADE;
