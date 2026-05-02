const { getTransport } = require('./mailTransport');

const DEFAULT_ADMISSIONS_TO = 'santhoshdeecodes@gmail.com';

function admissionsInbox() {
    return process.env.ADMISSIONS_TICKET_TO || DEFAULT_ADMISSIONS_TO;
}

/**
 * Notify admissions inbox of a new portal support ticket.
 * Uses same SMTP_* / MAIL_FROM configuration as OTP mail.
 */
async function sendSupportTicketToAdmissions({ ticketId, subject, message, applicantEmail }) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
    const to = admissionsInbox();
    const mailSubject = `[Application portal] ${subject}`;

    const text = [
        'A new support ticket was submitted from the application portal.',
        '',
        `Ticket ID: ${ticketId}`,
        `Applicant email: ${applicantEmail || '(unknown)'}`,
        '',
        'Subject:',
        subject,
        '',
        'Message:',
        message,
        '',
        'Reply directly to the applicant using their email when possible.'
    ].join('\n');

    const html = `
<p>A new support ticket was submitted from the application portal.</p>
<ul>
  <li><strong>Ticket ID:</strong> ${ticketId}</li>
  <li><strong>Applicant email:</strong> ${applicantEmail || '(unknown)'}</li>
</ul>
<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
<p><strong>Message:</strong></p>
<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(
        message
    )}</pre>`;

    const transport = getTransport();
    if (!transport) {
        console.warn(
            '[Support ticket] SMTP_HOST is not set — ticket email was not sent. Ticket is still stored in the database.'
        );
        return { delivered: false, reason: 'smtp_not_configured' };
    }

    await transport.sendMail({
        from,
        to,
        replyTo: applicantEmail || undefined,
        subject: mailSubject,
        text,
        html
    });

    return { delivered: true };
}

/**
 * Notify applicant when admin posts a reply to their support ticket.
 */
async function sendSupportTicketReplyToApplicant({ to, ticketId, subject, replyMessage }) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
    const mailSubject = `[MUCM support] Reply for ticket ${ticketId}`;
    const text = [
        'Your support ticket has a new reply from MUCM admin.',
        '',
        `Ticket ID: ${ticketId}`,
        `Original subject: ${subject}`,
        '',
        'Admin reply:',
        replyMessage
    ].join('\n');

    const html = `
<p>Your support ticket has a new reply from MUCM admin.</p>
<ul>
  <li><strong>Ticket ID:</strong> ${ticketId}</li>
  <li><strong>Original subject:</strong> ${escapeHtml(subject)}</li>
</ul>
<p><strong>Admin reply:</strong></p>
<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(
        replyMessage
    )}</pre>`;

    const transport = getTransport();
    if (!transport) {
        console.warn('[Support ticket] SMTP_HOST is not set — reply email was not sent.');
        return { delivered: false, reason: 'smtp_not_configured' };
    }

    await transport.sendMail({
        from,
        to,
        subject: mailSubject,
        text,
        html
    });

    return { delivered: true };
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

module.exports = { sendSupportTicketToAdmissions, sendSupportTicketReplyToApplicant, admissionsInbox };
