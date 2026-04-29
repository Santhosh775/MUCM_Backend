const nodemailer = require('nodemailer');

let transporterCache = null;

/**
 * Shared SMTP transport (OTP, support tickets, etc.).
 * Env: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
 */
function getTransport() {
    const host = process.env.SMTP_HOST;
    if (!host) return null;

    if (transporterCache) return transporterCache;

    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    transporterCache = nodemailer.createTransport({
        host,
        port,
        secure,
        auth:
            process.env.SMTP_USER || process.env.SMTP_PASS
                ? {
                      user: process.env.SMTP_USER || '',
                      pass: process.env.SMTP_PASS || ''
                  }
                : undefined
    });

    return transporterCache;
}

/**
 * Optional startup check — portal UI copy references "[SMTP] Verified" in the backend terminal.
 */
async function verifySmtpOnStartup() {
    const host = process.env.SMTP_HOST;
    if (!host) {
        console.info('[SMTP] Skipped (SMTP_HOST not set). Configure SMTP_* to send OTP emails.');
        return;
    }
    const transport = getTransport();
    if (!transport) return;
    try {
        await transport.verify();
        console.info('[SMTP] Verified');
    } catch (err) {
        console.error('[SMTP] Verification failed:', err.message || err);
    }
}

module.exports = { getTransport, verifySmtpOnStartup };
