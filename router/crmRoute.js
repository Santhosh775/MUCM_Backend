const express = require('express');
const router = express.Router();
const crmController = require('../controller/crmController');
const {
    validateEntityParam,
    validateEntityIdParams,
    validateCreateEntity,
    validateUpdateEntity
} = require('../validator/crmValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get(
    '/:entity',
    validateEntityParam,
    validateRequest,
    crmController.listEntities
);

router.get(
    '/:entity/:id',
    validateEntityIdParams,
    validateRequest,
    crmController.getEntityById
);

router.post(
    '/:entity',
    validateCreateEntity,
    validateRequest,
    crmController.createEntity
);

router.put(
    '/:entity/:id',
    validateUpdateEntity,
    validateRequest,
    crmController.updateEntity
);

router.delete(
    '/:entity/:id',
    validateEntityIdParams,
    validateRequest,
    crmController.deleteEntity
);

module.exports = router;
