const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmergencyContact = sequelize.define('EmergencyContact', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    full_name: { type: DataTypes.STRING(255), allowNull: false },
    relationship: { type: DataTypes.STRING(50), allowNull: false },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    country: { type: DataTypes.STRING(100), allowNull: true },
    home_address: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'emergency_contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = EmergencyContact;
