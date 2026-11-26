import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/errors.js';
import { formatCents, parsePriceToCents, sumCents } from '../src/services/money.js';

describe('parsePriceToCents', () => {
    it.each([
        ['12.5', 1250],
        ['12,50', 1250],
        ['12', 1200],
        ['0', 0],
        ['0.99', 99],
        [' 7.05 ', 705],
        [12.99, 1299],
        ['1000000', 100_000_000],
    ])('parses %s', (input, expected) => {
        expect(parsePriceToCents(input)).toBe(expected);
    });

    it.each(['', '  ', 'abc', '-1', '12.345', '1e3', '1000000.01', 'R12', null, undefined, NaN])(
        'rejects %s',
        (input) => {
            expect(() => parsePriceToCents(input)).toThrow(ValidationError);
        },
    );
});

describe('formatCents', () => {
    it.each([
        [1299, 'R 12.99'],
        [0, 'R 0.00'],
        [5, 'R 0.05'],
        [100_000_000, 'R 1 000 000.00'],
    ])('formats %s', (cents, expected) => {
        expect(formatCents(cents)).toBe(expected);
    });
});

describe('sumCents', () => {
    it('returns 0 for an empty list', () => {
        expect(sumCents([])).toBe(0);
    });
    it('sums exactly with no float drift', () => {
        expect(sumCents([{ priceCents: 10 }, { priceCents: 20 }, { priceCents: 1 }])).toBe(31);
    });
});
