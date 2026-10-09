import fs from 'fs';
import path from 'path';

function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.some(c => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) {
      lines.push(row);
    }
  }
  return lines;
}

const content = fs.readFileSync('full_dataset.csv', 'utf8');
const rows = parseCSV(content);
const headers = rows[0];

console.log('Headers:', headers);
console.log('Total raw rows (including headers):', rows.length);

const modalidades = new Set();
const sectores = new Set();
const ambitos = new Set();
const niveles = new Set();

const dataRows = rows.slice(1);

const filtered = [];
const excludedReasons = {
  notComun: 0,
  notPublico: 0,
  metricRow: 0
};

for (const r of dataRows) {
  const modalidad = (r[0] || '').trim();
  const nivel = (r[1] || '').trim();
  const sector = (r[2] || '').trim();
  const ambito = (r[3] || '').trim();
  const cue = (r[4] || '').trim();
  const nombre = (r[10] || '').trim();

  // If it's a metric or footer row:
  if (['Alumnos Iniciales', 'Alumnos Retenidos', '% de Retención', 'Año', '2022', '2023', '2024'].includes(modalidad)) {
    excludedReasons.metricRow++;
    continue;
  }

  if (modalidad.toLowerCase() !== 'común') {
    excludedReasons.notComun++;
    continue;
  }

  if (sector.toLowerCase() !== 'público') {
    excludedReasons.notPublico++;
    continue;
  }

  filtered.push({
    modalidad,
    nivel,
    sector,
    ambito,
    cue,
    codInsp: (r[5] || '').trim(),
    inspector: (r[6] || '').trim(),
    telInspector: (r[7] || '').trim(),
    codEmp: (r[8] || '').trim(),
    turno: (r[9] || '').trim(),
    nombre,
    coordenadas: (r[11] || '').trim(),
    domicilio: (r[12] || '').trim(),
    localidad: (r[13] || '').trim(),
    barrio: (r[14] || '').trim(),
    departamento: (r[15] || '').trim(),
    telCentro: (r[16] || '').trim(),
    correoInstitucional: (r[17] || '').trim(),
    directora: (r[18] || '').trim(),
    telDirectora: (r[19] || '').trim(),
    correoPersonal: (r[20] || '').trim(),
    categoria: (r[21] || '').trim(),
    sillaRuedasUrgente: (r[22] || '').trim(),
    alumnos2024: (r[23] || '').trim(),
    alumnos2025: (r[24] || '').trim(),
    alumnosDiscapacidad: (r[25] || '').trim(),
    tieneRampa: (r[26] || '').trim(),
    tieneBanoAdaptado: (r[27] || '').trim(),
    tieneSillaRuedas: (r[28] || '').trim()
  });
}

console.log('--- REPORTE DE FILTRADO ---');
console.log('Total registros evaluados:', dataRows.length);
console.log('Excluidos por métricas/pie de página:', excludedReasons.metricRow);
console.log('Excluidos por Modalidad != Común:', excludedReasons.notComun);
console.log('Excluidos por Sector != Público:', excludedReasons.notPublico);
console.log('TOTAL INSTITUCIONES FILTRADAS (Común + Público):', filtered.length);

const nivelesFiltrados = {};
const ambitosFiltrados = {};
for (const item of filtered) {
  nivelesFiltrados[item.nivel] = (nivelesFiltrados[item.nivel] || 0) + 1;
  ambitosFiltrados[item.ambito] = (ambitosFiltrados[item.ambito] || 0) + 1;
}

console.log('\nDistribución por Nivel:', nivelesFiltrados);
console.log('Distribución por Ámbito:', ambitosFiltrados);

console.log('\n--- Detalle de registros excluidos por Modalidad ---');
const excludedMod = {};
for (const r of dataRows) {
  const mod = (r[0] || '').trim();
  const niv = (r[1] || '').trim();
  const sec = (r[2] || '').trim();
  if (['Alumnos Iniciales', 'Alumnos Retenidos', '% de Retención', 'Año', '2022', '2023', '2024'].includes(mod)) continue;
  if (mod.toLowerCase() !== 'común') {
    excludedMod[mod] = (excludedMod[mod] || 0) + 1;
    if (sec.toLowerCase() === 'público') {
      console.log(`Público pero Modalidad='${mod}', Nivel='${niv}', Nombre='${r[10]}'`);
    }
  }
}
console.log('Modalidades excluidas conteo:', excludedMod);

console.log('\n--- Detalle de registros excluidos por Sector ---');
const excludedSec = {};
for (const r of dataRows) {
  const mod = (r[0] || '').trim();
  const niv = (r[1] || '').trim();
  const sec = (r[2] || '').trim();
  if (['Alumnos Iniciales', 'Alumnos Retenidos', '% de Retención', 'Año', '2022', '2023', '2024'].includes(mod)) continue;
  if (sec.toLowerCase() !== 'público') {
    excludedSec[sec] = (excludedSec[sec] || 0) + 1;
  }
}
console.log('\n--- Filas con Superior, F. Profesional o Todos en TODO el archivo ---');
for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const niv = (r[1] || '').trim();
  if (['Superior', 'F. Profesional', 'Todos'].some(x => niv.includes(x))) {
    console.log(`Fila ${i+1}: Mod='${r[0]}', Niv='${r[1]}', Sec='${r[2]}', Amb='${r[3]}', CUE='${r[4]}', Nom='${r[10]}'`);
  }
}

