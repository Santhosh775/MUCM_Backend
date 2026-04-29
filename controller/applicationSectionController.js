const fs = require('fs');
const path = require('path');
const {
    Application,
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

async function getApplicationOr404(req, res) {
    const { id } = req.params;
    const app = await Application.findOne({ where: { id, deleted_at: null } });
    if (!app) {
        res.status(404).json({ success: false, message: 'Application not found' });
        return null;
    }
    return app;
}

function normalizeDocumentPayload(payload) {
    const next = { ...payload };
    if (Object.prototype.hasOwnProperty.call(next, 'other_professional transcripts')) {
        next.other_professional_transcripts = next['other_professional transcripts'];
        delete next['other_professional transcripts'];
    }
    return next;
}

async function createRow(req, res, model, label, options = {}) {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;

        if (options.single) {
            const existing = await model.findOne({ where: { application_id: app.id } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: `${label} already exists for this application`
                });
            }
        }

        let payload = { ...req.body, application_id: app.id };
        if (options.transformPayload) payload = options.transformPayload(payload);
        if (options.touchTimestamps) {
            const now = new Date();
            payload.created_at = now;
            payload.updated_at = now;
        }
        if (options.defaults) payload = { ...options.defaults, ...payload };

        const row = await model.create(payload);
        return res.status(201).json({ success: true, message: `${label} created`, data: row });
    } catch (error) {
        console.error(`create ${label}`, error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function listRows(req, res, model, label) {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;
        const rows = await model.findAll({
            where: { application_id: app.id },
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, message: `${label} list`, data: rows });
    } catch (error) {
        console.error(`list ${label}`, error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function getRow(req, res, model, label) {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;
        const row = await model.findOne({
            where: { id: req.params.rowId, application_id: app.id }
        });
        if (!row) return res.status(404).json({ success: false, message: `${label} not found` });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error(`get ${label}`, error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function updateRow(req, res, model, label, options = {}) {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;
        const row = await model.findOne({
            where: { id: req.params.rowId, application_id: app.id }
        });
        if (!row) return res.status(404).json({ success: false, message: `${label} not found` });

        let payload = { ...req.body };
        if (options.transformPayload) payload = options.transformPayload(payload);
        if (options.touchTimestamps) payload.updated_at = new Date();
        await row.update(payload);
        return res.json({ success: true, message: `${label} updated`, data: row });
    } catch (error) {
        console.error(`update ${label}`, error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function deleteRow(req, res, model, label) {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;
        const row = await model.findOne({
            where: { id: req.params.rowId, application_id: app.id }
        });
        if (!row) return res.status(404).json({ success: false, message: `${label} not found` });
        await row.destroy();
        return res.json({ success: true, message: `${label} deleted` });
    } catch (error) {
        console.error(`delete ${label}`, error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

exports.createPersonalDetails = (req, res) => createRow(req, res, PersonalDetails, 'Personal details', { single: true });
exports.listPersonalDetails = (req, res) => listRows(req, res, PersonalDetails, 'Personal details');
exports.getPersonalDetails = (req, res) => getRow(req, res, PersonalDetails, 'Personal details');
exports.updatePersonalDetails = (req, res) => updateRow(req, res, PersonalDetails, 'Personal details');
exports.deletePersonalDetails = (req, res) => deleteRow(req, res, PersonalDetails, 'Personal details');

exports.createEmergencyContact = (req, res) => createRow(req, res, EmergencyContact, 'Emergency contact');
exports.listEmergencyContacts = (req, res) => listRows(req, res, EmergencyContact, 'Emergency contacts');
exports.getEmergencyContact = (req, res) => getRow(req, res, EmergencyContact, 'Emergency contact');
exports.updateEmergencyContact = (req, res) => updateRow(req, res, EmergencyContact, 'Emergency contact');
exports.deleteEmergencyContact = (req, res) => deleteRow(req, res, EmergencyContact, 'Emergency contact');

exports.createParentGuardian = (req, res) => createRow(req, res, ParentGuardianInfo, 'Parent guardian info', { single: true });
exports.listParentGuardian = (req, res) => listRows(req, res, ParentGuardianInfo, 'Parent guardian info');
exports.getParentGuardian = (req, res) => getRow(req, res, ParentGuardianInfo, 'Parent guardian info');
exports.updateParentGuardian = (req, res) => updateRow(req, res, ParentGuardianInfo, 'Parent guardian info');
exports.deleteParentGuardian = (req, res) => deleteRow(req, res, ParentGuardianInfo, 'Parent guardian info');

exports.createAcademicInstitution = (req, res) => createRow(req, res, AcademicInstitution, 'Academic institution');
exports.listAcademicInstitutions = (req, res) => listRows(req, res, AcademicInstitution, 'Academic institutions');
exports.getAcademicInstitution = (req, res) => getRow(req, res, AcademicInstitution, 'Academic institution');
exports.updateAcademicInstitution = (req, res) => updateRow(req, res, AcademicInstitution, 'Academic institution');
exports.deleteAcademicInstitution = (req, res) => deleteRow(req, res, AcademicInstitution, 'Academic institution');

exports.createEnglishProficiency = (req, res) => createRow(req, res, EnglishProficiency, 'English proficiency', { single: true });
exports.listEnglishProficiency = (req, res) => listRows(req, res, EnglishProficiency, 'English proficiency');
exports.getEnglishProficiency = (req, res) => getRow(req, res, EnglishProficiency, 'English proficiency');
exports.updateEnglishProficiency = (req, res) => updateRow(req, res, EnglishProficiency, 'English proficiency');
exports.deleteEnglishProficiency = (req, res) => deleteRow(req, res, EnglishProficiency, 'English proficiency');

exports.createStandardizedTest = (req, res) => createRow(req, res, StandardizedTest, 'Standardized test');
exports.listStandardizedTests = (req, res) => listRows(req, res, StandardizedTest, 'Standardized tests');
exports.getStandardizedTest = (req, res) => getRow(req, res, StandardizedTest, 'Standardized test');
exports.updateStandardizedTest = (req, res) => updateRow(req, res, StandardizedTest, 'Standardized test');
exports.deleteStandardizedTest = (req, res) => deleteRow(req, res, StandardizedTest, 'Standardized test');

exports.createAdmissionSought = (req, res) => createRow(req, res, AdmissionSought, 'Admission sought', { single: true });
exports.listAdmissionSought = (req, res) => listRows(req, res, AdmissionSought, 'Admission sought');
exports.getAdmissionSought = (req, res) => getRow(req, res, AdmissionSought, 'Admission sought');
exports.updateAdmissionSought = (req, res) => updateRow(req, res, AdmissionSought, 'Admission sought');
exports.deleteAdmissionSought = (req, res) => deleteRow(req, res, AdmissionSought, 'Admission sought');

exports.createDisclosure = (req, res) => createRow(req, res, Disclosure, 'Disclosure', { single: true });
exports.listDisclosures = (req, res) => listRows(req, res, Disclosure, 'Disclosures');
exports.getDisclosure = (req, res) => getRow(req, res, Disclosure, 'Disclosure');
exports.updateDisclosure = (req, res) => updateRow(req, res, Disclosure, 'Disclosure');
exports.deleteDisclosure = (req, res) => deleteRow(req, res, Disclosure, 'Disclosure');

exports.createExperience = (req, res) => createRow(req, res, Experience, 'Experience');
exports.listExperiences = (req, res) => listRows(req, res, Experience, 'Experiences');
exports.getExperience = (req, res) => getRow(req, res, Experience, 'Experience');
exports.updateExperience = (req, res) => updateRow(req, res, Experience, 'Experience');
exports.deleteExperience = (req, res) => deleteRow(req, res, Experience, 'Experience');

exports.createDocument = (req, res) => createRow(req, res, Document, 'Document', {
    single: true,
    transformPayload: normalizeDocumentPayload,
    touchTimestamps: true,
    defaults: {
        upload_progress: false,
        passport: '',
        bank_statement: '',
        premedical_Bachelor_ug_HSC_Certificate: '',
        Secondary_11grade: '',
        cv_resume: '',
        passport_photo: '',
        sponsor_signed_financial_form: ''
    }
});
exports.listDocuments = (req, res) => listRows(req, res, Document, 'Documents');
exports.getDocument = (req, res) => getRow(req, res, Document, 'Document');
exports.updateDocument = (req, res) => updateRow(req, res, Document, 'Document', {
    transformPayload: normalizeDocumentPayload,
    touchTimestamps: true
});
exports.deleteDocument = (req, res) => deleteRow(req, res, Document, 'Document');

/**
 * POST multipart: field `file`, query documentType — stores under uploads/applications/:applicationUuid/
 */
exports.uploadApplicationDocument = async (req, res) => {
    try {
        const app = await getApplicationOr404(req, res);
        if (!app) return;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded (use multipart field name "file")' });
        }

        const meta = req.documentUploadMeta;
        if (!meta?.field?.attribute) {
            return res.status(500).json({ success: false, message: 'Upload metadata missing' });
        }

        const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
        const attr = meta.field.attribute;

        const now = new Date();
        const [doc] = await Document.findOrCreate({
            where: { application_id: app.id },
            defaults: {
                application_id: app.id,
                upload_progress: false,
                created_at: now,
                updated_at: now
            }
        });

        const prevStored = doc[attr];

        await doc.update({
            [attr]: relativePath,
            upload_progress: true,
            updated_at: now
        });
        await doc.reload();

        if (attr === 'sponsor_signed_financial_form') {
            const [financialSupport] = await FinancialSupport.findOrCreate({
                where: { application_id: app.id },
                defaults: {
                    application_id: app.id,
                    created_at: now,
                    updated_at: now
                }
            });
            await financialSupport.update({
                sponsor_signed_financial_form: relativePath,
                updated_at: now
            });
        }

        if (prevStored && typeof prevStored === 'string' && prevStored.trim() !== '' && prevStored !== relativePath) {
            const absPrev = path.isAbsolute(prevStored) ? prevStored : path.join(process.cwd(), prevStored);
            const uploadsRoot = path.join(process.cwd(), 'uploads');
            if (path.resolve(absPrev).startsWith(path.resolve(uploadsRoot))) {
                fs.unlink(absPrev, () => {});
            }
        }

        const publicUrlPath = `/${relativePath.replace(/^\/+/, '')}`;
        const baseUrl = process.env.PUBLIC_API_BASE_URL || '';
        const fileUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}${publicUrlPath}` : publicUrlPath;

        return res.status(201).json({
            success: true,
            message: 'Document uploaded',
            data: {
                documentType: meta.documentType,
                storedPath: relativePath,
                fileUrl,
                document: doc
            }
        });
    } catch (error) {
        console.error('uploadApplicationDocument', error);
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createFinancialSupport = (req, res) => createRow(req, res, FinancialSupport, 'Financial support', {
    single: true,
    transformPayload: (payload) => ({
        ...payload,
        select_payment_option: payload.select_payment_option ?? payload.paymentOption,
        source_of_funds: payload.source_of_funds ?? payload.selfFundedSource,
        relationship_to_student: payload.relationship_to_student ?? payload.sponsorRelationship,
        employer_business_name: payload.employer_business_name ?? payload.sponsorEmployer,
        sponsor_street_address: payload.sponsor_street_address ?? payload.sponsorAddress,
        sponsor_postalcode: payload.sponsor_postalcode ?? payload.sponsorPostalCode,
        organization_name: payload.organization_name ?? payload.orgName,
        org_contact_person_title: payload.org_contact_person_title ?? payload.orgContactTitle,
        org_street_address: payload.org_street_address ?? payload.orgAddress,
        org_postal_code: payload.org_postal_code ?? payload.orgPostalCode,
        bank_checkbox: payload.bank_checkbox ?? payload.hasBankStatement,
        proof_of_income_checkbox: payload.proof_of_income_checkbox ?? payload.hasIncomeProof,
        sponsor_letter_checkbox: payload.sponsor_letter_checkbox ?? payload.hasSponsorLetter,
        scholarship_checkbox: payload.scholarship_checkbox ?? payload.hasScholarshipLetter,
        student_loan_checkbox: payload.student_loan_checkbox ?? payload.hasLoanApproval,
        student_certificate_check1: payload.student_certificate_check1 ?? payload.certifyAccurate,
        student_certificate_check2: payload.student_certificate_check2 ?? payload.certifyFinancialResponsibility,
        student_date_certification: payload.student_date_certification ?? payload.certifyDate,
        student_signature_method: payload.student_signature_method ?? payload.studentSignatureMethod,
        student_signature_typed: payload.student_signature_typed ?? payload.studentSignatureTyped,
        student_signature_upload: payload.student_signature_upload ?? payload.studentSignatureUpload,
        sponsor_org_certificate: payload.sponsor_org_certificate ?? payload.sponsorCertifySupport,
        sponsor_certification_date: payload.sponsor_certification_date ?? payload.sponsorCertifyDate,
        sponsor_signed_financial_form:
            payload.sponsor_signed_financial_form ?? payload.sponsorSignedFinancialForm
    }),
    touchTimestamps: true
});
exports.listFinancialSupport = (req, res) => listRows(req, res, FinancialSupport, 'Financial support');
exports.getFinancialSupport = (req, res) => getRow(req, res, FinancialSupport, 'Financial support');
exports.updateFinancialSupport = (req, res) => updateRow(req, res, FinancialSupport, 'Financial support', {
    transformPayload: (payload) => ({
        ...payload,
        select_payment_option: payload.select_payment_option ?? payload.paymentOption,
        source_of_funds: payload.source_of_funds ?? payload.selfFundedSource,
        relationship_to_student: payload.relationship_to_student ?? payload.sponsorRelationship,
        employer_business_name: payload.employer_business_name ?? payload.sponsorEmployer,
        sponsor_street_address: payload.sponsor_street_address ?? payload.sponsorAddress,
        sponsor_postalcode: payload.sponsor_postalcode ?? payload.sponsorPostalCode,
        organization_name: payload.organization_name ?? payload.orgName,
        org_contact_person_title: payload.org_contact_person_title ?? payload.orgContactTitle,
        org_street_address: payload.org_street_address ?? payload.orgAddress,
        org_postal_code: payload.org_postal_code ?? payload.orgPostalCode,
        bank_checkbox: payload.bank_checkbox ?? payload.hasBankStatement,
        proof_of_income_checkbox: payload.proof_of_income_checkbox ?? payload.hasIncomeProof,
        sponsor_letter_checkbox: payload.sponsor_letter_checkbox ?? payload.hasSponsorLetter,
        scholarship_checkbox: payload.scholarship_checkbox ?? payload.hasScholarshipLetter,
        student_loan_checkbox: payload.student_loan_checkbox ?? payload.hasLoanApproval,
        student_certificate_check1: payload.student_certificate_check1 ?? payload.certifyAccurate,
        student_certificate_check2: payload.student_certificate_check2 ?? payload.certifyFinancialResponsibility,
        student_date_certification: payload.student_date_certification ?? payload.certifyDate,
        student_signature_method: payload.student_signature_method ?? payload.studentSignatureMethod,
        student_signature_typed: payload.student_signature_typed ?? payload.studentSignatureTyped,
        student_signature_upload: payload.student_signature_upload ?? payload.studentSignatureUpload,
        sponsor_org_certificate: payload.sponsor_org_certificate ?? payload.sponsorCertifySupport,
        sponsor_certification_date: payload.sponsor_certification_date ?? payload.sponsorCertifyDate,
        sponsor_signed_financial_form:
            payload.sponsor_signed_financial_form ?? payload.sponsorSignedFinancialForm
    }),
    touchTimestamps: true
});
exports.deleteFinancialSupport = (req, res) => deleteRow(req, res, FinancialSupport, 'Financial support');
