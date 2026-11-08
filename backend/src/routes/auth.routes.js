import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected route
router.get('/me', requireAuth, me);

export default router;