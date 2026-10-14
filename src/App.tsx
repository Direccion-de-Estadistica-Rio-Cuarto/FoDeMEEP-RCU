import { useState, useEffect } from 'react';
import { ESCUELAS_RIO_CUARTO } from './data/escuelasRioCuarto';
import { SECCIONES_RELEVAMIENTO } from './data/preguntasRelevamiento';
import type { Escuela, RelevamientoBorrador, FotoRelevamiento } from './types/fodemep';
import { HeaderMovil } from './components/HeaderMovil';
import { MenuSecciones } from './components/MenuSecciones';
import { SeccionDetalle } from './components/SeccionDetalle';
import { ResumenAuditoria } from './components/ResumenAuditoria';
import { ModalSelectorEscuela } from './components/ModalSelectorEscuela';
import { calcularIndiceInstitucional } from './services/engineIndice';
import {
  guardarBorradorEnStorage,
  cargarBorradorDeStorage,
  limpiarDatosEjemploPrevios,
} from './services/storageLocal';

// Limpiar datos de ejemplo antiguos en memoria local
limpiarDatosEjemploPrevios();

export function App() {
  const [escuelaActual, setEscuelaActual] = useState<Escuela>(ESCUELAS_RIO_CUARTO[0]);
  const [vista, setVista] = useState<'menu' | 'seccion' | 'auditoria'>('menu');
  const [seccionActivaId, setSeccionActivaId] = useState<number>(1);
  const [mostrarSelectorEscuela, setMostrarSelectorEscuela] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Escuchar estado de conectividad en el teléfono
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Estado del borrador actual (inicia 100% en cero para nuevo relevamiento)
  const [borrador, setBorrador] = useState<RelevamientoBorrador>(() => {
    const guardado = cargarBorradorDeStorage(ESCUELAS_RIO_CUARTO[0].id);
    if (guardado) return guardado;

    return {
      escuelaId: ESCUELAS_RIO_CUARTO[0].id,
      tecnicoNombre: 'Técnico Relevador FoDeMEEP',
      fecha: new Date().toISOString().split('T')[0],
      respuestas: {},
      fotos: [],
      seccionesCompletas: [],
      fechaUltimaModificacion: Date.now(),
      finalizado: false,
    };
  });

  // Guardar en Storage al cambiar borrador
  useEffect(() => {
    guardarBorradorEnStorage(borrador);
  }, [borrador]);

  // Cambiar de escuela
  const handleCambiarEscuela = (nuevaEscuela: Escuela) => {
    setEscuelaActual(nuevaEscuela);
    const guardado = cargarBorradorDeStorage(nuevaEscuela.id);
    if (guardado) {
      setBorrador(guardado);
    } else {
      setBorrador({
        escuelaId: nuevaEscuela.id,
        tecnicoNombre: 'Técnico Relevador FoDeMEEP',
        fecha: new Date().toISOString().split('T')[0],
        respuestas: {},
        fotos: [],
        seccionesCompletas: [],
        fechaUltimaModificacion: Date.now(),
        finalizado: false,
      });
    }
    setVista('menu');
  };

  // Modificar respuesta
  const handleCambiarRespuesta = (preguntaId: number, valor: string | number | string[]) => {
    setBorrador((prev) => ({
      ...prev,
      respuestas: { ...prev.respuestas, [preguntaId]: valor },
      fechaUltimaModificacion: Date.now(),
    }));
  };

  // Agregar foto
  const handleAgregarFoto = (foto: FotoRelevamiento) => {
    setBorrador((prev) => ({
      ...prev,
      fotos: [...prev.fotos, foto],
      fechaUltimaModificacion: Date.now(),
    }));
  };

  // Eliminar foto
  const handleEliminarFoto = (fotoId: string) => {
    setBorrador((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((f) => f.id !== fotoId),
      fechaUltimaModificacion: Date.now(),
    }));
  };

  // Cálculo en vivo del índice IES
  const resultadoIndice = calcularIndiceInstitucional(escuelaActual.id, borrador.respuestas);

  const seccionActiva =
    SECCIONES_RELEVAMIENTO.find((s) => s.id === seccionActivaId) || SECCIONES_RELEVAMIENTO[0];

  const handleIrASiguienteSeccion = () => {
    const idx = SECCIONES_RELEVAMIENTO.findIndex((s) => s.id === seccionActivaId);
    if (idx < SECCIONES_RELEVAMIENTO.length - 1) {
      setSeccionActivaId(SECCIONES_RELEVAMIENTO[idx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setVista('auditoria');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cargar simulación completa con evidencia fotográfica
  const handleCargarSimulacion = (simulacion: RelevamientoBorrador) => {
    const esc = ESCUELAS_RIO_CUARTO.find((e) => e.id === simulacion.escuelaId) || ESCUELAS_RIO_CUARTO[0];
    setEscuelaActual(esc);
    setBorrador(simulacion);
    guardarBorradorEnStorage(simulacion);
  };

  // Limpiar datos y resetear a cero
  const handleLimpiarDatos = () => {
    const limpio: RelevamientoBorrador = {
      escuelaId: escuelaActual.id,
      tecnicoNombre: 'Técnico Relevador FoDeMEEP',
      fecha: new Date().toISOString().split('T')[0],
      respuestas: {},
      fotos: [],
      seccionesCompletas: [],
      fechaUltimaModificacion: Date.now(),
      finalizado: false,
    };
    setBorrador(limpio);
    guardarBorradorEnStorage(limpio);
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans select-none antialiased transition-colors duration-150"
      style={{
        backgroundColor: 'var(--fondo)',
        color: 'var(--texto)',
      }}
    >
      {/* Cabecera Móvil Fija */}
      <HeaderMovil
        escuela={escuelaActual}
        onCambiarEscuela={() => setMostrarSelectorEscuela(true)}
        resultadoIndice={resultadoIndice}
        isOffline={isOffline}
        seccionActivaNombre={vista === 'seccion' ? seccionActiva.titulo : vista === 'auditoria' ? 'Auditoría Técnica y Cierre' : undefined}
        onVolver={() => {
          setVista('menu');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {/* VISTA 1: Lista Libre de Secciones */}
        {vista === 'menu' && (
          <MenuSecciones
            escuela={escuelaActual}
            borrador={borrador}
            resultadoIndice={resultadoIndice}
            onSeleccionarSeccion={(id) => {
              setSeccionActivaId(id);
              setVista('seccion');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onIrAAuditoria={() => {
              setVista('auditoria');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}


        {/* VISTA 2: Formulario de la Sección Activa */}
        {vista === 'seccion' && (
          <SeccionDetalle
            seccion={seccionActiva}
            borrador={borrador}
            onCambiarRespuesta={handleCambiarRespuesta}
            onAgregarFoto={handleAgregarFoto}
            onEliminarFoto={handleEliminarFoto}
            onVolverAlMenu={() => {
              setVista('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onIrASiguienteSeccion={handleIrASiguienteSeccion}
            esUltimaSeccion={seccionActivaId === SECCIONES_RELEVAMIENTO[SECCIONES_RELEVAMIENTO.length - 1].id}
          />
        )}

        {/* VISTA 3: Control de Calidad y Cierre */}
        {vista === 'auditoria' && (
          <ResumenAuditoria
            escuela={escuelaActual}
            borrador={borrador}
            resultadoIndice={resultadoIndice}
            onVolverAlMenu={() => {
              setVista('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onConfirmarCierre={() => {
              setBorrador((prev) => ({ ...prev, finalizado: true }));
            }}
          />
        )}
      </main>

      {/* Pie Institucional Oficial (Dirección de Estadística - Gobierno de Río Cuarto) */}
      <footer
        className="mt-auto py-8 border-t"
        style={{
          backgroundColor: 'var(--superficie)',
          borderColor: 'var(--borde)',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--texto-suave)' }}>
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}assets/img/logo-secretaria-gestion.png`}
              alt="Secretaría de Gestión y Participación Ciudadana"
              className="h-7 w-auto object-contain brightness-0 dark:brightness-100 dark:invert-0 opacity-80"
            />
            <div>
              <p className="font-bold text-xs" style={{ color: 'var(--texto)' }}>
                Secretaría de Gestión y Participación Ciudadana
              </p>
              <p className="text-[11px]">
                FoDeMEEP • Dirección de Estadística, Control de Calidad y Procesos
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] space-y-0.5">
            <p className="font-medium" style={{ color: 'var(--texto)' }}>
              Herramienta Homogénea de Infraestructura Escolar
            </p>
            <p>100% Offline-First · Río Cuarto, Córdoba</p>
          </div>
        </div>
      </footer>

      {/* Modal Selector de Escuela */}
      {mostrarSelectorEscuela && (
        <ModalSelectorEscuela
          escuelaActualId={escuelaActual.id}
          onSeleccionar={handleCambiarEscuela}
          onCerrar={() => setMostrarSelectorEscuela(false)}
        />
      )}
    </div>
  );
}


export default App;
