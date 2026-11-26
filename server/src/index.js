// Composition root: the only place that knows which implementations are used.
import { createApp } from './app.js';
import { config } from './config.js';
import { createPool } from './db.js';
import { PostgresCategoryRepository } from './repositories/PostgresCategoryRepository.js';
import { PostgresItemRepository } from './repositories/PostgresItemRepository.js';
import { createItemService } from './services/itemService.js';

const pool = createPool();
const categoryRepo = new PostgresCategoryRepository(pool);
const itemRepo = new PostgresItemRepository(pool);
const itemService = createItemService({ itemRepo, categoryRepo });

const app = createApp({ itemService, categoryRepo, config });
app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));