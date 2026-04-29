const { body, param, query } = require('express-validator');

/** Portal essays are required only before final submit; omit or falsy on draft create */
const essayOptionalOnCreate = (fieldLabel) =>
    body(fieldLabel)
        .optional({ values: 'falsy' })
        .trim()
        .notEmpty()
        .withMessage(`${fieldLabel} cannot be empty when provided`)
        .isString()
        .withMessage(`${fieldLabel} must be a string`);

exports.validateCreateApplication = [
    body('application_id').optional().isString().isLength({ max: 50 }),
    body('tenant_id').optional().isUUID(),
    body('lead_id').optional().isUUID(),
    body('student_id').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('intake_id').optional().isUUID(),
    body('pipeline_stage_id').optional().isUUID(),
    body('current_status').optional().isString().isLength({ max: 50 }),
    body('completed_steps').optional().isInt(),
    body('is_complete').optional().isBoolean(),
    essayOptionalOnCreate('why_medicine'),
    essayOptionalOnCreate('why_mucm'),
    essayOptionalOnCreate('personal_statement')
];

const essayIfPresent = (fieldLabel) =>
    body(fieldLabel)
        .optional()
        .trim()
        .notEmpty()
        .withMessage(`${fieldLabel} cannot be empty`)
        .isString()
        .withMessage(`${fieldLabel} must be a string`);

exports.validateUpdateApplication = [
    param('id').isUUID(),
    body('tenant_id').optional().isUUID(),
    body('lead_id').optional().isUUID(),
    body('student_id').optional().isUUID(),
    body('program_id').optional().isUUID(),
    body('intake_id').optional().isUUID(),
    body('pipeline_stage_id').optional().isUUID(),
    body('current_status').optional().isString().isLength({ max: 50 }),
    body('completed_steps').optional().isInt(),
    body('is_complete').optional().isBoolean(),
    essayIfPresent('why_medicine'),
    essayIfPresent('why_mucm'),
    essayIfPresent('personal_statement')
];

exports.validateIdParam = [
    param('id').isUUID()
];

exports.validateApplicationIdLookup = [
    param('applicationId').isString().isLength({ min: 1, max: 50 })
];

exports.validateListQuery = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('program_id').optional().isUUID(),
    query('intake_id').optional().isUUID()
];

exports.validateContactId = [
    param('id').isUUID(),
    param('contactId').isUUID()
];

exports.validateRowId = [
    param('id').isUUID(),
    param('rowId').isUUID()
];

exports.validateUserIdParam = [
    param('userId').isUUID()
];

exports.validateUserRowId = [
    param('userId').isUUID(),
    param('rowId').isUUID()
];

const prerequisiteDocumentBooleanFields = [
    'valid_passport',
    'bank_statement_3_months',
    'premed_bachelor_12th_transcript',
    'grade_11_transcript',
    'curriculum_vitae',
    'passport_size_photo'
];

exports.validatePrerequisiteDocumentBody = [
    ...prerequisiteDocumentBooleanFields.map((field) => body(field).optional().isBoolean())
];
