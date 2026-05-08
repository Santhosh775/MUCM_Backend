const { BrevoClient } = require('@getbrevo/brevo');

let _client = null;

/**
 * Returns a configured BrevoClient instance.
 */
function getBrevoClient() {
    if (_client) return _client;

    const apiKey = process.env.BREVO_OTP_API_KEY || process.env.BREVO_API_KEY;
    if (!apiKey || apiKey === 'your-brevo-api-key-here') {
        throw new Error('Brevo API key is not configured (check BREVO_OTP_API_KEY or BREVO_API_KEY in .env).');
    }

    _client = new BrevoClient({ apiKey });
    return _client;
}

/**
 * Fetch all email templates from Brevo.
 */
async function listBrevoTemplates(opts = {}) {
    const client = getBrevoClient();
    const templateStatus = opts.templateStatus === 'inactive' ? false : true;
    const limit = opts.limit || 50;
    const offset = opts.offset || 0;

    try {
        const data = await client.transactionalEmails.getSmtpTemplates({
            templateStatus,
            limit,
            offset
        });
        const templates = data?.templates || [];
        return templates.map((t) => ({
            id: t.id,
            name: t.name,
            subject: t.subject,
            isActive: t.isActive !== false,
            createdAt: t.createdAt || null,
            modifiedAt: t.modifiedAt || null,
            htmlContent: t.htmlContent || null,
            sender: t.sender || null,
            replyTo: t.replyTo || null,
            toField: t.toField || null,
            tag: t.tag || null,
            htmlContentPreview: (t.htmlContent || '').replace(/<[^>]+>/g, '').slice(0, 220),
        }));
    } catch (err) {
        console.error('[Brevo] listBrevoTemplates error:', err.message);
        throw err;
    }
}

/**
 * Send a single transactional email via Brevo template.
 */
async function sendBrevoTemplateEmail({ to, toName, templateId, params = {} }) {
    const client = getBrevoClient();

    const sendSmtpEmail = {
        templateId: Number(templateId),
        to: [{ email: String(to).trim(), name: toName || 'Recipient' }]
    };
    
    if (Object.keys(params).length > 0) {
        sendSmtpEmail.params = params;
    }

    try {
        console.info(`[Brevo] Sending template ${templateId} to ${to}`);
        const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
        console.info(`[Brevo] Template sent. MessageId: ${result?.messageId || 'unknown'}`);
        return { delivered: true, messageId: result?.messageId || null };
    } catch (err) {
        console.error('[Brevo] sendBrevoTemplateEmail error:', err.message);
        throw new Error(`Brevo send failed: ${err.message}`);
    }
}

/**
 * Send a transactional email via raw subject + HTML body.
 */
async function sendBrevoRawEmail({ to, toName, subject, htmlContent, textContent }) {
    const client = getBrevoClient();

    const senderName = process.env.BREVO_SENDER_NAME || 'MUCM Admissions';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'naveen.l@muantigua.org';

    const sendSmtpEmail = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: String(to).trim(), name: toName || 'Recipient' }],
        subject: subject,
        htmlContent: htmlContent
    };

    if (textContent) {
        sendSmtpEmail.textContent = textContent;
    }

    try {
        console.info(`[Brevo] Sending raw email to ${to} from ${senderEmail}`);
        const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
        console.info(`[Brevo] Raw email sent. MessageId: ${result?.messageId || 'unknown'}`);
        return { delivered: true, messageId: result?.messageId || null };
    } catch (err) {
        console.error('[Brevo] sendBrevoRawEmail error:', err.message);
        throw new Error(`Brevo send failed: ${err.message}`);
    }
}

module.exports = { listBrevoTemplates, sendBrevoTemplateEmail, sendBrevoRawEmail };
