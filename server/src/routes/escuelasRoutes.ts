import { Router } from 'express';
import { listarEscuelas, obtenerEscuelaPorId } from '../controllers/escuelasController.js';

export const escuelasRouter = Router();

escuelasRouter.get('/escuelas', listarEscuelas);
escuelasRouter.get('/escuelas/:id', obtenerEscuelaPorId);
