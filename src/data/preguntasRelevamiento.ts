import type { TipoIncidenciaOficial, NivelCriticidad, JurisdiccionResolucion, RubricaCriterio } from '../types/fodemep';

export interface OpcionPregunta {
  id: string;
  label: string;
  generaIncidencia?: {
    tipo: TipoIncidenciaOficial;
    criticidad: NivelCriticidad;
    jurisdiccion: JurisdiccionResolucion;
    puntosImpacto: number;
    descripcion: string;
    esKillSwitch?: boolean;
    motivoAlerta?: string;
  };
}

export interface PreguntaDef {
  id: number; // Número exacto del formulario PDF (1 a 166)
  texto: string;
  tipo: 'text' | 'number' | 'single_choice' | 'multiple_choice' | 'rating_5';
  seccionId: number;
  placeholder?: string;
  opciones?: OpcionPregunta[];
  rubrica?: RubricaCriterio; // Guía técnica para criterio homogéneo
  esCritica?: boolean;
  requerido?: boolean;
}

export interface SeccionDef {
  id: number;
  numero: number;
  titulo: string;
  icono: string;
  descripcion: string;
  preguntas: PreguntaDef[];
}

export const SECCIONES_RELEVAMIENTO: SeccionDef[] = [
  {
    id: 1,
    numero: 1,
    titulo: 'Datos del Relevamiento y la Institución',
    icono: 'Building2',
    descripcion: 'Complete estos datos institucionales antes de iniciar el recorrido por el edificio.',
    preguntas: [
      { id: 1, texto: 'Nombre del Establecimiento / CUE', tipo: 'text', seccionId: 1, placeholder: 'Ej: Esc. Normal Superior Justo José de Urquiza - CUE: 1400123-00', requerido: true },
      { id: 2, texto: 'Nombre y Apellido del/de la Director/a o Responsable institucional', tipo: 'text', seccionId: 1, placeholder: 'Ej: Prof. María Eugenia Rossi' },
      { id: 3, texto: 'Técnico/a responsable del relevamiento', tipo: 'text', seccionId: 1, placeholder: 'Ej: Arq. Técnico Municipal FoDeMEEP', requerido: true },
      { id: 4, texto: 'Fecha del relevamiento', tipo: 'text', seccionId: 1, placeholder: 'DD/MM/AAAA' },
      { id: 5, texto: 'Teléfono de contacto institucional', tipo: 'text', seccionId: 1, placeholder: '0358-XXXXXXX' },
      { id: 6, texto: 'Correo electrónico institucional', tipo: 'text', seccionId: 1, placeholder: 'escuela@cba.gov.ar' },
    ],
  },
  {
    id: 2,
    numero: 2,
    titulo: 'Sobre el Establecimiento y Espacios',
    icono: 'LayoutGrid',
    descripcion: 'Información general sobre los espacios, turnos, matrícula y superficies.',
    preguntas: [
      { id: 7, texto: 'Cantidad total de espacios/ambientes del edificio', tipo: 'number', seccionId: 2, placeholder: 'Total de aulas, oficinas, baños, cocina, SUM, etc.' },
      { id: 8, texto: 'Cantidad total de aulas del edificio', tipo: 'number', seccionId: 2, placeholder: 'Total de aulas' },
      {
        id: 9,
        texto: '¿Todas las aulas se están utilizando actualmente?',
        tipo: 'single_choice',
        seccionId: 2,
        opciones: [
          { id: 'si', label: 'Sí, todas en uso activo' },
          { id: 'no', label: 'No, hay aulas clausuradas o en desuso', generaIncidencia: { tipo: 'MOBILIARIO', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Aulas sin uso activo por falta de acondicionamiento' } },
        ],
      },
      { id: 10, texto: 'Cantidad de aulas en uso activo', tipo: 'number', seccionId: 2 },
      {
        id: 11,
        texto: 'Otros espacios existentes en la escuela',
        tipo: 'multiple_choice',
        seccionId: 2,
        opciones: [
          { id: 'dir', label: 'Dirección' },
          { id: 'vicedir', label: 'Vicedirección' },
          { id: 'sec', label: 'Secretaría' },
          { id: 'prof', label: 'Sala de Profesores' },
          { id: 'coc', label: 'Cocina' },
          { id: 'com', label: 'Comedor' },
          { id: 'sum', label: 'Salón de Usos Múltiples (SUM)' },
          { id: 'bib', label: 'Biblioteca' },
          { id: 'lab', label: 'Laboratorio' },
          { id: 'comp', label: 'Sala de computación' },
          { id: 'tal', label: 'Taller' },
          { id: 'gim', label: 'Gimnasio / Cancha cubierta' },
          { id: 'dep', label: 'Depósito / Pañol' },
          { id: 'cald', label: 'Sala de máquinas / calderas' },
        ],
      },
      {
        id: 15,
        texto: 'Antigüedad aproximada del edificio',
        tipo: 'single_choice',
        seccionId: 2,
        opciones: [
          { id: 'ant_1', label: 'Menos de 10 años' },
          { id: 'ant_2', label: '10 a 30 años' },
          { id: 'ant_3', label: '30 a 50 años' },
          { id: 'ant_4', label: 'Más de 50 años' },
          { id: 'ant_5', label: 'Más de 100 años (Patrimonial)' },
        ],
      },
      { id: 16, texto: 'Superficie cubierta aproximada (m²)', tipo: 'number', seccionId: 2, placeholder: 'm² cubiertos' },
      { id: 18, texto: 'Matrícula aproximada de alumnos', tipo: 'number', seccionId: 2, placeholder: 'Total de alumnos' },
    ],
  },
  {
    id: 3,
    numero: 3,
    titulo: 'Estructura Edilicia — Pisos, Paredes y Techos',
    icono: 'Home',
    descripcion: 'Evaluación técnica del estado constructivo. Se incluye guía de homologación.',
    preguntas: [
      {
        id: 23,
        texto: 'Estado general de los pisos (aulas y espacios comunes)',
        tipo: 'rating_5',
        seccionId: 3,
        rubrica: {
          excelente: 'Sin desniveles, piezas perfectamente adheridas, zócalos sanos.',
          bueno: 'Desgaste superficial por tránsito normal, sin piezas sueltas ni tropiezos.',
          regular: 'Algunas baldosas fisuradas o despegadas, desgaste localizado sin peligro grave.',
          malo: 'Zonas extensas con baldosas faltantes o contrapiso expuesto.',
          critico: 'Hundimientos o desniveles graves con peligro inminente de caídas.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Desgaste y piezas flojas en pisos' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Baldosas faltantes y roturas generalizadas' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 7, descripcion: 'Hundimiento severo de piso con peligro de accidente' } },
        ],
      },
      {
        id: 25,
        texto: '¿Se observan pisos rotos, con desniveles o riesgo de tropiezo/caída?',
        tipo: 'single_choice',
        seccionId: 3,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Riesgo de tropiezo o desnivel peligroso en solado' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 27,
        texto: 'Estado general de paredes y muros (humedad, grietas, revoques)',
        tipo: 'rating_5',
        seccionId: 3,
        rubrica: {
          excelente: 'Mampostería firme, pintura homogénea, sin humedad ni fisuras.',
          bueno: 'Marcas de roce o suciedad leve sin daños en revoque.',
          regular: 'Pintura cuarteada, salitre o humedad superficial de condensación.',
          malo: 'Humedad ascendente continua, revoque desprendiéndose o fisuras notorias.',
          critico: 'Fisuras estructurales pasantes, desmoronamiento o peligro de colapso.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'PINTURA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Pintura deteriorada y humedad superficial en muros' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Revoques desprendidos y humedad ascendente en paredes' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Fallas estructurales severas en muros portantes' } },
        ],
      },
      {
        id: 28,
        texto: '¿Se observan grietas estructurales o fisuras de consideración?',
        tipo: 'single_choice',
        seccionId: 3,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Grietas estructurales activas en muros', esKillSwitch: true, motivoAlerta: 'Grietas estructurales pasantes' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 30,
        texto: 'Estado general de techos y cubiertas',
        tipo: 'rating_5',
        seccionId: 3,
        rubrica: {
          excelente: 'Estanqueidad absoluta, aislación térmica correcta, canaletas impecables.',
          bueno: 'Sin filtraciones, mantenimiento de impermeabilización al día.',
          regular: 'Aislación envejecida, manchas secas pretéritas, sin goteras hoy.',
          malo: 'Filtraciones activas con lluvia, membranas desprendidas o chapas oxidadas.',
          critico: 'Entrada masiva de agua, colapso parcial de cubierta o riesgo de desprendimiento.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'FILTRACIONES', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Mantenimiento preventivo en cubiertas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'FILTRACIONES', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Goteras activas y membranas rotas en techos' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 10, descripcion: 'Peligro de colapso de techos o filtración masiva' } },
        ],
      },
      {
        id: 32,
        texto: '¿Existen filtraciones de agua de lluvia?',
        tipo: 'single_choice',
        seccionId: 3,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'FILTRACIONES', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Filtración activa de lluvia en sectores de la escuela' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 34,
        texto: '¿Se observa riesgo de desprendimiento de revoque, mampostería o material de cubierta?',
        tipo: 'single_choice',
        seccionId: 3,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 8, descripcion: 'Peligro de caída de mampostería o cielorraso', esKillSwitch: true, motivoAlerta: 'Riesgo inminente de desprendimiento de revoques/cielorraso' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 36,
        texto: 'Estado de aberturas (puertas y ventanas): marcos, cierres, vidrios',
        tipo: 'rating_5',
        seccionId: 3,
        rubrica: {
          excelente: 'Aberturas escuadradas, vidrios de seguridad sanos, cerraduras suaves.',
          bueno: 'Cierre correcto, vidrios completos, lubricación normal.',
          regular: 'Cerraduras duras, picaportes flojos o burletes faltantes.',
          malo: 'Hojas trabadas o desencajadas, vidrios partidos.',
          critico: 'Hojas caídas, vidrios rotos con bordes cortantes expuestos.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Ajuste de cerrajería y bisagras en aberturas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Aberturas trabadas y vidrios rajados' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Peligro de corte por vidrios astillados o puertas caídas' } },
        ],
      },
      { id: 38, texto: 'Cantidad aproximada de vidrios rotos o faltantes', tipo: 'number', seccionId: 3, placeholder: 'Ej: 4' },
      {
        id: 39,
        texto: 'Estado de cerramientos perimetrales (rejas, muros, portones de acceso)',
        tipo: 'rating_5',
        seccionId: 3,
        rubrica: {
          excelente: 'Cerco perimetral sólido, portones con pasadores seguros, pintura anticorrosiva.',
          bueno: 'Sin aberturas vulnerables, estabilidad estructural adecuada.',
          regular: 'Pintura oxidada en tramos inferiores o portón pesado.',
          malo: 'Rejas dobladas, portón con riesgo de descarrilamiento o muro fisurado.',
          critico: 'Huecos de libre acceso a la calle o portón caído con riesgo de aplastamiento.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Mantenimiento preventivo en cerramientos' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Portones caídos o rejas vencidas' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Falla perimetral grave con inseguridad escolar' } },
        ],
      },
    ],
  },
  {
    id: 4,
    numero: 4,
    titulo: 'Instalaciones de Gas',
    icono: 'Flame',
    descripcion: 'Relevamiento visual de seguridad en gas. Reporte inmediato ante indicios de riesgo.',
    preguntas: [
      {
        id: 42,
        texto: '¿La institución cuenta con instalación de gas?',
        tipo: 'single_choice',
        seccionId: 4,
        opciones: [
          { id: 'gn', label: 'Sí, gas natural' },
          { id: 'ge', label: 'Sí, gas envasado (garrafa)' },
          { id: 'ambas', label: 'Ambas' },
          { id: 'no', label: 'No posee' },
        ],
      },
      {
        id: 43,
        texto: '¿La instalación cuenta con certificación/habilitación vigente?',
        tipo: 'single_choice',
        seccionId: 4,
        opciones: [
          { id: 'si', label: 'Sí, matriculado al día' },
          { id: 'no', label: 'No / En trámite', generaIncidencia: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Instalación de gas sin habilitación vigente' } },
          { id: 'ns', label: 'No se pudo verificar' },
        ],
      },
      {
        id: 45,
        texto: 'Estado general visual de cañerías y conexiones de gas visibles',
        tipo: 'rating_5',
        seccionId: 4,
        rubrica: {
          excelente: 'Cañería epoxi amarilla impecable, engrapada firme cada metro, sin corrosión.',
          bueno: 'Fijaciones firmes, sin corrosión, buen estado general.',
          regular: 'Pintura saltada superficialmente, sin deformaciones.',
          malo: 'Cañerías flojas, material no reglamentario o corrosión visible.',
          critico: 'Conexiones precarias, caños doblados o riesgo inminente de fuga.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'GAS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Pintura y sujeciones de caños de gas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Cañerías de gas corroídas o antirreglamentarias' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 10, descripcion: 'Peligro grave en tendido de gas', esKillSwitch: true, motivoAlerta: 'Riesgo grave en instalación de gas' } },
        ],
      },
      {
        id: 46,
        texto: '¿Se han detectado olores a gas o pérdidas reportadas en el último año?',
        tipo: 'single_choice',
        seccionId: 4,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 12, descripcion: 'Olor a gas o fuga reportada activa', esKillSwitch: true, motivoAlerta: 'Pérdida o fuga de gas reportada' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 51,
        texto: 'Llaves de paso: ¿cada artefacto tiene su llave propia, accesible y en buen estado?',
        tipo: 'single_choice',
        seccionId: 4,
        opciones: [
          { id: 'todos', label: 'Sí, todos con llave propia accesible y operativa' },
          { id: 'algunos', label: 'Algunos no tienen o están trabadas', generaIncidencia: { tipo: 'GAS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Faltan llaves de paso de gas individuales' } },
          { id: 'mayoria', label: 'La mayoría carece de llave o está inaccesible', generaIncidencia: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Falta generalizada de llaves de corte de gas' } },
        ],
      },
      {
        id: 52,
        texto: 'Ventilación y evacuación de gases en locales con artefactos a gas',
        tipo: 'single_choice',
        seccionId: 4,
        esCritica: true,
        opciones: [
          { id: 'adecuada', label: 'Adecuadas en todos los locales (rejillas libres y tiro balanceado)' },
          { id: 'deficientes', label: 'Deficientes u obstruidas en algunos locales', generaIncidencia: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Rejillas de ventilación de gas tapadas o deterioradas' } },
          { id: 'inexistentes', label: 'Inexistentes en locales con artefactos', generaIncidencia: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 9, descripcion: 'Locales con artefactos sin ventilación reglamentaria', esKillSwitch: true, motivoAlerta: 'Peligro de monóxido de carbono por falta de ventilación' } },
        ],
      },
    ],
  },
  {
    id: 5,
    numero: 5,
    titulo: 'Cloacas y Desagües',
    icono: 'Droplets',
    descripcion: 'Estado del sistema de desagües cloacales y pluviales del establecimiento.',
    preguntas: [
      {
        id: 57,
        texto: 'Tipo de desagüe cloacal',
        tipo: 'single_choice',
        seccionId: 5,
        opciones: [
          { id: 'red', label: 'Red cloacal pública' },
          { id: 'pozo', label: 'Cámara séptica / pozo absorbente' },
          { id: 'otro', label: 'Otro' },
        ],
      },
      {
        id: 58,
        texto: 'Estado general del sistema de desagüe cloacal',
        tipo: 'rating_5',
        seccionId: 5,
        rubrica: {
          excelente: 'Evacuación instantánea, cámaras de inspección limpias, sin olores.',
          bueno: 'Descarga normal sin desbordes.',
          regular: 'Descarga algo lenta en sanitarios de alta demanda.',
          malo: 'Desbordes ocasionales, olores frecuentes, requiere desagote.',
          critico: 'Colapso total del pozo o red con desborde en patios o baños clausurados.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Descargas lentas en sanitarios' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'DESAGOTE', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Saturación cloacal recurrente' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Colapso total de sistema cloacal' } },
        ],
      },
      {
        id: 59,
        texto: '¿Se registran obstrucciones, malos olores o desbordes frecuentes?',
        tipo: 'single_choice',
        seccionId: 5,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'DESAGOTE', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Desbordes u olores cloacales en el edificio' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 60,
        texto: 'Estado de desagües pluviales y canaletas',
        tipo: 'rating_5',
        seccionId: 5,
        rubrica: {
          excelente: 'Canaletas limpias de hojas, bajadas pluviales directas al cordón o pozo.',
          bueno: 'Evacuación sin problemas en lluvias intensas.',
          regular: 'Acumulación menor de hojas o suciedad en rejillas.',
          malo: 'Canaletas desfondadas o desprendidas con caída de agua libre.',
          critico: 'Anegamiento de aulas o patios por falta total de evacuación pluvial.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Canaletas con hojas y suciedad' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Canaletas pluviales desprendidas o rotas' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 6, descripcion: 'Falta total de drenaje pluvial con anegamiento' } },
        ],
      },
    ],
  },
  {
    id: 6,
    numero: 6,
    titulo: 'Climatización y Ventilación (Calefacción y Aire)',
    icono: 'Thermometer',
    descripcion: 'Padrón de estufas, calderas, radiadores y ventiladores.',
    preguntas: [
      { id: 66, texto: 'Cantidad TOTAL de equipos de calefacción en funcionamiento', tipo: 'number', seccionId: 6, placeholder: 'Equipos activos' },
      { id: 67, texto: 'De ese total: cantidad de calefactores a gas en funcionamiento', tipo: 'number', seccionId: 6 },
      { id: 68, texto: 'De ese total: cantidad de estufas / calefactores eléctricos en funcionamiento', tipo: 'number', seccionId: 6 },
      {
        id: 69,
        texto: 'Cantidad de equipos de calefacción fuera de servicio (a reparar o reemplazar)',
        tipo: 'number',
        seccionId: 6,
        placeholder: 'Equipos rotos',
      },
      {
        id: 70,
        texto: '¿Todas las aulas y espacios cuentan con calefacción adecuada?',
        tipo: 'single_choice',
        seccionId: 6,
        opciones: [
          { id: 'si', label: 'Sí, la cobertura es completa' },
          { id: 'no', label: 'No, faltan calefactores en algunas aulas/espacios', generaIncidencia: { tipo: 'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Faltan calefactores en aulas activas' } },
        ],
      },
      { id: 80, texto: 'Cantidad TOTAL de ventiladores (techo/pared) instalados', tipo: 'number', seccionId: 6 },
      { id: 81, texto: 'De ese total: cantidad de ventiladores en funcionamiento', tipo: 'number', seccionId: 6 },
      { id: 82, texto: 'Cantidad TOTAL de aires acondicionados instalados', tipo: 'number', seccionId: 6 },
      { id: 83, texto: 'De ese total: cantidad de aires acondicionados en funcionamiento', tipo: 'number', seccionId: 6 },
    ],
  },
  {
    id: 7,
    numero: 7,
    titulo: 'Sistema de Agua, Tanques y Bombas',
    icono: 'Waves',
    descripcion: 'Garantía de salubridad del agua potable y bombas en funcionamiento.',
    preguntas: [
      { id: 87, texto: 'Cantidad de tanques elevados / de reserva', tipo: 'number', seccionId: 7 },
      { id: 88, texto: 'Cantidad de cisternas (subterráneas o de piso)', tipo: 'number', seccionId: 7 },
      {
        id: 89,
        texto: 'Estado de conservación de tanques y cisternas',
        tipo: 'rating_5',
        seccionId: 7,
        rubrica: {
          excelente: 'Tanque limpio, estructura firme, tapa hermética sellada, limpieza <6 meses.',
          bueno: 'Sin filtraciones, estructura sana, tapa colocada.',
          regular: 'Requiere limpieza de rutina, accesorios con sarro.',
          malo: 'Fisuras leves, tapa rota o desajustada con ingreso de polvo.',
          critico: 'Deterioro estructural grave de torre, riesgo de caída o agua contaminada.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'LIMPIEZA DE TANQUE/CISTERNA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Limpieza y desinfección preventiva de tanques' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'LIMPIEZA DE TANQUE/CISTERNA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Fisuras o tapas deterioradas en tanques' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 10, descripcion: 'Riesgo de colapso de torre o contaminación grave de agua', esKillSwitch: true, motivoAlerta: 'Riesgo hídrico y sanitario en tanques' } },
        ],
      },
      {
        id: 90,
        texto: '¿Todos los tanques/cisternas cuentan con tapa de cierre hermético?',
        tipo: 'single_choice',
        seccionId: 7,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí, todas selladas y herméticas' },
          { id: 'no', label: 'No, están destapados (riesgo sanitario inminente)', generaIncidencia: { tipo: 'PLOMERIA', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 7, descripcion: 'Tanques de agua sin tapa hermética reglamentaria', esKillSwitch: true, motivoAlerta: 'Tanques de agua potable sin tapa' } },
          { id: 'algunos', label: 'Algunos no cuentan con tapa adecuada', generaIncidencia: { tipo: 'PLOMERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Ciertas reservas de agua sin tapa adecuada' } },
        ],
      },
      {
        id: 91,
        texto: 'Cantidad de bombas de agua en funcionamiento actualmente',
        tipo: 'single_choice',
        seccionId: 7,
        opciones: [
          { id: 'b_0', label: '0 (Sin bombas funcionando)', generaIncidencia: { tipo: 'BOMBA', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 8, descripcion: 'Sin bomba en servicio: falta de agua inminente', esKillSwitch: true, motivoAlerta: 'Falla total del sistema de bombeo de agua' } },
          { id: 'b_1', label: '1 bomba' },
          { id: 'b_2', label: '2 bombas' },
          { id: 'b_3', label: '3 o más bombas' },
        ],
      },
      {
        id: 93,
        texto: 'Estado general del sistema de bombeo',
        tipo: 'rating_5',
        seccionId: 7,
        rubrica: {
          excelente: 'Automático funcionando, bombas alternadas, silenciosas, sin fugas.',
          bueno: 'Bombeo eficiente sin calentamiento anormal.',
          regular: 'Ruidos mecánicos de rodamientos o automático manualizado.',
          malo: 'Pérdida continua de agua por prensaestopas, recalentamiento.',
          critico: 'Bomba quemada o trabada, imposibilidad de llenar tanques.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'BOMBA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Bomba con ruidos o automático manual' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'BOMBA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Pérdida en sello mecánico de bomba' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'BOMBA', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 8, descripcion: 'Electrobomba quemada o trabada' } },
        ],
      },
    ],
  },
  {
    id: 8,
    numero: 8,
    titulo: 'Sanitarios, Griferías y Mesadas',
    icono: 'Bath',
    descripcion: 'Padrón de inodoros, mochilas, canillas y pérdidas continuas.',
    preguntas: [
      { id: 98, texto: 'Cantidad TOTAL de inodoros o espacios destinados', tipo: 'number', seccionId: 8 },
      { id: 99, texto: 'De ese total: cantidad de inodoros en funcionamiento', tipo: 'number', seccionId: 8 },
      { id: 101, texto: 'Cantidad de mochilas/depósitos en estado REGULAR o MALO (pierden agua o rotos)', tipo: 'number', seccionId: 8 },
      { id: 103, texto: 'Cantidad TOTAL de mingitorios', tipo: 'number', seccionId: 8 },
      { id: 104, texto: 'De ese total: mingitorios en funcionamiento', tipo: 'number', seccionId: 8 },
      {
        id: 106,
        texto: 'Estado general de las canillas/griferías en todo el establecimiento',
        tipo: 'rating_5',
        seccionId: 8,
        rubrica: {
          excelente: '100% canillas estancas, volantes completos, corte instantáneo.',
          bueno: 'Sin goteos visibles, griferías firmes.',
          regular: 'Goteos leves en 1 o 2 canillas secundarias.',
          malo: 'Pérdidas continuas en múltiples canillas, volantes zafados o faltantes.',
          critico: 'Desperdicio masivo de agua por canillas rotas o faltantes arrancadas.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'PLOMERIA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Goteos leves en canillas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'PLOMERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Canillas con pérdidas continuas y volantes rotos' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'PLOMERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Faltante masivo de griferías con desperdicio de agua' } },
        ],
      },
      { id: 108, texto: 'Cantidad estimada de canillas que necesitan recambio urgente', tipo: 'number', seccionId: 8, placeholder: 'Ej: 8' },
    ],
  },
  {
    id: 9,
    numero: 9,
    titulo: 'Iluminación y Electricidad Interna',
    icono: 'Zap',
    descripcion: 'Seguridad en tableros, disyuntor diferencial, térmicas y luminarias.',
    preguntas: [
      {
        id: 112,
        texto: 'Tipo de iluminación predominante en aulas y pasillos',
        tipo: 'single_choice',
        seccionId: 9,
        opciones: [
          { id: 'led', label: 'Tubos LED / Plafones LED' },
          { id: 'fluor', label: 'Tubos fluorescentes antiguos (con arrancador/reactancia)' },
          { id: 'foco', label: 'Lámparas LED / Focos comunes' },
        ],
      },
      {
        id: 113,
        texto: 'Estado de la iluminación interna',
        tipo: 'rating_5',
        seccionId: 9,
        rubrica: {
          excelente: '100% artefactos LED operativos, iluminación uniforme y sin zumbidos.',
          bueno: 'Muy buena cobertura en aulas y pasillos.',
          regular: 'Focos quemados (<10%), iluminación algo tenue en rincones.',
          malo: 'Aulas a oscuras por tubos quemados, parpadeos molestos.',
          critico: 'Instalación peligrosa con artefactos colgando de cables.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Tubos quemados en aulas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Falta general de luminarias en pasillos y aulas' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 7, descripcion: 'Artefactos de iluminación con peligro eléctrico' } },
        ],
      },
      { id: 114, texto: 'Cantidad aproximada TOTAL de artefactos de iluminación instalados', tipo: 'number', seccionId: 9 },
      { id: 115, texto: 'De ese total: cantidad aproximada de artefactos/tubos quemados a reemplazar', tipo: 'number', seccionId: 9 },
      {
        id: 116,
        texto: 'Estado de llaves de luz y tomacorrientes en aulas',
        tipo: 'rating_5',
        seccionId: 9,
        rubrica: {
          excelente: 'Tapas firmes, módulos protegidos, tomacorrientes con obturador.',
          bueno: 'En funcionamiento sin holguras.',
          regular: 'Tapas flojas o módulos gastados sin chispazos.',
          malo: 'Tomacorrientes rotos, sueltos o empotramientos cedidos.',
          critico: 'Cables bajo tensión asomando o signos de fogonazo/chispas al alcance de niños.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Tapas de luz flojas' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Tomacorrientes rotos o sueltos' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 8, descripcion: 'Tomacorrientes con chispazos o cables accesibles', esKillSwitch: true, motivoAlerta: 'Peligro de electrocución en tomas' } },
        ],
      },
      {
        id: 117,
        texto: 'Estado general del tablero eléctrico principal',
        tipo: 'rating_5',
        seccionId: 9,
        rubrica: {
          excelente: 'Gabinete metálico reglamentario cerrado con llave, contratapa cubrebornes, peines de distribución y rotulación.',
          bueno: 'Térmicas normalizadas en orden, gabinete sano.',
          regular: 'Falta rotulación o desorden de cables sin bornes expuestos.',
          malo: 'Gabinete sin puerta, sobrecalentamiento o térmicas puenteadas.',
          critico: 'Riesgo inminente: bornes vivos sin protección, óxido o quemaduras.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Tablero eléctrico desordenado sin rotular' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Tablero sin puerta o térmicas sobrecargadas' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 10, descripcion: 'Tablero en estado peligroso con bornes vivos expuestos' } },
        ],
      },
      {
        id: 118,
        texto: '¿Posee disyuntor diferencial y llaves térmicas en funcionamiento?',
        tipo: 'single_choice',
        seccionId: 9,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí, disyuntor probado con botón de test' },
          { id: 'no', label: 'No posee disyuntor (peligro letal para las personas)', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 12, descripcion: 'Ausencia de disyuntor diferencial en tablero principal', esKillSwitch: true, motivoAlerta: 'Peligro letal: Tablero sin disyuntor diferencial' } },
        ],
      },
      {
        id: 119,
        texto: '¿Se observan cables sueltos, empalmes expuestos o instalaciones improvisadas?',
        tipo: 'single_choice',
        seccionId: 9,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FODEMEP', puntosImpacto: 10, descripcion: 'Cables bajo tensión expuestos o empalmes con cinta aisladora floja', esKillSwitch: true, motivoAlerta: 'Cables bajo tensión expuestos' } },
          { id: 'no', label: 'No' },
        ],
      },
    ],
  },
  {
    id: 10,
    numero: 10,
    titulo: 'Seguridad, Matafuegos y Evacuación',
    icono: 'ShieldAlert',
    descripcion: 'Equipos contra incendio, salidas de emergencia y vías de evacuación.',
    preguntas: [
      { id: 126, texto: 'Cantidad total de matafuegos en la escuela', tipo: 'number', seccionId: 10 },
      {
        id: 127,
        texto: '¿Cuentan con la carga y oblea al día?',
        tipo: 'single_choice',
        seccionId: 10,
        opciones: [
          { id: 'si', label: 'Sí, todas con carga y oblea vigente' },
          { id: 'no', label: 'No, están vencidos', generaIncidencia: { tipo: 'MATAFUEGOS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Matafuegos con carga y oblea vencida' } },
          { id: 'algunos', label: 'Algunos vencidos', generaIncidencia: { tipo: 'MATAFUEGOS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 3, descripcion: 'Matafuegos con vencimiento parcial' } },
        ],
      },
      {
        id: 136,
        texto: '¿El edificio cuenta con salidas de emergencia?',
        tipo: 'single_choice',
        seccionId: 10,
        opciones: [
          { id: 'si', label: 'Sí, señalizadas, libres y con barral antipánico' },
          { id: 'deficiente', label: 'Sí, pero con deficiencias (con candado, trabadas o sin señalizar)', generaIncidencia: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 5, descripcion: 'Salidas de emergencia trabadas o sin barral antipánico' } },
          { id: 'no', label: 'No cuenta con salidas de emergencia (solo puerta principal)', generaIncidencia: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 5, descripcion: 'Sin salida de evacuación reglamentaria' } },
        ],
      },
    ],
  },
  {
    id: 11,
    numero: 11,
    titulo: 'Espacios Verdes y Exteriores',
    icono: 'Trees',
    descripcion: 'Patios recreativos, arbolado y veredas públicas.',
    preguntas: [
      {
        id: 141,
        texto: '¿Posee espacios verdes o con vegetación?',
        tipo: 'single_choice',
        seccionId: 11,
        opciones: [{ id: 'si', label: 'Sí' }, { id: 'no', label: 'No' }],
      },
      {
        id: 143,
        texto: '¿Existen árboles con riesgo de caída de ramas o desraizamiento?',
        tipo: 'single_choice',
        seccionId: 11,
        esCritica: true,
        opciones: [
          { id: 'si', label: 'Sí', generaIncidencia: { tipo: 'PODA/CORTE DE PASTO', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Árboles de gran porte con ramas secas sobre patios o techos' } },
          { id: 'no', label: 'No' },
        ],
      },
      {
        id: 144,
        texto: 'Estado de veredas y accesos peatonales externos',
        tipo: 'rating_5',
        seccionId: 11,
        rubrica: {
          excelente: 'Veredas uniformes, sin desniveles, cazuelas protegidas.',
          bueno: 'Tránsito peatonal seguro sin riesgo.',
          regular: 'Algunas baldosas levantadas por raíces sin obstrucción severa.',
          malo: 'Piedras sueltas, pozos o desniveles peligrosos para alumnos.',
          critico: 'Vereda totalmente destruida o intransitable.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Baldosas sueltas en vereda externa' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Vereda rota con pozos y peligro de caída' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Destrucción masiva de vereda perimetral' } },
        ],
      },
    ],
  },
  {
    id: 12,
    numero: 12,
    titulo: 'Accesibilidad Universal',
    icono: 'Accessibility',
    descripcion: 'Rampas, desniveles, anchos de paso y sanitarios adaptados.',
    preguntas: [
      {
        id: 148,
        texto: '¿El establecimiento cuenta con rampas de acceso a nivel de calle o vereda?',
        tipo: 'single_choice',
        seccionId: 12,
        opciones: [
          { id: 'si', label: 'Sí' },
          { id: 'no', label: 'No', generaIncidencia: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Falta rampa de acceso para sillas de ruedas' } },
        ],
      },
      {
        id: 152,
        texto: '¿El establecimiento cuenta con al menos un baño adaptado para personas con movilidad reducida?',
        tipo: 'single_choice',
        seccionId: 12,
        opciones: [
          { id: 'si', label: 'Sí' },
          { id: 'no', label: 'No', generaIncidencia: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 6, descripcion: 'Falta sanitario adaptado para personas con discapacidad' } },
        ],
      },
    ],
  },
  {
    id: 13,
    numero: 13,
    titulo: 'Equipamiento de Cocina y Comedor (PAICOR)',
    icono: 'Utensils',
    descripcion: 'Equipamiento de preparación de alimentos, refrigeración y agua caliente.',
    preguntas: [
      {
        id: 159,
        texto: 'Estado de Cocina / Anafe',
        tipo: 'rating_5',
        seccionId: 13,
        rubrica: {
          excelente: 'Quemadores limpios, termocuplas de seguridad activas, encendido perfecto.',
          bueno: 'Operativo y limpio sin pérdidas de gas.',
          regular: 'Quemador sucio o perilla floja.',
          malo: 'Quemadores tapados, sin termocupla o con olor.',
          critico: 'Equipo fuera de servicio o fuga directa de gas en cocina.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Mantenimiento de hornallas en cocina PAICOR' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Falla en termocuplas o quemadores de cocina' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Cocina industrial fuera de servicio' } },
          { id: 'no', label: 'No posee' },
        ],
      },
      {
        id: 162,
        texto: 'Estado de Heladera / Freezer',
        tipo: 'rating_5',
        seccionId: 13,
        rubrica: {
          excelente: 'Temperatura óptima (<4°C), burletes sellados, motor silencioso.',
          bueno: 'Enfría correctamente, buen estado higiénico.',
          regular: 'Burlete con desgaste o escarcha excesiva.',
          malo: 'Enfriamiento deficiente o motor funcionando continuo.',
          critico: 'Heladera o freezer quemado sin frío (riesgo bromatológico).',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Burletes gastados en heladera' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Pérdida de frío en heladera/freezer' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Heladera o freezer fuera de servicio' } },
          { id: 'no', label: 'No posee' },
        ],
      },
      {
        id: 163,
        texto: 'Estado de Termotanques / Calefones (Agua caliente)',
        tipo: 'rating_5',
        seccionId: 13,
        rubrica: {
          excelente: 'Termotanque nuevo o desincrustado, válvula de alivio operativa, tiro balanceado.',
          bueno: 'Agua caliente continua y segura.',
          regular: 'Encendido de piloto difícil o agua tibia.',
          malo: 'Goteo de válvula o combustión amarilla.',
          critico: 'Pérdida de gas o tanque pinchado con pérdida continua de agua.',
        },
        opciones: [
          { id: 'exc', label: 'Excelente' },
          { id: 'bue', label: 'Bueno' },
          { id: 'reg', label: 'Regular', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FODEMEP', puntosImpacto: 2, descripcion: 'Limpieza de sarro en calefón' } },
          { id: 'mal', label: 'Malo', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FODEMEP', puntosImpacto: 4, descripcion: 'Goteo o falla de encendido en termotanque' } },
          { id: 'cri', label: 'Crítico', generaIncidencia: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FODEMEP', puntosImpacto: 6, descripcion: 'Sin agua caliente sanitaria en cocina' } },
          { id: 'no', label: 'No posee' },
        ],
      },
    ],
  },
  {
    id: 14,
    numero: 14,
    titulo: 'Exposición General del Personal',
    icono: 'MessageSquareText',
    descripcion: 'Espacio libre para que el personal exponga con sus propias palabras sobre el estado edilicio.',
    preguntas: [
      { id: 166, texto: 'Exposición general: indique con sus palabras lo que considere necesario a nivel general sobre la escuela', tipo: 'text', seccionId: 14, placeholder: 'Observaciones y comentarios testimoniales del personal...' },
    ],
  },
];
