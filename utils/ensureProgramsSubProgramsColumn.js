const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureProgramsSubProgramsColumn() {
    const qi = sequelize.getQueryInterface();
    let table;
    try {
        table = await qi.describeTable('programs');
    } catch (err) {
        return;
    }

    if (!table.sub_programs) {
        await qi.addColumn('programs', 'sub_programs', {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
        });
    }
}

module.exports = { ensureProgramsSubProgramsColumn };
