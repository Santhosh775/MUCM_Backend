const { body, param } = require('express-validator');

exports.validateSupportTicketCategoryCreate = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('name is required'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
];

exports.validateSupportTicketCategoryUpdate = [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 120 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
];

exports.validateSupportTicketCategoryIdParam = [param('id').isUUID()];
