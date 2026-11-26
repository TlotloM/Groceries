// Thin fetch wrapper. In production VITE_API_URL points at the Render API; in dev it's empty (Vite proxy).
const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
    constructor(message, { status, fields } = {}) {
        super(message);
        this.status = status;
        this.fields = fields ?? {};
    }
}

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(`${BASE}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
    } catch {
        throw new ApiError('Cannot reach the server. Check your connection and try again.');
    }
    if (res.status === 204) return null;

    let body = null;
    try {
        body = await res.json();
    } catch {
        /* non-JSON response; fall through to generic error */
    }
    if (!res.ok) {
        throw new ApiError(body?.error?.message ?? 'Something went wrong.', {
            status: res.status,
            fields: body?.error?.fields,
        });
    }
    return body;
}

export const api = {
    getCategories: () => request('/api/categories'),
    getItems: (categoryId) =>
        request(`/api/items${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}`),
    createItem: (data) => request('/api/items', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (id, data) => request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteItem: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
};