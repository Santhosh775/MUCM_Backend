const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/** File URLs or storage keys returned after upload — matches portal Documents step names */
const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    upload_progress: { type: DataTypes.BOOLEAN, allowNull: false },
    passport: { type: DataTypes.STRING(512), allowNull: true },
    bank_statement: { type: DataTypes.STRING(512), allowNull: true },
    premedical_Bachelor_ug_HSC_Certificate: {
        type: DataTypes.STRING(512),
        allowNull: true,
        comment: 'Portal preMedTranscript'
    },
    Secondary_11grade: { type: DataTypes.STRING(512), allowNull: true },
    cv_resume: { type: DataTypes.STRING(512), allowNull: true },
    passport_photo: { type: DataTypes.STRING(512), allowNull: true },
    other_professional_transcripts: {
        type: DataTypes.STRING(512),
        allowNull: true,
        /** Match existing database column (legacy name included a space) */
        field: 'other_professional transcripts'
    },
    exam_results_marksheet: { type: DataTypes.STRING(512), allowNull: true },
    /** Portal sponsorSignedFinancialForm — signed Step 7 PDF re-upload (sponsor options B/C) */
    sponsor_signed_financial_form: { type: DataTypes.STRING(512), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'Document',
    timestamps: false
});

module.exports = Document;
