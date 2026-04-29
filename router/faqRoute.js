const express = require('express');
const router = express.Router();
const faqController = require('../controller/faqController');
const {
    validateFaqCreate,
    validateFaqUpdate,
    validateFaqIdParam
} = require('../validator/faqSupportValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/public', faqController.listPublished);
router.get('/', faqController.listAll);
router.post('/', validateFaqCreate, validateRequest, faqController.create);
router.put('/:id', validateFaqUpdate, validateRequest, faqController.update);
router.delete('/:id', validateFaqIdParam, validateRequest, faqController.remove);

module.exports = router;
