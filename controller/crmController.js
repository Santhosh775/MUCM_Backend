const {
    Tenant,
    Program,
    Intake,
    Lead,
    PipelineStage
} = require('../model/associations');

const modelMap = {
    tenants: { model: Tenant, label: 'Tenant' },
    programs: { model: Program, label: 'Program' },
    intakes: { model: Intake, label: 'Intake' },
    leads: { model: Lead, label: 'Lead' },
    pipeline_stages: { model: PipelineStage, label: 'Pipeline stage' }
};

function getEntityOr404(req, res) {
    const entity = modelMap[req.params.entity];
    if (!entity) {
        res.status(404).json({ success: false, message: 'Module not found' });
        return null;
    }
    return entity;
}

exports.createEntity = async (req, res) => {
    try {
        const entity = getEntityOr404(req, res);
        if (!entity) return;
        const row = await entity.model.create(req.body);
        return res.status(201).json({ success: true, message: `${entity.label} created`, data: row });
    } catch (error) {
        console.error('createEntity', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listEntities = async (req, res) => {
    try {
        const entity = getEntityOr404(req, res);
        if (!entity) return;
        const rows = await entity.model.findAll({
            where: { deleted_at: null },
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listEntities', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getEntityById = async (req, res) => {
    try {
        const entity = getEntityOr404(req, res);
        if (!entity) return;
        const row = await entity.model.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: `${entity.label} not found` });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('getEntityById', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateEntity = async (req, res) => {
    try {
        const entity = getEntityOr404(req, res);
        if (!entity) return;
        const row = await entity.model.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: `${entity.label} not found` });
        await row.update(req.body);
        return res.json({ success: true, message: `${entity.label} updated`, data: row });
    } catch (error) {
        console.error('updateEntity', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteEntity = async (req, res) => {
    try {
        const entity = getEntityOr404(req, res);
        if (!entity) return;
        const row = await entity.model.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: `${entity.label} not found` });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: `${entity.label} deleted` });
    } catch (error) {
        console.error('deleteEntity', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
