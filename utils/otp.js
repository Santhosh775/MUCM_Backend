const crypto = require('crypto');

function otpPepper() {
    return process.env.OTP_PEPPER || 'mucm-otp-dev-pepper-change-in-production';
}

function hashOtp(email, otp) {
    return crypto.createHmac('sha256', otpPepper())
        .update(`${String(email).toLowerCase().trim()}:${String(otp)}`)
        .digest('hex');
}

function generateSixDigitOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { hashOtp, generateSixDigitOtp };
