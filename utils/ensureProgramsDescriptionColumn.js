const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureProgramsDescriptionColumn() {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('programs');
    if (!table.description) {
        await qi.addColumn('programs', 'description', {
            type: DataTypes.TEXT,
            allowNull: true
        });
    }
}

module.exports = { ensureProgramsDescriptionColumn };
