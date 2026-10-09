import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('instituciones_comun_publico.json', 'utf8'));

const mapped = raw.map(s => {
  const turnos = s.turno ? s.turno.split(',').map(t => t.trim()).filter(Boolean) : ['No especificado'];
  return {
    id: s.id,
    cue: s.cue || s.id,
    nombre: s.nombre,
    nivel: s.nivel,
    direccion: s.domicilio,
    barrio: s.barrio,
    director: s.directivo || 'Sin directivo asignado',
    telefono: s.telefono || s.telDirectivo || 'Sin teléfono',
    email: s.emailInstitucional || s.emailPersonal || 'sin-correo@cba.gov.ar',
    matricula: s.matricula2025 || s.matricula2024 || 0,
    turnos: turnos.length > 0 ? turnos : ['Mañana'],
    superficieM2: 1500,
    coordenadas: { lat: s.latitud, lng: s.longitud },
    codigoInspeccion: s.codigoInspeccion,
    inspector: s.inspector,
    telInspector: s.telInspector,
    alumnosDiscapacidad: s.alumnosDiscapacidad,
    tieneRampa: s.tieneRampa,
    tieneBanoAdaptado: s.tieneBanoAdaptado,
    tieneSillaRuedas: s.tieneSillaRuedas,
    categoria: s.categoria,
    modalidad: s.modalidad,
    ambito: s.ambito
  };
});

const tsCode = `import type { Escuela } from '../types/fodemep';

/**
 * Padrón Oficial de Instituciones Educativas Públicas de Río Cuarto
 * Modalidad: Común | Sector: Público | Ámbitos: Urbano y Rural / Periférico
 * Total: ${mapped.length} instituciones educativas oficiales
 */
export const ESCUELAS_RIO_CUARTO: Escuela[] = ${JSON.stringify(mapped, null, 2)};
`;

fs.writeFileSync('src/data/escuelasRioCuarto.ts', tsCode, 'utf8');
console.log('src/data/escuelasRioCuarto.ts actualizado con ' + mapped.length + ' escuelas.');
