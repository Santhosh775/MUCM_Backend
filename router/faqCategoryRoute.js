const express = require('express');
const router = express.Router();
const faqCategoryController = require('../controller/faqCategoryController');
const {
    validateFaqCategoryCreate,
    validateFaqCategoryUpdate,
    validateFaqCategoryIdParam
} = require('../validator/faqCategoryValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', faqCategoryController.listAll);
router.get('/:id', validateFaqCategoryIdParam, validateRequest, faqCategoryController.getById);
router.post('/', validateFaqCategoryCreate, validateRequest, faqCategoryController.create);
router.put('/:id', validateFaqCategoryUpdate, validateRequest, faqCategoryController.update);
router.delete('/:id', validateFaqCategoryIdParam, validateRequest, faqCategoryController.remove);

module.exports = router;
