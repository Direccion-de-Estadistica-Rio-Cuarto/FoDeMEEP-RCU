import React, { useState } from 'react';
import type { Escuela } from '../types/fodemep';
import { ESCUELAS_RIO_CUARTO } from '../data/escuelasRioCuarto';
import { Icono } from './Icono';

interface ModalSelectorEscuelaProps {
  escuelaActualId: string;
  onSeleccionar: (escuela: Escuela) => void;
  onCerrar: () => void;
}

export const ModalSelectorEscuela: React.FC<ModalSelectorEscuelaProps> = ({
  escuelaActualId,
  onSeleccionar,
  onCerrar,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [nivelFiltro, setNivelFiltro] = useState<string>('todos');

  const filtradas = ESCUELAS_RIO_CUARTO.filter((e) => {
    const coincideTexto =
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cue.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.barrio.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.direccion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideNivel =
      nivelFiltro === 'todos' ||
      e.nivel.toLowerCase().includes(nivelFiltro.toLowerCase());

    return coincideTexto && coincideNivel;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="panel max-w-xl w-full max-h-[88dvh] flex flex-col shadow-2xl p-0 overflow-hidden border">
        {/* Cabecera */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--borde)' }}>
          <div className="flex items-center gap-2.5">
            <Icono name="school" size={22} style={{ color: 'var(--marca)' }} />
            <div>
              <h3 className="font-bold text-sm md:text-base leading-tight" style={{ color: 'var(--texto)' }}>
                Padrón Oficial de Escuelas Públicas
              </h3>
              <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>
                Río Cuarto ({ESCUELAS_RIO_CUARTO.length} instituciones activas)
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer flex items-center justify-center"
            aria-label="Cerrar selector"
          >
            <Icono name="close" size={20} />
          </button>
        </div>

        {/* Buscador y Filtros por Nivel */}
        <div className="p-3 border-b space-y-2" style={{ backgroundColor: 'var(--fondo)', borderColor: 'var(--borde)' }}>
          <div className="relative flex items-center">
            <Icono name="search" size={18} className="text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, CUE, barrio o calle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-base focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs"
              style={{ color: 'var(--texto)' }}
            />
          </div>


          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'todos', label: 'Todos los niveles' },
              { id: 'inicial', label: 'Inicial' },
              { id: 'primario', label: 'Primario' },
              { id: 'secundario', label: 'Secundario' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setNivelFiltro(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  nivelFiltro === f.id
                    ? 'boton--primario'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Escuelas */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtradas.map((esc) => {
            const esSeleccionada = esc.id === escuelaActualId;
            return (
              <div
                key={esc.id}
                onClick={() => {
                  onSeleccionar(esc);
                  onCerrar();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  esSeleccionada
                    ? 'border-sky-500 shadow-sm'
                    : 'hover:border-slate-400'
                }`}
                style={{
                  backgroundColor: esSeleccionada
                    ? 'color-mix(in srgb, var(--marca) 8%, var(--superficie))'
                    : 'var(--superficie)',
                  borderColor: esSeleccionada ? 'var(--marca)' : 'var(--borde)',
                }}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--marca-enlace)' }}>
                      {esc.nivel} • Barrio {esc.barrio}
                    </span>
                    {esc.tieneRampa && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-full">
                        Rampa
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs md:text-sm truncate mt-0.5" style={{ color: 'var(--texto)' }}>
                    {esc.nombre}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--texto-suave)' }}>
                    CUE: {esc.cue} • {esc.direccion}
                  </p>
                </div>

                {esSeleccionada && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-xs"
                    style={{ backgroundColor: 'var(--marca)' }}
                  >
                    <Icono name="check" size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {filtradas.length === 0 && (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--texto-suave)' }}>
              No se encontraron instituciones públicas con los términos ingresados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
