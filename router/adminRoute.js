const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const {
    validateAdminCreate,
    validateAdminUpdate,
    validateAdminIdParam,
    validateAdminPermissionsUpdate
} = require('../validator/adminValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', adminController.listAll);
router.get('/:id', validateAdminIdParam, validateRequest, adminController.getById);
router.post('/', validateAdminCreate, validateRequest, adminController.create);
router.put('/:id', validateAdminUpdate, validateRequest, adminController.update);
router.put('/:id/permissions', validateAdminPermissionsUpdate, validateRequest, adminController.updatePermissions);
router.delete('/:id', validateAdminIdParam, validateRequest, adminController.remove);

module.exports = router;
