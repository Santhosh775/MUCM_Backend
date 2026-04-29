const { Faq, FaqCategory } = require('../model/associations');
const { sequelize } = require('../config/db');

let hasFaqCategoryIdColumnCache = null;

async function hasFaqCategoryIdColumn() {
    if (typeof hasFaqCategoryIdColumnCache === 'boolean') return hasFaqCategoryIdColumnCache;
    const table = await sequelize.getQueryInterface().describeTable('faqs');
    hasFaqCategoryIdColumnCache = Boolean(table.category_id);
    return hasFaqCategoryIdColumnCache;
}

async function resolveCategoryFromRequest(body = {}) {
    if (!body.category_id) return null;
    const category = await FaqCategory.findOne({
        where: { id: body.category_id, deleted_at: null }
    });
    return category || null;
}

exports.listPublished = async (req, res) => {
    try {
        const supportsCategoryId = await hasFaqCategoryIdColumn();
        const rows = await Faq.findAll({
            where: { deleted_at: null, is_published: true },
            include: supportsCategoryId
                ? [
                      {
                          model: FaqCategory,
                          as: 'faq_category',
                          required: false,
                          attributes: ['id', 'name', 'is_active']
                      }
                  ]
                : [],
            order: [
                ['sort_order', 'ASC'],
                ['created_at', 'ASC']
            ],
            attributes: supportsCategoryId
                ? ['id', 'category_id', 'category', 'question', 'answer', 'sort_order', 'created_at']
                : ['id', 'category', 'question', 'answer', 'sort_order', 'created_at']
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listPublished faq', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.listAll = async (req, res) => {
    try {
        const supportsCategoryId = await hasFaqCategoryIdColumn();
        const rows = await Faq.findAll({
            where: { deleted_at: null },
            include: supportsCategoryId
                ? [
                      {
                          model: FaqCategory,
                          as: 'faq_category',
                          required: false,
                          attributes: ['id', 'name', 'is_active']
                      }
                  ]
                : [],
            order: [
                ['sort_order', 'ASC'],
                ['created_at', 'DESC']
            ]
        });
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('listAll faq', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const supportsCategoryId = await hasFaqCategoryIdColumn();
        const categoryRef = await resolveCategoryFromRequest(req.body);
        if (req.body.category_id && !categoryRef) {
            return res.status(404).json({ success: false, message: 'FAQ category not found' });
        }
        const payload = {
            category: categoryRef?.name || req.body.category?.trim() || 'General',
            question: req.body.question.trim(),
            answer: req.body.answer.trim(),
            sort_order: req.body.sort_order != null ? Number(req.body.sort_order) : 0,
            is_published: req.body.is_published !== false
        };
        if (supportsCategoryId) payload.category_id = categoryRef?.id || null;
        const row = await Faq.create(payload);
        return res.status(201).json({ success: true, message: 'FAQ created', data: row });
    } catch (error) {
        console.error('create faq', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const supportsCategoryId = await hasFaqCategoryIdColumn();
        const row = await Faq.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'FAQ not found' });
        const categoryRef = await resolveCategoryFromRequest(req.body);
        if (req.body.category_id && !categoryRef) {
            return res.status(404).json({ success: false, message: 'FAQ category not found' });
        }

        const next = {};
        if (req.body.category_id !== undefined) {
            if (supportsCategoryId) next.category_id = categoryRef?.id || null;
            next.category = categoryRef?.name || 'General';
        }
        if (req.body.category !== undefined) next.category = String(req.body.category).trim() || 'General';
        if (req.body.question !== undefined) next.question = String(req.body.question).trim();
        if (req.body.answer !== undefined) next.answer = String(req.body.answer).trim();
        if (req.body.sort_order !== undefined) next.sort_order = Number(req.body.sort_order);
        if (req.body.is_published !== undefined) next.is_published = Boolean(req.body.is_published);

        await row.update(next);
        return res.json({ success: true, message: 'FAQ updated', data: row });
    } catch (error) {
        console.error('update faq', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.remove = async (req, res) => {
    try {
        const row = await Faq.findOne({
            where: { id: req.params.id, deleted_at: null }
        });
        if (!row) return res.status(404).json({ success: false, message: 'FAQ not found' });
        await row.update({ deleted_at: new Date() });
        return res.json({ success: true, message: 'FAQ deleted' });
    } catch (error) {
        console.error('remove faq', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
