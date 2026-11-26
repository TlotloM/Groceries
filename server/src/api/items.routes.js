import { Router } from 'express';
import { asyncHandler } from './middleware/asyncHandler.js';

export function itemsRouter(itemService) {
    const router = Router();

    router.get('/', asyncHandler(async (req, res) => {
        res.json(await itemService.list(req.ctx, { categoryId: req.query.categoryId }));
    }));

    router.post('/', asyncHandler(async (req, res) => {
        res.status(201).json(await itemService.create(req.ctx, req.body));
    }));

    router.put('/:id', asyncHandler(async (req, res) => {
        res.json(await itemService.update(req.ctx, req.params.id, req.body));
    }));

    router.delete('/:id', asyncHandler(async (req, res) => {
        await itemService.remove(req.ctx, req.params.id);
        res.status(204).end();
    }));

    return router;
}