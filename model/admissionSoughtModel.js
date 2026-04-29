const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdmissionSought = sequelize.define('AdmissionSought', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    /** Portal programType — required in UI when Academic Background is complete; nullable for drafts */
    program_type: { type: DataTypes.STRING(100), allowNull: true },
    /** Legacy / supplemental descriptor — optional */
    program_duration: { type: DataTypes.STRING(20), allowNull: true },
    /** Portal subProgram — optional */
    sub_program: { type: DataTypes.STRING(100), allowNull: true },
    /** Portal transferCredits when program_type is transfer-md: [{ institution, courses }, ...] */
    transfer_credits: { type: DataTypes.JSON, allowNull: true },
    /** Portal semester / year — required in UI; nullable for partial API saves */
    preferred_semester: { type: DataTypes.STRING(20), allowNull: true },
    preferred_year: { type: DataTypes.INTEGER, allowNull: true }
}, {
    tableName: 'admission_sought',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = AdmissionSought;
