const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
    Program,
    Intake,
    PipelineStage,
    FeeStructureItem,
    SettingsDocumentRequirement,
    DropdownOptionCategory,
    DropdownOptionValue
} = require('../model/associations');

function tenantFilter(tenantId) {
    if (!tenantId) return {};
    return { tenant_id: tenantId };
}

function parseAmountInput(amount) {
    const text = String(amount ?? '').trim() || '0';
    const normalized = text.replace(/,/g, '');
    const n = parseFloat(normalized);
    return { amount_text: text, amount_value: Number.isFinite(n) ? n : 0 };
}

function dashDate(v) {
    if (v == null || v === '') return '—';
    return String(v);
}

function formatProgram(row) {
    const j = row.toJSON ? row.toJSON() : row;
    const subPrograms = Array.isArray(j.sub_programs) ? j.sub_programs : [];
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        name: j.name,
        code: j.code,
        durationYears: j.duration_years,
        level: j.level || '—',
        description: j.description || '—',
        capacity: j.capacity ?? 0,
        active: j.active !== false,
        subPrograms
    };
}

function formatIntake(row) {
    const j = row.toJSON ? row.toJSON() : row;
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        program_id: j.program_id,
        name: j.name,
        startDate: dashDate(j.start_date),
        applicationDeadline: dashDate(j.application_deadline),
        capacity: j.capacity ?? 0,
        status: j.status || 'Open'
    };
}

function formatPipeline(row) {
    const j = row.toJSON ? row.toJSON() : row;
    const tmpl = j.notification_template;
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        order: j.stage_order,
        stageKey: j.stage_key,
        displayName: j.display_name,
        slaDays: j.sla_days,
        notificationTemplate: tmpl == null || tmpl === '' ? '—' : tmpl,
        active: j.active !== false
    };
}

function formatFeeItem(row) {
    const j = row.toJSON ? row.toJSON() : row;
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        program_id: j.program_id,
        intake_id: j.intake_id,
        programCode: j.program_code || '—',
        intakeName: j.intake_name || '—',
        feeType: j.fee_type,
        amount: j.amount_text,
        currency: j.currency || 'USD',
        refundPolicy: j.refund_policy || '—'
    };
}

function formatDocReq(row) {
    const j = row.toJSON ? row.toJSON() : row;
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        name: j.name,
        required: Boolean(j.required),
        acceptedTypes: j.accepted_types,
        maxSizeMb: j.max_size_mb
    };
}

