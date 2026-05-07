const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PortalApplicationDraft = sequelize.define('PortalApplicationDraft', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    application_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    form_values: {
        type: DataTypes.JSON,
        allowNull: true
    },
    current_step_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    saved_from_action: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    saved_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'portal_application_drafts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PortalApplicationDraft;
