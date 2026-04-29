const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PersonalDetails = sequelize.define('PersonalDetails', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING(20), allowNull: false },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    middle_name: { type: DataTypes.STRING(100), allowNull: true },
    surname: { type: DataTypes.STRING(100), allowNull: false },
    preferred_name: { type: DataTypes.STRING(100), allowNull: true },
    pronouns: { type: DataTypes.STRING(20), allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.STRING(20), allowNull: false },
    /** Not on current portal form — optional */
    marital_status: { type: DataTypes.STRING(50), allowNull: true },
    /** Free text; matches portal "Name Change" (explanation if name changed in last five years) */
    name_change: { type: DataTypes.STRING(500), allowNull: true },
    ethnicity_race: { type: DataTypes.STRING(50), allowNull: true },
    nationality_citizenship: { type: DataTypes.STRING(100), allowNull: false },
    country_of_residence: { type: DataTypes.STRING(100), allowNull: false },
    passport_number: { type: DataTypes.STRING(50), allowNull: true },
    passport_expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
    visa_immigration_status: { type: DataTypes.STRING(50), allowNull: false },
    /** Not collected on current portal form — optional */
    language_spoken: { type: DataTypes.STRING(50), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: false },
    mobile_phone: { type: DataTypes.STRING(50), allowNull: false },
    home_phone: { type: DataTypes.STRING(50), allowNull: true },
    street_address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    state_province: { type: DataTypes.STRING(100), allowNull: true },
    postal_code: { type: DataTypes.STRING(20), allowNull: false },
    country: { type: DataTypes.STRING(100), allowNull: false },
    mailing_same_as_permanent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    mailing_street_address: { type: DataTypes.TEXT, allowNull: true },
    /** Required when mailing_same_as_permanent is false; otherwise null */
    mailing_city: { type: DataTypes.STRING(100), allowNull: true },
    mailing_state_province: { type: DataTypes.STRING(100), allowNull: true },
    mailing_postal_code: { type: DataTypes.STRING(20), allowNull: true },
    mailing_country: { type: DataTypes.STRING(100), allowNull: true }
}, {
    tableName: 'personal_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PersonalDetails;
