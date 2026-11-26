// Idempotent: safe to run on every deploy.
import { createPool } from '../src/db.js';
import { categories } from '../src/seeds/categories.js';

const pool = createPool();
try {
    for (const [index, name] of categories.entries()) {
        await pool.query(
            `INSERT INTO categories (name, sort_order) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
            [name, index],
        );
    }
    console.log(`Seeded ${categories.length} categories.`);
} finally {
    await pool.end();
}