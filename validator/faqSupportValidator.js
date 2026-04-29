const { body, param } = require('express-validator');

exports.validateSupportTicketCreate = [
    body('subject').trim().isLength({ min: 1, max: 500 }).withMessage('subject is required'),
    body('message').trim().isLength({ min: 1, max: 20000 }).withMessage('message is required'),
    body('category').optional().trim().isLength({ max: 100 })
];

exports.validateFaqCreate = [
    body('category').optional().trim().isLength({ max: 120 }),
    body('category_id').optional().isUUID(),
    body('question').trim().isLength({ min: 1 }).withMessage('question is required'),
    body('answer').trim().isLength({ min: 1 }).withMessage('answer is required'),
    body('sort_order').optional().isInt(),
    body('is_published').optional().isBoolean()
];

exports.validateFaqUpdate = [
    param('id').isUUID(),
    body('category').optional().trim().isLength({ max: 120 }),
    body('category_id').optional().isUUID(),
    body('question').optional().trim().isLength({ min: 1 }),
    body('answer').optional().trim().isLength({ min: 1 }),
    body('sort_order').optional().isInt(),
    body('is_published').optional().isBoolean()
];

exports.validateFaqIdParam = [param('id').isUUID()];
/** Same as validateFaqIdParam — use for non-FAQ UUID routes (e.g. support tickets). */
exports.validateUuidIdParam = exports.validateFaqIdParam;

exports.validateSupportTicketAdminPatch = [
    param('id').isUUID(),
    body('status')
        .isIn(['Open', 'In progress', 'Resolved'])
        .withMessage('status must be Open, In progress, or Resolved')
];
