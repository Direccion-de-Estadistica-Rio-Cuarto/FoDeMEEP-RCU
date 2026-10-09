import type { ResultadoIndice, IncidenciaDetectada, SubindiceDimension, EstadoConservacion } from '../types/fodemep';
import { SECCIONES_RELEVAMIENTO } from '../data/preguntasRelevamiento';

function calcularEstadoDesdePuntaje(p: number): EstadoConservacion {
  if (p >= 85) return 'Excelente';
  if (p >= 70) return 'Bueno';
  if (p >= 50) return 'Regular';
  if (p >= 30) return 'Malo';
  return 'Crítico';
}

export function calcularIndiceInstitucional(
  institucionId: string,
  respuestas: Record<number, string | number | string[]>
): ResultadoIndice {
  const incidencias: IncidenciaDetectada[] = [];
  const penalizadores: { motivo: string; factor: number }[] = [];

  for (const seccion of SECCIONES_RELEVAMIENTO) {
    for (const pregunta of seccion.preguntas) {
      const valor = respuestas[pregunta.id];
      if (valor === undefined || valor === null || valor === '') continue;

      if (pregunta.opciones) {
        const opcionSeleccionada = pregunta.opciones.find((op) => op.id === valor);
        if (opcionSeleccionada?.generaIncidencia) {
          const gen = opcionSeleccionada.generaIncidencia;
          const incId = `inc-${institucionId}-${pregunta.id}`;
          incidencias.push({
            id: incId,
            institucionId,
            seccion: seccion.titulo,
            preguntaId: pregunta.id,
            tipo: gen.tipo,
            descripcion: gen.descripcion,
            criticidad: gen.criticidad,
            jurisdiccion: gen.jurisdiccion,
            estado: 'ABIERTA',
            puntosImpacto: gen.puntosImpacto,
            fechaDeteccion: new Date().toISOString().split('T')[0],
          });

          if (gen.esKillSwitch && gen.motivoAlerta) {
            penalizadores.push({
              motivo: gen.motivoAlerta,
              factor: gen.criticidad === 'CRITICA' ? 0.75 : 0.85,
            });
          }
        }
      }
    }
  }

  // Dimensiones
  const fallasSeguridad = incidencias.filter((i) => ['GAS', 'ELECTRICIDAD', 'MATAFUEGOS'].includes(i.tipo));
  const puntosRestaSeg = fallasSeguridad.reduce((acc, curr) => acc + curr.puntosImpacto, 0);
  const puntajeSeguridad = Math.max(10, Math.min(100, 100 - puntosRestaSeg * 2.2));

  const fallasAgua = incidencias.filter((i) =>
    ['PLOMERIA', 'BOMBA', 'LIMPIEZA DE TANQUE/CISTERNA', 'DESAGOTE', 'LIMPIEZA DE DESAGUES'].includes(i.tipo)
  );
  const puntosRestaAgua = fallasAgua.reduce((acc, curr) => acc + curr.puntosImpacto, 0);
  const puntajeAgua = Math.max(10, Math.min(100, 100 - puntosRestaAgua * 2.5));

  const fallasEstructura = incidencias.filter((i) =>
    ['FILTRACIONES', 'ALBAÑILERIA', 'HERRERIA', 'PINTURA', 'OBRA'].includes(i.tipo)
  );
  const puntosRestaEst = fallasEstructura.reduce((acc, curr) => acc + curr.puntosImpacto, 0);
  const puntajeEstructura = Math.max(10, Math.min(100, 100 - puntosRestaEst * 2.2));

  const fueraServicioCalef = Number(respuestas[69] || 0);
  const totalCalef = Number(respuestas[66] || 0) + fueraServicioCalef;
  let ratioCalef = totalCalef > 0 ? (totalCalef - fueraServicioCalef) / totalCalef : 1;
  const fallasClima = incidencias.filter((i) =>
    ['REPARACION/MANTENIMIENTO DE ARTEFACTOS', 'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION'].includes(i.tipo)
  );
  let puntajeClima = ratioCalef * 70 + (30 - fallasClima.length * 5);
  puntajeClima = Math.max(15, Math.min(100, puntajeClima));

  const fallasCocina = incidencias.filter((i) => i.seccion.includes('Cocina'));
  const puntajeCocina = Math.max(20, Math.min(100, 100 - fallasCocina.length * 15));

  const fallasAcc = incidencias.filter((i) => i.seccion.includes('Accesibilidad'));
  const puntajeAcc = Math.max(20, Math.min(100, 100 - fallasAcc.length * 20));

  const fallasExt = incidencias.filter((i) => ['PODA/CORTE DE PASTO'].includes(i.tipo));
  const puntajeExt = Math.max(20, Math.min(100, 100 - fallasExt.length * 18));

  const dimSeg: SubindiceDimension = {
    nombre: 'Seguridad Crítica e Instalaciones',
    ponderacion: 0.25,
    puntaje: Math.round(puntajeSeguridad),
    estado: calcularEstadoDesdePuntaje(puntajeSeguridad),
    itemsEvaluados: 18,
    fallasDetectadas: fallasSeguridad.length,
  };

  const dimAgua: SubindiceDimension = {
    nombre: 'Agua Potable y Saneamiento',
    ponderacion: 0.2,
    puntaje: Math.round(puntajeAgua),
    estado: calcularEstadoDesdePuntaje(puntajeAgua),
    itemsEvaluados: 14,
    fallasDetectadas: fallasAgua.length,
  };

  const dimEst: SubindiceDimension = {
    nombre: 'Estructura Edilicia y Cubiertas',
    ponderacion: 0.18,
    puntaje: Math.round(puntajeEstructura),
    estado: calcularEstadoDesdePuntaje(puntajeEstructura),
    itemsEvaluados: 12,
    fallasDetectadas: fallasEstructura.length,
  };

  const dimClima: SubindiceDimension = {
    nombre: 'Climatización y Ventilación',
    ponderacion: 0.15,
    puntaje: Math.round(puntajeClima),
    estado: calcularEstadoDesdePuntaje(puntajeClima),
    itemsEvaluados: 9,
    fallasDetectadas: fallasClima.length,
  };

  const dimCocina: SubindiceDimension = {
    nombre: 'Alimentación y Cocina (PAICOR)',
    ponderacion: 0.1,
    puntaje: Math.round(puntajeCocina),
    estado: calcularEstadoDesdePuntaje(puntajeCocina),
    itemsEvaluados: 5,
    fallasDetectadas: fallasCocina.length,
  };

  const dimAcc: SubindiceDimension = {
    nombre: 'Accesibilidad Universal',
    ponderacion: 0.07,
    puntaje: Math.round(puntajeAcc),
    estado: calcularEstadoDesdePuntaje(puntajeAcc),
    itemsEvaluados: 4,
    fallasDetectadas: fallasAcc.length,
  };

  const dimExt: SubindiceDimension = {
    nombre: 'Entorno Exterior y Patios',
    ponderacion: 0.05,
    puntaje: Math.round(puntajeExt),
    estado: calcularEstadoDesdePuntaje(puntajeExt),
    itemsEvaluados: 4,
    fallasDetectadas: fallasExt.length,
  };

  const puntajeBase =
    dimSeg.puntaje * dimSeg.ponderacion +
    dimAgua.puntaje * dimAgua.ponderacion +
    dimEst.puntaje * dimEst.ponderacion +
    dimClima.puntaje * dimClima.ponderacion +
    dimCocina.puntaje * dimCocina.ponderacion +
    dimAcc.puntaje * dimAcc.ponderacion +
    dimExt.puntaje * dimExt.ponderacion;

  let factorMultiplicador = 1.0;
  for (const pen of penalizadores) {
    factorMultiplicador *= pen.factor;
  }

  const puntajeFinal = Math.max(0, Math.min(100, Math.round(puntajeBase * factorMultiplicador)));

  let clasificacion: 'Óptimo' | 'Bueno' | 'Regular' | 'Crítico' = 'Crítico';
  let colorBadge = 'bg-rose-500 text-white';

  if (puntajeFinal >= 85) {
    clasificacion = 'Óptimo';
    colorBadge = 'bg-emerald-500 text-white';
  } else if (puntajeFinal >= 70) {
    clasificacion = 'Bueno';
    colorBadge = 'bg-sky-500 text-white';
  } else if (puntajeFinal >= 50) {
    clasificacion = 'Regular';
    colorBadge = 'bg-amber-500 text-white';
  }

  return {
    global: puntajeFinal,
    clasificacion,
    colorBadge,
    dimensiones: {
      seguridadCritica: dimSeg,
      aguaSaneamiento: dimAgua,
      estructuraCubiertas: dimEst,
      climatizacion: dimClima,
      alimentacionCocina: dimCocina,
      accesibilidad: dimAcc,
      entornoExterior: dimExt,
    },
    penalizadoresAplicados: penalizadores,
    incidenciasGeneradas: incidencias,
  };
}
