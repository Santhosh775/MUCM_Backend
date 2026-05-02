const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { registerRoutes } = require('../router/registerRoutes');
const { ensureUploadDirs } = require('../utils/ensureUploadDirs');

const STEP7_TEMPLATE = 'mucm-step-7-sponsor-financial-declaration.pdf';

/**
 * Attaches Express middleware and routes to an existing app instance.
 * CORS is applied in `app.js` before this runs.
 */
function mountApp(app) {
    ensureUploadDirs();

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' }
        })
    );

    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.disable('x-powered-by');

    const uploadsRoot = path.join(__dirname, '..', 'uploads');

    /** Legacy/wrong URL — template files live under uploads/forms (served at /forms/...) */
    app.get(`/uploads/${STEP7_TEMPLATE}`, (_req, res) => {
        res.redirect(301, `/forms/${STEP7_TEMPLATE}`);
    });

    app.use('/uploads', express.static(uploadsRoot));
    /** Blank forms & static PDFs: place files in uploads/forms — exposed as /forms/filename.pdf */
    app.use('/forms', express.static(path.join(uploadsRoot, 'forms')));

    require('../model/associations');
    registerRoutes(app);

    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal server error'
        });
    });
}

module.exports = { mountApp };
