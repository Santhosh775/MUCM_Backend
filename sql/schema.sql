-- MUCM Phase-1 application portal schema (PostgreSQL)
-- Run after creating the database. Requires uuid-ossp for uuid_generate_v4().

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "tenants"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "domain" VARCHAR(255) NULL,
    "logo_url" TEXT NULL,
    "primary_color" VARCHAR(7) NULL,
    "secondary_color" VARCHAR(7) NULL,
    "settings" JSONB NULL DEFAULT '[]'::jsonb,
    "status" VARCHAR(20) NULL DEFAULT 'active',
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NULL,
    "updated_by" UUID NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "tenants" ADD PRIMARY KEY("id");
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_code_unique" UNIQUE("code");

CREATE TABLE "programs"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "level" VARCHAR(50) NULL,
    "description" TEXT NULL,
    "capacity" INTEGER NULL,
    "active" BOOLEAN NULL DEFAULT TRUE,
    "settings" JSONB NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NULL,
    "updated_by" UUID NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "programs" ADD PRIMARY KEY("id");

CREATE TABLE "intakes"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "program_id" UUID NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" DATE NULL,
    "application_deadline" DATE NULL,
    "capacity" INTEGER NULL,
    "status" VARCHAR(20) NULL DEFAULT 'Open',
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NULL,
    "updated_by" UUID NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "intakes" ADD PRIMARY KEY("id");

CREATE TABLE "leads"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "source" VARCHAR(100) NULL,
    "channel" VARCHAR(100) NULL,
    "email" VARCHAR(255) NULL,
    "phone" VARCHAR(50) NULL,
    "first_name" VARCHAR(100) NULL,
    "last_name" VARCHAR(100) NULL,
    "crm_reference_id" VARCHAR(255) NULL,
    "status" VARCHAR(50) NULL DEFAULT 'new',
    "metadata" JSONB NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "leads" ADD PRIMARY KEY("id");
CREATE INDEX "leads_email_index" ON "leads"("email");
CREATE INDEX "leads_phone_index" ON "leads"("phone");
CREATE INDEX "leads_crm_reference_id_index" ON "leads"("crm_reference_id");

CREATE TABLE "pipeline_stages"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "stage_key" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "stage_order" INTEGER NOT NULL,
    "type" VARCHAR(50) NULL,
    "required" BOOLEAN NULL DEFAULT TRUE,
    "auto_advance" BOOLEAN NULL,
    "sla_days" INTEGER NULL,
    "notification_template_id" UUID NULL,
    "notification_template" VARCHAR(500) NULL,
    "active" BOOLEAN NULL DEFAULT TRUE,
    "color" VARCHAR(7) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "pipeline_stages" ADD PRIMARY KEY("id");

CREATE TABLE "applications"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" VARCHAR(50) NOT NULL,
    "tenant_id" UUID NULL,
    "lead_id" UUID NULL,
    "student_id" UUID NULL,
    "program_id" UUID NULL,
    "intake_id" UUID NULL,
    "pipeline_stage_id" UUID NULL,
    "current_status" VARCHAR(50) NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "referral_code" VARCHAR(100) NULL,
    "lead_source" VARCHAR(100) NULL,
    "crm_reference_id" VARCHAR(255) NULL,
    "correlation_method" VARCHAR(50) NULL,
    "ip_address" INTEGER NULL,
    "user_agent" TEXT NULL,
    "completed_steps" INTEGER NULL,
    "is_complete" BOOLEAN NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NULL,
    "updated_by" UUID NULL,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);

