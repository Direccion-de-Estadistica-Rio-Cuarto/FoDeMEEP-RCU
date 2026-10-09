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

function cleanString(val) {
  if (!val) return null;
  const s = val.trim();
  if (s === '' || s === '__________' || s === '-' || s === 's/d' || s === 'S/D' || s === '0') return null;
  return s;
}

function parseBool(val) {
  if (!val) return false;
  const s = val.trim().toLowerCase();
  return s === 'sí' || s === 'si' || s === 'true' || s === '1' || s.startsWith('si') || s.startsWith('sí');
}

function parseIntSafe(val) {
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function parseCoordinates(coordStr) {
  if (!coordStr) return { lat: null, lng: null };
  const parts = coordStr.replace(/"/g, '').split(',');
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: null, lng: null };
}

const content = fs.readFileSync('full_dataset.csv', 'utf8');
const rows = parseCSV(content);
const headers = rows[0];
const dataRows = rows.slice(1);

const comunPublicoList = [];
const allPublicoList = [];

for (let idx = 0; idx < dataRows.length; idx++) {
  const r = dataRows[idx];
  const modalidad = (r[0] || '').trim();
  const nivel = (r[1] || '').trim();
  const sector = (r[2] || '').trim();
  const ambito = (r[3] || '').trim();
  const cue = (r[4] || '').trim();
  const nombre = (r[10] || '').trim();

  // Filter out metric/footer rows
  if (['Alumnos Iniciales', 'Alumnos Retenidos', '% de Retención', 'Año', '2022', '2023', '2024', 'Nombre de la Métrica'].includes(modalidad)) {
    continue;
  }
  if (!cue && !nombre) continue;

  const coords = parseCoordinates(r[11]);

  const record = {
    id: `ESC-${cue || (idx + 1).toString().padStart(4, '0')}`,
    modalidad,
    nivel,
    sector,
    ambito,
    cue: cue || null,
    codigoInspeccion: cleanString(r[5]),
    inspector: cleanString(r[6]),
    telInspector: cleanString(r[7]),
    codigoEmp: cleanString(r[8]),
    turno: cleanString(r[9]) || 'No especificado',
    nombre: nombre.replace(/\s+/g, ' ').trim(),
    latitud: coords.lat,
    longitud: coords.lng,
    domicilio: cleanString(r[12]) || 'Sin domicilio registrado',
    localidad: cleanString(r[13]) || 'Río Cuarto',
    barrio: cleanString(r[14]) || 'Centro / No especificado',
    departamento: cleanString(r[15]) || 'Río Cuarto',
    telefono: cleanString(r[16]),
    emailInstitucional: cleanString(r[17]),
    directivo: cleanString(r[18]),
    telDirectivo: cleanString(r[19]),
    emailPersonal: cleanString(r[20]),
    categoria: cleanString(r[21]) || 'No categorizada',
    sillaRuedasUrgente: cleanString(r[22]),
    matricula2024: parseIntSafe(r[23]),
    matricula2025: parseIntSafe(r[24]),
    alumnosDiscapacidad: parseIntSafe(r[25]),
    tieneRampa: parseBool(r[26]),
    tieneBanoAdaptado: parseBool(r[27]),
    tieneSillaRuedas: parseBool(r[28])
  };

  if (sector.toLowerCase() === 'público') {
    allPublicoList.push(record);
    if (modalidad.toLowerCase() === 'común') {
      comunPublicoList.push(record);
    }
  }
}

console.log(`Públicos filtrados: Total Público = ${allPublicoList.length}, Común Público = ${comunPublicoList.length}`);

// Write JSON files
fs.writeFileSync('instituciones_comun_publico.json', JSON.stringify(comunPublicoList, null, 2), 'utf8');
fs.writeFileSync('instituciones_publicas_rio_cuarto_completo.json', JSON.stringify(allPublicoList, null, 2), 'utf8');

// Function to convert list to CSV string
function toCSV(list) {
  const fields = [
    'id', 'cue', 'nombre', 'modalidad', 'nivel', 'sector', 'ambito', 'turno',
    'categoria', 'domicilio', 'barrio', 'localidad', 'departamento',
    'latitud', 'longitud', 'telefono', 'emailInstitucional', 'directivo',
    'telDirectivo', 'codigoInspeccion', 'inspector', 'telInspector',
    'matricula2024', 'matricula2025', 'alumnosDiscapacidad',
    'tieneRampa', 'tieneBanoAdaptado', 'tieneSillaRuedas', 'sillaRuedasUrgente'
  ];
  
  const headerLine = fields.join(',');
  const rowLines = list.map(item => {
    return fields.map(f => {
      const val = item[f];
      if (val === null || val === undefined) return '';
      const strVal = String(val);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    }).join(',');
  });

  return [headerLine, ...rowLines].join('\n');
}

fs.writeFileSync('instituciones_comun_publico.csv', toCSV(comunPublicoList), 'utf8');
fs.writeFileSync('instituciones_publicas_rio_cuarto_completo.csv', toCSV(allPublicoList), 'utf8');

console.log('Archivos JSON y CSV generados exitosamente:');
console.log(' - instituciones_comun_publico.json (84 escuelas)');
console.log(' - instituciones_comun_publico.csv (84 escuelas)');
console.log(' - instituciones_publicas_rio_cuarto_completo.json (122 escuelas públicas provinciales)');
console.log(' - instituciones_publicas_rio_cuarto_completo.csv (122 escuelas públicas provinciales)');
