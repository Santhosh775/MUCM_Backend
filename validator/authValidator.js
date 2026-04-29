const { body } = require('express-validator');

exports.validateRequestOtp = [
    body('email').trim().notEmpty().withMessage('email is required').isEmail().normalizeEmail()
];

exports.validateVerifyOtp = [
    body('email').trim().notEmpty().withMessage('email is required').isEmail().normalizeEmail(),
    body('otp').trim().notEmpty().withMessage('otp is required').matches(/^\d{6}$/).withMessage('OTP must be 6 digits')
];
