const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controller/emailTemplateController');
const {
    validateEmailTemplateCreate,
    validateEmailTemplateUpdate,
    validateEmailTemplateIdParam
} = require('../validator/emailTemplateValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

router.use(authenticateAdminJwt);

router.get('/', emailTemplateController.listAll);
router.get('/:id', validateEmailTemplateIdParam, validateRequest, emailTemplateController.getById);
router.post('/', validateEmailTemplateCreate, validateRequest, emailTemplateController.create);
router.put('/:id', validateEmailTemplateUpdate, validateRequest, emailTemplateController.update);
router.delete('/:id', validateEmailTemplateIdParam, validateRequest, emailTemplateController.remove);

module.exports = router;
