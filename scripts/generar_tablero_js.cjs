const fs = require('fs');
const path = require('path');
const {
  REGLAS_PREGUNTAS,
  MAPA_TIPO_CATALOGO,
  MAPA_DIM_AFECTADA,
  evaluarBorradorSobreInstitucion,
  recalcularResumenGlobalBbdd
} = require('./motor_ies_fodemeep.cjs');

const bbddPath = path.join(__dirname, '..', 'rcu-tablero-template', 'datos', 'bbdd-fodemeep.json');
const bbddJsonStr = fs.readFileSync(bbddPath, 'utf8');

const barriosPath = path.join(__dirname, '..', 'rcu-tablero-template', 'datos', 'barrios-rcu.json');
const barriosJsonStr = fs.readFileSync(barriosPath, 'utf8');

// Verificar que no haya ningún patrón hexadecimal #xxx o #xxxxxx en el JSON
const hexMatch = bbddJsonStr.match(/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/g);
if (hexMatch) {
  console.error('Encontrado patrón hex en JSON:', hexMatch);
  process.exit(1);
}

const jsContent = `/* ==========================================================================
   tablero.js — Monitor de Control del Programa FoDeMEEP RCU
   Dirección de Estadística, Control de Calidad y Procesos · Gobierno de Río Cuarto
   ========================================================================== */

(function () {
  'use strict';

  /* --- Reglas y Motor de Evaluación IES (Espejo de PWA de Campo) ---------- */
  const REGLAS_PREGUNTAS = ${JSON.stringify(REGLAS_PREGUNTAS)};
  const MAPA_TIPO_CATALOGO = ${JSON.stringify(MAPA_TIPO_CATALOGO)};
  const MAPA_DIM_AFECTADA = ${JSON.stringify(MAPA_DIM_AFECTADA)};
  ${evaluarBorradorSobreInstitucion.toString()}
  ${recalcularResumenGlobalBbdd.toString()}

  /* --- Estado Reactivo de la Aplicación ----------------------------------- */
  const ESTADO = {
    bbdd: null,
    barriosOficiales: [],
    borradoresActivos: {},
    mostrarBarrios: true,
    vistaActiva: 'mapa',
    modoMapa: 'semaforo',
    zoomMapa: 13,
    centroLat: -33.1240,
    centroLng: -64.3490,
    arrastrandoMapa: false,
    dragInicioX: 0,
    dragInicioY: 0,
    dragCentroMundoX: 0,
    dragCentroMundoY: 0,
    huboArrastre: false,
    filtros: {
      competencia: 'TODAS',
      universo: 'TODOS',
      nivel: 'TODOS',
      macrozona: 'TODAS',
      barrio: 'TODOS',
      semaforo: 'TODOS',
      busqueda: ''
    },
    ordenPadron: 'ies-asc',
    escuelaSeleccionadaId: 'ESC-001',
    // Mapa de incidencias resueltas en el simulador interactivo: { [incidenciaId]: boolean }
    simulacionResueltas: {}
  };

  const CENTROS_MACROZONA = {
    'TODAS': { lat: -33.1240, lng: -64.3490, zoom: 13 },
    'Sector A (Alberdi)': { lat: -33.1370, lng: -64.3295, zoom: 14 },
    'Sector B (Banda Norte)': { lat: -33.1035, lng: -64.3375, zoom: 14 },
    'Sector C (Centro)': { lat: -33.1280, lng: -64.3540, zoom: 14 },
    'Sector D (Distrito Periférico)': { lat: -33.1220, lng: -64.3520, zoom: 12 }
  };

  /* --- Inicialización y Carga de la BBDD del Relevamiento ----------------- */
  let ultimaFirmaSyncVivo = '';

  function calcularFirmaActivos(mapaActivos) {
    if (!mapaActivos || typeof mapaActivos !== 'object') return '';
    return Object.keys(mapaActivos).sort().map(function (k) {
      const b = mapaActivos[k] || {};
      const r = b.Respuestas || b.respuestas || {};
      const f = b.fotos || b.evidencias || [];
      return k + ':' + Object.keys(r).length + ':' + f.length + ':' + (b.fechaUltimaModificacion || b.timestamp || 0);
    }).join('|');
  }

  async function iniciar() {
    try {
      let datos = null;
      try {
        const resp = await fetch('datos/bbdd-fodemeep.json?t=' + Date.now(), { cache: 'no-store' });
        if (resp.ok) {
          datos = await resp.json();
        }
      } catch (e) {
        // Fallback inmediato para apertura local directa (file://)
        datos = BBDD_RESPALDO_LOCAL;
      }

      if (!datos) {
        datos = BBDD_RESPALDO_LOCAL;
      }

      let capaBarrios = null;
      try {
        const respBarrios = await fetch('datos/barrios-rcu.json');
        if (respBarrios.ok) {
          capaBarrios = await respBarrios.json();
        }
      } catch (e) {
        capaBarrios = BARRIOS_RESPALDO_LOCAL;
      }
      if (!capaBarrios) {
        capaBarrios = BARRIOS_RESPALDO_LOCAL;
      }

      ESTADO.bbdd = datos;
      ESTADO.barriosOficiales = (capaBarrios && capaBarrios.barrios) ? capaBarrios.barrios : [];
      await integrarBorradoresLocalStorage();
      inicializarEstadoSimulacion();
      poblarSelectorBarriosOficiales();
      vincularEventosUI();
      vincularInteraccionMapaArgenmap();
      vincularSincronizacionTiempoReal();
      renderizarTodo();
    } catch (error) {
      mostrarError(error.message || 'Error al inicializar el Monitor FoDeMEEP.');
    }
  }

  /* Puebla el selector #filtro-barrio con los 62 barrios estandarizados oficiales */
  function poblarSelectorBarriosOficiales() {
    const sel = document.getElementById('filtro-barrio');
    if (!sel || !ESTADO.bbdd) return;

    const conteoPorBarrio = {};
    ESTADO.bbdd.instituciones.forEach(function (inst) {
      const nb = inst.barrio || 'Sin barrio';
      conteoPorBarrio[nb] = (conteoPorBarrio[nb] || 0) + 1;
    });

    const listaBarrios = ESTADO.barriosOficiales.slice().sort(function (a, b) {
      const ca = conteoPorBarrio[a.nombre] || 0;
      const cb = conteoPorBarrio[b.nombre] || 0;
      if (cb !== ca) return cb - ca;
      return a.nombre.localeCompare(b.nombre, 'es');
    });

    let html = '<option value="TODOS">Todos los barrios (62 vecinales)</option>';
    const conEscuelas = listaBarrios.filter(function (b) { return (conteoPorBarrio[b.nombre] || 0) > 0; });
    const sinEscuelas = listaBarrios.filter(function (b) { return !(conteoPorBarrio[b.nombre] || 0); });

    html += '<optgroup label="Barrios con Establecimientos Públicos (' + conEscuelas.length + ')">';
    conEscuelas.forEach(function (b) {
      const cant = conteoPorBarrio[b.nombre] || 0;
      html += '<option value="' + escapar(b.nombre) + '">' + escapar(b.nombre) + ' (' + cant + ' esc.)</option>';
    });
    if (conteoPorBarrio['Ejido Periurbano / Rural']) {
      html += '<option value="Ejido Periurbano / Rural">Ejido Periurbano / Rural (' + conteoPorBarrio['Ejido Periurbano / Rural'] + ' esc.)</option>';
    }
    html += '</optgroup>';

    if (sinEscuelas.length > 0) {
      html += '<optgroup label="Otros Barrios Oficiales sin Escuelas Públicas (' + sinEscuelas.length + ')">';
      sinEscuelas.forEach(function (b) {
        html += '<option value="' + escapar(b.nombre) + '">' + escapar(b.nombre) + ' (Vecinal N° ' + b.codvec + ')</option>';
      });
      html += '</optgroup>';
    }

    sel.innerHTML = html;
  }

  function buscarInstitucionPorBorrador(escuelaId) {
    if (!ESTADO.bbdd || !escuelaId) return null;
    const cueLimpio = String(escuelaId).replace(/^ESC-/, '');
    return ESTADO.bbdd.instituciones.find(function (i) {
      return i.id === escuelaId || ('ESC-' + i.cue) === escuelaId || String(i.cue) === cueLimpio;
    });
  }

  function obtenerIdEscuelaBorrador(b) {
    if (!b || typeof b !== 'object') return null;
    return b.institucionId || b.escuelaId || b.institucionCue || null;
  }

  function aplicarListaBorradores(listaBorradores, reRenderizar) {
    if (!ESTADO.bbdd || !Array.isArray(listaBorradores) || listaBorradores.length === 0) return false;
    let huboCambios = false;
    let ultimaInstImpactada = null;

    listaBorradores.forEach(function (b) {
      const idEsc = obtenerIdEscuelaBorrador(b);
      if (!idEsc) return;
      const inst = buscarInstitucionPorBorrador(idEsc);
      if (inst) {
        const prev = ESTADO.borradoresActivos[inst.id];
        const fotosNuevas = (b.fotos || b.evidencias || []);
        const fotosPrevias = prev ? (prev.fotos || prev.evidencias || []) : (inst.relevamiento && inst.relevamiento.evidencias ? inst.relevamiento.evidencias : []);
        const respPrev = prev ? (prev.Respuestas || prev.respuestas || {}) : {};
        const respEntrantes = b.Respuestas || b.respuestas || {};
        const nRespPrev = Object.keys(respPrev).length;
        const nRespEnt = Object.keys(respEntrantes).length;
        const respFinales = nRespEnt >= nRespPrev
          ? Object.assign({}, respPrev, respEntrantes)
          : Object.assign({}, respEntrantes, respPrev);

        const mapaFotos = {};
        fotosPrevias.concat(fotosNuevas).forEach(function (f) {
          if (f && f.dataUrl) {
            mapaFotos[f.id || (f.seccionId + '-' + f.timestamp)] = f;
          }
        });

        const borradorCombinado = Object.assign({}, prev || {}, b, {
          Respuestas: respFinales,
          respuestas: respFinales,
          fotos: Object.values(mapaFotos)
        });

        const aplicado = evaluarBorradorSobreInstitucion(inst, borradorCombinado);
        if (aplicado) {
          ESTADO.borradoresActivos[inst.id] = borradorCombinado;
          huboCambios = true;
          ultimaInstImpactada = inst;
        }
      }
    });

    if (huboCambios) {
      recalcularResumenGlobalBbdd(ESTADO.bbdd);
      inicializarEstadoSimulacion();

      // Si la escuela seleccionada actualmente está "Sin relevar", apuntar automáticamente a la escuela relevada
      const selActual = ESTADO.bbdd.instituciones.find(function (i) { return i.id === ESTADO.escuelaSeleccionadaId; });
      if ((!selActual || selActual.ies.clasificacion === 'Sin relevar') && ultimaInstImpactada) {
        ESTADO.escuelaSeleccionadaId = ultimaInstImpactada.id;
      }

      if (reRenderizar) {
        renderizarTodo();
      }
    }
    return huboCambios;
  }

  /* Integra relevamientos desde localStorage, IndexedDB y el endpoint /api/relevamientos-vivos */
  async function integrarBorradoresLocalStorage() {
    if (!ESTADO.bbdd) return;
    const recolectados = [];
    let servidorLocalOk = false;

    // 1. Leer claves fodemep_relevamiento_v2_* desde localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf('fodemep_relevamiento_v2_') === 0) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const b = JSON.parse(raw);
            if (obtenerIdEscuelaBorrador(b)) recolectados.push(b);
          }
        }
      }
    } catch (e) {}

    // 2. Leer desde IndexedDB (FoDeMEEP_CAMPO_DB -> relevamientos)
    try {
      if (window.indexedDB) {
        const desdeIDB = await new Promise(function (resolve) {
          const req = window.indexedDB.open('FoDeMEEP_CAMPO_DB', 1);
          req.onerror = function () { resolve([]); };
          req.onsuccess = function (ev) {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains('relevamientos')) return resolve([]);
            const tx = db.transaction('relevamientos', 'readonly');
            const getAll = tx.objectStore('relevamientos').getAll();
            getAll.onsuccess = function () { resolve(getAll.result || []); };
            getAll.onerror = function () { resolve([]); };
          };
        });
        desdeIDB.forEach(function (b) {
          if (obtenerIdEscuelaBorrador(b)) recolectados.push(b);
        });
      }
    } catch (e) {}

    // 3. Leer desde /api/relevamientos-vivos (servidor local Node sin bloqueo CORS)
    try {
      const resp = await fetch('/api/relevamientos-vivos?t=' + Date.now(), { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.activos) {
          servidorLocalOk = true;
          ultimaFirmaSyncVivo = calcularFirmaActivos(data.activos);
          Object.values(data.activos).forEach(function (b) {
            if (obtenerIdEscuelaBorrador(b)) recolectados.push(b);
          });
        }
      }
    } catch (e) {}

    // 4. Solo si no hay servidor local activo (ej. GitHub Pages estático), consultar ntfy.sh directamente
    if (!servidorLocalOk) {
      try {
        const respCloud = await fetch('https://ntfy.sh/fodemep_rcu_sync_2026_prod/json?poll=1&since=48h');
        if (respCloud.ok) {
          const textCloud = await respCloud.text();
          if (textCloud && textCloud.trim()) {
            const lineas = textCloud.trim().split(String.fromCharCode(10));
            for (let idxL = 0; idxL < lineas.length; idxL++) {
              try {
                const evt = JSON.parse(lineas[idxL]);
                if (evt && evt.event === 'message') {
                  let parsed = null;
                  if (evt.attachment && evt.attachment.url) {
                    const attResp = await fetch(evt.attachment.url);
                    if (attResp.ok) parsed = await attResp.json();
                  } else if (evt.message) {
                    parsed = JSON.parse(evt.message);
                  }
                  if (parsed) {
                    if (obtenerIdEscuelaBorrador(parsed)) recolectados.push(parsed);
                    else if (parsed.borrador && obtenerIdEscuelaBorrador(parsed.borrador)) recolectados.push(parsed.borrador);
                    else if (Array.isArray(parsed.borradores)) {
                      parsed.borradores.forEach(function (x) { if (obtenerIdEscuelaBorrador(x)) recolectados.push(x); });
                    }
                  }
                }
              } catch (errLine) {}
            }
          }
        }
      } catch (e) {}
    }

    if (recolectados.length > 0) {
      aplicarListaBorradores(recolectados, false);
    }

    // Si ya hay alguna escuela relevada en bbdd-fodemeep.json, seleccionar por defecto la que tenga más respuestas cargadas
    const relevadasOrdenadas = ESTADO.bbdd.instituciones.filter(function (i) {
      return i.ies && i.ies.clasificacion !== 'Sin relevar';
    }).sort(function (a, b) {
      const ra = (a.relevamiento && a.relevamiento.respuestasCargadas) || 0;
      const rb = (b.relevamiento && b.relevamiento.respuestasCargadas) || 0;
      return rb - ra;
    });
    if (relevadasOrdenadas.length > 0) {
      ESTADO.escuelaSeleccionadaId = relevadasOrdenadas[0].id;
    }
  }

  /* Vincula escuchas en vivo (Polling /api/relevamientos-vivos, BroadcastChannel, Storage, postMessage y SSE Cloud Relay) */
  function vincularSincronizacionTiempoReal() {
    // Polling automático cada 3 segundos contra el servidor local para actualizar el Monitor sin tocar F5
    setInterval(async function () {
      try {
        const resp = await fetch('/api/relevamientos-vivos?t=' + Date.now(), { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.activos) {
            const nuevaFirma = calcularFirmaActivos(data.activos);
            if (nuevaFirma && nuevaFirma !== ultimaFirmaSyncVivo) {
              ultimaFirmaSyncVivo = nuevaFirma;
              const lista = Object.values(data.activos).filter(function (b) { return Boolean(obtenerIdEscuelaBorrador(b)); });
              if (lista.length > 0) {
                aplicarListaBorradores(lista, true);
              }
            }
          }
        }
      } catch (e) {}
    }, 3000);

    window.addEventListener('storage', function (ev) {
      if (ev.key && ev.key.indexOf('fodemep_relevamiento_v2_') === 0 && ev.newValue) {
        try {
          const b = JSON.parse(ev.newValue);
          if (obtenerIdEscuelaBorrador(b)) aplicarListaBorradores([b], true);
        } catch (e) {}
      }
    });

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const canal = new BroadcastChannel('fodemep_live_channel');
        canal.onmessage = function (msg) {
          if (msg.data && msg.data.borrador) {
            aplicarListaBorradores([msg.data.borrador], true);
          }
        };
      } catch (e) {}
    }

    window.addEventListener('message', function (ev) {
      if (ev.data && ev.data.tipo === 'FODEMEEP_SYNC_BORRADORES' && Array.isArray(ev.data.borradores)) {
        const cambio = aplicarListaBorradores(ev.data.borradores, true);
        if (cambio) {
          fetch('/api/relevamientos-vivos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borradores: ev.data.borradores })
          }).catch(function () {});
        }
      }
    });

    // Suscripción SSE en tiempo real al Relay Cloud para recibir notificaciones al instante
    if (typeof EventSource !== 'undefined') {
      try {
        const sse = new EventSource('https://ntfy.sh/fodemep_rcu_sync_2026_prod/sse');
        sse.onmessage = async function (ev) {
          try {
            const parsed = JSON.parse(ev.data);
            let payload = null;
            if (parsed && parsed.attachment && parsed.attachment.url) {
              const rAtt = await fetch(parsed.attachment.url);
              if (rAtt.ok) payload = await rAtt.json();
            } else if (parsed && parsed.message) {
              payload = JSON.parse(parsed.message);
            } else {
              payload = parsed;
            }
            if (obtenerIdEscuelaBorrador(payload)) {
              aplicarListaBorradores([payload], true);
            } else if (payload && payload.borrador && obtenerIdEscuelaBorrador(payload.borrador)) {
              aplicarListaBorradores([payload.borrador], true);
            } else if (payload && Array.isArray(payload.borradores)) {
              aplicarListaBorradores(payload.borradores, true);
            }
          } catch (errSse) {}
        };
      } catch (e) {}
    }

    // Montar puentes ocultos hacia localhost:5173 y GitHub Pages para sincronizar borradores entre orígenes en el mismo navegador
    const puentes = [
      'http://localhost:5173/puente-sync.html',
      'https://direccion-de-estadistica-rio-cuarto.github.io/FoDeMEEP-RCU/puente-sync.html'
    ];
    puentes.forEach(function (urlPuente) {
      if (window.location.href.indexOf(urlPuente.replace('/puente-sync.html', '')) === 0) return;
      const iframe = document.createElement('iframe');
      iframe.src = urlPuente;
      iframe.style.display = 'none';
      iframe.title = 'Puente de sincronización FoDeMEEP';
      document.body.appendChild(iframe);
    });
  }

  function inicializarEstadoSimulacion() {
    ESTADO.simulacionResueltas = {};
    if (!ESTADO.bbdd) return;
    ESTADO.bbdd.instituciones.forEach(function (inst) {
      inst.incidencias.forEach(function (inc) {
        ESTADO.simulacionResueltas[inc.id] = (inc.estado === 'RESUELTA');
      });
    });
  }

  /* --- Motor Matemático Dinámico del Índice IES (0-100) ------------------- */
  function obtenerEstadoDinamicoInstitucion(inst) {
    const subOriginal = inst.ies.subindices;
    const subDinamico = {
      seguridadCritica: subOriginal.seguridadCritica,
      aguaSaneamiento: subOriginal.aguaSaneamiento,
      estructuraCubiertas: subOriginal.estructuraCubiertas,
      climatizacion: subOriginal.climatizacion,
      alimentacionCocina: subOriginal.alimentacionCocina,
      accesibilidad: subOriginal.accesibilidad,
      entornoExterior: subOriginal.entornoExterior
    };

    if (
      (inst.ies.clasificacion === 'Sin relevar' || (inst.relevamiento && inst.relevamiento.estado === 'SIN_RELEVAR')) &&
      inst.ies.global === 0 &&
      (!inst.incidencias || inst.incidencias.length === 0) &&
      !(inst.relevamiento && inst.relevamiento.respuestasCargadas > 0)
    ) {
      return {
        puntajeBase: 0,
        factorKillSwitch: 1.0,
        global: 0,
        variacionSimulada: 0,
        intervencionesSimuladas: 0,
        clasificacion: 'Sin relevar',
        tieneKillSwitch: false,
        motivoKillSwitch: null,
        subindices: subDinamico
      };
    }

    let puntosRecuperados = 0;
    let killSwitchActivo = false;
    let factorKillSwitch = 1.0;
    let motivoKillSwitch = null;

    const mapaDimensionPorRubro = {
      GAS: 'seguridadCritica',
      ELECTRICIDAD: 'seguridadCritica',
      MATAFUEGOS: 'seguridadCritica',
      PLOMERIA: 'aguaSaneamiento',
      BOMBA: 'aguaSaneamiento',
      LIMPIEZA_TANQUE: 'aguaSaneamiento',
      DESAGOTE: 'aguaSaneamiento',
      LIMPIEZA_DESAGUES: 'aguaSaneamiento',
      DESINFECCION: 'aguaSaneamiento',
      CAMION_CISTERNA: 'aguaSaneamiento',
      FILTRACIONES: 'estructuraCubiertas',
      ALBANILERIA: 'estructuraCubiertas',
      HERRERIA: 'estructuraCubiertas',
      PINTURA: 'estructuraCubiertas',
      OBRA: 'estructuraCubiertas',
      VARIOS: 'estructuraCubiertas',
      MOBILIARIO: 'estructuraCubiertas',
      REPARACION_ARTEFACTOS: 'climatizacion',
      CLIMATIZACION: 'climatizacion',
      PODA_CORTE_PASTO: 'entornoExterior'
    };

    let intervencionesSimuladas = 0;

    inst.incidencias.forEach(function (inc) {
      const estabaResuelta = (inc.estado === 'RESUELTA');
      const ahoraResuelta = Boolean(ESTADO.simulacionResueltas[inc.id]);
      const dim = mapaDimensionPorRubro[inc.tipoCodigo] || 'estructuraCubiertas';
      const dimCompleta = subOriginal[dim] > 0;

      if (!estabaResuelta && ahoraResuelta) {
        if (dimCompleta) {
          subDinamico[dim] = Math.min(100, subDinamico[dim] + inc.impactoPuntosIes * 2);
        }
        puntosRecuperados += inc.impactoPuntosIes;
        intervencionesSimuladas++;
      } else if (estabaResuelta && !ahoraResuelta) {
        if (dimCompleta) {
          subDinamico[dim] = Math.max(10, subDinamico[dim] - inc.impactoPuntosIes * 2);
        }
        puntosRecuperados -= inc.impactoPuntosIes;
      }

      if (inc.esKillSwitch && !ahoraResuelta) {
        killSwitchActivo = true;
        factorKillSwitch = Math.min(factorKillSwitch, inc.factorPenalizacion || 0.75);
        motivoKillSwitch = inc.titulo + ' (Factor ×' + (inc.factorPenalizacion || 0.75).toFixed(2).replace('.', ',') + ')';
      }
    });

    const puntajeBase = Math.round(
      subDinamico.seguridadCritica * 0.25 +
      subDinamico.aguaSaneamiento * 0.20 +
      subDinamico.estructuraCubiertas * 0.18 +
      subDinamico.climatizacion * 0.15 +
      subDinamico.alimentacionCocina * 0.10 +
      subDinamico.accesibilidad * 0.07 +
      subDinamico.entornoExterior * 0.05
    );

    const globalFinal = Math.max(0, Math.min(100, Math.round(puntajeBase * factorKillSwitch)));
    let clasificacion = 'Óptimo';
    if (killSwitchActivo || globalFinal < 50) clasificacion = 'Crítico';
    else if (globalFinal < 70) clasificacion = 'Regular';
    else if (globalFinal < 85) clasificacion = 'Bueno';

    return {
      puntajeBase: puntajeBase,
      factorKillSwitch: factorKillSwitch,
      global: globalFinal,
      variacionSimulada: globalFinal - inst.ies.global,
      intervencionesSimuladas: intervencionesSimuladas,
      clasificacion: clasificacion,
      tieneKillSwitch: killSwitchActivo,
      motivoKillSwitch: motivoKillSwitch || (killSwitchActivo ? inst.ies.motivoKillSwitch : null),
      subindices: subDinamico
    };
  }

  /* --- Filtrado Reactivo de Instituciones --------------------------------- */
  function obtenerInstitucionesFiltradas() {
    if (!ESTADO.bbdd) return [];
    const f = ESTADO.filtros;
    const q = f.busqueda.trim().toLowerCase();

    return ESTADO.bbdd.instituciones.filter(function (inst) {
      const estDin = obtenerEstadoDinamicoInstitucion(inst);

      // 1. Universo / Modalidad
      if (f.universo === 'COMUN' && !inst.esModalidadComun) return false;
      if (f.universo === 'OTRAS' && inst.esModalidadComun) return false;

      // 2. Nivel educativo
      if (f.nivel !== 'TODOS') {
        if (!String(inst.nivel).toLowerCase().includes(f.nivel.toLowerCase())) return false;
      }

      // 3. Macrozona y División Barrial Oficial (62 Barrios)
      if (f.macrozona !== 'TODAS' && inst.macrozona !== f.macrozona) return false;
      if (f.barrio !== 'TODOS' && inst.barrio !== f.barrio) return false;

      // 4. Semáforo IES
      if (f.semaforo !== 'TODOS' && estDin.clasificacion !== f.semaforo) return false;

      // 5. Demarcación de Competencia
      if (f.competencia === 'FoDeMEEP') {
        const tieneFodemeep = inst.incidencias.some(function (inc) {
          return inc.jurisdiccion === 'FoDeMEEP' && !ESTADO.simulacionResueltas[inc.id];
        });
        if (!tieneFodemeep) return false;
      } else if (f.competencia === 'PROVINCIA_MAYOR') {
        const tieneProv = inst.incidencias.some(function (inc) {
          return inc.jurisdiccion === 'PROVINCIA_MAYOR';
        });
        if (!tieneProv) return false;
      } else if (f.competencia === 'KILL_SWITCH') {
        if (!estDin.tieneKillSwitch) return false;
      }

      // 6. Búsqueda textual
      if (q) {
        const texto = (inst.nombre + ' ' + inst.cue + ' ' + inst.barrio + ' ' + inst.domicilio + ' ' + inst.codigoEmp).toLowerCase();
        if (!texto.includes(q)) return false;
      }

      return true;
    });
  }

  /* --- Renderizado Integral del Tablero ----------------------------------- */
  function renderizarTodo() {
    const filtradas = obtenerInstitucionesFiltradas();
    renderizarKpisEjecutivos(filtradas);
    renderizarMapaGeoespacial(filtradas);
    renderizarPanelSeleccionMapa(filtradas);
    renderizarAlertasCriticas(filtradas);
    renderizarVistaTrazabilidad();
    renderizarVistaCompetencias(filtradas);
    renderizarVistaModeloIndice(filtradas);
    renderizarVistaPadron(filtradas);
  }

  /* --- 1. KPIs Ejecutivos (.kpi en #indicadores) -------------------------- */
  function renderizarKpisEjecutivos(lista) {
    const cont = document.getElementById('indicadores');
    if (!cont) return;

    const total = lista.length;
    const matricula = lista.reduce(function (acc, i) { return acc + (i.matricula2025 || 0); }, 0);

    let optimo = 0, bueno = 0, regular = 0, critico = 0, sinRelevar = 0, killSwitches = 0;
    let sumaIesRelevadas = 0, cantRelevadas = 0;
    let incFodemeepActivas = 0, montoFodemeep = 0;
    let incProvinciaActivas = 0, montoProvincia = 0;

    lista.forEach(function (i) {
      const est = obtenerEstadoDinamicoInstitucion(i);
      if (est.clasificacion === 'Sin relevar') {
        sinRelevar++;
      } else {
        cantRelevadas++;
        sumaIesRelevadas += est.global;
        if (est.clasificacion === 'Óptimo') optimo++;
        else if (est.clasificacion === 'Bueno') bueno++;
        else if (est.clasificacion === 'Regular') regular++;
        else critico++;
      }

      if (est.tieneKillSwitch) killSwitches++;

      i.incidencias.forEach(function (inc) {
        const resuelta = Boolean(ESTADO.simulacionResueltas[inc.id]);
        if (inc.jurisdiccion === 'FoDeMEEP') {
          if (!resuelta) incFodemeepActivas++;
          montoFodemeep += inc.costoEstimado;
        } else if (inc.jurisdiccion === 'PROVINCIA_MAYOR') {
          if (!resuelta) incProvinciaActivas++;
          montoProvincia += inc.costoEstimado;
        }
      });
    });

    const promedioIes = cantRelevadas > 0 ? (sumaIesRelevadas / cantRelevadas).toFixed(1).replace('.', ',') : '0,0';

    const kpis = [
      {
        etiqueta: 'Índice IES Promedio (0–100)',
        valor: cantRelevadas > 0 ? (promedioIes + ' pts') : 'Sin relevar',
        detalle: cantRelevadas > 0
          ? '<span class="estado ' + claseEstadoDesdeTexto(Number(promedioIes.replace(',', '.')) >= 70 ? 'Bueno' : 'Regular') + '">' +
            (Number(promedioIes.replace(',', '.')) >= 85 ? 'Estándar Óptimo' : Number(promedioIes.replace(',', '.')) >= 70 ? 'Rango Bueno' : 'En Seguimiento') +
            '</span> · ' + cantRelevadas + ' relevadas'
          : '<span class="estado estado--neutro">Pendiente de relevamiento</span> · 0 consolidadas'
      },
      {
        etiqueta: 'Establecimientos en Vista',
        valor: formatearNumero(total) + ' / ' + ESTADO.bbdd.instituciones.length,
        detalle: formatearNumero(matricula) + ' estudiantes alcanzados en Río Cuarto'
      },
      {
        etiqueta: 'Semáforo Situacional IES',
        valor: cantRelevadas > 0 ? ((optimo + bueno) + ' en regla') : (sinRelevar + ' sin relevar'),
        detalle: 'Óptimo: ' + optimo + ' · Bueno: ' + bueno + ' · Regular: ' + regular + ' · Crítico: ' + critico
      },
      {
        etiqueta: 'Riesgo Crítico (Kill-Switch)',
        valor: String(killSwitches),
        detalle: killSwitches > 0
          ? '<span class="estado estado--grave">Despacho Prioritario</span> Gas / Tableros / Techos'
          : '<span class="estado estado--ok">Sin bloqueos críticos</span>'
      },
      {
        etiqueta: 'Competencia FoDeMEEP (Muni)',
        valor: incFodemeepActivas + ' activas',
        detalle: 'Inversión estimada: $' + formatearMillones(montoFodemeep) + ' (Mantenimiento)'
      },
      {
        etiqueta: 'Obras Mayores (Provincia)',
        valor: incProvinciaActivas + ' obras',
        detalle: 'Expedientes provinciales: $' + formatearMillones(montoProvincia) + ' (Estructural)'
      }
    ];

    cont.innerHTML = kpis.map(function (k) {
      return '<div class="kpi">' +
        '<p class="etiqueta">' + escapar(k.etiqueta) + '</p>' +
        '<p class="valor">' + escapar(k.valor) + '</p>' +
        '<p class="detalle">' + k.detalle + '</p>' +
      '</div>';
    }).join('');
  }

  /* --- 2. Mapa Geoespacial con Argenmap Gris + División Barrial Oficial --- */
  const MAPA_ANCHO = 860;
  const MAPA_ALTO = 540;
  const URL_ARGENMAP_GRIS = 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png';

  function latLngAPixelMundo(lat, lng, z) {
    const n = Math.pow(2, z) * 256;
    const x = ((lng + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    return { x: x, y: y };
  }

  function pixelMundoALatLng(wx, wy, z) {
    const n = Math.pow(2, z) * 256;
    const lng = (wx / n) * 360 - 180;
    const mercN = Math.PI - (2 * Math.PI * wy) / n;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(mercN) - Math.exp(-mercN)));
    return { lat: lat, lng: lng };
  }

  function centrarEnBarrioOficial(nombreBarrio) {
    if (!nombreBarrio || nombreBarrio === 'TODOS') {
      ESTADO.centroLat = -33.1240;
      ESTADO.centroLng = -64.3490;
      ESTADO.zoomMapa = 13;
      return;
    }
    const b = ESTADO.barriosOficiales.find(function (item) { return item.nombre === nombreBarrio; });
    if (b && b.centroide) {
      ESTADO.centroLat = b.centroide.lat;
      ESTADO.centroLng = b.centroide.lng;
      ESTADO.zoomMapa = 15;
    } else if (nombreBarrio === 'Ejido Periurbano / Rural') {
      ESTADO.centroLat = -33.1150;
      ESTADO.centroLng = -64.3490;
      ESTADO.zoomMapa = 12;
    }
  }

  function renderizarMapaGeoespacial(lista) {
    const svg = document.getElementById('svg-mapa-rcu');
    const leyenda = document.getElementById('leyenda-mapa');
    const contZonas = document.getElementById('resumen-zonas-mapa');
    const contMapa = document.getElementById('contenedor-svg-mapa');
    if (!svg) return;

    // Asegurar etiqueta de atribución de Argenmap Gris (IGN) + División Barrial RCU
    if (contMapa && !contMapa.querySelector('.atribucion-argenmap')) {
      const atrib = document.createElement('div');
      atrib.className = 'atribucion-argenmap';
      atrib.textContent = 'Base: Argenmap Gris (IGN) · Capas: 62 Barrios Oficiales (Estadística RCU)';
      contMapa.appendChild(atrib);
    }

    // Actualizar leyenda según modo del mapa
    if (leyenda) {
      const txtBarrioActivo = ESTADO.filtros.barrio !== 'TODOS'
        ? ' · Barrio: ' + escapar(ESTADO.filtros.barrio)
        : ' · 62 Barrios RCU';
      if (ESTADO.modoMapa === 'competencia') {
        leyenda.innerHTML =
          '<span class="item-leyenda"><span class="punto-leyenda punto--optimo"></span> Intervención FoDeMEEP (Mantenimiento Municipal)</span>' +
          '<span class="item-leyenda"><span class="punto-leyenda punto--provincia"></span> Requiere Obra Mayor de Provincia (Infraestructura Ministerial)</span>' +
          '<span class="item-leyenda"><span class="punto-leyenda punto--critico"></span> Alerta Kill-Switch Activa</span>' +
          '<span class="item-leyenda"><span class="icono icono--chico" aria-hidden="true">pentagon</span> Argenmap Gris · Zoom ' + ESTADO.zoomMapa + 'x' + txtBarrioActivo + '</span>';
      } else {
        leyenda.innerHTML =
          '<span class="item-leyenda"><span class="punto-leyenda punto--optimo"></span> Óptimo (85–100 pts)</span>' +
          '<span class="item-leyenda"><span class="punto-leyenda punto--bueno"></span> Bueno (70–84 pts)</span>' +
          '<span class="item-leyenda"><span class="punto-leyenda punto--regular"></span> Regular / Alerta (50–69 pts)</span>' +
          '<span class="item-leyenda"><span class="punto-leyenda punto--critico"></span> Crítico (&lt;50 pts / Kill-Switch)</span>' +
          '<span class="item-leyenda"><span class="icono icono--chico" aria-hidden="true">pentagon</span> Argenmap Gris · Zoom ' + ESTADO.zoomMapa + 'x' + txtBarrioActivo + '</span>';
      }
    }

    const z = ESTADO.zoomMapa;
    const numTiles = Math.pow(2, z);
    const centroMundo = latLngAPixelMundo(ESTADO.centroLat, ESTADO.centroLng, z);
    const origenX = centroMundo.x - MAPA_ANCHO / 2;
    const origenY = centroMundo.y - MAPA_ALTO / 2;

    const minTileX = Math.floor(origenX / 256);
    const maxTileX = Math.floor((origenX + MAPA_ANCHO) / 256);
    const minTileY = Math.floor(origenY / 256);
    const maxTileY = Math.floor((origenY + MAPA_ALTO) / 256);

    let html = '';

    // 1. Capa de Teselas Oficiales Argenmap Gris (TMS EPSG:3857 del IGN)
    html += '<g class="capa-teselas-argenmap">';
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (tx < 0 || ty < 0 || tx >= numTiles || ty >= numTiles) continue;
        const tmsY = (numTiles - 1) - ty;
        const sx = Math.round(tx * 256 - origenX);
        const sy = Math.round(ty * 256 - origenY);
        const urlTile = URL_ARGENMAP_GRIS + '/' + z + '/' + tx + '/' + tmsY + '.png';
        html += '<image href="' + urlTile + '" x="' + sx + '" y="' + sy + '" width="256" height="256" preserveAspectRatio="none" />';
      }
    }
    html += '</g>';

    // Estadísticas por Barrio Oficial para colorear la división barrial (2026_barrios_estandarizados)
    const statsPorBarrio = {};
    ESTADO.bbdd.instituciones.forEach(function (inst) {
      const nb = inst.barrio || 'Sin barrio';
      if (!statsPorBarrio[nb]) {
        statsPorBarrio[nb] = { cantidad: 0, relevadas: 0, matricula: 0, sumaIes: 0, killSwitches: 0 };
      }
      const est = obtenerEstadoDinamicoInstitucion(inst);
      statsPorBarrio[nb].cantidad += 1;
      statsPorBarrio[nb].matricula += (inst.matricula2025 || 0);
      if (est.clasificacion !== 'Sin relevar') {
        statsPorBarrio[nb].relevadas += 1;
        statsPorBarrio[nb].sumaIes += est.global;
      }
      if (est.tieneKillSwitch) statsPorBarrio[nb].killSwitches += 1;
    });

    // 2. Capa Oficial de División Barrial (62 Polígonos — Mapas RCU / Barrios)
    if (ESTADO.mostrarBarrios && ESTADO.barriosOficiales && ESTADO.barriosOficiales.length > 0) {
      html += '<g class="capa-barrios-rcu">';
      let etiquetasBarriosHtml = '';

      ESTADO.barriosOficiales.forEach(function (b) {
        if (!b.rings || !b.rings.length) return;
        let pathD = '';
        b.rings.forEach(function (ring) {
          if (!ring || ring.length < 3) return;
          for (let idx = 0; idx < ring.length; idx++) {
            const pt = ring[idx]; // [lng, lat]
            const pm = latLngAPixelMundo(pt[1], pt[0], z);
            const sx = (pm.x - origenX).toFixed(1);
            const sy = (pm.y - origenY).toFixed(1);
            pathD += (idx === 0 ? 'M' : 'L') + sx + ' ' + sy;
          }
          pathD += 'Z ';
        });

        if (!pathD) return;

        const st = statsPorBarrio[b.nombre];
        const esBarrioActivo = (ESTADO.filtros.barrio === b.nombre);
        let fillPoligono = 'var(--marca)';
        let fillOpacidad = '0.07';
        let strokeColor = 'var(--marca)';
        let strokeAncho = '1.15';
        let strokeOpacidad = '0.62';

        if (st && st.cantidad > 0) {
          if (st.relevadas > 0) {
            const promBarrio = st.sumaIes / st.relevadas;
            if (st.killSwitches > 0 || promBarrio < 50) {
              fillPoligono = 'var(--grave)';
            } else if (promBarrio < 70) {
              fillPoligono = 'var(--alerta)';
            } else if (promBarrio < 85) {
              fillPoligono = 'var(--ok)';
            } else {
              fillPoligono = 'var(--serie-1)';
            }
          } else {
            fillPoligono = 'var(--marca)';
          }
          fillOpacidad = esBarrioActivo ? '0.35' : '0.16';
          strokeAncho = esBarrioActivo ? '2.6' : '1.35';
          strokeOpacidad = esBarrioActivo ? '0.95' : '0.75';
        } else if (esBarrioActivo) {
          fillOpacidad = '0.28';
          strokeAncho = '2.5';
          strokeOpacidad = '0.95';
        }

        const esSectorActivo = (ESTADO.filtros.macrozona === 'TODAS' || b.sector === ESTADO.filtros.macrozona);
        if ((ESTADO.filtros.barrio !== 'TODOS' && !esBarrioActivo) || !esSectorActivo) {
          fillOpacidad = '0.03';
          strokeOpacidad = '0.26';
        } else if (ESTADO.filtros.macrozona !== 'TODAS' && esSectorActivo && !esBarrioActivo) {
          fillOpacidad = (st && st.cantidad > 0) ? '0.24' : '0.12';
          strokeAncho = '1.7';
          strokeOpacidad = '0.88';
        }

        html += '<path class="poligono-barrio-rcu' + (esBarrioActivo ? ' barrio-activo' : '') + '" ' +
          'd="' + pathD.trim() + '" ' +
          'data-barrio="' + escapar(b.nombre) + '" ' +
          'data-sector="' + escapar(b.sector || '') + '" ' +
          'data-codvec="' + b.codvec + '" ' +
          'fill="' + fillPoligono + '" ' +
          'fill-opacity="' + fillOpacidad + '" ' +
          'stroke="' + (esBarrioActivo ? 'var(--texto)' : strokeColor) + '" ' +
          'stroke-width="' + strokeAncho + '" ' +
          'stroke-opacity="' + strokeOpacidad + '" />';

        // Etiqueta en el centroide oficial del barrio
        if (b.centroide && esSectorActivo && (esBarrioActivo || z >= 14 || (z >= 13 && st && st.cantidad >= 3))) {
          const pc = latLngAPixelMundo(b.centroide.lat, b.centroide.lng, z);
          const cx = Math.round(pc.x - origenX);
          const cy = Math.round(pc.y - origenY);
          if (cx >= 20 && cx <= MAPA_ANCHO - 20 && cy >= 15 && cy <= MAPA_ALTO - 15) {
            const nombreCorto = b.nombre.replace(/^Bo\.\s*/i, '');
            etiquetasBarriosHtml += '<text class="etiqueta-barrio-rcu" x="' + cx + '" y="' + cy + '" ' +
              'text-anchor="middle" fill="var(--texto)" font-size="' + (esBarrioActivo ? '10.5' : '9') + '" ' +
              'font-weight="' + (esBarrioActivo ? '800' : '600') + '" opacity="' + (esBarrioActivo ? '0.98' : '0.78') + '" ' +
              'stroke="var(--superficie)" stroke-width="2.8" paint-order="stroke">' +
              escapar(acortarTexto(nombreCorto, 20)) +
            '</text>';
          }
        }
      });

      html += etiquetasBarriosHtml + '</g>';
    }

    // 3. Marcadores Georreferenciados sobre Argenmap Gris + Barrios
    const listaOrdenada = lista.slice().sort(function (a, b) {
      if (a.id === ESTADO.escuelaSeleccionadaId) return 1;
      if (b.id === ESTADO.escuelaSeleccionadaId) return -1;
      const ea = obtenerEstadoDinamicoInstitucion(a);
      const eb = obtenerEstadoDinamicoInstitucion(b);
      const aRel = ea.clasificacion !== 'Sin relevar' ? 1 : 0;
      const bRel = eb.clasificacion !== 'Sin relevar' ? 1 : 0;
      if (aRel !== bRel) return aRel - bRel;
      return eb.global - ea.global;
    });

    html += '<g class="capa-marcadores-escuelas">';
    listaOrdenada.forEach(function (inst) {
      const pMundo = latLngAPixelMundo(inst.latitud, inst.longitud, z);
      const px = Math.round(pMundo.x - origenX);
      const py = Math.round(pMundo.y - origenY);

      // Omitir si queda muy fuera del lienzo actual
      if (px < -30 || px > MAPA_ANCHO + 30 || py < -30 || py > MAPA_ALTO + 30) return;

      const est = obtenerEstadoDinamicoInstitucion(inst);
      const esSeleccionada = (inst.id === ESTADO.escuelaSeleccionadaId);
      const estaRelevada = (est.clasificacion !== 'Sin relevar');
      const tieneObraProvincia = inst.incidencias.some(function (inc) { return inc.jurisdiccion === 'PROVINCIA_MAYOR'; });

      let colorRelleno = 'var(--marca)';
      if (ESTADO.modoMapa === 'competencia') {
        if (est.tieneKillSwitch) colorRelleno = 'var(--grave)';
        else if (tieneObraProvincia) colorRelleno = 'var(--serie-5)';
        else colorRelleno = 'var(--serie-1)';
      } else {
        if (est.clasificacion === 'Sin relevar') colorRelleno = 'var(--marca)';
        else if (est.clasificacion === 'Crítico') colorRelleno = 'var(--grave)';
        else if (est.clasificacion === 'Regular') colorRelleno = 'var(--alerta)';
        else if (est.clasificacion === 'Bueno') colorRelleno = 'var(--ok)';
        else colorRelleno = 'var(--serie-1)';
      }

      const radio = esSeleccionada ? 10 : (est.tieneKillSwitch ? 8.8 : (estaRelevada ? 8.2 : 6.0));

      html += '<g class="nodo-escuela" tabindex="0" role="button" data-id="' + inst.id + '" ' +
        'aria-label="' + escapar(inst.nombre + ', Índice IES ' + est.global + ' puntos, estado ' + est.clasificacion) + '">';

      if (est.tieneKillSwitch) {
        html += '<circle cx="' + px + '" cy="' + py + '" r="' + (radio + 5.5) + '" fill="none" stroke="var(--grave)" stroke-width="2.2" opacity="0.85" />';
      } else if (estaRelevada && !esSeleccionada) {
        html += '<circle cx="' + px + '" cy="' + py + '" r="' + (radio + 3.5) + '" fill="none" stroke="' + colorRelleno + '" stroke-width="1.8" opacity="0.75" />';
      }
      if (esSeleccionada) {
        html += '<circle cx="' + px + '" cy="' + py + '" r="' + (radio + 4.5) + '" fill="none" stroke="var(--texto)" stroke-width="2.6" />';
      }

      html += '<circle cx="' + px + '" cy="' + py + '" r="' + radio + '" fill="' + colorRelleno + '" stroke="var(--superficie)" stroke-width="2" />';

      if (esSeleccionada || estaRelevada) {
        const etqX = Math.min(MAPA_ANCHO - 130, Math.max(130, px));
        const etqY = py > 40 ? py - 15 : py + 23;
        html += '<text x="' + etqX + '" y="' + etqY + '" text-anchor="middle" fill="var(--texto)" font-size="11" font-weight="800" stroke="var(--superficie)" stroke-width="3.5" paint-order="stroke">' +
          escapar(acortarTexto(inst.nombre, 30)) + ' (' + (est.clasificacion === 'Sin relevar' ? 'S/R' : est.global) + ')' +
        '</text>';
      }

      html += '</g>';
    });
    html += '</g>';

    svg.innerHTML = html;

    const tooltip = document.getElementById('tooltip-mapa');

    // Vincular eventos a cada polígono de la división barrial oficial (62 Barrios)
    svg.querySelectorAll('.poligono-barrio-rcu').forEach(function (poly) {
      const nombreBarrio = poly.getAttribute('data-barrio');
      const sectorBarrio = poly.getAttribute('data-sector');
      const codvec = poly.getAttribute('data-codvec');

      poly.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (ESTADO.huboArrastre) return;
        const nuevoBarrio = (ESTADO.filtros.barrio === nombreBarrio) ? 'TODOS' : nombreBarrio;
        ESTADO.filtros.barrio = nuevoBarrio;
        const selBarrio = document.getElementById('filtro-barrio');
        if (selBarrio) selBarrio.value = nuevoBarrio;
        centrarEnBarrioOficial(nuevoBarrio);
        renderizarTodo();
      });

      poly.addEventListener('mouseenter', function (ev) {
        if (!tooltip || !contMapa || ESTADO.arrastrandoMapa) return;
        const st = statsPorBarrio[nombreBarrio];
        const promStr = (st && st.relevadas > 0)
          ? (st.sumaIes / st.relevadas).toFixed(1).replace('.', ',') + ' / 100 pts'
          : 'Sin relevar';
        tooltip.innerHTML =
          '<strong>' + escapar(nombreBarrio) + '</strong> <span class="texto-suave">(Vecinal N° ' + escapar(codvec) + ')</span><br>' +
          '<span class="texto-suave">' + escapar(sectorBarrio) + '</span><br>' +
          (st && st.cantidad > 0
            ? '<span>Establecimientos en el barrio: <strong>' + st.cantidad + '</strong> (' + formatearNumero(st.matricula) + ' alumnos)</span><br>' +
              '<span>Índice IES Promedio Barrial: <strong>' + promStr + '</strong></span><br>'
            : '<span class="texto-suave">Polígono barrial oficial sin escuelas públicas registradas</span><br>') +
          '<span class="texto-chico texto-suave">Clic para ' + (ESTADO.filtros.barrio === nombreBarrio ? 'restablecer vista de 62 barrios' : 'filtrar y centrar este barrio') + '</span>';
        tooltip.hidden = false;
        posicionarTooltip(ev, contMapa, tooltip);
      });

      poly.addEventListener('mousemove', function (ev) {
        if (tooltip && !tooltip.hidden && contMapa) {
          posicionarTooltip(ev, contMapa, tooltip);
        }
      });

      poly.addEventListener('mouseleave', function () {
        if (tooltip) tooltip.hidden = true;
      });
    });

    // Vincular eventos a cada marcador escolar
    svg.querySelectorAll('.nodo-escuela').forEach(function (nodo) {
      const id = nodo.getAttribute('data-id');
      nodo.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (ESTADO.huboArrastre) return;
        seleccionarEscuela(id, false);
      });
      nodo.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          seleccionarEscuela(id, false);
        }
      });
      nodo.addEventListener('mouseenter', function (ev) {
        if (!tooltip || !contMapa || ESTADO.arrastrandoMapa) return;
        const inst = ESTADO.bbdd.instituciones.find(function (i) { return i.id === id; });
        if (!inst) return;
        const est = obtenerEstadoDinamicoInstitucion(inst);
        const tieneProv = inst.incidencias.some(function (inc) { return inc.jurisdiccion === 'PROVINCIA_MAYOR'; });
        tooltip.innerHTML =
          '<strong>' + escapar(inst.nombre) + '</strong><br>' +
          '<span class="texto-suave">CUE: ' + escapar(inst.cue) + ' · ' + escapar(inst.nivel) + ' · ' + escapar(inst.barrio) + '</span><br>' +
          '<strong>Índice IES: ' + (est.clasificacion === 'Sin relevar' ? 'Sin relevar' : (est.global + ' / 100 (' + est.clasificacion + ')')) + '</strong><br>' +
          '<span class="texto-suave">Competencia: ' + (tieneProv ? 'FoDeMEEP + Obra Provincial' : 'Mantenimiento FoDeMEEP') + '</span>';
        tooltip.hidden = false;
        posicionarTooltip(ev, contMapa, tooltip);
      });
      nodo.addEventListener('mousemove', function (ev) {
        if (tooltip && !tooltip.hidden && contMapa) {
          posicionarTooltip(ev, contMapa, tooltip);
        }
      });
      nodo.addEventListener('mouseleave', function () {
        if (tooltip) tooltip.hidden = true;
      });
    });

    // Resumen por Sector Territorial debajo del mapa: Sector A (Alberdi), Sector B (Banda Norte), Sector C (Centro), Sector D (Distrito Periférico)
    if (contZonas) {
      const sectoresNombres = [
        'Sector A (Alberdi)',
        'Sector B (Banda Norte)',
        'Sector C (Centro)',
        'Sector D (Distrito Periférico)'
      ];
      contZonas.innerHTML = sectoresNombres.map(function (zn) {
        const escZona = ESTADO.bbdd.instituciones.filter(function (i) { return i.macrozona === zn; });
        const relevadasZona = escZona.filter(function (i) { return obtenerEstadoDinamicoInstitucion(i).clasificacion !== 'Sin relevar'; });
        const prom = relevadasZona.length > 0
          ? (relevadasZona.reduce(function (a, b) { return a + obtenerEstadoDinamicoInstitucion(b).global; }, 0) / relevadasZona.length).toFixed(1).replace('.', ',') + ' pts'
          : 'Sin relevar';
        const activa = (ESTADO.filtros.macrozona === zn);
        return '<button type="button" class="tarjeta-zona-mini" data-zona="' + escapar(zn) + '" ' +
          (activa ? 'style="border-color: var(--marca); background: color-mix(in srgb, var(--marca) 10%, var(--superficie));"' : '') + '>' +
          '<span class="zona-nombre">' + escapar(zn) + '</span>' +
          '<div class="zona-metricas">' +
            '<span class="zona-ies">' + prom + '</span>' +
            '<span class="texto-chico texto-suave">' + escZona.length + ' esc.</span>' +
          '</div>' +
        '</button>';
      }).join('');

      contZonas.querySelectorAll('.tarjeta-zona-mini').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const zn = btn.getAttribute('data-zona');
          const selectZona = document.getElementById('filtro-macrozona');
          const selectBarrio = document.getElementById('filtro-barrio');
          ESTADO.filtros.macrozona = (ESTADO.filtros.macrozona === zn) ? 'TODAS' : zn;
          ESTADO.filtros.barrio = 'TODOS';
          if (selectZona) selectZona.value = ESTADO.filtros.macrozona;
          if (selectBarrio) selectBarrio.value = 'TODOS';
          const cfgCentro = CENTROS_MACROZONA[ESTADO.filtros.macrozona] || CENTROS_MACROZONA['TODAS'];
          ESTADO.centroLat = cfgCentro.lat;
          ESTADO.centroLng = cfgCentro.lng;
          ESTADO.zoomMapa = cfgCentro.zoom;
          renderizarTodo();
        });
      });
    }
  }

  /* Navegación interactiva (Pan / Drag y Rueda de Zoom) sobre Argenmap Gris */
  function vincularInteraccionMapaArgenmap() {
    const svg = document.getElementById('svg-mapa-rcu');
    if (!svg) return;

    svg.addEventListener('pointerdown', function (ev) {
      if (ev.button !== 0 && ev.pointerType === 'mouse') return;
      ESTADO.arrastrandoMapa = true;
      ESTADO.huboArrastre = false;
      ESTADO.dragInicioX = ev.clientX;
      ESTADO.dragInicioY = ev.clientY;
      const cMundo = latLngAPixelMundo(ESTADO.centroLat, ESTADO.centroLng, ESTADO.zoomMapa);
      ESTADO.dragCentroMundoX = cMundo.x;
      ESTADO.dragCentroMundoY = cMundo.y;
      svg.classList.add('arrastrando');
    });

    window.addEventListener('pointermove', function (ev) {
      if (!ESTADO.arrastrandoMapa) return;
      const rect = svg.getBoundingClientRect();
      const escalaX = MAPA_ANCHO / (rect.width || MAPA_ANCHO);
      const escalaY = MAPA_ALTO / (rect.height || MAPA_ALTO);
      const dx = (ev.clientX - ESTADO.dragInicioX) * escalaX;
      const dy = (ev.clientY - ESTADO.dragInicioY) * escalaY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        ESTADO.huboArrastre = true;
      }
      const nuevoCentro = pixelMundoALatLng(
        ESTADO.dragCentroMundoX - dx,
        ESTADO.dragCentroMundoY - dy,
        ESTADO.zoomMapa
      );
      ESTADO.centroLat = Math.max(-33.35, Math.min(-32.90, nuevoCentro.lat));
      ESTADO.centroLng = Math.max(-64.65, Math.min(-64.05, nuevoCentro.lng));
      renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
    });

    window.addEventListener('pointerup', function () {
      if (!ESTADO.arrastrandoMapa) return;
      ESTADO.arrastrandoMapa = false;
      svg.classList.remove('arrastrando');
    });

    svg.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      const delta = ev.deltaY < 0 ? 1 : -1;
      const nuevoZoom = Math.max(11, Math.min(17, ESTADO.zoomMapa + delta));
      if (nuevoZoom !== ESTADO.zoomMapa) {
        ESTADO.zoomMapa = nuevoZoom;
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      }
    }, { passive: false });
  }

  function posicionarTooltip(ev, contenedor, tooltip) {
    const rect = contenedor.getBoundingClientRect();
    let left = ev.clientX - rect.left + 14;
    let top = ev.clientY - rect.top + 14;
    if (left + 260 > rect.width) left = Math.max(10, left - 270);
    if (top + 110 > rect.height) top = Math.max(10, top - 115);
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  /* --- 3. Panel de Escuela Seleccionada en Mapa y Alertas Kill-Switch ------ */
  function obtenerEvidenciasInstitucion(inst) {
    if (!inst) return [];
    const borradorVivo = ESTADO.borradoresActivos && ESTADO.borradoresActivos[inst.id];
    const fotosVivo = borradorVivo ? (borradorVivo.fotos || borradorVivo.evidencias || []) : [];
    const fotosInst = (inst.relevamiento && Array.isArray(inst.relevamiento.evidencias)) ? inst.relevamiento.evidencias : [];
    return fotosVivo.length > 0 ? fotosVivo : fotosInst;
  }

  function renderizarPanelSeleccionMapa(filtradas) {
    const panel = document.getElementById('panel-seleccion-mapa');
    if (!panel || !ESTADO.bbdd) return;

    let inst = ESTADO.bbdd.instituciones.find(function (i) { return i.id === ESTADO.escuelaSeleccionadaId; });
    if (!inst && filtradas.length > 0) inst = filtradas[0];
    if (!inst) {
      panel.innerHTML = '<h3>Institución Seleccionada</h3><p class="nota">No hay establecimientos que coincidan con el filtro actual.</p>';
      return;
    }

    const est = obtenerEstadoDinamicoInstitucion(inst);
    const incAbiertas = inst.incidencias.filter(function (inc) { return !ESTADO.simulacionResueltas[inc.id]; });
    const tieneProv = inst.incidencias.some(function (inc) { return inc.jurisdiccion === 'PROVINCIA_MAYOR'; });
    const evidencias = obtenerEvidenciasInstitucion(inst);
    const cantFotos = evidencias.length || (inst.relevamiento && inst.relevamiento.fotosCargadas) || 0;

    let htmlMiniFotos = '';
    const conImagen = evidencias.filter(function (f) { return Boolean(f && f.dataUrl); });
    if (conImagen.length > 0) {
      htmlMiniFotos =
        '<div style="margin-bottom: 12px;">' +
          '<div class="texto-chico texto-suave" style="margin-bottom: 6px;"><strong>Evidencias Fotográficas (' + conImagen.length + '):</strong></div>' +
          '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px;">' +
            conImagen.slice(0, 6).map(function (f) {
              return '<a href="' + f.dataUrl + '" target="_blank" rel="noopener noreferrer" style="display: block; border: 1px solid var(--borde); border-radius: 8px; overflow: hidden; text-decoration: none; background: var(--superficie);">' +
                '<img src="' + f.dataUrl + '" alt="Evidencia fotográfica Sección ' + escapar(f.seccionId) + ' Pregunta ' + escapar(f.preguntaId) + '" style="width: 100%; height: 68px; object-fit: cover; display: block;">' +
                '<div class="texto-chico" style="padding: 4px 6px; font-size: 10px; color: var(--texto);">Sec. ' + escapar(f.seccionId) + ' · P#' + escapar(f.preguntaId) + '</div>' +
              '</a>';
            }).join('') +
          '</div>' +
        '</div>';
    }

    panel.innerHTML =
      '<div class="cabecera-panel">' +
        '<div>' +
          '<span class="texto-chico texto-suave">CUE ' + escapar(inst.cue) + ' · ' + escapar(inst.barrio) + '</span>' +
          '<h3>' + escapar(inst.nombre) + '</h3>' +
        '</div>' +
        '<span class="estado ' + claseEstadoDesdeTexto(est.clasificacion) + '">IES ' + est.global + '/100 · ' + escapar(est.clasificacion) + '</span>' +
      '</div>' +
      '<p class="nota">' + escapar(inst.domicilio) + ' · Nivel ' + escapar(inst.nivel) + ' (' + escapar(inst.modalidad) + ') · Matrícula: ' + formatearNumero(inst.matricula2025) + ' alumnos.</p>' +
      (inst.relevamiento && inst.relevamiento.tecnico
        ? '<p class="texto-chico" style="margin: 0 0 10px; color: var(--texto);"><strong>Auditor:</strong> ' + escapar(inst.relevamiento.tecnico) + ' · <strong>Fecha:</strong> ' + escapar(inst.relevamiento.fecha || '') + ' · <strong>Fotos:</strong> ' + cantFotos + '</p>'
        : '') +
      (est.tieneKillSwitch
        ? '<div class="item-alerta-critica" style="margin-bottom: 10px;">' +
            '<div class="item-alerta-titulo">⚠️ Penalizador Kill-Switch Activo</div>' +
            '<div class="item-alerta-motivo">' + escapar(est.motivoKillSwitch || '') + ' (Puntaje base: ' + est.puntajeBase + ' → Final: ' + est.global + ')</div>' +
          '</div>'
        : '') +
      '<div class="ficha-meta-pills" style="margin-bottom: 12px;">' +
        '<span class="pill-dato">Seguridad: <strong>' + est.subindices.seguridadCritica + '</strong></span>' +
        '<span class="pill-dato">Agua/Sanit.: <strong>' + est.subindices.aguaSaneamiento + '</strong></span>' +
        '<span class="pill-dato">Cubiertas: <strong>' + est.subindices.estructuraCubiertas + '</strong></span>' +
        '<span class="pill-dato">Clima: <strong>' + est.subindices.climatizacion + '</strong></span>' +
        '<span class="pill-dato">Incidencias activas: <strong>' + incAbiertas.length + '</strong></span>' +
        '<span class="pill-dato">Competencia: <strong>' + (tieneProv ? 'FoDeMEEP + Provincia' : 'FoDeMEEP') + '</strong></span>' +
      '</div>' +
      htmlMiniFotos +
      '<button type="button" class="boton boton--primario boton--chico" id="btn-ir-trazabilidad-mapa" style="width: 100%;">' +
        '<span class="icono icono--chico" aria-hidden="true">timeline</span>' +
        '<span>Abrir Trazabilidad, Fotos y Simulador de Obra</span>' +
      '</button>';

    const btnIr = document.getElementById('btn-ir-trazabilidad-mapa');
    if (btnIr) {
      btnIr.addEventListener('click', function () {
        seleccionarEscuela(inst.id, true);
      });
    }
  }

  function renderizarAlertasCriticas(filtradas) {
    const cont = document.getElementById('lista-alertas-criticas');
    if (!cont || !ESTADO.bbdd) return;

    const criticas = filtradas.filter(function (i) {
      const est = obtenerEstadoDinamicoInstitucion(i);
      return est.tieneKillSwitch || est.clasificacion === 'Crítico';
    });

    if (criticas.length === 0) {
      cont.innerHTML = '<p class="texto-chico texto-suave">No se registran establecimientos con bloqueo crítico en la selección actual.</p>';
      return;
    }

    cont.innerHTML = criticas.map(function (inst) {
      const est = obtenerEstadoDinamicoInstitucion(inst);
      const incCrit = inst.incidencias.find(function (inc) { return inc.esKillSwitch && !ESTADO.simulacionResueltas[inc.id]; }) || inst.incidencias[0];
      return '<div class="item-alerta-critica">' +
        '<div class="item-alerta-cabecera">' +
          '<span class="item-alerta-titulo">' + escapar(inst.nombre) + '</span>' +
          '<span class="estado estado--grave">IES ' + est.global + '/100</span>' +
        '</div>' +
        '<div class="item-alerta-motivo">' +
          '<strong>' + escapar(incCrit ? incCrit.tipoNombre : 'Riesgo Edilicio') + ':</strong> ' +
          escapar(incCrit ? incCrit.titulo : (est.motivoKillSwitch || '')) +
        '</div>' +
        '<div class="item-alerta-pie">' +
          '<span class="texto-chico texto-suave">' + escapar(inst.barrio) + ' · ' + (incCrit && incCrit.jurisdiccion === 'PROVINCIA_MAYOR' ? 'Obra Mayor Provincia' : 'Cuadrilla FoDeMEEP') + '</span>' +
          '<button type="button" class="boton boton--sutil boton--chico btn-auditar-alerta" data-id="' + inst.id + '">Auditar →</button>' +
        '</div>' +
      '</div>';
    }).join('');

    cont.querySelectorAll('.btn-auditar-alerta').forEach(function (btn) {
      btn.addEventListener('click', function () {
        seleccionarEscuela(btn.getAttribute('data-id'), true);
      });
    });
  }

  /* --- 4. Vista Trazabilidad Dinámica e Histórica por Institución ---------- */
  function renderizarVistaTrazabilidad() {
    if (!ESTADO.bbdd) return;
    const selectEsc = document.getElementById('select-escuela-trazabilidad');
    if (selectEsc) {
      const ordenadas = ESTADO.bbdd.instituciones.slice().sort(function (a, b) {
        const aRel = (a.ies && a.ies.clasificacion !== 'Sin relevar') ? 1 : 0;
        const bRel = (b.ies && b.ies.clasificacion !== 'Sin relevar') ? 1 : 0;
        if (aRel !== bRel) return bRel - aRel;
        return a.nombre.localeCompare(b.nombre, 'es');
      });
      selectEsc.innerHTML = ordenadas.map(function (i) {
        const prefijo = (i.ies && i.ies.clasificacion !== 'Sin relevar') ? '✓ [RELEVADA · IES ' + i.ies.global + '] ' : '';
        return '<option value="' + i.id + '">' + prefijo + escapar(i.nombre) + ' — CUE ' + escapar(i.cue) + ' (' + escapar(i.barrio) + ')</option>';
      }).join('');
      selectEsc.value = ESTADO.escuelaSeleccionadaId;
    }

    const inst = ESTADO.bbdd.instituciones.find(function (i) { return i.id === ESTADO.escuelaSeleccionadaId; }) || ESTADO.bbdd.instituciones[0];
    if (!inst) return;

    const est = obtenerEstadoDinamicoInstitucion(inst);
    const evidencias = obtenerEvidenciasInstitucion(inst);
    const cantFotos = evidencias.length || (inst.relevamiento && inst.relevamiento.fotosCargadas) || 0;

    // 4.1 Cabecera Institucional
    const contCabecera = document.getElementById('ficha-cabecera-institucion');
    if (contCabecera) {
      const diffSigno = est.variacionSimulada > 0 ? '+' + est.variacionSimulada : String(est.variacionSimulada);
      contCabecera.innerHTML =
        '<div class="ficha-top">' +
          '<div>' +
            '<span class="estado ' + claseEstadoDesdeTexto(est.clasificacion) + '">' + escapar(est.clasificacion) + '</span> ' +
            '<span class="texto-chico texto-suave">CUE: ' + escapar(inst.cue) + ' · Cód. Empresa: ' + escapar(inst.codigoEmp) + ' · Sello SHA-256: <code>' + escapar(inst.relevamiento.hashIntegridad) + '...</code></span>' +
            '<h4 class="titulo-l" style="margin-top: 6px;">' + escapar(inst.nombre) + '</h4>' +
            '<p class="texto-chico texto-suave" style="margin: 2px 0 0;">' + escapar(inst.domicilio) + ' · Barrio ' + escapar(inst.barrio) + ' (' + escapar(inst.macrozona) + ') · Turno: ' + escapar(inst.turno) + '</p>' +
            '<div class="ficha-meta-pills">' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">person</span> Auditor: <strong>' + escapar(inst.relevamiento.tecnico || 'Sin asignar') + '</strong> (' + escapar(inst.relevamiento.fecha || 'Sin fecha') + ')</span>' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">photo_camera</span> Evidencias fotográficas: <strong>' + cantFotos + ' foto(s)</strong></span>' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">school</span> Nivel: <strong>' + escapar(inst.nivel) + ' (' + escapar(inst.modalidad) + ')</strong></span>' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">groups</span> Matrícula 2025: <strong>' + formatearNumero(inst.matricula2025) + ' alumnos</strong> (' + inst.alumnosDiscapacidad + ' con CUD)</span>' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">accessible</span> Rampa: <strong>' + (inst.tieneRampa ? 'Sí' : 'No') + '</strong> · Baño Adaptado: <strong>' + (inst.tieneBanoAdaptado ? 'Sí' : 'No') + '</strong></span>' +
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">local_fire_department</span> Climatización: <strong>' +
                inst.relevamiento.calefactoresFuncionando + ' calefactor(es) activo(s)</strong> (Gas: ' + (inst.relevamiento.calefactoresGas || 0) +
                ' · Eléctricos: ' + (inst.relevamiento.calefactoresElectricos || 0) +
                ' · Averiados: ' + (inst.relevamiento.calefactoresAveriados || 0) +
                ' · Cobertura suficiente: ' + (inst.relevamiento.coberturaCalefaccion === 'si' ? 'Sí' : (inst.relevamiento.coberturaCalefaccion === 'no' ? 'No' : 'S/D')) +
                ' · Ventiladores: ' + (inst.relevamiento.ventiladoresFuncionando || 0) + '/' + (inst.relevamiento.ventiladoresInstalados || 0) +
                ' · Aires Acond.: ' + (inst.relevamiento.airesFuncionando || 0) + '/' + (inst.relevamiento.airesInstalados || 0) + ')</span>' +
            '</div>' +
          '</div>' +
          '<div class="bloque-score-ies">' +
            '<div class="circulo-ies" style="border-color: ' + colorCssEstado(est.clasificacion) + ';">' +
              '<span class="numero-ies">' + est.global + '</span>' +
              '<span class="sobre-cien">/ 100</span>' +
            '</div>' +
            '<div>' +
              '<div class="texto-chico texto-suave">Índice IES Actual</div>' +
              '<div class="titulo-m">Estado ' + escapar(est.clasificacion) + '</div>' +
              '<div class="texto-chico texto-suave">' +
                'Base ponderada: <strong>' + est.puntajeBase + ' pts</strong> × Factor KS: <strong>' + est.factorKillSwitch.toFixed(2).replace('.', ',') + '</strong>' +
                (est.variacionSimulada !== 0 ? ' · <strong style="color: var(--marca-enlace);">Simulación: ' + diffSigno + ' pts</strong>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        (est.tieneKillSwitch
          ? '<div class="alerta-killswitch-banner">' +
              '<div><strong>⚠️ Bloqueo de Riesgo Crítico (Kill-Switch) Activo:</strong> ' + escapar(est.motivoKillSwitch || '') + '</div>' +
              '<span class="estado estado--grave">Penalizador ×' + est.factorKillSwitch.toFixed(2).replace('.', ',') + ' aplicado</span>' +
            '</div>'
          : '');
    }

    // 4.2 Desglose de las 7 Dimensiones Ponderadas + Datos Relevados por Dimensión
    const ETIQUETAS_PREGUNTAS_DIM = {
      seguridadCritica: [
        [42, 'Tablero eléctrico principal'],
        [43, 'Interruptor diferencial (disyuntor)'],
        [45, 'Puesta a tierra (jabalina)'],
        [46, 'Cables expuestos o sobrecargados'],
        [51, 'Luminarias sin funcionar'],
        [52, 'Tomacorrientes sin funcionar'],
        [112, 'Servicio de gas (Red/Envasado)'],
        [113, 'Estado cañerías de gas'],
        [114, 'Pérdidas/olor a gas'],
        [115, 'Llaves de paso accesibles'],
        [116, 'Revisión anual gasista matriculado'],
        [117, 'Ventilación permanente (rejillas)'],
        [118, 'Estado artefactos de gas'],
        [119, 'Detectores de monóxido'],
        [126, 'Matafuegos vigentes'],
        [127, 'Salidas de emergencia libres'],
        [136, 'Señalización de evacuación']
      ],
      aguaSaneamiento: [
        [57, 'Provisión de agua potable'],
        [58, 'Limpieza de tanques (últ. 6 meses)'],
        [59, 'Bomba de agua funcionando'],
        [60, 'Estado de canillas y llaves'],
        [87, 'Desagües cloacales'],
        [88, 'Desbordes cloacales frecuentes'],
        [89, 'Desagües pluviales y canaletas'],
        [90, 'Acumulación de agua en lluvias'],
        [91, 'Estado cámaras sépticas/pozos'],
        [93, 'Inodoros funcionando'],
        [98, 'Lavamanos funcionando'],
        [99, 'Estado griferías sanitarios'],
        [101, 'Pérdidas de agua en sanitarios'],
        [103, 'Baños docentes suficientes'],
        [104, 'Estado baños docentes'],
        [106, 'Revestimientos sanitarios'],
        [108, 'Ventilación en sanitarios']
      ],
      estructuraCubiertas: [
        [23, 'Tipo de cubierta/techo'],
        [25, 'Estado general de techos'],
        [27, 'Filtraciones o goteras'],
        [28, 'Humedad en paredes o cielorrasos'],
        [30, 'Estado paredes interiores'],
        [32, 'Estado paredes exteriores'],
        [34, 'Estado de pisos'],
        [36, 'Estado de puertas'],
        [38, 'Estado de ventanas'],
        [39, 'Vidrios rotos o faltantes']
      ],
      climatizacion: [
        [66, 'Calefactores en funcionamiento'],
        [67, 'Calefactores a gas'],
        [68, 'Calefactores eléctricos'],
        [69, 'Calefactores fuera de servicio'],
        [70, 'Cobertura de calefacción suficiente'],
        [80, 'Ventiladores instalados'],
        [81, 'Ventiladores en funcionamiento'],
        [82, 'Aires acondicionados instalados'],
        [83, 'Aires acondicionados funcionando']
      ],
      alimentacionCocina: [
        [159, 'Dispone de cocina o comedor'],
        [162, 'Artefactos de cocina funcionando'],
        [163, 'Revestimientos y mesadas de cocina']
      ],
      accesibilidad: [
        [148, 'Rampas de acceso reglamentarias'],
        [152, 'Sanitario adaptado para discapacidad']
      ],
      entornoExterior: [
        [141, 'Cerco perimetral completo y seguro'],
        [143, 'Estado de patios y playones'],
        [144, 'Estado de veredas perimetrales']
      ]
    };

    const contDim = document.getElementById('desglose-dimensiones-escuela');
    if (contDim) {
      const vivoInst = (ESTADO.relevamientosVivos && ESTADO.relevamientosVivos[inst.id]) || null;
      const respMap = (vivoInst && (vivoInst.respuestas || vivoInst.Respuestas)) || (inst.relevamiento && inst.relevamiento.respuestas) || {};
      const compMap = (inst.ies && inst.ies.completitudDimensiones) || {};

      contDim.innerHTML = ESTADO.bbdd.dimensionesIes.map(function (dim, idx) {
        const preguntasDef = ETIQUETAS_PREGUNTAS_DIM[dim.id] || [];
        let respondidasCount = 0;
        const itemsCargadosHtml = [];

        preguntasDef.forEach(function (par) {
          const pId = String(par[0]);
          const pLabel = par[1];
          const rawVal = respMap[pId];
          const tieneResp = rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '' && !(Array.isArray(rawVal) && rawVal.length === 0);
          if (tieneResp) {
            respondidasCount++;
            let valFormateado = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal);
            if (valFormateado === 'si') valFormateado = 'Sí';
            if (valFormateado === 'no') valFormateado = 'No';
            itemsCargadosHtml.push(
              '<span class="pill-dato" style="font-size: 11px; padding: 2px 8px;">' +
                '<span class="texto-suave">P.' + pId + ' ' + escapar(pLabel) + ':</span> <strong>' + escapar(valFormateado) + '</strong>' +
              '</span>'
            );
          }
        });

        const totalPreg = preguntasDef.length || (compMap[dim.id] ? compMap[dim.id].total : 0);
        const esCompleta = totalPreg > 0 ? (respondidasCount === totalPreg) : (compMap[dim.id] ? compMap[dim.id].completa : false);
        const valorActual = esCompleta ? (est.subindices[dim.id] || 0) : 0;
        const valorOriginal = esCompleta ? (inst.ies.subindices[dim.id] || 0) : 0;
        const delta = valorActual - valorOriginal;
        const serieColor = esCompleta ? ('var(--serie-' + ((idx % 7) + 1) + ')') : 'var(--borde-fuerte)';

        let badgeCompletitud = '';
        if (esCompleta) {
          badgeCompletitud = '<span class="estado estado--ok" style="font-size: 11px; margin-left: 6px;">✓ Completa (' + respondidasCount + '/' + totalPreg + ' preg.)</span>';
        } else if (respondidasCount > 0) {
          badgeCompletitud = '<span class="estado estado--alerta" style="font-size: 11px; margin-left: 6px;">⏳ Incompleta (' + respondidasCount + '/' + totalPreg + ' preg. → 0 pts)</span>';
        } else {
          badgeCompletitud = '<span class="estado estado--neutro" style="font-size: 11px; margin-left: 6px;">Sin cargar (0/' + totalPreg + ' preg. → 0 pts)</span>';
        }

        return '<div class="fila-dimension" style="padding: 10px 12px; border: 1px solid var(--borde); border-radius: 8px; margin-bottom: 10px; background: var(--superficie);">' +
          '<div class="cabecera-dimension">' +
            '<div>' +
              '<span class="nombre-dimension">' + escapar(dim.nombre) + '</span> ' +
              '<span class="peso-dimension">(' + Math.round(dim.ponderacion * 100) + '% · ' + escapar(dim.secciones) + ')</span>' +
              badgeCompletitud +
            '</div>' +
            '<div class="texto-numero">' +
              '<strong>' + valorActual + ' / 100</strong>' +
              (delta > 0 ? ' <span class="estado estado--ok">+' + delta + ' pts</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="pista-barra" style="margin-bottom: ' + (itemsCargadosHtml.length > 0 ? '8px' : '0') + ';">' +
            '<div class="relleno-barra" style="width: ' + valorActual + '%; background: ' + serieColor + ';"></div>' +
          '</div>' +
          (itemsCargadosHtml.length > 0
            ? '<div class="ficha-meta-pills" style="gap: 6px; margin-top: 6px;">' + itemsCargadosHtml.join('') + '</div>'
            : '<div class="texto-chico texto-suave" style="margin-top: 4px;">El auditor aún no registró respuestas en esta dimensión (puntaje asignado: 0 / 100).</div>') +
        '</div>';
      }).join('');
    }

    // 4.3 Curva de Evolución Histórica SVG + Timeline
    const contGrafico = document.getElementById('grafico-evolucion-escuela');
    const contTimeline = document.getElementById('timeline-auditoria-escuela');
    const puntosHist = inst.historialIes.map(function (h) {
      return { etiqueta: h.fecha.slice(5), valor: h.indiceNuevo, motivo: h.motivo, ot: h.ordenTrabajo };
    });
    if (est.variacionSimulada !== 0) {
      puntosHist.push({
        etiqueta: 'Simulado',
        valor: est.global,
        motivo: 'Simulación de cierre de ' + est.intervencionesSimuladas + ' orden(es) de trabajo en vivo',
        ot: 'SIM-VIVO'
      });
    }

    if (contGrafico) {
      contGrafico.innerHTML = puntosHist.length > 0
        ? generarSvgCurvaEvolucion(puntosHist)
        : '<p class="nota">Sin curva histórica registrada aún para este establecimiento.</p>';
    }

    if (contTimeline) {
      const listaEventos = inst.historialIes.slice();
      if (est.variacionSimulada !== 0) {
        listaEventos.push({
          fecha: 'Simulación en Vivo',
          indiceAnterior: inst.ies.global,
          indiceNuevo: est.global,
          variacion: est.variacionSimulada,
          motivo: 'Proyección inmediata tras resolver ' + est.intervencionesSimuladas + ' incidencia(s) pendiente(s)',
          ordenTrabajo: 'SIMULACIÓN',
          jurisdiccion: 'FoDeMEEP',
          esSimulacion: true
        });
      }
      if (listaEventos.length === 0) {
        contTimeline.innerHTML = '<p class="nota">Sin órdenes de trabajo ni auditorías históricas registradas.</p>';
      } else {
        contTimeline.innerHTML = listaEventos.slice().reverse().map(function (ev) {
          const signo = ev.variacion > 0 ? '+' + ev.variacion : String(ev.variacion);
          return '<div class="evento-timeline ' + (ev.esSimulacion ? 'evento--simulacion' : '') + '">' +
            '<div>' +
              '<strong>' + escapar(ev.fecha) + ' · ' + escapar(ev.ordenTrabajo) + '</strong> ' +
              '<span class="texto-suave">(' + escapar(ev.jurisdiccion) + ')</span>' +
              '<div>' + escapar(ev.motivo) + '</div>' +
            '</div>' +
            '<div class="texto-numero" style="text-align: right; white-space: nowrap;">' +
              '<strong>IES ' + ev.indiceNuevo + '</strong><br>' +
              '<span class="texto-chico texto-suave">' + (ev.variacion === 0 ? 'Línea base' : signo + ' pts') + '</span>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    }

    // 4.4 Tabla Simulador de Incidencias de la Escuela
    const contInc = document.getElementById('tabla-incidencias-escuela');
    if (contInc) {
      if (inst.incidencias.length === 0) {
        contInc.innerHTML = '<p class="nota">Este establecimiento no registra incidencias pendientes.</p>';
      } else {
        contInc.innerHTML =
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>Resolver (Simular)</th>' +
                '<th>Código / Rubro Oficial</th>' +
                '<th>Hallazgo Técnico Detectado</th>' +
                '<th>Demarcación de Competencia</th>' +
                '<th>Severidad / Kill-Switch</th>' +
                '<th class="numero">Impacto IES</th>' +
                '<th class="numero">Costo Estimado</th>' +
                '<th>Estado Operativo</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              inst.incidencias.map(function (inc) {
                const resuelta = Boolean(ESTADO.simulacionResueltas[inc.id]);
                const esProv = (inc.jurisdiccion === 'PROVINCIA_MAYOR');
                return '<tr>' +
                  '<td>' +
                    '<label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">' +
                      '<input type="checkbox" class="checkbox-simulador" data-inc-id="' + inc.id + '" ' + (resuelta ? 'checked' : '') + '>' +
                      '<span class="texto-chico">' + (resuelta ? 'Resuelta' : 'Pendiente') + '</span>' +
                    '</label>' +
                  '</td>' +
                  '<td>' +
                    '<strong>' + escapar(inc.tipoNombre) + '</strong>' +
                    '<span class="subtexto-celda">' + escapar(inc.id) + ' · ' + escapar(inc.cuadrilla) + '</span>' +
                  '</td>' +
                  '<td class="celda-nombre-escuela">' +
                    '<strong>' + escapar(inc.titulo) + '</strong>' +
                    '<span class="subtexto-celda">' + escapar(inc.descripcion) + '</span>' +
                  '</td>' +
                  '<td>' +
                    '<span class="estado ' + (esProv ? 'estado--grave' : 'estado--optimo') + '">' +
                      (esProv ? 'Obra Mayor Provincia' : 'Mantenimiento FoDeMEEP') +
                    '</span>' +
                  '</td>' +
                  '<td>' +
                    '<span class="estado ' + (inc.severidad === 'CRITICA' || inc.severidad === 'GRAVE' ? 'estado--grave' : inc.severidad === 'MEDIA' ? 'estado--alerta' : 'estado--neutro') + '">' +
                      escapar(inc.severidad) + (inc.esKillSwitch ? ' · Kill-Switch' : '') +
                    '</span>' +
                  '</td>' +
                  '<td class="numero"><strong>+' + inc.impactoPuntosIes + ' pts</strong></td>' +
                  '<td class="numero">$' + formatearNumero(inc.costoEstimado) + '</td>' +
                  '<td>' +
                    '<span class="estado ' + (resuelta ? 'estado--ok' : inc.estado === 'EN_EJECUCION' ? 'estado--alerta' : 'estado--neutro') + '">' +
                      (resuelta ? 'RESUELTA (100%)' : inc.estado + ' (' + inc.avancePorcentaje + '%)') +
                    '</span>' +
                  '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>';

        contInc.querySelectorAll('.checkbox-simulador').forEach(function (chk) {
          chk.addEventListener('change', function () {
            const incId = chk.getAttribute('data-inc-id');
            ESTADO.simulacionResueltas[incId] = chk.checked;
            renderizarTodo();
          });
        });
      }
    }

    // 4.5 Galería de Evidencias Fotográficas del Relevamiento en Campo
    const contFotos = document.getElementById('galeria-fotos-escuela');
    if (contFotos) {
      const fotosConImg = evidencias.filter(function (f) { return Boolean(f && f.dataUrl); });
      if (fotosConImg.length === 0) {
        contFotos.innerHTML =
          '<p class="nota">Aún no se recibieron archivos fotográficos sincronizados para este establecimiento. ' +
          'Si el auditor capturó fotografías desde el celular antes de la última actualización, basta con abrir o recargar el formulario en el celular (o tocar <strong>«Confirmar y Cerrar Auditoría»</strong>) para que las fotografías se transmitan automáticamente a esta galería.</p>';
      } else {
        contFotos.innerHTML =
          '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 8px;">' +
            fotosConImg.map(function (f) {
              const fechaHora = f.timestamp ? new Date(f.timestamp).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '';
              return '<div class="panel panel--interno" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">' +
                '<a href="' + f.dataUrl + '" target="_blank" rel="noopener noreferrer" style="display: block; border-radius: 8px; overflow: hidden; border: 1px solid var(--borde);">' +
                  '<img src="' + f.dataUrl + '" alt="Evidencia fotográfica Sección ' + escapar(f.seccionId) + ' Pregunta ' + escapar(f.preguntaId) + '" style="width: 100%; height: 160px; object-fit: cover; display: block;">' +
                '</a>' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                  '<span class="estado estado--optimo">Sección ' + escapar(f.seccionId) + ' · Pregunta #' + escapar(f.preguntaId) + '</span>' +
                  '<span class="texto-chico texto-suave">' + escapar(fechaHora) + '</span>' +
                '</div>' +
                '<a href="' + f.dataUrl + '" download="evidencia_' + escapar(inst.cue) + '_sec' + escapar(f.seccionId) + '_p' + escapar(f.preguntaId) + '.jpg" class="boton boton--secundario boton--chico" style="text-align: center; text-decoration: none;">' +
                  '<span class="icono icono--chico" aria-hidden="true">download</span>' +
                  '<span>Descargar Fotografía</span>' +
                '</a>' +
              '</div>';
            }).join('') +
          '</div>';
      }
    }
  }

  function generarSvgCurvaEvolucion(puntos) {
    const w = 480, h = 165;
    const padL = 36, padR = 24, padT = 22, padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    let svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Curva de evolución histórica del Índice IES">';

    // Líneas horizontales de referencia (50 Crítico, 70 Bueno, 85 Óptimo)
    [40, 60, 80, 100].forEach(function (val) {
      const y = Math.round(padT + plotH * (1 - (val - 20) / 80));
      svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" stroke="var(--borde)" stroke-dasharray="3,3" />';
      svg += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end" fill="var(--texto-suave)" font-size="9.5">' + val + '</text>';
    });

    const coords = puntos.map(function (p, i) {
      const x = puntos.length === 1 ? padL + plotW / 2 : Math.round(padL + (i / (puntos.length - 1)) * plotW);
      const valClamp = Math.max(20, Math.min(100, p.valor));
      const y = Math.round(padT + plotH * (1 - (valClamp - 20) / 80));
      return { x: x, y: y, etiqueta: p.etiqueta, valor: p.valor };
    });

    if (coords.length > 1) {
      const puntosPoly = coords.map(function (c) { return c.x + ',' + c.y; }).join(' ');
      const areaPath = 'M ' + coords[0].x + ',' + (padT + plotH) + ' L ' +
        coords.map(function (c) { return c.x + ',' + c.y; }).join(' L ') +
        ' L ' + coords[coords.length - 1].x + ',' + (padT + plotH) + ' Z';
      svg += '<path d="' + areaPath + '" fill="color-mix(in srgb, var(--serie-1) 16%, transparent)" />';
      svg += '<polyline points="' + puntosPoly + '" fill="none" stroke="var(--serie-1)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />';
    }

    coords.forEach(function (c, idx) {
      const esUltimo = (idx === coords.length - 1);
      svg += '<circle cx="' + c.x + '" cy="' + c.y + '" r="' + (esUltimo ? 6 : 4.5) + '" fill="' + (esUltimo ? 'var(--ok)' : 'var(--serie-1)') + '" stroke="var(--superficie)" stroke-width="2" />';
      svg += '<text x="' + c.x + '" y="' + (c.y - 9) + '" text-anchor="middle" fill="var(--texto)" font-size="10.5" font-weight="700">' + c.valor + '</text>';
      svg += '<text x="' + c.x + '" y="' + (h - 8) + '" text-anchor="middle" fill="var(--texto-suave)" font-size="9.5">' + escapar(c.etiqueta) + '</text>';
    });

    svg += '</svg>';
    return svg;
  }

  /* --- 5. Vista Demarcación de Competencias (FoDeMEEP vs. Provincia) ------ */
  function renderizarVistaCompetencias(filtradas) {
    const contFod = document.getElementById('resumen-competencia-fodemeep');
    const contProv = document.getElementById('resumen-competencia-provincia');
    const tablaProv = document.getElementById('tabla-obras-provincia');
    const tablaCat = document.getElementById('tabla-catalogo-20-rubros');
    if (!ESTADO.bbdd) return;

    const todasInc = filtradas.flatMap(function (inst) {
      return inst.incidencias.map(function (inc) {
        return Object.assign({}, inc, {
          institucionId: inst.id,
          institucionNombre: inst.nombre,
          cue: inst.cue,
          barrio: inst.barrio,
          nivel: inst.nivel,
          resueltaSim: Boolean(ESTADO.simulacionResueltas[inc.id])
        });
      });
    });

    const incFod = todasInc.filter(function (i) { return i.jurisdiccion === 'FoDeMEEP'; });
    const incProv = todasInc.filter(function (i) { return i.jurisdiccion === 'PROVINCIA_MAYOR'; });

    const presupuestoFod = incFod.reduce(function (a, b) { return a + b.costoEstimado; }, 0);
    const presupuestoProv = incProv.reduce(function (a, b) { return a + b.costoEstimado; }, 0);

    if (contFod) {
      const activasFod = incFod.filter(function (i) { return !i.resueltaSim; }).length;
      const histFod = (ESTADO.bbdd.metadata && ESTADO.bbdd.metadata.demarcacionCompetencias && ESTADO.bbdd.metadata.demarcacionCompetencias.fodemeepMunicipal)
        ? ESTADO.bbdd.metadata.demarcacionCompetencias.fodemeepMunicipal.IntervencionesHistoricas
        : 0;
      contFod.innerHTML =
        '<div class="metricas-competencia">' +
          '<div class="caja-metrica"><p class="etiqueta">Incidencias Totales</p><p class="valor">' + incFod.length + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Activas / En Curso</p><p class="valor">' + activasFod + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Presupuesto Estimado</p><p class="valor">$' + formatearMillones(presupuestoFod) + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Histórico Ejecutado</p><p class="valor">' + formatearNumero(histFod) + ' OT</p></div>' +
        '</div>' +
        '<ul class="lista-alcance">' +
          '<li><strong>Plomería, Agua y Saneamiento:</strong> Reparación de griferías, flotantes, bombas presurizadoras, desagote y limpieza semestral de tanques.</li>' +
          '<li><strong>Seguridad Eléctrica y Gas (NAG-200):</strong> Normalización de tableros seccionales, disyuntores diferenciales, service de calefactores tiro balanceado y pruebas de hermeticidad.</li>' +
          '<li><strong>Mantenimiento Edilicio Ágil:</strong> Impermeabilización focalizada de filtraciones, herrería, cerrajería, recarga de matafuegos, pintura y poda preventiva.</li>' +
        '</ul>';
    }

    if (contProv) {
      const activasProv = incProv.filter(function (i) { return !i.resueltaSim; }).length;
      contProv.innerHTML =
        '<div class="metricas-competencia">' +
          '<div class="caja-metrica"><p class="etiqueta">Expedientes Mayores</p><p class="valor">' + incProv.length + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Pendientes Provincia</p><p class="valor">' + activasProv + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Inversión Mayor Est.</p><p class="valor">$' + formatearMillones(presupuestoProv) + '</p></div>' +
          '<div class="caja-metrica"><p class="etiqueta">Costo Promedio / Obra</p><p class="valor">$' + (incProv.length > 0 ? formatearMillones(Math.round(presupuestoProv / incProv.length)) : '0') + '</p></div>' +
        '</div>' +
        '<ul class="lista-alcance">' +
          '<li><strong>Sustitución Estructural de Cubiertas:</strong> Recambio completo de techos de losa o chapa con estructura portante colapsada (&gt;200 m²).</li>' +
          '<li><strong>Infraestructura Sanitaria y Redes Nuevas:</strong> Construcción de baterías sanitarias completas, colectoras cloacales nuevas y tendido integral epoxi de gas.</li>' +
          '<li><strong>Obra Civil y Cimientos:</strong> Recalce de fundaciones por asentamiento diferencial, refuerzo de muros portantes y ampliación de aulas.</li>' +
        '</ul>';
    }

    if (tablaProv) {
      if (incProv.length === 0) {
        tablaProv.innerHTML = '<p class="nota">No hay obras mayores provinciales registradas en el filtro seleccionado.</p>';
      } else {
        tablaProv.innerHTML =
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>Establecimiento Educativo</th>' +
                '<th>Barrio / Nivel</th>' +
                '<th>Obra Mayor Provincial Requerida</th>' +
                '<th>Severidad</th>' +
                '<th class="numero">Impacto IES</th>' +
                '<th class="numero">Presupuesto Est.</th>' +
                '<th>Acción</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              incProv.map(function (op) {
                return '<tr>' +
                  '<td class="celda-nombre-escuela">' +
                    '<strong>' + escapar(op.institucionNombre) + '</strong>' +
                    '<span class="subtexto-celda">CUE ' + escapar(op.cue) + ' · Expediente ' + escapar(op.id) + '</span>' +
                  '</td>' +
                  '<td>' + escapar(op.barrio) + '<span class="subtexto-celda">' + escapar(op.nivel) + '</span></td>' +
                  '<td class="celda-nombre-escuela">' +
                    '<strong>' + escapar(op.titulo) + '</strong>' +
                    '<span class="subtexto-celda">' + escapar(op.descripcion) + '</span>' +
                  '</td>' +
                  '<td><span class="estado estado--grave">' + escapar(op.severidad) + (op.esKillSwitch ? ' · Kill-Switch' : '') + '</span></td>' +
                  '<td class="numero"><strong>+' + op.impactoPuntosIes + ' pts</strong></td>' +
                  '<td class="numero">$' + formatearNumero(op.costoEstimado) + '</td>' +
                  '<td><button type="button" class="boton boton--secundario boton--chico btn-ver-escuela" data-id="' + op.institucionId + '">Ver Ficha</button></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>';

        tablaProv.querySelectorAll('.btn-ver-escuela').forEach(function (b) {
          b.addEventListener('click', function () {
            seleccionarEscuela(b.getAttribute('data-id'), true);
          });
        });
      }
    }

    if (tablaCat) {
      tablaCat.innerHTML =
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th>Código Oficial</th>' +
              '<th>Denominación del Rubro</th>' +
              '<th>Competencia por Defecto</th>' +
              '<th>Cuadrilla / Despacho Operativo</th>' +
              '<th class="numero">Demanda Histórica</th>' +
              '<th class="numero">Activas Relevamiento</th>' +
              '<th class="numero">Presupuesto Activo</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            ESTADO.bbdd.catalogoIncidencias.map(function (cat) {
              const codCat = cat.codigo || cat.id;
              const delRubro = todasInc.filter(function (i) {
                return (i.tipoCodigo === codCat || i.tipoId === codCat || i.tipoNombre === cat.nombre) && !i.resueltaSim;
              });
              const sumaRubro = delRubro.reduce(function (a, b) { return a + (b.costoEstimado || 0); }, 0);
              const esProv = (cat.jurisdiccion === 'PROVINCIA_MAYOR');
              return '<tr>' +
                '<td><code>' + escapar(codCat) + '</code></td>' +
                '<td><strong>' + escapar(cat.nombre) + '</strong><span class="subtexto-celda">Sección ' + (cat.seccionId || '') + ': ' + escapar(cat.seccion || '') + '</span></td>' +
                '<td><span class="estado ' + (esProv ? 'estado--grave' : 'estado--optimo') + '">' + (esProv ? 'PROVINCIA MAYOR' : 'FoDeMEEP MUNICIPAL') + '</span></td>' +
                '<td>' + escapar(cat.cuadrilla) + '</td>' +
                '<td class="numero">' + formatearNumero(cat.frecuenciaHistorica) + '</td>' +
                '<td class="numero"><strong>' + delRubro.length + '</strong></td>' +
                '<td class="numero">$' + formatearNumero(sumaRubro) + '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>';
    }
  }

  /* --- 6. Vista Modelo Matemático IES (0–100) y Serie Global -------------- */
  function renderizarVistaModeloIndice(filtradas) {
    const contDim = document.getElementById('panel-siete-dimensiones');
    const contGrafGlobal = document.getElementById('grafico-serie-global');
    const contTablaGlobal = document.getElementById('tabla-serie-global');
    const contMacrozonas = document.getElementById('tabla-macrozonas');
    if (!ESTADO.bbdd) return;

    const filtradasRelevadas = filtradas.filter(function (inst) {
      return obtenerEstadoDinamicoInstitucion(inst).clasificacion !== 'Sin relevar';
    });
    const totalRel = filtradasRelevadas.length;

    if (contDim) {
      contDim.innerHTML = ESTADO.bbdd.dimensionesIes.map(function (dim, idx) {
        const prom = totalRel > 0
          ? (filtradasRelevadas.reduce(function (acc, inst) {
              const est = obtenerEstadoDinamicoInstitucion(inst);
              return acc + (est.subindices[dim.id] || 0);
            }, 0) / totalRel).toFixed(1)
          : '0.0';
        const promNum = Number(prom);
        const serieColor = 'var(--serie-' + ((idx % 7) + 1) + ')';
        return '<div class="fila-dimension">' +
          '<div class="cabecera-dimension">' +
            '<div>' +
              '<span class="nombre-dimension">' + escapar(dim.nombre) + '</span> ' +
              '<span class="peso-dimension">· Ponderación: <strong>' + Math.round(dim.ponderacion * 100) + '%</strong></span>' +
              '<div class="texto-chico texto-suave">' + escapar(dim.descripcion || dim.secciones || '') + '</div>' +
            '</div>' +
            '<div class="texto-numero" style="white-space: nowrap;">' +
              '<strong>' + (totalRel > 0 ? prom.replace('.', ',') + ' / 100' : 'Sin relevar') + '</strong>' +
            '</div>' +
          '</div>' +
          '<div class="pista-barra">' +
            '<div class="relleno-barra" style="width: ' + promNum + '%; background: ' + serieColor + ';"></div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    if (contGrafGlobal) {
      const puntosSerie = ESTADO.bbdd.serieHistoricaGlobal.map(function (s) {
        const etq = (s.mes || s.periodo || s.fecha || '').replace(' 2026', '');
        return { etiqueta: etq, valor: s.iesPromedio };
      });
      contGrafGlobal.innerHTML = puntosSerie.length > 0
        ? generarSvgCurvaEvolucion(puntosSerie)
        : '<p class="nota">Sin serie histórica consolidada aún.</p>';
    }

    if (contTablaGlobal) {
      if (ESTADO.bbdd.serieHistoricaGlobal.length === 0) {
        contTablaGlobal.innerHTML = '<p class="nota">No hay cortes históricos registrados aún.</p>';
      } else {
        contTablaGlobal.innerHTML =
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>Período</th>' +
                '<th>Hito Operativo FoDeMEEP</th>' +
                '<th class="numero">IES Promedio</th>' +
                '<th class="numero">Óptimas</th>' +
                '<th class="numero">Buenas</th>' +
                '<th class="numero">Regulares</th>' +
                '<th class="numero">Críticas</th>' +
                '<th class="numero">OT Acumuladas</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              ESTADO.bbdd.serieHistoricaGlobal.map(function (s) {
                return '<tr>' +
                  '<td><strong>' + escapar(s.mes || s.periodo || s.fecha || '') + '</strong></td>' +
                  '<td>' + escapar(s.hito || 'Relevamiento técnico') + '</td>' +
                  '<td class="numero"><strong>' + Number(s.iesPromedio || 0).toFixed(1).replace('.', ',') + '</strong></td>' +
                  '<td class="numero">' + (s.optimas || 0) + '</td>' +
                  '<td class="numero">' + (s.buenas || 0) + '</td>' +
                  '<td class="numero">' + (s.regulares || 0) + '</td>' +
                  '<td class="numero">' + (s.criticas || s.escuelasCriticas || 0) + '</td>' +
                  '<td class="numero">' + formatearNumero(s.ordenesCerradas || s.intervencionesAcumuladas || 0) + '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>';
      }
    }

    if (contMacrozonas) {
      const zonas = [
        'Sector A (Alberdi)',
        'Sector B (Banda Norte)',
        'Sector C (Centro)',
        'Sector D (Distrito Periférico)'
      ];
      contMacrozonas.innerHTML =
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th>Sector Territorial RCU</th>' +
              '<th class="numero">Escuelas</th>' +
              '<th class="numero">Matrícula</th>' +
              '<th class="numero">IES Promedio</th>' +
              '<th class="numero">Óptimo/Bueno</th>' +
              '<th class="numero">Regular</th>' +
              '<th class="numero">Crítico</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            zonas.map(function (zn) {
              const sub = ESTADO.bbdd.instituciones.filter(function (i) { return i.macrozona === zn; });
              const subRel = sub.filter(function (i) { return obtenerEstadoDinamicoInstitucion(i).clasificacion !== 'Sin relevar'; });
              const mat = sub.reduce(function (a, b) { return a + (b.matricula2025 || 0); }, 0);
              const ies = subRel.length > 0
                ? (subRel.reduce(function (a, b) { return a + obtenerEstadoDinamicoInstitucion(b).global; }, 0) / subRel.length).toFixed(1).replace('.', ',') + ' pts (' + subRel.length + ' rel.)'
                : 'Sin relevar';
              const okCount = subRel.filter(function (i) {
                const c = obtenerEstadoDinamicoInstitucion(i).clasificacion;
                return c === 'Óptimo' || c === 'Bueno';
              }).length;
              const regCount = subRel.filter(function (i) { return obtenerEstadoDinamicoInstitucion(i).clasificacion === 'Regular'; }).length;
              const critCount = subRel.filter(function (i) { return obtenerEstadoDinamicoInstitucion(i).clasificacion === 'Crítico'; }).length;
              return '<tr>' +
                '<td><strong>' + escapar(zn) + '</strong></td>' +
                '<td class="numero">' + sub.length + '</td>' +
                '<td class="numero">' + formatearNumero(mat) + '</td>' +
                '<td class="numero"><strong>' + ies + '</strong></td>' +
                '<td class="numero">' + okCount + '</td>' +
                '<td class="numero">' + regCount + '</td>' +
                '<td class="numero">' + (critCount > 0 ? '<span class="estado estado--grave">' + critCount + '</span>' : '0') + '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>';
    }
  }

  /* --- 7. Vista Padrón Completo de la BBDD del Relevamiento --------------- */
  function renderizarVistaPadron(filtradas) {
    const cont = document.getElementById('contenedor-tabla-padron');
    const subtitulo = document.getElementById('subtitulo-tabla-padron');
    if (!cont) return;

    if (subtitulo) {
      const cantRel = filtradas.filter(function (i) { return obtenerEstadoDinamicoInstitucion(i).clasificacion !== 'Sin relevar'; }).length;
      subtitulo.textContent = 'Mostrando ' + filtradas.length + ' de ' + ESTADO.bbdd.instituciones.length +
        ' instituciones (' + cantRel + ' con relevamiento activo).';
    }

    const ordenadas = filtradas.slice().sort(function (a, b) {
      const ea = obtenerEstadoDinamicoInstitucion(a);
      const eb = obtenerEstadoDinamicoInstitucion(b);
      const aRel = ea.clasificacion !== 'Sin relevar' ? 1 : 0;
      const bRel = eb.clasificacion !== 'Sin relevar' ? 1 : 0;
      if (aRel !== bRel) return bRel - aRel; // Las instituciones relevadas siempre primero
      if (ESTADO.ordenPadron === 'ies-asc') return ea.global - eb.global;
      if (ESTADO.ordenPadron === 'ies-desc') return eb.global - ea.global;
      if (ESTADO.ordenPadron === 'matricula-desc') return (b.matricula2025 || 0) - (a.matricula2025 || 0);
      if (ESTADO.ordenPadron === 'incidencias-desc') return b.incidencias.length - a.incidencias.length;
      return a.nombre.localeCompare(b.nombre, 'es');
    });

    if (ordenadas.length === 0) {
      cont.innerHTML = '<p class="nota">No se encontraron instituciones con los criterios seleccionados.</p>';
      return;
    }

    cont.innerHTML =
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>CUE</th>' +
            '<th>Establecimiento Educativo</th>' +
            '<th>Nivel / Modalidad</th>' +
            '<th>Barrio / Sector</th>' +
            '<th class="numero">Matrícula</th>' +
            '<th>Accesibilidad</th>' +
            '<th class="numero">Seguridad (25%)</th>' +
            '<th class="numero">Agua (20%)</th>' +
            '<th class="numero">Cubiertas (18%)</th>' +
            '<th class="numero">Clima (15%)</th>' +
            '<th class="numero">Índice IES</th>' +
            '<th>Semáforo</th>' +
            '<th>Competencia Activa</th>' +
            '<th>Auditoría</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          ordenadas.map(function (inst) {
            const est = obtenerEstadoDinamicoInstitucion(inst);
            const sinRel = (est.clasificacion === 'Sin relevar');
            const incFod = inst.incidencias.filter(function (i) { return i.jurisdiccion === 'FoDeMEEP' && !ESTADO.simulacionResueltas[i.id]; }).length;
            const incProv = inst.incidencias.filter(function (i) { return i.jurisdiccion === 'PROVINCIA_MAYOR' && !ESTADO.simulacionResueltas[i.id]; }).length;
            return '<tr>' +
              '<td class="texto-numero"><code>' + escapar(inst.cue) + '</code></td>' +
              '<td class="celda-nombre-escuela">' +
                '<strong>' + escapar(inst.nombre) + '</strong>' +
                '<span class="subtexto-celda">' + escapar(inst.domicilio) + '</span>' +
              '</td>' +
              '<td>' + escapar(inst.nivel) + '<span class="subtexto-celda">' + escapar(inst.modalidad) + '</span></td>' +
              '<td>' + escapar(inst.barrio) + '<span class="subtexto-celda">' + escapar(inst.macrozona) + '</span></td>' +
              '<td class="numero">' + formatearNumero(inst.matricula2025) + '</td>' +
              '<td>' +
                '<span class="texto-chico">' +
                  (inst.tieneRampa ? '✓ Rampa ' : '✗ Sin rampa ') + '· ' +
                  (inst.tieneBanoAdaptado ? '✓ Baño adap.' : '✗ Sin baño adap.') +
                '</span>' +
              '</td>' +
              '<td class="numero">' + (sinRel ? '—' : est.subindices.seguridadCritica) + '</td>' +
              '<td class="numero">' + (sinRel ? '—' : est.subindices.aguaSaneamiento) + '</td>' +
              '<td class="numero">' + (sinRel ? '—' : est.subindices.estructuraCubiertas) + '</td>' +
              '<td class="numero">' + (sinRel ? '—' : est.subindices.climatizacion) + '</td>' +
              '<td class="numero"><strong>' + (sinRel ? 'Sin relevar' : (est.global + ' / 100')) + '</strong></td>' +
              '<td><span class="estado ' + claseEstadoDesdeTexto(est.clasificacion) + '">' + escapar(est.clasificacion) + (est.tieneKillSwitch ? ' (KS)' : '') + '</span></td>' +
              '<td>' +
                (sinRel
                  ? '<span class="estado estado--neutro">Pendiente</span>'
                  : (incProv > 0 ? '<span class="estado estado--grave">' + incProv + ' Prov. Mayor</span> ' : '') +
                    (incFod > 0 ? '<span class="estado estado--optimo">' + incFod + ' FoDeMEEP</span>' : (incProv === 0 ? '<span class="estado estado--ok">Al día</span>' : ''))
                ) +
              '</td>' +
              '<td>' +
                '<button type="button" class="boton boton--secundario boton--chico btn-auditar-padron" data-id="' + inst.id + '">' +
                  'Trazabilidad' +
                '</button>' +
              '</td>' +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>';

    cont.querySelectorAll('.btn-auditar-padron').forEach(function (btn) {
      btn.addEventListener('click', function () {
        seleccionarEscuela(btn.getAttribute('data-id'), true);
      });
    });
  }

  /* --- Navegación y Eventos de Interfaz ----------------------------------- */
  function seleccionarEscuela(id, cambiarAVistaTrazabilidad) {
    if (!id) return;
    ESTADO.escuelaSeleccionadaId = id;
    if (cambiarAVistaTrazabilidad) {
      cambiarVista('trazabilidad');
    } else {
      renderizarTodo();
    }
  }

  function cambiarVista(nombreVista) {
    ESTADO.vistaActiva = nombreVista;
    document.querySelectorAll('.tab-vista').forEach(function (btn) {
      const esActiva = (btn.getAttribute('data-vista') === nombreVista);
      btn.classList.toggle('activa', esActiva);
      if (esActiva) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    document.querySelectorAll('.bloque-vista').forEach(function (sec) {
      const esActiva = (sec.id === 'vista-' + nombreVista);
      sec.classList.toggle('activa', esActiva);
      sec.hidden = !esActiva;
    });

    renderizarTodo();
  }

  function vincularEventosUI() {
    // Pestañas de vistas
    document.querySelectorAll('.tab-vista').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cambiarVista(btn.getAttribute('data-vista'));
      });
    });

    // Chips de demarcación rápida de competencias
    document.querySelectorAll('.chip-competencia').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const comp = chip.getAttribute('data-competencia');
        ESTADO.filtros.competencia = comp;
        document.querySelectorAll('.chip-competencia').forEach(function (c) {
          const activo = (c.getAttribute('data-competencia') === comp);
          c.classList.toggle('boton--primario', activo);
          c.classList.toggle('boton--secundario', !activo);
          c.setAttribute('aria-pressed', String(activo));
        });
        renderizarTodo();
      });
    });

    // Filtros desplegables y búsqueda
    const mapSelects = [
      { id: 'filtro-universo', key: 'universo' },
      { id: 'filtro-nivel', key: 'nivel' },
      { id: 'filtro-macrozona', key: 'macrozona' },
      { id: 'filtro-barrio', key: 'barrio' },
      { id: 'filtro-semaforo', key: 'semaforo' }
    ];
    mapSelects.forEach(function (item) {
      const el = document.getElementById(item.id);
      if (el) {
        el.addEventListener('change', function () {
          ESTADO.filtros[item.key] = el.value;
          if (item.key === 'macrozona') {
            const cfgCentro = CENTROS_MACROZONA[el.value] || CENTROS_MACROZONA['TODAS'];
            ESTADO.centroLat = cfgCentro.lat;
            ESTADO.centroLng = cfgCentro.lng;
            ESTADO.zoomMapa = cfgCentro.zoom;
          } else if (item.key === 'barrio') {
            centrarEnBarrioOficial(el.value);
          }
          renderizarTodo();
        });
      }
    });

    const inputBusq = document.getElementById('filtro-busqueda');
    if (inputBusq) {
      inputBusq.addEventListener('input', function () {
        ESTADO.filtros.busqueda = inputBusq.value;
        renderizarTodo();
      });
    }

    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', function () {
        ESTADO.filtros = {
          competencia: 'TODAS',
          universo: 'TODOS',
          nivel: 'TODOS',
          macrozona: 'TODAS',
          barrio: 'TODOS',
          semaforo: 'TODOS',
          busqueda: ''
        };
        ESTADO.centroLat = -33.1240;
        ESTADO.centroLng = -64.3490;
        ESTADO.zoomMapa = 13;
        mapSelects.forEach(function (item) {
          const el = document.getElementById(item.id);
          if (el) el.value = ESTADO.filtros[item.key];
        });
        if (inputBusq) inputBusq.value = '';
        document.querySelectorAll('.chip-competencia').forEach(function (c) {
          const activo = (c.getAttribute('data-competencia') === 'TODAS');
          c.classList.toggle('boton--primario', activo);
          c.classList.toggle('boton--secundario', !activo);
          c.setAttribute('aria-pressed', String(activo));
        });
        renderizarTodo();
      });
    }

    // Controles del mapa
    document.querySelectorAll('.btn-modo-mapa').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ESTADO.modoMapa = btn.getAttribute('data-modo');
        document.querySelectorAll('.btn-modo-mapa').forEach(function (b) {
          const act = (b.getAttribute('data-modo') === ESTADO.modoMapa);
          b.classList.toggle('boton--primario', act);
          b.classList.toggle('boton--secundario', !act);
        });
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      });
    });

    const btnToggleBarrios = document.getElementById('btn-toggle-barrios');
    if (btnToggleBarrios) {
      btnToggleBarrios.addEventListener('click', function () {
        ESTADO.mostrarBarrios = !ESTADO.mostrarBarrios;
        btnToggleBarrios.classList.toggle('boton--primario', ESTADO.mostrarBarrios);
        btnToggleBarrios.classList.toggle('boton--secundario', !ESTADO.mostrarBarrios);
        btnToggleBarrios.setAttribute('aria-pressed', String(ESTADO.mostrarBarrios));
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      });
    }

    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', function () {
        ESTADO.zoomMapa = Math.min(17, ESTADO.zoomMapa + 1);
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', function () {
        ESTADO.zoomMapa = Math.max(11, ESTADO.zoomMapa - 1);
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', function () {
        ESTADO.centroLat = -33.1240;
        ESTADO.centroLng = -64.3490;
        ESTADO.zoomMapa = 13;
        renderizarMapaGeoespacial(obtenerInstitucionesFiltradas());
      });
    }

    // Selector de escuela en Trazabilidad
    const selectEscTraz = document.getElementById('select-escuela-trazabilidad');
    if (selectEscTraz) {
      selectEscTraz.addEventListener('change', function () {
        ESTADO.escuelaSeleccionadaId = selectEscTraz.value;
        renderizarTodo();
      });
    }

    // Botón resetear simulación
    const btnResetSim = document.getElementById('btn-reset-simulacion-escuela');
    if (btnResetSim) {
      btnResetSim.addEventListener('click', function () {
        inicializarEstadoSimulacion();
        renderizarTodo();
      });
    }

    // Ordenamiento del padrón
    const selOrden = document.getElementById('orden-padron');
    if (selOrden) {
      selOrden.addEventListener('change', function () {
        ESTADO.ordenPadron = selOrden.value;
        renderizarVistaPadron(obtenerInstitucionesFiltradas());
      });
    }

    // Importación y Exportaciones CSV / JSON / Impresión
    const btnImportJson = document.getElementById('btn-importar-json');
    const inputImportJson = document.getElementById('input-importar-json');
    if (btnImportJson && inputImportJson) {
      btnImportJson.addEventListener('click', function () {
        inputImportJson.click();
      });
      inputImportJson.addEventListener('change', function (ev) {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (loadEv) {
          try {
            const parsed = JSON.parse(String(loadEv.target.result || '{}'));
            let lista = [];
            if (Array.isArray(parsed.borradores)) {
              lista = parsed.borradores;
            } else if (parsed.relevamiento) {
              lista = [Object.assign({}, parsed.relevamiento, {
                escuelaId: (parsed.institucion && parsed.institucion.escuelaId) || parsed.relevamiento.escuelaId,
                tecnicoNombre: parsed.relevamiento.tecnico || parsed.relevamiento.tecnicoNombre,
                fecha: parsed.relevamiento.fechaRelevamiento || parsed.relevamiento.fecha
              })];
            } else if (parsed.escuelaId) {
              lista = [parsed];
            }
            if (lista.length > 0) {
              aplicarListaBorradores(lista, true);
              fetch('/api/relevamientos-vivos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ borradores: lista })
              }).catch(function () {});
            }
          } catch (err) {
            console.error('Error al importar JSON de relevamiento:', err);
          }
          inputImportJson.value = '';
        };
        reader.readAsText(file);
      });
    }

    const btnCsv = document.getElementById('btn-exportar-csv');
    if (btnCsv) {
      btnCsv.addEventListener('click', exportarPadronCsv);
    }
    const btnJson = document.getElementById('btn-exportar-json');
    if (btnJson) {
      btnJson.addEventListener('click', exportarBbddJson);
    }
    const btnPrint = document.getElementById('btn-imprimir-reporte');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () { window.print(); });
    }
  }

  /* --- Exportación de Datos Auditables ------------------------------------ */
  function exportarPadronCsv() {
    const filtradas = obtenerInstitucionesFiltradas();
    const encabezados = [
      'ID', 'CUE', 'Establecimiento', 'Modalidad', 'Nivel', 'Ambito', 'Barrio', 'Macrozona',
      'Matricula_2025', 'Tiene_Rampa', 'Tiene_Bano_Adaptado', 'IES_Global', 'Clasificacion_Semaforo',
      'Kill_Switch_Activo', 'Seguridad_25', 'Agua_20', 'Cubiertas_18', 'Climatizacion_15',
      'Cocina_10', 'Accesibilidad_7', 'Exterior_5', 'Incidencias_FoDeMEEP', 'Obras_Provincia'
    ];
    const filas = filtradas.map(function (i) {
      const est = obtenerEstadoDinamicoInstitucion(i);
      const nFod = i.incidencias.filter(function (x) { return x.jurisdiccion === 'FoDeMEEP'; }).length;
      const nProv = i.incidencias.filter(function (x) { return x.jurisdiccion === 'PROVINCIA_MAYOR'; }).length;
      return [
        i.id, i.cue, '"' + String(i.nombre).replace(/"/g, '""') + '"', i.modalidad,
        '"' + String(i.nivel).replace(/"/g, '""') + '"', i.ambito,
        '"' + String(i.barrio).replace(/"/g, '""') + '"', '"' + i.macrozona + '"',
        i.matricula2025, i.tieneRampa ? 'SI' : 'NO', i.tieneBanoAdaptado ? 'SI' : 'NO',
        est.global, est.clasificacion, est.tieneKillSwitch ? 'SI' : 'NO',
        est.subindices.seguridadCritica, est.subindices.aguaSaneamiento,
        est.subindices.estructuraCubiertas, est.subindices.climatizacion,
        est.subindices.alimentacionCocina, est.subindices.accesibilidad,
        est.subindices.entornoExterior, nFod, nProv
      ].join(',');
    });
    const contenido = '\\uFEFF' + encabezados.join(',') + '\\n' + filas.join('\\n');
    descargarArchivo(contenido, 'padron_monitor_fodemeep_rcu_2026.csv', 'text/csv;charset=utf-8;');
  }

  function exportarBbddJson() {
    if (!ESTADO.bbdd) return;
    const contenido = JSON.stringify(ESTADO.bbdd, null, 2);
    descargarArchivo(contenido, 'bbdd_relevamiento_fodemeep_rcu_2026.json', 'application/json;charset=utf-8;');
  }

  function descargarArchivo(contenido, nombreArchivo, mimeType) {
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* --- Utilidades de Formato y Presentación ------------------------------- */
  function claseEstadoDesdeTexto(clasificacion) {
    if (clasificacion === 'Sin relevar') return 'estado--neutro';
    if (clasificacion === 'Óptimo') return 'estado--optimo';
    if (clasificacion === 'Bueno') return 'estado--ok';
    if (clasificacion === 'Regular') return 'estado--alerta';
    return 'estado--grave';
  }

  function colorCssEstado(clasificacion) {
    if (clasificacion === 'Sin relevar') return 'var(--marca)';
    if (clasificacion === 'Óptimo') return 'var(--serie-1)';
    if (clasificacion === 'Bueno') return 'var(--ok)';
    if (clasificacion === 'Regular') return 'var(--alerta)';
    return 'var(--grave)';
  }

  function formatearNumero(n) {
    return Number(n || 0).toLocaleString('es-AR');
  }

  function formatearMillones(monto) {
    const m = Number(monto || 0) / 1000000;
    return m.toFixed(2).replace('.', ',') + ' M';
  }

  function acortarTexto(t, max) {
    const s = String(t || '');
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function mostrarError(mensaje) {
    const main = document.querySelector('main .contenedor');
    if (main) {
      main.innerHTML = '<div class="error"><strong>No se pudo mostrar el tablero.</strong><br>' +
        escapar(mensaje) + '</div>';
    }
  }

  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* --- Respaldo Local Embebido de la BBDD y División Barrial Oficial ------ */
  const BBDD_RESPALDO_LOCAL = ${bbddJsonStr};
  const BARRIOS_RESPALDO_LOCAL = ${barriosJsonStr};

  document.addEventListener('DOMContentLoaded', iniciar);
})();
`;

