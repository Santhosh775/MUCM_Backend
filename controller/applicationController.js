const {
    Application,
    ApplicationUser,
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
    FinancialSupport,
    PortalApplicationDraft,
    ApplicationStatusNotification
} = require('../model/associations');
const { generateApplicationId } = require('../utils/generateApplicationId');

const includeAll = [
    { model: PersonalDetails, as: 'personal_details' },
    { model: EmergencyContact, as: 'emergency_contacts' },
    { model: ParentGuardianInfo, as: 'parent_guardian_info' },
    { model: AcademicInstitution, as: 'academic_institutions' },
    { model: EnglishProficiency, as: 'english_proficiency' },
    { model: StandardizedTest, as: 'standardized_tests' },
    { model: AdmissionSought, as: 'admission_sought' },
    { model: Disclosure, as: 'disclosure' },
    { model: Experience, as: 'experiences' },
    { model: Document, as: 'document' },
    { model: FinancialSupport, as: 'financial_support' }
];

function trimTextOrNull(v) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

function clientIpToInteger(req) {
    const raw = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || '';
    const v4 = raw.replace(/^::ffff:/, '');
    const parts = v4.split('.');
    if (parts.length !== 4) return null;
    const n = parts.reduce((acc, p) => (acc << 8) + Number(p), 0);
    return Number.isFinite(n) ? n >>> 0 : null;
}

function shouldDeleteDraftAfterSubmit(app) {
    const status = String(app.current_status || '').toLowerCase();
    return (
        status === 'submitted'
        || status === 'completed'
        || app.is_complete === true
        || Number(app.completed_steps) >= 100
    );
}

