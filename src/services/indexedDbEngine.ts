/**
 * Motor de Persistencia Local Asincrónica IndexedDB para FoDeMEEP
 * 
 * Implementa almacenamiento transaccional offline-first capaz de soportar
 * cientos de megabytes de relevamientos y evidencias fotográficas sin
 * las limitaciones de cuota (5MB) de localStorage.
 */

import type { RelevamientoBorrador, EventoAuditoria, ItemColaSync } from '../types/fodemep';

const DB_NOMBRE = 'FODEMEP_CAMPO_DB';
const DB_VERSION = 1;

export interface FotoBlobRegistro {
  id: string;
  escuelaId: string;
  seccionId: number;
  preguntaId?: number;
  blob: Blob;
  mimeType: string;
  tamanoBytes: number;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Inicializa y abre la base de datos IndexedDB con todos sus object stores e índices.
 */
export function abrirBaseDatos(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está soportado en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NOMBRE, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Almacén de Relevamientos (Metadatos y Respuestas JSON)
      if (!db.objectStoreNames.contains('relevamientos')) {
        const store = db.createObjectStore('relevamientos', { keyPath: 'escuelaId' });
        store.createIndex('uuid', 'uuid', { unique: false });
        store.createIndex('estadoSincronizacion', 'estadoSincronizacion', { unique: false });
        store.createIndex('fechaUltimaModificacion', 'fechaUltimaModificacion', { unique: false });
      }

      // 2. Almacén de Fotos Binarias (Blobs crudos comprimidos)
      if (!db.objectStoreNames.contains('fotos_blobs')) {
        const store = db.createObjectStore('fotos_blobs', { keyPath: 'id' });
        store.createIndex('escuelaId', 'escuelaId', { unique: false });
        store.createIndex('seccionId', 'seccionId', { unique: false });
      }

      // 3. Almacén de Cola de Sincronización (Outbox Pattern)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('estado', 'estado', { unique: false });
        store.createIndex('timestampEncolado', 'timestampEncolado', { unique: false });
      }

      // 4. Almacén de Auditoría Inmutable
      if (!db.objectStoreNames.contains('audit_log')) {
        const store = db.createObjectStore('audit_log', { keyPath: 'id' });
        store.createIndex('escuelaId', 'escuelaId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Error al abrir IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Guarda o actualiza un relevamiento en IndexedDB.
 */
export async function guardarRelevamientoIDB(borrador: RelevamientoBorrador): Promise<void> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('relevamientos', 'readwrite');
    const store = tx.objectStore('relevamientos');
    const req = store.put(borrador);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Obtiene un relevamiento por el ID de la escuela.
 */
export async function obtenerRelevamientoIDB(escuelaId: string): Promise<RelevamientoBorrador | null> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('relevamientos', 'readonly');
    const store = tx.objectStore('relevamientos');
    const req = store.get(escuelaId);

    req.onsuccess = () => resolve((req.result as RelevamientoBorrador) || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Lista todos los relevamientos almacenados localmente en el dispositivo.
 */
export async function listarRelevamientosIDB(): Promise<RelevamientoBorrador[]> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('relevamientos', 'readonly');
    const store = tx.objectStore('relevamientos');
    const req = store.getAll();

    req.onsuccess = () => resolve((req.result as RelevamientoBorrador[]) || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Almacena una evidencia fotográfica en formato Blob en el almacén binario.
 */
export async function guardarFotoBlobIDB(foto: FotoBlobRegistro): Promise<void> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fotos_blobs', 'readwrite');
    const store = tx.objectStore('fotos_blobs');
    const req = store.put(foto);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Recupera el blob de una fotografía por su ID.
 */
export async function obtenerFotoBlobIDB(fotoId: string): Promise<FotoBlobRegistro | null> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fotos_blobs', 'readonly');
    const store = tx.objectStore('fotos_blobs');
    const req = store.get(fotoId);

    req.onsuccess = () => resolve((req.result as FotoBlobRegistro) || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Elimina una foto física de IndexedDB.
 */
export async function eliminarFotoBlobIDB(fotoId: string): Promise<void> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fotos_blobs', 'readwrite');
    const store = tx.objectStore('fotos_blobs');
    const req = store.delete(fotoId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Encola un relevamiento consolidado en la cola Outbox para sincronización.
 */
export async function encolarParaSyncIDB(item: ItemColaSync): Promise<void> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Obtiene todas las peticiones pendientes de la cola de sincronización.
 */
export async function obtenerColaSyncIDB(): Promise<ItemColaSync[]> {
  const db = await abrirBaseDatos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const index = store.index('estado');
    const req = index.getAll('PENDIENTE');

    req.onsuccess = () => resolve((req.result as ItemColaSync[]) || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Registra un evento en la pista de auditoría inmutable local.
 */
export async function registrarEventoAuditoriaIDB(evento: EventoAuditoria & { escuelaId: string }): Promise<void> {
  try {
    const db = await abrirBaseDatos();
    const tx = db.transaction('audit_log', 'readwrite');
    tx.objectStore('audit_log').put(evento);
  } catch (err) {
    console.warn('No se pudo registrar auditoría en IndexedDB:', err);
  }
}
