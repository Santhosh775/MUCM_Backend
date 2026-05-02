const { getTransport } = require('./mailTransport');

/**
 * OTP email delivery via Nodemailer + SMTP.
 *
 * Works with any SMTP provider (Gmail/Workspace app password, Outlook, SendGrid SMTP,
 * AWS SES SMTP, Mailgun SMTP, university on-prem relay, etc.). Nodemailer does not
 * replace a reputable sender domain — configure SPF/DKIM/DMARC on your sending domain
 * for reliable delivery to international inboxes.
 *
 * Env:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE=true for 465
 *   SMTP_USER, SMTP_PASS (omit if relay allows unauthenticated LAN)
 *   MAIL_FROM — "MUCM Admissions <admissions@mucm.edu>"
 *   OTP_LOG_PLAINTEXT=true — log code (dev only)
 */

async function sendOtpToApplicant(email, otpPlaintext) {
    if (process.env.OTP_LOG_PLAINTEXT === 'true') {
        // eslint-disable-next-line no-console
        console.info(`[OTP] (dev log) to=${email} code=${otpPlaintext}`);
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
    const subject = process.env.OTP_EMAIL_SUBJECT || 'Your MUCM application verification code';

    const text = [
        'Use this code to sign in to the Metropolitan University College of Medicine application portal:',
        '',
        String(otpPlaintext),
        '',
        `This code expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.`,
        'If you did not request this, you can ignore this email.'
    ].join('\n');

    const html = `
<p>Use this code to sign in to the <strong>MUCM</strong> application portal:</p>
<p style="font-size:22px;font-weight:bold;letter-spacing:0.2em">${String(otpPlaintext)}</p>
<p style="color:#555">This code expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.</p>
<p style="color:#555;font-size:13px">If you did not request this, you can ignore this email.</p>`;

    const transport = getTransport();
    if (!transport) {
        console.warn(
            '[OTP] SMTP_HOST is not set — email was not sent. Configure SMTP_* env vars or use OTP_LOG_PLAINTEXT / OTP_RETURN_IN_RESPONSE for development.'
        );
        return { delivered: false, reason: 'smtp_not_configured' };
    }

    const info = await transport.sendMail({
        from,
        to: email,
        subject,
        text,
        html
    });

    const idSuffix = info.messageId ? ` (id ${info.messageId})` : '';
    // eslint-disable-next-line no-console
    console.info(`[OTP] SMTP accepted${idSuffix}`);

    return { delivered: true };
}

async function sendOtpToAdmin(email, otpPlaintext) {
    if (process.env.OTP_LOG_PLAINTEXT === 'true') {
        // eslint-disable-next-line no-console
        console.info(`[Admin OTP] (dev log) to=${email} code=${otpPlaintext}`);
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
    const subject = process.env.ADMIN_OTP_EMAIL_SUBJECT
        || process.env.OTP_EMAIL_SUBJECT
        || 'Your MUCM admin verification code';

    const text = [
        'Use this code to sign in to the Metropolitan University College of Medicine admin panel:',
        '',
        String(otpPlaintext),
        '',
        `This code expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.`,
        'If you did not request this, you can ignore this email.'
    ].join('\n');

    const html = `
<p>Use this code to sign in to the <strong>MUCM Admin Panel</strong>:</p>
<p style="font-size:22px;font-weight:bold;letter-spacing:0.2em">${String(otpPlaintext)}</p>
<p style="color:#555">This code expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.</p>
<p style="color:#555;font-size:13px">If you did not request this, you can ignore this email.</p>`;

    const transport = getTransport();
    if (!transport) {
        console.warn(
            '[Admin OTP] SMTP_HOST is not set — email was not sent. Configure SMTP_* env vars or use OTP_LOG_PLAINTEXT / OTP_RETURN_IN_RESPONSE for development.'
        );
        return { delivered: false, reason: 'smtp_not_configured' };
    }

    const info = await transport.sendMail({
        from,
        to: email,
        subject,
        text,
        html
    });

    const idSuffix = info.messageId ? ` (id ${info.messageId})` : '';
    // eslint-disable-next-line no-console
    console.info(`[Admin OTP] SMTP accepted${idSuffix}`);

    return { delivered: true };
}

module.exports = { sendOtpToApplicant, sendOtpToAdmin };
