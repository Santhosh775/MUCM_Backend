const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApplicationUser = sequelize.define('ApplicationUser', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
    otp_code_hash: { type: DataTypes.STRING(128), allowNull: true },
    otp_expires_at: { type: DataTypes.DATE, allowNull: true },
    last_otp_sent_at: { type: DataTypes.DATE, allowNull: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    /** Server-side application form draft (portal JSON + step index) */
    portal_form_draft: { type: DataTypes.JSON, allowNull: true },
    portal_draft_step_index: { type: DataTypes.INTEGER, allowNull: true },
    portal_draft_updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'application_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ApplicationUser;
