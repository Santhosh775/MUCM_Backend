const jwt = require('jsonwebtoken');
const { Admin, AdminRole, AdminUser } = require('../model/associations');
const { hashOtp, generateSixDigitOtp } = require('../utils/otp');
const { sendOtpToAdmin } = require('../utils/sendOtp');

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

function signAdminToken(adminUser, admin) {
    return jwt.sign(
        { sub: adminUser.id, admin_id: admin.id, email: admin.email, typ: 'admin' },
        jwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

const OTP_TTL_MS = () => (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;
const MIN_RESEND_MS = () => (Number(process.env.OTP_MIN_RESEND_SECONDS) || 60) * 1000;

async function findAuthorizedAdmin(email) {
    return Admin.findOne({
        where: { email, deleted_at: null, is_active: true },
        include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'], required: false }]
    });
}

exports.requestOtp = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) {
            return res.status(400).json({ success: false, message: 'email is required' });
        }

        const admin = await findAuthorizedAdmin(email);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'This email is not authorized for admin login'
            });
        }
        if (admin.role && admin.role.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'Admin role is inactive'
            });
        }

        const [adminUser] = await AdminUser.findOrCreate({
            where: { admin_id: admin.id },
            defaults: {
                admin_id: admin.id,
                email: admin.email,
                is_active: true
            }
        });

        if (!adminUser.is_active) {
            return res.status(403).json({ success: false, message: 'Admin login is disabled for this account' });
        }

        if (adminUser.email !== admin.email) {
            await adminUser.update({ email: admin.email });
        }

        const now = Date.now();
        if (adminUser.last_otp_sent_at) {
            const elapsed = now - new Date(adminUser.last_otp_sent_at).getTime();
            if (elapsed < MIN_RESEND_MS()) {
                return res.status(429).json({
                    success: false,
                    message: 'Please wait before requesting another OTP',
                    retry_after_seconds: Math.ceil((MIN_RESEND_MS() - elapsed) / 1000)
                });
            }
        }

        const otp = generateSixDigitOtp();
        const otpHash = hashOtp(admin.email, otp);
        const expires = new Date(now + OTP_TTL_MS());
        const previousLastOtpSentAt = adminUser.last_otp_sent_at;

        await adminUser.update({
            otp_code_hash: otpHash,
            otp_expires_at: expires,
            last_otp_sent_at: new Date(now)
        });

        const sendResult = await sendOtpToAdmin(admin.email, otp);
        if (!sendResult.delivered) {
            await adminUser.update({
                otp_code_hash: null,
                otp_expires_at: null,
                last_otp_sent_at: previousLastOtpSentAt || null
            });
            const msg = sendResult.message || 'Email could not be sent. Try again later.';
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
        console.error('adminAuth.requestOtp', error);
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

        const admin = await findAuthorizedAdmin(email);
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'This email is not authorized for admin login'
            });
        }
        if (admin.role && admin.role.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'Admin role is inactive'
            });
        }

        const adminUser = await AdminUser.findOne({ where: { admin_id: admin.id } });
        if (!adminUser) {
            return res.status(401).json({ success: false, message: 'Request OTP first' });
        }
        if (!adminUser.is_active) {
            return res.status(403).json({ success: false, message: 'Admin login is disabled for this account' });
        }
        if (!adminUser.otp_code_hash || !adminUser.otp_expires_at) {
            return res.status(401).json({ success: false, message: 'Request OTP first' });
        }
        if (new Date(adminUser.otp_expires_at).getTime() < Date.now()) {
            return res.status(401).json({ success: false, message: 'OTP has expired' });
        }
        if (adminUser.otp_code_hash !== hashOtp(admin.email, otp)) {
            return res.status(401).json({ success: false, message: 'Invalid email or OTP' });
        }

        const now = new Date();
        await adminUser.update({
            email: admin.email,
            otp_code_hash: null,
            otp_expires_at: null,
            email_verified_at: adminUser.email_verified_at || now,
            last_login_at: now
        });
        await adminUser.reload();

        const token = signAdminToken(adminUser, admin);
        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: adminUser.id,
                    admin_id: admin.id,
                    full_name: admin.full_name,
                    email: admin.email,
                    country: admin.country || null,
                    role_id: admin.role_id,
                    role_name: admin.role?.name || null,
                    permissions: admin.permissions && typeof admin.permissions === 'object' ? admin.permissions : null,
                    email_verified_at: adminUser.email_verified_at
                },
                token,
                token_type: 'Bearer'
            }
        });
    } catch (error) {
        console.error('adminAuth.verifyOtp', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.me = async (req, res) => {
    try {
        const adminUser = await AdminUser.findByPk(req.adminUserId);
        if (!adminUser || !adminUser.is_active) {
            return res.status(404).json({ success: false, message: 'Admin user not found' });
        }

        const admin = await Admin.findOne({
            where: { id: adminUser.admin_id, deleted_at: null, is_active: true },
            include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'], required: false }]
        });
        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin account is not authorized' });
        }
        if (admin.role && admin.role.is_active === false) {
            return res.status(403).json({ success: false, message: 'Admin role is inactive' });
        }

        return res.json({
            success: true,
            data: {
                id: adminUser.id,
                admin_id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
                country: admin.country || null,
                role_id: admin.role_id,
                role_name: admin.role?.name || null,
                permissions: admin.permissions && typeof admin.permissions === 'object' ? admin.permissions : null,
                email_verified_at: adminUser.email_verified_at,
                last_login_at: adminUser.last_login_at
            }
        });
    } catch (error) {
        console.error('adminAuth.me', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
