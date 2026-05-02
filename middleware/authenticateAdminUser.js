const jwt = require('jsonwebtoken');

function jwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s) return 'mucm-jwt-dev-secret-change-in-production';
    return s;
}

function authenticateAdminJwt(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, jwtSecret());
        if (payload.typ !== 'admin') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (!payload.sub || !payload.admin_id) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        req.adminUserId = payload.sub;
        req.adminId = payload.admin_id;
        req.adminEmail = payload.email;
        return next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

module.exports = { authenticateAdminJwt };
