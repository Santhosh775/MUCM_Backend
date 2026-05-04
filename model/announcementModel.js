const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define(
    'Announcement',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: { type: DataTypes.STRING(500), allowNull: false },
        body: { type: DataTypes.TEXT, allowNull: false },
        target_program_id: { type: DataTypes.UUID, allowNull: true },
        target_intake_id: { type: DataTypes.UUID, allowNull: true },
        target_pipeline_stage_key: { type: DataTypes.STRING(120), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'announcements',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Announcement;
