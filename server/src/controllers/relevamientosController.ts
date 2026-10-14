import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export async function listarRelevamientos(req: Request, res: Response): Promise<void> {
  try {
    const { estado, fechaDesde, fechaHasta } = req.query;
    let sql = `
      SELECT r.id, r.escuela_id, r.cue, r.tecnico_nombre, r.fecha_relevamiento,
             r.estado_auditoria, r.hash_integridad, r.created_at, r.updated_at,
             i.nombre AS escuela_nombre, i.nivel, i.ambito
      FROM relevamientos r
      LEFT JOIN instituciones i ON r.escuela_id = i.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (estado) {
      params.push(estado);
      sql += ` AND r.estado_auditoria = $${params.length}`;
    }

    if (fechaDesde) {
      params.push(fechaDesde);
      sql += ` AND r.fecha_relevamiento >= $${params.length}`;
    }

    if (fechaHasta) {
      params.push(fechaHasta);
      sql += ` AND r.fecha_relevamiento <= $${params.length}`;
    }

    sql += ' ORDER BY r.fecha_relevamiento DESC, r.created_at DESC';

    const result = await query(sql, params);
    res.json({
      total: result.rowCount,
      relevamientos: result.rows,
    });
  } catch (error: any) {
    console.error('Error al listar relevamientos:', error);
    res.status(500).json({ error: 'Error al consultar relevamientos.' });
  }
}

export async function obtenerRelevamientoDetalle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const cabecera = await query(
      `SELECT r.*, i.nombre AS escuela_nombre, i.direccion, i.barrio, i.nivel, i.ambito, i.director
       FROM relevamientos r
       LEFT JOIN instituciones i ON r.escuela_id = i.id
       WHERE r.id = $1`,
      [id]
    );

    if (cabecera.rowCount === 0) {
      res.status(404).json({ error: 'Expediente de relevamiento no encontrado.' });
      return;
    }

    const respuestas = await query(
      'SELECT pregunta_id, valor_texto, valor_numero, valor_json FROM respuestas_relevamiento WHERE relevamiento_id = $1 ORDER BY pregunta_id ASC',
      [id]
    );

    const evidencias = await query(
      'SELECT id, seccion_id, storage_url, timestamp_captura FROM evidencias_fotograficas WHERE relevamiento_id = $1',
      [id]
    );

    const incidencias = await query(
      'SELECT id, tipo_incidencia, descripcion, criticidad, jurisdiccion_resolucion, estado_incidencia FROM incidencias_detectadas WHERE relevamiento_id = $1',
      [id]
    );

    const auditoria = await query(
      'SELECT id, estado_anterior, estado_nuevo, operado_por, timestamp_cambio FROM auditoria_estados WHERE relevamiento_id = $1 ORDER BY timestamp_cambio ASC',
      [id]
    );

    res.json({
      expediente: cabecera.rows[0],
      respuestas: respuestas.rows,
      evidencias: evidencias.rows,
      incidencias: incidencias.rows,
      trazabilidadAuditoria: auditoria.rows,
    });
  } catch (error: any) {
    console.error('Error al obtener detalle del relevamiento:', error);
    res.status(500).json({ error: 'Error al obtener el detalle del expediente.' });
  }
}