CREATE INDEX "applications_program_id_intake_id_index" ON "applications"("program_id", "intake_id");
ALTER TABLE "applications" ADD PRIMARY KEY("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_application_id_unique" UNIQUE("application_id");
CREATE INDEX "applications_lead_id_index" ON "applications"("lead_id");
CREATE INDEX "applications_current_status_index" ON "applications"("current_status");
CREATE INDEX "applications_submitted_at_index" ON "applications"("submitted_at");
CREATE INDEX "applications_referral_code_index" ON "applications"("referral_code");
CREATE INDEX "applications_crm_reference_id_index" ON "applications"("crm_reference_id");

CREATE TABLE "personal_details"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "title" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100) NULL,
    "surname" VARCHAR(100) NOT NULL,
    "preferred_name" VARCHAR(100) NULL,
    "pronouns" VARCHAR(20) NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "marital_status" VARCHAR(50) NOT NULL,
    "name_change" VARCHAR(20) NULL,
    "ethnicity_race" VARCHAR(50) NULL,
    "nationality_citizenship" VARCHAR(100) NOT NULL,
    "country_of_residence" VARCHAR(100) NOT NULL,
    "passport_number" VARCHAR(50) NULL,
    "passport_expiry_date" DATE NULL,
    "visa_immigration_status" VARCHAR(50) NOT NULL,
    "language_spoken" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobile_phone" VARCHAR(50) NOT NULL,
    "home_phone" VARCHAR(50) NULL,
    "street_address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state_province" VARCHAR(100) NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "mailing_same_as_permanent" BOOLEAN NULL DEFAULT TRUE,
    "mailing_street_address" TEXT NULL,
    "mailing_city" VARCHAR(100) NOT NULL,
    "mailing_state_province" VARCHAR(100) NOT NULL,
    "mailing_postal_code" VARCHAR(20) NOT NULL,
    "mailing_country" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "personal_details" ADD PRIMARY KEY("id");
CREATE INDEX "personal_details_email_index" ON "personal_details"("email");

CREATE TABLE "emergency_contacts"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "occupation" VARCHAR(50) NULL,
    "country" VARCHAR(100) NULL,
    "home_address" TEXT NULL,
    "funding_source" VARCHAR(255) NULL,
    "sponsor_name_organization" VARCHAR(100) NULL,
    "sponsor_contact" VARCHAR(50) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "emergency_contacts" ADD PRIMARY KEY("id");

CREATE TABLE "parent_guardian_info"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "father_name" VARCHAR(255) NULL,
    "father_occupation" VARCHAR(255) NULL,
    "father_email" VARCHAR(255) NULL,
    "father_phone" VARCHAR(50) NULL,
    "mother_name" VARCHAR(255) NULL,
    "mother_occupation" VARCHAR(255) NULL,
    "mother_email" VARCHAR(255) NULL,
    "mother_phone" VARCHAR(50) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "parent_guardian_info" ADD PRIMARY KEY("id");

CREATE TABLE "academic_institutions"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "institution_details" JSON NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "academic_institutions" ADD PRIMARY KEY("id");

CREATE TABLE "english_proficiency"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "proficiency_level" VARCHAR(50) NOT NULL,
    "test_type" VARCHAR(50) NULL,
    "test_score" VARCHAR(20) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "english_proficiency" ADD PRIMARY KEY("id");

CREATE TABLE "standardized_tests"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "is_taken" BOOLEAN NULL,
    "test_type" VARCHAR(50) NULL,
    "score" VARCHAR(50) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "standardized_tests" ADD PRIMARY KEY("id");

CREATE TABLE "admission_sought"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "program_duration" VARCHAR(20) NULL,
    "sub_program" VARCHAR(100) NULL,
    "preferred_semester" VARCHAR(20) NOT NULL,
    "preferred_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "admission_sought" ADD PRIMARY KEY("id");

CREATE TABLE "Disclosures"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "discipline_action" BOOLEAN NULL,
    "traffic_offense" BOOLEAN NULL,
    "disability" BOOLEAN NULL,
    "special_accomadations" BOOLEAN NULL,
    "referral_source" VARCHAR(255) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "Disclosures" ADD PRIMARY KEY("id");

CREATE TABLE "experiences"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "experience_type" VARCHAR(50) NULL,
    "role_position" VARCHAR(255) NULL,
    "organization" VARCHAR(255) NULL,
    "hours_per_week" INTEGER NULL,
    "start_date" DATE NULL,
    "end_date" DATE NULL,
    "is_current" BOOLEAN NULL,
    "description" TEXT NULL,
    "why_medicine" TEXT NULL,
    "why_mucm" TEXT NULL,
    "per_statement_essay" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "experiences" ADD PRIMARY KEY("id");

