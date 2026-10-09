import type { RelevamientoBorrador, FotoRelevamiento } from '../types/fodemep';

const STORAGE_PREFIX = 'fodemep_relevamiento_';

export function guardarBorradorEnStorage(borrador: RelevamientoBorrador): void {
  try {
    const key = `${STORAGE_PREFIX}${borrador.escuelaId}`;
    localStorage.setItem(key, JSON.stringify(borrador));
  } catch (error) {
    console.error('Error al guardar borrador en localStorage:', error);
  }
}

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
