const express = require('express');
const router = express.Router();
const prerequisiteDocumentController = require('../controller/prerequisiteDocumentController');
const portalApplicationDraftController = require('../controller/portalApplicationDraftController');
const supportTicketController = require('../controller/supportTicketController');
const {
    validateUserIdParam,
    validateUserRowId,
    validatePrerequisiteDocumentBody
} = require('../validator/applicationValidator');
const { validateSupportTicketCreate } = require('../validator/supportTicketValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticatePortalUser } = require('../middleware/authenticatePortalUser');

router.get(
    '/:userId/application-draft',
    validateUserIdParam,
    validateRequest,
    ...authenticatePortalUser,
    portalApplicationDraftController.getApplicationDraft
);

router.put(
    '/:userId/application-draft',
    validateUserIdParam,
    validateRequest,
    ...authenticatePortalUser,
    portalApplicationDraftController.putApplicationDraft
);

router.post(
    '/:userId/prerequisite-documents',
    validateUserIdParam,
    validatePrerequisiteDocumentBody,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.createPrerequisiteDocument
);

router.get(
    '/:userId/prerequisite-documents',
    validateUserIdParam,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.listPrerequisiteDocuments
);

router.get(
    '/:userId/prerequisite-documents/:rowId',
    validateUserRowId,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.getPrerequisiteDocument
);

router.put(
    '/:userId/prerequisite-documents/:rowId',
    validateUserRowId,
    validatePrerequisiteDocumentBody,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.updatePrerequisiteDocument
);

router.patch(
    '/:userId/prerequisite-documents/:rowId',
    validateUserRowId,
    validatePrerequisiteDocumentBody,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.updatePrerequisiteDocument
);

router.delete(
    '/:userId/prerequisite-documents/:rowId',
    validateUserRowId,
    validateRequest,
    ...authenticatePortalUser,
    prerequisiteDocumentController.deletePrerequisiteDocument
);

router.post(
    '/:userId/support-tickets',
    validateUserIdParam,
    validateSupportTicketCreate,
    validateRequest,
    ...authenticatePortalUser,
    supportTicketController.createTicket
);

router.get(
    '/:userId/support-tickets',
    validateUserIdParam,
    validateRequest,
    ...authenticatePortalUser,
    supportTicketController.listMyTickets
);

module.exports = router;
