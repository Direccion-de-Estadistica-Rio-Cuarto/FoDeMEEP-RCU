import React, { useState } from 'react';
import type { Escuela, RelevamientoBorrador, ResultadoIndice } from '../types/fodemep';
import { SECCIONES_RELEVAMIENTO } from '../data/preguntasRelevamiento';
import { Icono } from './Icono';

interface ResumenAuditoriaProps {
  escuela: Escuela;
  borrador: RelevamientoBorrador;
  resultadoIndice: ResultadoIndice;
  onVolverAlMenu: () => void;
  onConfirmarCierre: () => void;
}

export const ResumenAuditoria: React.FC<ResumenAuditoriaProps> = ({
  escuela,
  borrador,
  resultadoIndice,
  onVolverAlMenu,
  onConfirmarCierre,
}) => {
  const [tecnicoFirma, setTecnicoFirma] = useState(
    (borrador.respuestas[3] as string) || 'Técnico Relevador FoDeMEEP'
  );
  const [cerradoExitoso, setCerradoExitoso] = useState(false);

  const preguntasRequeridas = SECCIONES_RELEVAMIENTO.flatMap((s) =>
    s.preguntas.filter((p) => p.requerido)
  );
  const faltantes = preguntasRequeridas.filter(
    (p) => !borrador.respuestas[p.id] || borrador.respuestas[p.id] === ''
  );

  const handleExportarDatos = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            escuela,
            borrador,
            resultadoIndice,
            fechaCierre: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Relevamiento_${escuela.cue}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFinalizar = () => {
    onConfirmarCierre();
    setCerradoExitoso(true);
  };

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-5"
      style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Botón Volver */}

      <div className="mb-4">
        <button
          onClick={onVolverAlMenu}
          className="boton boton--secundario boton--chico cursor-pointer shadow-xs"
        >
          <Icono name="arrow_back" size={16} />
          <span>Volver al Menú de Secciones</span>
        </button>
      </div>

      {/* Cabecera de Auditoría */}
      <div className="panel mb-5 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--borde)' }}>
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}assets/img/logo-gobierno.webp`}
              alt="Gobierno de Río Cuarto"
              className="h-8 w-auto object-contain"
            />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--marca-enlace)' }}>
                Dirección de Estadística · FODEMEP
              </span>
              <h2 className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--texto)' }}>
                Auditoría Técnica y Cierre de Relevamiento
              </h2>
            </div>
          </div>
          <Icono name="fact_check" size={28} className="text-sky-600 flex-shrink-0" />
        </div>

        {/* Ficha institucional */}
        <div
          className="p-3.5 rounded-xl border mb-5 text-xs"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--fondo) 80%, var(--superficie))',
            borderColor: 'var(--borde)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm md:text-base" style={{ color: 'var(--texto)' }}>
                {escuela.nombre}
              </p>
              <p style={{ color: 'var(--texto-suave)' }} className="mt-0.5">
                CUE: {escuela.cue} • {escuela.nivel} • Domicilio: {escuela.direccion} ({escuela.barrio})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="estado estado--ok">Sector Público</span>
              <span className="estado estado--neutro">{escuela.modalidad || 'Común'}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta KPI Principal de Índice IES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="kpi shadow-xs md:col-span-2 flex items-center justify-between">
            <div>
              <p className="etiqueta">Índice IES Final Ponderado (0 - 100)</p>
              <div className="valor flex items-baseline gap-1.5">
                <span>{resultadoIndice.global}</span>
                <span className="text-xs font-normal text-slate-400">puntos</span>
              </div>
              <div className="mt-2">
                <span
                  className={`estado ${
                    resultadoIndice.global >= 70
                      ? 'estado--ok'
                      : resultadoIndice.global >= 50
                      ? 'estado--alerta'
                      : 'estado--grave'
                  }`}
                >
                  Condición: {resultadoIndice.clasificacion}
                </span>
              </div>
            </div>

            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm ${
                resultadoIndice.global >= 70
                  ? 'bg-emerald-600 text-white'
                  : resultadoIndice.global >= 50
                  ? 'bg-amber-500 text-white'
                  : 'bg-red-600 text-white animate-pulse'
              }`}
            >
              {resultadoIndice.global}
            </div>
          </div>

          <div className="kpi shadow-xs">
            <p className="etiqueta">ODS 4 Infraestructura</p>
            <div className="flex items-center gap-3 mt-1">
              <img
                src={`${import.meta.env.BASE_URL}assets/img/ods/ods-04.png`}
                alt="ODS 4"
                className="w-12 h-12 rounded-lg object-contain shadow-xs flex-shrink-0"
              />
              <div className="text-xs leading-tight" style={{ color: 'var(--texto-suave)' }}>
                <span className="font-bold block" style={{ color: 'var(--texto)' }}>Educación Segura</span>
                Meta municipal de habitabilidad escolar
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Críticas (Kill-Switch) */}
        {resultadoIndice.penalizadoresAplicados.length > 0 && (
          <div className="p-3.5 rounded-xl border mb-5 bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-2 font-bold text-xs text-red-600 dark:text-red-400 mb-1">
              <Icono name="report" size={16} className="text-red-600 animate-bounce" />
              <span>RIESGOS CRÍTICOS DETECTADOS QUE PENALIZAN EL ÍNDICE</span>
            </div>
            <ul className="text-xs text-red-700 dark:text-red-300 list-disc pl-5 space-y-1">
              {resultadoIndice.penalizadoresAplicados.map((p, i) => (
                <li key={i}>{p.motivo}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Desglose de las 7 Dimensiones */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--texto-suave)' }}>
            Subíndices Ponderados por Dimensión
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(resultadoIndice.dimensiones).map(([key, dim]) => (
              <div
                key={key}
                className="p-3 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'var(--superficie)',
                  borderColor: 'var(--borde)',
                }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold truncate mr-2" style={{ color: 'var(--texto)' }}>
                    {dim.nombre}
                  </span>
                  <span className="font-mono font-bold">{dim.puntaje}/100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${dim.puntaje}%`,
                      backgroundColor:
                        dim.puntaje >= 70 ? 'var(--ok)' : dim.puntaje >= 50 ? 'var(--alerta)' : 'var(--grave)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catálogo de Incidencias Detectadas */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-suave)' }}>
              Incidencias Detectadas ({resultadoIndice.incidenciasGeneradas.length})
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'color-mix(in srgb, var(--marca) 12%, transparent)', color: 'var(--marca-enlace)' }}>
              Catálogo Oficial 20 Tipos
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {resultadoIndice.incidenciasGeneradas.map((inc, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl border text-xs flex flex-col gap-1"
                style={{
                  backgroundColor: 'var(--fondo)',
                  borderColor: 'var(--borde)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wide" style={{ color: 'var(--texto)' }}>
                    [{inc.tipo}]
                  </span>
                  <span
                    className={`estado ${
                      inc.jurisdiccion === 'FODEMEP' ? 'estado--ok' : 'estado--alerta'
                    }`}
                  >
                    {inc.jurisdiccion === 'FODEMEP' ? 'Descentralizado Municipal' : 'Provincia Mayor'}
                  </span>
                </div>
                <p style={{ color: 'var(--texto-suave)' }}>{inc.descripcion}</p>
              </div>
            ))}

            {resultadoIndice.incidenciasGeneradas.length === 0 && (
              <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <Icono name="verified_user" size={20} className="mx-auto mb-1 text-emerald-600" />
                ✓ No se detectaron fallas críticas ni incidencias activas en el relevamiento.
              </div>
            )}
          </div>
        </div>

        {/* Validación de Campos Requeridos */}
        {faltantes.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-4">
            <Icono name="warning" size={16} className="text-amber-500 flex-shrink-0" />
            <span>Atención: Restan {faltantes.length} preguntas requeridas por completar en el cuestionario.</span>
          </div>
        )}

        {/* Firma Técnica */}
        <div className="pt-4 border-t text-xs" style={{ borderColor: 'var(--borde)' }}>
          <label className="font-semibold block mb-1.5" style={{ color: 'var(--texto)' }}>
            Técnico Relevador Responsable:
          </label>
          <input
            type="text"
            value={tecnicoFirma}
            onChange={(e) => setTecnicoFirma(e.target.value)}
            className="w-full p-2.5 rounded-xl border bg-transparent font-medium text-xs md:text-sm shadow-xs focus:ring-2 focus:ring-sky-500"
            style={{ borderColor: 'var(--borde)', color: 'var(--texto)' }}
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleExportarDatos}
          className="boton boton--secundario boton--grande cursor-pointer shadow-xs"
        >
          <Icono name="download" size={16} />
          <span>Exportar Copia JSON</span>
        </button>

        <button
          onClick={handleFinalizar}
          className="boton boton--primario boton--grande cursor-pointer shadow-md"
        >
          <Icono name="check_circle" size={20} />
          <span>Confirmar y Cerrar Auditoría</span>
        </button>
      </div>

      {/* Modal de Cierre Exitoso */}
      {cerradoExitoso && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="panel max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icono name="check_circle" size={32} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--texto)' }}>
              ¡Relevamiento Consolidado!
            </h3>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--texto-suave)' }}>
              El estado de la institución ha sido registrado en el almacenamiento local y está listo para sincronizar con el Monitor de Río Cuarto.
            </p>
            <button
              onClick={() => {
                setCerradoExitoso(false);
                onVolverAlMenu();
              }}
              className="boton boton--primario w-full cursor-pointer"
            >
              Aceptar y Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
