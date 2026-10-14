import type { RelevamientoBorrador, FotoRelevamiento } from '../types/fodemep';
import {
  guardarRelevamientoIDB,
  obtenerRelevamientoIDB,
  listarRelevamientosIDB,
  guardarFotoBlobIDB,
} from './indexedDbEngine';

export * from './indexedDbEngine';
export * from './syncManager';

const STORAGE_PREFIX = 'fodemep_relevamiento_v2_';

/**
 * Limpia cualquier dato residual de prueba/ejemplo almacenado previamente en el navegador.
 */
export function limpiarDatosEjemploPrevios(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('fodemep_relevamiento_') && !k.startsWith('fodemep_relevamiento_v2_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Error al limpiar datos antiguos:', err);
  }
}

/**
 * Envía un lote de borradores hacia el servidor del Monitor (puerto 5505 / proxy 3001 y relay cloud HTTPS)
 */
const CLOUD_RELAY_URL = 'https://ntfy.sh/fodemep_rcu_sync_2026_prod';

function despacharBorradoresAlMonitor(borradores: RelevamientoBorrador[]): void {
  if (!borradores || borradores.length === 0) return;
  const compactos = borradores.map((b) => ({
    escuelaId: b.escuelaId,
    uuid: b.uuid,
    tecnicoNombre: b.tecnicoNombre || (b.respuestas[3] as string) || 'Técnico Relevador FoDeMEEP',
    fecha: b.fecha,
    respuestas: b.respuestas,
    fotos: (b.fotos || []).map((f) => ({
      id: f.id,
      seccionId: f.seccionId,
      preguntaId: f.preguntaId,
      timestamp: f.timestamp,
      dataUrl: f.dataUrl,
    })),
    finalizado: b.finalizado,
    hashIntegridad: b.hashIntegridad,
    fechaUltimaModificacion: b.fechaUltimaModificacion || Date.now(),
  }));
  const payload = JSON.stringify({ borradores: compactos });
  const headers = { 'Content-Type': 'application/json' };
  fetch('/api/relevamientos-vivos', { method: 'POST', headers, body: payload }).catch(() => {});
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5505') {
    fetch('http://localhost:5505/api/relevamientos-vivos', { method: 'POST', headers, body: payload }).catch(() => {});
  }
  const paraNube = compactos.filter((b) => b.finalizado || (b.fotos && b.fotos.length > 0));
  if (paraNube.length > 0) {
    const bodyNube = JSON.stringify({ borradores: paraNube });
    if (bodyNube.length > 3500) {
      fetch(CLOUD_RELAY_URL, {
        method: 'PUT',
        headers: { Filename: 'relevamiento.json' },
        body: bodyNube,
      }).catch(() => {});
    } else {
      fetch(CLOUD_RELAY_URL, { method: 'POST', body: bodyNube }).catch(() => {});
    }
  }
}

/**
 * Sincroniza todos los relevamientos guardados en localStorage e IndexedDB con el Monitor
 */
export async function sincronizarTodosLosBorradoresConMonitor(): Promise<void> {
  try {
    const porEscuela: Record<string, RelevamientoBorrador> = {};
    const desdeLS = listarTodosLosBorradores();
    let desdeIDB: RelevamientoBorrador[] = [];
    try {
      desdeIDB = await listarRelevamientosIDB();
    } catch {
      // Ignorar si IDB no está listo
    }

    [...desdeIDB, ...desdeLS].forEach((b) => {
      if (!b || !b.escuelaId) return;
      const resp = b.respuestas || {};
      const nResp = Object.keys(resp).filter((k) => resp[Number(k)] !== undefined && resp[Number(k)] !== null && resp[Number(k)] !== '').length;
      const nFotos = (b.fotos || []).length;
      if (nResp > 0 || nFotos > 0) {
        const prev = porEscuela[b.escuelaId];
        if (!prev || (b.fechaUltimaModificacion || 0) >= (prev.fechaUltimaModificacion || 0)) {
          porEscuela[b.escuelaId] = b;
        }
      }
    });

    const activos = Object.values(porEscuela);
    if (activos.length > 0) {
      despacharBorradoresAlMonitor(activos);
    }
  } catch (e) {
    console.warn('Error al sincronizar borradores con el Monitor:', e);
  }
}

