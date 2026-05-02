const { body, param } = require('express-validator');

exports.validateEmailTemplateCreate = [
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('name is required'),
    body('category').optional().trim().isLength({ min: 1, max: 80 }),
    body('subject').isString().trim().isLength({ min: 1, max: 500 }).withMessage('subject is required'),
    body('body').isString().isLength({ min: 1 }).withMessage('body is required'),
    body('merge_fields').optional().isArray(),
    body('merge_fields.*').optional().isString().isLength({ max: 120 }),
    body('is_active').optional().isBoolean()
];

exports.validateEmailTemplateUpdate = [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 200 }),
    body('category').optional().trim().isLength({ min: 1, max: 80 }),
    body('subject').optional().trim().isLength({ min: 1, max: 500 }),
    body('body').optional(),
    body('merge_fields').optional().isArray(),
    body('merge_fields.*').optional().isString().isLength({ max: 120 }),
    body('is_active').optional().isBoolean()
];

exports.validateEmailTemplateIdParam = [param('id').isUUID()];
