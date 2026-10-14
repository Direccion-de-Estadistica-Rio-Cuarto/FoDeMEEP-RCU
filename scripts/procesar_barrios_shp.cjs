const fs = require('fs');
const path = require('path');

// Inverse Transverse Mercator (EPSG:22174 -> WGS84/POSGAR98)
// GRS 1980 ellipsoid: a = 6378137.0, inv_f = 298.257222101
// central_meridian = -63.0 deg, latitude_of_origin = -90.0 deg, k0 = 1.0, FE = 4500000.0, FN = 0.0
function epsg22174ToWgs84(x, y) {
  const a = 6378137.0;
  const f = 1.0 / 298.257222101;
  const e2 = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);
  const k0 = 1.0;
  const lon0 = (-63.0 * Math.PI) / 180.0;
  const FE = 4500000.0;
  const FN = 0.0;

  // Meridional arc distance from equator to -90 deg (South Pole):
  // Since lat_0 = -90 deg in Argentina Gauss-Krüger / POSGAR 98, y is measured northward from the South Pole!
  // Let's compute M0 (meridional arc from equator to -90 deg):
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const A0 = 1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256;
  const A2 = (3 / 8) * (e2 + e4 / 4 + (15 * e6) / 128);
  const A4 = (15 / 256) * (e4 + (3 * e6) / 4);
  const A6 = (35 * e6) / 3072;

  const lat0 = -Math.PI / 2;
  const M0 = a * (A0 * lat0 - A2 * Math.sin(2 * lat0) + A4 * Math.sin(4 * lat0) - A6 * Math.sin(6 * lat0));

  const M = M0 + (y - FN) / k0;
  const mu = M / (a * A0);

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const e1_2 = e1 * e1;
  const e1_3 = e1_2 * e1;
  const e1_4 = e1_3 * e1;

  const J1 = (3 * e1) / 2 - (27 * e1_3) / 32;
  const J2 = (21 * e1_2) / 16 - (55 * e1_4) / 32;
  const J3 = (151 * e1_3) / 96;
  const J4 = (1097 * e1_4) / 512;

  const fp =
    mu +
    J1 * Math.sin(2 * mu) +
    J2 * Math.sin(4 * mu) +
    J3 * Math.sin(6 * mu) +
    J4 * Math.sin(8 * mu);

  const sinFp = Math.sin(fp);
  const cosFp = Math.cos(fp);
  const tanFp = Math.tan(fp);

  const C1 = ep2 * cosFp * cosFp;
  const C1_2 = C1 * C1;
  const T1 = tanFp * tanFp;
  const T1_2 = T1 * T1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinFp * sinFp, 1.5);
  const N1 = a / Math.sqrt(1 - e2 * sinFp * sinFp);
  const D = (x - FE) / (N1 * k0);
  const D2 = D * D;
  const D3 = D2 * D;
  const D4 = D3 * D;
  const D5 = D4 * D;
  const D6 = D5 * D;

  const latRad =
    fp -
    ((N1 * tanFp) / R1) *
      (D2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1_2 - 9 * ep2) * D4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1_2 - 252 * ep2 - 3 * C1_2) * D6) / 720);

  const lonRad =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * D3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1_2 + 8 * ep2 + 24 * T1_2) * D5) / 120) /
      cosFp;

  return {
    lat: Number(((latRad * 180) / Math.PI).toFixed(6)),
    lng: Number(((lonRad * 180) / Math.PI).toFixed(6)),
  };
}

