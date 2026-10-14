const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ruta a la captura de pantalla generada en el artifact directory
const screenshotPath = 'C:\\Users\\munno\\.gemini\\antigravity\\brain\\abe5d377-cc32-4669-bff3-ea447076afd5\\screenshot_iphone_render.png';

if (!fs.existsSync(screenshotPath)) {
  console.error('No se encontró el archivo de captura:', screenshotPath);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(screenshotPath);
const fileSize = fileBuffer.length;
const fileSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
const base64Data = fileBuffer.toString('base64');
const dataUrl = `data:image/png;base64,${base64Data}`;

console.log(`Archivo de captura cargado con éxito: ${fileSize} bytes | SHA-256: ${fileSha256.substring(0, 16)}...`);

// Datos de la institución oficial relevada
const institucion = {
  id: 'ESC-140088000',
  cue: '140088000',
  nombre: 'J. DE INF. LEOPOLDO LUGONES',
  nivel: 'Inicial',
  modalidad: 'COMUN',
  sector: 'PUBLICO',
  ambito: 'URBANO',
  domicilio: 'Fray Quirico Porreca 1320',
  barrio: 'Las Delicias',
  localidad: 'Río Cuarto',
  departamento: 'Río Cuarto',
  latitud: -33.1212042,
  longitud: -64.3234187,
  matricula: 145,
  directivo: 'Prof. Silvia Mansilla',
  telefono: '0358-4672911',
  email: 'jinf_lugones_rcu@cba.gov.ar'
};

// ID y datos del relevamiento
const relevamientoId = 'b8f2c140-5e39-4d82-841f-7b792e310048';
const inspector = {
  id: 'd9e03a11-8842-4f1a-b615-1849a26f7431',
  nombre: 'Arq. Martín Gómez',
  legajo: '4892-MUN',
  rol: 'INSPECTOR_CAMPO'
};

const fechaRelevamiento = '2026-10-14T09:15:00.000Z';
const geolocalizacion = {
  latitud: -33.1212015,
  longitud: -64.3234190,
  precisionMetros: 3.2,
  timestamp: Date.parse(fechaRelevamiento)
};

// Respuestas simuladas representativas para las 14 secciones del FoDeMEEP
const respuestas = {
  // Sección 1: Institución
  1: 'J. DE INF. LEOPOLDO LUGONES - CUE: 140088000',
  2: 'Prof. Silvia Mansilla',
  3: 'Arq. Martín Gómez (Legajo #4892)',
  4: '14/10/2026',
  5: '0358-4672911',
  6: 'jinf_lugones_rcu@cba.gov.ar',

  // Sección 2: Espacios
  7: 8, // ambientes
  8: 4, // aulas
  9: 'si', // aulas en uso
  10: 4,
  15: 'ant_2', // 10 a 30 años
  16: 420, // m²
  18: 145, // matricula

  // Sección 3: Estructura, Pisos y Techos
  23: 'bue', // pisos en buen estado
  25: 'no',  // sin riesgo de tropiezo
  27: 'reg', // paredes con desgaste superficial (genera PINTURA / ALBAÑILERIA)
  28: 'no',  // sin grietas estructurales pasantes
  30: 'reg', // techos con mantenimiento preventivo
  32: 'si',  // FILTRACIÓN detectada en cubierta SUM -> genera Incidencia FILTRACIONES
  34: 'no',  // sin peligro de desprendimiento
  36: 'bue', // aberturas en buen estado
  38: 0,    // vidrios rotos: 0
  39: 'bue', // cerramiento perimetral seguro

  // Sección 4: Gas
  42: 'gn',  // gas natural de red
  43: 'si',  // certificado Ecogas vigente
  45: 'bue', // cañerías en buen estado
  47: 'no',  // sin olor a gas
  49: 'si',  // llaves de corte operativas
  52: 'si',  // rejillas de ventilación reglamentarias

  // Sección 5: Electricidad
  55: 'si',  // trifásica EPEC
  57: 'bue', // tablero principal normalizado
  59: 'si',  // disyuntor diferencial operativo
  61: 'si',  // puesta a tierra (jabalina con protocolo)
  63: 'no',  // sin cables expuestos

  // Sección 6: Calefacción
  66: 5,     // calefactores tiro balanceado en funcionamiento
  69: 1,     // 1 calefactor con termocupla defectuosa -> genera REPARACION DE ARTEFACTOS

  // Sección 7: Agua y Sanitarios
  72: 'si',  // agua corriente de red (EMOS)
  74: 'bue', // tanques de reserva limpios
  76: 'si',  // sanitarios infantiles adaptados a nivel inicial
  78: 'bue', // griferías funcionando
  80: 'no',  // sin pérdidas cloacales ni desbordes

  // Sección 8: Seguridad contra Incendio
  90: 4,     // matafuegos ABC
  92: 'si',  // obleas de carga 2026 al día
  94: 'si',  // luces de emergencia operativas
  96: 'si',  // señalética de salida de emergencia

  // Sección 9: Cocina / PAICOR
  105: 'si', // cocina habilitada PAICOR
  107: 'bue', // campana de extracción limpia
  109: 'si', // provisión de agua caliente (termotanque)

  // Sección 10: Accesibilidad
  120: 'si', // rampa de acceso frontal bajo norma
  122: 'si', // puerta principal ancho 1.20m
  124: 'si', // baño para personas con movilidad reducida

  // Sección 11: Exteriores
  135: 'bue', // patio de juegos con piso de caucho antigolpes
  137: 'no'   // ramas sin interferir cableado eléctrico
};

// Generación de Hash SHA-256 criptográfico para la auditoría inmutable
const canonicalRespuestas = JSON.stringify(respuestas, Object.keys(respuestas).sort());
const canonicalString = `${relevamientoId}|${institucion.id}|${fechaRelevamiento}|${canonicalRespuestas}|${fileSha256}`;
const hashIntegridad = crypto.createHash('sha256').update(canonicalString).digest('hex');

// Cálculo de Dimensiones e Índices
const subindices = {
  seguridadCritica: { puntaje: 92, ponderacion: 0.25, estado: 'Excelente' },
  aguaSaneamiento: { puntaje: 95, ponderacion: 0.20, estado: 'Excelente' },
  estructuraCubiertas: { puntaje: 74, ponderacion: 0.18, estado: 'Bueno' },
  climatizacion: { puntaje: 80, ponderacion: 0.15, estado: 'Bueno' },
  alimentacionCocina: { puntaje: 100, ponderacion: 0.10, estado: 'Excelente' },
  accesibilidad: { puntaje: 90, ponderacion: 0.07, estado: 'Excelente' },
  entornoExterior: { puntaje: 90, ponderacion: 0.05, estado: 'Excelente' }
};

const indiceIES = Math.round(
  subindices.seguridadCritica.puntaje * subindices.seguridadCritica.ponderacion +
  subindices.aguaSaneamiento.puntaje * subindices.aguaSaneamiento.ponderacion +
  subindices.estructuraCubiertas.puntaje * subindices.estructuraCubiertas.ponderacion +
  subindices.climatizacion.puntaje * subindices.climatizacion.ponderacion +
  subindices.alimentacionCocina.puntaje * subindices.alimentacionCocina.ponderacion +
  subindices.accesibilidad.puntaje * subindices.accesibilidad.ponderacion +
  subindices.entornoExterior.puntaje * subindices.entornoExterior.ponderacion
); // 87 puntos

const estadoSemaforo = 'OPTIMO'; // >= 80

// Incidencias detectadas
const incidencias = [
  {
    id: 'f1a92e10-4491-49b8-a762-b912c98031a1',
    institucion_id: institucion.id,
    relevamiento_id: relevamientoId,
    tipo_codigo: 'FILTRACIONES',
    seccion_id: 3,
    pregunta_id: 32,
    titulo: 'Filtración pluvial en losa de SUM hacia sector norte',
    descripcion: 'Se detecta mancha de humedad activa con microgotera en cielo raso de yeso tras precipitaciones recientes. Requiere sellado e impermeabilización de junta de dilatación en cubierta.',
    severidad: 'MEDIA',
    jurisdiccion: 'FoDeMEEP',
    estado: 'REPORTADA',
    costo_estimado: 185000.00,
    evidencia_asociada: true
  },
  {
    id: 'c2834b67-1290-48ee-89a1-5582f3a88204',
    institucion_id: institucion.id,
    relevamiento_id: relevamientoId,
    tipo_codigo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS',
    seccion_id: 6,
    pregunta_id: 69,
    titulo: 'Calefactor tiro balanceado fuera de servicio en Sala 4 años',
    descripcion: 'Artefacto calefactor presenta falla en termocupla y piloto inestable. No hay fuga de gas, pero no mantiene encendido. Requiere service técnico gasista matriculado.',
    severidad: 'LEVE',
    jurisdiccion: 'FoDeMEEP',
    estado: 'REPORTADA',
    costo_estimado: 45000.00,
    evidencia_asociada: false
  },
  {
    id: 'e7192a04-5120-410a-8bf8-d45089fa0821',
    institucion_id: institucion.id,
    relevamiento_id: relevamientoId,
    tipo_codigo: 'PINTURA',
    seccion_id: 3,
    pregunta_id: 27,
    titulo: 'Deterioro superficial de pintura y salitre en zócalos de pasillo',
    descripcion: 'Desprendimiento localizado de pintura al látex en muros interiores por humedad de condensación invernal previa.',
    severidad: 'LEVE',
    jurisdiccion: 'FoDeMEEP',
    estado: 'REPORTADA',
    costo_estimado: 95000.00,
    evidencia_asociada: false
  }
];

// Evidencias fotográficas (con la captura del usuario vinculada a la incidencia de Filtraciones)
const evidenciaFotografica = {
  id: '7b804e22-3ac8-4395-97e3-0d322b82ea55',
  relevamiento_id: relevamientoId,
  seccion_id: 3,
  pregunta_id: 32,
  incidencia_id: incidencias[0].id,
  url_almacenamiento: `s3://fodemep-storage/2026/10/ESC-140088000/${relevamientoId}/evidencia_cubierta_sum_32.png`,
  nombre_archivo: 'captura_simulacion_inspeccion_iphone.png',
  formato: 'image/png',
  peso_bytes: fileSize,
  sha256: fileSha256,
  latitud: geolocalizacion.latitud,
  longitud: geolocalizacion.longitud,
  es_critica: false,
  nota_inspector: 'Captura in situ del estado de filtraciones y desprendimiento superficial en sector de cubierta del jardín.'
};

// Eventos de auditoría inmutable
const auditoriaEventos = [
  {
    id: 'a01-921',
    relevamiento_id: relevamientoId,
    timestamp: '2026-10-14T09:15:00.000Z',
    estado_anterior: 'BORRADOR_LOCAL',
    estado_nuevo: 'EN_PROCESO',
    operado_por: 'Arq. Martín Gómez (Inspector)',
    detalle: 'Inicio de relevamiento técnico in situ con geocerca verificada (-33.12120, -64.32341).'
  },
  {
    id: 'a02-922',
    relevamiento_id: relevamientoId,
    timestamp: '2026-10-14T09:42:15.000Z',
    estado_anterior: 'EN_PROCESO',
    estado_nuevo: 'EN_PROCESO',
    operado_por: 'Arq. Martín Gómez (Inspector)',
    detalle: `Captura y adjunción de evidencia fotográfica (#32: Techos, 72.4 KB) con sellado criptográfico.`
  },
  {
    id: 'a03-923',
    relevamiento_id: relevamientoId,
    timestamp: '2026-10-14T10:05:30.000Z',
    estado_anterior: 'EN_PROCESO',
    estado_nuevo: 'COMPLETADO_CONSOLIDADO',
    operado_por: 'Arq. Martín Gómez (Inspector)',
    detalle: `Cierre del relevamiento. Cálculo IES total: ${indiceIES}/100 (${estadoSemaforo}). Generación de sello SHA-256: ${hashIntegridad.substring(0, 16)}...`
  },
  {
    id: 'a04-924',
    relevamiento_id: relevamientoId,
    timestamp: '2026-10-14T10:05:32.000Z',
    estado_anterior: 'COMPLETADO_CONSOLIDADO',
    estado_nuevo: 'SINCRONIZADO_POSTGRES',
    operado_por: 'Worker Background Sync (FoDeMEEP Engine)',
    detalle: 'Transmisión exitosa a la base de datos central PostgreSQL. Transacción ACID commit.'
  }
];

// Guardar un dump de la prueba en un JSON para trazabilidad
const simulationOutput = {
  institucion,
  relevamiento: {
    id: relevamientoId,
    institucion_id: institucion.id,
    inspector_id: inspector.id,
    inspector_nombre: inspector.nombre,
    fecha_relevamiento: fechaRelevamiento,
    indice_ies_total: indiceIES,
    estado_semaforo: estadoSemaforo,
    subindices,
    hash_integridad: hashIntegridad,
    geolocalizacion,
    estado: 'COMPLETADO_CONSOLIDADO'
  },
  respuestas,
  evidencias: [evidenciaFotografica],
  incidencias,
  auditoria: auditoriaEventos
};

fs.writeFileSync(
  path.join(__dirname, '..', 'data_simulacion_prueba.json'),
  JSON.stringify(simulationOutput, null, 2),
  'utf-8'
);

console.log('Simulación completada con éxito.');
console.log(`Índice IES Total: ${indiceIES} / 100 (${estadoSemaforo})`);
console.log(`Total Respuestas Procesadas: ${Object.keys(respuestas).length}`);
console.log(`Incidencias Detectadas: ${incidencias.length}`);
console.log(`Evidencias Fotográficas: 1 (${evidenciaFotografica.nombre_archivo} - ${evidenciaFotografica.peso_bytes} bytes)`);
console.log(`Hash de Integridad SHA-256: ${hashIntegridad}`);
