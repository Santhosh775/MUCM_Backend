const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialSupport = sequelize.define('FinancialSupport', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    student_full_name: { type: DataTypes.STRING(255), allowNull: true },
    student_id: { type: DataTypes.STRING(255), allowNull: true },
    program_of_study: { type: DataTypes.STRING(255), allowNull: true },
    expected_start_date: { type: DataTypes.STRING(100), allowNull: true },
    /** Portal paymentOption A/B/C — required when section completed */
    select_payment_option: { type: DataTypes.STRING(50), allowNull: true },
    /** Portal selfFundedSource — required when option A */
    source_of_funds: { type: DataTypes.TEXT, allowNull: true },
    sponsor_full_name: { type: DataTypes.STRING(255), allowNull: true },
    relationship_to_student: { type: DataTypes.STRING(120), allowNull: true },
    occupation: { type: DataTypes.STRING(200), allowNull: true },
    employer_business_name: { type: DataTypes.STRING(255), allowNull: true },
    sponsor_street_address: { type: DataTypes.TEXT, allowNull: true },
    sponsor_city: { type: DataTypes.STRING(120), allowNull: true },
    sponsor_state: { type: DataTypes.STRING(100), allowNull: true },
    sponsor_postalcode: { type: DataTypes.STRING(40), allowNull: true },
    sponsor_country: { type: DataTypes.STRING(120), allowNull: true },
    sponsor_phone: { type: DataTypes.STRING(80), allowNull: true },
    sponsor_email: { type: DataTypes.STRING(255), allowNull: true },
    organization_name: { type: DataTypes.STRING(255), allowNull: true },
    org_contact_person: { type: DataTypes.STRING(255), allowNull: true },
    org_contact_person_title: { type: DataTypes.STRING(120), allowNull: true },
    org_street_address: { type: DataTypes.TEXT, allowNull: true },
    org_city: { type: DataTypes.STRING(120), allowNull: true },
    org_state: { type: DataTypes.STRING(100), allowNull: true },
    org_postal_code: { type: DataTypes.STRING(40), allowNull: true },
    org_country: { type: DataTypes.STRING(120), allowNull: true },
    org_phone: { type: DataTypes.STRING(80), allowNull: true },
    org_email: { type: DataTypes.STRING(255), allowNull: true },
    bank_checkbox: { type: DataTypes.BOOLEAN, allowNull: true },
    proof_of_income_checkbox: { type: DataTypes.BOOLEAN, allowNull: true },
    sponsor_letter_checkbox: { type: DataTypes.BOOLEAN, allowNull: true },
    scholarship_checkbox: { type: DataTypes.BOOLEAN, allowNull: true },
    student_loan_checkbox: { type: DataTypes.BOOLEAN, allowNull: true },
    student_certificate_check1: { type: DataTypes.BOOLEAN, allowNull: true },
    student_certificate_check2: { type: DataTypes.BOOLEAN, allowNull: true },
    student_date_certification: { type: DataTypes.STRING(50), allowNull: true },
    sponsor_org_certificate: { type: DataTypes.BOOLEAN, allowNull: true },
    sponsor_certification_date: { type: DataTypes.STRING(50), allowNull: true },
    /** Portal studentSignatureMethod: upload | type */
    student_signature_method: { type: DataTypes.STRING(20), allowNull: true },
    /** Portal studentSignatureTyped — typed name as signature */
    student_signature_typed: { type: DataTypes.TEXT, allowNull: true },
    /** Portal studentSignatureUpload — file path or data URL */
    student_signature_upload: { type: DataTypes.TEXT, allowNull: true },
    /** Portal sponsorSignedFinancialForm */
    sponsor_signed_financial_form: { type: DataTypes.STRING(512), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'Financial_Support',
    timestamps: false
});

module.exports = FinancialSupport;
