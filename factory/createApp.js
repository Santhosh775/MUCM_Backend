const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { registerRoutes } = require('../router/registerRoutes');

/**
 * Attaches Express middleware and routes to an existing app instance.
 * CORS is applied in `app.js` before this runs.
 */
function mountApp(app) {
    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' }
        })
    );

    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.disable('x-powered-by');

    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
