const {
    ApplicationUser,
    Application,
    PortalApplicationDraft,
    PersonalDetails,
    EmergencyContact,
    ParentGuardianInfo,
    AcademicInstitution,
    EnglishProficiency,
    StandardizedTest,
    AdmissionSought,
    Disclosure,
    Experience,
    Document,
    FinancialSupport
} = require('../model/associations');

function pickDefined(source, mapping) {
    const out = {};
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
        if (Object.prototype.hasOwnProperty.call(source, sourceKey)) {
            out[targetKey] = source[sourceKey];
        }
    }
    return out;
}

async function syncPortalDraftToSectionTables(applicationRowId, formValues) {
    if (!applicationRowId || !formValues || typeof formValues !== 'object') {
        return;
    }

    const now = new Date();
    const toBoolFromYesNo = (value) => {
        if (value === undefined || value === null || value === '') return null;
        if (typeof value === 'boolean') return value;
        const normalized = String(value).trim().toLowerCase();
        if (normalized === 'yes' || normalized === 'true') return true;
        if (normalized === 'no' || normalized === 'false') return false;
        return null;
    };
    const hasData = (value) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.values(value).some((v) => hasData(v));
        return true;
    };
    const toNullableString = (value) => {
        if (value === undefined || value === null) return null;
        const str = String(value).trim();
        return str === '' ? null : str;
    };
    const upsertSingle = async (model, payload) => {
        const existing = await model.findOne({ where: { application_id: applicationRowId } });
        if (existing) {
            await existing.update(payload);
            return existing;
        }
        return model.create({ application_id: applicationRowId, ...payload });
    };

    await upsertSingle(PersonalDetails, {
        title: formValues.title || null,
        first_name: formValues.firstName || null,
        middle_name: formValues.middleName || null,
        surname: formValues.surname || null,
        preferred_name: formValues.preferredName || null,
        pronouns: formValues.pronouns || null,
        date_of_birth: formValues.dateOfBirth || null,
        gender: formValues.gender || null,
        name_change: formValues.nameChanged || null,
        ethnicity_race: formValues.ethnicity || null,
        nationality_citizenship: formValues.citizenship || null,
        country_of_residence: formValues.countryOfResidence || null,
        passport_number: formValues.passportNumber || null,
        passport_expiry_date: formValues.passportExpiry || null,
        visa_immigration_status: formValues.visaStatus || null,
        email: formValues.email || null,
        mobile_phone: formValues.phoneMobile || null,
        home_phone: formValues.phoneHome || null,
        street_address: formValues.permanentAddress || null,
        city: formValues.city || null,
        state_province: formValues.stateProvince || null,
        postal_code: formValues.postalCode || null,
        country: formValues.country || null,
        mailing_same_as_permanent:
            typeof formValues.sameAsPermanent === 'boolean' ? formValues.sameAsPermanent : true,
        mailing_street_address: formValues.mailingAddress || null,
        mailing_city: formValues.mailingCity || null,
        mailing_state_province: formValues.mailingStateProvince || null,
        mailing_postal_code: formValues.mailingPostalCode || null,
        mailing_country: formValues.mailingCountry || null,
        updated_at: now
    });

    const emergencyContactPayload = {
        full_name: toNullableString(formValues.contactName ?? formValues.emergencyContactName),
        relationship: toNullableString(formValues.relationship ?? formValues.contactRelationship),
        phone: toNullableString(formValues.contactPhone ?? formValues.emergencyContactPhone),
        email: toNullableString(formValues.contactEmail ?? formValues.emergencyContactEmail),
        country: toNullableString(formValues.contactCountry ?? formValues.emergencyContactCountry),
        home_address: toNullableString(formValues.contactAddress ?? formValues.emergencyContactAddress),
        updated_at: now
    };
    const hasRequiredEmergencyContactFields = [
        emergencyContactPayload.full_name,
        emergencyContactPayload.relationship,
        emergencyContactPayload.phone,
        emergencyContactPayload.email
    ].every((value) => hasData(value));
    if (hasRequiredEmergencyContactFields) {
        await upsertSingle(EmergencyContact, emergencyContactPayload);
    }

    await upsertSingle(ParentGuardianInfo, {
        father_name: formValues.fatherName || null,
        father_occupation: formValues.fatherOccupation || null,
        father_email: formValues.fatherEmail || null,
        father_phone: formValues.fatherPhone || null,
        mother_name: formValues.motherName || null,
        mother_occupation: formValues.motherOccupation || null,
        mother_email: formValues.motherEmail || null,
        mother_phone: formValues.motherPhone || null,
        updated_at: now
    });

    if (Array.isArray(formValues.educationEntries)) {
        await AcademicInstitution.destroy({ where: { application_id: applicationRowId } });
        for (const entry of formValues.educationEntries) {
            if (!hasData(entry)) continue;
            await AcademicInstitution.create({
                application_id: applicationRowId,
                institution_details: entry,
                created_at: now,
                updated_at: now
            });
        }
    }

    await upsertSingle(AdmissionSought, {
        program_type: formValues.programType || null,
        sub_program: formValues.subProgram || null,
        transfer_credits: Array.isArray(formValues.transferCredits) ? formValues.transferCredits : null,
        preferred_semester: formValues.semester || null,
        preferred_year: formValues.year ? Number(formValues.year) : null,
        updated_at: now
    });

    await upsertSingle(EnglishProficiency, {
        proficiency_level: formValues.englishProficiency || null,
        other_languages_spoken: formValues.otherLanguagesSpoken || null,
        test_type: formValues.englishTestType || null,
        test_score: formValues.englishTestScore || null,
        updated_at: now
    });

    const hasStandardizedData =
        hasData(formValues.hasStandardizedTest) || hasData(formValues.standardizedTestType) || hasData(formValues.standardizedTestScore);
    if (hasStandardizedData) {
        await StandardizedTest.destroy({ where: { application_id: applicationRowId } });
        await StandardizedTest.create({
            application_id: applicationRowId,
            is_taken: toBoolFromYesNo(formValues.hasStandardizedTest),
            test_type: formValues.standardizedTestType || null,
            score: formValues.standardizedTestScore || null,
            created_at: now,
            updated_at: now
        });
    }

    if (Array.isArray(formValues.experiences)) {
        await Experience.destroy({ where: { application_id: applicationRowId } });
        for (const row of formValues.experiences) {
            if (!hasData(row)) continue;
            await Experience.create({
                application_id: applicationRowId,
                experience_type: row.type || null,
                role_position: row.role || null,
                organization: row.organization || null,
                hours_per_week: row.hoursPerWeek || null,
                start_date: row.startDate || null,
                end_date: row.endDate || null,
                is_current: row.endDate ? false : (row.startDate ? true : null),
                description: row.description || null,
                created_at: now,
                updated_at: now
            });
        }
    }

    await upsertSingle(Disclosure, {
        discipline_action: toBoolFromYesNo(formValues.hasBeenDisciplined),
        discipline_explanation: formValues.disciplineActionExplanation || null,
        traffic_offense: null,
        criminal_conviction: toBoolFromYesNo(formValues.hasBeenConvicted),
        conviction_explanation: formValues.convictionExplanation || null,
        disability: toBoolFromYesNo(formValues.hasDisability),
        disability_details: formValues.disabilityDetails || null,
        special_accomadations: toBoolFromYesNo(formValues.requiresAccommodation),
        accommodation_details: formValues.accommodationDetails || null,
        referral_source: formValues.howHeard || null,
        referral_source_other: formValues.howHeardOther || null,
        referral_description: formValues.referralDescription || null,
        updated_at: now
    });

    const documentPayload = pickDefined(formValues, {
        passport: 'passport',
        bank_statement: 'bankStatement',
        premedical_Bachelor_ug_HSC_Certificate: 'preMedTranscript',
        Secondary_11grade: 'grade11Transcript',
        cv_resume: 'cv',
        passport_photo: 'passportPhoto',
        other_professional_transcripts: 'otherProfessionalTranscripts',
        exam_results_marksheet: 'examResults',
        sponsor_signed_financial_form: 'sponsorSignedFinancialForm'
    });
    if (Object.keys(documentPayload).length > 0) {
        const [document] = await Document.findOrCreate({
            where: { application_id: applicationRowId },
            defaults: {
                application_id: applicationRowId,
                upload_progress: false,
                created_at: now,
                updated_at: now
            }
        });
        await document.update({
            ...documentPayload,
            updated_at: now
        });
    }

    const financialSupportPayload = {
        ...pickDefined(formValues, {
            student_full_name: 'studentName',
            student_id: 'studentId',
            program_of_study: 'programOfStudy',
            expected_start_date: 'expectedStartDate',
            select_payment_option: 'paymentOption',
            source_of_funds: 'selfFundedSource',
            sponsor_full_name: 'sponsorFullName',
            relationship_to_student: 'sponsorRelationship',
            occupation: 'sponsorOccupation',
            employer_business_name: 'sponsorEmployer',
            sponsor_street_address: 'sponsorAddress',
            sponsor_city: 'sponsorCity',
            sponsor_state: 'sponsorState',
            sponsor_postalcode: 'sponsorPostalCode',
            sponsor_country: 'sponsorCountry',
            sponsor_phone: 'sponsorPhone',
            sponsor_email: 'sponsorEmail',
            organization_name: 'orgName',
            org_contact_person: 'orgContactPerson',
            org_contact_person_title: 'orgContactTitle',
            org_street_address: 'orgAddress',
            org_city: 'orgCity',
            org_state: 'orgState',
            org_postal_code: 'orgPostalCode',
            org_country: 'orgCountry',
            org_phone: 'orgPhone',
            org_email: 'orgEmail',
            bank_checkbox: 'hasBankStatement',
            proof_of_income_checkbox: 'hasIncomeProof',
            sponsor_letter_checkbox: 'hasSponsorLetter',
            scholarship_checkbox: 'hasScholarshipLetter',
            student_loan_checkbox: 'hasLoanApproval',
            student_certificate_check1: 'certifyAccurate',
            student_certificate_check2: 'certifyFinancialResponsibility',
            student_date_certification: 'certifyDate',
            student_signature_method: 'studentSignatureMethod',
            student_signature_upload: 'studentSignatureUpload',
            student_signature_typed: 'studentSignatureTyped',
            sponsor_org_certificate: 'sponsorCertifySupport',
            sponsor_certification_date: 'sponsorCertifyDate',
            sponsor_signed_financial_form: 'sponsorSignedFinancialForm'
        }),
        updated_at: now
    };
    if (Object.keys(financialSupportPayload).length > 1) {
        const [financialSupport] = await FinancialSupport.findOrCreate({
            where: { application_id: applicationRowId },
            defaults: {
                application_id: applicationRowId,
                created_at: now,
                updated_at: now
            }
        });
        await financialSupport.update(financialSupportPayload);
    }

    const applicationPayload = {
        ...pickDefined(formValues, {
            why_medicine: 'whyMedicine',
            why_mucm: 'whyMUCM',
            personal_statement: 'personalStatement',
            review_signature_method: 'reviewSignatureMethod',
            review_signature_typed: 'reviewSignatureTyped',
            review_signature_upload: 'reviewSignatureUpload'
        }),
        updated_at: now
    };
    if (Object.prototype.hasOwnProperty.call(formValues, 'applicationAgreement')) {
        applicationPayload.application_agreement_accepted = !!formValues.applicationAgreement;
        applicationPayload.application_agreement_at = formValues.applicationAgreement ? now : null;
    }
    if (Object.keys(applicationPayload).length > 1) {
        await Application.update(applicationPayload, {
            where: { id: applicationRowId, deleted_at: null }
        });
    }
}

