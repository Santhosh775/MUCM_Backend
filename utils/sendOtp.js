const { sendBrevoRawEmail } = require('./brevo');

/**
 * OTP email delivery via Brevo.
 *
 * Env:
 *   BREVO_API_KEY
 *   BREVO_SENDER_NAME
 *   BREVO_SENDER_EMAIL
 *   OTP_EMAIL_SUBJECT
 *   OTP_LOG_PLAINTEXT=true — log code (dev only)
 */

async function sendOtpToApplicant(email, otpPlaintext) {
    if (process.env.OTP_LOG_PLAINTEXT === 'true') {
        // eslint-disable-next-line no-console
        console.info(`[OTP] (dev log) to=${email} code=${otpPlaintext}`);
    }

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

    try {
        const result = await sendBrevoRawEmail({
            to: email,
            subject,
            htmlContent: html,
            textContent: text
        });

        if (result.delivered) {
            const idSuffix = result.messageId ? ` (id ${result.messageId})` : '';
            // eslint-disable-next-line no-console
            console.info(`[OTP] Brevo accepted${idSuffix}`);
            return { delivered: true };
        }
        return { delivered: false, reason: 'brevo_error', message: result.error || 'Unknown Brevo error' };
    } catch (err) {
        console.error('[OTP] Brevo send failed:', err.message || err);
        return { delivered: false, reason: 'brevo_exception', message: err.message };
    }
}

async function sendOtpToAdmin(email, otpPlaintext) {
    if (process.env.OTP_LOG_PLAINTEXT === 'true') {
        // eslint-disable-next-line no-console
        console.info(`[Admin OTP] (dev log) to=${email} code=${otpPlaintext}`);
    }

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

    try {
        const result = await sendBrevoRawEmail({
            to: email,
            subject,
            htmlContent: html,
            textContent: text
        });

        if (result.delivered) {
            const idSuffix = result.messageId ? ` (id ${result.messageId})` : '';
            // eslint-disable-next-line no-console
            console.info(`[Admin OTP] Brevo accepted${idSuffix}`);
            return { delivered: true };
        }
        return { delivered: false, reason: 'brevo_error', message: result.error || 'Unknown Brevo error' };
    } catch (err) {
        console.error('[Admin OTP] Brevo send failed:', err.message || err);
        return { delivered: false, reason: 'brevo_exception', message: err.message };
    }
}

module.exports = { sendOtpToApplicant, sendOtpToAdmin };

