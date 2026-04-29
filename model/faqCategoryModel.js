const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FaqCategory = sequelize.define(
    'FaqCategory',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'faq_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = FaqCategory;
