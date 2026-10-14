import { Request, Response } from 'express';
import { pool } from '../db/pool.js';

export async function sincronizarRelevamiento(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();
  try {
    const payload = req.body;

    // Validación básica de estructura
    const relevamiento = payload.relevamiento || payload;
    const institucion = payload.institucion || {};

    const escuelaId = institucion.escuelaId || relevamiento.escuelaId;
    const cue = institucion.cue || '000000000';
    const uuid = relevamiento.uuid || `rel-${escuelaId}-${Date.now()}`;
    const tecnico = relevamiento.tecnico || relevamiento.tecnicoNombre || 'Técnico FoDeMEEP';
    const fecha = relevamiento.fechaRelevamiento || relevamiento.fecha || new Date().toISOString().split('T')[0];
    const hash = relevamiento.hashIntegridad || null;
    const respuestas = relevamiento.respuestas || {};
    const geo = relevamiento.geolocalizacion || null;

    if (!escuelaId) {
      res.status(400).json({
        error: 'El campo escuelaId es obligatorio para procesar la sincronización.',
      });
      return;
    }

    await client.query('BEGIN');

    // 1. Upsert en la tabla relevamientos
    const queryRelevamiento = `
      INSERT INTO relevamientos (
        id, escuela_id, cue, tecnico_nombre, fecha_relevamiento,
        hash_integridad, geolocalizacion, estado_auditoria, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        tecnico_nombre = EXCLUDED.tecnico_nombre,
        hash_integridad = EXCLUDED.hash_integridad,
        geolocalizacion = EXCLUDED.geolocalizacion,
        estado_auditoria = 'SINCRONIZADO',
        updated_at = NOW()
      RETURNING id, estado_auditoria, created_at;
    `;

    await client.query(queryRelevamiento, [
      uuid,
      escuelaId,
      cue,
      tecnico,
      fecha,
      hash,
      geo ? JSON.stringify(geo) : null,
      'SINCRONIZADO',
    ]);

    // 2. Insertar respuestas normalizadas
    const entriesRespuestas = Object.entries(respuestas);
    if (entriesRespuestas.length > 0) {
      // Eliminar respuestas anteriores para idempotencia en reintentos
      await client.query('DELETE FROM respuestas_relevamiento WHERE relevamiento_id = $1', [uuid]);

      for (const [preguntaIdStr, valor] of entriesRespuestas) {
        const pId = parseInt(preguntaIdStr, 10);
        const valorTexto = typeof valor === 'string' ? valor : null;
        const valorNumero = typeof valor === 'number' ? valor : null;
        const valorArray = Array.isArray(valor) ? JSON.stringify(valor) : null;

        await client.query(
          `INSERT INTO respuestas_relevamiento (
            relevamiento_id, pregunta_id, valor_texto, valor_numero, valor_json
          ) VALUES ($1, $2, $3, $4, $5)`,
          [uuid, pId, valorTexto, valorNumero, valorArray]
        );
      }
    }

    // 3. Registrar evidencias fotográficas si vienen en el payload
    const evidencias = relevamiento.evidencias || relevamiento.fotos || [];
    for (const ev of evidencias) {
      await client.query(
        `INSERT INTO evidencias_fotograficas (
          id, relevamiento_id, seccion_id, storage_url, timestamp_captura
        ) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5 / 1000.0))
        ON CONFLICT (id) DO NOTHING`,
        [
          ev.id,
          uuid,
          ev.seccionId || 1,
          ev.storageUrl || 'local_device_blob',
          ev.timestamp || Date.now(),
        ]
      );
    }

    // 4. Registro en la pista de auditoría
    await client.query(
      `INSERT INTO auditoria_estados (
        relevamiento_id, estado_anterior, estado_nuevo, operado_por
      ) VALUES ($1, $2, $3, $4)`,
      [uuid, 'BORRADOR_LOCAL', 'SINCRONIZADO', tecnico]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      mensaje: 'Relevamiento sincronizado y registrado exitosamente en la base relacional FoDeMEEP.',
      uuid,
      escuelaId,
      totalRespuestas: entriesRespuestas.length,
      totalFotos: evidencias.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error durante la sincronización relacional:', error);
    res.status(500).json({
      error: 'Error interno al persistir la transacción relacional.',
      detalle: error.message,
    });
  } finally {
    client.release();
  }
}
