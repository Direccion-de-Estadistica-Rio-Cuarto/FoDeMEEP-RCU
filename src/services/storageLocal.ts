import type { RelevamientoBorrador, FotoRelevamiento } from '../types/fodemep';
import {
  guardarRelevamientoIDB,
  obtenerRelevamientoIDB,
  listarRelevamientosIDB,
  guardarFotoBlobIDB,
  obtenerColaSyncIDB,
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

/**
 * Re-comprime en memoria cualquier dataUrl pesada (> 40 KB) antes de subirla por red
 * para que cada evidencia fotográfica pese ~20-35 KB y no genere interferencias ni bloquee la BBDD.
 */
export async function optimizarDataUrlParaSync(
  dataUrl: string,
  maxDimension: number = 640,
  calidad: number = 0.52
): Promise<string> {
  if (!dataUrl || typeof document === 'undefined' || dataUrl.length <= 50000) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
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
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        let comprimida = canvas.toDataURL('image/jpeg', calidad);
        if (comprimida.length > 55000) {
          comprimida = canvas.toDataURL('image/jpeg', 0.42);
        }
        resolve(comprimida.length < dataUrl.length ? comprimida : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function despacharBorradoresAlMonitor(borradores: RelevamientoBorrador[], enviarACloud: boolean = false): Promise<void> {
  if (!borradores || borradores.length === 0) return;

  // Optimizar fotos en memoria antes de transmitir o persistir en Monitor
  const compactos = await Promise.all(
    borradores.map(async (b) => {
      const fotosOptimizadas = await Promise.all(
        (b.fotos || []).map(async (f) => ({
          id: f.id,
          seccionId: f.seccionId,
          preguntaId: f.preguntaId,
          timestamp: f.timestamp,
          dataUrl: await optimizarDataUrlParaSync(f.dataUrl),
        }))
      );
      return {
        escuelaId: b.escuelaId,
        uuid: b.uuid,
        tecnicoNombre: b.tecnicoNombre || (b.respuestas[3] as string) || 'Técnico Relevador FoDeMEEP',
        fecha: b.fecha,
        respuestas: b.respuestas,
        fotos: fotosOptimizadas,
        finalizado: b.finalizado,
        hashIntegridad: b.hashIntegridad,
        fechaUltimaModificacion: b.fechaUltimaModificacion || Date.now(),
      };
    })
  );

  const payload = JSON.stringify({ borradores: compactos });
  const headers = { 'Content-Type': 'application/json' };
  fetch('/api/relevamientos-vivos', { method: 'POST', headers, body: payload }).catch(() => {});
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5505') {
    fetch('http://localhost:5505/api/relevamientos-vivos', { method: 'POST', headers, body: payload }).catch(() => {});
  }
  if (enviarACloud) {
    const paraNube = compactos.filter((b) => b.finalizado || Object.keys(b.respuestas || {}).length >= 5 || (b.fotos && b.fotos.length > 0));
    if (paraNube.length > 0) {
      // 1. Envío liviano garantizado por POST (sin fotos pesadas, < 2KB)
      const livianos = paraNube.map((b) => ({ ...b, fotos: [] }));
      fetch(CLOUD_RELAY_URL, { method: 'POST', body: JSON.stringify({ borradores: livianos }) }).catch(() => {});

      // 2. Si existen fotos, enviar cada institución por separado con fotos ultra-comprimidas (~25-35KB c/u)
      const conFotos = paraNube.filter((b) => b.fotos && b.fotos.length > 0);
      for (const item of conFotos) {
        fetch(CLOUD_RELAY_URL, {
          method: 'PUT',
          headers: { Filename: 'relevamiento.json' },
          body: JSON.stringify({ borrador: item }),
        }).catch(() => {});
      }
    }
  }
}

/**
 * Sincroniza todos los relevamientos guardados en localStorage, IndexedDB (relevamientos) y cola Outbox (sync_queue) con el Monitor
 */
export async function sincronizarTodosLosBorradoresConMonitor(): Promise<void> {
  try {
    const porEscuela: Record<string, RelevamientoBorrador> = {};
    const desdeLS = listarTodosLosBorradores();
    let desdeIDB: RelevamientoBorrador[] = [];
    let desdeCola: RelevamientoBorrador[] = [];
    try {
      desdeIDB = await listarRelevamientosIDB();
    } catch {
      // Ignorar si IDB no está listo
    }
    try {
      const cola = await obtenerColaSyncIDB();
      desdeCola = cola
        .map((item) => {
          try {
            return JSON.parse(item.payloadJSON) as RelevamientoBorrador;
          } catch {
            return null;
          }
        })
        .filter((b): b is RelevamientoBorrador => b !== null);
    } catch {
      // Ignorar si cola no está lista
    }

    [...desdeCola, ...desdeIDB, ...desdeLS].forEach((b) => {
      if (!b || !b.escuelaId) return;
      const resp = b.respuestas || {};
      const nResp = Object.keys(resp).filter((k) => resp[Number(k)] !== undefined && resp[Number(k)] !== null && resp[Number(k)] !== '').length;
      const nFotos = (b.fotos || []).length;
      if (nResp > 0 || nFotos > 0) {
        const prev = porEscuela[b.escuelaId];
        if (!prev) {
          porEscuela[b.escuelaId] = { ...b, fotos: [...(b.fotos || [])] };
        } else {
          // Conservar todas las fotos únicas de ambas fuentes
          const mapaFotos = new Map<string, FotoRelevamiento>();
          [...(prev.fotos || []), ...(b.fotos || [])].forEach((f) => {
            if (f && f.dataUrl) mapaFotos.set(f.id || `${f.seccionId}-${f.timestamp}`, f);
          });
          const masReciente = (b.fechaUltimaModificacion || 0) >= (prev.fechaUltimaModificacion || 0) ? b : prev;
          porEscuela[b.escuelaId] = {
            ...masReciente,
            finalizado: Boolean(prev.finalizado || b.finalizado),
            fotos: Array.from(mapaFotos.values()),
          };
        }
      }
    });

    const activos = Object.values(porEscuela);
    if (activos.length > 0) {
      await despacharBorradoresAlMonitor(activos, true);
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

    // Sincronizar con el Monitor local si posee respuestas o fotos cargadas (sin saturar Cloud en cada toque)
    const resp = borrador.respuestas || {};
    const tieneDatos =
      Object.keys(resp).some((k) => resp[Number(k)] !== undefined && resp[Number(k)] !== null && resp[Number(k)] !== '') ||
      (borrador.fotos && borrador.fotos.length > 0);
    if (tieneDatos) {
      despacharBorradoresAlMonitor([borrador], Boolean(borrador.finalizado));
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
 * Comprime imágenes del celular en el navegador usando Canvas (720px @ 0.55 JPEG).
 * Reduce fotos pesadas de 8MB de cámara a ~25-40KB aptas para offline, BBDD liviana y sincronización instantánea.
 */
export async function comprimirImagen(
  file: File,
  maxDimension: number = 720,
  calidad: number = 0.55
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

        // Convertir a JPEG ultra-liviano (~25-40 KB)
        let dataUrl = canvas.toDataURL('image/jpeg', calidad);
        if (dataUrl.length > 55000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.42);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte un DataURL en un Blob binario para persistencia en IndexedDB o descarga física.
 */
export function dataUrlABlob(dataUrl: string): Blob {
  const partes = dataUrl.split(',');
  const mime = partes[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binStr = atob(partes[1] || '');
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

/**
 * Descarga físicamente una fotografía en la memoria de Archivos / Descargas del teléfono.
 */
export function descargarFotoEnTelefono(dataUrl: string, nombreArchivo: string): void {
  try {
    const blob = dataUrlABlob(dataUrl);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo.endsWith('.jpg') ? nombreArchivo : `${nombreArchivo}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (err) {
    console.warn('Error al descargar foto en teléfono:', err);
  }
}

/**
 * Exporta todas las fotografías de un relevamiento al teléfono (usando el menú nativo de iOS/Android
 * "Guardar imágenes / Compartir por WhatsApp" si está disponible, o descarga directa de cada archivo .jpg).
 */
export async function exportarFotosAlTelefono(
  fotos: FotoRelevamiento[],
  identificadorEscuela: string
): Promise<void> {
  if (!fotos || fotos.length === 0) return;
  const prefijo = identificadorEscuela.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    const archivos: File[] = fotos.map((f, idx) => {
      const blob = dataUrlABlob(f.dataUrl);
      const nombre = `FoDeMEEP_${prefijo}_Sec${f.seccionId}_${idx + 1}.jpg`;
      return new File([blob], nombre, { type: 'image/jpeg' });
    });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: archivos })) {
      await navigator.share({
        title: `Evidencias Fotográficas FoDeMEEP (${identificadorEscuela})`,
        text: `${fotos.length} evidencia(s) fotográfica(s) del relevamiento ${identificadorEscuela}`,
        files: archivos,
      });
      return;
    }
  } catch (err: any) {
    if (err && err.name === 'AbortError') return;
    // Si el navegador no soporta Web Share de archivos, continúa con descarga individual
  }

  fotos.forEach((f, idx) => {
    setTimeout(() => {
      descargarFotoEnTelefono(
        f.dataUrl,
        `FoDeMEEP_${prefijo}_Sec${f.seccionId}_${idx + 1}.jpg`
      );
    }, idx * 250);
  });
}

