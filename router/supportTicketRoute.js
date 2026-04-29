const express = require('express');
const router = express.Router();
const supportTicketController = require('../controller/supportTicketController');
const {
    validateSupportTicketAdminPatch,
    validateUuidIdParam
} = require('../validator/faqSupportValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', supportTicketController.listAllAdmin);
router.get('/:id', validateUuidIdParam, validateRequest, supportTicketController.getByIdAdmin);
router.patch(
    '/:id',
    validateSupportTicketAdminPatch,
    validateRequest,
    supportTicketController.patchStatusAdmin
);

module.exports = router;
