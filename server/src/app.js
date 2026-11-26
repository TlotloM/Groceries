import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { categoriesRouter } from './api/categories.routes.js';
import { itemsRouter } from './api/items.routes.js';
import { errorHandler, notFound } from './api/middleware/errorHandler.js';
import { requestContext } from './api/middleware/requestContext.js';

/** App factory: dependencies are passed in, so tests can supply fakes. */
export function createApp({ itemService, categoryRepo, config }) {
    const app = express();
    app.set('trust proxy', 1); // needed behind Render's proxy for correct client IPs
    app.use(helmet());
    app.use(cors({ origin: config.corsOrigins }));
    app.use(express.json({ limit: '10kb' }));
    app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

    app.use('/api', requestContext(config));
    app.use('/api/items', itemsRouter(itemService));
    app.use('/api/categories', categoriesRouter(categoryRepo));

    app.use('/api', notFound);
    app.use(errorHandler);
    return app;
}