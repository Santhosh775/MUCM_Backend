const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SettingsDocumentRequirement = sequelize.define(
    'SettingsDocumentRequirement',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        tenant_id: { type: DataTypes.UUID, allowNull: true },
        name: { type: DataTypes.STRING(500), allowNull: false },
        required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        accepted_types: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'PDF' },
        max_size_mb: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'settings_document_requirements',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = SettingsDocumentRequirement;
