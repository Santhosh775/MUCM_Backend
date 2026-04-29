const { body, param } = require('express-validator');

const entityParam = param('entity').isIn([
    'tenants',
    'programs',
    'intakes',
    'leads',
    'pipeline_stages'
]);

exports.validateEntityParam = [entityParam];

exports.validateEntityIdParams = [
    entityParam,
    param('id').isUUID()
];

exports.validateCreateEntity = [
    entityParam,
    body().isObject()
];

exports.validateUpdateEntity = [
    entityParam,
    param('id').isUUID(),
    body().isObject()
];
