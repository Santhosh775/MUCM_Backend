const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AcademicInstitution = sequelize.define('AcademicInstitution', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    /** Portal educationEntries row payload; nullable for draft rows */
    institution_details: { type: DataTypes.JSON, allowNull: true }
}, {
    tableName: 'academic_institutions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AcademicInstitution;