CREATE TABLE "Document"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "upload_progress" BOOLEAN NOT NULL,
    "passport" VARCHAR(255) NOT NULL,
    "bank_statement" VARCHAR(255) NOT NULL,
    "premedical_Bachelor_ug_HSC_Certificate" VARCHAR(255) NOT NULL,
    "Secondary_11grade" VARCHAR(255) NOT NULL,
    "cv_resume" VARCHAR(255) NOT NULL,
    "passport_photo" VARCHAR(255) NOT NULL,
    "completed_financial_support" VARCHAR(255) NOT NULL,
    "other_professional transcripts" VARCHAR(255) NULL,
    "Anyother_helpful_transcripts" VARCHAR(255) NULL,
    "exam_results_marksheet" VARCHAR(255) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "Document" ADD PRIMARY KEY("id");

CREATE TABLE "Financial_Support"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "application_id" UUID NULL,
    "student_full_name" VARCHAR(100) NULL,
    "student_id" VARCHAR(255) NULL,
    "program_of_study" VARCHAR(50) NULL,
    "expected_start_date" VARCHAR(50) NULL,
    "select_payment_option" VARCHAR(50) NOT NULL,
    "source_of_funds" VARCHAR(50) NOT NULL,
    "sponsor_full_name" VARCHAR(100) NULL,
    "relationship_to_student" VARCHAR(50) NULL,
    "occupation" VARCHAR(100) NOT NULL,
    "employer_business_name" VARCHAR(100) NOT NULL,
    "sponsor_street_address" VARCHAR(100) NOT NULL,
    "sponsor_city" VARCHAR(100) NOT NULL,
    "sponsor_state" VARCHAR(50) NOT NULL,
    "sponsor_postalcode" VARCHAR(25) NOT NULL,
    "sponsor_country" VARCHAR(50) NOT NULL,
    "sponsor_phone" VARCHAR(50) NULL,
    "sponsor_email" VARCHAR(100) NULL,
    "organization_name" VARCHAR(100) NOT NULL,
    "org_contact_person" VARCHAR(50) NOT NULL,
    "org_contact_person_title" VARCHAR(20) NULL,
    "org_street_address" VARCHAR(100) NULL,
    "org_city" VARCHAR(100) NULL,
    "org_state" VARCHAR(50) NULL,
    "org_postal_code" VARCHAR(20) NULL,
    "org_country" VARCHAR(50) NULL,
    "org_phone" VARCHAR(50) NOT NULL,
    "org_email" VARCHAR(50) NOT NULL,
    "bank_checkbox" BOOLEAN NULL,
    "proof_of_income_checkbox" BOOLEAN NULL,
    "sponsor_letter_checkbox" BOOLEAN NULL,
    "scholarship_checkbox" BOOLEAN NULL,
    "student_loan_checkbox" BOOLEAN NULL,
    "student_certificate_check1" BOOLEAN NULL,
    "student_certificate_check2" BOOLEAN NULL,
    "student_date_certification" VARCHAR(50) NULL,
    "sponsor_org_certificate" BOOLEAN NULL,
    "sponsor_certification_date" VARCHAR(50) NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "Financial_Support" ADD PRIMARY KEY("id");

ALTER TABLE "Disclosures" ADD CONSTRAINT "disclosures_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "personal_details" ADD CONSTRAINT "personal_details_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "admission_sought" ADD CONSTRAINT "admission_sought_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "Financial_Support" ADD CONSTRAINT "financial_support_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "academic_institutions" ADD CONSTRAINT "academic_institutions_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "parent_guardian_info" ADD CONSTRAINT "parent_guardian_info_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "english_proficiency" ADD CONSTRAINT "english_proficiency_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "standardized_tests" ADD CONSTRAINT "standardized_tests_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "document_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_pipeline_stage_id_foreign" FOREIGN KEY("pipeline_stage_id") REFERENCES "pipeline_stages"("id");
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_lead_id_foreign" FOREIGN KEY("lead_id") REFERENCES "leads"("id");
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_program_id_foreign" FOREIGN KEY("program_id") REFERENCES "programs"("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_program_id_foreign" FOREIGN KEY("program_id") REFERENCES "programs"("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_intake_id_foreign" FOREIGN KEY("intake_id") REFERENCES "intakes"("id");
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id");
ALTER TABLE "programs" ADD CONSTRAINT "programs_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id");
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id");

