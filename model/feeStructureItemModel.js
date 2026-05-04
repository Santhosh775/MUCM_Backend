const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FeeStructureItem = sequelize.define(
    'FeeStructureItem',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        tenant_id: { type: DataTypes.UUID, allowNull: true },
        program_id: { type: DataTypes.UUID, allowNull: true },
        intake_id: { type: DataTypes.UUID, allowNull: true },
        program_code: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
        intake_name: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '' },
        fee_type: { type: DataTypes.STRING(120), allowNull: false },
        amount_text: { type: DataTypes.STRING(64), allowNull: false, defaultValue: '0' },
        amount_value: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'USD' },
        refund_policy: { type: DataTypes.TEXT, allowNull: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'fee_structure_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = FeeStructureItem;
