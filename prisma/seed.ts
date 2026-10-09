import { PrismaClient, ModalidadEducativa, SectorEducativo, AmbitoEducativo, EstadoSemaforo, RolUsuario, JurisdiccionIncidencia, SeveridadIncidencia } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const CATALOGO_INCIDENCIAS = [
  {
    "codigo": "PLOMERIA",
    "nombre": "Plomería y Grifería",
    "descripcion": "Reparación de cañerías, sanitarios, pérdidas de agua y grifería",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 1
  },
  {
    "codigo": "ELECTRICIDAD",
    "nombre": "Electricidad e Iluminación",
    "descripcion": "Tableros, disyuntores diferenciales, cableados, luminarias y tomas",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 2
  },
  {
    "codigo": "HERRERIA",
    "nombre": "Herrería y Seguridad perimetral",
    "descripcion": "Rejas, portones, barandas, cerramientos y aberturas metálicas",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 3
  },
  {
    "codigo": "GAS",
    "nombre": "Gas y Calefacción",
    "descripcion": "Fugas, calefactores de tiro balanceado, reguladores y pruebas de hermeticidad",
    "jurisdiccion": "FODEMEP",
    "severidad": "CRITICA",
    "orden": 4
  },
  {
    "codigo": "DESINFECCION",
    "nombre": "Desinfección y Control de Plagas",
    "descripcion": "Fumigación, desratización y control vectorial periódico",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 5
  },
  {
    "codigo": "VARIOS",
    "nombre": "Mantenimiento General / Varios",
    "descripcion": "Cerrajería, vidrios, ajustes menores y reparaciones generales",
    "jurisdiccion": "FODEMEP",
    "severidad": "LEVE",
    "orden": 6
  },
  {
    "codigo": "PINTURA",
    "nombre": "Pintura",
    "descripcion": "Pintura interior de aulas, galerías, fachadas y señalización de seguridad",
    "jurisdiccion": "FODEMEP",
    "severidad": "LEVE",
    "orden": 7
  },
  {
    "codigo": "ALBANILERIA",
    "nombre": "Albañilería",
    "descripcion": "Revoques, mampostería, solados, contrapisos y fisuras no estructurales",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 8
  },
  {
    "codigo": "REPARACION_ARTEFACTOS",
    "nombre": "Reparación y Mantenimiento de Artefactos",
    "descripcion": "Service técnico a cocinas, anafes, termotanques y calderas",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 9
  },
  {
    "codigo": "FILTRACIONES",
    "nombre": "Filtraciones y Cubiertas",
    "descripcion": "Impermeabilización de losas, reparación de chapas, canaletas y goteras",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 10
  },
  {
    "codigo": "MATAFUEGOS",
    "nombre": "Matafuegos y Seguridad Siniestral",
    "descripcion": "Recarga anual, verificación de manómetros, cartelería de evacuación",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 11
  },
  {
    "codigo": "PODA_CORTE_PASTO",
    "nombre": "Poda y Desmalezado",
    "descripcion": "Corte de césped en patios, desmalezado y poda de ramas con riesgo sobre techos o cableado",
    "jurisdiccion": "FODEMEP",
    "severidad": "LEVE",
    "orden": 12
  },
  {
    "codigo": "BOMBA",
    "nombre": "Bomba de Agua",
    "descripcion": "Reparación o recambio de bombas elevadoras y presurizadoras de agua",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 13
  },
  {
    "codigo": "LIMPIEZA_TANQUE",
    "nombre": "Limpieza de Tanque / Cisterna",
    "descripcion": "Vaciado, desinfección, cloración y sellado hermético de tanques",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 14
  },
  {
    "codigo": "MOBILIARIO",
    "nombre": "Mobiliario Escolar",
    "descripcion": "Reparación de bancos, sillas, pupitres, pizarrones y armarios",
    "jurisdiccion": "FODEMEP",
    "severidad": "LEVE",
    "orden": 15
  },
  {
    "codigo": "DESAGOTE",
    "nombre": "Desagote de Pozos y Cámaras",
    "descripcion": "Servicio atmosférico para desagote de pozos negros y cámaras sépticas",
    "jurisdiccion": "FODEMEP",
    "severidad": "GRAVE",
    "orden": 16
  },
  {
    "codigo": "LIMPIEZA_DESAGUES",
    "nombre": "Limpieza de Desagües y Pluviales",
    "descripcion": "Desobstrucción de pluviales, rejillas de patio, canaletas y bajadas",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 17
  },
  {
    "codigo": "OBRA",
    "nombre": "Obra / Refacción Estructural",
    "descripcion": "Construcción de aulas, núcleos sanitarios completos o intervención mayor",
    "jurisdiccion": "PROVINCIA_MAYOR",
    "severidad": "CRITICA",
    "orden": 18
  },
  {
    "codigo": "CLIMATIZACION",
    "nombre": "Adquisición de Artefactos de Climatización",
    "descripcion": "Ventiladores industriales de pared, aire acondicionado o calefacción central",
    "jurisdiccion": "FODEMEP",
    "severidad": "MEDIA",
    "orden": 19
  },
  {
    "codigo": "CAMION_CISTERNA",
    "nombre": "Provisión por Camión Cisterna",
    "descripcion": "Suministro de emergencia de agua potable ante corte o rotura de red",
    "jurisdiccion": "FODEMEP",
    "severidad": "CRITICA",
    "orden": 20
  }
];

