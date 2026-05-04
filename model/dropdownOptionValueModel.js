const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DropdownOptionValue = sequelize.define(
    'DropdownOptionValue',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: { type: DataTypes.UUID, allowNull: false },
        option_value: { type: DataTypes.STRING(500), allowNull: false },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'dropdown_option_values',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = DropdownOptionValue;
