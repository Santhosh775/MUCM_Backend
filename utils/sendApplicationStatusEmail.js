const { sendBrevoRawEmail } = require('./brevo');

/**
 * Sends a transactional email via Brevo when an application's pipeline/status changes (admin UI).
 * Configure Brevo API key with BREVO_API_KEY or BREVO_OTP_API_KEY (see utils/brevo.js).
 * Set APPLICATION_STATUS_EMAIL_ENABLED=false to turn off sends.
 */

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function portalBaseUrl() {
    const explicit = process.env.APPLICATION_PORTAL_BASE_URL?.trim()
        || process.env.PUBLIC_PORTAL_URL?.trim()
        || process.env.PORTAL_APP_URL?.trim();
    return explicit?.replace(/\/+$/, '') || '';
}

async function sendApplicationStatusEmailToApplicant({
    to,
    toName,
    applicationRef,
    statusLabel,
    message
}) {
    if (process.env.APPLICATION_STATUS_EMAIL_ENABLED === 'false') {
        return { delivered: false, reason: 'disabled' };
    }

    const ref = escapeHtml(applicationRef);
    const label = escapeHtml(statusLabel);
    const bodyLine = escapeHtml(message);
    const portal = portalBaseUrl();
    const portalLinkHtml = portal
        ? `<p><a href="${escapeHtml(portal)}">Open application portal</a></p>`
        : '';
    const portalLinkText = portal ? `\n\nOpen application portal: ${portal}` : '';

    const defaultSubject =
        `[MUCM] Application ${applicationRef} — ${statusLabel}`.slice(0, 998);
    const subject = (
        process.env.APPLICATION_STATUS_EMAIL_SUBJECT?.trim()
        || defaultSubject
    ).slice(0, 998);

    const html = `
<p>Dear ${escapeHtml(toName || 'Applicant')},</p>
<p>${bodyLine}</p>
<ul>
  <li><strong>Application:</strong> ${ref}</li>
  <li><strong>Current status:</strong> ${label}</li>
</ul>
<p>If you have questions, reply to this email or use the contact options in your application portal.</p>
${portalLinkHtml}`;

    const text = [
        `Dear ${toName || 'Applicant'},`,
        '',
        message,
        '',
        `Application: ${applicationRef}`,
        `Current status: ${statusLabel}`,
        '',
        'If you have questions, reply to this email or use the contact options in your application portal.',
        portalLinkText
    ].join('\n');

    try {
        await sendBrevoRawEmail({
            to,
            toName: toName || 'Applicant',
            subject,
            htmlContent: html,
            textContent: text
        });
        return { delivered: true };
    } catch (err) {
        console.error('[Application status email] Brevo send failed:', err.message || err);
        return { delivered: false, reason: 'brevo_error' };
    }
}

module.exports = { sendApplicationStatusEmailToApplicant };
