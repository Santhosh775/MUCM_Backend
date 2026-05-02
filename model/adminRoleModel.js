const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminRole = sequelize.define('AdminRole', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    summary: { type: DataTypes.TEXT, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'admin_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AdminRole;
