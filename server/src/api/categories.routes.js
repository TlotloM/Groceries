import { Router } from 'express';
import { asyncHandler } from './middleware/asyncHandler.js';

// Read-only on purpose: categories are added in code (src/seeds/categories.js).
export function categoriesRouter(categoryRepo) {
    const router = Router();
    router.get('/', asyncHandler(async (req, res) => {
        res.json({ categories: await categoryRepo.list() });
    }));
    return router;
}