// Minimal migration runner: applies migrations/*.sql in filename order, once each.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from '../src/db.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const pool = createPool();
const client = await pool.connect();

try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const applied = new Set(
        (await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
    );
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
        if (applied.has(file)) continue;
        const sql = await fs.readFile(path.join(dir, file), 'utf8');
        await client.query('BEGIN'); // each migration is all-or-nothing
        try {
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`Applied ${file}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
    }
    console.log('Migrations up to date.');
} finally {
    client.release();
    await pool.end();
}