// Verificar que no exista ningún código hexadecimal en jsContent
const hexCheckJs = jsContent.match(/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/g);
if (hexCheckJs) {
  console.error('Encontrado patrón hex en jsContent:', hexCheckJs);
  process.exit(1);
}

const outPaths = [
  path.join(__dirname, '..', 'rcu-tablero-template', 'js', 'tablero.js'),
  path.join(__dirname, '..', 'rcu_template', 'js', 'tablero.js'),
  path.join(__dirname, '..', 'public', 'monitor', 'js', 'tablero.js')
];

for (const p of outPaths) {
  if (fs.existsSync(path.dirname(p))) {
    fs.writeFileSync(p, jsContent, 'utf8');
  }
}

// Sincronizar también index.html y css/tablero.css hacia rcu_template y public/monitor
for (const targetDir of ['rcu_template', path.join('public', 'monitor')]) {
  const fullTarget = path.join(__dirname, '..', targetDir);
  if (fs.existsSync(fullTarget)) {
    fs.copyFileSync(
      path.join(__dirname, '..', 'rcu-tablero-template', 'index.html'),
      path.join(fullTarget, 'index.html')
    );
    fs.copyFileSync(
      path.join(__dirname, '..', 'rcu-tablero-template', 'css', 'tablero.css'),
      path.join(fullTarget, 'css', 'tablero.css')
    );
  }
}

console.log('✓ js/tablero.js generado y sincronizado exitosamente en rcu-tablero-template, rcu_template y public/monitor.');

