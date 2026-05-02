const { body, param } = require('express-validator');

exports.validateAdminRoleCreate = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('name is required'),
    body('summary').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean()
];

exports.validateAdminRoleUpdate = [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 120 }),
    body('summary').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('is_active').optional().isBoolean()
];

exports.validateAdminCreate = [
    body('role_id').isUUID().withMessage('role_id is required'),
    body('full_name').trim().isLength({ min: 1, max: 150 }).withMessage('full_name is required'),
    body('email').trim().isEmail().withMessage('valid email is required'),
    body('permissions').optional({ nullable: true }).isObject().withMessage('permissions must be an object'),
    body('is_active').optional().isBoolean()
];

exports.validateAdminUpdate = [
    param('id').isUUID(),
    body('role_id').optional().isUUID(),
    body('full_name').optional().trim().isLength({ min: 1, max: 150 }),
    body('email').optional().trim().isEmail(),
    body('permissions').optional({ nullable: true }).isObject().withMessage('permissions must be an object'),
    body('is_active').optional().isBoolean()
];

exports.validateAdminPermissionsUpdate = [
    param('id').isUUID(),
    body('permissions').isObject().withMessage('permissions must be an object')
];

exports.validateAdminRoleIdParam = [param('id').isUUID()];
exports.validateAdminIdParam = [param('id').isUUID()];
