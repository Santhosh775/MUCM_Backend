const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EnglishProficiency = sequelize.define('EnglishProficiency', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    /** Portal englishProficiency — required in UI; nullable until section is saved */
    proficiency_level: { type: DataTypes.STRING(50), allowNull: true },
    /** Portal otherLanguagesSpoken */
    other_languages_spoken: { type: DataTypes.TEXT, allowNull: true },
    /** Omitted when Native Speaker */
    test_type: { type: DataTypes.STRING(80), allowNull: true },
    test_score: { type: DataTypes.STRING(120), allowNull: true }
}, {
    tableName: 'english_proficiency',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = EnglishProficiency;
