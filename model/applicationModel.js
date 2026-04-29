const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    lead_id: { type: DataTypes.UUID, allowNull: true },
    student_id: { type: DataTypes.UUID, allowNull: true },
    program_id: { type: DataTypes.UUID, allowNull: true },
    intake_id: { type: DataTypes.UUID, allowNull: true },
    pipeline_stage_id: { type: DataTypes.UUID, allowNull: true },
    current_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'draft'
    },
    submitted_at: { type: DataTypes.DATE, allowNull: true },
    referral_code: { type: DataTypes.STRING(100), allowNull: true },
    lead_source: { type: DataTypes.STRING(100), allowNull: true },
    crm_reference_id: { type: DataTypes.STRING(255), allowNull: true },
    correlation_method: { type: DataTypes.STRING(50), allowNull: true },
    ip_address: { type: DataTypes.INTEGER, allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    completed_steps: { type: DataTypes.INTEGER, allowNull: true },
    is_complete: { type: DataTypes.BOOLEAN, allowNull: true },
    /**
     * Experience & Motivation — portal whyMedicine, whyMUCM, personalStatement (required in UI before submit).
     * Nullable so draft applications can be created before that step.
     */
    why_medicine: { type: DataTypes.TEXT, allowNull: true },
    why_mucm: { type: DataTypes.TEXT, allowNull: true },
    personal_statement: { type: DataTypes.TEXT, allowNull: true },
    /** Review & Submit — applicationAgreement (required to submit) */
    application_agreement_accepted: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    application_agreement_at: { type: DataTypes.DATE, allowNull: true },
    /** Review & Submit — digital signature (portal: same pattern as financial step) */
    review_signature_method: { type: DataTypes.STRING(20), allowNull: true },
    review_signature_typed: { type: DataTypes.TEXT, allowNull: true },
    review_signature_upload: { type: DataTypes.TEXT, allowNull: true },
    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false
});

module.exports = Application;
