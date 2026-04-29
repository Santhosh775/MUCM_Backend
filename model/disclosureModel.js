const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Disclosure = sequelize.define('Disclosure', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    /** Portal hasBeenDisciplined */
    discipline_action: { type: DataTypes.BOOLEAN, allowNull: true },
    discipline_explanation: { type: DataTypes.TEXT, allowNull: true },
    /** Portal hasBeenConvicted (non-traffic). Legacy column traffic_offense kept for compatibility. */
    traffic_offense: { type: DataTypes.BOOLEAN, allowNull: true },
    criminal_conviction: { type: DataTypes.BOOLEAN, allowNull: true },
    conviction_explanation: { type: DataTypes.TEXT, allowNull: true },
    /** Portal hasDisability */
    disability: { type: DataTypes.BOOLEAN, allowNull: true },
    disability_details: { type: DataTypes.TEXT, allowNull: true },
    /** Portal requiresAccommodation — column name retains typo from legacy schema */
    special_accomadations: { type: DataTypes.BOOLEAN, allowNull: true },
    accommodation_details: { type: DataTypes.TEXT, allowNull: true },
    /** Portal howHeard */
    referral_source: { type: DataTypes.STRING(255), allowNull: true },
    referral_source_other: { type: DataTypes.STRING(500), allowNull: true },
    /** Portal referralDescription */
    referral_description: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'Disclosures',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Disclosure;
