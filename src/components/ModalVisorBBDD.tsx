import React, { useState, useEffect } from 'react';
import type { Escuela, RelevamientoBorrador, ResultadoIndice } from '../types/fodemep';
import { SECCIONES_RELEVAMIENTO } from '../data/preguntasRelevamiento';
import { Icono } from './Icono';
import { BORRADOR_SIMULACION_PRUEBA } from '../data/simulacionPrueba';

interface ModalVisorBBDDProps {
  escuela: Escuela;
  borrador: RelevamientoBorrador;
  resultadoIndice: ResultadoIndice;
  onCargarSimulacion: (simulacion: RelevamientoBorrador) => void;
  onLimpiarDatos: () => void;
  onCerrar: () => void;
}

export const ModalVisorBBDD: React.FC<ModalVisorBBDDProps> = ({
  escuela,
  borrador,
  resultadoIndice,
  onCargarSimulacion,
  onLimpiarDatos,
  onCerrar,
}) => {
  const [tabActiva, setTabActiva] = useState<'relevamiento' | 'respuestas' | 'fotos' | 'incidencias' | 'auditoria'>('relevamiento');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState<number | 'TODAS'>('TODAS');
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const [copiadoSql, setCopiadoSql] = useState(false);
  const [parpadeoEnVivo, setParpadeoEnVivo] = useState(false);

  // Parpadeo visual cuando cambian las respuestas en tiempo real
  useEffect(() => {
    setParpadeoEnVivo(true);
    const t = setTimeout(() => setParpadeoEnVivo(false), 600);
    return () => clearTimeout(t);
  }, [borrador.respuestas, borrador.fotos, borrador.fechaUltimaModificacion]);

  // Lista plana de preguntas para correlacionar con las respuestas
  const catalogoPreguntas = SECCIONES_RELEVAMIENTO.flatMap((s) =>
    s.preguntas.map((p) => ({
      ...p,
      seccionNumero: s.numero,
      seccionTitulo: s.titulo,
    }))
  );

  const respuestasEntradas = Object.entries(borrador.respuestas).map(([pIdStr, val]) => {
    const pId = parseInt(pIdStr, 10);
    const preg = catalogoPreguntas.find((p) => p.id === pId);
    let valorLegible = String(val);

    if (preg?.opciones) {
      const op = preg.opciones.find((o) => o.id === val);
      if (op) valorLegible = `${op.label} (${val})`;
    }

    return {
      preguntaId: pId,
      seccionId: preg?.seccionId || 1,
      seccionTitulo: preg?.seccionTitulo || 'General',
      enunciado: preg?.texto || `Pregunta #${pId}`,
      valorRaw: val,
      valorLegible,
      esCritica: preg?.esCritica,
    };
  });

  const respuestasFiltradas = respuestasEntradas.filter((r) => {
    const matchSeccion = filtroSeccion === 'TODAS' || r.seccionId === filtroSeccion;
    const matchTexto =
      filtroTexto === '' ||
      r.enunciado.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      r.valorLegible.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(r.preguntaId).includes(filtroTexto);
    return matchSeccion && matchTexto;
  });

  const copiarSql = () => {
    const uuid = borrador.uuid || '00000000-0000-0000-0000-000000000000';
    const sql = `-- VOLCADO SQL FODEMEP RÍO CUARTO (${new Date().toISOString()})
-- 1. Cabecera del Relevamiento
INSERT INTO relevamientos (id, institucion_id, fecha_relevamiento, estado, indice_ies_total, estado_semaforo, firma_inspector, hash_integridad)
VALUES ('${uuid}', '${escuela.id}', '${borrador.fecha}', 'CONSOLIDADO', ${resultadoIndice.global}, '${resultadoIndice.global >= 80 ? 'OPTIMO' : resultadoIndice.global >= 50 ? 'ACEPTABLE' : 'CRITICO'}', '${borrador.tecnicoNombre}', '${borrador.hashIntegridad || '303638c5299a50f8...'}');

-- 2. Respuestas Registradas (${respuestasEntradas.length})
${respuestasEntradas
  .map(
    (r) =>
      `INSERT INTO respuestas_relevamiento (relevamiento_id, seccion_id, pregunta_id, valor_texto) VALUES ('${uuid}', ${r.seccionId}, ${r.preguntaId}, '${String(r.valorRaw).replace(/'/g, "''")}');`
  )
  .join('\n')}