-- Portal OTP login (Nodemailer + application_users; used by admissions dashboard)
CREATE TABLE "application_users"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "otp_code_hash" VARCHAR(128) NULL,
    "otp_expires_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "last_otp_sent_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "last_login_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "portal_form_draft" JSONB NULL,
    "portal_draft_step_index" INTEGER NULL,
    "portal_draft_updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "application_users" ADD PRIMARY KEY("id");
ALTER TABLE "application_users" ADD CONSTRAINT "application_users_email_unique" UNIQUE("email");

CREATE TABLE "portal_application_drafts"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "application_id" UUID NULL,
    "form_values" JSONB NULL,
    "current_step_index" INTEGER NOT NULL DEFAULT 0,
    "saved_from_action" VARCHAR(50) NULL,
    "saved_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "portal_application_drafts" ADD PRIMARY KEY("id");
CREATE UNIQUE INDEX "portal_application_drafts_user_application_unique" ON "portal_application_drafts"("user_id", "application_id");
CREATE INDEX "portal_application_drafts_user_id_index" ON "portal_application_drafts"("user_id");
CREATE INDEX "portal_application_drafts_application_id_index" ON "portal_application_drafts"("application_id");
ALTER TABLE "portal_application_drafts" ADD CONSTRAINT "portal_application_drafts_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "application_users"("id") ON DELETE CASCADE;
ALTER TABLE "portal_application_drafts" ADD CONSTRAINT "portal_application_drafts_application_id_foreign" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;

CREATE TABLE "application_user_logins"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "ip_address" VARCHAR(45) NULL,
    "user_agent" TEXT NULL,
    "login_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "application_user_logins" ADD PRIMARY KEY("id");
CREATE INDEX "application_user_logins_user_id_index" ON "application_user_logins"("user_id");
ALTER TABLE "application_user_logins" ADD CONSTRAINT "application_user_logins_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "application_users"("id") ON DELETE CASCADE;

CREATE TABLE "faqs"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "category" VARCHAR(120) NOT NULL DEFAULT 'General',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "faqs" ADD PRIMARY KEY("id");

CREATE TABLE "support_tickets"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "user_email" VARCHAR(255) NULL,
    "subject" VARCHAR(500) NOT NULL,
    "message" TEXT NOT NULL,
    "category" VARCHAR(100) NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Open',
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "support_tickets" ADD PRIMARY KEY("id");
CREATE INDEX "support_tickets_user_id_index" ON "support_tickets"("user_id");
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "application_users"("id") ON DELETE CASCADE;

CREATE TABLE "prerequisite_documents"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "valid_passport" BOOLEAN NOT NULL DEFAULT FALSE,
    "bank_statement_3_months" BOOLEAN NOT NULL DEFAULT FALSE,
    "premed_bachelor_12th_transcript" BOOLEAN NOT NULL DEFAULT FALSE,
    "grade_11_transcript" BOOLEAN NOT NULL DEFAULT FALSE,
    "curriculum_vitae" BOOLEAN NOT NULL DEFAULT FALSE,
    "passport_size_photo" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "prerequisite_documents" ADD PRIMARY KEY("id");
ALTER TABLE "prerequisite_documents" ADD CONSTRAINT "prerequisite_documents_user_id_unique" UNIQUE("user_id");
ALTER TABLE "prerequisite_documents" ADD CONSTRAINT "prerequisite_documents_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "application_users"("id") ON DELETE CASCADE;

CREATE TABLE "faq_categories"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "faq_categories" ADD PRIMARY KEY("id");
ALTER TABLE "faq_categories" ADD CONSTRAINT "faq_categories_name_unique" UNIQUE("name");
ALTER TABLE "faqs" ADD COLUMN "category_id" UUID NULL;
CREATE INDEX "faqs_category_id_index" ON "faqs"("category_id");
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_foreign" FOREIGN KEY("category_id") REFERENCES "faq_categories"("id") ON DELETE SET NULL;

CREATE TABLE "admin_roles"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(120) NOT NULL,
    "summary" TEXT NULL,
    "permissions" JSON NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "admin_roles" ADD PRIMARY KEY("id");
ALTER TABLE "admin_roles" ADD CONSTRAINT "admin_roles_name_unique" UNIQUE("name");

