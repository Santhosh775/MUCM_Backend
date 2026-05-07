const express = require('express');
const router = express.Router();
const { saveAdminDraft, getAdminDraft } = require('../controller/portalApplicationDraftController');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

router.put('/', authenticateAdminJwt, saveAdminDraft);
router.get('/:applicationId', authenticateAdminJwt, getAdminDraft);

module.exports = router;
