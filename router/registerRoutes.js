const applicationRoute = require('./applicationRoute');
const authRoute = require('./authRoute');
const portalUserRoute = require('./portalUserRoute');
const crmRoute = require('./crmRoute');
const faqRoute = require('./faqRoute');
const faqCategoryRoute = require('./faqCategoryRoute');
const supportTicketRoute = require('./supportTicketRoute');
const adminRoute = require('./adminRoute');
const adminRoleRoute = require('./adminRoleRoute');

/**
 * Mounts all HTTP API routers. Kept separate from Express bootstrap so the app
 * factory stays small and routes are easy to extend (admin API, webhooks, etc.).
 */
function registerRoutes(app) {
    app.get('/health', (req, res) => {
        res.json({ success: true, service: 'mucm-application-portal-api' });
    });

    app.use('/api/v1/applications', applicationRoute);
    /** Portal React app default: VITE_AUTH_API_PATH=/api/auth */
    app.use('/api/auth', authRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/portal-users', portalUserRoute);
    app.use('/api/v1/crm', crmRoute);
    app.use('/api/v1/faqs', faqRoute);
    app.use('/api/v1/faq-categories', faqCategoryRoute);
    app.use('/api/v1/support-tickets', supportTicketRoute);
    app.use('/api/v1/admins', adminRoute);
    app.use('/api/v1/admin-roles', adminRoleRoute);
}

module.exports = { registerRoutes };
