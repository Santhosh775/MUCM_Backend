const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ParentGuardianInfo = sequelize.define('ParentGuardianInfo', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    application_id: { type: DataTypes.UUID, allowNull: true },
    father_name: { type: DataTypes.STRING(255), allowNull: true },
    father_occupation: { type: DataTypes.STRING(255), allowNull: true },
    father_email: { type: DataTypes.STRING(255), allowNull: true },
    father_phone: { type: DataTypes.STRING(50), allowNull: true },
    mother_name: { type: DataTypes.STRING(255), allowNull: true },
    mother_occupation: { type: DataTypes.STRING(255), allowNull: true },
    mother_email: { type: DataTypes.STRING(255), allowNull: true },
    mother_phone: { type: DataTypes.STRING(50), allowNull: true }
}, {
    tableName: 'parent_guardian_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ParentGuardianInfo;
