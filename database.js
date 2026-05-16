import mysql from 'mysql2';

const databaseName = process.env.DB_NAME ?? process.env.DB;

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !databaseName) {
    throw new Error('Missing database environment variables');
}

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: databaseName
}).promise();

