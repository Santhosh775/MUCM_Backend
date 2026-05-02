const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const adminAuthController = require('../controller/adminAuthController');
const { validateRequest } = require('../middleware/validateRequest');
const { validateAdminRequestOtp, validateAdminVerifyOtp } = require('../validator/adminAuthValidator');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

const otpWindowMs = Number(process.env.AUTH_OTP_RATE_WINDOW_MS) || 15 * 60 * 1000;
const otpMaxPerWindow = Number(process.env.AUTH_OTP_RATE_MAX) || 40;

const otpRouteLimiter = rateLimit({
    windowMs: otpWindowMs,
    max: otpMaxPerWindow,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
    }
});

const requestOtpHandlers = [
    otpRouteLimiter,
    validateAdminRequestOtp,
    validateRequest,
    adminAuthController.requestOtp
];
const verifyOtpHandlers = [
    otpRouteLimiter,
    validateAdminVerifyOtp,
    validateRequest,
    adminAuthController.verifyOtp
];

router.post('/request-otp', ...requestOtpHandlers);
router.post('/send-otp', ...requestOtpHandlers);
router.post('/verify-otp', ...verifyOtpHandlers);
router.get('/me', authenticateAdminJwt, adminAuthController.me);

module.exports = router;
