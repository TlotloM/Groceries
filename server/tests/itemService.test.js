import { beforeEach, describe, expect, it } from 'vitest';
import {
    InMemoryCategoryRepository,
    InMemoryItemRepository,
} from '../src/repositories/InMemoryRepositories.js';
import { createItemService, groupByCategory } from '../src/services/itemService.js';

const DAIRY = { id: '11111111-1111-4111-8111-111111111111', name: 'Dairy & Eggs' };
const PANTRY = { id: '22222222-2222-4222-8222-222222222222', name: 'Pantry' };
const UNKNOWN_ID = '99999999-9999-4999-8999-999999999999';
const ctxA = { listId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
const ctxB = { listId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' };

let service;
beforeEach(() => {
    const categoryRepo = new InMemoryCategoryRepository([DAIRY, PANTRY]);
    const itemRepo = new InMemoryItemRepository(categoryRepo);
    service = createItemService({ itemRepo, categoryRepo });
});

describe('create', () => {
    it('trims the name and converts price to cents', async () => {
        const item = await service.create(ctxA, { name: '  Milk  ', price: '24,99', categoryId: DAIRY.id });
        expect(item).toMatchObject({ name: 'Milk', priceCents: 2499, category: DAIRY });
    });

    it('allows no category', async () => {
        const item = await service.create(ctxA, { name: 'Milk', price: '10', categoryId: null });
        expect(item.category).toBeNull();
    });

    it('rejects an empty name and reports it per field', async () => {
        await expect(service.create(ctxA, { name: '  ', price: '1' })).rejects.toMatchObject({
            code: 'VALIDATION_ERROR',
            fields: { name: expect.any(String) },
        });
    });

    it('rejects a name longer than 100 characters', async () => {
        await expect(service.create(ctxA, { name: 'x'.repeat(101), price: '1' })).rejects.toMatchObject({
            fields: { name: expect.any(String) },
        });
    });

    it('rejects a bad price', async () => {
        await expect(service.create(ctxA, { name: 'Milk', price: '-5' })).rejects.toMatchObject({
            fields: { price: expect.any(String) },
        });
    });

    it('rejects an unknown or malformed categoryId', async () => {
        await expect(service.create(ctxA, { name: 'Milk', price: '1', categoryId: UNKNOWN_ID })).rejects.toMatchObject({
            fields: { categoryId: expect.any(String) },
        });
        await expect(service.create(ctxA, { name: 'Milk', price: '1', categoryId: 'nope' })).rejects.toMatchObject({
            fields: { categoryId: expect.any(String) },
        });
    });

    it('reports several field errors at once', async () => {
        await expect(service.create(ctxA, { name: '', price: 'abc' })).rejects.toMatchObject({
            fields: { name: expect.any(String), price: expect.any(String) },
        });
    });
});

describe('update and delete', () => {
    it('updates an item', async () => {
        const item = await service.create(ctxA, { name: 'Milk', price: '10' });
        const updated = await service.update(ctxA, item.id, { name: 'Full cream milk', price: '12.50', categoryId: DAIRY.id });
        expect(updated).toMatchObject({ name: 'Full cream milk', priceCents: 1250, category: DAIRY });
    });

    it('returns NOT_FOUND for unknown or malformed ids', async () => {
        await expect(service.update(ctxA, UNKNOWN_ID, { name: 'x', price: '1' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
        await expect(service.remove(ctxA, 'not-a-uuid')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('deletes an item', async () => {
        const item = await service.create(ctxA, { name: 'Milk', price: '10' });
        await service.remove(ctxA, item.id);
        expect((await service.list(ctxA)).items).toHaveLength(0);
    });
});

describe('list, totals and filtering', () => {
    it('returns a zero total for an empty list', async () => {
        expect(await service.list(ctxA)).toMatchObject({ items: [], totalCents: 0, subtotals: [] });
    });

    it('totals prices to the exact cent', async () => {
        await service.create(ctxA, { name: 'A', price: '0.10' });
        await service.create(ctxA, { name: 'B', price: '0.20' });
        await service.create(ctxA, { name: 'C', price: '0.01' });
        expect((await service.list(ctxA)).totalCents).toBe(31);
    });

    it('filters by category and totals only the filtered items', async () => {
        await service.create(ctxA, { name: 'Milk', price: '20', categoryId: DAIRY.id });
        await service.create(ctxA, { name: 'Rice', price: '30', categoryId: PANTRY.id });
        const result = await service.list(ctxA, { categoryId: DAIRY.id });
        expect(result.items.map((i) => i.name)).toEqual(['Milk']);
        expect(result.totalCents).toBe(2000);
    });

    it('subtotals add up to the grand total, with an Uncategorised bucket', async () => {
        await service.create(ctxA, { name: 'Milk', price: '20', categoryId: DAIRY.id });
        await service.create(ctxA, { name: 'Eggs', price: '40', categoryId: DAIRY.id });
        await service.create(ctxA, { name: 'Mystery', price: '5' });
        const { totalCents, subtotals } = await service.list(ctxA);
        expect(subtotals.reduce((s, g) => s + g.totalCents, 0)).toBe(totalCents);
        expect(subtotals.find((g) => g.categoryId === null)).toMatchObject({ name: 'Uncategorised', totalCents: 500 });
    });

    it('groupByCategory handles an empty array', () => {
        expect(groupByCategory([])).toEqual([]);
    });
});

describe('ownership scoping', () => {
    it("never exposes or modifies another list's items", async () => {
        const item = await service.create(ctxA, { name: 'Milk', price: '10' });

        expect((await service.list(ctxB)).items).toHaveLength(0);
        await expect(service.update(ctxB, item.id, { name: 'Hacked', price: '1' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
        await expect(service.remove(ctxB, item.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });

        const [stillThere] = (await service.list(ctxA)).items;
        expect(stillThere.name).toBe('Milk');
    });
});

describe('size', () => {
    it('trims the size and keeps it', async () => {
        const item = await service.create(ctxA, { name: 'Rice', size: '  10kg ', price: '120' });
        expect(item.size).toBe('10kg');
    });

    it('stores an empty or missing size as null', async () => {
        const a = await service.create(ctxA, { name: 'Rice', size: '   ', price: '1' });
        const b = await service.create(ctxA, { name: 'Rice', price: '1' });
        expect(a.size).toBeNull();
        expect(b.size).toBeNull();
    });

    it('rejects a size longer than 30 characters', async () => {
        await expect(
            service.create(ctxA, { name: 'Rice', size: 'x'.repeat(31), price: '1' }),
        ).rejects.toMatchObject({ fields: { size: expect.any(String) } });
    });

    it('updates the size', async () => {
        const item = await service.create(ctxA, { name: 'Rice', size: '5kg', price: '60' });
        const updated = await service.update(ctxA, item.id, { name: 'Rice', size: '10kg', price: '110' });
        expect(updated.size).toBe('10kg');
    });
});