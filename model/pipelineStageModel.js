const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PipelineStage = sequelize.define('PipelineStage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    stage_key: { type: DataTypes.STRING(50), allowNull: false },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    stage_order: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: true },
    required: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    auto_advance: { type: DataTypes.BOOLEAN, allowNull: true },
    sla_days: { type: DataTypes.INTEGER, allowNull: true },
    notification_template_id: { type: DataTypes.UUID, allowNull: true },
    /** Admin settings UI: template label or free text (not only email_templates.id). */
    notification_template: { type: DataTypes.STRING(500), allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    color: { type: DataTypes.STRING(7), allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'pipeline_stages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PipelineStage;
