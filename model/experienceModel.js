const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Experience = sequelize.define('Experience', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    experience_type: { type: DataTypes.STRING(50), allowNull: true },
    role_position: { type: DataTypes.STRING(255), allowNull: true },
    organization: { type: DataTypes.STRING(255), allowNull: true },
    /** Portal sends text e.g. "20" */
    hours_per_week: { type: DataTypes.STRING(20), allowNull: true },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
    is_current: { type: DataTypes.BOOLEAN, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    /**
     * Deprecated: essays belong on Application (why_medicine, why_mucm, personal_statement).
     * Kept nullable for legacy rows.
     */
    why_medicine: { type: DataTypes.TEXT, allowNull: true },
    why_mucm: { type: DataTypes.TEXT, allowNull: true },
    per_statement_essay: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'experiences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Experience;
