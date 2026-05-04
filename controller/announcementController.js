const { Announcement } = require('../model/associations');

function toNullIfEmpty(v) {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
}

function formatRow(row) {
    const j = row.toJSON ? row.toJSON() : row;
    return {
        id: j.id,
        title: j.title,
        body: j.body,
        target_program_id: j.target_program_id,
        target_intake_id: j.target_intake_id,
        target_pipeline_stage_key: j.target_pipeline_stage_key,
        is_active: j.is_active !== false,
        created_at: j.created_at,
        updated_at: j.updated_at
    };
}

exports.listAll = async (req, res) => {
    try {
        const where = { deleted_at: null };
        const ia = req.query.is_active;
        if (ia === 'true') where.is_active = true;
        else if (ia === 'false') where.is_active = false;

        const rows = await Announcement.findAll({
            where,
            order: [['updated_at', 'DESC']]
        });

        const payload = { success: true, data: rows.map((r) => formatRow(r)) };

        const ic = req.query.include_counts;
        const wantCounts = ic === 'true' || ic === '1';
        if (wantCounts) {
            const base = { deleted_at: null };
            const [all, published, archived] = await Promise.all([
                Announcement.count({ where: base }),
                Announcement.count({ where: { ...base, is_active: true } }),
                Announcement.count({ where: { ...base, is_active: false } })
            ]);
            payload.counts = { all, published, archived };
        }

        return res.json(payload);
    } catch (error) {
        console.error('listAll announcements', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const row = await Announcement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Announcement not found' });
        return res.json({ success: true, data: formatRow(row) });
    } catch (error) {
        console.error('getById announcement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const title = String(req.body.title || '').trim();
        const body = String(req.body.body || '').trim();
        if (!title || !body) {
            return res.status(400).json({ success: false, message: 'title and body are required' });
        }

        const target_program_id = toNullIfEmpty(req.body.target_program_id ?? req.body.targetProgramId);
        const target_intake_id = toNullIfEmpty(req.body.target_intake_id ?? req.body.targetIntakeId);
        const target_pipeline_stage_key = toNullIfEmpty(
            req.body.target_pipeline_stage_key ?? req.body.targetPipelineStageKey
        );

        const row = await Announcement.create({
            title,
            body,
            target_program_id,
            target_intake_id,
            target_pipeline_stage_key,
            is_active: req.body.is_active !== false && req.body.active !== false
        });

        return res.status(201).json({ success: true, message: 'Announcement created', data: formatRow(row) });
    } catch (error) {
        console.error('create announcement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const row = await Announcement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Announcement not found' });

        const next = {};
        if (req.body.title !== undefined) next.title = String(req.body.title).trim();
        if (req.body.body !== undefined) next.body = String(req.body.body).trim();
        if (req.body.target_program_id !== undefined || req.body.targetProgramId !== undefined) {
            next.target_program_id = toNullIfEmpty(req.body.target_program_id ?? req.body.targetProgramId);
        }
        if (req.body.target_intake_id !== undefined || req.body.targetIntakeId !== undefined) {
            next.target_intake_id = toNullIfEmpty(req.body.target_intake_id ?? req.body.targetIntakeId);
        }
        if (req.body.target_pipeline_stage_key !== undefined || req.body.targetPipelineStageKey !== undefined) {
            next.target_pipeline_stage_key = toNullIfEmpty(
                req.body.target_pipeline_stage_key ?? req.body.targetPipelineStageKey
            );
        }
        if (req.body.is_active !== undefined) next.is_active = Boolean(req.body.is_active);
        if (req.body.active !== undefined) next.is_active = Boolean(req.body.active);

        if (next.title !== undefined && !next.title) {
            return res.status(400).json({ success: false, message: 'title cannot be empty' });
        }
        if (next.body !== undefined && !next.body) {
            return res.status(400).json({ success: false, message: 'body cannot be empty' });
        }

        await row.update(next);
        await row.reload();
        return res.json({ success: true, message: 'Announcement updated', data: formatRow(row) });
    } catch (error) {
        console.error('update announcement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await Announcement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Announcement not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        console.error('remove announcement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
