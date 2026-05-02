const {
    Application,
    PersonalDetails,
    Program,
    Intake,
    PipelineStage,
    ApplicationUser,
    EmailTemplate
} = require('../model/associations');
const { applyMergeTemplate, sendComposeEmail } = require('../utils/sendComposeEmail');

function applicantDisplayName(pd) {
    if (!pd) return '';
    const pref = pd.preferred_name && String(pd.preferred_name).trim();
    if (pref) return pref;
    return [pd.first_name, pd.middle_name, pd.surname].filter((x) => x && String(x).trim()).join(' ');
}

async function loadApplicationForCompose(req) {
    const applicationPk = req.body.application_id;
    const applicationRef = req.body.application_ref ? String(req.body.application_ref).trim() : '';

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
            {
                model: PipelineStage,
                as: 'pipeline_stage',
                attributes: ['id', 'display_name', 'stage_key']
            }
        ]
    });

    if (!appRow) return { appRow: null, studentUser: null };

    let studentUser = null;
    if (appRow.created_by) {
        studentUser = await ApplicationUser.findByPk(appRow.created_by, {
            attributes: ['id', 'email']
        });
    }

    return { appRow, studentUser };
}

function buildMergeMap(appRow, studentUser) {
    const pd = appRow?.personal_details;
    const program = appRow?.program;
    const intake = appRow?.intake;
    const ps = appRow?.pipeline_stage;
    const portalEmail = studentUser?.email || '';
    const formEmail = pd?.email || '';

    return {
        applicant_name: applicantDisplayName(pd),
        application_id: appRow?.application_id || '',
        application_uuid: appRow?.id || '',
        student_email: formEmail || portalEmail,
        program: program?.name || '',
        intake: intake?.name || '',
        status: appRow?.current_status || '',
        pipeline_stage: ps?.display_name || ''
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

exports.sendToStudent = async (req, res) => {
    try {
        const { appRow, studentUser } = await loadApplicationForCompose(req);

        const templateId = req.body.template_id;
        let subject = req.body.subject != null ? String(req.body.subject) : '';
        let body = req.body.body != null ? String(req.body.body) : '';

        if (templateId) {
            const tmpl = await EmailTemplate.findOne({
                where: { id: templateId, deleted_at: null }
            });
            if (!tmpl) {
                return res.status(404).json({ success: false, message: 'Email template not found' });
            }
            if (!subject.trim()) subject = tmpl.subject;
            if (!body.trim()) body = tmpl.body;
        }

        if (!subject.trim() || !body.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Provide subject and body, or a template_id with template content'
            });
        }

        if (!appRow && !req.body.to) {
            return res.status(400).json({
                success: false,
                message: 'Provide recipient to (email), or application_id / application_ref to resolve the student'
            });
        }

        const mergeMap = buildMergeMap(appRow, studentUser);
        const mergedSubject = applyMergeTemplate(subject, mergeMap);
        const mergedBody = applyMergeTemplate(body, mergeMap);

        const to = resolveRecipient(req.body.to, appRow, studentUser);
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Could not resolve student email; provide to explicitly'
            });
        }

        const sendResult = await sendComposeEmail({
            to,
            subject: mergedSubject,
            body: mergedBody
        });

        return res.json({
            success: true,
            message: sendResult.delivered ? 'Email sent' : 'Email could not be sent (check SMTP configuration)',
            data: {
                to,
                subject: mergedSubject,
                delivered: sendResult.delivered,
                reason: sendResult.reason || null,
                application_id: appRow?.id || null,
                application_ref: appRow?.application_id || null
            }
        });
    } catch (error) {
        console.error('compose sendToStudent', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