async function main() {
  console.log('Iniciando Seeding FODEMEP...');

  // 1. Cargar Catálogo Oficial de 20 Incidencias
  for (const cat of CATALOGO_INCIDENCIAS) {
    await prisma.catalogoIncidencia.upsert({
      where: { codigo: cat.codigo },
      update: {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        jurisdiccionDefault: cat.jurisdiccion as JurisdiccionIncidencia,
        severidadDefault: cat.severidad as SeveridadIncidencia,
        ordenVisual: cat.orden
      },
      create: {
        codigo: cat.codigo,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        jurisdiccionDefault: cat.jurisdiccion as JurisdiccionIncidencia,
        severidadDefault: cat.severidad as SeveridadIncidencia,
        ordenVisual: cat.orden
      }
    });
  }
  console.log('✓ Catálogo de 20 Incidencias FoDeMEEP sincronizado.');

  // 2. Cargar Usuarios
  await prisma.usuario.upsert({
    where: { email: 'inspector.fodemep@riocuarto.gov.ar' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'inspector.fodemep@riocuarto.gov.ar',
      nombreCompleto: 'Técnico de Campo FODEMEP',
      rol: RolUsuario.INSPECTOR_CAMPO,
      telefono: '358-4000000',
      activo: true
    }
  });

  // 3. Cargar Instituciones Educativas Públicas
  const rawSchools = JSON.parse(fs.readFileSync('instituciones_comun_publico.json', 'utf8'));

  for (const s of rawSchools) {
    let ambito: AmbitoEducativo = AmbitoEducativo.URBANO;
    if (s.ambito.toUpperCase() === 'RURAL') ambito = AmbitoEducativo.RURAL;
    if (s.ambito.toUpperCase() === 'PERIFÉRICO' || s.ambito.toUpperCase() === 'PERIFERICO') ambito = AmbitoEducativo.PERIFERICO;

    await prisma.institucionEducativa.upsert({
      where: { id: s.id },
      update: {
        nombre: s.nombre,
        cue: s.cue,
        nivel: s.nivel,
        domicilio: s.domicilio,
        barrio: s.barrio,
        latitud: s.latitud,
        longitud: s.longitud,
        matricula2024: s.matricula2024,
        matricula2025: s.matricula2025,
        alumnosDiscapacidad: s.alumnosDiscapacidad,
        tieneRampa: s.tieneRampa,
        tieneBanoAdaptado: s.tieneBanoAdaptado,
        tieneSillaRuedas: s.tieneSillaRuedas
      },
      create: {
        id: s.id,
        cue: s.cue,
        codigoInspeccion: s.codigoInspeccion,
        inspectorNombre: s.inspector,
        inspectorTelefono: s.telInspector,
        codigoEmp: s.codigoEmp,
        nombre: s.nombre,
        modalidad: ModalidadEducativa.COMUN,
        nivel: s.nivel,
        sector: SectorEducativo.PUBLICO,
        ambito: ambito,
        turno: s.turno,
        categoria: s.categoria,
        domicilio: s.domicilio,
        barrio: s.barrio,
        localidad: s.localidad,
        departamento: s.departamento,
        latitud: s.latitud,
        longitud: s.longitud,
        telefono: s.telefono,
        emailInstitucional: s.emailInstitucional,
        directivoNombre: s.directivo,
        directivoTelefono: s.telDirectivo,
        directivoEmail: s.emailPersonal,
        matricula2024: s.matricula2024,
        matricula2025: s.matricula2025,
        alumnosDiscapacidad: s.alumnosDiscapacidad,
        tieneRampa: s.tieneRampa,
        tieneBanoAdaptado: s.tieneBanoAdaptado,
        tieneSillaRuedas: s.tieneSillaRuedas,
        sillaRuedasUrgente: s.sillaRuedasUrgente,
        ultimoIndiceIes: 100.0,
        estadoSemaforo: EstadoSemaforo.OPTIMO
      }
    });
  }

  console.log(`✓ ${rawSchools.length} instituciones educativas sincronizadas en la base relacional.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
