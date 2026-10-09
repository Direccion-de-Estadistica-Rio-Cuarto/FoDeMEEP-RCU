export type TipoIncidenciaOficial =
  | 'PLOMERIA'
  | 'ELECTRICIDAD'
  | 'HERRERIA'
  | 'GAS'
  | 'DESINFECCIÓN'
  | 'VARIOS'
  | 'PINTURA'
  | 'ALBAÑILERIA'
  | 'REPARACION/MANTENIMIENTO DE ARTEFACTOS'
  | 'FILTRACIONES'
  | 'MATAFUEGOS'
  | 'PODA/CORTE DE PASTO'
  | 'BOMBA'
  | 'LIMPIEZA DE TANQUE/CISTERNA'
  | 'MOBILIARIO'
  | 'DESAGOTE'
  | 'LIMPIEZA DE DESAGUES'
  | 'OBRA'
  | 'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION'
  | 'CAMION CISTERNA';

export type EstadoConservacion = 'Excelente' | 'Bueno' | 'Regular' | 'Malo' | 'Crítico';

export type NivelCriticidad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type JurisdiccionResolucion = 'FODEMEP' | 'PROVINCIA_MAYOR' | 'COOPERADORA';

export type EstadoIncidencia = 'ABIERTA' | 'EN_CURSO' | 'RESUELTA_PARCIAL' | 'RESUELTA';

export interface RubricaCriterio {
  excelente: string;
  bueno: string;
  regular: string;
  malo: string;
  critico: string;
}

export interface Escuela {
  id: string;
  cue: string;
  nombre: string;
  nivel: string;
  direccion: string;
  barrio: string;
  director: string;
  telefono: string;
  email: string;
  matricula: number;
  turnos: string[];
  superficieM2?: number;
  coordenadas?: { lat: number | null; lng: number | null };
  codigoInspeccion?: string | null;
  inspector?: string | null;
  telInspector?: string | null;
  alumnosDiscapacidad?: number;
  tieneRampa?: boolean;
  tieneBanoAdaptado?: boolean;
  tieneSillaRuedas?: boolean;
  categoria?: string | null;
  modalidad?: string | null;
  ambito?: string | null;
}



export interface IncidenciaDetectada {
  id: string;
  institucionId: string;
  seccion: string;
  preguntaId: number;
  tipo: TipoIncidenciaOficial;
  descripcion: string;
  criticidad: NivelCriticidad;
  jurisdiccion: JurisdiccionResolucion;
  estado: EstadoIncidencia;
  puntosImpacto: number;
  fechaDeteccion: string;
  fotoUrl?: string;
}

export interface SubindiceDimension {
  nombre: string;
  puntaje: number;
  ponderacion: number;
  estado: EstadoConservacion;
  itemsEvaluados: number;
  fallasDetectadas: number;
}

export interface ResultadoIndice {
  global: number; // 0 - 100
  clasificacion: 'Óptimo' | 'Bueno' | 'Regular' | 'Crítico';
  colorBadge: string;
  dimensiones: {
    seguridadCritica: SubindiceDimension;
    aguaSaneamiento: SubindiceDimension;
    estructuraCubiertas: SubindiceDimension;
    climatizacion: SubindiceDimension;
    alimentacionCocina: SubindiceDimension;
    accesibilidad: SubindiceDimension;
    entornoExterior: SubindiceDimension;
  };
  penalizadoresAplicados: {
    motivo: string;
    factor: number;
  }[];
  incidenciasGeneradas: IncidenciaDetectada[];
}

export interface FotoRelevamiento {
  id: string;
  seccionId: number;
  preguntaId?: number;
  dataUrl: string;
  nota?: string;
  timestamp: number;
}

export interface RelevamientoBorrador {
  escuelaId: string;
  tecnicoNombre: string;
  fecha: string;
  respuestas: Record<number, string | number | string[]>;
  fotos: FotoRelevamiento[];
  seccionesCompletas: number[];
  fechaUltimaModificacion: number;
  finalizado: boolean;
}
