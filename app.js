const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { mountApp } = require('./factory/createApp');
const { connectDB, sequelize } = require('./config/db');
const { verifySmtpOnStartup } = require('./utils/mailTransport');
const { ensureSupportTicketSchema } = require('./utils/ensureSupportTicketSchema');
const { ensureEmailTemplateSchema } = require('./utils/ensureEmailTemplateSchema');
const { ensurePipelineStagesSettingsColumns } = require('./utils/ensurePipelineStagesSettingsColumns');

dotenv.config();

const app = express();

if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
}

function getCorsOriginConfig() {
    const origins = (process.env.CORS_ORIGIN || '*')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (origins.includes('*')) return '*';
    return origins;
}

app.use(
    cors({
        origin: getCorsOriginConfig(),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false
    })
);

mountApp(app);

const port = Number(process.env.SERVER_PORT) || 3000;

/**
 * In production, prefer SQL migrations (`npm run db:migrate`) and set
 * DB_SYNC_ON_START=false. Sync is convenient in development but is not a
 * long-term schema management strategy (BRD / ERP-style evolution).
 */
function shouldSyncDatabaseOnStart() {
    if (process.env.DB_SYNC_ON_START === 'true') return true;
    if (process.env.DB_SYNC_ON_START === 'false') return false;
    return process.env.NODE_ENV !== 'production';
}

async function start() {
    await connectDB();
    await ensureSupportTicketSchema();
    await ensureEmailTemplateSchema();
    await ensurePipelineStagesSettingsColumns();
    await verifySmtpOnStartup();
    if (shouldSyncDatabaseOnStart()) {
        await sequelize.sync({ alter: false });
        console.log('Database synced (Sequelize).');
    } else {
        console.log('Database sync skipped (DB_SYNC_ON_START=false or production).');
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

start().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
