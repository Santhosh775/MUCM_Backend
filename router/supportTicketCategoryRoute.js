const express = require('express');
const router = express.Router();
const supportTicketCategoryController = require('../controller/supportTicketCategoryController');
const {
    validateSupportTicketCategoryCreate,
    validateSupportTicketCategoryUpdate,
    validateSupportTicketCategoryIdParam
} = require('../validator/supportTicketCategoryValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', supportTicketCategoryController.listAll);
router.get('/:id', validateSupportTicketCategoryIdParam, validateRequest, supportTicketCategoryController.getById);
router.post('/', validateSupportTicketCategoryCreate, validateRequest, supportTicketCategoryController.create);
router.put('/:id', validateSupportTicketCategoryUpdate, validateRequest, supportTicketCategoryController.update);
router.delete(
    '/:id',
    validateSupportTicketCategoryIdParam,
    validateRequest,
    supportTicketCategoryController.remove
);

module.exports = router;
