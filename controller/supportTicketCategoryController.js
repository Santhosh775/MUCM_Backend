const { Op } = require('sequelize');
const { SupportTicketCategory, SupportTicket } = require('../model/associations');

exports.create = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const existing = await SupportTicketCategory.findOne({
            where: { name: { [Op.iLike]: name }, deleted_at: null }
        });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Support ticket category already exists' });
        }

        const row = await SupportTicketCategory.create({
            name,
            description: req.body.description ? String(req.body.description).trim() : null,
            is_active: req.body.is_active !== false,
            sort_order: req.body.sort_order != null ? Number(req.body.sort_order) : 0
        });
        return res.status(201).json({ success: true, message: 'Support ticket category created', data: row });
    } catch (error) {
        console.error('create support ticket category', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const row = await SupportTicketCategory.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Support ticket category not found' });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('getById support ticket category', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const includeInactive = req.query.include_inactive === 'true';
        const rows = await SupportTicketCategory.findAll({
            where: { deleted_at: null, ...(includeInactive ? {} : { is_active: true }) },
            order: [
                ['sort_order', 'ASC'],
                ['created_at', 'ASC']
            ]
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listAll support ticket category', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await SupportTicketCategory.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Support ticket category not found' });

        const next = {};
        if (req.body.name !== undefined) {
            const nextName = String(req.body.name).trim();
            const duplicate = await SupportTicketCategory.findOne({
                where: {
                    id: { [Op.ne]: row.id },
                    deleted_at: null,
                    name: { [Op.iLike]: nextName }
                }
            });
            if (duplicate) {
                return res
                    .status(409)
                    .json({ success: false, message: 'Support ticket category name already exists' });
            }
            next.name = nextName;
        }
        if (req.body.description !== undefined) {
            next.description = req.body.description == null ? null : String(req.body.description).trim();
        }
        if (req.body.is_active !== undefined) next.is_active = Boolean(req.body.is_active);
        if (req.body.sort_order !== undefined) next.sort_order = Number(req.body.sort_order);

        const oldName = row.name;
        await row.update(next);

        if (next.name && next.name !== oldName) {
            await SupportTicket.update(
                { category: next.name },
                { where: { category_id: row.id, deleted_at: null } }
            );
        }

        return res.json({ success: true, message: 'Support ticket category updated', data: row });
    } catch (error) {
        console.error('update support ticket category', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await SupportTicketCategory.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Support ticket category not found' });

        await SupportTicket.update(
            { category_id: null, category: 'Other' },
            { where: { category_id: row.id, deleted_at: null } }
        );

        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Support ticket category deleted' });
    } catch (error) {
        console.error('remove support ticket category', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
