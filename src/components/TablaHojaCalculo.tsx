import React, { useState } from 'react';
import type { Escuela, RelevamientoBorrador, ResultadoIndice } from '../types/fodemep';
import { SECCIONES_RELEVAMIENTO } from '../data/preguntasRelevamiento';
import { Icono } from './Icono';

interface TablaHojaCalculoProps {
  escuela: Escuela;
  borrador: RelevamientoBorrador;
  resultadoIndice: ResultadoIndice;
  onCerrar: () => void;
}

export const TablaHojaCalculo: React.FC<TablaHojaCalculoProps> = ({
  escuela,
  borrador,
  resultadoIndice,
  onCerrar,
}) => {
  const [hojaActiva, setHojaActiva] = useState<'respuestas' | 'resumen'>('respuestas');
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<string>('D1');
  const [valorFormula, setValorFormula] = useState<string>('');
  const [filtroTexto, setFiltroTexto] = useState('');

  // Aplanar todas las preguntas para la hoja de cálculo
  const todasLasPreguntas = SECCIONES_RELEVAMIENTO.flatMap((sec) =>
    sec.preguntas.map((p) => {
      const valor = borrador.respuestas[p.id];
      let valorTexto = valor !== undefined && valor !== null && valor !== '' ? String(valor) : '';
      let etiquetaOpcion = '';

      if (p.opciones && valor) {
        const op = p.opciones.find((o) => o.id === valor);
        if (op) {
          etiquetaOpcion = op.label;
        }
      }

      // Buscar si tiene foto asociada
      const fotoAsociada = borrador.fotos.find((f) => f.preguntaId === p.id || (p.seccionId === 3 && p.id === 32 && f.seccionId === 3));

      // Buscar si genera incidencia
      const incidencia = resultadoIndice.incidenciasGeneradas.find((i) => i.preguntaId === p.id);

      return {
        id: p.id,
        seccionNumero: sec.numero,
        seccionTitulo: sec.titulo,
        enunciado: p.texto,
        tipo: p.tipo,
        valorRaw: valorTexto,
        valorMostrado: etiquetaOpcion ? `${etiquetaOpcion} [${valorTexto}]` : valorTexto,
        esCritica: p.esCritica,
        incidencia: incidencia ? incidencia.tipo : '',
        criticidad: incidencia ? incidencia.criticidad : '',
        tieneFoto: !!fotoAsociada,
        fotoUrl: fotoAsociada ? fotoAsociada.dataUrl : null,
      };
    })
  );

  const filasFiltradas = todasLasPreguntas.filter((fila) => {
    if (!filtroTexto) return true;
    const q = filtroTexto.toLowerCase();
    return (
      String(fila.id).includes(q) ||
      fila.enunciado.toLowerCase().includes(q) ||
      fila.valorMostrado.toLowerCase().includes(q) ||
      fila.seccionTitulo.toLowerCase().includes(q)
    );
  });

  // Exportar a CSV compatible con Microsoft Excel y Google Sheets
  const descargarCsv = () => {
    const encabezados = ['Fila', 'Seccion', 'Nro_Pregunta', 'Pregunta_Tecnica', 'Respuesta_Registrada', 'Incidencia_Detectada', 'Criticidad', 'Tiene_Foto'];
    const lineas = filasFiltradas.map((f, idx) => [
      idx + 1,
      `"Sec. ${f.seccionNumero} - ${f.seccionTitulo.replace(/"/g, '""')}"`,
      f.id,
      `"${f.enunciado.replace(/"/g, '""')}"`,
      `"${f.valorMostrado.replace(/"/g, '""')}"`,
      `"${f.incidencia}"`,
      `"${f.criticidad}"`,
      f.tieneFoto ? 'SI (Foto adjunta)' : 'NO'
    ].join(';'));

    const contenido = '\uFEFF' + [encabezados.join(';'), ...lineas].join('\r\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relevamiento_fodemep_${escuela.cue}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-xs">
      {/* Contenedor tipo Ventana de Excel / Hoja de Cálculo */}
      <div className="flex-1 flex flex-col bg-white text-slate-800 overflow-hidden shadow-2xl">
        {/* 1. Barra Verde Superior estilo Hoja de Cálculo */}
        <div className="bg-[#107c41] text-white px-4 py-2 flex items-center justify-between gap-3 flex-shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white text-[#107c41] rounded flex items-center justify-center font-black text-sm shadow-xs">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm tracking-wide leading-tight">
                  FoDeMEEP • Hoja de Cálculo en Tiempo Real
                </h2>
                <span className="bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.2 rounded-full border border-emerald-400/40 animate-pulse">
                  ● Conectado en Vivo
                </span>
              </div>
              <p className="text-[11px] text-white/85 leading-tight truncate">
                {escuela.cue} — {escuela.nombre} | Inspector: {borrador.tecnicoNombre} | IES: {resultadoIndice.global}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={descargarCsv}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar esta tabla para abrir en Excel o Google Sheets"
            >
              <Icono name="download" size={14} />
              <span>Descargar Excel (CSV)</span>
            </button>

            <button
              onClick={onCerrar}
              className="p-1 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
              title="Cerrar tabla"
            >
              <Icono name="close" size={20} />
            </button>
          </div>
        </div>

        {/* 2. Barra de Menú y Filtro Rápido */}
        <div className="bg-[#f3f4f6] border-b border-slate-300 px-4 py-1.5 flex items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Buscar en tabla:</span>
            <input
              type="text"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Escriba pregunta, respuesta o sección..."
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 w-64 focus:outline-none focus:border-[#107c41]"
            />
            {filtroTexto && (
              <button
                onClick={() => setFiltroTexto('')}
                className="text-slate-500 hover:text-slate-700"
              >
                <Icono name="close" size={14} />
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-600 font-mono">
            {filasFiltradas.filter((f) => f.valorRaw).length} celdas con datos de {filasFiltradas.length} filas
          </div>
        </div>

        {/* 3. Barra de Fórmula estilo Excel (fx) */}
        <div className="bg-white border-b border-slate-200 px-4 py-1 flex items-center gap-2 text-xs flex-shrink-0 font-mono">
          <span className="font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] text-slate-700 w-12 text-center">
            {celdaSeleccionada}
          </span>
          <span className="text-slate-400 font-serif italic text-sm">fx</span>
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-700 truncate text-[11px]">
            {valorFormula || '=DATOS_RELEVAMIENTO(campo_activo)'}
          </div>
        </div>

        {/* 4. Cuadrícula de la Hoja de Cálculo (Grid clásico de Excel) */}
        <div className="flex-1 overflow-auto bg-slate-100 p-0 font-sans text-xs">
          {hojaActiva === 'respuestas' ? (
            <table className="w-full border-collapse bg-white select-text">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-600 text-[11px] font-semibold sticky top-0 z-20 shadow-xs">
                  {/* Letras de Columnas estilo Excel */}
                  <th className="border border-slate-300 w-12 text-center py-1 bg-slate-200 text-slate-500 font-mono">
                    #
                  </th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left w-36 bg-slate-100">
                    <span className="text-slate-400 block text-[9px] font-mono">A</span>
                    Sección
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center w-16 bg-slate-100">
                    <span className="text-slate-400 block text-[9px] font-mono">B</span>
                    Nº Preg
                  </th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left bg-slate-100">
                    <span className="text-slate-400 block text-[9px] font-mono">C</span>
                    Parámetro Inspeccionado (Pregunta)
                  </th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left w-48 bg-slate-100 font-bold text-slate-900">
                    <span className="text-slate-400 block text-[9px] font-mono">D</span>
                    Respuesta Guardada (Tiempo Real)
                  </th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left w-36 bg-slate-100">
                    <span className="text-slate-400 block text-[9px] font-mono">E</span>
                    Incidencia FoDeMEEP
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center w-24 bg-slate-100">
                    <span className="text-slate-400 block text-[9px] font-mono">F</span>
                    Foto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filasFiltradas.map((fila, idx) => {
                  const tieneDato = !!fila.valorRaw;
                  const celdaId = `D${idx + 1}`;
                  const estaSeleccionada = celdaSeleccionada === celdaId;

                  return (
                    <tr
                      key={fila.id}
                      onClick={() => {
                        setCeldaSeleccionada(celdaId);
                        setValorFormula(fila.valorMostrado ? `="${fila.valorMostrado}"` : '=""');
                      }}
                      className={`hover:bg-sky-50/60 transition-colors cursor-pointer ${
                        tieneDato ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                      }`}
                    >
                      {/* Número de fila de Excel */}
                      <td className="border border-slate-300 bg-slate-100/80 text-center font-mono text-[10px] text-slate-500 select-none py-1.5">
                        {idx + 1}
                      </td>

                      {/* Columna A: Sección */}
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600 truncate text-[11px]">
                        Sec. {fila.seccionNumero}
                      </td>

                      {/* Columna B: Nº de Pregunta */}
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-700 text-[11px]">
                        #{fila.id}
                      </td>

                      {/* Columna C: Pregunta */}
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-800 text-xs">
                        <span className={fila.esCritica ? 'font-semibold text-rose-800' : ''}>
                          {fila.enunciado}
                        </span>
                        {fila.esCritica && (
                          <span className="ml-1.5 text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">
                            Crítica
                          </span>
                        )}
                      </td>

                      {/* Columna D: Respuesta (con borde verde si está seleccionada) */}
                      <td
                        className={`border border-slate-300 px-3 py-1.5 font-semibold text-xs transition-colors ${
                          estaSeleccionada
                            ? 'ring-2 ring-[#107c41] bg-emerald-50 text-slate-900'
                            : tieneDato
                            ? 'text-[#107c41] bg-emerald-50/30'
                            : 'text-slate-400 italic'
                        }`}
                      >
                        {tieneDato ? (
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{fila.valorMostrado}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Dato guardado" />
                          </div>
                        ) : (
                          <span>(vacío)</span>
                        )}
                      </td>

                      {/* Columna E: Incidencia */}
                      <td className="border border-slate-300 px-3 py-1.5 text-[11px]">
                        {fila.incidencia ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block truncate">
                            ⚠️ {fila.incidencia} ({fila.criticidad})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">-</span>
                        )}
                      </td>

                      {/* Columna F: Foto */}
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {fila.tieneFoto ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            <span>📷</span>
                            <span>Foto</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* HOJA 2: Resumen Institucional Maestro */
            <div className="p-4">
              <table className="w-full border-collapse bg-white text-xs border border-slate-300">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center font-mono">Fila</th>
                    <th className="border border-slate-300 p-2 text-left">CUE</th>
                    <th className="border border-slate-300 p-2 text-left">Nombre de la Institución</th>
                    <th className="border border-slate-300 p-2 text-left">Nivel</th>
                    <th className="border border-slate-300 p-2 text-left">Inspector Activo</th>
                    <th className="border border-slate-300 p-2 text-center">Fecha Relevamiento</th>
                    <th className="border border-slate-300 p-2 text-center">Respuestas</th>
                    <th className="border border-slate-300 p-2 text-center">Índice IES</th>
                    <th className="border border-slate-300 p-2 text-center">Semáforo</th>
                    <th className="border border-slate-300 p-2 text-center">Incidencias</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 font-mono text-xs">
                    <td className="border border-slate-300 p-2 text-center text-slate-500 font-bold">1</td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">{escuela.cue}</td>
                    <td className="border border-slate-300 p-2 font-sans font-semibold text-slate-900">{escuela.nombre}</td>
                    <td className="border border-slate-300 p-2 font-sans">{escuela.nivel}</td>
                    <td className="border border-slate-300 p-2 font-sans">{borrador.tecnicoNombre}</td>
                    <td className="border border-slate-300 p-2 text-center">{borrador.fecha}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                      {Object.keys(borrador.respuestas).length} / 166
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-extrabold text-sm text-[#107c41]">
                      {resultadoIndice.global}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-sans font-bold">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">
                        {resultadoIndice.clasificacion}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-amber-700">
                      {resultadoIndice.incidenciasGeneradas.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Pestañas inferiores de Hojas estilo Excel */}
        <div className="bg-[#f3f4f6] border-t border-slate-300 px-4 py-1 flex items-center justify-between gap-2 flex-shrink-0 text-xs select-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHojaActiva('respuestas')}
              className={`px-3 py-1 font-semibold rounded-t border-t border-x cursor-pointer text-xs transition-colors ${
                hojaActiva === 'respuestas'
                  ? 'bg-white border-slate-300 text-[#107c41] font-bold shadow-xs'
                  : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Hoja 1: Respuestas del Cuestionario ({Object.keys(borrador.respuestas).length})
            </button>

            <button
              onClick={() => setHojaActiva('resumen')}
              className={`px-3 py-1 font-semibold rounded-t border-t border-x cursor-pointer text-xs transition-colors ${
                hojaActiva === 'resumen'
                  ? 'bg-white border-slate-300 text-[#107c41] font-bold shadow-xs'
                  : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏫 Hoja 2: Ficha Resumen Institucional
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Modo: Planilla Simple FoDeMEEP • Listo
          </div>
        </div>
      </div>
    </div>
  );
};