CREATE TABLE "admins"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "admins" ADD PRIMARY KEY("id");
ALTER TABLE "admins" ADD CONSTRAINT "admins_email_unique" UNIQUE("email");
CREATE INDEX "admins_role_id_index" ON "admins"("role_id");
ALTER TABLE "admins" ADD CONSTRAINT "admins_role_id_foreign" FOREIGN KEY("role_id") REFERENCES "admin_roles"("id");

CREATE UNIQUE INDEX "programs_tenant_code_uidx" ON "programs"("tenant_id", "code") WHERE "deleted_at" IS NULL AND "tenant_id" IS NOT NULL;
CREATE UNIQUE INDEX "programs_code_null_tenant_uidx" ON "programs"("code") WHERE "deleted_at" IS NULL AND "tenant_id" IS NULL;
CREATE UNIQUE INDEX "pipeline_stages_tenant_stage_uidx" ON "pipeline_stages"("tenant_id", "stage_key") WHERE "deleted_at" IS NULL AND "tenant_id" IS NOT NULL;
CREATE UNIQUE INDEX "pipeline_stages_stage_null_tenant_uidx" ON "pipeline_stages"("stage_key") WHERE "deleted_at" IS NULL AND "tenant_id" IS NULL;

CREATE TABLE "fee_structure_items"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "program_id" UUID NULL,
    "intake_id" UUID NULL,
    "program_code" VARCHAR(50) NOT NULL DEFAULT '',
    "intake_name" VARCHAR(100) NOT NULL DEFAULT '',
    "fee_type" VARCHAR(120) NOT NULL,
    "amount_text" VARCHAR(64) NOT NULL DEFAULT '0',
    "amount_value" NUMERIC(14, 2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "refund_policy" TEXT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "fee_structure_items" ADD PRIMARY KEY("id");
CREATE INDEX "fee_structure_items_tenant_id_index" ON "fee_structure_items"("tenant_id");
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL;
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_program_id_foreign" FOREIGN KEY("program_id") REFERENCES "programs"("id") ON DELETE SET NULL;
ALTER TABLE "fee_structure_items" ADD CONSTRAINT "fee_structure_items_intake_id_foreign" FOREIGN KEY("intake_id") REFERENCES "intakes"("id") ON DELETE SET NULL;

CREATE TABLE "settings_document_requirements"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "name" VARCHAR(500) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT TRUE,
    "accepted_types" VARCHAR(255) NOT NULL DEFAULT 'PDF',
    "max_size_mb" INTEGER NOT NULL DEFAULT 10,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "settings_document_requirements" ADD PRIMARY KEY("id");
CREATE INDEX "settings_document_requirements_tenant_id_index" ON "settings_document_requirements"("tenant_id");
ALTER TABLE "settings_document_requirements" ADD CONSTRAINT "settings_document_requirements_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL;

CREATE TABLE "dropdown_option_categories"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NULL,
    "category" VARCHAR(200) NOT NULL,
    "description" TEXT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "dropdown_option_categories" ADD PRIMARY KEY("id");
CREATE INDEX "dropdown_option_categories_tenant_id_index" ON "dropdown_option_categories"("tenant_id");
CREATE UNIQUE INDEX "dropdown_option_categories_tenant_label_uidx" ON "dropdown_option_categories"("tenant_id", lower("category")) WHERE "deleted_at" IS NULL AND "tenant_id" IS NOT NULL;
CREATE UNIQUE INDEX "dropdown_option_categories_label_null_tenant_uidx" ON "dropdown_option_categories"(lower("category")) WHERE "deleted_at" IS NULL AND "tenant_id" IS NULL;
ALTER TABLE "dropdown_option_categories" ADD CONSTRAINT "dropdown_option_categories_tenant_id_foreign" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL;

CREATE TABLE "dropdown_option_values"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "category_id" UUID NOT NULL,
    "option_value" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE "dropdown_option_values" ADD PRIMARY KEY("id");
CREATE INDEX "dropdown_option_values_category_id_index" ON "dropdown_option_values"("category_id");
ALTER TABLE "dropdown_option_values" ADD CONSTRAINT "dropdown_option_values_category_id_foreign" FOREIGN KEY("category_id") REFERENCES "dropdown_option_categories"("id") ON DELETE CASCADE;
