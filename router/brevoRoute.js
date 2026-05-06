const express = require('express');
const router = express.Router();
const brevoController = require('../controller/brevoController');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

// All Brevo routes require admin authentication
router.use(authenticateAdminJwt);

/**
 * GET /api/v1/brevo/templates
 * Query: ?status=active|inactive&limit=50&offset=0
 * Lists email templates from Brevo account.
 */
router.get('/templates', brevoController.listTemplates);

/**
 * POST /api/v1/brevo/send
 * Send a Brevo template email to a single recipient.
 * Body: { template_id, to?, to_name?, application_id?, application_ref?, params? }
 */
router.post('/send', brevoController.sendEmail);

/**
 * POST /api/v1/brevo/send-raw
 * Send a raw (custom subject + body) email via Brevo.
 * Body: { to?, to_name?, subject, body, application_id?, application_ref? }
 */
router.post('/send-raw', brevoController.sendRawEmail);

/**
 * POST /api/v1/brevo/send-bulk
 * Send a Brevo template email to a filtered audience of applicants.
 * Body: { template_id, program_id?, intake_id?, status?, dry_run? }
 */
router.post('/send-bulk', brevoController.sendBulkEmail);

module.exports = router;
