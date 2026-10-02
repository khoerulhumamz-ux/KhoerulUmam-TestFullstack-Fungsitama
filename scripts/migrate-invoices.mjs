import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env before running this migration.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const migration = await readFile(
    new URL('../drizzle/0001_create_invoices.sql', import.meta.url),
    'utf8'
  );
  await pool.query(migration);
  console.log('Invoice tables are ready.');
} catch (error) {
  console.error('Could not create invoice tables. Check DATABASE_URL and PostgreSQL access.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}