// Parse DBF with UTF-8
function parseDbf(dbfPath) {
  const buf = fs.readFileSync(dbfPath);
  const numRecords = buf.readUInt32LE(4);
  const headerLen = buf.readUInt16LE(8);
  const recordLen = buf.readUInt16LE(10);

  const fields = [];
  let offset = 32;
  while (offset < headerLen - 1 && buf[offset] !== 0x0d) {
    const name = buf.toString('utf8', offset, offset + 11).replace(/\0/g, '').trim();
    const type = String.fromCharCode(buf[offset + 11]);
    const len = buf[offset + 16];
    fields.push({ name, type, len });
    offset += 32;
  }

  const records = [];
  let recOffset = headerLen;
  for (let i = 0; i < numRecords; i++) {
    const rec = {};
    let fOffset = recOffset + 1; // skip deletion flag
    for (const f of fields) {
      const raw = buf.toString('utf8', fOffset, fOffset + f.len).trim();
      rec[f.name] = f.type === 'N' || f.type === 'F' ? Number(raw) : raw;
      fOffset += f.len;
    }
    records.push(rec);
    recOffset += recordLen;
  }
  return records;
}

// Parse SHP (Polygon = 5)
function parseShp(shpPath) {
  const buf = fs.readFileSync(shpPath);
  const geometries = [];
  let offset = 100; // after 100-byte file header

  while (offset < buf.length) {
    const recNum = buf.readInt32BE(offset);
    const contentLenWords = buf.readInt32BE(offset + 4);
    const contentLenBytes = contentLenWords * 2;
    const recStart = offset + 8;
    const shapeType = buf.readInt32LE(recStart);

    if (shapeType === 5 || shapeType === 15) {
      const minX = buf.readDoubleLE(recStart + 4);
      const minY = buf.readDoubleLE(recStart + 12);
      const maxX = buf.readDoubleLE(recStart + 20);
      const maxY = buf.readDoubleLE(recStart + 28);
      const numParts = buf.readInt32LE(recStart + 36);
      const numPoints = buf.readInt32LE(recStart + 40);

      const parts = [];
      for (let p = 0; p < numParts; p++) {
        parts.push(buf.readInt32LE(recStart + 44 + p * 4));
      }

      const pointsOffset = recStart + 44 + numParts * 4;
      const rings = [];
      for (let p = 0; p < numParts; p++) {
        const startIdx = parts[p];
        const endIdx = p + 1 < numParts ? parts[p + 1] : numPoints;
        const ring = [];
        for (let idx = startIdx; idx < endIdx; idx++) {
          const px = buf.readDoubleLE(pointsOffset + idx * 16);
          const py = buf.readDoubleLE(pointsOffset + idx * 16 + 8);
          const { lat, lng } = epsg22174ToWgs84(px, py);
          ring.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
        }
        rings.push(ring);
      }

      const sw = epsg22174ToWgs84(minX, minY);
      const ne = epsg22174ToWgs84(maxX, maxY);
      geometries.push({
        recNum,
        bbox: [
          Number(sw.lng.toFixed(5)),
          Number(sw.lat.toFixed(5)),
          Number(ne.lng.toFixed(5)),
          Number(ne.lat.toFixed(5)),
        ],
        rings,
      });
    } else {
      geometries.push({ recNum, bbox: null, rings: [] });
    }

    offset = recStart + contentLenBytes;
  }

  return geometries;
}

// Ray-casting point in polygon ring ([lng, lat])
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonRings(lng, lat, rings) {
  if (!rings || !rings.length) return false;
  // First ring is exterior in standard simple polygons; let's check if inside any exterior ring
  // Even-odd rule across all rings handles holes and multi-part polygons accurately!
  let inside = false;
  for (const ring of rings) {
    if (pointInRing(lng, lat, ring)) {
      inside = !inside;
    }
  }
  return inside;
}

