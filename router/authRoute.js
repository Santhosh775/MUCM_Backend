const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controller/authController');
const { validateRequest } = require('../middleware/validateRequest');
const { validateRequestOtp, validateVerifyOtp } = require('../validator/authValidator');
const { authenticatePortalJwt } = require('../middleware/authenticatePortalUser');

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

router.post('/request-otp', otpRouteLimiter, validateRequestOtp, validateRequest, authController.requestOtp);
router.post('/verify-otp', otpRouteLimiter, validateVerifyOtp, validateRequest, authController.verifyOtp);
router.get('/me', authenticatePortalJwt, authController.me);

module.exports = router;
