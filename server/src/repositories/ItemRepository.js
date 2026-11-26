/**
 * Contract for item storage. The service depends only on this shape, so Postgres
 * can be swapped for anything else. Every method is scoped by listId.
 *
 * Item shape:
 * { id, name, priceCents, currency, category: {id, name} | null, createdAt, updatedAt }
 */
export class ItemRepository {
  /** @returns {Promise<Item[]>} newest first; optional { categoryId } filter */
  async list(listId, { categoryId } = {}) { throw new Error('Not implemented'); }
  /** @returns {Promise<Item|null>} */
  async findById(listId, id) { throw new Error('Not implemented'); }
  /** @param {{name:string, priceCents:number, categoryId:string|null}} data @returns {Promise<Item>} */
  async create(listId, data) { throw new Error('Not implemented'); }
  /** @returns {Promise<Item|null>} null if no such item in this list */
  async update(listId, id, data) { throw new Error('Not implemented'); }
  /** @returns {Promise<boolean>} true if a row was deleted */
  async delete(listId, id) { throw new Error('Not implemented'); }
}