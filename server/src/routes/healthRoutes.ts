import { Router } from 'express';
import { pool } from '../db/pool.js';

export const healthRouter = Router();

// Endpoint de verificación de salud y latencia
healthRouter.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const dbRes = await pool.query('SELECT 1 as alive');
    if (dbRes.rowCount && dbRes.rowCount > 0) {
      dbStatus = 'connected';
    }
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'ok',
    servicio: 'FoDeMEEP Backend API',
    municipalidad: 'Río Cuarto',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});
