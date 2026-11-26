// Client-side mirror of the server's rules, for instant feedback. The server still re-validates.
export function formatCents(cents) {
    const rand = Math.floor(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `R ${rand}.${String(cents % 100).padStart(2, '0')}`;
}

/** Returns an error message, or null if the price is valid. */
export function validatePrice(input) {
    const text = String(input).trim().replace(',', '.');
    if (!text) return 'Enter a price.';
    if (!/^\d+(\.\d{1,2})?$/.test(text)) return 'Use a number like 12.99 (at most 2 decimals).';
    if (Number(text) > 1_000_000) return 'Price cannot exceed R 1 000 000.';
    return null;
}