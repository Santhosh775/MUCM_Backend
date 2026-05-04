const { body, param, query } = require('express-validator');

const optFalsy = { values: 'falsy' };

/** Optional query for GET /api/v1/announcements */
exports.validateAnnouncementListQuery = [
    query('is_active').optional({ values: 'falsy' }).isIn(['true', 'false']),
    query('include_counts').optional({ values: 'falsy' }).isIn(['true', '1'])
];

exports.validateAnnouncementCreate = [
    body('title').trim().isLength({ min: 1, max: 500 }).withMessage('title is required'),
    body('body').trim().isLength({ min: 1 }).withMessage('body is required'),
    body('target_program_id').optional(optFalsy).isUUID(),
    body('targetProgramId').optional(optFalsy).isUUID(),
    body('target_intake_id').optional(optFalsy).isUUID(),
    body('targetIntakeId').optional(optFalsy).isUUID(),
    body('target_pipeline_stage_key').optional(optFalsy).isLength({ max: 120 }),
    body('targetPipelineStageKey').optional(optFalsy).isLength({ max: 120 }),
    body('is_active').optional().isBoolean(),
    body('active').optional().isBoolean()
];

exports.validateAnnouncementUpdate = [
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 1, max: 500 }),
    body('body').optional().trim().isLength({ min: 1 }),
    body('target_program_id').optional(optFalsy).isUUID(),
    body('targetProgramId').optional(optFalsy).isUUID(),
    body('target_intake_id').optional(optFalsy).isUUID(),
    body('targetIntakeId').optional(optFalsy).isUUID(),
    body('target_pipeline_stage_key').optional(optFalsy).isLength({ max: 120 }),
    body('targetPipelineStageKey').optional(optFalsy).isLength({ max: 120 }),
    body('is_active').optional().isBoolean(),
    body('active').optional().isBoolean()
];

exports.validateAnnouncementIdParam = [param('id').isUUID()];
