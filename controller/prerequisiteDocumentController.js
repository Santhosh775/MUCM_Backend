const { ApplicationUser, PrerequisiteDocument } = require('../model/associations');

async function getUserOr404(req, res) {
    const { userId } = req.params;
    const user = await ApplicationUser.findOne({ where: { id: userId, is_active: true } });
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return null;
    }
    return user;
}

async function createRow(req, res) {
    try {
        const user = await getUserOr404(req, res);
        if (!user) return;

        const existing = await PrerequisiteDocument.findOne({ where: { user_id: user.id } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Prerequisite document checklist already exists for this user'
            });
        }

        const defaults = {
            valid_passport: false,
            bank_statement_3_months: false,
            premed_bachelor_12th_transcript: false,
            grade_11_transcript: false,
            curriculum_vitae: false,
            passport_size_photo: false
        };
        const payload = { ...defaults, ...req.body, user_id: user.id };
        const row = await PrerequisiteDocument.create(payload);
        return res.status(201).json({ success: true, message: 'Prerequisite document created', data: row });
    } catch (error) {
        console.error('createPrerequisiteDocument', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function listRows(req, res) {
    try {
        const user = await getUserOr404(req, res);
        if (!user) return;
        const rows = await PrerequisiteDocument.findAll({
            where: { user_id: user.id },
            order: [['created_at', 'DESC']]
        });
        return res.json({ success: true, message: 'Prerequisite documents list', data: rows });
    } catch (error) {
        console.error('listPrerequisiteDocuments', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function getRow(req, res) {
    try {
        const user = await getUserOr404(req, res);
        if (!user) return;
        const row = await PrerequisiteDocument.findOne({
            where: { id: req.params.rowId, user_id: user.id }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Prerequisite document not found' });
        return res.json({ success: true, data: row });
    } catch (error) {
        console.error('getPrerequisiteDocument', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function updateRow(req, res) {
    try {
        const user = await getUserOr404(req, res);
        if (!user) return;
        const row = await PrerequisiteDocument.findOne({
            where: { id: req.params.rowId, user_id: user.id }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Prerequisite document not found' });
        await row.update(req.body);
        return res.json({ success: true, message: 'Prerequisite document updated', data: row });
    } catch (error) {
        console.error('updatePrerequisiteDocument', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

async function deleteRow(req, res) {
    try {
        const user = await getUserOr404(req, res);
        if (!user) return;
        const row = await PrerequisiteDocument.findOne({
            where: { id: req.params.rowId, user_id: user.id }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Prerequisite document not found' });
        await row.destroy();
        return res.json({ success: true, message: 'Prerequisite document deleted' });
    } catch (error) {
        console.error('deletePrerequisiteDocument', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}

exports.createPrerequisiteDocument = createRow;
exports.listPrerequisiteDocuments = listRows;
exports.getPrerequisiteDocument = getRow;
exports.updatePrerequisiteDocument = updateRow;
exports.deletePrerequisiteDocument = deleteRow;
