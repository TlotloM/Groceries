import { ValidationError } from '../errors.js';

export const MAX_PRICE_CENTS = 100_000_000; // R 1,000,000.00

/**
 * Parse user input ("12.5", "12,50", 12.99) into integer cents.
 * Works on the string, never on float maths, so there are no rounding errors.
 */
export function parsePriceToCents(input) {
    if (typeof input === 'number') {
        if (!Number.isFinite(input)) throw new ValidationError('Enter a valid price.');
        input = String(input);
    }
    if (typeof input !== 'string') throw new ValidationError('Enter a price.');

    const text = input.trim().replace(',', '.'); // allow South African decimal comma
    if (text === '') throw new ValidationError('Enter a price.');
    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
        throw new ValidationError('Use a number like 12.99 (at most 2 decimals, no negatives).');
    }

    const [rand, decimals = ''] = text.split('.');
    const cents = Number(rand) * 100 + Number(decimals.padEnd(2, '0'));
    if (cents > MAX_PRICE_CENTS) {
        throw new ValidationError('Price cannot exceed R 1 000 000.');
    }
    return cents;
}

/** 123456 -> "R 1 234.56" */
export function formatCents(cents) {
    const rand = Math.floor(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const rest = String(cents % 100).padStart(2, '0');
    return `R ${rand}.${rest}`;
}

export const sumCents = (items) => items.reduce((sum, item) => sum + item.priceCents, 0);