const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const { validateSettingsTenantQuery } = require('../validator/settingsValidator');
const { validateRequest } = require('../middleware/validateRequest');

// No auth middleware — these endpoints are intentionally public
router.get('/dropdown-categories', validateSettingsTenantQuery, validateRequest, settingsController.listDropdownCategories);
router.get('/programs', validateSettingsTenantQuery, validateRequest, settingsController.listPrograms);
router.get('/document-requirements', validateSettingsTenantQuery, validateRequest, settingsController.listDocRequirements);

module.exports = router;
