const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicketCategory = sequelize.define(
    'SupportTicketCategory',
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
        tableName: 'support_ticket_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = SupportTicketCategory;
