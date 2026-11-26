// In-memory implementations used by unit tests (no database needed).
import { randomUUID } from 'node:crypto';
import { CategoryRepository } from './CategoryRepository.js';
import { ItemRepository } from './ItemRepository.js';

export class InMemoryCategoryRepository extends CategoryRepository {
  constructor(categories = []) {
    super();
    this.categories = categories;
  }
  async list() {
    return [...this.categories];
  }
  async findById(id) {
    return this.categories.find((c) => c.id === id) ?? null;
  }
}

export class InMemoryItemRepository extends ItemRepository {
  constructor(categoryRepo) {
    super();
    this.categoryRepo = categoryRepo;
    this.rows = [];
  }

  async #toItem(row) {
    const category = row.categoryId ? await this.categoryRepo.findById(row.categoryId) : null;
    return {
      id: row.id,
      name: row.name,
      size: row.size ?? null,
      priceCents: row.priceCents,
      currency: 'ZAR',
      category: category ? { id: category.id, name: category.name } : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async list(listId, { categoryId = null } = {}) {
    const rows = this.rows
      .filter((r) => r.listId === listId && (!categoryId || r.categoryId === categoryId))
      .reverse(); // newest first
    return Promise.all(rows.map((r) => this.#toItem(r)));
  }

  async findById(listId, id) {
    const row = this.rows.find((r) => r.listId === listId && r.id === id);
    return row ? this.#toItem(row) : null;
  }

  async create(listId, { name, size, priceCents, categoryId }) {
    const now = new Date();
    const row = { id: randomUUID(), listId, name, size, priceCents, categoryId, createdAt: now, updatedAt: now };
    this.rows.push(row);
    return this.#toItem(row);
  }

  async update(listId, id, { name, size, priceCents, categoryId }) {
    const row = this.rows.find((r) => r.listId === listId && r.id === id);
    if (!row) return null;
    Object.assign(row, { name, size, priceCents, categoryId, updatedAt: new Date() });
    return this.#toItem(row);
  }

  async delete(listId, id) {
    const index = this.rows.findIndex((r) => r.listId === listId && r.id === id);
    if (index === -1) return false;
    this.rows.splice(index, 1);
    return true;
  }
}