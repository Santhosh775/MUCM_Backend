const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureAdminsCountryColumn() {
    const qi = sequelize.getQueryInterface();
    let cols;
    try {
        cols = await qi.describeTable('admins');
    } catch {
        return;
    }

    if (!cols.country) {
        await qi.addColumn('admins', 'country', {
            type: DataTypes.STRING(100),
            allowNull: true
        });
        console.log('[schema] Added admins.country');
    }
}

module.exports = { ensureAdminsCountryColumn };
