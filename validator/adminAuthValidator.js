const { body } = require('express-validator');

exports.validateAdminRequestOtp = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .normalizeEmail({
            all_lowercase: true,
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            gmail_convert_googlemaildotcom: false,
            outlookdotcom_remove_subaddress: false,
            yahoo_remove_subaddress: false,
            icloud_remove_subaddress: false
        })
];

exports.validateAdminVerifyOtp = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .normalizeEmail({
            all_lowercase: true,
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            gmail_convert_googlemaildotcom: false,
            outlookdotcom_remove_subaddress: false,
            yahoo_remove_subaddress: false,
            icloud_remove_subaddress: false
        }),
    body('otp').trim().notEmpty().withMessage('otp is required').matches(/^\d{6}$/).withMessage('OTP must be 6 digits')
];
