import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { syncRouter } from './routes/syncRoutes.js';
import { escuelasRouter } from './routes/escuelasRoutes.js';
import { relevamientosRouter } from './routes/relevamientosRoutes.js';
import { kpiRouter } from './routes/kpiRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Seguridad y Cross-Origin
app.use(helmet());
app.use(cors({ origin: '*' }));

// Límite de carga incrementado para recepción de evidencias y lotes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas API v1
app.use('/api', healthRouter);
app.use('/api/v1', syncRouter);
app.use('/api/v1', escuelasRouter);
app.use('/api/v1', relevamientosRouter);
app.use('/api/v1', kpiRouter);

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    nombre: 'FoDeMEEP Backend API REST',
    descripcion: 'Infraestructura de recepción y persistencia de relevamientos escolares en Río Cuarto',
    documentacion: '/api/health',
    version: '1.0.0',
    entorno: process.env.NODE_ENV || 'development',
  });
});

// Manejador 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API FoDeMEEP.' });
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  FoDeMEEP Backend API - Dirección de Estadística`);
  console.log(`  Servidor activo en: http://localhost:${PORT}`);
  console.log(`  Health check:        http://localhost:${PORT}/api/health`);
  console.log(`  Endpoint Sync:       http://localhost:${PORT}/api/v1/sync`);
  console.log(`====================================================`);
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor HTTP...');
  server.close(() => console.log('Servidor finalizado limpiamente.'));
});

export default app;
