const { body, param } = require('express-validator');

exports.validateFaqCategoryCreate = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('name is required'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
];

exports.validateFaqCategoryUpdate = [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 120 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
];

exports.validateFaqCategoryIdParam = [param('id').isUUID()];
