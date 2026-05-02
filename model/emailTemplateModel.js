const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailTemplate = sequelize.define(
    'EmailTemplate',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: { type: DataTypes.STRING(200), allowNull: false },
        category: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Other' },
        subject: { type: DataTypes.STRING(500), allowNull: false },
        body: { type: DataTypes.TEXT, allowNull: false },
        merge_fields: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'email_templates',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = EmailTemplate;
