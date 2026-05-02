const express = require('express');
const router = express.Router();
const applicationController = require('../controller/applicationController');
const sectionController = require('../controller/applicationSectionController');
const {
    validateCreateApplication,
    validateUpdateApplication,
    validateIdParam,
    validateApplicationIdLookup,
    validateListQuery,
    validateRowId
} = require('../validator/applicationValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { applicationDocumentUpload } = require('../middleware/applicationDocumentUpload');

router.get(
    '/by-application-id/:applicationId',
    validateApplicationIdLookup,
    validateRequest,
    applicationController.getApplicationByApplicationId
);

router.get(
    '/',
    validateListQuery,
    validateRequest,
    applicationController.listApplications
);

router.post(
    '/',
    validateCreateApplication,
    validateRequest,
    applicationController.createApplication
);

router.put(
    '/:id',
    validateUpdateApplication,
    validateRequest,
    applicationController.updateApplication
    
);

router.delete(
    '/:id',
    validateIdParam,
    validateRequest,
    applicationController.softDeleteApplication
);

router.post(
    '/:id/personal-details',
    validateIdParam,
    validateRequest,
    sectionController.createPersonalDetails
);

router.get(
    '/:id/personal-details',
    validateIdParam,
    validateRequest,
    sectionController.listPersonalDetails
);

router.get(
    '/:id/personal-details/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getPersonalDetails
);

router.put(
    '/:id/personal-details/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updatePersonalDetails
);

router.delete(
    '/:id/personal-details/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deletePersonalDetails
);

router.post(
    '/:id/emergency-contacts',
    validateIdParam,
    validateRequest,
    sectionController.createEmergencyContact
);

router.get(
    '/:id/emergency-contacts',
    validateIdParam,
    validateRequest,
    sectionController.listEmergencyContacts
);

router.get(
    '/:id/emergency-contacts/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getEmergencyContact
);

router.put(
    '/:id/emergency-contacts/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateEmergencyContact
);

router.delete(
    '/:id/emergency-contacts/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteEmergencyContact
);

router.post(
    '/:id/parent-guardian',
    validateIdParam,
    validateRequest,
    sectionController.createParentGuardian
);

router.get(
    '/:id/parent-guardian',
    validateIdParam,
    validateRequest,
    sectionController.listParentGuardian
);

router.get(
    '/:id/parent-guardian/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getParentGuardian
);

router.put(
    '/:id/parent-guardian/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateParentGuardian
);

router.delete(
    '/:id/parent-guardian/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteParentGuardian
);

router.post(
    '/:id/academic-institutions',
    validateIdParam,
    validateRequest,
    sectionController.createAcademicInstitution
);

router.get(
    '/:id/academic-institutions',
    validateIdParam,
    validateRequest,
    sectionController.listAcademicInstitutions
);

router.get(
    '/:id/academic-institutions/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getAcademicInstitution
);

router.put(
    '/:id/academic-institutions/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateAcademicInstitution
);

router.delete(
    '/:id/academic-institutions/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteAcademicInstitution
);

router.post(
    '/:id/english-proficiency',
    validateIdParam,
    validateRequest,
    sectionController.createEnglishProficiency
);

router.get(
    '/:id/english-proficiency',
    validateIdParam,
    validateRequest,
    sectionController.listEnglishProficiency
);

router.get(
    '/:id/english-proficiency/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getEnglishProficiency
);

router.put(
    '/:id/english-proficiency/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateEnglishProficiency
);

router.delete(
    '/:id/english-proficiency/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteEnglishProficiency
);

router.post(
    '/:id/standardized-tests',
    validateIdParam,
    validateRequest,
    sectionController.createStandardizedTest
);

router.get(
    '/:id/standardized-tests',
    validateIdParam,
    validateRequest,
    sectionController.listStandardizedTests
);

router.get(
    '/:id/standardized-tests/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getStandardizedTest
);

router.put(
    '/:id/standardized-tests/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateStandardizedTest
);

router.delete(
    '/:id/standardized-tests/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteStandardizedTest
);

router.post(
    '/:id/admission-sought',
    validateIdParam,
    validateRequest,
    sectionController.createAdmissionSought
);

router.get(
    '/:id/admission-sought',
    validateIdParam,
    validateRequest,
    sectionController.listAdmissionSought
);

router.get(
    '/:id/admission-sought/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getAdmissionSought
);

router.put(
    '/:id/admission-sought/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateAdmissionSought
);

router.delete(
    '/:id/admission-sought/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteAdmissionSought
);

router.post(
    '/:id/disclosures',
    validateIdParam,
    validateRequest,
    sectionController.createDisclosure
);

router.get(
    '/:id/disclosures',
    validateIdParam,
    validateRequest,
    sectionController.listDisclosures
);

router.get(
    '/:id/disclosures/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getDisclosure
);

router.put(
    '/:id/disclosures/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateDisclosure
);

router.delete(
    '/:id/disclosures/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteDisclosure
);

router.post(
    '/:id/experiences',
    validateIdParam,
    validateRequest,
    sectionController.createExperience
);

router.get(
    '/:id/experiences',
    validateIdParam,
    validateRequest,
    sectionController.listExperiences
);

router.get(
    '/:id/experiences/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getExperience
);

router.put(
    '/:id/experiences/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateExperience
);

router.delete(
    '/:id/experiences/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteExperience
);

router.post(
    '/:id/document/upload',
    validateIdParam,
    validateRequest,
    applicationDocumentUpload,
    sectionController.uploadApplicationDocument
);

router.post(
    '/:id/document',
    validateIdParam,
    validateRequest,
    sectionController.createDocument
);

router.get(
    '/:id/document',
    validateIdParam,
    validateRequest,
    sectionController.listDocuments
);

router.get(
    '/:id/document/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getDocument
);

router.put(
    '/:id/document/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateDocument
);

router.delete(
    '/:id/document/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteDocument
);

router.post(
    '/:id/financial-support',
    validateIdParam,
    validateRequest,
    sectionController.createFinancialSupport
);

router.get(
    '/:id/financial-support',
    validateIdParam,
    validateRequest,
    sectionController.listFinancialSupport
);

router.get(
    '/:id/financial-support/:rowId',
    validateRowId,
    validateRequest,
    sectionController.getFinancialSupport
);

router.put(
    '/:id/financial-support/:rowId',
    validateRowId,
    validateRequest,
    sectionController.updateFinancialSupport
);

router.delete(
    '/:id/financial-support/:rowId',
    validateRowId,
    validateRequest,
    sectionController.deleteFinancialSupport
);

router.get(
    '/:id',
    validateIdParam,
    validateRequest,
    applicationController.getApplicationById
);

module.exports = router;