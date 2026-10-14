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

function guardarRelevamientosYActualizarBbdd(nuevosBorradores) {
  const activos = leerRelevamientosActivos();
  let cambios = 0;

  for (const b of nuevosBorradores) {
    if (!b || !b.escuelaId) continue;
    const resp = b.respuestas || {};
    const numResp = Object.keys(resp).filter((k) => resp[k] !== undefined && resp[k] !== null && resp[k] !== '').length;
    const numFotos = (b.fotos || []).length;
    if (numResp > 0 || numFotos > 0) {
      activos[b.escuelaId] = {
        escuelaId: b.escuelaId,
        uuid: b.uuid || ('rel-' + b.escuelaId),
        tecnicoNombre: b.tecnicoNombre || b.tecnico || 'Técnico Relevador FoDeMEEP',
        fecha: b.fecha || b.fechaRelevamiento || new Date().toISOString().split('T')[0],
        respuestas: resp,
        fotos: (b.fotos || b.evidencias || []).map((f) => ({
          id: f.id,
          seccionId: f.seccionId,
          preguntaId: f.preguntaId,
          timestamp: f.timestamp
        })),
        finalizado: Boolean(b.finalizado),
        hashIntegridad: b.hashIntegridad || null,
        fechaUltimaModificacion: b.fechaUltimaModificacion || Date.now()
      };
      cambios++;
    } else if (activos[b.escuelaId] && b.limpiarExplicito) {
      delete activos[b.escuelaId];
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
        calefactoresAveriados: 0
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
      const cueLimpio = String(borrador.escuelaId).replace(/^ESC-/, '');
      const inst = bbdd.instituciones.find((i) =>
        i.id === borrador.escuelaId ||
        ('ESC-' + i.cue) === borrador.escuelaId ||
        String(i.cue) === cueLimpio
      );
      if (inst) {
        const aplicado = evaluarBorradorSobreInstitucion(inst, borrador);
        if (aplicado) {
          escuelasActualizadas.push({
            id: inst.id,
            cue: inst.cue,
            nombre: inst.nombre,
            ies: inst.ies.global,
            clasificacion: inst.ies.clasificacion,
            incidencias: inst.incidencias.length,
            respuestas: Object.keys(borrador.respuestas || {}).length
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
            escuelaId: (data.institucion && data.institucion.escuelaId) || data.relevamiento.escuelaId
          }];
        } else if (data.escuelaId) {
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
        if (evt && evt.event === 'message' && evt.message) {
          const parsed = JSON.parse(evt.message);
          if (parsed && parsed.escuelaId) {
            recibidos.push(parsed);
          } else if (parsed && Array.isArray(parsed.borradores)) {
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
