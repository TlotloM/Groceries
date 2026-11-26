/** Read-only contract: categories are managed in code (see seeds/categories.js). */
export class CategoryRepository {
    /** @returns {Promise<{id:string, name:string}[]>} ordered by sort_order */
    async list() { throw new Error('Not implemented'); }
    /** @returns {Promise<{id:string, name:string}|null>} */
    async findById(id) { throw new Error('Not implemented'); }
}