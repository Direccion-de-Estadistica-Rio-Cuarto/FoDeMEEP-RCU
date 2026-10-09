import React from 'react';
import { SECCIONES_RELEVAMIENTO, SeccionDef } from '../data/preguntasRelevamiento';
import type { Escuela, RelevamientoBorrador, ResultadoIndice } from '../types/fodemep';
import { Icono } from './Icono';

interface MenuSeccionesProps {
  escuela: Escuela;
  borrador: RelevamientoBorrador;
  resultadoIndice: ResultadoIndice;
  onSeleccionarSeccion: (seccionId: number) => void;
  onIrAAuditoria: () => void;
}

// Mapeo a la paleta de series oficial de la Dirección de Estadística
const COLORES_SERIE = [
  'var(--serie-1)', // 1: Datos
  'var(--serie-2)', // 2: Edilicio
  'var(--serie-3)', // 3: Techos
  'var(--serie-8)', // 4: Gas
  'var(--serie-7)', // 5: Agua
  'var(--serie-6)', // 6: Térmico
  'var(--serie-1)', // 7: Pluvial
  'var(--serie-3)', // 8: Sanitarios
  'var(--serie-2)', // 9: Eléctrica
  'var(--serie-8)', // 10: Seguridad
  'var(--serie-3)', // 11: Patios
  'var(--serie-5)', // 12: Accesibilidad
  'var(--serie-4)', // 13: Cocina
  'var(--serie-7)', // 14: Observaciones
];

