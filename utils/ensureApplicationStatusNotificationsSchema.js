const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureApplicationStatusNotificationsSchema() {
    const qi = sequelize.getQueryInterface();

    await qi.createTable('application_status_notifications', {
        id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        application_row_id: { type: DataTypes.UUID, allowNull: false },
        application_id: { type: DataTypes.STRING(50), allowNull: false },
        status_key: { type: DataTypes.STRING(80), allowNull: true },
        status_label: { type: DataTypes.STRING(120), allowNull: true },
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }).catch(() => {});

    await qi.addIndex('application_status_notifications', ['user_id']).catch(() => {});
    await qi.addIndex('application_status_notifications', ['application_row_id']).catch(() => {});
    await qi.addIndex('application_status_notifications', ['application_id']).catch(() => {});
}

module.exports = { ensureApplicationStatusNotificationsSchema };
