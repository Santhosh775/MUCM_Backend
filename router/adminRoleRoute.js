const express = require('express');
const router = express.Router();
const adminRoleController = require('../controller/adminRoleController');
const {
    validateAdminRoleCreate,
    validateAdminRoleUpdate,
    validateAdminRoleIdParam
} = require('../validator/adminValidator');
const { validateRequest } = require('../middleware/validateRequest');

router.get('/', adminRoleController.listAll);
router.get('/:id', validateAdminRoleIdParam, validateRequest, adminRoleController.getById);
router.post('/', validateAdminRoleCreate, validateRequest, adminRoleController.create);
router.put('/:id', validateAdminRoleUpdate, validateRequest, adminRoleController.update);
router.delete('/:id', validateAdminRoleIdParam, validateRequest, adminRoleController.remove);

module.exports = router;
