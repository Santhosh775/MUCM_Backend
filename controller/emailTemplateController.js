const { Op } = require('sequelize');
const { EmailTemplate } = require('../model/associations');
const { deriveBodyPreview } = require('../utils/sendComposeEmail');

function normalizeMergeFields(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return ['{{applicant_name}}'];
    return arr.map((f) => {
        const s = String(f).trim();
        if (!s) return null;
        if (s.startsWith('{{') && s.endsWith('}}')) return s;
        const inner = s.replace(/[{}]/g, '');
        return `{{${inner}}}`;
    }).filter(Boolean);
}

function formatTemplate(row) {
    const j = row.toJSON ? row.toJSON() : row;
    const body = j.body ?? '';
    const updated = j.updated_at;
    return {
        id: j.id,
        name: j.name,
        category: j.category,
        subject: j.subject,
        body,
        bodyPreview: deriveBodyPreview(body),
        mergeFields: Array.isArray(j.merge_fields) ? j.merge_fields : [],
        active: Boolean(j.is_active),
        lastEdited: updated ? String(updated).slice(0, 10) : null,
        created_at: j.created_at,
        updated_at: j.updated_at
    };
}

exports.create = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const subject = String(req.body.subject || '').trim();
        const body = String(req.body.body ?? '').trim();
        const category = String(req.body.category || 'Other').trim() || 'Other';

        const duplicate = await EmailTemplate.findOne({
            where: { name: { [Op.iLike]: name }, deleted_at: null }
        });
        if (duplicate) {
            return res.status(409).json({ success: false, message: 'An email template with this name already exists' });
        }

        const merge_fields = normalizeMergeFields(req.body.merge_fields);

        const row = await EmailTemplate.create({
            name,
            category,
            subject,
            body,
            merge_fields,
            is_active: req.body.is_active !== false
        });

        return res.status(201).json({ success: true, message: 'Email template created', data: formatTemplate(row) });
    } catch (error) {
        console.error('create email template', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const row = await EmailTemplate.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Email template not found' });
        return res.json({ success: true, data: formatTemplate(row) });
    } catch (error) {
        console.error('getById email template', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const category = req.query.category ? String(req.query.category).trim() : '';
        const search = req.query.search ? String(req.query.search).trim() : '';
        const activeOnly = req.query.active_only;

        const where = { deleted_at: null };
        if (activeOnly === 'yes') where.is_active = true;
        if (activeOnly === 'no') where.is_active = false;
        if (category) where.category = category;

        if (search) {
            const q = { [Op.iLike]: `%${search}%` };
            where[Op.or] = [{ name: q }, { subject: q }, { category: q }];
        }

        const rows = await EmailTemplate.findAll({
            where,
            order: [
                ['category', 'ASC'],
                ['name', 'ASC']
            ]
        });

        return res.json({ success: true, data: rows.map(formatTemplate) });
    } catch (error) {
        console.error('listAll email templates', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await EmailTemplate.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Email template not found' });

        const next = {};
        if (req.body.name !== undefined) {
            const nextName = String(req.body.name).trim();
            const dup = await EmailTemplate.findOne({
                where: {
                    id: { [Op.ne]: row.id },
                    deleted_at: null,
                    name: { [Op.iLike]: nextName }
                }
            });
            if (dup) {
                return res.status(409).json({ success: false, message: 'An email template with this name already exists' });
            }
            next.name = nextName;
        }
        if (req.body.category !== undefined) {
            next.category = String(req.body.category || 'Other').trim() || 'Other';
        }
        if (req.body.subject !== undefined) next.subject = String(req.body.subject || '').trim();
        if (req.body.body !== undefined) next.body = String(req.body.body ?? '').trim();
        if (req.body.merge_fields !== undefined) next.merge_fields = normalizeMergeFields(req.body.merge_fields);
        if (req.body.is_active !== undefined) next.is_active = Boolean(req.body.is_active);

        await row.update(next);
        await row.reload();

        return res.json({ success: true, message: 'Email template updated', data: formatTemplate(row) });
    } catch (error) {
        console.error('update email template', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await EmailTemplate.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Email template not found' });

        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Email template deleted' });
    } catch (error) {
        console.error('remove email template', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
