const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    domain: { type: DataTypes.STRING(255), allowNull: true },
    logo_url: { type: DataTypes.TEXT, allowNull: true },
    primary_color: { type: DataTypes.STRING(7), allowNull: true },
    secondary_color: { type: DataTypes.STRING(7), allowNull: true },
    settings: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
    status: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'active' },
    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'tenants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Tenant;
