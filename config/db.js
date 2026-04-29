const { Sequelize } = require('sequelize');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
        timestamps: false
    },
    pool: {
        max: 20,
        min: 2,
        acquire: 60000,
        idle: 30000
    }
});

async function connectDB() {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
}

module.exports = { connectDB, sequelize };
