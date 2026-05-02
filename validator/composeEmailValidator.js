const { body } = require('express-validator');

/**
 * Partial validation; controller enforces subject/body or template, and recipient rules.
 */
exports.validateComposeEmail = [
    body('to').optional({ nullable: true }).isEmail().withMessage('to must be a valid email'),
    body('application_id').optional().isUUID(),
    body('application_ref').optional().trim().isLength({ min: 1, max: 50 }),
    body('template_id').optional().isUUID(),
    body('subject').optional().trim().isLength({ max: 500 }),
    body('body').optional()
];
