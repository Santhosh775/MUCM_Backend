const { Admin, AdminRole } = require('../model/associations');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
    try {
        const role = await AdminRole.findOne({
            where: { id: req.body.role_id, deleted_at: null, is_active: true }
        });
        if (!role) return res.status(404).json({ success: false, message: 'Admin role not found' });

        const email = String(req.body.email || '').trim().toLowerCase();
        const duplicate = await Admin.findOne({ where: { email, deleted_at: null } });
        if (duplicate) return res.status(409).json({ success: false, message: 'Admin email already exists' });

        const countryValue = req.body.country !== undefined ? req.body.country : req.body.region;
        const row = await Admin.create({
            role_id: req.body.role_id,
            full_name: String(req.body.full_name || '').trim(),
            email,
            country: countryValue !== undefined && countryValue !== null
                ? String(countryValue).trim() || null
                : null,
            permissions: req.body.permissions && typeof req.body.permissions === 'object'
                ? req.body.permissions
                : null,
            is_active: req.body.is_active !== false
        });

        await row.reload({ include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'] }] });
        return res.status(201).json({ success: true, message: 'Admin created', data: row });
    } catch (error) {
        console.error('create admin', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const row = await Admin.findOne({
            where: { id: req.params.id, deleted_at: null },
            include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'] }]
        });
        if (!row) return res.status(404).json({ success: false, message: 'Admin not found' });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('getById admin', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const rows = await Admin.findAll({
            where: { deleted_at: null },
            include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'] }],
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listAll admins', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await Admin.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin not found' });

        const next = {};
        if (req.body.role_id !== undefined) {
            const role = await AdminRole.findOne({
                where: { id: req.body.role_id, deleted_at: null, is_active: true }
            });
            if (!role) return res.status(404).json({ success: false, message: 'Admin role not found' });
            next.role_id = req.body.role_id;
        }
        if (req.body.full_name !== undefined) next.full_name = String(req.body.full_name).trim();
        if (req.body.email !== undefined) {
            const email = String(req.body.email).trim().toLowerCase();
            const duplicate = await Admin.findOne({
                where: { id: { [Op.ne]: row.id }, email, deleted_at: null }
            });
            if (duplicate) return res.status(409).json({ success: false, message: 'Admin email already exists' });
            next.email = email;
        }
        const nextCountryValue = req.body.country !== undefined ? req.body.country : req.body.region;
        if (nextCountryValue !== undefined) {
            next.country = nextCountryValue === null ? null : (String(nextCountryValue).trim() || null);
        }
        if (req.body.is_active !== undefined) next.is_active = Boolean(req.body.is_active);
        if (req.body.permissions !== undefined) {
            next.permissions = req.body.permissions && typeof req.body.permissions === 'object'
                ? req.body.permissions
                : null;
        }

        await row.update(next);
        await row.reload({ include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'] }] });
        return res.json({ success: true, message: 'Admin updated', data: row });
    } catch (error) {
        console.error('update admin', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const row = await Admin.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin not found' });

        const permissions = req.body.permissions && typeof req.body.permissions === 'object'
            ? req.body.permissions
            : {};

        await row.update({ permissions });
        await row.reload({ include: [{ model: AdminRole, as: 'role', attributes: ['id', 'name', 'is_active'] }] });
        return res.json({ success: true, message: 'Admin permissions updated', data: row });
    } catch (error) {
        console.error('update admin permissions', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await Admin.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Admin not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Admin deleted' });
    } catch (error) {
        console.error('remove admin', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
