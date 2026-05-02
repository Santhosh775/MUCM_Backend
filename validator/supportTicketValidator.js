const { body, param } = require('express-validator');

exports.validateSupportTicketCreate = [
    body('subject').trim().isLength({ min: 1, max: 500 }).withMessage('subject is required'),
    body('message').trim().isLength({ min: 1, max: 20000 }).withMessage('message is required'),
    body('category').optional().trim().isLength({ max: 100 }),
    body('category_id').optional().isUUID().withMessage('category_id must be a valid UUID')
];

exports.validateSupportTicketIdParam = [param('id').isUUID()];

exports.validateSupportTicketAdminPatch = [
    param('id').isUUID(),
    body('status')
        .optional()
        .isIn(['Open', 'In progress', 'Resolved'])
        .withMessage('status must be Open, In progress, or Resolved'),
    body('admin_reply_message')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20000 })
        .withMessage('admin_reply_message cannot be empty')
];
