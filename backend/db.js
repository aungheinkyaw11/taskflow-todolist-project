const { Pool } = require('pg');

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  process.env.PGSSLMODE === 'require';

const ssl = shouldUseSsl
  ? { rejectUnauthorized: false }
  : undefined;

module.exports = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl,
});