async function resolveApplicationRowId(userId, body = {}, query = {}) {
    const candidateRaw = body.applicationId || body.application_id || query.applicationId || query.application_id;
    if (!candidateRaw) return null;
    const candidate = String(candidateRaw).trim();
    if (!candidate) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate);
    const app = await Application.findOne({
        where: {
            deleted_at: null,
            student_id: userId,
            ...(isUuid
                ? { id: candidate }
                : { application_id: candidate })
        }
    });
    return app?.id || null;
}

exports.saveAdminDraft = async (req, res) => {
    try {
        const { applicationId, formValues, currentStepIndex: rawStep, savedFromAction } = req.body;
        if (!applicationId) {
            return res.status(400).json({ success: false, message: 'applicationId is required' });
        }

        const app = await Application.findOne({ where: { id: applicationId, deleted_at: null } });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const currentStepIndex =
            typeof rawStep === 'number'
                ? Math.max(0, Math.floor(rawStep))
                : parseInt(String(rawStep || '0'), 10) || 0;
        const now = new Date();
        const action = String(savedFromAction || 'save_and_continue').trim().toLowerCase();

        const where = { application_id: applicationId };
        const existing = await PortalApplicationDraft.findOne({ where });
        if (existing) {
            await existing.update({
                form_values: formValues ?? {},
                current_step_index: currentStepIndex,
                saved_from_action: action,
                saved_at: now
            });
        } else {
            await PortalApplicationDraft.create({
                user_id: app.student_id || null,
                application_id: applicationId,
                form_values: formValues ?? {},
                current_step_index: currentStepIndex,
                saved_from_action: action,
                saved_at: now
            });
        }

        try {
            await syncPortalDraftToSectionTables(applicationId, formValues ?? {});
        } catch (syncError) {
            console.error('saveAdminDraft syncPortalDraftToSectionTables', syncError);
        }

        return res.json({ success: true, message: 'Draft saved', data: { applicationId, currentStepIndex, savedAt: now } });
    } catch (error) {
        console.error('saveAdminDraft', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getAdminDraft = async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json({ success: false, message: 'applicationId is required' });
        }

        const draft = await PortalApplicationDraft.findOne({
            where: { application_id: applicationId },
            order: [['updated_at', 'DESC']]
        });

        if (!draft) {
            return res.json({ success: true, data: null });
        }

        return res.json({
            success: true,
            data: {
                formValues: draft.form_values || null,
                currentStepIndex: typeof draft.current_step_index === 'number' ? draft.current_step_index : 0,
                savedAt: draft.saved_at,
                applicationId: draft.application_id
            }
        });
    } catch (error) {
        console.error('getAdminDraft', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getApplicationDraft = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await ApplicationUser.findByPk(userId);
        if (!user || !user.is_active) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const applicationRowId = await resolveApplicationRowId(userId, req.body, req.query);
        const where = applicationRowId
            ? { user_id: userId, application_id: applicationRowId }
            : { user_id: userId };

        const draft = await PortalApplicationDraft.findOne({
            where,
            order: [['updated_at', 'DESC']]
        });

        if (draft) {
            return res.json({
                success: true,
                data: {
                    formValues: draft.form_values || null,
                    currentStepIndex:
                        typeof draft.current_step_index === 'number'
                            ? draft.current_step_index
                            : 0,
                    updatedAt: draft.saved_at,
                    applicationId: draft.application_id
                }
            });
        }

        return res.json({
            success: true,
            data: {
                formValues: user.portal_form_draft || null,
                currentStepIndex:
                    typeof user.portal_draft_step_index === 'number'
                        ? user.portal_draft_step_index
                        : 0,
                updatedAt: user.portal_draft_updated_at
            }
        });
    } catch (error) {
        console.error('getApplicationDraft', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.putApplicationDraft = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await ApplicationUser.findByPk(userId);
        if (!user || !user.is_active) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const formValues = req.body.formValues;
        const rawStep = req.body.currentStepIndex;
        const currentStepIndex =
            typeof rawStep === 'number'
                ? Math.max(0, Math.floor(rawStep))
                : parseInt(String(rawStep || '0'), 10) || 0;

        const now = new Date();
        const applicationRowId = await resolveApplicationRowId(userId, req.body, req.query);
        const savedFromAction = String(req.body.savedFromAction || req.body.action || 'save_and_continue').trim().toLowerCase();

        const where = {
            user_id: userId,
            application_id: applicationRowId || null
        };

        const existingDraft = await PortalApplicationDraft.findOne({ where });
        if (existingDraft) {
            await existingDraft.update({
                form_values: formValues ?? {},
                current_step_index: currentStepIndex,
                saved_from_action: savedFromAction,
                saved_at: now
            });
        } else {
            await PortalApplicationDraft.create({
                user_id: userId,
                application_id: applicationRowId,
                form_values: formValues ?? {},
                current_step_index: currentStepIndex,
                saved_from_action: savedFromAction,
                saved_at: now
            });
        }

        try {
            await syncPortalDraftToSectionTables(applicationRowId, formValues ?? {});
        } catch (syncError) {
            console.error('syncPortalDraftToSectionTables', syncError);
        }

        await user.update({
            portal_form_draft: formValues ?? {},
            portal_draft_step_index: currentStepIndex,
            portal_draft_updated_at: now
        });
        await user.reload();

        return res.json({
            success: true,
            message: 'Draft saved',
            data: {
                currentStepIndex: user.portal_draft_step_index,
                updatedAt: user.portal_draft_updated_at,
                applicationId: applicationRowId
            }
        });
    } catch (error) {
        console.error('putApplicationDraft', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
