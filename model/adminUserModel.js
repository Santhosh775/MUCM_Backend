const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminUser = sequelize.define('AdminUser', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    admin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
    otp_code_hash: { type: DataTypes.STRING(128), allowNull: true },
    otp_expires_at: { type: DataTypes.DATE, allowNull: true },
    last_otp_sent_at: { type: DataTypes.DATE, allowNull: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    tableName: 'admin_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AdminUser;
