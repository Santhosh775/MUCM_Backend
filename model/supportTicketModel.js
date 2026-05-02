const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicket = sequelize.define(
    'SupportTicket',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'application_users', key: 'id' },
            onDelete: 'CASCADE'
        },
        user_email: { type: DataTypes.STRING(255), allowNull: true },
        category_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'support_ticket_categories', key: 'id' },
            onDelete: 'SET NULL'
        },
        subject: { type: DataTypes.STRING(500), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        category: { type: DataTypes.STRING(100), allowNull: true },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'Open'
        },
        admin_reply_message: { type: DataTypes.TEXT, allowNull: true },
        admin_replied_at: { type: DataTypes.DATE, allowNull: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'support_tickets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = SupportTicket;
