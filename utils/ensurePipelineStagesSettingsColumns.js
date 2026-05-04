const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Older databases may lack columns added for the admin Settings → Pipeline stages UI.
 * Keeps GET /api/v1/settings/pipeline-stages working without a manual SQL migration.
 */
async function ensurePipelineStagesSettingsColumns() {
    const qi = sequelize.getQueryInterface();
    let cols;
    try {
        cols = await qi.describeTable('pipeline_stages');
    } catch {
        return;
    }

    if (!cols.active) {
        await qi.addColumn('pipeline_stages', 'active', {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        });
        console.log('[schema] Added pipeline_stages.active');
    }

    if (!cols.notification_template) {
        await qi.addColumn('pipeline_stages', 'notification_template', {
            type: DataTypes.STRING(500),
            allowNull: true
        });
        console.log('[schema] Added pipeline_stages.notification_template');
    }
}

module.exports = { ensurePipelineStagesSettingsColumns };
