const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StandardizedTest = sequelize.define('StandardizedTest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    /** Portal hasStandardizedTest Yes/No — map to boolean when saving */
    is_taken: { type: DataTypes.BOOLEAN, allowNull: true },
    test_type: { type: DataTypes.STRING(80), allowNull: true },
    score: { type: DataTypes.STRING(120), allowNull: true }
}, {
    tableName: 'standardized_tests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = StandardizedTest;
