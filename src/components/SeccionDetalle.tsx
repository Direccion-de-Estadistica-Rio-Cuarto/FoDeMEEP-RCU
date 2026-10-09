import React, { useState } from 'react';
import { SeccionDef, PreguntaDef } from '../data/preguntasRelevamiento';
import type { RelevamientoBorrador, FotoRelevamiento } from '../types/fodemep';
import { comprimirImagen } from '../services/storageLocal';
import { ModalRubricaTecnica } from './ModalRubricaTecnica';
import { Icono } from './Icono';

interface SeccionDetalleProps {
  seccion: SeccionDef;
  borrador: RelevamientoBorrador;
  onCambiarRespuesta: (preguntaId: number, valor: string | number | string[]) => void;
  onAgregarFoto: (foto: FotoRelevamiento) => void;
  onEliminarFoto: (fotoId: string) => void;
  onVolverAlMenu: () => void;
  onIrASiguienteSeccion: () => void;
  esUltimaSeccion: boolean;
}

export const SeccionDetalle: React.FC<SeccionDetalleProps> = ({
  seccion,
  borrador,
  onCambiarRespuesta,
  onAgregarFoto,
  onEliminarFoto,
  onVolverAlMenu,
  onIrASiguienteSeccion,
  esUltimaSeccion,
}) => {
  const [preguntaRubricaActiva, setPreguntaRubricaActiva] = useState<PreguntaDef | null>(null);
  const [comprimiendoFoto, setComprimiendoFoto] = useState(false);

  const fotosDeSeccion = borrador.fotos.filter((f) => f.seccionId === seccion.id);

  const handleCapturaFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setComprimiendoFoto(true);
    try {
      const file = files[0];
      const dataUrl = await comprimirImagen(file, 1024, 0.75);

      const nuevaFoto: FotoRelevamiento = {
        id: `foto-${Date.now()}`,
        seccionId: seccion.id,
        dataUrl,
        timestamp: Date.now(),
      };
      onAgregarFoto(nuevaFoto);
    } catch (err) {
      console.error('Error al procesar foto:', err);
    } finally {
      setComprimiendoFoto(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-5"
      style={{
        paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* 1. Barra de Navegación de la Sección */}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onVolverAlMenu}
          className="boton boton--secundario boton--chico cursor-pointer shadow-xs"
        >
          <Icono name="arrow_back" size={18} />
          <span>Menú de Secciones</span>
        </button>
        <span
          className="text-xs font-bold font-mono px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--marca) 12%, transparent)',
            color: 'var(--marca-enlace)',
          }}
        >
          Sección {seccion.numero} de 14
        </span>
      </div>

      {/* 2. Encabezado de la Sección */}
      <div className="panel mb-5 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold leading-snug" style={{ color: 'var(--texto)' }}>
          {seccion.titulo}
        </h2>
        <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--texto-suave)' }}>
          {seccion.descripcion}
        </p>
      </div>

      {/* 3. Formulario de Preguntas */}
      <div className="space-y-4">
        {seccion.preguntas.map((pregunta) => {
          const valorActual = borrador.respuestas[pregunta.id];

          return (
            <div
              key={pregunta.id}
              className="panel shadow-xs transition-all border"
              style={{
                borderColor: pregunta.esCritica
                  ? 'color-mix(in srgb, var(--alerta) 50%, var(--borde))'
                  : 'var(--borde)',
                backgroundColor: pregunta.esCritica
                  ? 'color-mix(in srgb, var(--alerta) 6%, var(--superficie))'
                  : 'var(--superficie)',
              }}
            >
              {/* Título de Pregunta y Botón de Rúbrica */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <label className="text-xs sm:text-sm font-bold leading-snug" style={{ color: 'var(--texto)' }}>
                  <span
                    className="font-mono text-xs mr-1.5 font-bold"
                    style={{ color: 'var(--marca-enlace)' }}
                  >
                    #{pregunta.id}
                  </span>
                  {pregunta.texto}
                  {pregunta.requerido && <span className="text-red-500 ml-1">*</span>}
                </label>

                {pregunta.rubrica && (
                  <button
                    type="button"
                    onClick={() => setPreguntaRubricaActiva(pregunta)}
                    className="boton boton--sutil boton--chico flex-shrink-0 cursor-pointer"
                    title="Ver rúbrica técnica de ponderación"
                  >
                    <Icono name="menu_book" size={16} />
                    <span>Rúbrica</span>
                  </button>
                )}
              </div>

              {/* TIPO 1: Escala de 5 Estados */}
              {pregunta.tipo === 'rating_5' && pregunta.opciones && (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-1.5">
                    {pregunta.opciones.map((op) => {
                      const seleccionado = valorActual === op.id;
                      const esPeligro = op.id === 'cri';
                      const esMalo = op.id === 'mal';
                      const esReg = op.id === 'reg';

                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => onCambiarRespuesta(pregunta.id, op.id)}
                          className={`py-2.5 px-1 rounded-xl text-[11px] font-bold text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                            seleccionado
                              ? esPeligro
                                ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-400'
                                : esMalo
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                : esReg
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70'
                          }`}
                        >
                          <span>{op.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Resumen de Incidencia Asociada si fue calificado Regular o Malo */}
                  {pregunta.opciones.find((op) => op.id === valorActual)?.generaIncidencia && (
                    <div
                      className="mt-2 p-2 rounded-lg text-xs flex items-center justify-between border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--alerta) 12%, var(--superficie))',
                        borderColor: 'var(--alerta)',
                        color: 'var(--texto)',
                      }}
                    >
                      <span className="font-bold">
                        Incidencia: [{pregunta.opciones.find((op) => op.id === valorActual)?.generaIncidencia?.tipo}]
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30">
                        {pregunta.opciones.find((op) => op.id === valorActual)?.generaIncidencia?.jurisdiccion}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TIPO 2: Selección Única */}
              {pregunta.tipo === 'single_choice' && pregunta.opciones && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pregunta.opciones.map((op) => {
                    const seleccionado = valorActual === op.id;
                    const esPeligro = op.generaIncidencia?.esKillSwitch;

                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => onCambiarRespuesta(pregunta.id, op.id)}
                        className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between cursor-pointer ${
                          seleccionado
                            ? esPeligro
                              ? 'bg-red-600 text-white border-red-700 shadow-sm'
                              : 'boton--primario border-transparent shadow-sm'
                            : 'bg-slate-100/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/50'
                        }`}
                      >
                        <span>{op.label}</span>
                        {seleccionado && <Icono name="check" size={16} className="ml-1 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TIPO 3: Selección Múltiple */}
              {pregunta.tipo === 'multiple_choice' && pregunta.opciones && (
                <div className="flex flex-wrap gap-2">
                  {pregunta.opciones.map((op) => {
                    const seleccionados = (valorActual as string[]) || [];
                    const seleccionado = seleccionados.includes(op.id);

                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                          const nuevo = seleccionado
                            ? seleccionados.filter((item) => item !== op.id)
                            : [...seleccionados, op.id];
                          onCambiarRespuesta(pregunta.id, nuevo);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          seleccionado
                            ? 'boton--primario shadow-xs'
                            : 'bg-slate-100/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/50'
                        }`}
                      >
                        {op.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TIPO 4: Numérico con botones táctiles grandes + y - */}
              {pregunta.tipo === 'number' && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-xs bg-slate-50 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(0, Number(valorActual || 0) - 1);
                        onCambiarRespuesta(pregunta.id, val);
                      }}
                      className="w-11 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Icono name="remove" size={18} />
                    </button>
                    <input
                      type="number"
                      value={valorActual ?? ''}
                      onChange={(e) => onCambiarRespuesta(pregunta.id, Number(e.target.value))}
                      placeholder={pregunta.placeholder || '0'}
                      className="w-20 text-center py-2 text-slate-900 dark:text-slate-100 font-bold text-base border-none focus:outline-hidden bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = Number(valorActual || 0) + 1;
                        onCambiarRespuesta(pregunta.id, val);
                      }}
                      className="w-11 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Icono name="add" size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* TIPO 5: Texto Libre o Área de Observaciones */}
              {pregunta.tipo === 'text' && (
                pregunta.placeholder?.toLowerCase().includes('observacion') || pregunta.placeholder?.toLowerCase().includes('detalle') ? (
                  <textarea
                    rows={3}
                    value={(valorActual as string) || ''}
                    onChange={(e) => onCambiarRespuesta(pregunta.id, e.target.value)}
                    placeholder={pregunta.placeholder || 'Detalle observaciones técnicas...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={(valorActual as string) || ''}
                    onChange={(e) => onCambiarRespuesta(pregunta.id, e.target.value)}
                    placeholder={pregunta.placeholder || 'Escriba la información aquí...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs"
                  />
                )
              )}
            </div>
          );
        })}
      </div>


      {/* 4. Módulo de Evidencias Fotográficas de la Sección */}
      <div className="panel mt-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--texto)' }}>
              Evidencias Fotográficas de la Sección
            </h3>
            <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>
              Compresión automática WebP/JPEG &lt; 250 KB
            </p>
          </div>

          <label className="boton boton--secundario boton--chico cursor-pointer shadow-xs">
            <Icono name="photo_camera" size={18} className="text-sky-600" />
            <span>{comprimiendoFoto ? 'Procesando...' : 'Tomar Foto'}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapturaFoto}
              disabled={comprimiendoFoto}
              className="hidden"
            />
          </label>
        </div>

        {fotosDeSeccion.length === 0 ? (
          <div className="p-4 border border-dashed rounded-xl text-center text-xs" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)' }}>
            No se han registrado fotografías aún para esta sección.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {fotosDeSeccion.map((foto) => (
              <div key={foto.id} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-xs aspect-square bg-slate-100">
                <img
                  src={foto.dataUrl}
                  alt="Evidencia técnica"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onEliminarFoto(foto.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                  title="Eliminar foto"
                >
                  <Icono name="delete" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Barra Inferior de Navegación */}
      <div
        className="fixed bottom-0 left-0 right-0 p-3.5 border-t z-30 shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--superficie) 92%, transparent)',
          borderColor: 'var(--borde)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">

          <button
            onClick={onVolverAlMenu}
            className="boton boton--secundario cursor-pointer"
          >
            <Icono name="arrow_back" size={18} />
            <span>Menú</span>
          </button>

          <button
            onClick={onIrASiguienteSeccion}
            className="boton boton--primario cursor-pointer shadow-md"
          >
            <span>{esUltimaSeccion ? 'Ir a Auditoría y Cierre' : 'Siguiente Sección'}</span>
            <Icono name="arrow_forward" size={18} />
          </button>
        </div>
      </div>

      {/* Modal de Rúbrica Técnica */}
      {preguntaRubricaActiva && (
        <ModalRubricaTecnica
          pregunta={preguntaRubricaActiva}
          onCerrar={() => setPreguntaRubricaActiva(null)}
        />
      )}
    </div>
  );
};
