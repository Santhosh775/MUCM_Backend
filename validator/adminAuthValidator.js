const { body } = require('express-validator');

exports.validateAdminRequestOtp = [
    body('email').trim().notEmpty().withMessage('email is required').isEmail().normalizeEmail()
];

exports.validateAdminVerifyOtp = [
    body('email').trim().notEmpty().withMessage('email is required').isEmail().normalizeEmail(),
    body('otp').trim().notEmpty().withMessage('otp is required').matches(/^\d{6}$/).withMessage('OTP must be 6 digits')
];
