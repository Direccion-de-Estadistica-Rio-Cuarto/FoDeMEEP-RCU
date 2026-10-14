import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export async function listarEscuelas(req: Request, res: Response): Promise<void> {
  try {
    const { nivel, ambito, busqueda } = req.query;
    let sql = 'SELECT * FROM instituciones WHERE sector = $1';
    const params: unknown[] = ['Público'];

    if (nivel) {
      params.push(nivel);
      sql += ` AND nivel = $${params.length}`;
    }

    if (ambito) {
      params.push(ambito);
      sql += ` AND ambito = $${params.length}`;
    }

    if (busqueda) {
      params.push(`%${busqueda}%`);
      sql += ` AND (nombre ILIKE $${params.length} OR cue ILIKE $${params.length})`;
    }

    sql += ' ORDER BY nombre ASC';

    const result = await query(sql, params);
    res.json({
      total: result.rowCount,
      escuelas: result.rows,
    });
  } catch (error: any) {
    console.error('Error al consultar escuelas:', error);
    res.status(500).json({ error: 'Error al consultar el catálogo de instituciones.' });
  }
}

export async function obtenerEscuelaPorId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM instituciones WHERE id = $1 OR cue = $1', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Institución educativa no encontrada.' });
      return;
    }

    // Relevamientos históricos asociados
    const relevamientos = await query(
      'SELECT id, fecha_relevamiento, tecnico_nombre, estado_auditoria FROM relevamientos WHERE escuela_id = $1 ORDER BY fecha_relevamiento DESC',
      [result.rows[0].id]
    );

    res.json({
      escuela: result.rows[0],
      historialRelevamientos: relevamientos.rows,
    });
  } catch (error: any) {
    console.error('Error al obtener escuela:', error);
    res.status(500).json({ error: 'Error al consultar la institución.' });
  }
}
