const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DropdownOptionCategory = sequelize.define(
    'DropdownOptionCategory',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        tenant_id: { type: DataTypes.UUID, allowNull: true },
        category: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'dropdown_option_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = DropdownOptionCategory;
