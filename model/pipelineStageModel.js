const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PipelineStage = sequelize.define('PipelineStage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    stage_key: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    stage_order: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: true },
    required: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    auto_advance: { type: DataTypes.BOOLEAN, allowNull: true },
    sla_days: { type: DataTypes.INTEGER, allowNull: true },
    notification_template_id: { type: DataTypes.UUID, allowNull: true },
    color: { type: DataTypes.STRING(7), allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'pipeline_stages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PipelineStage;
