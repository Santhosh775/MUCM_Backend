const { AdminRole, Admin } = require('../model/associations');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const duplicate = await AdminRole.findOne({
            where: { name: { [Op.iLike]: name }, deleted_at: null }
        });
        if (duplicate) return res.status(409).json({ success: false, message: 'Admin role already exists' });

        const row = await AdminRole.create({
            name,
            summary: req.body.summary ? String(req.body.summary).trim() : null,
            permissions: req.body.permissions ?? null,
            is_active: req.body.is_active !== false
        });
        return res.status(201).json({ success: true, message: 'Admin role created', data: row });
    } catch (error) {
        console.error('create admin role', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const row = await AdminRole.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin role not found' });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('getById admin role', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const rows = await AdminRole.findAll({
            where: { deleted_at: null },
            include: [{ model: Admin, as: 'admins', attributes: ['id'], required: false }],
            order: [['created_at', 'DESC']]
        });
        const data = rows.map((row) => {
            const j = row.toJSON();
            return {
                ...j,
                users_assigned: Array.isArray(j.admins) ? j.admins.length : 0
            };
        });
        return res.json({ success: true, data });
    } catch (error) {
        console.error('listAll admin roles', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await AdminRole.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin role not found' });

        const next = {};
        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim();
            const duplicate = await AdminRole.findOne({
                where: { id: { [Op.ne]: row.id }, name: { [Op.iLike]: name }, deleted_at: null }
            });
            if (duplicate) return res.status(409).json({ success: false, message: 'Admin role name already exists' });
            next.name = name;
        }
        if (req.body.summary !== undefined) next.summary = req.body.summary == null ? null : String(req.body.summary).trim();
        if (req.body.permissions !== undefined) next.permissions = req.body.permissions;
        if (req.body.is_active !== undefined) next.is_active = Boolean(req.body.is_active);

        await row.update(next);
        return res.json({ success: true, message: 'Admin role updated', data: row });
    } catch (error) {
        console.error('update admin role', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await AdminRole.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin role not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Admin role deleted' });
    } catch (error) {
        console.error('remove admin role', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
