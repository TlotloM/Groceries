import { CategoryRepository } from './CategoryRepository.js';

export class PostgresCategoryRepository extends CategoryRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async list() {
        const { rows } = await this.pool.query(
            'SELECT id, name FROM categories ORDER BY sort_order, name',
        );
        return rows;
    }

    async findById(id) {
        const { rows } = await this.pool.query(
            'SELECT id, name FROM categories WHERE id = $1',
            [id],
        );
        return rows[0] ?? null;
    }
}