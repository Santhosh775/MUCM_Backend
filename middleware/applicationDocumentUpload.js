const fs = require('fs');
const path = require('path');
const multer = require('multer');

/**
 * Portal Step 6 field names (applicationSteps.js) → Sequelize attribute on Document model.
 * Limits match the live UI (PDF/JPEG/PNG, 5 MB / 10 MB caps).
 */
const DOCUMENT_UPLOAD_FIELDS = {
    passport: {
        attribute: 'passport',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    },
    bankStatement: {
        attribute: 'bank_statement',
        maxBytes: 10 * 1024 * 1024,
        extensions: ['.pdf']
    },
    preMedTranscript: {
        attribute: 'premedical_Bachelor_ug_HSC_Certificate',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    },
    grade11Transcript: {
        attribute: 'Secondary_11grade',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    },
    otherProfessionalTranscripts: {
        attribute: 'other_professional_transcripts',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    },
    sponsorSignedFinancialForm: {
        attribute: 'sponsor_signed_financial_form',
        maxBytes: 10 * 1024 * 1024,
        extensions: ['.pdf']
    },
    cv: {
        attribute: 'cv_resume',
        maxBytes: 10 * 1024 * 1024,
        extensions: ['.pdf', '.doc', '.docx']
    },
    examResults: {
        attribute: 'exam_results_marksheet',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    },
    passportPhoto: {
        attribute: 'passport_photo',
        maxBytes: 5 * 1024 * 1024,
        extensions: ['.jpg', '.jpeg', '.png']
    }
};

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

/**
 * Multer middleware: expects multipart field name `file` and query `documentType`
 * (one of DOCUMENT_UPLOAD_FIELDS keys). Enforces per-type size and extension.
 */
function applicationDocumentUpload(req, res, next) {
    const documentType = req.query.documentType;
    const field = DOCUMENT_UPLOAD_FIELDS[documentType];
    if (!field) {
        const allowed = Object.keys(DOCUMENT_UPLOAD_FIELDS).join(', ');
        return res.status(400).json({
            success: false,
            message: `Invalid or missing documentType query param. Allowed: ${allowed}`
        });
    }

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            const dir = path.join(UPLOAD_ROOT, 'applications', req.params.id);
            ensureDir(dir);
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase();
            const safeExt = field.extensions.includes(ext) ? ext : '';
            const base = `${documentType}-${Date.now()}${safeExt}`;
            cb(null, base);
        }
    });

    const upload = multer({
        storage,
        limits: { fileSize: field.maxBytes },
        fileFilter: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase();
            if (!field.extensions.includes(ext)) {
                return cb(
                    new Error(`Invalid file type for ${documentType}. Allowed: ${field.extensions.join(', ')}`)
                );
            }
            cb(null, true);
        }
    }).single('file');

    upload(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                const mb = field.maxBytes / (1024 * 1024);
                return res.status(413).json({
                    success: false,
                    message: `File exceeds maximum size for ${documentType} (${mb} MB)`
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }
        req.documentUploadMeta = { documentType, field };
        next();
    });
}

module.exports = {
    DOCUMENT_UPLOAD_FIELDS,
    applicationDocumentUpload,
    UPLOAD_ROOT
};
