const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApplicationStatusNotification = sequelize.define('ApplicationStatusNotification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    application_row_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    application_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status_key: {
        type: DataTypes.STRING(80),
        allowNull: true
    },
    status_label: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'application_status_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ApplicationStatusNotification;