/**
 * Guarda el borrador de manera inmediata en localStorage (para rendimiento táctil < 16ms)
 * y en segundo plano asincrónico en IndexedDB (para almacenamiento masivo y transaccional).
 */
export function guardarBorradorEnStorage(borrador: RelevamientoBorrador): void {
  try {
    const key = `${STORAGE_PREFIX}${borrador.escuelaId}`;
    localStorage.setItem(key, JSON.stringify(borrador));

    // Notificación en vivo inter-pestañas / monitor de base de datos
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const canal = new BroadcastChannel('fodemep_live_channel');
        canal.postMessage({ borrador });
        canal.close();
      } catch (bcErr) {
        // Ignorar si el navegador bloquea canales
      }
    }

    // Sincronizar con el Monitor si posee respuestas o fotos cargadas
    const resp = borrador.respuestas || {};
    const tieneDatos =
      Object.keys(resp).some((k) => resp[Number(k)] !== undefined && resp[Number(k)] !== null && resp[Number(k)] !== '') ||
      (borrador.fotos && borrador.fotos.length > 0);
    if (tieneDatos) {
      despacharBorradoresAlMonitor([borrador]);
    }

    // Réplica asincrónica en IndexedDB (sin bloquear el hilo de la UI)
    guardarRelevamientoIDB(borrador).catch((err) => {
      console.warn('Aviso: guardado en IndexedDB:', err);
    });
  } catch (error) {
    console.error('Error al guardar borrador en localStorage:', error);
    // Si localStorage se llena por exceso de datos, IndexedDB asume el control
    guardarRelevamientoIDB(borrador).catch((err) => {
      console.error('Error crítico en IndexedDB fallback:', err);
    });
  }
}

/**
 * Carga el borrador sincrónicamente desde localStorage para carga inicial instantánea.
 */
export function cargarBorradorDeStorage(escuelaId: string): RelevamientoBorrador | null {
  try {
    const key = `${STORAGE_PREFIX}${escuelaId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as RelevamientoBorrador;
  } catch (error) {
    console.error('Error al cargar borrador de localStorage:', error);
    return null;
  }
}

/**
 * Carga asincrónica desde IndexedDB si localStorage fue limpiado por el navegador móvil.
 */
export async function cargarBorradorDeStorageAsync(escuelaId: string): Promise<RelevamientoBorrador | null> {
  const rapido = cargarBorradorDeStorage(escuelaId);
  if (rapido) return rapido;

  try {
    const desdeIDB = await obtenerRelevamientoIDB(escuelaId);
    if (desdeIDB) {
      // Rehidratar caché rápida
      localStorage.setItem(`${STORAGE_PREFIX}${escuelaId}`, JSON.stringify(desdeIDB));
      return desdeIDB;
    }
  } catch (err) {
    console.warn('Error al leer de IndexedDB:', err);
  }
  return null;
}

export function listarTodosLosBorradores(): RelevamientoBorrador[] {
  const lista: RelevamientoBorrador[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          lista.push(JSON.parse(raw));
        }
      }
    }
  } catch (error) {
    console.error('Error al listar borradores:', error);
  }
  return lista;
}

/**
 * Comprime imágenes del celular en el navegador usando Canvas y WebP/JPEG.
 * Reduce fotos pesadas de 8MB de cámara a < 250KB aptas para offline y sincronización ágil.
 */
export async function comprimirImagen(
  file: File,
  maxDimension: number = 1024,
  calidad: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D del canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG comprimido
        const dataUrl = canvas.toDataURL('image/jpeg', calidad);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
