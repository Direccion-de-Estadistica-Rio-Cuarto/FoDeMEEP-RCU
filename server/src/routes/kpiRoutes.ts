import { Router } from 'express';
import { obtenerKpis } from '../controllers/kpiController.js';

export const kpiRouter = Router();

kpiRouter.get('/kpis', obtenerKpis);