function computeCentroid(rings) {
  if (!rings || !rings.length || !rings[0].length) return { lat: -33.123, lng: -64.349 };
  // Pick the largest ring
  let bestRing = rings[0];
  for (const r of rings) {
    if (r.length > bestRing.length) bestRing = r;
  }
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = bestRing.length - 1; i < bestRing.length; j = i++) {
    const x0 = bestRing[j][0], y0 = bestRing[j][1];
    const x1 = bestRing[i][0], y1 = bestRing[i][1];
    const f = x0 * y1 - x1 * y0;
    area += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  if (Math.abs(area) < 1e-11) {
    const sum = bestRing.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return {
      lng: Number((sum[0] / bestRing.length).toFixed(5)),
      lat: Number((sum[1] / bestRing.length).toFixed(5)),
    };
  }
  area *= 3;
  return {
    lng: Number((cx / area).toFixed(5)),
    lat: Number((cy / area).toFixed(5)),
  };
}

const shpBase = path.join(
  __dirname,
  '..',
  'mapas_rcu',
  'Barrios',
  'extracted',
  'riocuarto_vecinales_estandarizadas',
  '2026_barrios_estandarizados'
);

const records = parseDbf(shpBase + '.dbf');
const geoms = parseShp(shpBase + '.shp');

console.log(`Parsed ${records.length} DBF records and ${geoms.length} SHP geometries.`);

function clasificarSectorBarrio(nombreBarrio, ambito) {
  if (!nombreBarrio || nombreBarrio === 'Ejido Periurbano / Rural' || ambito === 'Periférico' || ambito === 'Rural') {
    return 'Sector D (Distrito Periférico)';
  }
  const n = nombreBarrio;
  // Sector D (Distrito Periférico): Polígonos periféricos / industriales / borde urbano-rural
  const listaSectorD = [
    'Bo. Las Quintas (El Bañado)',
    'Bo. Las Ferias',
    'Bo. Industrial',
    'Bo. Cielos del Oeste',
    'Bo. Aero Village'
  ];
  if (listaSectorD.includes(n)) {
    return 'Sector D (Distrito Periférico)';
  }

  // Sector A (Alberdi)
  const listaSectorA = [
    'Bo. Pueblo Alberdi',
    'Bo. Alberdi Norte',
    'Bo. Nueva Argentina',
    'Bo. General Güemes',
    'Bo. General Roca',
    'Bo. Excuarteles',
    'Bo. Peirano',
    'Bo. Leandro N. Alem',
    'Bo. Barrios Unidos',
    'Bo. Once de Noviembre',
    'Bo. Doctor Carlos Mayer',
    'S/D N.º 1 - Sector A Alberdi',
    'S/D N.º 3 - Sector A Alberdi'
  ];
  if (listaSectorA.includes(n)) {
    return 'Sector A (Alberdi)';
  }

  // Sector B (Banda Norte)
  const listaSectorB = [
    'Bo. Banda Norte',
    'Bo. Jardín Norte',
    'Bo. Jardín',
    'Bo. General San Martín',
    'Bo. Las Delicias',
    'Bo. Parque Alihuén',
    'Bo. Valacco',
    'Bo. Cabrales (José Antonio y José Mario Cabral)',
    'Bo. Pueblo Nuevo',
    'Bo. Alto Privado Norte',
    'Bo. Residencial Norte',
    'Bo. Las Quintas',
    'Bo. Villa Dalcar',
    'Bo. San Antonio de Padua',
    'Bo. La Agustina',
    'Bo. Paraiso',
    'S/D N.º 2 - Sector B Banda Norte',
    'S/D N.º 5 - Sector B Banda Norte'
  ];
  if (listaSectorB.includes(n)) {
    return 'Sector B (Banda Norte)';
  }

  // Sector C (Centro)
  return 'Sector C (Centro)';
}

const barrios = records.map((rec, idx) => {
  const g = geoms[idx];
  const centroid = computeCentroid(g.rings);
  return {
    fid: rec.fid,
    codvec: rec.codvec,
    nombre: rec.nombre,
    sector: clasificarSectorBarrio(rec.nombre, 'Urbano'),
    centroide: centroid,
    bbox: g.bbox,
    rings: g.rings,
  };
});

