const express = require('express');
const router = express.Router();
const supportTicketController = require('../controller/supportTicketController');
const {
    validateSupportTicketAdminPatch,
    validateSupportTicketIdParam
} = require('../validator/supportTicketValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', supportTicketController.listAllAdmin);
router.get('/:id', validateSupportTicketIdParam, validateRequest, supportTicketController.getByIdAdmin);
router.patch(
    '/:id',
    validateSupportTicketAdminPatch,
    validateRequest,
    supportTicketController.patchStatusAdmin
);
router.delete('/:id', validateSupportTicketIdParam, validateRequest, supportTicketController.deleteAdmin);

module.exports = router;
