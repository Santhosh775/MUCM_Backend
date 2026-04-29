const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    source: { type: DataTypes.STRING(100), allowNull: true },
    channel: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    first_name: { type: DataTypes.STRING(100), allowNull: true },
    last_name: { type: DataTypes.STRING(100), allowNull: true },
    crm_reference_id: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'new' },
    metadata: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'leads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Lead;
