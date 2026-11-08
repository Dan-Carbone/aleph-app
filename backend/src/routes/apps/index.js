import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(requireAuth);

const entries = fs.readdirSync(__dirname, { withFileTypes: true });

for (const entry of entries) {
  if (entry.isDirectory()) {
    const appName = entry.name;
    const routePath = path.join(__dirname, appName, 'index.js');
    if (fs.existsSync(routePath)) {
      const module = await import(pathToFileURL(routePath).href);
      if (module.default) {
        router.use(`/${appName}`, module.default);
      }
    }
  }
}

export default router;