export const MenuSecciones: React.FC<MenuSeccionesProps> = ({
  escuela,
  borrador,
  resultadoIndice,
  onSeleccionarSeccion,
  onIrAAuditoria,
}) => {
  const getIconoSeccion = (icono: string) => {
    switch (icono) {
      case 'Building2': return <Icono name="domain" size={22} />;
      case 'LayoutGrid': return <Icono name="grid_view" size={22} />;
      case 'Home': return <Icono name="home" size={22} />;
      case 'Flame': return <Icono name="local_fire_department" size={22} />;
      case 'Droplets': return <Icono name="water_drop" size={22} />;
      case 'Thermometer': return <Icono name="thermostat" size={22} />;
      case 'Waves': return <Icono name="air" size={22} />;
      case 'Bath': return <Icono name="wc" size={22} />;
      case 'Zap': return <Icono name="bolt" size={22} />;
      case 'ShieldAlert': return <Icono name="shield" size={22} />;
      case 'Trees': return <Icono name="park" size={22} />;
      case 'Accessibility': return <Icono name="accessible" size={22} />;
      case 'Utensils': return <Icono name="restaurant" size={22} />;
      case 'MessageSquareText': return <Icono name="rate_review" size={22} />;
      default: return <Icono name="domain" size={22} />;
    }
  };

  const calcularAvanceSeccion = (seccion: SeccionDef) => {
    const total = seccion.preguntas.length;
    let respondidas = 0;

    for (const preg of seccion.preguntas) {
      const val = borrador.respuestas[preg.id];
      if (val !== undefined && val !== null && val !== '') {
        respondidas++;
      }
    }

    const porcentaje = total > 0 ? Math.round((respondidas / total) * 100) : 0;
    return { total, respondidas, porcentaje };
  };

  const totalPreguntas = SECCIONES_RELEVAMIENTO.reduce((acc, s) => acc + s.preguntas.length, 0);
  let totalRespondidas = 0;
  for (const s of SECCIONES_RELEVAMIENTO) {
    for (const p of s.preguntas) {
      const v = borrador.respuestas[p.id];
      if (v !== undefined && v !== null && v !== '') totalRespondidas++;
    }
  }
  const avanceGlobal = Math.round((totalRespondidas / totalPreguntas) * 100);

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-5"
      style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* 3 KPIs Principales Oficiales */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        {/* KPI 1: Índice IES */}
        <div className="kpi shadow-xs">
          <p className="etiqueta truncate">Índice IES</p>
          <div className="valor">{resultadoIndice.global}</div>
          <div className="detalle mt-1">
            {resultadoIndice.penalizadoresAplicados.length > 0 ? (
              <span className="estado estado--grave text-[10px] px-1.5 py-0.5">Crítico</span>
            ) : resultadoIndice.global >= 70 ? (
              <span className="estado estado--ok text-[10px] px-1.5 py-0.5">Óptimo</span>
            ) : resultadoIndice.global >= 50 ? (
              <span className="estado estado--alerta text-[10px] px-1.5 py-0.5">Regular</span>
            ) : (
              <span className="estado estado--grave text-[10px] px-1.5 py-0.5">Crítico</span>
            )}
          </div>
        </div>

        {/* KPI 2: Incidencias */}
        <div className="kpi shadow-xs">
          <p className="etiqueta truncate">Incidencias</p>
          <div className="valor">{resultadoIndice.incidenciasGeneradas.length}</div>
          <div className="detalle mt-1">
            {resultadoIndice.penalizadoresAplicados.length > 0 ? (
              <span className="estado estado--grave text-[10px] px-1.5 py-0.5">Riesgo</span>
            ) : resultadoIndice.incidenciasGeneradas.length > 0 ? (
              <span className="estado estado--alerta text-[10px] px-1.5 py-0.5">A subsanar</span>
            ) : (
              <span className="estado estado--ok text-[10px] px-1.5 py-0.5">Sin fallas</span>
            )}
          </div>
        </div>

        {/* KPI 3: Progreso del Relevamiento en Campo */}
        <div className="kpi shadow-xs flex flex-col justify-between">
          <div>
            <p className="etiqueta truncate">Progreso</p>
            <div className="valor">{avanceGlobal}%</div>
          </div>
          <div className="detalle mt-1">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${avanceGlobal}%`,
                  backgroundColor: 'var(--marca)',
                }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {totalRespondidas} de {totalPreguntas}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Lista de las 14 Secciones */}
      <div className="space-y-3">
        {SECCIONES_RELEVAMIENTO.map((sec, idx) => {
          const { total, respondidas, porcentaje } = calcularAvanceSeccion(sec);
          const estaCompleta = porcentaje === 100;
          const estaEnCurso = porcentaje > 0 && porcentaje < 100;
          const colorSerie = COLORES_SERIE[idx % COLORES_SERIE.length];

          const incidenciasSeccion = resultadoIndice.incidenciasGeneradas.filter((i) =>
            i.seccion.toLowerCase().includes(sec.titulo.toLowerCase().slice(0, 10))
          );

          return (
            <div
              key={sec.id}
              onClick={() => onSeleccionarSeccion(sec.id)}
              className="panel hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-sky-300 group"
              style={{
                borderLeftWidth: '5px',
                borderLeftColor: colorSerie,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${colorSerie} 14%, transparent)`,
                      color: colorSerie,
                    }}
                  >
                    {getIconoSeccion(sec.icono)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--texto-suave)' }}>
                        Sección {sec.numero}
                      </span>
                      {estaCompleta ? (
                        <span className="estado estado--ok">Completa</span>
                      ) : estaEnCurso ? (
                        <span className="estado estado--alerta">{porcentaje}%</span>
                      ) : (
                        <span className="estado estado--neutro">Pendiente</span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm md:text-base leading-snug truncate" style={{ color: 'var(--texto)' }}>
                      {sec.titulo}
                    </h3>

                    <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>
                      {respondidas} de {total} respuestas completadas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  <Icono name="chevron_right" size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Barra fina de avance por sección */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${porcentaje}%`,
                    backgroundColor: estaCompleta ? 'var(--ok)' : colorSerie,
                  }}
                />
              </div>

              {/* Alerta de incidencias si las hubiera */}
              {incidenciasSeccion.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md border border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 w-fit">
                  <Icono name="warning" size={16} className="text-amber-500" />
                  <span>{incidenciasSeccion.length} falla(s) registrada(s)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Botón Flotante Inferior de Auditoría (Limpio, sin textos repetidos) */}
      <div
        className="fixed bottom-0 left-0 right-0 p-3.5 border-t z-30 shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--superficie) 92%, transparent)',
          borderColor: 'var(--borde)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <button
            onClick={onIrAAuditoria}
            className="boton boton--primario boton--grande w-full shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 font-bold"
          >
            <Icono name="fact_check" size={20} />
            <span>Revisar Auditoría y Cierre FODEMEP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
