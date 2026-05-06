const { body, param, query } = require('express-validator');

const optionalTenantUuid = query('tenant_id').optional().isUUID();

const idParam = param('id').isUUID().withMessage('Invalid id');

exports.validateSettingsTenantQuery = [optionalTenantUuid];

exports.validateProgramCreate = [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('code').trim().notEmpty().withMessage('code is required'),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('durationYears').optional().isInt({ min: 0 }),
    body('duration_years').optional().isInt({ min: 0 }),
    body('description').optional().isString(),
    body('capacity').optional().isInt({ min: 0 }),
    body('active').optional().isBoolean(),
    body('subPrograms').optional().isArray()
];

exports.validateProgramUpdate = [
    idParam,
    body('name').optional().trim().notEmpty(),
    body('code').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('durationYears').optional().isInt({ min: 0 }),
    body('duration_years').optional().isInt({ min: 0 }),
    body('description').optional().isString(),
    body('capacity').optional().isInt({ min: 0 }),
    body('active').optional().isBoolean(),
    body('subPrograms').optional().isArray()
];

exports.validateProgramIdParam = [idParam];

exports.validateIntakeCreate = [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('programId').optional().isUUID(),
    body('startDate').optional({ values: 'falsy' }).isString().isLength({ max: 32 }),
    body('start_date').optional({ values: 'falsy' }).isString().isLength({ max: 32 }),
    body('applicationDeadline').optional({ values: 'falsy' }).isString().isLength({ max: 32 }),
    body('application_deadline').optional({ values: 'falsy' }).isString().isLength({ max: 32 }),
    body('capacity').optional().isInt({ min: 0 }),
    body('status').optional().isString().isLength({ max: 20 })
];

exports.validateIntakeUpdate = [
    idParam,
    body('name').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('programId').optional().isUUID(),
    body('startDate').optional().isString().isLength({ max: 32 }),
    body('start_date').optional().isString().isLength({ max: 32 }),
    body('applicationDeadline').optional().isString().isLength({ max: 32 }),
    body('application_deadline').optional().isString().isLength({ max: 32 }),
    body('capacity').optional().isInt({ min: 0 }),
    body('status').optional().isString().isLength({ max: 20 })
];

exports.validateIntakeIdParam = [idParam];

exports.validateFeeRuleCreate = [
    body().custom((_, { req }) => {
        const t = String(req.body.feeType ?? req.body.fee_type ?? '').trim();
        if (!t) throw new Error('feeType is required');
        return true;
    }),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('programId').optional().isUUID(),
    body('intake_id').optional().isUUID(),
    body('intakeId').optional().isUUID(),
    body('programCode').optional().isString(),
    body('program_code').optional().isString(),
    body('intakeName').optional().isString(),
    body('intake_name').optional().isString(),
    body('amount').optional().isString(),
    body('currency').optional().isString().isLength({ max: 10 }),
    body('refundPolicy').optional().isString(),
    body('refund_policy').optional().isString()
];

exports.validateFeeRuleUpdate = [
    idParam,
    body('feeType').optional().trim().notEmpty(),
    body('fee_type').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('programId').optional().isUUID(),
    body('intake_id').optional().isUUID(),
    body('intakeId').optional().isUUID(),
    body('programCode').optional().isString(),
    body('program_code').optional().isString(),
    body('intakeName').optional().isString(),
    body('intake_name').optional().isString(),
    body('amount').optional().isString(),
    body('currency').optional().isString().isLength({ max: 10 }),
    body('refundPolicy').optional().isString(),
    body('refund_policy').optional().isString()
];

exports.validateFeeRuleIdParam = [idParam];

exports.validateDocRequirementCreate = [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('required').optional().isBoolean(),
    body('acceptedTypes').optional().isString().isLength({ max: 255 }),
    body('accepted_types').optional().isString().isLength({ max: 255 }),
    body('maxSizeMb').optional().isInt({ min: 1 }),
    body('max_size_mb').optional().isInt({ min: 1 })
];

exports.validateDocRequirementUpdate = [
    idParam,
    body('name').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('required').optional().isBoolean(),
    body('acceptedTypes').optional().isString().isLength({ max: 255 }),
    body('accepted_types').optional().isString().isLength({ max: 255 }),
    body('maxSizeMb').optional().isInt({ min: 1 }),
    body('max_size_mb').optional().isInt({ min: 1 })
];

exports.validateDocRequirementIdParam = [idParam];

exports.validatePipelineStageCreate = [
    body().custom((_, { req }) => {
        const sk = String(req.body.stageKey ?? req.body.stage_key ?? '').trim();
        const dn = String(req.body.displayName ?? req.body.display_name ?? '').trim();
        if (!sk) throw new Error('stageKey is required');
        if (!dn) throw new Error('displayName is required');
        return true;
    }),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('order').optional().isInt({ min: 1 }),
    body('stage_order').optional().isInt({ min: 1 }),
    body('slaDays').optional(),
    body('sla_days').optional(),
    body('notificationTemplate').optional().isString(),
    body('notification_template').optional().isString(),
    body('active').optional().isBoolean(),
    body('notification_template_id').optional().isUUID()
];

exports.validatePipelineStageUpdate = [
    idParam,
    body('stageKey').optional().trim().notEmpty(),
    body('stage_key').optional().trim().notEmpty(),
    body('displayName').optional().trim().notEmpty(),
    body('display_name').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('order').optional().isInt({ min: 1 }),
    body('stage_order').optional().isInt({ min: 1 }),
    body('slaDays').optional(),
    body('sla_days').optional(),
    body('notificationTemplate').optional().isString(),
    body('notification_template').optional().isString(),
    body('active').optional().isBoolean(),
    body('notification_template_id').optional().isUUID()
];

exports.validatePipelineStageIdParam = [idParam];

exports.validateDropdownCategoryCreate = [
    body('category').trim().notEmpty().withMessage('category is required'),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('description').optional().isString(),
    body('options').isArray({ min: 1 }).withMessage('options must be a non-empty array')
];

exports.validateDropdownCategoryUpdate = [
    idParam,
    body('category').optional().trim().notEmpty(),
    body('tenant_id').optional().isUUID(),
    body('tenantId').optional().isUUID(),
    body('description').optional().isString(),
    body('options').optional().isArray({ min: 1 })
];

exports.validateDropdownCategoryIdParam = [idParam];
