const fs = require('fs');
const path = require('path');

// 1. Leer padrón oficial completo (126 instituciones públicas provinciales)
const escuelasRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'instituciones_publicas_rio_cuarto_completo.json'), 'utf8')
);

// 2. Catálogo Oficial de 20 Tipos de Incidencias FoDeMEEP Río Cuarto (sin frecuencias ni costos simulados)
const CATALOGO_INCIDENCIAS = [
  { codigo: 'PLOMERIA', nombre: 'Plomería y Grifería', seccionId: 8, seccion: 'Sanitarios y Griferías', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Cuadrilla Sanitaria / Plomería Municipal', costoBase: 0, impactoBase: 5 },
  { codigo: 'ELECTRICIDAD', nombre: 'Electricidad e Iluminación', seccionId: 9, seccion: 'Instalación Eléctrica', dimension: 'seguridadCritica', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Electricista Matriculado FoDeMEEP', costoBase: 0, impactoBase: 8 },
  { codigo: 'HERRERIA', nombre: 'Herrería y Cerramientos', seccionId: 3, seccion: 'Estructura y Aberturas', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Taller de Herrería y Soldadura', costoBase: 0, impactoBase: 4 },
  { codigo: 'GAS', nombre: 'Gas y Calefacción (NAG-200)', seccionId: 4, seccion: 'Instalación de Gas', dimension: 'seguridadCritica', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'CRITICA', cuadrilla: 'Gasista Matriculado Categoría 1ª', costoBase: 0, impactoBase: 12 },
  { codigo: 'DESINFECCION', nombre: 'Desinfección y Control Vectorial', seccionId: 7, seccion: 'Saneamiento Ambiental', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Saneamiento Ambiental y Zoonosis', costoBase: 0, impactoBase: 4 },
  { codigo: 'VARIOS', nombre: 'Mantenimiento General y Cerrajería', seccionId: 2, seccion: 'Mantenimiento Edilicio General', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'LEVE', cuadrilla: 'Cuadrilla Operativa Multipropósito', costoBase: 0, impactoBase: 2 },
  { codigo: 'PINTURA', nombre: 'Pintura Interior y Fachada', seccionId: 3, seccion: 'Muros y Cielorrasos', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'LEVE', cuadrilla: 'Cuadrilla de Pintura Escolar', costoBase: 0, impactoBase: 3 },
  { codigo: 'ALBANILERIA', nombre: 'Albañilería, Revoques y Solados', seccionId: 3, seccion: 'Estructura, Pisos y Muros', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Cuadrilla de Albañilería y Mampostería', costoBase: 0, impactoBase: 6 },
  { codigo: 'REPARACION_ARTEFACTOS', nombre: 'Reparación y Mant. de Artefactos', seccionId: 6, seccion: 'Climatización y Cocina', dimension: 'climatizacion', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Servicio Técnico Electromecánico / Gas', costoBase: 0, impactoBase: 5 },
  { codigo: 'FILTRACIONES', nombre: 'Filtraciones, Cubiertas y Zinguería', seccionId: 3, seccion: 'Techos y Cubiertas', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Especialistas en Cubiertas e Impermeabilización', costoBase: 0, impactoBase: 8 },
  { codigo: 'MATAFUEGOS', nombre: 'Matafuegos y Seguridad Siniestral', seccionId: 10, seccion: 'Seguridad contra Incendios', dimension: 'seguridadCritica', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Proveedor Certificado de Extintores e Higiene', costoBase: 0, impactoBase: 6 },
  { codigo: 'PODA_CORTE_PASTO', nombre: 'Poda, Desmalezado y Espacios Verdes', seccionId: 11, seccion: 'Entorno Exterior y Patios', dimension: 'entornoExterior', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'LEVE', cuadrilla: 'Cuadrilla de Espacios Verdes y Arbolado', costoBase: 0, impactoBase: 4 },
  { codigo: 'BOMBA', nombre: 'Bombas Elevadoras y Presurizadoras', seccionId: 7, seccion: 'Provisión de Agua Potable', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Electromecánica y Bobinado Hidráulico', costoBase: 0, impactoBase: 9 },
  { codigo: 'LIMPIEZA_TANQUE', nombre: 'Limpieza y Cloración de Tanques/Cisternas', seccionId: 7, seccion: 'Calidad de Agua y Reserva', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Cuadrilla Bromatológica y Saneamiento Hídrico', costoBase: 0, impactoBase: 8 },
  { codigo: 'MOBILIARIO', nombre: 'Mobiliario Escolar y Carpintería', seccionId: 2, seccion: 'Aulas y Equipamiento', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'LEVE', cuadrilla: 'Carpintería y Restauración de Mobiliario', costoBase: 0, impactoBase: 2 },
  { codigo: 'DESAGOTE', nombre: 'Desagote de Pozos y Cámaras Sépticas', seccionId: 5, seccion: 'Red Cloacal y Efluentes', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'GRAVE', cuadrilla: 'Servicio de Camión Atmosférico Municipal', costoBase: 0, impactoBase: 7 },
  { codigo: 'LIMPIEZA_DESAGUES', nombre: 'Limpieza de Desagües Pluviales y Canaletas', seccionId: 5, seccion: 'Desagües Pluviales', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Cuadrilla de Desobstrucción Hidráulica', costoBase: 0, impactoBase: 4 },
  { codigo: 'OBRA', nombre: 'Obra Mayor / Refacción Estructural Provincial', seccionId: 3, seccion: 'Infraestructura Mayor Edilicia', dimension: 'estructuraCubiertas', frecuenciaHistorica: 0, jurisdiccion: 'PROVINCIA_MAYOR', severidadDefault: 'CRITICA', cuadrilla: 'Dirección de Infraestructura Escolar — Ministerio Prov. Córdoba', costoBase: 0, impactoBase: 18 },
  { codigo: 'CLIMATIZACION', nombre: 'Adquisición de Artefactos de Climatización', seccionId: 6, seccion: 'Confort Térmico Aulas', dimension: 'climatizacion', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'MEDIA', cuadrilla: 'Adquisición e Instalación FoDeMEEP', costoBase: 0, impactoBase: 6 },
  { codigo: 'CAMION_CISTERNA', nombre: 'Asistencia Hídrica por Camión Cisterna', seccionId: 7, seccion: 'Emergencia Hídrica', dimension: 'aguaSaneamiento', frecuenciaHistorica: 0, jurisdiccion: 'FoDeMEEP', severidadDefault: 'CRITICA', cuadrilla: 'Defensa Civil / EMOS Suministro de Emergencia', costoBase: 0, impactoBase: 11 }
];

// 3. Dimensiones del Modelo Matemático IES (0-100)
const DIMENSIONES_IES = [
  { id: 'seguridadCritica', nombre: 'Seguridad de Vida e Instalaciones Críticas', ponderacion: 0.25, secciones: 'Sec. 4 (Gas) + Sec. 9 (Electricidad) + Sec. 10 (Incendio)', descripcion: 'Prevención de riesgos vitales en redes de gas NAG-200, protecciones diferenciales y extinción.' },
  { id: 'aguaSaneamiento', nombre: 'Agua Potable y Saneamiento', ponderacion: 0.20, secciones: 'Sec. 5 (Cloacas) + Sec. 7 (Tanques/Bombas) + Sec. 8 (Sanitarios)', descripcion: 'Salubridad hídrica, continuidad de suministro EMOS, limpieza de cisternas y núcleos sanitarios.' },
  { id: 'estructuraCubiertas', nombre: 'Estructura Edilicia y Cubiertas', ponderacion: 0.18, secciones: 'Sec. 3 (Techos, Filtraciones, Muros, Pisos, Aberturas)', descripcion: 'Integridad física de cubiertas, impermeabilización de losas, mampostería y cerramientos.' },
  { id: 'climatizacion', nombre: 'Climatización y Acondicionamiento Térmico', ponderacion: 0.15, secciones: 'Sec. 6 (Calefactores Tiro Balanceado, Calderas, Ventilación)', descripcion: 'Bienestar térmico invernal/estival y operatividad del parque de calefactores.' },
  { id: 'alimentacionCocina', nombre: 'Espacios de Alimentación y Cocina (PAICOR)', ponderacion: 0.10, secciones: 'Sec. 13 (Cocina, Cámaras Frigoríficas, Termotanques)', descripcion: 'Condiciones bromatológicas y operativas de comedores escolares PAICOR.' },
  { id: 'accesibilidad', nombre: 'Accesibilidad Universal e Inclusión', ponderacion: 0.07, secciones: 'Sec. 12 (Rampas, Sanitarios Adaptados, Circulación)', descripcion: 'Eliminación de barreras arquitectónicas y cumplimiento de Ley de Accesibilidad.' },
  { id: 'entornoExterior', nombre: 'Entorno Exterior, Patios y Perímetro', ponderacion: 0.05, secciones: 'Sec. 11 (Arbolado, Veredas, Cercos Perimetrales)', descripcion: 'Seguridad en patios recreativos, arbolado sin riesgo y cierre perimetral.' }
];

// 4. Coordenadas de respaldo para las 4 escuelas sin GPS en el padrón original
const COORDENADAS_FALLBACK = {
  'ESC-140324200': { lat: -33.0954, lng: -64.3412, barrio: 'Zona Rural Norte' },
  'ESC-140384700': { lat: -33.0621, lng: -64.3185, barrio: 'Ruta Nac. 36 Km 614 (Rural)' },
  'ESC-140512501': { lat: -33.1245, lng: -64.3482, barrio: 'Centro' },
  'ESC-140545603': { lat: -33.1088, lng: -64.3215, barrio: 'Las Ferias' }
};

// 5. Procesar las 126 instituciones del padrón oficial sin datos simulados
const institucionesProcesadas = escuelasRaw.map((esc, idx) => {
  const fb = COORDENADAS_FALLBACK[esc.id];
  const lat = typeof esc.latitud === 'number' && !isNaN(esc.latitud) ? esc.latitud : (fb ? fb.lat : -33.1235);
  const lng = typeof esc.longitud === 'number' && !isNaN(esc.longitud) ? esc.longitud : (fb ? fb.lng : -64.3492);
  const barrioLimpio = (esc.barrio && esc.barrio !== 'Sin dato' && esc.barrio !== 'S/D')
    ? esc.barrio
    : (fb ? fb.barrio : 'Centro');

  const esComun = esc.modalidad === 'Común';

  let m24Raw = esc.matricula2024;
  let m25Raw = esc.matricula2025;
  if (esc.id === 'ESC-140177400') { m24Raw = 326; m25Raw = 402; }
  if (esc.id === 'ESC-140194000') { m24Raw = 473; m25Raw = 491; }
  const matricula25 = m25Raw || m24Raw || 0;
  const matricula24 = m24Raw || matricula25;

  return {
    id: esc.id,
    cue: esc.cue,
    codigoEmp: esc.codigoEmp || `EE064${String(idx).padStart(4, '0')}`,
    codigoInspeccion: esc.codigoInspeccion || '2001-01-04',
    nombre: esc.nombre,
    modalidad: esc.modalidad,
    esModalidadComun: esComun,
    nivel: esc.nivel,
    ambito: esc.ambito,
    categoria: esc.categoria || 'Primera',
    turno: esc.turno || 'Mañana, Tarde',
    barrio: barrioLimpio,
    macrozona: 'Sector C (Centro)',
    domicilio: String(esc.domicilio || '').replace(/,.*$/, '').trim() || 'Río Cuarto',
    latitud: Number(lat.toFixed(6)),
    longitud: Number(lng.toFixed(6)),
    matricula2024: matricula24,
    matricula2025: matricula25,
    alumnosDiscapacidad: esc.alumnosDiscapacidad || 0,
    tieneRampa: Boolean(esc.tieneRampa),
    tieneBanoAdaptado: Boolean(esc.tieneBanoAdaptado),
    tieneSillaRuedas: Boolean(esc.tieneSillaRuedas),
    relevamiento: {
      id: null,
      fecha: null,
      estado: 'SIN_RELEVAR',
      hashIntegridad: null,
      superficieM2: 0,
      aulasTotales: 0,
      calefactoresFuncionando: 0,
      calefactoresAveriados: 0
    },
    ies: {
      puntajeBase: 0,
      factorKillSwitch: 1.0,
      global: 0,
      clasificacion: 'Sin relevar',
      tieneKillSwitch: false,
      motivoKillSwitch: null,
      subindices: {
        seguridadCritica: 0,
        aguaSaneamiento: 0,
        estructuraCubiertas: 0,
        climatizacion: 0,
        alimentacionCocina: 0,
        accesibilidad: 0,
        entornoExterior: 0
      }
    },
    historialIes: [],
    incidencias: []
  };
});

const totalEscuelas = institucionesProcesadas.length;
const totalComun = institucionesProcesadas.filter(i => i.esModalidadComun).length;
const matriculaTotal2025 = institucionesProcesadas.reduce((acc, i) => acc + (i.matricula2025 || 0), 0);
const alumnosDiscapacidadTotal = institucionesProcesadas.reduce((acc, i) => acc + (i.alumnosDiscapacidad || 0), 0);

const bbddCompleta = {
  metadata: {
    programa: 'FoDeMEEP Río Cuarto — Fondo para la Descentralización del Mantenimiento de Edificios Escolares Provinciales',
    organismo: 'Dirección de Estadística, Control de Calidad y Procesos · Secretaría de Gestión y Participación Ciudadana · Gobierno de Río Cuarto',
    fechaCorte: '2026-10-14',
    periodo: 'Octubre 2026',
    versionMotorIes: '2.4.0-RCU',
    totalInstitucionesPublicas: totalEscuelas,
    totalModalidadComun: totalComun,
    matriculaTotalAlcanzada: matriculaTotal2025,
    alumnosDiscapacidadTotal,
    promedioIesGlobal: 0,
    conteoSemaforo: {
      Optimo: 0,
      Bueno: 0,
      Regular: 0,
      Critico: 0,
      SinRelevar: totalEscuelas
    },
    alertasKillSwitchActivas: 0,
    demarcacionCompetencias: {
      fodemeepMunicipal: {
        IncidenciasActivas: 0,
        PresupuestoEstimadoARS: 0,
        IntervencionesHistoricas: 0,
        Alcance: 'Mantenimiento preventivo y correctivo descentralizado: plomería, electricidad, tableros, gas NAG-200, calefactores, filtraciones localizadas, herrería, limpieza de tanques, desinfección, matafuegos y desmalezado.'
      },
      provinciaMayor: {
        IncidenciasActivas: 0,
        PresupuestoEstimadoARS: 0,
        IntervencionesHistoricas: 0,
        Alcance: 'Obras mayores de infraestructura escolar provincial: recambio estructural de cubiertas de losa/chapa, ampliación de aulas, construcción de núcleos sanitarios nuevos, recalce de fundaciones y tendido integral de redes de gas.'
      }
    }
  },
  dimensionesIes: DIMENSIONES_IES,
  catalogoIncidencias: CATALOGO_INCIDENCIAS,
  serieHistoricaGlobal: [],
  instituciones: institucionesProcesadas
};

const outDirs = [
  path.join(__dirname, '..', 'rcu-tablero-template', 'datos'),
  path.join(__dirname, '..', 'rcu_template', 'datos'),
  path.join(__dirname, '..', 'public', 'monitor', 'datos')
];

for (const dir of outDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'bbdd-fodemeep.json'), JSON.stringify(bbddCompleta, null, 2), 'utf8');
}

console.log('✓ BBDD limpia (sin datos de ejemplo) generada con éxito:');
console.log(`  - Instituciones del padrón oficial: ${totalEscuelas} (${totalComun} Modalidad Común)`);
console.log(`  - Relevamientos simulados / incidencias de ejemplo: 0`);
