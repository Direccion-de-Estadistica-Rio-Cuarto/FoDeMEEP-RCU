import { Request, Response } from 'express';
import { pool } from '../db/pool.js';
import crypto from 'node:crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUuid(val?: string | null): string {
  if (val && UUID_REGEX.test(val)) {
    return val;
  }
  return crypto.randomUUID();
}

export async function sincronizarRelevamiento(req: Request, res: Response): Promise<void> {
  let client;
  try {
    client = await pool.connect();
  } catch (dbErr: any) {
    console.warn('PostgreSQL no disponible en este momento:', dbErr.message);
    res.status(503).json({
      success: false,
      modo: 'OFFLINE_PERSISTIDO_LOCAL',
      error: 'Base de datos temporalmente no disponible. El relevamiento se preserva en la cola local de IndexedDB.',
      detalle: dbErr.message,
    });
    return;
  }

  try {
    const payload = req.body;

    const relevamiento = payload.relevamiento || payload;
    const institucion = payload.institucion || {};

    const escuelaId = institucion.escuelaId || relevamiento.escuelaId;
    const cue = institucion.cue || '000000000';
    const uuid = toValidUuid(relevamiento.uuid);
    const tecnico = relevamiento.tecnico || relevamiento.tecnicoNombre || 'Técnico Relevador FoDeMEEP';
    const fecha = relevamiento.fechaRelevamiento || relevamiento.fecha || new Date().toISOString().split('T')[0];
    const hash = relevamiento.hashIntegridad || null;
    const respuestas = relevamiento.respuestas || {};
    const geo = relevamiento.geolocalizacion || null;
    const evidencias = relevamiento.evidencias || relevamiento.fotos || [];

    if (!escuelaId) {
      res.status(400).json({
        error: 'El campo escuelaId es obligatorio para procesar la sincronización.',
      });
      return;
    }

    await client.query('BEGIN');

    // 1. Asegurar que la institución exista en instituciones_educativas
    const checkEscuela = await client.query('SELECT id FROM instituciones_educativas WHERE id = $1', [escuelaId]);
    if (checkEscuela.rowCount === 0) {
      await client.query(
        `INSERT INTO instituciones_educativas (
          id, cue, nombre, nivel, sector, ambito, domicilio, localidad, departamento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING`,
        [
          escuelaId,
          cue,
          institucion.nombre || `Establecimiento ${cue}`,
          'Común',
          'PUBLICO',
          'URBANO',
          'Río Cuarto',
          'Río Cuarto',
          'Río Cuarto',
        ]
      );
    }

    // 2. Insertar / Actualizar en relevamientos
    const queryRelevamiento = `
      INSERT INTO relevamientos (
        id, institucion_id, fecha_relevamiento, estado,
        firma_inspector, sincronizado_offline, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        institucion_id = EXCLUDED.institucion_id,
        firma_inspector = EXCLUDED.firma_inspector,
        sincronizado_offline = TRUE,
        updated_at = NOW()
      RETURNING id, estado, created_at;
    `;

    await client.query(queryRelevamiento, [
      uuid,
      escuelaId,
      fecha,
      'CONSOLIDADO',
      tecnico,
      true,
    ]);

    // 3. Insertar respuestas del cuestionario
    const entriesRespuestas = Object.entries(respuestas);
    if (entriesRespuestas.length > 0) {
      await client.query('DELETE FROM respuestas_relevamiento WHERE relevamiento_id = $1', [uuid]);

      for (const [preguntaIdStr, valor] of entriesRespuestas) {
        const pId = parseInt(preguntaIdStr, 10);
        const seccionId = Math.min(14, Math.max(1, Math.ceil(pId / 12)));
        const valorTexto = typeof valor === 'string' ? valor : null;
        const valorNumero = typeof valor === 'number' ? valor : null;
        const valorArray = Array.isArray(valor) ? JSON.stringify(valor) : null;

        await client.query(
          `INSERT INTO respuestas_relevamiento (
            id, relevamiento_id, seccion_id, pregunta_id, valor_texto, valor_numero, valor_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (relevamiento_id, pregunta_id) DO UPDATE SET
            valor_texto = EXCLUDED.valor_texto,
            valor_numero = EXCLUDED.valor_numero,
            valor_json = EXCLUDED.valor_json`,
          [crypto.randomUUID(), uuid, seccionId, pId, valorTexto, valorNumero, valorArray]
        );
      }
    }

    // 4. Insertar evidencias fotográficas
    for (const ev of evidencias) {
      const fotoUuid = toValidUuid(ev.id);
      const urlAlmacenamiento = ev.dataUrl || ev.storageUrl || 'foto_capturada';
      const pesoBytes = ev.tamanoAproxBytes || (typeof ev.dataUrl === 'string' ? ev.dataUrl.length : 0);

      await client.query(
        `INSERT INTO evidencias_fotograficas (
          id, relevamiento_id, seccion_id, pregunta_id, url_almacenamiento, peso_bytes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING`,
        [
          fotoUuid,
          uuid,
          ev.seccionId || 1,
          ev.preguntaId || 1,
          urlAlmacenamiento,
          pesoBytes,
        ]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      mensaje: 'Relevamiento y evidencias fotográficas persistidos exitosamente en PostgreSQL.',
      uuid,
      escuelaId,
      totalRespuestas: entriesRespuestas.length,
      totalFotos: evidencias.length,
      hashIntegridad: hash,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error durante la transacción relacional:', error);
    res.status(500).json({
      error: 'Error interno al persistir el relevamiento en la base de datos.',
      detalle: error.message,
    });
  } finally {
    client.release();
  }
}
