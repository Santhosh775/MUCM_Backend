const Application = require('./applicationModel');
const PersonalDetails = require('./personalDetailsModel');
const EmergencyContact = require('./emergencyContactModel');
const ParentGuardianInfo = require('./parentGuardianInfoModel');
const AcademicInstitution = require('./academicInstitutionModel');
const EnglishProficiency = require('./englishProficiencyModel');
const StandardizedTest = require('./standardizedTestModel');
const AdmissionSought = require('./admissionSoughtModel');
const Disclosure = require('./disclosureModel');
const Experience = require('./experienceModel');
const Document = require('./documentModel');
const PrerequisiteDocument = require('./prerequisiteDocumentModel');
const ApplicationUser = require('./applicationUserModel');
const ApplicationUserLogin = require('./applicationUserLoginModel');
const PortalApplicationDraft = require('./portalApplicationDraftModel');
const ApplicationStatusNotification = require('./applicationStatusNotificationModel');
const FinancialSupport = require('./financialSupportModel');
const Tenant = require('./tenantModel');
const Program = require('./programModel');
const Intake = require('./intakeModel');
const Lead = require('./leadModel');
const PipelineStage = require('./pipelineStageModel');
const Faq = require('./faqModel');
const FaqCategory = require('./faqCategoryModel');
const SupportTicket = require('./supportTicketModel');
const SupportTicketCategory = require('./supportTicketCategoryModel');
const AdminRole = require('./adminRoleModel');
const Admin = require('./adminModel');
const AdminUser = require('./adminUserModel');
const EmailTemplate = require('./emailTemplateModel');
const Announcement = require('./announcementModel');
const FeeStructureItem = require('./feeStructureItemModel');
const SettingsDocumentRequirement = require('./settingsDocumentRequirementModel');
const DropdownOptionCategory = require('./dropdownOptionCategoryModel');
const DropdownOptionValue = require('./dropdownOptionValueModel');

Application.hasOne(PersonalDetails, { foreignKey: 'application_id', as: 'personal_details' });
PersonalDetails.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasMany(EmergencyContact, { foreignKey: 'application_id', as: 'emergency_contacts' });
EmergencyContact.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasOne(ParentGuardianInfo, { foreignKey: 'application_id', as: 'parent_guardian_info' });
ParentGuardianInfo.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasMany(AcademicInstitution, { foreignKey: 'application_id', as: 'academic_institutions' });
AcademicInstitution.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasOne(EnglishProficiency, { foreignKey: 'application_id', as: 'english_proficiency' });
EnglishProficiency.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasMany(StandardizedTest, { foreignKey: 'application_id', as: 'standardized_tests' });
StandardizedTest.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasOne(AdmissionSought, { foreignKey: 'application_id', as: 'admission_sought' });
AdmissionSought.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasOne(Disclosure, { foreignKey: 'application_id', as: 'disclosure' });
Disclosure.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasMany(Experience, { foreignKey: 'application_id', as: 'experiences' });
Experience.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Application.hasOne(Document, { foreignKey: 'application_id', as: 'document' });
Document.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

ApplicationUser.hasMany(ApplicationUserLogin, { foreignKey: 'user_id', as: 'logins' });
ApplicationUserLogin.belongsTo(ApplicationUser, { foreignKey: 'user_id', as: 'user' });

ApplicationUser.hasMany(PortalApplicationDraft, { foreignKey: 'user_id', as: 'portal_application_drafts' });
PortalApplicationDraft.belongsTo(ApplicationUser, { foreignKey: 'user_id', as: 'user' });
ApplicationUser.hasMany(ApplicationStatusNotification, { foreignKey: 'user_id', as: 'status_notifications' });
ApplicationStatusNotification.belongsTo(ApplicationUser, { foreignKey: 'user_id', as: 'user' });

Application.hasMany(PortalApplicationDraft, { foreignKey: 'application_id', as: 'portal_drafts' });
PortalApplicationDraft.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
Application.hasMany(ApplicationStatusNotification, { foreignKey: 'application_row_id', as: 'status_notifications' });
ApplicationStatusNotification.belongsTo(Application, { foreignKey: 'application_row_id', as: 'application' });

ApplicationUser.hasOne(PrerequisiteDocument, { foreignKey: 'user_id', as: 'prerequisite_document' });
PrerequisiteDocument.belongsTo(ApplicationUser, { foreignKey: 'user_id', as: 'user' });

