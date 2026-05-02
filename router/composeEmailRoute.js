const express = require('express');
const router = express.Router();
const composeEmailController = require('../controller/composeEmailController');
const { validateComposeEmail } = require('../validator/composeEmailValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

router.post(
    '/compose',
    authenticateAdminJwt,
    validateComposeEmail,
    validateRequest,
    composeEmailController.sendToStudent
);

module.exports = router;
