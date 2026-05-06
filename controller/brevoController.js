const { listBrevoTemplates, sendBrevoTemplateEmail, sendBrevoRawEmail } = require('../utils/brevo');
const {
    Application,
    PersonalDetails,
    Program,
    Intake,
    PipelineStage,
    ApplicationUser
} = require('../model/associations');
const { applyMergeTemplate } = require('../utils/sendComposeEmail');
const { Op } = require('sequelize');

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function plainToHtml(text) {
    return `<p style="margin:0 0 12px;font-family:sans-serif;font-size:14px;line-height:1.6;color:#111">${escapeHtml(text)
        .split(/\r?\n/)
        .join('<br/>')}</p>`;
}

function applicantDisplayName(pd) {
    if (!pd) return '';
    const pref = pd.preferred_name && String(pd.preferred_name).trim();
    if (pref) return pref;
    return [pd.first_name, pd.middle_name, pd.surname].filter((x) => x && String(x).trim()).join(' ');
}

async function resolveApplication(applicationPk, applicationRef) {
    if (!applicationPk && !applicationRef) return { appRow: null, studentUser: null };
    const where = { deleted_at: null };
    if (applicationPk) where.id = applicationPk;
    else where.application_id = applicationRef;

    const appRow = await Application.findOne({
        where,
        include: [
            { model: PersonalDetails, as: 'personal_details' },
            { model: Program, as: 'program', attributes: ['id', 'name', 'code'] },
            { model: Intake, as: 'intake', attributes: ['id', 'name', 'status'] },
            { model: PipelineStage, as: 'pipeline_stage', attributes: ['id', 'display_name', 'stage_key'] }
        ]
    });
    if (!appRow) return { appRow: null, studentUser: null };

    let studentUser = null;
    if (appRow.created_by) {
        studentUser = await ApplicationUser.findByPk(appRow.created_by, { attributes: ['id', 'email'] });
    }
    return { appRow, studentUser };
}

function buildMergeParams(appRow, studentUser, extra = {}) {
    const pd = appRow?.personal_details;
    const program = appRow?.program;
    const intake = appRow?.intake;
    const ps = appRow?.pipeline_stage;
    const formEmail = pd?.email || '';
    const portalEmail = studentUser?.email || '';

    return {
        applicant_name: applicantDisplayName(pd),
        application_id: appRow?.application_id || '',
        application_uuid: appRow?.id || '',
        student_email: formEmail || portalEmail,
        program: program?.name || '',
        intake: intake?.name || '',
        status: appRow?.current_status || '',
        pipeline_stage: ps?.display_name || '',
        ...extra
    };
}

function resolveRecipient(toRaw, appRow, studentUser) {
    const manual = toRaw ? String(toRaw).trim() : '';
    if (manual) return manual;
    const pdEmail = appRow?.personal_details?.email;
    if (pdEmail && String(pdEmail).trim()) return String(pdEmail).trim();
    if (studentUser?.email) return String(studentUser.email).trim();
    return '';
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GET /api/v1/brevo/templates                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Lists all active Brevo email templates.
 * Query: ?status=active|inactive&limit=50&offset=0
 */
exports.listTemplates = async (req, res) => {
    try {
        const status = req.query.status === 'inactive' ? 'inactive' : 'active';
        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const offset = Number(req.query.offset) || 0;

        const templates = await listBrevoTemplates({ templateStatus: status, limit, offset });
        return res.json({ success: true, count: templates.length, data: templates });
    } catch (error) {
        console.error('[Brevo] listTemplates error:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch Brevo templates' });
    }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  POST /api/v1/brevo/send                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Send a Brevo template email to a single recipient.
 *
 * Body:
 *   - template_id  (number, required) — Brevo template ID
 *   - to           (email, optional)  — recipient; resolved from application if omitted
 *   - to_name      (string, optional) — recipient display name
 *   - application_id / application_ref — used to resolve recipient & merge params
 *   - params       (object, optional) — extra Brevo {{params.xxx}} merge values
 */
exports.sendEmail = async (req, res) => {
    try {
        const templateId = req.body.template_id;
        if (!templateId) {
            return res.status(400).json({ success: false, message: 'template_id is required' });
        }

        const { appRow, studentUser } = await resolveApplication(
            req.body.application_id,
            req.body.application_ref ? String(req.body.application_ref).trim() : ''
        );

        const to = resolveRecipient(req.body.to, appRow, studentUser);
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Provide recipient to (email), or application_id / application_ref to resolve the student'
            });
        }

        const toName = req.body.to_name
            ? String(req.body.to_name).trim()
            : applicantDisplayName(appRow?.personal_details);

        const mergeParams = buildMergeParams(appRow, studentUser, req.body.params || {});

        const result = await sendBrevoTemplateEmail({
            to,
            toName,
            templateId: Number(templateId),
            params: mergeParams
        });

        return res.json({
            success: true,
            message: 'Email sent via Brevo',
            data: {
                to,
                templateId: Number(templateId),
                messageId: result.messageId,
                application_id: appRow?.id || null,
                application_ref: appRow?.application_id || null
            }
        });
    } catch (error) {
        console.error('[Brevo] sendEmail error:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Failed to send email via Brevo' });
    }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  POST /api/v1/brevo/send-raw                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Send a raw (non-template) email via Brevo.
 * This mirrors the existing composeEmail endpoint but uses Brevo delivery.
 *
 * Body:
 *   - to (required), to_name, subject (required), body (plain-text, required)
 *   - application_id / application_ref (optional for merge)
 */