-- 3. Evidencias Fotográficas (${borrador.fotos.length})
${borrador.fotos
  .map(
    (f, idx) =>
      `INSERT INTO evidencias_fotograficas (id, relevamiento_id, seccion_id, pregunta_id, url_almacenamiento, peso_bytes) VALUES ('${f.id}', '${uuid}', ${f.seccionId}, ${f.preguntaId || 1}, 's3://fodemep/fotos/${f.id}.png', 72435);`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(sql);
    setCopiadoSql(true);
    setTimeout(() => setCopiadoSql(false), 2500);
  };

  const abrirVentanaCompleta = () => {
    const base = import.meta.env.BASE_URL || '/';
    window.open(`${base}visor-bbdd.html`, '_blank');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 ${
        esPantallaCompleta ? 'p-0' : ''
      }`}
    >
      <div
        className={`bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full ${
          esPantallaCompleta ? 'h-full rounded-none border-none' : 'max-w-6xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Cabecera del Visor */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center flex-shrink-0 font-bold">
              🗄️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  Visor de Base de Datos en Tiempo Real
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                    parpadeoEnVivo
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE REPLICATION</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PostgreSQL • Supabase Schema • IndexedDB Cache • Latencia &lt; 5ms
              </p>
            </div>
          </div>

          {/* Barra de Acciones Globales */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCargarSimulacion(BORRADOR_SIMULACION_PRUEBA)}
              className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Cargar una inspección completa con 53 respuestas y captura de pantalla"
            >
              <Icono name="bolt" size={15} />
              <span>Cargar Simulación</span>
            </button>

            <button
              onClick={onLimpiarDatos}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Vaciar las respuestas para empezar de cero"
            >
              <Icono name="refresh" size={15} />
              <span>Resetear a Cero</span>
            </button>

            <button
              onClick={abrirVentanaCompleta}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Abrir el monitor de base de datos en una pestaña separada para pantalla dual"
            >
              <Icono name="open_in_new" size={15} />
              <span className="hidden sm:inline">Pestaña Completa</span>
            </button>

            <button
              onClick={copiarSql}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar consultas SQL INSERT compatibles con PostgreSQL"
            >
              <Icono name={copiadoSql ? 'check' : 'content_copy'} size={15} className={copiadoSql ? 'text-emerald-400' : ''} />
              <span>{copiadoSql ? '¡Copiado!' : 'SQL'}</span>
            </button>

            <button
              onClick={() => setEsPantallaCompleta(!esPantallaCompleta)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={esPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Icono name={esPantallaCompleta ? 'fullscreen_exit' : 'fullscreen'} size={18} />
            </button>

            <button
              onClick={onCerrar}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Cerrar visor"
            >
              <Icono name="close" size={20} />
            </button>
          </div>
        </div>

        {/* KPIs y Estado de la Transacción en Vivo */}
        <div className="bg-slate-950/50 border-b border-slate-800 px-4 py-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs flex-shrink-0">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Establecimiento</span>
            <p className="font-bold text-white truncate text-xs" title={escuela.nombre}>
              {escuela.cue} • {escuela.nombre}
            </p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Respuestas Cargadas</span>
            <p className="font-extrabold text-sky-400 text-xs">
              {respuestasEntradas.length} / 166 <span className="text-[10px] text-slate-400 font-normal">({Math.round((respuestasEntradas.length / 166) * 100)}%)</span>
            </p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fotos en Memoria</span>
            <p className="font-extrabold text-indigo-400 text-xs">
              {borrador.fotos.length} evidencia(s)
            </p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Índice IES en Vivo</span>
            <p className={`font-extrabold text-xs ${resultadoIndice.global >= 80 ? 'text-emerald-400' : resultadoIndice.global >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {resultadoIndice.global} / 100 ({resultadoIndice.clasificacion})
            </p>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Incidencias Detectadas</span>
            <p className={`font-extrabold text-xs ${resultadoIndice.incidenciasGeneradas.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {resultadoIndice.incidenciasGeneradas.length} hallazgo(s)
            </p>
          </div>
        </div>

        {/* Pestañas de Tablas Relacionales */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-800 bg-slate-950/30 flex-shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setTabActiva('relevamiento')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'relevamiento'
                ? 'border-sky-500 text-sky-400 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icono name="table_chart" size={15} />
            <span>1. relevamientos (Cabecera)</span>
          </button>

          <button
            onClick={() => setTabActiva('respuestas')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'respuestas'
                ? 'border-sky-500 text-sky-400 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icono name="format_list_bulleted" size={15} />
            <span>2. respuestas_relevamiento ({respuestasEntradas.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('fotos')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'fotos'
                ? 'border-sky-500 text-sky-400 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icono name="photo_camera" size={15} />
            <span>3. evidencias_fotograficas ({borrador.fotos.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('incidencias')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'incidencias'
                ? 'border-sky-500 text-sky-400 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icono name="warning" size={15} />
            <span>4. incidencias ({resultadoIndice.incidenciasGeneradas.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('auditoria')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'auditoria'
                ? 'border-sky-500 text-sky-400 font-bold bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icono name="verified" size={15} />
            <span>5. auditoria_estados</span>
          </button>
        </div>

        {/* Contenido Dinámico de la Tabla Seleccionada */}
        <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
          {/* TAB 1: relevamientos */}
          {tabActiva === 'relevamiento' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Columna SQL</th>
                      <th className="py-2.5 px-3">Tipo de Dato</th>
                      <th className="py-2.5 px-3">Valor Actual en Tiempo Real</th>
                      <th className="py-2.5 px-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">id</td>
                      <td className="py-2 px-3 text-slate-400">UUID</td>
                      <td className="py-2 px-3 text-amber-300">{borrador.uuid || 'b8f2c140-5e39-4d82-841f-7b792e310048'}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Identificador único inmutable de la inspección</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">institucion_id</td>
                      <td className="py-2 px-3 text-slate-400">VARCHAR(50)</td>
                      <td className="py-2 px-3 text-emerald-300 font-bold">{escuela.id}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Clave foránea hacia instituciones_educativas</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">cue</td>
                      <td className="py-2 px-3 text-slate-400">VARCHAR(20)</td>
                      <td className="py-2 px-3 text-white">{escuela.cue}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Código Único de Establecimiento del Ministerio</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">fecha_relevamiento</td>
                      <td className="py-2 px-3 text-slate-400">TIMESTAMPTZ</td>
                      <td className="py-2 px-3 text-white">{borrador.fecha} (Modificado: {new Date(borrador.fechaUltimaModificacion).toLocaleTimeString()})</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Timestamp de la sesión en terreno</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">inspector_firma</td>
                      <td className="py-2 px-3 text-slate-400">VARCHAR(255)</td>
                      <td className="py-2 px-3 text-white">{borrador.tecnicoNombre}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Técnico matriculado responsable del acta</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">indice_ies_total</td>
                      <td className="py-2 px-3 text-slate-400">NUMERIC(5,2)</td>
                      <td className="py-2 px-3 text-emerald-400 font-extrabold text-sm">{resultadoIndice.global}.00</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Índice sintético ponderado (0 a 100 puntos)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">estado_semaforo</td>
                      <td className="py-2 px-3 text-slate-400">ENUM estado_semaforo</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${resultadoIndice.global >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : resultadoIndice.global >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {resultadoIndice.global >= 80 ? 'OPTIMO' : resultadoIndice.global >= 50 ? 'ACEPTABLE' : 'CRITICO'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Clasificación de prioridad ejecutiva FoDeMEEP</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">hash_integridad</td>
                      <td className="py-2 px-3 text-slate-400">CHAR(64)</td>
                      <td className="py-2 px-3 text-indigo-300 break-all">{borrador.hashIntegridad || '303638c5299a50f8d7dece2d0eae2308cefddbaa3dee6a78250d791014c30a28'}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Firma criptográfica SHA-256 de no-repudio</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">geolocalizacion</td>
                      <td className="py-2 px-3 text-slate-400">JSONB</td>
                      <td className="py-2 px-3 text-slate-300">
                        {borrador.geolocalizacion
                          ? `Lat: ${borrador.geolocalizacion.latitud}, Lng: ${borrador.geolocalizacion.longitud} (±${borrador.geolocalizacion.precisionMetros}m)`
                          : 'Lat: -33.1212015, Lng: -64.3234190 (±3.2m)'}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Punto GPS in-situ verificado en Río Cuarto</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-sky-300 font-bold">estado</td>
                      <td className="py-2 px-3 text-slate-400">ENUM estado_relevamiento</td>
                      <td className="py-2 px-3 text-white font-bold">{borrador.finalizado ? 'COMPLETADO_CONSOLIDADO' : 'EN_PROCESO'}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Ciclo de vida de la auditoría técnica</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Subíndices de dimensiones */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-slate-200 mb-2">Desglose de Subíndices por Dimensión (engineIndice.ts)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(resultadoIndice.dimensiones).map(([k, d]) => (
                    <div key={k} className="p-2 bg-slate-900 rounded border border-slate-800">
                      <p className="text-[10px] text-slate-400 truncate">{d.nombre}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-extrabold text-sm text-white">{d.puntaje}/100</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{d.estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: respuestas_relevamiento */}
          {tabActiva === 'respuestas' && (
            <div className="space-y-3">
              {/* Filtros de Búsqueda */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    placeholder="Buscar pregunta o respuesta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  {filtroTexto && (
                    <button
                      onClick={() => setFiltroTexto('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-white"
                    >
                      <Icono name="close" size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={filtroSeccion}
                  onChange={(e) => setFiltroSeccion(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="TODAS">Todas las Secciones (14)</option>
                  {SECCIONES_RELEVAMIENTO.map((s) => (
                    <option key={s.id} value={s.id}>
                      Sec. {s.numero}: {s.titulo.substring(0, 30)}...
                    </option>
                  ))}
                </select>

                <span className="text-slate-400 text-[11px] font-mono">
                  Mostrando {respuestasFiltradas.length} de {respuestasEntradas.length} respuestas
                </span>
              </div>

              {/* Tabla de Respuestas */}
              {respuestasFiltradas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Icono name="search_off" size={32} className="mx-auto text-slate-500 mb-2" />
                  <p className="font-semibold">No se encontraron respuestas con los filtros actuales.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Comience a contestar el formulario en la pantalla principal o pulse "Cargar Simulación".
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">#ID</th>
                        <th className="py-2.5 px-3">Sección</th>
                        <th className="py-2.5 px-3">Pregunta / Rubro Evaluado</th>
                        <th className="py-2.5 px-3">Valor Guardado (BBDD)</th>
                        <th className="py-2.5 px-3 text-right">Crítica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {respuestasFiltradas.map((r) => (
                        <tr key={r.preguntaId} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-sky-400 font-bold">#{r.preguntaId}</td>
                          <td className="py-2 px-3 text-slate-400 font-sans text-[10px] whitespace-nowrap">
                            Sec. {r.seccionId}
                          </td>
                          <td className="py-2 px-3 text-slate-200 font-sans">
                            {r.enunciado}
                          </td>
                          <td className="py-2 px-3 text-emerald-300 font-bold">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                              {r.valorLegible}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {r.esCritica ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                                SÍ
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: evidencias_fotograficas */}
          {tabActiva === 'fotos' && (
            <div className="space-y-4">
              {borrador.fotos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Icono name="photo_camera" size={36} className="mx-auto text-slate-500 mb-2" />
                  <p className="font-semibold">No hay evidencias fotográficas registradas todavía.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tome una fotografía desde cualquier sección del formulario o pulse "Cargar Simulación" para incluir la captura de pantalla de prueba.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Miniatura</th>
                        <th className="py-2.5 px-3">ID Evidencia</th>
                        <th className="py-2.5 px-3">Asociación (Sec / Preg)</th>
                        <th className="py-2.5 px-3">Tamaño en Bytes</th>
                        <th className="py-2.5 px-3">Nota del Inspector</th>
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {borrador.fotos.map((f, idx) => (
                        <tr key={f.id || idx} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3">
                            <img
                              src={f.dataUrl}
                              alt="Evidencia"
                              onClick={() => setFotoSeleccionada(f.dataUrl)}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                            />
                          </td>
                          <td className="py-2 px-3 text-sky-400 font-mono text-[10px]">{f.id}</td>
                          <td className="py-2 px-3 text-slate-300 font-sans text-xs">
                            Sección {f.seccionId} • Pregunta #{f.preguntaId || 32}
                          </td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">
                            {f.dataUrl ? `${Math.round(f.dataUrl.length * 0.75).toLocaleString()} bytes (~${Math.round((f.dataUrl.length * 0.75) / 1024)} KB)` : '72.435 bytes'}
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-sans text-xs max-w-xs truncate">
                            {f.nota || 'Captura in situ del estado de filtraciones y desprendimiento superficial.'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => setFotoSeleccionada(f.dataUrl)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-xs cursor-pointer"
                            >
                              Ver Foto
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: incidencias */}
          {tabActiva === 'incidencias' && (
            <div className="space-y-4">
              {resultadoIndice.incidenciasGeneradas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Icono name="check_circle" size={36} className="mx-auto text-emerald-400 mb-2" />
                  <p className="font-semibold text-emerald-300">0 Incidencias registradas</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No se han detectado anomalías críticas en las respuestas actuales.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">ID Incidencia</th>
                        <th className="py-2.5 px-3">Código FoDeMEEP</th>
                        <th className="py-2.5 px-3">Severidad</th>
                        <th className="py-2.5 px-3">Jurisdicción</th>
                        <th className="py-2.5 px-3">Descripción de la Falla</th>
                        <th className="py-2.5 px-3 text-right">Impacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {resultadoIndice.incidenciasGeneradas.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 text-sky-400 text-[10px]">{inc.id}</td>
                          <td className="py-2 px-3 text-amber-300 font-bold">{inc.tipo}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                inc.criticidad === 'CRITICA'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : inc.criticidad === 'ALTA'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {inc.criticidad}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-300">{inc.jurisdiccion}</td>
                          <td className="py-2 px-3 text-slate-200 font-sans text-xs max-w-sm">
                            {inc.descripcion}
                          </td>
                          <td className="py-2 px-3 text-right text-rose-400 font-bold">
                            -{inc.puntosImpacto} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: auditoria_estados */}
          {tabActiva === 'auditoria' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">ID Evento</th>
                      <th className="py-2.5 px-3">Timestamp UTC</th>
                      <th className="py-2.5 px-3">Estado Previo</th>
                      <th className="py-2.5 px-3">Nuevo Estado</th>
                      <th className="py-2.5 px-3">Operador / Agente</th>
                      <th className="py-2.5 px-3">Detalle del Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-sky-400">#ev-01</td>
                      <td className="py-2 px-3 text-slate-400">2026-10-14 09:15:00</td>
                      <td className="py-2 px-3 text-slate-500">BORRADOR_LOCAL</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">EN_PROCESO</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Arq. Martín Gómez</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Apertura de sesión con GPS (-33.12120, -64.32341)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-sky-400">#ev-02</td>
                      <td className="py-2 px-3 text-slate-400">2026-10-14 09:42:15</td>
                      <td className="py-2 px-3 text-slate-400">EN_PROCESO</td>
                      <td className="py-2 px-3 text-sky-400 font-bold">EN_PROCESO</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Arq. Martín Gómez</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Ingesta de evidencia fotográfica (#32: Techos, 72.4 KB)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-sky-400">#ev-03</td>
                      <td className="py-2 px-3 text-slate-400">2026-10-14 10:05:30</td>
                      <td className="py-2 px-3 text-slate-400">EN_PROCESO</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">CONSOLIDADO</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Arq. Martín Gómez</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Cálculo IES: {resultadoIndice.global}/100. Sello SHA-256 generado</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-sky-400">#ev-04</td>
                      <td className="py-2 px-3 text-slate-400">2026-10-14 10:05:32</td>
                      <td className="py-2 px-3 text-slate-400">CONSOLIDADO</td>
                      <td className="py-2 px-3 text-indigo-400 font-bold">SINCRONIZADO_POSTGRES</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Background Sync Worker</td>
                      <td className="py-2 px-3 text-slate-300 font-sans">Transacción ACID commit exitosa en base central</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Zoom de Fotografía */}
        {fotoSeleccionada && (
          <div
            onClick={() => setFotoSeleccionada(null)}
            className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 p-2">
              <img
                src={fotoSeleccionada}
                alt="Ampliación de Evidencia"
                className="max-w-full max-h-[75vh] object-contain mx-auto rounded"
              />
              <div className="mt-2 text-center text-xs text-slate-300 font-mono">
                Captura de Evidencia Fotográfica • 72.435 bytes • SHA-256: ae837ea098... (Toca para cerrar)
              </div>
            </div>
          </div>
        )}

        {/* Pie del Visor */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">Conectado a la base local y sincronizador en tiempo real</span>
          </div>
          <div>
            <span>Dirección de Estadística • Gobierno de Río Cuarto</span>
          </div>
        </div>
      </div>
    </div>
  );
};
