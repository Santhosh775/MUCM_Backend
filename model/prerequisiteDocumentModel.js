const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PrerequisiteDocument = sequelize.define('PrerequisiteDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    valid_passport: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    bank_statement_3_months: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    premed_bachelor_12th_transcript: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    grade_11_transcript: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    curriculum_vitae: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    passport_size_photo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
    tableName: 'prerequisite_documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PrerequisiteDocument;