exports.sendRawEmail = async (req, res) => {
    try {
        let subject = req.body.subject != null ? String(req.body.subject).trim() : '';
        let body = req.body.body != null ? String(req.body.body).trim() : '';

        if (!subject || !body) {
            return res.status(400).json({ success: false, message: 'subject and body are required' });
        }

        const { appRow, studentUser } = await resolveApplication(
            req.body.application_id,
            req.body.application_ref ? String(req.body.application_ref).trim() : ''
        );

        const mergeMap = buildMergeParams(appRow, studentUser);
        const mergedSubject = applyMergeTemplate(subject, mergeMap);
        const mergedBody = applyMergeTemplate(body, mergeMap);

        const to = resolveRecipient(req.body.to, appRow, studentUser);
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Provide recipient to (email), or application_id / application_ref to resolve the student'
            });
        }

        const toName = req.body.to_name
            ? String(req.body.to_name).trim()
            : applicantDisplayName(appRow?.personal_details);

        const result = await sendBrevoRawEmail({
            to,
            toName,
            subject: mergedSubject,
            htmlContent: plainToHtml(mergedBody),
            textContent: mergedBody
        });

        return res.json({
            success: true,
            message: 'Email sent via Brevo',
            data: {
                to,
                subject: mergedSubject,
                messageId: result.messageId,
                application_id: appRow?.id || null,
                application_ref: appRow?.application_id || null
            }
        });
    } catch (error) {
        console.error('[Brevo] sendRawEmail error:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Failed to send raw email via Brevo' });
    }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  POST /api/v1/brevo/send-bulk                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Send a Brevo template to multiple applicants filtered by program/intake/status.
 *
 * Body:
 *   - template_id  (number, required)
 *   - program_id   (uuid, optional)
 *   - intake_id    (uuid, optional)
 *   - status       (string, optional) — current_status value
 *   - dry_run      (boolean, optional) — if true, returns audience only (no send)
 */
exports.sendBulkEmail = async (req, res) => {
    try {
        const templateId = req.body.template_id;
        if (!templateId) {
            return res.status(400).json({ success: false, message: 'template_id is required' });
        }

        // Build audience filter
        const where = { deleted_at: null };
        if (req.body.status) where.current_status = req.body.status;

        const includeOpts = [
            { model: PersonalDetails, as: 'personal_details' },
            { model: Program, as: 'program', attributes: ['id', 'name', 'code'] },
            { model: Intake, as: 'intake', attributes: ['id', 'name', 'status'] }
        ];

        if (req.body.program_id) where['$program.id$'] = req.body.program_id;
        if (req.body.intake_id) where['$intake.id$'] = req.body.intake_id;

        const applications = await Application.findAll({
            where,
            include: includeOpts
        });

        // Resolve recipient emails
        const audience = [];
        for (const appRow of applications) {
            const pd = appRow.personal_details;
            const email = pd?.email;
            if (!email || !String(email).trim()) continue;

            let studentUser = null;
            if (appRow.created_by) {
                studentUser = await ApplicationUser.findByPk(appRow.created_by, { attributes: ['id', 'email'] });
            }

            audience.push({ appRow, studentUser, email: String(email).trim() });
        }

        if (req.body.dry_run) {
            return res.json({
                success: true,
                message: 'Dry run — no emails sent',
                data: { audienceCount: audience.length, templateId: Number(templateId) }
            });
        }

        // Send to each recipient
        const results = { sent: 0, failed: 0, errors: [] };
        for (const { appRow, studentUser, email } of audience) {
            try {
                const mergeParams = buildMergeParams(appRow, studentUser);
                const toName = applicantDisplayName(appRow.personal_details);
                await sendBrevoTemplateEmail({ to: email, toName, templateId: Number(templateId), params: mergeParams });
                results.sent++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email, reason: err.message });
                console.error(`[Brevo] bulk send failed for ${email}:`, err.message);
            }
        }

        return res.json({
            success: true,
            message: `Bulk send complete: ${results.sent} sent, ${results.failed} failed`,
            data: { templateId: Number(templateId), audienceCount: audience.length, ...results }
        });
    } catch (error) {
        console.error('[Brevo] sendBulkEmail error:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Failed to run bulk send via Brevo' });
    }
};
