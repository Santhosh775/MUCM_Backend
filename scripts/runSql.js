/**
 * Runs sql/schema.sql against PostgreSQL (creates tables).
 * Usage: npm run db:migrate
 * Requires: DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT in .env
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    await client.connect();
    try {
        await client.query(sql);
        console.log('schema.sql applied successfully.');
    } finally {
        await client.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
