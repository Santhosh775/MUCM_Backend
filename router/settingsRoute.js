const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');
const {
    validateSettingsTenantQuery,
    validateProgramCreate,
    validateProgramUpdate,
    validateProgramIdParam,
    validateIntakeCreate,
    validateIntakeUpdate,
    validateIntakeIdParam,
    validateFeeRuleCreate,
    validateFeeRuleUpdate,
    validateFeeRuleIdParam,
    validateDocRequirementCreate,
    validateDocRequirementUpdate,
    validateDocRequirementIdParam,
    validatePipelineStageCreate,
    validatePipelineStageUpdate,
    validatePipelineStageIdParam,
    validateDropdownCategoryCreate,
    validateDropdownCategoryUpdate,
    validateDropdownCategoryIdParam
} = require('../validator/settingsValidator');

router.use(authenticateAdminJwt);

router.get('/programs', validateSettingsTenantQuery, validateRequest, settingsController.listPrograms);
router.get('/programs/:id', validateProgramIdParam, validateRequest, settingsController.getProgram);
router.post('/programs', validateProgramCreate, validateRequest, settingsController.createProgram);
router.put('/programs/:id', validateProgramUpdate, validateRequest, settingsController.updateProgram);
router.delete('/programs/:id', validateProgramIdParam, validateRequest, settingsController.deleteProgram);

router.get('/intakes', validateSettingsTenantQuery, validateRequest, settingsController.listIntakes);
router.get('/intakes/:id', validateIntakeIdParam, validateRequest, settingsController.getIntake);
router.post('/intakes', validateIntakeCreate, validateRequest, settingsController.createIntake);
router.put('/intakes/:id', validateIntakeUpdate, validateRequest, settingsController.updateIntake);
router.delete('/intakes/:id', validateIntakeIdParam, validateRequest, settingsController.deleteIntake);

router.get('/fee-rules', validateSettingsTenantQuery, validateRequest, settingsController.listFeeRules);
router.get('/fee-rules/:id', validateFeeRuleIdParam, validateRequest, settingsController.getFeeRule);
router.post('/fee-rules', validateFeeRuleCreate, validateRequest, settingsController.createFeeRule);
router.put('/fee-rules/:id', validateFeeRuleUpdate, validateRequest, settingsController.updateFeeRule);
router.delete('/fee-rules/:id', validateFeeRuleIdParam, validateRequest, settingsController.deleteFeeRule);

router.get(
    '/document-requirements',
    validateSettingsTenantQuery,
    validateRequest,
    settingsController.listDocRequirements
);
router.get(
    '/document-requirements/:id',
    validateDocRequirementIdParam,
    validateRequest,
    settingsController.getDocRequirement
);
router.post(
    '/document-requirements',
    validateDocRequirementCreate,
    validateRequest,
    settingsController.createDocRequirement
);
router.put(
    '/document-requirements/:id',
    validateDocRequirementUpdate,
    validateRequest,
    settingsController.updateDocRequirement
);
router.delete(
    '/document-requirements/:id',
    validateDocRequirementIdParam,
    validateRequest,
    settingsController.deleteDocRequirement
);

router.get(
    '/pipeline-stages',
    validateSettingsTenantQuery,
    validateRequest,
    settingsController.listPipelineStages
);
router.get(
    '/pipeline-stages/:id',
    validatePipelineStageIdParam,
    validateRequest,
    settingsController.getPipelineStage
);
router.post(
    '/pipeline-stages',
    validatePipelineStageCreate,
    validateRequest,
    settingsController.createPipelineStage
);
router.put(
    '/pipeline-stages/:id',
    validatePipelineStageUpdate,
    validateRequest,
    settingsController.updatePipelineStage
);
router.delete(
    '/pipeline-stages/:id',
    validatePipelineStageIdParam,
    validateRequest,
    settingsController.deletePipelineStage
);

router.get(
    '/dropdown-categories',
    validateSettingsTenantQuery,
    validateRequest,
    settingsController.listDropdownCategories
);
router.get(
    '/dropdown-categories/:id',
    validateDropdownCategoryIdParam,
    validateRequest,
    settingsController.getDropdownCategory
);
router.post(
    '/dropdown-categories',
    validateDropdownCategoryCreate,
    validateRequest,
    settingsController.createDropdownCategory
);
router.put(
    '/dropdown-categories/:id',
    validateDropdownCategoryUpdate,
    validateRequest,
    settingsController.updateDropdownCategory
);
router.delete(
    '/dropdown-categories/:id',
    validateDropdownCategoryIdParam,
    validateRequest,
    settingsController.deleteDropdownCategory
);

module.exports = router;
