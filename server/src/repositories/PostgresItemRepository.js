import { ItemRepository } from './ItemRepository.js';

const BASE_SELECT = `
  SELECT i.id, i.name, i.size, i.price_cents, i.currency, i.created_at, i.updated_at,
         c.id AS category_id, c.name AS category_name
  FROM items i
  LEFT JOIN categories c ON c.id = i.category_id`;

const toItem = (row) => ({
    id: row.id,
    name: row.name,
    size: row.size,
    priceCents: row.price_cents,
    currency: row.currency,
    category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export class PostgresItemRepository extends ItemRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async list(listId, { categoryId = null } = {}) {
        const params = [listId];
        let where = 'i.list_id = $1';
        if (categoryId) {
            params.push(categoryId);
            where += ` AND i.category_id = $${params.length}`;
        }
        const { rows } = await this.pool.query(
            `${BASE_SELECT} WHERE ${where} ORDER BY i.created_at DESC`,
            params,
        );
        return rows.map(toItem);
    }

    async findById(listId, id) {
        const { rows } = await this.pool.query(
            `${BASE_SELECT} WHERE i.list_id = $1 AND i.id = $2`,
            [listId, id],
        );
        return rows[0] ? toItem(rows[0]) : null;
    }

    async create(listId, { name, size, priceCents, categoryId }) {
        const { rows } = await this.pool.query(
            `INSERT INTO items (list_id, category_id, name, size, price_cents)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [listId, categoryId, name, size, priceCents],
        );
        return this.findById(listId, rows[0].id);
    }

    async update(listId, id, { name, size, priceCents, categoryId }) {
        const { rows } = await this.pool.query(
            `UPDATE items
       SET name = $3, size = $4, category_id = $5, price_cents = $6, updated_at = now()
       WHERE id = $1 AND list_id = $2
       RETURNING id`,
            [id, listId, name, size, categoryId, priceCents],
        );
        return rows[0] ? this.findById(listId, id) : null;
    }

    async delete(listId, id) {
        const result = await this.pool.query(
            'DELETE FROM items WHERE id = $1 AND list_id = $2',
            [id, listId],
        );
        return result.rowCount > 0;
    }
}