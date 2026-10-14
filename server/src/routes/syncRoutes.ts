import { Router } from 'express';
import { sincronizarRelevamiento } from '../controllers/syncController.js';

export const syncRouter = Router();

// Endpoint invocado por el PWA Offline-First
syncRouter.post('/sync', sincronizarRelevamiento);