function statusToLabel(statusKey) {
    const raw = String(statusKey || '').trim();
    if (!raw) return 'Updated';
    return raw
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

async function notifyUsersForStatusChange(app, nextStatusKey, nextStatusLabelInput) {
    if (!app?.id) return;

    const statusKey = String(nextStatusKey || '').trim();
    const statusLabel = String(nextStatusLabelInput || '').trim() || statusToLabel(statusKey);
    if (!statusKey && !statusLabel) return;

    const candidateIds = new Set();
    if (app.student_id) candidateIds.add(String(app.student_id));
    if (app.created_by) candidateIds.add(String(app.created_by));
    if (app.updated_by) candidateIds.add(String(app.updated_by));

    const draftRows = await PortalApplicationDraft.findAll({
        where: { application_id: app.id },
        attributes: ['user_id']
    });
    for (const draft of draftRows) {
        if (draft?.user_id) candidateIds.add(String(draft.user_id));
    }

    const candidateArray = Array.from(candidateIds);
    const validUsers = candidateArray.length > 0
        ? await ApplicationUser.findAll({
            where: { id: candidateArray },
            attributes: ['id']
        })
        : [];
    const recipientIds = new Set(validUsers.map((row) => String(row.id)));

    if (recipientIds.size === 0) {
        const personal = await PersonalDetails.findOne({
            where: { application_id: app.id },
            attributes: ['email']
        });
        const email = String(personal?.email || '').trim().toLowerCase();
        if (email) {
            const portalUser = await ApplicationUser.findOne({
                where: { email },
                attributes: ['id']
            });
            if (portalUser?.id) {
                recipientIds.add(String(portalUser.id));
            }
        }
    }

    if (recipientIds.size === 0) {
        console.warn('notifyUsersForStatusChange: no valid recipient found', {
            application_row_id: app.id,
            application_id: app.application_id
        });
        return;
    }

    const message = `Your application ${app.application_id} status changed to ${statusLabel}.`;
    try {
        await ApplicationStatusNotification.bulkCreate(
            Array.from(recipientIds).map((userId) => ({
                user_id: userId,
                application_row_id: app.id,
                application_id: app.application_id,
                status_key: statusKey || null,
                status_label: statusLabel || null,
                message,
                is_read: false
            }))
        );
    } catch (error) {
        console.error('notifyUsersForStatusChange: insert failed', {
            application_row_id: app.id,
            application_id: app.application_id,
            recipients: Array.from(recipientIds),
            error: error?.message || error
        });
        throw error;
    }
}

async function syncReviewSignatureDocument(applicationId, reviewSignatureUpload) {
    if (!applicationId) return;
    if (reviewSignatureUpload === undefined) return;

    const now = new Date();
    const [doc] = await Document.findOrCreate({
        where: { application_id: applicationId },
        defaults: {
            application_id: applicationId,
            upload_progress: false,
            review_signature_document: '',
            created_at: now,
            updated_at: now
        }
    });

    const normalizedSignature = (() => {
        if (reviewSignatureUpload === null) return null;
        const text = String(reviewSignatureUpload || '').trim();
        return text === '' ? null : text;
    })();

    await doc.update({
        review_signature_document: normalizedSignature,
        updated_at: now
    });
}

exports.createApplication = async (req, res) => {
    try {
        const application_id = req.body.application_id || (await generateApplicationId());
        const existing = await Application.findOne({ where: { application_id } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'application_id already exists' });
        }

        const ip = clientIpToInteger(req);
        const row = await Application.create({
            application_id,
            tenant_id: req.body.tenant_id ?? null,
            lead_id: req.body.lead_id ?? null,
            student_id: req.body.student_id ?? null,
            program_id: req.body.program_id ?? null,
            intake_id: req.body.intake_id ?? null,
            pipeline_stage_id: req.body.pipeline_stage_id ?? null,
            current_status: req.body.current_status ?? 'draft',
            submitted_at: req.body.submitted_at ?? null,
            referral_code: req.body.referral_code ?? null,
            lead_source: req.body.lead_source ?? null,
            crm_reference_id: req.body.crm_reference_id ?? null,
            correlation_method: req.body.correlation_method ?? null,
            ip_address: req.body.ip_address ?? ip,
            user_agent: req.body.user_agent ?? req.get('user-agent') ?? null,
            completed_steps: req.body.completed_steps ?? null,
            is_complete: req.body.is_complete ?? null,
            /** Filled in portal step 4; optional on draft create */
            why_medicine: trimTextOrNull(req.body.why_medicine),
            why_mucm: trimTextOrNull(req.body.why_mucm),
            personal_statement: trimTextOrNull(req.body.personal_statement),
            application_agreement_accepted: req.body.application_agreement_accepted ?? null,
            application_agreement_at: req.body.application_agreement_at ?? null,
            review_signature_method: req.body.review_signature_method ?? null,
            review_signature_typed: req.body.review_signature_typed ?? null,
            review_signature_upload: req.body.review_signature_upload ?? null,
            created_by: req.body.created_by ?? null,
            updated_by: req.body.updated_by ?? null
        });

        await syncReviewSignatureDocument(row.id, req.body.review_signature_upload);

        return res.status(201).json({ success: true, message: 'Application created', data: row });
    } catch (error) {
        console.error('createApplication', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listApplications = async (req, res) => {
    try {
        const { status, program_id, intake_id, page = 1, limit = 20 } = req.query;
        const where = { deleted_at: null };
        if (status) where.current_status = status;
        if (program_id) where.program_id = program_id;
        if (intake_id) where.intake_id = intake_id;

        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = await Application.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: Math.min(Number(limit) || 20, 100),
            offset: Math.max(offset, 0)
        });

        return res.json({
            success: true,
            data: rows,
            pagination: { total: count, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        console.error('listApplications', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const full = req.query.full === 'true' || req.query.full === '1';

        const app = await Application.findOne({
            where: { id, deleted_at: null },
            include: full ? includeAll : []
        });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        return res.json({ success: true, data: app });
    } catch (error) {
        console.error('getApplicationById', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getApplicationByApplicationId = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const full = req.query.full === 'true' || req.query.full === '1';

        const app = await Application.findOne({
            where: { application_id: applicationId, deleted_at: null },
            include: full ? includeAll : []
        });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        return res.json({ success: true, data: app });
    } catch (error) {
        console.error('getApplicationByApplicationId', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const app = await Application.findOne({ where: { id, deleted_at: null } });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const allowed = [
            'tenant_id', 'lead_id', 'student_id', 'program_id', 'intake_id', 'pipeline_stage_id',
            'current_status', 'submitted_at', 'referral_code', 'lead_source', 'crm_reference_id',
            'correlation_method', 'ip_address', 'user_agent', 'completed_steps', 'is_complete',
            'created_by', 'updated_by',
            'why_medicine', 'why_mucm', 'personal_statement',
            'application_agreement_accepted', 'application_agreement_at',
            'review_signature_method', 'review_signature_typed', 'review_signature_upload'
        ];
        const payload = {};
        for (const k of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        }

        const previousStatus = app.current_status;
        await app.update(payload);

        await syncReviewSignatureDocument(app.id, payload.review_signature_upload);

        const statusChanged =
            Object.prototype.hasOwnProperty.call(payload, 'current_status')
            && String(previousStatus || '') !== String(payload.current_status || '');
        if (statusChanged) {
            await notifyUsersForStatusChange(app, payload.current_status, req.body.status_label);
        }

        if (shouldDeleteDraftAfterSubmit(app)) {
            await PortalApplicationDraft.destroy({
                where: { application_id: app.id }
            });
        }

        return res.json({ success: true, message: 'Application updated', data: app });
    } catch (error) {
        console.error('updateApplication', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateApplicationStatusByApplicationId = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const app = await Application.findOne({
            where: { application_id: applicationId, deleted_at: null }
        });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const payload = {};
        const previousStatus = app.current_status;
        if (Object.prototype.hasOwnProperty.call(req.body, 'current_status')) {
            payload.current_status = req.body.current_status;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'pipeline_stage_id')) {
            payload.pipeline_stage_id = req.body.pipeline_stage_id;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'updated_by')) {
            payload.updated_by = req.body.updated_by;
        }

        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ success: false, message: 'No status fields provided.' });
        }

        await app.update(payload);

        if (req.body?.updated_by) {
            app.updated_by = req.body.updated_by;
        }

        const statusChanged =
            Object.prototype.hasOwnProperty.call(payload, 'current_status')
            && String(previousStatus || '') !== String(payload.current_status || '');
        if (statusChanged) {
            await notifyUsersForStatusChange(app, payload.current_status, req.body.status_label);
        }

        return res.json({ success: true, message: 'Application status updated', data: app });
    } catch (error) {
        console.error('updateApplicationStatusByApplicationId', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.softDeleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const app = await Application.findOne({ where: { id, deleted_at: null } });
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        await app.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        console.error('softDeleteApplication', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
