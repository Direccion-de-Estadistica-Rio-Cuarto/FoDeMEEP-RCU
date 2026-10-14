import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export async function obtenerKpis(req: Request, res: Response): Promise<void> {
  try {
    const totalEscuelas = await query(
      "SELECT count(*) as total, count(*) filter (where ambito = 'Urbano') as urbanas, count(*) filter (where ambito = 'Rural') as rurales FROM instituciones WHERE sector = 'Público'"
    );

    const totalRelevadas = await query(
      'SELECT count(DISTINCT escuela_id) as relevadas FROM relevamientos WHERE estado_auditoria = $1',
      ['SINCRONIZADO']
    );

    const incidenciasPorJurisdiccion = await query(
      `SELECT jurisdiccion_resolucion, count(*) as cantidad
       FROM incidencias_detectadas
       GROUP BY jurisdiccion_resolucion`
    );

    const ultimosRelevamientos = await query(
      `SELECT r.id, r.cue, i.nombre as escuela, r.fecha_relevamiento, r.tecnico_nombre
       FROM relevamientos r
       LEFT JOIN instituciones i ON r.escuela_id = i.id
       ORDER BY r.fecha_relevamiento DESC LIMIT 5`
    );

    res.json({
      resumenPadrón: totalEscuelas.rows[0],
      progresoCobertura: {
        totalPublicas: parseInt(totalEscuelas.rows[0].total, 10),
        escuelasRelevadas: parseInt(totalRelevadas.rows[0]?.relevadas || '0', 10),
        porcentajeCobertura: totalEscuelas.rows[0].total > 0
          ? ((parseInt(totalRelevadas.rows[0]?.relevadas || '0', 10) / parseInt(totalEscuelas.rows[0].total, 10)) * 100).toFixed(1) + '%'
          : '0%',
      },
      incidenciasPorIncumbencia: incidenciasPorJurisdiccion.rows,
      actividadReciente: ultimosRelevamientos.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error al calcular KPIs del tablero:', error);
    res.status(500).json({ error: 'Error al calcular indicadores consolidados.' });
  }
}
