const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureSupportTicketSchema() {
    const qi = sequelize.getQueryInterface();

    await qi.createTable('support_ticket_categories', {
        id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
        name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }).catch(() => {});

    let supportTicketColumns;
    try {
        supportTicketColumns = await qi.describeTable('support_tickets');
    } catch (err) {
        // Table doesn't exist yet, skip patches
        return;
    }

    if (!supportTicketColumns.category_id) {
        await qi.addColumn('support_tickets', 'category_id', {
            type: DataTypes.UUID,
            allowNull: true
        });
    }
    if (!supportTicketColumns.admin_reply_message) {
        await qi.addColumn('support_tickets', 'admin_reply_message', {
            type: DataTypes.TEXT,
            allowNull: true
        });
    }
    if (!supportTicketColumns.admin_replied_at) {
        await qi.addColumn('support_tickets', 'admin_replied_at', {
            type: DataTypes.DATE,
            allowNull: true
        });
    }

    const constraints = await qi.showConstraint('support_tickets').catch(() => []);
    const hasCategoryForeignKey = constraints.some(
        (constraint) =>
            constraint.columnNames?.includes('category_id') &&
            String(constraint.referencedTableName || '').toLowerCase() === 'support_ticket_categories'
    );

    if (!hasCategoryForeignKey) {
        await qi
            .addConstraint('support_tickets', {
                fields: ['category_id'],
                type: 'foreign key',
                name: 'support_tickets_category_id_fkey',
                references: {
                    table: 'support_ticket_categories',
                    field: 'id'
                },
                onDelete: 'SET NULL'
            })
            .catch(() => {});
    }
}

module.exports = { ensureSupportTicketSchema };