Application.hasOne(FinancialSupport, { foreignKey: 'application_id', as: 'financial_support' });
FinancialSupport.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

Tenant.hasMany(Program, { foreignKey: 'tenant_id', as: 'programs' });
Program.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Intake, { foreignKey: 'tenant_id', as: 'intakes' });
Intake.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Lead, { foreignKey: 'tenant_id', as: 'leads' });
Lead.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(PipelineStage, { foreignKey: 'tenant_id', as: 'pipeline_stages' });
PipelineStage.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Program.hasMany(Intake, { foreignKey: 'program_id', as: 'intakes' });
Intake.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });

Tenant.hasMany(FeeStructureItem, { foreignKey: 'tenant_id', as: 'fee_structure_items' });
FeeStructureItem.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
Program.hasMany(FeeStructureItem, { foreignKey: 'program_id', as: 'fee_structure_items' });
FeeStructureItem.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });
Intake.hasMany(FeeStructureItem, { foreignKey: 'intake_id', as: 'fee_structure_items' });
FeeStructureItem.belongsTo(Intake, { foreignKey: 'intake_id', as: 'intake' });

Tenant.hasMany(SettingsDocumentRequirement, { foreignKey: 'tenant_id', as: 'settings_document_requirements' });
SettingsDocumentRequirement.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(DropdownOptionCategory, { foreignKey: 'tenant_id', as: 'dropdown_option_categories' });
DropdownOptionCategory.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
DropdownOptionCategory.hasMany(DropdownOptionValue, { foreignKey: 'category_id', as: 'option_values' });
DropdownOptionValue.belongsTo(DropdownOptionCategory, { foreignKey: 'category_id', as: 'category' });

PipelineStage.belongsTo(EmailTemplate, { foreignKey: 'notification_template_id', as: 'email_template' });

Tenant.hasMany(Application, { foreignKey: 'tenant_id', as: 'applications' });
Application.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Program.hasMany(Application, { foreignKey: 'program_id', as: 'applications' });
Application.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });

Intake.hasMany(Application, { foreignKey: 'intake_id', as: 'applications' });
Application.belongsTo(Intake, { foreignKey: 'intake_id', as: 'intake' });

Lead.hasMany(Application, { foreignKey: 'lead_id', as: 'applications' });
Application.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });

PipelineStage.hasMany(Application, { foreignKey: 'pipeline_stage_id', as: 'applications' });
Application.belongsTo(PipelineStage, { foreignKey: 'pipeline_stage_id', as: 'pipeline_stage' });

ApplicationUser.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'support_tickets' });
SupportTicket.belongsTo(ApplicationUser, { foreignKey: 'user_id', as: 'user' });
SupportTicketCategory.hasMany(SupportTicket, { foreignKey: 'category_id', as: 'support_tickets' });
SupportTicket.belongsTo(SupportTicketCategory, { foreignKey: 'category_id', as: 'category_meta' });

FaqCategory.hasMany(Faq, { foreignKey: 'category_id', as: 'faqs' });
Faq.belongsTo(FaqCategory, { foreignKey: 'category_id', as: 'faq_category' });

AdminRole.hasMany(Admin, { foreignKey: 'role_id', as: 'admins' });
Admin.belongsTo(AdminRole, { foreignKey: 'role_id', as: 'role' });
Admin.hasOne(AdminUser, { foreignKey: 'admin_id', as: 'admin_user' });
AdminUser.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

module.exports = {
    Application,
    PersonalDetails,
    EmergencyContact,
    ParentGuardianInfo,
    AcademicInstitution,
    EnglishProficiency,
    StandardizedTest,
    AdmissionSought,
    Disclosure,
    Experience,
    Document,
    PrerequisiteDocument,
    ApplicationUser,
    ApplicationUserLogin,
    PortalApplicationDraft,
    ApplicationStatusNotification,
    FinancialSupport,
    Tenant,
    Program,
    Intake,
    Lead,
    PipelineStage,
    Faq,
    FaqCategory,
    SupportTicket,
    SupportTicketCategory,
    AdminRole,
    Admin,
    AdminUser,
    EmailTemplate,
    Announcement,
    FeeStructureItem,
    SettingsDocumentRequirement,
    DropdownOptionCategory,
    DropdownOptionValue
};