console.log('Sample converted barrio 0:', {
  nombre: barrios[0].nombre,
  sector: barrios[0].sector,
  codvec: barrios[0].codvec,
  centroide: barrios[0].centroide,
  bbox: barrios[0].bbox,
  pts: barrios[0].rings[0].length,
});

// Now load bbdd-fodemeep.json and match schools to official barrios
const bbddPaths = [
  path.join(__dirname, '..', 'rcu-tablero-template', 'datos', 'bbdd-fodemeep.json'),
  path.join(__dirname, '..', 'rcu_template', 'datos', 'bbdd-fodemeep.json'),
  path.join(__dirname, '..', 'public', 'monitor', 'datos', 'bbdd-fodemeep.json'),
];

const bbdd = JSON.parse(fs.readFileSync(bbddPaths[0], 'utf8'));
let exactMatches = 0;
let nearMatches = 0;
let ruralOutside = 0;

for (const inst of bbdd.instituciones) {
  const lat = inst.latitud;
  const lng = inst.longitud;
  let matched = null;

  for (const b of barrios) {
    if (
      b.bbox &&
      lng >= b.bbox[0] &&
      lng <= b.bbox[2] &&
      lat >= b.bbox[1] &&
      lat <= b.bbox[3]
    ) {
      if (pointInPolygonRings(lng, lat, b.rings)) {
        matched = b;
        exactMatches++;
        break;
      }
    }
  }

  if (!matched) {
    let bestDist = Infinity;
    let nearest = null;
    for (const b of barrios) {
      for (const ring of b.rings) {
        for (const pt of ring) {
          const d = Math.hypot(lng - pt[0], lat - pt[1]);
          if (d < bestDist) {
            bestDist = d;
            nearest = b;
          }
        }
      }
    }
    if (bestDist <= 0.005 && nearest) {
      matched = nearest;
      nearMatches++;
    } else {
      ruralOutside++;
    }
  }

  if (matched) {
    inst.barrioAnterior = inst.barrioAnterior || inst.barrio;
    inst.barrio = matched.nombre;
    inst.codvec = matched.codvec;
    inst.macrozona = clasificarSectorBarrio(matched.nombre, inst.ambito);
  } else {
    inst.barrioAnterior = inst.barrioAnterior || inst.barrio;
    inst.barrio = 'Ejido Periurbano / Rural';
    inst.codvec = 0;
    inst.macrozona = 'Sector D (Distrito Periférico)';
  }
}

console.log(`School spatial matching: ${exactMatches} exact PIP, ${nearMatches} boundary-snapped, ${ruralOutside} periurban/rural.`);

// Compute neighborhood stats for the 62 official barrios
const barriosPayload = {
  metadata: {
    fuente: 'Dirección General de Estadística y Censos — Municipalidad de Río Cuarto',
    repositorio: 'https://github.com/Direccion-de-Estadistica-Rio-Cuarto/Mapas.git',
    capa: 'Barrios / 2026_barrios_estandarizados',
    crsOriginal: 'EPSG:22174 (POSGAR 98 / Argentina 4)',
    crsDestino: 'EPSG:4326 (WGS 84)',
    totalBarrios: barrios.length,
  },
  barrios,
};

const outBarriosPaths = [
  path.join(__dirname, '..', 'rcu-tablero-template', 'datos', 'barrios-rcu.json'),
  path.join(__dirname, '..', 'rcu_template', 'datos', 'barrios-rcu.json'),
  path.join(__dirname, '..', 'public', 'monitor', 'datos', 'barrios-rcu.json'),
];

for (const p of outBarriosPaths) {
  if (fs.existsSync(path.dirname(p))) {
    fs.writeFileSync(p, JSON.stringify(barriosPayload));
  }
}

for (const p of bbddPaths) {
  if (fs.existsSync(path.dirname(p))) {
    fs.writeFileSync(p, JSON.stringify(bbdd, null, 2));
  }
}

console.log('Saved barrios-rcu.json and updated bbdd-fodemeep.json successfully!');
