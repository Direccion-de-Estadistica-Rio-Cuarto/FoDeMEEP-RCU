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
