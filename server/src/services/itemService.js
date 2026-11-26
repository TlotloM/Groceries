import { NotFoundError, ValidationError } from '../errors.js';
import { parsePriceToCents, sumCents } from './money.js';

export const NAME_MAX = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

export function validateName(value) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ValidationError('Enter an item name.');
    }
    const name = value.trim();
    if (name.length > NAME_MAX) {
        throw new ValidationError(`Name must be ${NAME_MAX} characters or fewer.`);
    }
    return name;
}

export const SIZE_MAX = 30;

/** Optional free-text size like "10kg". Empty or missing becomes null. */
export function validateSize(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ValidationError('Size must be text, like 10kg or 2L.');
  }
  const size = value.trim();
  if (size === '') return null;
  if (size.length > SIZE_MAX) {
    throw new ValidationError(`Size must be ${SIZE_MAX} characters or fewer.`);
  }
  return size;
}

/** Per-category subtotals. Items without a category fall under "Uncategorised". */
export function groupByCategory(items) {
    const groups = new Map();
    for (const item of items) {
        const key = item.category?.id ?? null;
        const group = groups.get(key) ?? {
            categoryId: key,
            name: item.category?.name ?? 'Uncategorised',
            count: 0,
            totalCents: 0,
        };
        group.count += 1;
        group.totalCents += item.priceCents;
        groups.set(key, group);
    }
    return [...groups.values()];
}

/**
 * Every method takes a `ctx` ({ listId }) as its first argument. That is the
 * ownership boundary: the repository only ever sees one list's data.
 */
export function createItemService({ itemRepo, categoryRepo }) {
    async function resolveCategoryId(value) {
        if (value === undefined || value === null || value === '') return null;
        if (!isUuid(value) || !(await categoryRepo.findById(value))) {
            throw new ValidationError('Please choose a valid category.');
        }
        return value;
    }

    /** Validates every field and reports all problems at once. */
    async function validateInput(input) {
        const src = input ?? {};
        const fields = {};
        const attempt = async (key, fn) => {
            try {
                return await fn();
            } catch (err) {
                if (err instanceof ValidationError) {
                    fields[key] = err.message;
                    return undefined;
                }
                throw err;
            }
        };

        const name = await attempt('name', () => validateName(src.name));
        const size = await attempt('size', () => validateSize(src.size));
        const priceCents = await attempt('price', () => parsePriceToCents(src.price));
        const categoryId = await attempt('categoryId', () => resolveCategoryId(src.categoryId));

        if (Object.keys(fields).length > 0) {
            throw new ValidationError('Please fix the highlighted fields.', fields);
        }
        return { name, size, priceCents, categoryId };
    }

    // A malformed id can never match a row, so report "not found" rather than a DB error.
    function assertItemId(id) {
        if (!isUuid(id)) throw new NotFoundError('Item not found.');
    }

    return {
        async list(ctx, { categoryId } = {}) {
            const filter = await resolveCategoryId(categoryId);
            const items = await itemRepo.list(ctx.listId, { categoryId: filter });
            return { items, totalCents: sumCents(items), subtotals: groupByCategory(items) };
        },

        async create(ctx, input) {
            const data = await validateInput(input);
            return itemRepo.create(ctx.listId, data);
        },

        async update(ctx, id, input) {
            assertItemId(id);
            const data = await validateInput(input);
            const updated = await itemRepo.update(ctx.listId, id, data);
            if (!updated) throw new NotFoundError('Item not found.');
            return updated;
        },

        async remove(ctx, id) {
            assertItemId(id);
            const deleted = await itemRepo.delete(ctx.listId, id);
            if (!deleted) throw new NotFoundError('Item not found.');
        },
    };
}