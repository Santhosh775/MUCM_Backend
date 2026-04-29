const jwt = require('jsonwebtoken');

function jwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s) return 'mucm-jwt-dev-secret-change-in-production';
    return s;
}

function authenticatePortalJwt(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, jwtSecret());
        const sub = payload.sub;
        if (!sub) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        req.portalUserId = sub;
        req.portalUserEmail = payload.email;
        return next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

function assertSamePortalUser(req, res, next) {
    if (req.params.userId && req.params.userId !== req.portalUserId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
}

const authenticatePortalUser = [authenticatePortalJwt, assertSamePortalUser];

module.exports = {
    authenticatePortalJwt,
    assertSamePortalUser,
    authenticatePortalUser
};
