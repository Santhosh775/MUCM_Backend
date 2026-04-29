const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Faq = sequelize.define(
    'Faq',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: { type: DataTypes.UUID, allowNull: true },
        category: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'General' },
        question: { type: DataTypes.TEXT, allowNull: false },
        answer: { type: DataTypes.TEXT, allowNull: false },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'faqs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Faq;
