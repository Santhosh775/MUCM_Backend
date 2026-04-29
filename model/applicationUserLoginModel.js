const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApplicationUserLogin = sequelize.define('ApplicationUserLogin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: { type: DataTypes.UUID, allowNull: false },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'application_user_logins',
    timestamps: true,
    createdAt: 'login_at',
    updatedAt: false
});

module.exports = ApplicationUserLogin;
