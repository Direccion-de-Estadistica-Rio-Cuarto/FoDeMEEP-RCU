import React from 'react';
import type { Escuela, ResultadoIndice } from '../types/fodemep';
import { Icono } from './Icono';
import { useTema } from '../services/useTema';

interface HeaderMovilProps {
  escuela: Escuela;
  onCambiarEscuela: () => void;
  resultadoIndice: ResultadoIndice;
  isOffline: boolean;
  seccionActivaNombre?: string;
  onVolver?: () => void;
}

export const HeaderMovil: React.FC<HeaderMovilProps> = ({
  escuela,
  onCambiarEscuela,
  resultadoIndice,
  isOffline,
  seccionActivaNombre,
  onVolver,
}) => {
  const { isOscuro, toggleTema } = useTema();

  return (
    <header
      className="sticky top-0 z-40 shadow-sm transition-colors"
      style={{
        backgroundColor: 'var(--marca)',
        color: 'var(--marca-texto)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* 1. Barra Institucional Superior (Alineación Horizontal Original) */}
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-2.5">
        {/* Logo oficial y títulos alineados */}
        <div className="flex items-center gap-2.5 min-w-0">
          {seccionActivaNombre && onVolver ? (
            <button
              onClick={onVolver}
              className="p-1.5 -ml-1 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              aria-label="Volver al menú de secciones"
            >
              <Icono name="arrow_back" size={20} />
            </button>
          ) : (
            <img
              src={`${import.meta.env.BASE_URL}assets/img/logo-secretaria-gestion.png`}
              alt="Río Cuarto Gobierno - Secretaría de Gestión y Participación Ciudadana"
              className="h-7 sm:h-8 w-auto object-contain flex-shrink-0"
            />
          )}

          <span className="w-px h-6 bg-white/40 flex-shrink-0" aria-hidden="true" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold leading-tight truncate tracking-wide text-white">
              {seccionActivaNombre ? seccionActivaNombre : 'Formulario de Relevamiento'}
            </h1>
            <p className="text-[10px] sm:text-xs text-white/80 leading-tight truncate">
              FoDeMEEP • Dirección de Estadística, Control de Calidad y Procesos
            </p>
          </div>
        </div>

        {/* Acciones de cabecera: Modo offline + Botón Cambio de Tema */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Indicador de Conexión Offline / Online */}
          {isOffline ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs"
              title="Trabajando en modo offline. Los datos se guardan en el dispositivo."
            >
              <Icono name="wifi_off" size={14} />
              <span className="hidden sm:inline">Offline</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/30"
              title="Conexión activa"
            >
              <Icono name="wifi" size={14} className="text-emerald-300" />
              <span className="hidden sm:inline">En Línea</span>
            </span>
          )}

          {/* Botón oficial de Tema Claro / Oscuro con Material Symbols */}
          <button
            type="button"
            onClick={toggleTema}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 active:bg-white/35 text-white transition-all cursor-pointer border border-white/20"
            aria-label={isOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isOscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            <Icono name={isOscuro ? 'light_mode' : 'dark_mode'} size={16} />
          </button>
        </div>
      </div>

      {/* 2. Barra del Establecimiento Activo e Indicador IES */}
      <div className="border-t border-white/15 px-4 py-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Ficha rápida del establecimiento */}
          <div
            onClick={onCambiarEscuela}
            className="flex-1 min-w-0 cursor-pointer group active:opacity-80 transition-opacity"
            title="Toca para cambiar de escuela"
          >
            <div className="flex items-center gap-1 text-[10px] font-semibold text-white/80 uppercase tracking-wider">
              <Icono name="school" size={14} className="text-white" />
              <span>Establecimiento Activo</span>
              <Icono name="expand_more" size={14} className="text-white/80 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <p className="font-extrabold text-xs md:text-sm text-white truncate drop-shadow-xs">
              {escuela.nombre}
            </p>
            <p className="text-[11px] text-white/85 truncate">
              CUE: {escuela.cue} • {escuela.nivel} • {escuela.barrio}
            </p>
          </div>

          {/* Acción Cambiar Escuela en Menú Principal (evita duplicar el IES del KPI inferior) */}
          {!seccionActivaNombre && (
            <button
              type="button"
              onClick={onCambiarEscuela}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-xs font-semibold cursor-pointer border border-white/20 transition-all flex-shrink-0"
              title="Seleccionar otra institución"
            >
              <span>Cambiar</span>
              <Icono name="expand_more" size={14} />
            </button>
          )}

          {/* KPI Dinámico del Índice IES (visible al entrar en una sección o auditoría) */}
          {seccionActivaNombre && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/20 flex-shrink-0">
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-white/80 block">Índice IES</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                    resultadoIndice.global >= 70
                      ? 'bg-emerald-600/90 text-white'
                      : resultadoIndice.global >= 50
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-rose-600 text-white font-extrabold'
                  }`}
                >
                  {resultadoIndice.clasificacion}
                </span>
              </div>

              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-sm transition-all ${
                  resultadoIndice.global >= 70
                    ? 'bg-white text-emerald-700'
                    : resultadoIndice.global >= 50
                    ? 'bg-white text-amber-700'
                    : 'bg-rose-500 text-white ring-2 ring-white animate-pulse'
                }`}
              >
                {resultadoIndice.global}
              </div>
            </div>
          )}
        </div>

        {/* Alerta Roja de Seguridad (Kill-Switch) */}
        {resultadoIndice.penalizadoresAplicados.length > 0 && (
          <div className="mt-2 max-w-4xl mx-auto px-2.5 py-1.5 bg-rose-600 text-white rounded-lg flex items-center gap-2 text-xs font-semibold shadow-sm animate-pulse">
            <Icono name="warning" size={16} className="text-white flex-shrink-0" />
            <span className="truncate text-[11px]">
              ⚠️ Alerta Crítica Inmediata: {resultadoIndice.penalizadoresAplicados[0].motivo}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
