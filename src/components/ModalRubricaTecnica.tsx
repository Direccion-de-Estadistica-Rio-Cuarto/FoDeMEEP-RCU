import React from 'react';
import type { PreguntaDef } from '../data/preguntasRelevamiento';
import { Icono } from './Icono';

interface ModalRubricaTecnicaProps {
  pregunta: PreguntaDef;
  onCerrar: () => void;
}

export const ModalRubricaTecnica: React.FC<ModalRubricaTecnicaProps> = ({
  pregunta,
  onCerrar,
}) => {
  const rubrica = pregunta.rubrica;
  if (!rubrica) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="panel max-w-lg w-full max-h-[88dvh] overflow-y-auto shadow-2xl p-0 border flex flex-col">
        {/* Cabecera */}

        <div className="p-4 border-b flex items-center justify-between sticky top-0 backdrop-blur-md z-10" style={{ backgroundColor: 'var(--superficie)', borderColor: 'var(--borde)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--marca) 12%, transparent)', color: 'var(--marca-enlace)' }}>
              <Icono name="menu_book" size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--marca-enlace)' }}>
                Rúbrica Técnica Homogénea
              </span>
              <h3 className="font-bold text-sm md:text-base leading-tight" style={{ color: 'var(--texto)' }}>
                Criterios de Ponderación FODEMEP
              </h3>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <Icono name="close" size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--fondo)', borderColor: 'var(--borde)', color: 'var(--texto)' }}>
            <p className="font-bold mb-1" style={{ color: 'var(--texto-suave)' }}>
              Pregunta evaluada (#{pregunta.id}):
            </p>
            <p className="italic font-medium">"{pregunta.texto}"</p>
          </div>

          <div className="space-y-3">
            {/* Excelente */}
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="estado estado--ok">Excelente (90 - 100 pts)</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                {rubrica.excelente}
              </p>
            </div>

            {/* Bueno */}
            <div className="p-3 rounded-xl border bg-sky-500/10 border-sky-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="estado estado--ok">Bueno (70 - 89 pts)</span>
              </div>
              <p className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed font-medium">
                {rubrica.bueno}
              </p>
            </div>

            {/* Regular */}
            <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="estado estado--alerta">Regular (50 - 69 pts)</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                {rubrica.regular}
              </p>
            </div>

            {/* Malo */}
            <div className="p-3 rounded-xl border bg-orange-500/10 border-orange-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="estado estado--grave">Malo (30 - 49 pts)</span>
              </div>
              <p className="text-xs text-orange-900 dark:text-orange-200 leading-relaxed font-medium">
                {rubrica.malo}
              </p>
            </div>

            {/* Crítico */}
            <div className="p-3 rounded-xl border bg-red-500/15 border-red-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="estado estado--grave">Crítico (&lt; 30 pts)</span>
              </div>
              <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed font-bold">
                {rubrica.critico}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ backgroundColor: 'var(--fondo)', borderColor: 'var(--borde)' }}>
          <button
            onClick={onCerrar}
            className="boton boton--primario w-full cursor-pointer"
          >
            Entendido, volver a responder
          </button>
        </div>
      </div>
    </div>
  );
};
