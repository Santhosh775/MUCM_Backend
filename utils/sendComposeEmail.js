const { sendBrevoRawEmail } = require('./brevo');

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces {{token}} placeholders (case-insensitive token name) using a flat map.
 */
function applyMergeTemplate(str, map) {
    if (str == null) return '';
    let out = String(str);
    for (const [key, value] of Object.entries(map)) {
        const re = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'gi');
        out = out.replace(re, value == null ? '' : String(value));
    }
    return out;
}

function deriveBodyPreview(body, maxLen = 220) {
    const t = String(body || '').trim();
    if (t.length <= maxLen) return t;
    return `${t.slice(0, maxLen - 1)}…`;
}

async function sendComposeEmail({ to, subject, body }) {
    const html = `<p style="margin:0 0 12px;font-family:sans-serif;font-size:14px;line-height:1.5;color:#111">${escapeHtml(
        body
    )
        .split(/\r?\n/)
        .join('<br/>')}</p>`;

    try {
        await sendBrevoRawEmail({
            to,
            subject: String(subject || '').trim() || '(no subject)',
            htmlContent: html,
            textContent: String(body || '')
        });
        return { delivered: true };
    } catch (err) {
        console.error('[Compose email] Brevo send failed:', err.message || err);
        return { delivered: false, reason: 'brevo_error' };
    }
}

module.exports = {
    escapeHtml,
    applyMergeTemplate,
    deriveBodyPreview,
    sendComposeEmail
};

