import { Router } from 'express';
import {
  listarRelevamientos,
  obtenerRelevamientoDetalle,
} from '../controllers/relevamientosController.js';

export const relevamientosRouter = Router();

relevamientosRouter.get('/relevamientos', listarRelevamientos);
relevamientosRouter.get('/relevamientos/:id', obtenerRelevamientoDetalle);
