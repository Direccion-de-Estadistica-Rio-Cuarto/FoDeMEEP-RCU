/**
 * Motor de Gestión de Sincronización y Respaldo para FoDeMEEP
 * 
 * Orquesta la cola Outbox, verificación de conectividad,
 * cálculo de sellado de integridad SHA-256 y exportación de expedientes.
 */

import type { RelevamientoBorrador, ItemColaSync, GeolocalizacionInSitu } from '../types/fodemep';
import { encolarParaSyncIDB, guardarRelevamientoIDB } from './indexedDbEngine';

/**
 * Calcula un hash SHA-256 en el cliente utilizando Web Crypto API
 * para sellar las respuestas del relevamiento técnico.
 */
export async function calcularSelloIntegridad(borrador: RelevamientoBorrador): Promise<string> {
  try {
    const rawData = JSON.stringify({
      escuelaId: borrador.escuelaId,
      tecnico: borrador.tecnicoNombre,
      fecha: borrador.fecha,
      respuestas: Object.keys(borrador.respuestas)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => [k, borrador.respuestas[Number(k)]]),
    });

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(rawData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Crypto API no disponible, usando fallback:', err);
    return `hash-${Date.now()}-${borrador.escuelaId}`;
  }
}

/**
 * Captura las coordenadas GPS del inspector al momento del relevamiento
 */
export function capturarGeolocalizacion(): Promise<GeolocalizacionInSitu | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
          precisionMetros: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        console.warn('Geolocalización omitida o no permitida:', err.message);
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

/**
 * Prepara y encola un relevamiento concluido para su despacho hacia el servidor.
 */
export async function prepararYEncolarParaSync(borrador: RelevamientoBorrador): Promise<RelevamientoBorrador> {
  const hash = await calcularSelloIntegridad(borrador);
  const geo = await capturarGeolocalizacion();

  const uuid = borrador.uuid || `rel-${borrador.escuelaId}-${Date.now()}`;
  const borradorActualizado: RelevamientoBorrador = {
    ...borrador,
    uuid,
    finalizado: true,
    hashIntegridad: hash,
    geolocalizacion: geo || borrador.geolocalizacion,
    estadoSincronizacion: 'PENDIENTE_SINCRONIZACION',
    fechaUltimaModificacion: Date.now(),
  };

  // 1. Guardar estado actualizado en IndexedDB
  await guardarRelevamientoIDB(borradorActualizado);

  // 2. Crear ítem en la cola Outbox
  const itemSync: ItemColaSync = {
    id: `sync-${uuid}`,
    relevamientoUuid: uuid,
    escuelaId: borrador.escuelaId,
    timestampEncolado: Date.now(),
    reintentos: 0,
    estado: 'PENDIENTE',
    payloadJSON: JSON.stringify(borradorActualizado),
  };

  await encolarParaSyncIDB(itemSync);

  return borradorActualizado;
}

/**
 * Genera el paquete consolidado en formato JSON estructurado
 * para transferencia hacia PostgreSQL/Supabase o descarga manual.
 */
export function generarPaqueteExportacion(
  borrador: RelevamientoBorrador,
  cue: string,
  nombreEscuela: string
) {
  return {
    metadatos: {
      sistema: 'FoDeMEEP Río Cuarto',
      versionSchema: 1,
      fechaExportacion: new Date().toISOString(),
      dispositivo: {
        userAgent: navigator.userAgent,
        idioma: navigator.language,
      },
    },
    institucion: {
      escuelaId: borrador.escuelaId,
      cue,
      nombre: nombreEscuela,
    },
    relevamiento: {
      uuid: borrador.uuid,
      tecnico: borrador.tecnicoNombre,
      fechaRelevamiento: borrador.fecha,
      hashIntegridad: borrador.hashIntegridad,
      geolocalizacion: borrador.geolocalizacion,
      estadoSincronizacion: borrador.estadoSincronizacion || 'BORRADOR_LOCAL',
      totalRespuestas: Object.keys(borrador.respuestas).length,
      respuestas: borrador.respuestas,
      totalFotos: borrador.fotos.length,
      evidencias: borrador.fotos.map((f) => ({
        id: f.id,
        seccionId: f.seccionId,
        preguntaId: f.preguntaId,
        timestamp: f.timestamp,
        tamanoAproxBytes: f.dataUrl.length,
      })),
    },
  };
}
