const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

async function ensureDocumentReviewSignatureColumn() {
    const qi = sequelize.getQueryInterface();
    let cols;
    try {
        cols = await qi.describeTable('Document');
    } catch {
        return;
    }

    if (!cols.review_signature_document) {
        await qi.addColumn('Document', 'review_signature_document', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        console.log('[schema] Added Document.review_signature_document');
    }
}

module.exports = { ensureDocumentReviewSignatureColumn };
