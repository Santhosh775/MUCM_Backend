const express = require('express');
const router = express.Router();
const announcementController = require('../controller/announcementController');
const {
    validateAnnouncementCreate,
    validateAnnouncementUpdate,
    validateAnnouncementIdParam,
    validateAnnouncementListQuery
} = require('../validator/announcementValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateAdminJwt } = require('../middleware/authenticateAdminUser');

router.use(authenticateAdminJwt);

router.get('/', validateAnnouncementListQuery, validateRequest, announcementController.listAll);
router.get('/:id', validateAnnouncementIdParam, validateRequest, announcementController.getById);
router.post('/', validateAnnouncementCreate, validateRequest, announcementController.create);
router.put('/:id', validateAnnouncementUpdate, validateRequest, announcementController.update);
router.delete('/:id', validateAnnouncementIdParam, validateRequest, announcementController.remove);

module.exports = router;
