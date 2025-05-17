// config/db.js (CommonJS version)

const dotenv = require("dotenv");
const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const schema = require("../db/schema");

dotenv.config();

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });

const db = drizzle(client, { schema });

module.exports = { db };
