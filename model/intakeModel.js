const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Intake = sequelize.define('Intake', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    program_id: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    application_deadline: { type: DataTypes.DATEONLY, allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'active' },
    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'intakes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Intake;
