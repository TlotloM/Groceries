import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

/** All data fetching and mutations live here, so components stay presentational. */
export function useItems() {
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState('');
    const [data, setData] = useState({ items: [], totalCents: 0, subtotals: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async (categoryId) => {
        try {
            setError(null);
            setData(await api.getItems(categoryId));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        api.getCategories().then((r) => setCategories(r.categories)).catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        load(filter);
    }, [filter, load]);

    // add/update throw so the form can show field-level errors.
    const addItem = async (input) => {
        await api.createItem(input);
        await load(filter);
    };
    const updateItem = async (id, input) => {
        await api.updateItem(id, input);
        await load(filter);
    };
    const removeItem = async (id) => {
        try {
            await api.deleteItem(id);
            await load(filter);
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        ...data,
        categories,
        filter,
        setFilter,
        loading,
        error,
        dismissError: () => setError(null),
        addItem,
        updateItem,
        removeItem,
    };
}