function formatDropdownCategory(row, values) {
    const j = row.toJSON ? row.toJSON() : row;
    const opts = (values || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((v) => v.option_value);
    return {
        id: j.id,
        tenant_id: j.tenant_id,
        category: j.category,
        description: j.description || '—',
        options: opts
    };
}

async function findProgramByCode(tenant_id, codeRaw) {
    const code = String(codeRaw || '').trim();
    if (!code || code === '—') return null;
    const where = { deleted_at: null, code: { [Op.iLike]: code } };
    if (tenant_id) where.tenant_id = tenant_id;
    return Program.findOne({ where });
}

async function findIntakeByName(tenant_id, nameRaw) {
    const name = String(nameRaw || '').trim();
    if (!name || name === '—') return null;
    const where = { deleted_at: null, name: { [Op.iLike]: name } };
    if (tenant_id) where.tenant_id = tenant_id;
    return Intake.findOne({ where });
}

async function assertPipelineStageKeyUnique(tenant_id, stage_key, excludeId) {
    const base = { deleted_at: null, stage_key };
    const where = { ...base };
    if (tenant_id != null) {
        where.tenant_id = tenant_id;
    } else {
        where.tenant_id = { [Op.is]: null };
    }
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await PipelineStage.findOne({ where });
    return !existing;
}

async function assertProgramCodeUnique(tenant_id, code, excludeId) {
    const c = String(code || '').trim();
    const where = { deleted_at: null, code: { [Op.iLike]: c } };
    if (tenant_id != null) where.tenant_id = tenant_id;
    else where.tenant_id = { [Op.is]: null };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Program.findOne({ where });
    return !existing;
}

async function assertDropdownCategoryUnique(tenant_id, categoryLabel, excludeId) {
    const where = {
        deleted_at: null,
        category: { [Op.iLike]: String(categoryLabel || '').trim() }
    };
    if (tenant_id != null) where.tenant_id = tenant_id;
    else where.tenant_id = { [Op.is]: null };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await DropdownOptionCategory.findOne({ where });
    return !existing;
}

// --- Programs ---

exports.listPrograms = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const rows = await Program.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            order: [['name', 'ASC']]
        });
        return res.json({ success: true, data: rows.map(formatProgram) });
    } catch (error) {
        console.error('settings listPrograms', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getProgram = async (req, res) => {
    try {
        const row = await Program.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Program not found' });
        return res.json({ success: true, data: formatProgram(row) });
    } catch (error) {
        console.error('settings getProgram', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createProgram = async (req, res) => {
    try {
        const tenant_id = req.body.tenant_id ?? req.body.tenantId ?? null;
        const code = String(req.body.code || '').trim();
        if (!(await assertProgramCodeUnique(tenant_id, code, null))) {
            return res.status(409).json({ success: false, message: 'Program code already exists for this tenant' });
        }
        const subPrograms = Array.isArray(req.body.subPrograms) ? req.body.subPrograms.map((s) => String(s).trim()).filter(Boolean) : [];
        const row = await Program.create({
            tenant_id,
            name: String(req.body.name || '').trim(),
            code,
            duration_years: Math.max(0, Number(req.body.durationYears ?? req.body.duration_years) || 0),
            level: req.body.level != null ? String(req.body.level).trim() || null : null,
            description:
                req.body.description != null ? String(req.body.description).trim() || null : null,
            capacity: Math.max(0, Number(req.body.capacity) || 0),
            active: req.body.active !== false,
            sub_programs: subPrograms
        });
        return res.status(201).json({ success: true, message: 'Program created', data: formatProgram(row) });
    } catch (error) {
        console.error('settings createProgram', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateProgram = async (req, res) => {
    try {
        const row = await Program.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Program not found' });
        const nextCode = req.body.code !== undefined ? String(req.body.code).trim() : row.code;
        const tenant_id =
            req.body.tenant_id !== undefined || req.body.tenantId !== undefined
                ? req.body.tenant_id ?? req.body.tenantId
                : row.tenant_id;
        if (nextCode !== row.code || tenant_id !== row.tenant_id) {
            if (!(await assertProgramCodeUnique(tenant_id, nextCode, row.id))) {
                return res.status(409).json({ success: false, message: 'Program code already exists for this tenant' });
            }
        }
        const patch = {};
        if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
        if (req.body.code !== undefined) patch.code = nextCode;
        if (req.body.durationYears !== undefined || req.body.duration_years !== undefined) {
            patch.duration_years = Math.max(
                0,
                Number(req.body.durationYears ?? req.body.duration_years) || 0
            );
        }
        if (req.body.level !== undefined) patch.level = String(req.body.level).trim() || null;
        if (req.body.description !== undefined) {
            patch.description = String(req.body.description ?? '').trim() || null;
        }
        if (req.body.capacity !== undefined) patch.capacity = Math.max(0, Number(req.body.capacity) || 0);
        if (req.body.active !== undefined) patch.active = Boolean(req.body.active);
        if (req.body.tenant_id !== undefined || req.body.tenantId !== undefined) {
            patch.tenant_id = req.body.tenant_id ?? req.body.tenantId;
        }
        if (req.body.subPrograms !== undefined) {
            patch.sub_programs = Array.isArray(req.body.subPrograms)
                ? req.body.subPrograms.map((s) => String(s).trim()).filter(Boolean)
                : [];
        }
        await row.update(patch);
        return res.json({ success: true, message: 'Program updated', data: formatProgram(row) });
    } catch (error) {
        console.error('settings updateProgram', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteProgram = async (req, res) => {
    try {
        const row = await Program.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Program not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Program deleted' });
    } catch (error) {
        console.error('settings deleteProgram', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// --- Intakes ---

exports.listIntakes = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const rows = await Intake.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            order: [['start_date', 'DESC'], ['name', 'ASC']]
        });
        return res.json({ success: true, data: rows.map(formatIntake) });
    } catch (error) {
        console.error('settings listIntakes', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getIntake = async (req, res) => {
    try {
        const row = await Intake.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Intake not found' });
        return res.json({ success: true, data: formatIntake(row) });
    } catch (error) {
        console.error('settings getIntake', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createIntake = async (req, res) => {
    try {
        const tenant_id = req.body.tenant_id ?? req.body.tenantId ?? null;
        const program_id = req.body.program_id ?? req.body.programId ?? null;
        const sd = req.body.startDate ?? req.body.start_date;
        const ad = req.body.applicationDeadline ?? req.body.application_deadline;
        const row = await Intake.create({
            tenant_id,
            program_id,
            name: String(req.body.name || '').trim(),
            start_date: sd === undefined || sd === '' || sd === '—' ? null : String(sd),
            application_deadline:
                ad === undefined || ad === '' || ad === '—' ? null : String(ad),
            capacity: Math.max(0, Number(req.body.capacity) || 0),
            status: req.body.status ? String(req.body.status).trim() : 'Open'
        });
        return res.status(201).json({ success: true, message: 'Intake created', data: formatIntake(row) });
    } catch (error) {
        console.error('settings createIntake', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateIntake = async (req, res) => {
    try {
        const row = await Intake.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Intake not found' });
        const patch = {};
        if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
        if (req.body.startDate !== undefined || req.body.start_date !== undefined) {
            const sd = req.body.startDate ?? req.body.start_date;
            patch.start_date = sd === '' || sd === '—' ? null : String(sd);
        }
        if (req.body.applicationDeadline !== undefined || req.body.application_deadline !== undefined) {
            const ad = req.body.applicationDeadline ?? req.body.application_deadline;
            patch.application_deadline = ad === '' || ad === '—' ? null : String(ad);
        }
        if (req.body.capacity !== undefined) patch.capacity = Math.max(0, Number(req.body.capacity) || 0);
        if (req.body.status !== undefined) patch.status = String(req.body.status).trim();
        if (req.body.program_id !== undefined || req.body.programId !== undefined) {
            patch.program_id = req.body.program_id ?? req.body.programId;
        }
        if (req.body.tenant_id !== undefined || req.body.tenantId !== undefined) {
            patch.tenant_id = req.body.tenant_id ?? req.body.tenantId;
        }
        await row.update(patch);
        return res.json({ success: true, message: 'Intake updated', data: formatIntake(row) });
    } catch (error) {
        console.error('settings updateIntake', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteIntake = async (req, res) => {
    try {
        const row = await Intake.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Intake not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Intake deleted' });
    } catch (error) {
        console.error('settings deleteIntake', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// --- Fee structure ---

exports.listFeeRules = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const rows = await FeeStructureItem.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            order: [
                ['sort_order', 'ASC'],
                ['created_at', 'DESC']
            ]
        });
        return res.json({ success: true, data: rows.map(formatFeeItem) });
    } catch (error) {
        console.error('settings listFeeRules', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getFeeRule = async (req, res) => {
    try {
        const row = await FeeStructureItem.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Fee rule not found' });
        return res.json({ success: true, data: formatFeeItem(row) });
    } catch (error) {
        console.error('settings getFeeRule', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createFeeRule = async (req, res) => {
    try {
        const tenant_id = req.body.tenant_id ?? req.body.tenantId ?? null;
        let program_id = req.body.program_id ?? req.body.programId ?? null;
        let intake_id = req.body.intake_id ?? req.body.intakeId ?? null;
        const programCode = String(req.body.programCode ?? req.body.program_code ?? '').trim() || '—';
        const intakeName = String(req.body.intakeName ?? req.body.intake_name ?? '').trim() || '—';
        if (!program_id && programCode !== '—') {
            const p = await findProgramByCode(tenant_id, programCode);
            if (p) program_id = p.id;
        }
        if (!intake_id && intakeName !== '—') {
            const i = await findIntakeByName(tenant_id, intakeName);
            if (i) intake_id = i.id;
        }
        const { amount_text, amount_value } = parseAmountInput(req.body.amount);
        const row = await FeeStructureItem.create({
            tenant_id,
            program_id,
            intake_id,
            program_code: programCode === '—' ? '' : programCode,
            intake_name: intakeName === '—' ? '' : intakeName,
            fee_type: String(req.body.feeType ?? req.body.fee_type ?? '').trim(),
            amount_text,
            amount_value,
            currency: String(req.body.currency || 'USD').trim() || 'USD',
            refund_policy: String(req.body.refundPolicy ?? req.body.refund_policy ?? '').trim() || null,
            sort_order: Number(req.body.sort_order ?? req.body.sortOrder) || 0
        });
        return res.status(201).json({ success: true, message: 'Fee rule created', data: formatFeeItem(row) });
    } catch (error) {
        console.error('settings createFeeRule', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateFeeRule = async (req, res) => {
    try {
        const row = await FeeStructureItem.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Fee rule not found' });
        const tenant_id =
            req.body.tenant_id !== undefined || req.body.tenantId !== undefined
                ? req.body.tenant_id ?? req.body.tenantId
                : row.tenant_id;
        let program_id = req.body.program_id ?? req.body.programId ?? row.program_id;
        let intake_id = req.body.intake_id ?? req.body.intakeId ?? row.intake_id;
        const programCode =
            req.body.programCode !== undefined || req.body.program_code !== undefined
                ? String(req.body.programCode ?? req.body.program_code).trim() || '—'
                : row.program_code || '—';
        const intakeName =
            req.body.intakeName !== undefined || req.body.intake_name !== undefined
                ? String(req.body.intakeName ?? req.body.intake_name).trim() || '—'
                : row.intake_name || '—';
        if (req.body.programCode !== undefined || req.body.program_code !== undefined || !program_id) {
            const p =
                programCode !== '—' ? await findProgramByCode(tenant_id, programCode) : null;
            program_id = p ? p.id : program_id;
        }
        if (req.body.intakeName !== undefined || req.body.intake_name !== undefined || !intake_id) {
            const i = intakeName !== '—' ? await findIntakeByName(tenant_id, intakeName) : null;
            intake_id = i ? i.id : intake_id;
        }
        const patch = {
            tenant_id,
            program_id,
            intake_id,
            program_code: programCode === '—' ? '' : programCode,
            intake_name: intakeName === '—' ? '' : intakeName
        };
        if (req.body.feeType !== undefined || req.body.fee_type !== undefined) {
            patch.fee_type = String(req.body.feeType ?? req.body.fee_type).trim();
        }
        if (req.body.amount !== undefined) {
            const a = parseAmountInput(req.body.amount);
            patch.amount_text = a.amount_text;
            patch.amount_value = a.amount_value;
        }
        if (req.body.currency !== undefined) patch.currency = String(req.body.currency).trim() || 'USD';
        if (req.body.refundPolicy !== undefined || req.body.refund_policy !== undefined) {
            patch.refund_policy =
                String(req.body.refundPolicy ?? req.body.refund_policy ?? '').trim() || null;
        }
        if (req.body.sort_order !== undefined || req.body.sortOrder !== undefined) {
            patch.sort_order = Number(req.body.sort_order ?? req.body.sortOrder) || 0;
        }
        await row.update(patch);
        return res.json({ success: true, message: 'Fee rule updated', data: formatFeeItem(row) });
    } catch (error) {
        console.error('settings updateFeeRule', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteFeeRule = async (req, res) => {
    try {
        const row = await FeeStructureItem.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Fee rule not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Fee rule deleted' });
    } catch (error) {
        console.error('settings deleteFeeRule', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// --- Document requirements ---

exports.listDocRequirements = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const rows = await SettingsDocumentRequirement.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC']
            ]
        });
        return res.json({ success: true, data: rows.map(formatDocReq) });
    } catch (error) {
        console.error('settings listDocRequirements', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getDocRequirement = async (req, res) => {
    try {
        const row = await SettingsDocumentRequirement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Document requirement not found' });
        return res.json({ success: true, data: formatDocReq(row) });
    } catch (error) {
        console.error('settings getDocRequirement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createDocRequirement = async (req, res) => {
    try {
        const maxSort = await SettingsDocumentRequirement.max('sort_order', {
            where: { deleted_at: null, ...tenantFilter(req.body.tenant_id ?? req.body.tenantId ?? null) }
        });
        const row = await SettingsDocumentRequirement.create({
            tenant_id: req.body.tenant_id ?? req.body.tenantId ?? null,
            name: String(req.body.name || '').trim(),
            required: req.body.required !== false,
            accepted_types: String(req.body.acceptedTypes ?? req.body.accepted_types ?? 'PDF').trim() || 'PDF',
            max_size_mb: Math.max(1, Number(req.body.maxSizeMb ?? req.body.max_size_mb) || 10),
            sort_order: (maxSort != null ? Number(maxSort) : -1) + 1
        });
        return res.status(201).json({ success: true, message: 'Document requirement created', data: formatDocReq(row) });
    } catch (error) {
        console.error('settings createDocRequirement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateDocRequirement = async (req, res) => {
    try {
        const row = await SettingsDocumentRequirement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Document requirement not found' });
        const patch = {};
        if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
        if (req.body.required !== undefined) patch.required = Boolean(req.body.required);
        if (req.body.acceptedTypes !== undefined || req.body.accepted_types !== undefined) {
            patch.accepted_types =
                String(req.body.acceptedTypes ?? req.body.accepted_types ?? 'PDF').trim() || 'PDF';
        }
        if (req.body.maxSizeMb !== undefined || req.body.max_size_mb !== undefined) {
            patch.max_size_mb = Math.max(1, Number(req.body.maxSizeMb ?? req.body.max_size_mb) || 1);
        }
        if (req.body.sort_order !== undefined || req.body.sortOrder !== undefined) {
            patch.sort_order = Number(req.body.sort_order ?? req.body.sortOrder) || 0;
        }
        if (req.body.tenant_id !== undefined || req.body.tenantId !== undefined) {
            patch.tenant_id = req.body.tenant_id ?? req.body.tenantId;
        }
        await row.update(patch);
        return res.json({ success: true, message: 'Document requirement updated', data: formatDocReq(row) });
    } catch (error) {
        console.error('settings updateDocRequirement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteDocRequirement = async (req, res) => {
    try {
        const row = await SettingsDocumentRequirement.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'Document requirement not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Document requirement deleted' });
    } catch (error) {
        console.error('settings deleteDocRequirement', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// --- Pipeline stages ---

exports.listPipelineStages = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const rows = await PipelineStage.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            order: [
                ['stage_order', 'ASC'],
                ['display_name', 'ASC']
            ]
        });
        return res.json({ success: true, data: rows.map(formatPipeline) });
    } catch (error) {
        console.error('settings listPipelineStages', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getPipelineStage = async (req, res) => {
    try {
        const row = await PipelineStage.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Pipeline stage not found' });
        return res.json({ success: true, data: formatPipeline(row) });
    } catch (error) {
        console.error('settings getPipelineStage', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createPipelineStage = async (req, res) => {
    try {
        const tenant_id = req.body.tenant_id ?? req.body.tenantId ?? null;
        const stage_key = String(req.body.stageKey ?? req.body.stage_key ?? '')
            .trim()
            .replace(/\s+/g, '_')
            .toLowerCase();
        if (!(await assertPipelineStageKeyUnique(tenant_id, stage_key, null))) {
            return res.status(409).json({ success: false, message: 'Stage key already exists for this tenant' });
        }
        const tmplRaw = req.body.notificationTemplate ?? req.body.notification_template;
        const tmpl =
            tmplRaw === undefined || tmplRaw === null || String(tmplRaw).trim() === ''
                ? '—'
                : String(tmplRaw).trim();
        const row = await PipelineStage.create({
            tenant_id,
            stage_key,
            display_name: String(req.body.displayName ?? req.body.display_name ?? '').trim(),
            stage_order: Math.max(1, Number(req.body.order ?? req.body.stage_order) || 1),
            sla_days:
                req.body.slaDays === '' ||
                req.body.sla_days === '' ||
                req.body.slaDays == null ||
                req.body.sla_days == null
                    ? null
                    : Math.max(0, Number(req.body.slaDays ?? req.body.sla_days) || 0),
            notification_template: tmpl === '—' ? null : tmpl,
            active: req.body.active !== false,
            notification_template_id: req.body.notification_template_id ?? null
        });
        return res.status(201).json({ success: true, message: 'Pipeline stage created', data: formatPipeline(row) });
    } catch (error) {
        console.error('settings createPipelineStage', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updatePipelineStage = async (req, res) => {
    try {
        const row = await PipelineStage.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Pipeline stage not found' });
        const tenant_id =
            req.body.tenant_id !== undefined || req.body.tenantId !== undefined
                ? req.body.tenant_id ?? req.body.tenantId
                : row.tenant_id;
        let stage_key = row.stage_key;
        if (req.body.stageKey !== undefined || req.body.stage_key !== undefined) {
            stage_key = String(req.body.stageKey ?? req.body.stage_key)
                .trim()
                .replace(/\s+/g, '_')
                .toLowerCase();
        }
        if (stage_key !== row.stage_key || tenant_id !== row.tenant_id) {
            if (!(await assertPipelineStageKeyUnique(tenant_id, stage_key, row.id))) {
                return res.status(409).json({ success: false, message: 'Stage key already exists for this tenant' });
            }
        }
        const patch = { tenant_id, stage_key };
        if (req.body.displayName !== undefined || req.body.display_name !== undefined) {
            patch.display_name = String(req.body.displayName ?? req.body.display_name).trim();
        }
        if (req.body.order !== undefined || req.body.stage_order !== undefined) {
            patch.stage_order = Math.max(1, Number(req.body.order ?? req.body.stage_order) || 1);
        }
        if (req.body.slaDays !== undefined || req.body.sla_days !== undefined) {
            const v = req.body.slaDays ?? req.body.sla_days;
            patch.sla_days = v === '' || v == null ? null : Math.max(0, Number(v) || 0);
        }
        if (req.body.notificationTemplate !== undefined || req.body.notification_template !== undefined) {
            const tmplRaw = req.body.notificationTemplate ?? req.body.notification_template;
            const tmpl =
                tmplRaw === undefined || tmplRaw === null || String(tmplRaw).trim() === ''
                    ? '—'
                    : String(tmplRaw).trim();
            patch.notification_template = tmpl === '—' ? null : tmpl;
        }
        if (req.body.active !== undefined) patch.active = Boolean(req.body.active);
        if (req.body.notification_template_id !== undefined) {
            patch.notification_template_id = req.body.notification_template_id;
        }
        await row.update(patch);
        return res.json({ success: true, message: 'Pipeline stage updated', data: formatPipeline(row) });
    } catch (error) {
        console.error('settings updatePipelineStage', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deletePipelineStage = async (req, res) => {
    try {
        const row = await PipelineStage.findOne({ where: { id: req.params.id, deleted_at: null } });
        if (!row) return res.status(404).json({ success: false, message: 'Pipeline stage not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'Pipeline stage deleted' });
    } catch (error) {
        console.error('settings deletePipelineStage', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// --- Dropdown categories ---

exports.listDropdownCategories = async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || null;
        const categories = await DropdownOptionCategory.findAll({
            where: { deleted_at: null, ...tenantFilter(tenantId) },
            include: [
                {
                    model: DropdownOptionValue,
                    as: 'option_values',
                    where: { deleted_at: null },
                    required: false
                }
            ],
            order: [['category', 'ASC']]
        });
        const data = categories.map((c) => formatDropdownCategory(c, c.option_values));
        return res.json({ success: true, data });
    } catch (error) {
        console.error('settings listDropdownCategories', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.getDropdownCategory = async (req, res) => {
    try {
        const row = await DropdownOptionCategory.findOne({
            where: { id: req.params.id, deleted_at: null },
            include: [
                {
                    model: DropdownOptionValue,
                    as: 'option_values',
                    where: { deleted_at: null },
                    required: false
                }
            ]
        });
        if (!row) return res.status(404).json({ success: false, message: 'Dropdown category not found' });
        return res.json({ success: true, data: formatDropdownCategory(row, row.option_values) });
    } catch (error) {
        console.error('settings getDropdownCategory', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.createDropdownCategory = async (req, res) => {
    const trx = await sequelize.transaction();
    try {
        const tenant_id = req.body.tenant_id ?? req.body.tenantId ?? null;
        const category = String(req.body.category || '').trim();
        if (!(await assertDropdownCategoryUnique(tenant_id, category, null))) {
            await trx.rollback();
            return res.status(409).json({ success: false, message: 'Dropdown category already exists' });
        }
        const options = Array.isArray(req.body.options) ? req.body.options : [];
        const cleaned = options.map((o) => String(o).trim()).filter(Boolean);
        if (cleaned.length === 0) {
            await trx.rollback();
            return res.status(400).json({ success: false, message: 'At least one option is required' });
        }
        const cat = await DropdownOptionCategory.create(
            {
                tenant_id,
                category,
                description: String(req.body.description ?? '').trim() || null
            },
            { transaction: trx }
        );
        await DropdownOptionValue.bulkCreate(
            cleaned.map((option_value, idx) => ({
                category_id: cat.id,
                option_value,
                sort_order: idx
            })),
            { transaction: trx }
        );
        await trx.commit();
        const withVals = await DropdownOptionCategory.findByPk(cat.id, {
            include: [
                {
                    model: DropdownOptionValue,
                    as: 'option_values',
                    where: { deleted_at: null },
                    required: false
                }
            ]
        });
        return res.status(201).json({
            success: true,
            message: 'Dropdown category created',
            data: formatDropdownCategory(withVals, withVals.option_values)
        });
    } catch (error) {
        await trx.rollback();
        console.error('settings createDropdownCategory', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.updateDropdownCategory = async (req, res) => {
    const trx = await sequelize.transaction();
    try {
        const row = await DropdownOptionCategory.findOne({
            where: { id: req.params.id, deleted_at: null },
            transaction: trx
        });
        if (!row) {
            await trx.rollback();
            return res.status(404).json({ success: false, message: 'Dropdown category not found' });
        }
        const tenant_id =
            req.body.tenant_id !== undefined || req.body.tenantId !== undefined
                ? req.body.tenant_id ?? req.body.tenantId
                : row.tenant_id;
        if (req.body.category !== undefined) {
            const category = String(req.body.category).trim();
            if (!(await assertDropdownCategoryUnique(tenant_id, category, row.id))) {
                await trx.rollback();
                return res.status(409).json({ success: false, message: 'Dropdown category already exists' });
            }
            row.category = category;
        }
        if (req.body.description !== undefined) {
            row.description = String(req.body.description ?? '').trim() || null;
        }
        if (req.body.tenant_id !== undefined || req.body.tenantId !== undefined) {
            row.tenant_id = tenant_id;
        }
        await row.save({ transaction: trx });

        if (Array.isArray(req.body.options)) {
            const cleaned = req.body.options.map((o) => String(o).trim()).filter(Boolean);
            if (cleaned.length === 0) {
                await trx.rollback();
                return res.status(400).json({ success: false, message: 'At least one option is required' });
            }
            await DropdownOptionValue.destroy({ where: { category_id: row.id }, transaction: trx });
            await DropdownOptionValue.bulkCreate(
                cleaned.map((option_value, idx) => ({
                    category_id: row.id,
                    option_value,
                    sort_order: idx
                })),
                { transaction: trx }
            );
        }
        await trx.commit();
        const withVals = await DropdownOptionCategory.findByPk(row.id, {
            include: [
                {
                    model: DropdownOptionValue,
                    as: 'option_values',
                    where: { deleted_at: null },
                    required: false
                }
            ]
        });
        return res.json({
            success: true,
            message: 'Dropdown category updated',
            data: formatDropdownCategory(withVals, withVals.option_values)
        });
    } catch (error) {
        await trx.rollback();
        console.error('settings updateDropdownCategory', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.deleteDropdownCategory = async (req, res) => {
    const trx = await sequelize.transaction();
    try {
        const row = await DropdownOptionCategory.findOne({
            where: { id: req.params.id, deleted_at: null },
            transaction: trx
        });
        if (!row) {
            await trx.rollback();
            return res.status(404).json({ success: false, message: 'Dropdown category not found' });
        }
        await DropdownOptionValue.destroy({ where: { category_id: row.id }, transaction: trx });
        await row.update({ deleted_at: new Date() }, { transaction: trx });
        await trx.commit();
        return res.json({ success: true, message: 'Dropdown category deleted' });
    } catch (error) {
        await trx.rollback();
        console.error('settings deleteDropdownCategory', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
