import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@database:5432/${process.env.POSTGRES_DB}`,
});

// Test connection on boot
pool.on('connect', () => {
  console.log('[PostgreSQL] Connected to database');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err);
  process.exit(-1);
});

// Dual export: supports both "import pool from ..." and "import { pool } from ..."
export { pool };
export default pool;