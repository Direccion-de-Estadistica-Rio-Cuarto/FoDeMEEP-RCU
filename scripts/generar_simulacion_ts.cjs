const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const imgPath = 'C:\\Users\\munno\\.gemini\\antigravity\\brain\\abe5d377-cc32-4669-bff3-ea447076afd5\\screenshot_iphone_render.png';
const buf = fs.readFileSync(imgPath);
const b64 = buf.toString('base64');
const dataUrl = 'data:image/png;base64,' + b64;
const sha256 = crypto.createHash('sha256').update(buf).digest('hex');

const dataFile = path.join(__dirname, '..', 'data_simulacion_prueba.json');
const simData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

const lines = [
  "// Archivo generado automaticamente para la prueba de simulacion con captura de pantalla",
  "import type { RelevamientoBorrador, FotoRelevamiento } from '../types/fodemep';",
  "",
  `export const CAPTURA_SIMULACION_DATA_URL = ${JSON.stringify(dataUrl)};`,
  `export const CAPTURA_SIMULACION_BYTES = ${buf.length};`,
  `export const CAPTURA_SIMULACION_SHA256 = ${JSON.stringify(sha256)};`,
  "",
  "export const FOTO_SIMULACION_PRUEBA: FotoRelevamiento = {",
  `  id: ${JSON.stringify(simData.evidencias[0].id)},`,
  "  seccionId: 3,",
  "  preguntaId: 32,",
  "  dataUrl: CAPTURA_SIMULACION_DATA_URL,",
  "  nota: 'Captura in situ del estado de filtraciones y desprendimiento superficial en cubierta del jardin.',",
  "  timestamp: 1791969420000,",
  "};",
  "",
  "export const BORRADOR_SIMULACION_PRUEBA: RelevamientoBorrador = {",
  `  uuid: ${JSON.stringify(simData.relevamiento.id)},`,
  "  escuelaId: 'ESC-140088000',",
  "  tecnicoNombre: 'Arq. Martín Gómez (Legajo #4892)',",
  "  fecha: '2026-10-14',",
  `  respuestas: ${JSON.stringify(simData.respuestas, null, 2)},`,
  "  fotos: [FOTO_SIMULACION_PRUEBA],",
  "  seccionesCompletas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],",
  "  fechaUltimaModificacion: 1791969930000,",
  "  finalizado: true,",
  "  estadoSincronizacion: 'SINCRONIZADO',",
  "  geolocalizacion: {",
  "    latitud: -33.1212015,",
  "    longitud: -64.3234190,",
  "    precisionMetros: 3.2,",
  "    timestamp: 1791969300000,",
  "  },",
  `  hashIntegridad: ${JSON.stringify(simData.relevamiento.hash_integridad)},`,
  "};",
  ""
];

const targetPath = path.join(__dirname, '..', 'src', 'data', 'simulacionPrueba.ts');
fs.writeFileSync(targetPath, lines.join('\n'), 'utf-8');
console.log('src/data/simulacionPrueba.ts escrito correctamente.');
