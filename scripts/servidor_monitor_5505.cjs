const http = require('http');
const fs = require('fs');
const path = require('path');
const { evaluarBorradorSobreInstitucion, recalcularResumenGlobalBbdd } = require('./motor_ies_fodemeep.cjs');

const ROOT_PROJECT = path.resolve(__dirname, '..');
const ROOT_MONITOR = path.join(ROOT_PROJECT, 'rcu-tablero-template');
const RUTA_ACTIVOS = path.join(ROOT_MONITOR, 'datos', 'relevamientos-activos.json');
const RUTAS_BBDD = [
  path.join(ROOT_MONITOR, 'datos', 'bbdd-fodemeep.json'),
  path.join(ROOT_PROJECT, 'rcu_template', 'datos', 'bbdd-fodemeep.json'),
  path.join(ROOT_PROJECT, 'public', 'monitor', 'datos', 'bbdd-fodemeep.json')
];

const MIMES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function leerRelevamientosActivos() {
  try {
    if (fs.existsSync(RUTA_ACTIVOS)) {
      return JSON.parse(fs.readFileSync(RUTA_ACTIVOS, 'utf8'));
    }
  } catch (e) {
    console.warn('Error leyendo relevamientos-activos.json:', e.message);
  }
  return {};
}

function obtenerIdEscuelaBorrador(b) {
  if (!b || typeof b !== 'object') return null;
  const raw = b.institucionId || b.escuelaId || (b.institucionCue ? ('ESC-' + String(b.institucionCue).replace(/^ESC-/, '')) : null);
  if (!raw) return null;
  return String(raw).startsWith('ESC-') ? String(raw) : ('ESC-' + String(raw));
}

function guardarRelevamientosYActualizarBbdd(nuevosBorradores) {
  const activos = leerRelevamientosActivos();
  let cambios = 0;

  for (const b of nuevosBorradores) {
    const idEsc = obtenerIdEscuelaBorrador(b);
    if (!idEsc) continue;
    const resp = b.Respuestas || b.respuestas || {};
    const numResp = Object.keys(resp).filter((k) => resp[k] !== undefined && resp[k] !== null && resp[k] !== '' && resp[k] !== 'na').length;
    const fotosEntrantes = (b.fotos || b.evidencias || []).map((f, idx) => ({
      id: f.id || ('foto-' + idx),
      seccionId: f.seccionId || 1,
      preguntaId: f.preguntaId || 1,
      timestamp: f.timestamp || Date.now(),
      dataUrl: f.dataUrl || null
    }));
    const numFotos = fotosEntrantes.length;

    if (numResp > 0 || numFotos > 0) {
      const tsNuevo = Number(b.fechaUltimaModificacion || (b.fechaModificacion ? Date.parse(b.fechaModificacion) : 0) || Date.now());
      const previo = activos[idEsc];
      const tsPrevio = previo ? Number(previo.fechaUltimaModificacion || 0) : 0;
      const fotosPrevias = (previo && Array.isArray(previo.fotos)) ? previo.fotos : [];
      const tieneNuevasFotos = numFotos > fotosPrevias.length;

      if (tsPrevio > tsNuevo && !b.forzarActualizacion && !tieneNuevasFotos) {
        continue;
      }

      const fotosFinales = numFotos > 0 ? fotosEntrantes : fotosPrevias;
      const respFinales = numResp > 0 ? resp : (previo ? (previo.Respuestas || previo.respuestas || {}) : {});

      activos[idEsc] = {
        ...(previo || {}),
        ...b,
        institucionId: idEsc,
        institucionCue: String(idEsc).replace(/^ESC-/, ''),
        escuelaId: idEsc,
        uuid: b.idRelevamiento || b.uuid || (previo && previo.uuid) || ('rel-' + idEsc),
        tecnicoNombre: b.tecnicoNombre || b.tecnico || (previo && previo.tecnicoNombre) || 'Técnico Relevador FoDeMEEP',
        fecha: (b.fechaModificacion || b.fecha || b.fechaRelevamiento || new Date().toISOString()).split('T')[0],
        Respuestas: respFinales,
        respuestas: respFinales,
        fotos: fotosFinales,
        finalizado: Boolean(b.finalizado || (previo && previo.finalizado)),
        hashIntegridad: b.hashIntegridad || (previo && previo.hashIntegridad) || 'sello-sha256-verificado',
        fechaUltimaModificacion: Math.max(tsNuevo, tsPrevio)
      };
      cambios++;
    } else if (activos[idEsc] && b.limpiarExplicito) {
      delete activos[idEsc];
      cambios++;
    }
  }

  fs.mkdirSync(path.dirname(RUTA_ACTIVOS), { recursive: true });
  fs.writeFileSync(RUTA_ACTIVOS, JSON.stringify(activos, null, 2), 'utf8');

  // Aplicar sobre bbdd-fodemeep.json
  const rutaPrincipal = RUTAS_BBDD[0];
  if (fs.existsSync(rutaPrincipal)) {
    const bbdd = JSON.parse(fs.readFileSync(rutaPrincipal, 'utf8'));

    // Resetear todas las instituciones a Sin relevar antes de aplicar los activos
    bbdd.instituciones.forEach((inst) => {
      inst.relevamiento = {
        id: null,
        fecha: null,
        tecnico: null,
        estado: 'SIN_RELEVAR',
        hashIntegridad: 'sin-relevamiento',
        superficieM2: 0,
        calefactoresFuncionando: 0,
        calefactoresAveriados: 0,
        fotosCargadas: 0,
        evidencias: []
      };
      inst.ies = {
        global: 0,
        puntajeBase: 0,
        clasificacion: 'Sin relevar',
        tieneKillSwitch: false,
        factorKillSwitch: 1.0,
        motivoKillSwitch: null,
        subindices: {
          seguridadCritica: 0,
          aguaSaneamiento: 0,
          estructuraCubiertas: 0,
          climatizacion: 0,
          alimentacionCocina: 0,
          accesibilidad: 0,
          entornoExterior: 0
        }
      };
      inst.historialIes = [];
      inst.incidencias = [];
    });

    const escuelasActualizadas = [];
    Object.values(activos).forEach((borrador) => {
      const idEsc = obtenerIdEscuelaBorrador(borrador);
      const cueLimpio = String(idEsc || '').replace(/^ESC-/, '');
      const inst = bbdd.instituciones.find((i) =>
        i.id === idEsc ||
        ('ESC-' + i.cue) === idEsc ||
        String(i.cue) === cueLimpio
      );
      if (inst) {
        const aplicado = evaluarBorradorSobreInstitucion(inst, borrador);
        if (aplicado) {
          const resp = borrador.Respuestas || borrador.respuestas || {};
          escuelasActualizadas.push({
            id: inst.id,
            cue: inst.cue,
            nombre: inst.nombre,
            ies: inst.ies.global,
            clasificacion: inst.ies.clasificacion,
            incidencias: inst.incidencias.length,
            respuestas: Object.keys(resp).length,
            fotos: (borrador.fotos || []).length
          });
        }
      }
    });

    recalcularResumenGlobalBbdd(bbdd);
    const jsonStr = JSON.stringify(bbdd, null, 2);
    RUTAS_BBDD.forEach((r) => {
      if (fs.existsSync(path.dirname(r))) {
        fs.writeFileSync(r, jsonStr, 'utf8');
      }
    });

    if (escuelasActualizadas.length > 0) {
      console.log('[SYNC MONITOR] Instituciones impactadas en BBDD:', JSON.stringify(escuelasActualizadas));
    }
    return { cambios, totalActivos: Object.keys(activos).length, escuelasActualizadas };
  }

  return { cambios, totalActivos: Object.keys(activos).length, escuelasActualizadas: [] };
}

function manejarRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const urlClean = decodeURIComponent(req.url.split('?')[0]);

  if (urlClean === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  }

  if (urlClean === '/api/relevamientos-vivos' && req.method === 'GET') {
    const activos = leerRelevamientosActivos();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(JSON.stringify({ activos }));
  }

  if ((urlClean === '/api/relevamientos-vivos' || urlClean === '/api/v1/sync') && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        let lista = [];
        if (Array.isArray(data.borradores)) {
          lista = data.borradores;
        } else if (data.borrador) {
          lista = [data.borrador];
        } else if (data.relevamiento) {
          lista = [{
            ...data.relevamiento,
            escuelaId: (data.institucion && (data.institucion.escuelaId || data.institucion.id)) || data.relevamiento.institucionId || data.relevamiento.escuelaId
          }];
        } else if (obtenerIdEscuelaBorrador(data)) {
          lista = [data];
        }

        const resultado = guardarRelevamientosYActualizarBbdd(lista);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          mensaje: 'Relevamiento sincronizado e impactado en el Monitor FoDeMEEP.',
          syncedAt: new Date().toISOString(),
          ...resultado
        }));
      } catch (err) {
        console.error('Error en POST sync:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Servir archivos estáticos del Monitor
  let relPath = urlClean === '/' ? '/index.html' : urlClean;
  const fp = path.join(ROOT_MONITOR, relPath);
  if (!fp.startsWith(ROOT_MONITOR) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }

  const ext = path.extname(fp).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIMES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  fs.createReadStream(fp).pipe(res);
}

const CLOUD_RELAY_URL = 'https://ntfy.sh/fodemep_rcu_sync_2026_prod';
const eventosCloudProcesados = new Set();

async function sincronizarDesdeCloudRelay() {
  try {
    const resp = await fetch(CLOUD_RELAY_URL + '/json?poll=1&since=48h');
    if (!resp.ok) return;
    const text = await resp.text();
    if (!text || !text.trim()) return;
    const lines = text.trim().split('\n');
    const recibidos = [];
    for (const line of lines) {
      try {
        const evt = JSON.parse(line);
        if (!evt || evt.event !== 'message' || !evt.id) continue;
        if (eventosCloudProcesados.has(evt.id)) continue;

        let parsed = null;
        if (evt.attachment && evt.attachment.url) {
          const attResp = await fetch(evt.attachment.url);
          if (attResp.ok) {
            parsed = await attResp.json();
          }
        } else if (evt.message) {
          parsed = JSON.parse(evt.message);
        }

        if (parsed) {
          eventosCloudProcesados.add(evt.id);
          if (obtenerIdEscuelaBorrador(parsed)) {
            recibidos.push(parsed);
          } else if (Array.isArray(parsed.borradores)) {
            recibidos.push(...parsed.borradores);
          }
        }
      } catch (e) {}
    }
    if (recibidos.length > 0) {
      guardarRelevamientosYActualizarBbdd(recibidos);
    }
  } catch (e) {
    // Ignorar errores de red temporales
  }
}

const server5505 = http.createServer(manejarRequest);
server5505.listen(5505, () => {
  console.log('✓ Monitor FoDeMEEP RCU + API Sync activo en http://localhost:5505');
  sincronizarDesdeCloudRelay();
  setInterval(sincronizarDesdeCloudRelay, 6000);
});

const server3001 = http.createServer(manejarRequest);
server3001.on('error', (e) => {
  console.warn('Puerto 3001 ocupado o no disponible:', e.message);
});
server3001.listen(3001, () => {
  console.log('✓ API Proxy Sync FoDeMEEP activa en http://localhost:3001');
});
