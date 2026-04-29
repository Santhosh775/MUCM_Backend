-- PostgreSQL: one-time ADDs to align tables with university-application-portal form (applicationSteps.js).
-- Safe to re-run where IF NOT EXISTS is supported (PostgreSQL 9.1+ for ADD COLUMN IF NOT EXISTS).

-- applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS why_medicine TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS why_mucm TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS personal_statement TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_agreement_accepted BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_agreement_at TIMESTAMP WITH TIME ZONE;

-- personal_details
ALTER TABLE personal_details ALTER COLUMN marital_status DROP NOT NULL;
ALTER TABLE personal_details ALTER COLUMN language_spoken DROP NOT NULL;
ALTER TABLE personal_details ALTER COLUMN name_change TYPE VARCHAR(500);
ALTER TABLE personal_details ALTER COLUMN mailing_city DROP NOT NULL;
ALTER TABLE personal_details ALTER COLUMN mailing_state_province DROP NOT NULL;
ALTER TABLE personal_details ALTER COLUMN mailing_postal_code DROP NOT NULL;
ALTER TABLE personal_details ALTER COLUMN mailing_country DROP NOT NULL;

-- emergency_contacts
ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS funding_sponsor_relationship VARCHAR(150);
ALTER TABLE emergency_contacts ALTER COLUMN sponsor_contact TYPE VARCHAR(255);

-- admission_sought
ALTER TABLE admission_sought ADD COLUMN IF NOT EXISTS program_type VARCHAR(100);

-- Disclosures (table name casing as in model)
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS discipline_explanation TEXT;
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS criminal_conviction BOOLEAN;
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS conviction_explanation TEXT;
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS disability_details TEXT;
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS accommodation_details TEXT;
ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS referral_source_other VARCHAR(500);

-- prerequisite_documents
ALTER TABLE prerequisite_documents ADD COLUMN IF NOT EXISTS completed_financial_support_form BOOLEAN NOT NULL DEFAULT false;

-- Financial_Support: conditional fields nullable for drafts / payment option A only
ALTER TABLE "Financial_Support" ALTER COLUMN select_payment_option DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN source_of_funds DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN occupation DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN employer_business_name DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN sponsor_street_address DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN sponsor_city DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN sponsor_state DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN sponsor_postalcode DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN sponsor_country DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN organization_name DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN org_contact_person DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN org_phone DROP NOT NULL;
ALTER TABLE "Financial_Support" ALTER COLUMN org_email DROP NOT NULL;

-- Document: optional until upload; widen URL fields
ALTER TABLE "Document" ALTER COLUMN passport DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN bank_statement DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN premedical_Bachelor_ug_HSC_Certificate DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN Secondary_11grade DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN cv_resume DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN passport_photo DROP NOT NULL;
ALTER TABLE "Document" ALTER COLUMN completed_financial_support DROP NOT NULL;

-- experiences: store hours_per_week as text from form
ALTER TABLE experiences ALTER COLUMN hours_per_week TYPE VARCHAR(20) USING hours_per_week::text;

-- === Application portal updates (2026): academic program, ELP, documents, financial & review signatures ===

-- Transfer credits moved from Disclosures to admission_sought (portal programType transfer-md)
ALTER TABLE admission_sought ADD COLUMN IF NOT EXISTS transfer_credits JSONB;

ALTER TABLE english_proficiency ADD COLUMN IF NOT EXISTS other_languages_spoken TEXT;

ALTER TABLE "Disclosures" ADD COLUMN IF NOT EXISTS referral_description TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_signature_method VARCHAR(20);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_signature_typed TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_signature_upload TEXT;

ALTER TABLE "Financial_Support" ADD COLUMN IF NOT EXISTS student_signature_method VARCHAR(20);
ALTER TABLE "Financial_Support" ADD COLUMN IF NOT EXISTS student_signature_typed TEXT;
ALTER TABLE "Financial_Support" ADD COLUMN IF NOT EXISTS student_signature_upload TEXT;
ALTER TABLE "Financial_Support" ADD COLUMN IF NOT EXISTS sponsor_signed_financial_form VARCHAR(512);

ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS sponsor_signed_financial_form VARCHAR(512);

ALTER TABLE standardized_tests ALTER COLUMN test_type TYPE VARCHAR(80);

-- Prerequisite checklist: removed completed financial support form from portal documents step
ALTER TABLE prerequisite_documents DROP COLUMN IF EXISTS completed_financial_support_form;

-- Note: legacy columns on emergency_contacts (funding_*, sponsor_*, occupation) and Document
-- (completed_financial_support, Anyother_helpful_transcripts) may still exist in older DBs; new code ignores them.

-- Personal statement trio: NOT NULL on applications (API requires non-empty on create; non-empty if sent on update).
-- Backfill NULL drafts so ALTER succeeds; replace with real text before submit.
UPDATE applications SET why_medicine = '' WHERE why_medicine IS NULL;
UPDATE applications SET why_mucm = '' WHERE why_mucm IS NULL;
UPDATE applications SET personal_statement = '' WHERE personal_statement IS NULL;
ALTER TABLE applications ALTER COLUMN why_medicine SET NOT NULL;
ALTER TABLE applications ALTER COLUMN why_mucm SET NOT NULL;
ALTER TABLE applications ALTER COLUMN personal_statement SET NOT NULL;

-- FAQ categories (admin panel)
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE faqs ADD COLUMN IF NOT EXISTS category_id UUID;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'faqs_category_id_foreign'
    ) THEN
        ALTER TABLE faqs
            ADD CONSTRAINT faqs_category_id_foreign
            FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Admin roles and admin accounts (admin panel Roles & Permissions)
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    summary TEXT,
    permissions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'admins_role_id_foreign'
    ) THEN
        ALTER TABLE admins
            ADD CONSTRAINT admins_role_id_foreign
            FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE RESTRICT;
    END IF;
END $$;
