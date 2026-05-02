const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureEmailTemplateSchema() {
    const qi = sequelize.getQueryInterface();

    await qi
        .createTable('email_templates', {
            id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
            name: { type: DataTypes.STRING(200), allowNull: false },
            category: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Other' },
            subject: { type: DataTypes.STRING(500), allowNull: false },
            body: { type: DataTypes.TEXT, allowNull: false },
            merge_fields: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: sequelize.literal("'[]'::jsonb")
            },
            is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            }
        })
        .catch(() => {});
}

module.exports = { ensureEmailTemplateSchema };
