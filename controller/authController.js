const jwt = require('jsonwebtoken');
const { ApplicationUser, ApplicationUserLogin } = require('../model/associations');
const { hashOtp, generateSixDigitOtp } = require('../utils/otp');
const { sendOtpToApplicant } = require('../utils/sendOtp');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function jwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s) {
        console.warn('JWT_SECRET is not set; using insecure dev default');
        return 'mucm-jwt-dev-secret-change-in-production';
    }
    return s;
}

function signPortalToken(userId, email) {
    return jwt.sign(
        { sub: userId, email },
        jwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

function clientIp(req) {
    const raw = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || '';
    return raw.replace(/^::ffff:/, '') || null;
}

const OTP_TTL_MS = () => (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;
const MIN_RESEND_MS = () => (Number(process.env.OTP_MIN_RESEND_SECONDS) || 60) * 1000;

exports.requestOtp = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) {
            return res.status(400).json({ success: false, message: 'email is required' });
        }

        const [user] = await ApplicationUser.findOrCreate({
            where: { email },
            defaults: { email, is_active: true }
        });

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is disabled' });
        }

        const now = Date.now();
        if (user.last_otp_sent_at) {
            const elapsed = now - new Date(user.last_otp_sent_at).getTime();
            if (elapsed < MIN_RESEND_MS()) {
                return res.status(429).json({
                    success: false,
                    message: 'Please wait before requesting another OTP',
                    retry_after_seconds: Math.ceil((MIN_RESEND_MS() - elapsed) / 1000)
                });
            }
        }

        const otp = generateSixDigitOtp();
        const otpHash = hashOtp(email, otp);
        const expires = new Date(now + OTP_TTL_MS());
        const previousLastOtpSentAt = user.last_otp_sent_at;

        await user.update({
            otp_code_hash: otpHash,
            otp_expires_at: expires,
            last_otp_sent_at: new Date(now)
        });

        const sendResult = await sendOtpToApplicant(email, otp);
        if (!sendResult.delivered) {
            await user.update({
                otp_code_hash: null,
                otp_expires_at: null,
                last_otp_sent_at: previousLastOtpSentAt || null
            });
            const msg =
                sendResult.reason === 'smtp_not_configured'
                    ? 'Email could not be sent. Configure SMTP (SMTP_HOST, MAIL_FROM, etc.) on the server.'
                    : 'Email could not be sent. Try again later.';
            return res.status(503).json({ success: false, message: msg });
        }

        const payload = {
            success: true,
            message: 'A verification code has been sent to your email.'
        };
        if (process.env.OTP_RETURN_IN_RESPONSE === 'true') {
            payload.dev_otp = otp;
        }
        return res.json(payload);
    } catch (error) {
        console.error('requestOtp', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const otp = String(req.body.otp || '').trim();
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'email and otp are required' });
        }

        const demoEnabled = process.env.ALLOW_DEMO_OTP === 'true';
        const demoEmail = normalizeEmail(process.env.DEMO_OTP_EMAIL || 'demo@mucm.edu');
        const demoCode = String(process.env.DEMO_OTP_CODE || '123456');

        let user = await ApplicationUser.findOne({ where: { email } });
        let valid = false;

        if (demoEnabled && email === demoEmail && otp === demoCode) {
            valid = true;
            if (!user) {
                user = await ApplicationUser.create({
                    email,
                    is_active: true,
                    email_verified_at: new Date()
                });
            }
        } else {
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or OTP' });
            }
            if (!user.is_active) {
                return res.status(403).json({ success: false, message: 'Account is disabled' });
            }
            if (user.otp_code_hash && user.otp_expires_at) {
                if (new Date(user.otp_expires_at).getTime() < Date.now()) {
                    return res.status(401).json({ success: false, message: 'OTP has expired' });
                }
                valid = user.otp_code_hash === hashOtp(email, otp);
            }
        }

        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid email or OTP' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is disabled' });
        }

        const now = new Date();
        await user.update({
            otp_code_hash: null,
            otp_expires_at: null,
            email_verified_at: user.email_verified_at || now,
            last_login_at: now
        });
        await user.reload();

        await ApplicationUserLogin.create({
            user_id: user.id,
            ip_address: clientIp(req),
            user_agent: req.get('user-agent') || null
        });

        const token = signPortalToken(user.id, user.email);
        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    email_verified_at: user.email_verified_at
                },
                token,
                token_type: 'Bearer'
            }
        });
    } catch (error) {
        console.error('verifyOtp', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.me = async (req, res) => {
    try {
        const userId = req.portalUserId;
        const user = await ApplicationUser.findByPk(userId);
        if (!user || !user.is_active) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                email_verified_at: user.email_verified_at,
                last_login_at: user.last_login_at
            }
        });
    } catch (error) {
        console.error('me', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
