const fs = require('fs');
const path = require('path');

/**
 * Catálogo exacto de reglas de generación de incidencias y dimensiones
 * espejo de src/data/preguntasRelevamiento.ts y src/services/engineIndice.ts
 */
const REGLAS_PREGUNTAS = [
  { id: 9, seccionNum: 2, seccionTitulo: 'Sobre el Establecimiento y Espacios', opciones: {
    no: { tipo: 'MOBILIARIO', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Aulas sin uso activo por falta de acondicionamiento' }
  }},
  { id: 23, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    reg: { tipo: 'ALBAÑILERIA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Desgaste y piezas flojas en pisos' },
    mal: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Baldosas faltantes y roturas generalizadas' },
    cri: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 7, descripcion: 'Hundimiento severo de piso con peligro de accidente' }
  }},
  { id: 25, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    si: { tipo: 'ALBAÑILERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Riesgo de tropiezo o desnivel peligroso en solado' }
  }},
  { id: 27, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    reg: { tipo: 'PINTURA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Pintura deteriorada y humedad superficial en muros' },
    mal: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Revoques desprendidos y humedad ascendente en paredes' },
    cri: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Fallas estructurales severas en muros portantes' }
  }},
  { id: 28, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    si: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Grietas estructurales activas en muros', esKillSwitch: true, motivoAlerta: 'Grietas estructurales pasantes' }
  }},
  { id: 30, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    reg: { tipo: 'FILTRACIONES', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Mantenimiento preventivo en cubiertas' },
    mal: { tipo: 'FILTRACIONES', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Goteras activas y membranas rotas en techos' },
    cri: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 10, descripcion: 'Peligro de colapso de techos o filtración masiva' }
  }},
  { id: 32, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    si: { tipo: 'FILTRACIONES', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Filtración activa de lluvia en sectores de la escuela' }
  }},
  { id: 34, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    si: { tipo: 'ALBAÑILERIA', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 8, descripcion: 'Peligro de caída de mampostería o cielorraso', esKillSwitch: true, motivoAlerta: 'Riesgo inminente de desprendimiento de revoques/cielorraso' }
  }},
  { id: 36, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    reg: { tipo: 'HERRERIA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Ajuste de cerrajería y bisagras en aberturas' },
    mal: { tipo: 'HERRERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Aberturas trabadas y vidrios rajados' },
    cri: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Peligro de corte por vidrios astillados o puertas caídas' }
  }},
  { id: 39, seccionNum: 3, seccionTitulo: 'Estructura Edilicia — Pisos, Paredes y Techos', opciones: {
    reg: { tipo: 'HERRERIA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Mantenimiento preventivo en cerramientos' },
    mal: { tipo: 'HERRERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Portones caídos o rejas vencidas' },
    cri: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Falla perimetral grave con inseguridad escolar' }
  }},
  { id: 43, seccionNum: 4, seccionTitulo: 'Instalaciones de Gas', opciones: {
    no: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Instalación de gas sin habilitación vigente' }
  }},
  { id: 45, seccionNum: 4, seccionTitulo: 'Instalaciones de Gas', opciones: {
    reg: { tipo: 'GAS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Pintura y sujeciones de caños de gas' },
    mal: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Cañerías de gas corroídas o antirreglamentarias' },
    cri: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 10, descripcion: 'Peligro grave en tendido de gas', esKillSwitch: true, motivoAlerta: 'Riesgo grave en instalación de gas' }
  }},
  { id: 46, seccionNum: 4, seccionTitulo: 'Instalaciones de Gas', opciones: {
    si: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 12, descripcion: 'Olor a gas o fuga reportada activa', esKillSwitch: true, motivoAlerta: 'Pérdida o fuga de gas reportada' }
  }},
  { id: 51, seccionNum: 4, seccionTitulo: 'Instalaciones de Gas', opciones: {
    algunos: { tipo: 'GAS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Faltan llaves de paso de gas individuales' },
    mayoria: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Falta generalizada de llaves de corte de gas' }
  }},
  { id: 52, seccionNum: 4, seccionTitulo: 'Instalaciones de Gas', opciones: {
    deficientes: { tipo: 'GAS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Rejillas de ventilación de gas tapadas o deterioradas' },
    inexistentes: { tipo: 'GAS', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 9, descripcion: 'Locales con artefactos sin ventilación reglamentaria', esKillSwitch: true, motivoAlerta: 'Peligro de monóxido de carbono por falta de ventilación' }
  }},
  { id: 58, seccionNum: 5, seccionTitulo: 'Cloacas y Desagües', opciones: {
    reg: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Descargas lentas en sanitarios' },
    mal: { tipo: 'DESAGOTE', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Saturación cloacal recurrente' },
    cri: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 8, descripcion: 'Colapso total de sistema cloacal' }
  }},
  { id: 59, seccionNum: 5, seccionTitulo: 'Cloacas y Desagües', opciones: {
    si: { tipo: 'DESAGOTE', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Desbordes u olores cloacales en el edificio' }
  }},
  { id: 60, seccionNum: 5, seccionTitulo: 'Cloacas y Desagües', opciones: {
    reg: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Canaletas con hojas y suciedad' },
    mal: { tipo: 'LIMPIEZA DE DESAGUES', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Canaletas pluviales desprendidas o rotas' },
    cri: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 6, descripcion: 'Falta total de drenaje pluvial con anegamiento' }
  }},
  { id: 70, seccionNum: 6, seccionTitulo: 'Climatización y Ventilación (Calefacción y Aire)', opciones: {
    no: { tipo: 'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Faltan calefactores en aulas activas' }
  }},
  { id: 89, seccionNum: 7, seccionTitulo: 'Sistema de Agua, Tanques y Bombas', opciones: {
    reg: { tipo: 'LIMPIEZA DE TANQUE/CISTERNA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Limpieza y desinfección preventiva de tanques' },
    mal: { tipo: 'LIMPIEZA DE TANQUE/CISTERNA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Fisuras o tapas deterioradas en tanques' },
    cri: { tipo: 'OBRA', criticidad: 'CRITICA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 10, descripcion: 'Riesgo de colapso de torre o contaminación grave de agua', esKillSwitch: true, motivoAlerta: 'Riesgo hídrico y sanitario en tanques' }
  }},
  { id: 90, seccionNum: 7, seccionTitulo: 'Sistema de Agua, Tanques y Bombas', opciones: {
    no: { tipo: 'PLOMERIA', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 7, descripcion: 'Tanques de agua sin tapa hermética reglamentaria', esKillSwitch: true, motivoAlerta: 'Tanques de agua potable sin tapa' },
    algunos: { tipo: 'PLOMERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Ciertas reservas de agua sin tapa adecuada' }
  }},
  { id: 91, seccionNum: 7, seccionTitulo: 'Sistema de Agua, Tanques y Bombas', opciones: {
    b_0: { tipo: 'BOMBA', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 8, descripcion: 'Sin bomba en servicio: falta de agua inminente', esKillSwitch: true, motivoAlerta: 'Falla total del sistema de bombeo de agua' }
  }},
  { id: 93, seccionNum: 7, seccionTitulo: 'Sistema de Agua, Tanques y Bombas', opciones: {
    reg: { tipo: 'BOMBA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Bomba con ruidos o automático manual' },
    mal: { tipo: 'BOMBA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Pérdida en sello mecánico de bomba' },
    cri: { tipo: 'BOMBA', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 8, descripcion: 'Electrobomba quemada o trabada' }
  }},
  { id: 106, seccionNum: 8, seccionTitulo: 'Sanitarios, Griferías y Mesadas', opciones: {
    reg: { tipo: 'PLOMERIA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Goteos leves en canillas' },
    mal: { tipo: 'PLOMERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Canillas con pérdidas continuas y volantes rotos' },
    cri: { tipo: 'PLOMERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Faltante masivo de griferías con desperdicio de agua' }
  }},
  { id: 113, seccionNum: 9, seccionTitulo: 'Iluminación y Electricidad Interna', opciones: {
    reg: { tipo: 'ELECTRICIDAD', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Tubos quemados en aulas' },
    mal: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Falta general de luminarias en pasillos y aulas' },
    cri: { tipo: 'ELECTRICIDAD', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 7, descripcion: 'Artefactos de iluminación con peligro eléctrico' }
  }},
  { id: 116, seccionNum: 9, seccionTitulo: 'Iluminación y Electricidad Interna', opciones: {
    reg: { tipo: 'ELECTRICIDAD', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Tapas de luz flojas' },
    mal: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Tomacorrientes rotos o sueltos' },
    cri: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 8, descripcion: 'Tomacorrientes con chispazos o cables accesibles', esKillSwitch: true, motivoAlerta: 'Peligro de electrocución en tomas' }
  }},
  { id: 117, seccionNum: 9, seccionTitulo: 'Iluminación y Electricidad Interna', opciones: {
    reg: { tipo: 'ELECTRICIDAD', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Tablero eléctrico desordenado sin rotular' },
    mal: { tipo: 'ELECTRICIDAD', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Tablero sin puerta o térmicas sobrecargadas' },
    cri: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 10, descripcion: 'Tablero en estado peligroso con bornes vivos expuestos' }
  }},
  { id: 118, seccionNum: 9, seccionTitulo: 'Iluminación y Electricidad Interna', opciones: {
    no: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 12, descripcion: 'Ausencia de disyuntor diferencial en tablero principal', esKillSwitch: true, motivoAlerta: 'Peligro letal: Tablero sin disyuntor diferencial' }
  }},
  { id: 119, seccionNum: 9, seccionTitulo: 'Iluminación y Electricidad Interna', opciones: {
    si: { tipo: 'ELECTRICIDAD', criticidad: 'CRITICA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 10, descripcion: 'Cables bajo tensión expuestos o empalmes con cinta aisladora floja', esKillSwitch: true, motivoAlerta: 'Cables bajo tensión expuestos' }
  }},
  { id: 127, seccionNum: 10, seccionTitulo: 'Seguridad, Matafuegos y Evacuación', opciones: {
    no: { tipo: 'MATAFUEGOS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Matafuegos con carga y oblea vencida' },
    algunos: { tipo: 'MATAFUEGOS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 3, descripcion: 'Matafuegos con vencimiento parcial' }
  }},
  { id: 136, seccionNum: 10, seccionTitulo: 'Seguridad, Matafuegos y Evacuación', opciones: {
    deficiente: { tipo: 'HERRERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 5, descripcion: 'Salidas de emergencia trabadas o sin barral antipánico' },
    no: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 5, descripcion: 'Sin salida de evacuación reglamentaria' }
  }},
  { id: 143, seccionNum: 11, seccionTitulo: 'Espacios Verdes y Exteriores', opciones: {
    si: { tipo: 'PODA/CORTE DE PASTO', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Árboles de gran porte con ramas secas sobre patios o techos' }
  }},
  { id: 144, seccionNum: 11, seccionTitulo: 'Espacios Verdes y Exteriores', opciones: {
    reg: { tipo: 'ALBAÑILERIA', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Baldosas sueltas en vereda externa' },
    mal: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Vereda rota con pozos y peligro de caída' },
    cri: { tipo: 'ALBAÑILERIA', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Destrucción masiva de vereda perimetral' }
  }},
  { id: 148, seccionNum: 12, seccionTitulo: 'Accesibilidad Universal', opciones: {
    no: { tipo: 'ALBAÑILERIA', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Falta rampa de acceso para sillas de ruedas' }
  }},
  { id: 152, seccionNum: 12, seccionTitulo: 'Accesibilidad Universal', opciones: {
    no: { tipo: 'OBRA', criticidad: 'ALTA', jurisdiccion: 'PROVINCIA_MAYOR', puntosImpacto: 6, descripcion: 'Falta sanitario adaptado para personas con discapacidad' }
  }},
  { id: 159, seccionNum: 13, seccionTitulo: 'Equipamiento de Cocina y Comedor (PAICOR)', opciones: {
    reg: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Mantenimiento de hornallas en cocina PAICOR' },
    mal: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Falla en termocuplas o quemadores de cocina' },
    cri: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Cocina industrial fuera de servicio' }
  }},
  { id: 162, seccionNum: 13, seccionTitulo: 'Equipamiento de Cocina y Comedor (PAICOR)', opciones: {
    reg: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Burletes gastados en heladera' },
    mal: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Pérdida de frío en heladera/freezer' },
    cri: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Heladera o freezer fuera de servicio' }
  }},
  { id: 163, seccionNum: 13, seccionTitulo: 'Equipamiento de Cocina y Comedor (PAICOR)', opciones: {
    reg: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'BAJA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 2, descripcion: 'Limpieza de sarro en calefón' },
    mal: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'MEDIA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 4, descripcion: 'Goteo o falla de encendido en termotanque' },
    cri: { tipo: 'REPARACION/MANTENIMIENTO DE ARTEFACTOS', criticidad: 'ALTA', jurisdiccion: 'FoDeMEEP', puntosImpacto: 6, descripcion: 'Sin agua caliente sanitaria en cocina' }
  }}
];

const MAPA_TIPO_CATALOGO = {
  'PLOMERIA': { id: 'PLOMERIA', nombre: 'PLOMERIA', cuadrilla: 'Plomero matriculado / griferías y flotantes' },
  'ELECTRICIDAD': { id: 'ELECTRICIDAD', nombre: 'ELECTRICIDAD', cuadrilla: 'Electricista matriculado / normalización de tableros' },
  'HERRERIA': { id: 'HERRERIA', nombre: 'HERRERIA', cuadrilla: 'Herrero / soldadura y ajuste de cerramientos' },
  'GAS': { id: 'GAS', nombre: 'GAS', cuadrilla: 'Gasista matriculado / inspección NAG-200' },
  'DESINFECCIÓN': { id: 'DESINFECCION', nombre: 'DESINFECCIÓN', cuadrilla: 'Empresa de saneamiento ambiental' },
  'VARIOS': { id: 'VARIOS', nombre: 'VARIOS', cuadrilla: 'Mantenimiento menor general' },
  'PINTURA': { id: 'PINTURA', nombre: 'PINTURA', cuadrilla: 'Cuadrilla de pintura' },
  'ALBAÑILERIA': { id: 'ALBANILERIA', nombre: 'ALBAÑILERIA', cuadrilla: 'Albañil / reparaciones de mampostería' },
  'REPARACION/MANTENIMIENTO DE ARTEFACTOS': { id: 'REPARACION_ARTEFACTOS', nombre: 'REPARACION/MANT. DE ARTEFACTOS', cuadrilla: 'Servicio técnico electromecánico / gas' },
  'REPARACION/MANT. DE ARTEFACTOS': { id: 'REPARACION_ARTEFACTOS', nombre: 'REPARACION/MANT. DE ARTEFACTOS', cuadrilla: 'Servicio técnico electromecánico / gas' },
  'FILTRACIONES': { id: 'FILTRACIONES', nombre: 'FILTRACIONES', cuadrilla: 'Techista / colocación de membrana o zinguería' },
  'MATAFUEGOS': { id: 'MATAFUEGOS', nombre: 'MATAFUEGOS', cuadrilla: 'Proveedor certificado de extintores' },
  'PODA/CORTE DE PASTO': { id: 'PODA_PASTO', nombre: 'PODA/CORTE DE PASTO', cuadrilla: 'Cuadrilla de espacios verdes / motosierristas' },
  'BOMBA': { id: 'BOMBA', nombre: 'BOMBA', cuadrilla: 'Bobinador / recambio o service de electrobombas' },
  'LIMPIEZA DE TANQUE/CISTERNA': { id: 'LIMPIEZA_TANQUE', nombre: 'LIMPIEZA DE TANQUE/CISTERNA', cuadrilla: 'Cuadrilla especializada con análisis bacteriológico' },
  'MOBILIARIO': { id: 'MOBILIARIO', nombre: 'MOBILIARIO', cuadrilla: 'Carpintería / reposición de mobiliario escolar' },
  'DESAGOTE': { id: 'DESAGOTE', nombre: 'DESAGOTE', cuadrilla: 'Camión atmosférico municipal' },
  'LIMPIEZA DE DESAGUES': { id: 'LIMPIEZA_DESAGUES', nombre: 'LIMPIEZA DE DESAGUES', cuadrilla: 'Cuadrilla de desobstrucción pluvial' },
  'OBRA': { id: 'OBRA_MAYOR', nombre: 'OBRA', cuadrilla: 'Derivación formal a Infraestructura Provincial' },
  'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION': { id: 'ADQUISICION_CLIMA', nombre: 'ADQUISICION ART. CLIMATIZACION', cuadrilla: 'Compra y provisión de equipamiento nuevo' },
  'ADQUISICION ART. CLIMATIZACION': { id: 'ADQUISICION_CLIMA', nombre: 'ADQUISICION ART. CLIMATIZACION', cuadrilla: 'Compra y provisión de equipamiento nuevo' },
  'CAMION CISTERNA': { id: 'CAMION_CISTERNA', nombre: 'CAMION CISTERNA', cuadrilla: 'Suministro de emergencia de agua potable' }
};

const MAPA_DIM_AFECTADA = {
  'GAS': 'seguridadCritica',
  'ELECTRICIDAD': 'seguridadCritica',
  'MATAFUEGOS': 'seguridadCritica',
  'PLOMERIA': 'aguaSaneamiento',
  'BOMBA': 'aguaSaneamiento',
  'LIMPIEZA DE TANQUE/CISTERNA': 'aguaSaneamiento',
  'DESAGOTE': 'aguaSaneamiento',
  'LIMPIEZA DE DESAGUES': 'aguaSaneamiento',
  'FILTRACIONES': 'estructuraCubiertas',
  'ALBAÑILERIA': 'estructuraCubiertas',
  'HERRERIA': 'estructuraCubiertas',
  'PINTURA': 'estructuraCubiertas',
  'OBRA': 'estructuraCubiertas',
  'REPARACION/MANTENIMIENTO DE ARTEFACTOS': 'climatizacion',
  'REPARACION/MANT. DE ARTEFACTOS': 'climatizacion',
  'ADQUISICION DE ARTEFACTOS DE CLIMATIZACION': 'climatizacion',
  'ADQUISICION ART. CLIMATIZACION': 'climatizacion',
  'PODA/CORTE DE PASTO': 'entornoExterior',
  'MOBILIARIO': 'estructuraCubiertas'
};

function evaluarBorradorSobreInstitucion(inst, borrador) {
  const respuestas = borrador.respuestas || borrador.Respuestas || {};
  const keys = Object.keys(respuestas).filter((k) => {
    const v = respuestas[k];
    return v !== undefined && v !== null && v !== '';
  });

  if (keys.length === 0 && (!borrador.fotos || borrador.fotos.length === 0)) {
    return false;
  }

  const r4 = String(respuestas[4] || '');
  const fecha = String(
    (r4.length >= 8 ? r4 : null) ||
    borrador.fecha ||
    (borrador.fechaModificacion ? String(borrador.fechaModificacion).split('T')[0] : null) ||
    new Date().toISOString().split('T')[0]
  );
  const r3 = String(respuestas[3] || '');
  const tecnico = String(
    (borrador.tecnicoNombre && borrador.tecnicoNombre !== 'Técnico Relevador FoDeMEEP' ? borrador.tecnicoNombre : null) ||
    (r3.length > 3 ? r3 : null) ||
    borrador.tecnicoNombre ||
    'Técnico Relevador FoDeMEEP'
  );
  const incidencias = [];
  const penalizadores = [];

  for (const regla of REGLAS_PREGUNTAS) {
    const val = respuestas[regla.id];
    if (val === undefined || val === null || val === '') continue;
    const gen = regla.opciones[String(val)];
    if (gen) {
      const cat = MAPA_TIPO_CATALOGO[gen.tipo] || MAPA_TIPO_CATALOGO['VARIOS'];
      let dimAfectada = MAPA_DIM_AFECTADA[gen.tipo] || 'estructuraCubiertas';
      if (regla.seccionNum === 13) dimAfectada = 'alimentacionCocina';
      if (regla.seccionNum === 12) dimAfectada = 'accesibilidad';
      if (regla.seccionNum === 11 && gen.tipo === 'PODA/CORTE DE PASTO') dimAfectada = 'entornoExterior';

      const factorKS = gen.esKillSwitch ? (gen.criticidad === 'CRITICA' ? 0.75 : 0.85) : 1.0;
      const secTexto = 'Sec. ' + regla.seccionNum + ' (' + regla.seccionTitulo + ')';
      incidencias.push({
        id: 'INC-' + inst.id + '-P' + regla.id,
        tipoId: cat.id,
        tipoCodigo: cat.id,
        tipoNombre: cat.nombre,
        titulo: gen.descripcion,
        descripcion: secTexto + ' · Pregunta N° ' + regla.id,
        seccion: secTexto,
        dimensionAfectada: dimAfectada,
        criticidad: gen.criticidad,
        severidad: gen.criticidad,
        jurisdiccion: gen.jurisdiccion,
        cuadrilla: cat.cuadrilla,
        estado: 'ABIERTA',
        avance: 0,
        avancePorcentaje: 0,
        puntosRecuperables: gen.puntosImpacto,
        impactoPuntosIes: gen.puntosImpacto,
        esKillSwitch: Boolean(gen.esKillSwitch),
        factorKillSwitch: factorKS,
        factorPenalizacion: factorKS,
        motivoKillSwitch: gen.motivoAlerta || null,
        costoEstimado: 0,
        fechaDeteccion: fecha
      });

      if (gen.esKillSwitch && gen.motivoAlerta) {
        penalizadores.push({
          motivo: gen.motivoAlerta,
          factor: factorKS
        });
      }
    }
  }

  const PREGUNTAS_DIM = {
    seguridadCritica: [42, 43, 45, 46, 51, 52, 112, 113, 114, 115, 116, 117, 118, 119, 126, 127, 136],
    aguaSaneamiento: [57, 58, 59, 60, 87, 88, 89, 90, 91, 93, 98, 99, 101, 103, 104, 106, 108],
    estructuraCubiertas: [23, 25, 27, 28, 30, 32, 34, 36, 38, 39],
    climatizacion: [66, 67, 68, 69, 70, 80, 81, 82, 83],
    alimentacionCocina: [159, 162, 163],
    accesibilidad: [148, 152],
    entornoExterior: [141, 143, 144]
  };

  function verificarCompletitudDimension(dimId) {
    const lista = PREGUNTAS_DIM[dimId] || [];
    const total = lista.length;
    let respondidas = 0;
    for (let i = 0; i < lista.length; i++) {
      const qId = lista[i];
      const v = respuestas[qId];
      if (v !== undefined && v !== null && v !== '') {
        respondidas++;
      }
    }
    return {
      respondidas: respondidas,
      total: total,
      completa: total > 0 && respondidas === total
    };
  }

  const completitudDimensiones = {
    seguridadCritica: verificarCompletitudDimension('seguridadCritica'),
    aguaSaneamiento: verificarCompletitudDimension('aguaSaneamiento'),
    estructuraCubiertas: verificarCompletitudDimension('estructuraCubiertas'),
    climatizacion: verificarCompletitudDimension('climatizacion'),
    alimentacionCocina: verificarCompletitudDimension('alimentacionCocina'),
    accesibilidad: verificarCompletitudDimension('accesibilidad'),
    entornoExterior: verificarCompletitudDimension('entornoExterior')
  };

  // Cálculo de las 7 dimensiones: si no está cargada en su totalidad, vale 0
  const fallasSeguridad = incidencias.filter((i) => ['GAS', 'ELECTRICIDAD', 'MATAFUEGOS'].includes(i.tipoNombre));
  const puntosRestaSeg = fallasSeguridad.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeSeguridad = completitudDimensiones.seguridadCritica.completa
    ? Math.round(Math.max(10, Math.min(100, 100 - puntosRestaSeg * 2.2)))
    : 0;

  const fallasAgua = incidencias.filter((i) =>
    ['PLOMERIA', 'BOMBA', 'LIMPIEZA DE TANQUE/CISTERNA', 'DESAGOTE', 'LIMPIEZA DE DESAGUES'].includes(i.tipoNombre)
  );
  const puntosRestaAgua = fallasAgua.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeAgua = completitudDimensiones.aguaSaneamiento.completa
    ? Math.round(Math.max(10, Math.min(100, 100 - puntosRestaAgua * 2.5)))
    : 0;

  const fallasEstructura = incidencias.filter((i) =>
    ['FILTRACIONES', 'ALBAÑILERIA', 'HERRERIA', 'PINTURA', 'OBRA'].includes(i.tipoNombre)
  );
  const puntosRestaEst = fallasEstructura.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeEstructura = completitudDimensiones.estructuraCubiertas.completa
    ? Math.round(Math.max(10, Math.min(100, 100 - puntosRestaEst * 2.2)))
    : 0;

  const fueraServicioCalef = Number(respuestas[69] || 0);
  const funcionandoCalef = Number(respuestas[66] || 0);
  const totalCalef = funcionandoCalef + fueraServicioCalef;
  const ratioCalef = totalCalef > 0 ? (totalCalef - fueraServicioCalef) / totalCalef : 1;
  const fallasClima = incidencias.filter((i) =>
    ['REPARACION/MANT. DE ARTEFACTOS', 'ADQUISICION ART. CLIMATIZACION'].includes(i.tipoNombre)
  );
  const puntajeClima = completitudDimensiones.climatizacion.completa
    ? Math.round(Math.max(15, Math.min(100, ratioCalef * 70 + (30 - fallasClima.length * 5))))
    : 0;

  const fallasCocina = incidencias.filter((i) => i.seccion.includes('Cocina'));
  const puntajeCocina = completitudDimensiones.alimentacionCocina.completa
    ? Math.round(Math.max(20, Math.min(100, 100 - fallasCocina.length * 15)))
    : 0;

  const fallasAcc = incidencias.filter((i) => i.seccion.includes('Accesibilidad'));
  const puntajeAcc = completitudDimensiones.accesibilidad.completa
    ? Math.round(Math.max(20, Math.min(100, 100 - fallasAcc.length * 20)))
    : 0;

  const fallasExt = incidencias.filter((i) => ['PODA/CORTE DE PASTO'].includes(i.tipoNombre));
  const puntajeExt = completitudDimensiones.entornoExterior.completa
    ? Math.round(Math.max(20, Math.min(100, 100 - fallasExt.length * 18)))
    : 0;

  const subindices = {
    seguridadCritica: puntajeSeguridad,
    aguaSaneamiento: puntajeAgua,
    estructuraCubiertas: puntajeEstructura,
    climatizacion: puntajeClima,
    alimentacionCocina: puntajeCocina,
    accesibilidad: puntajeAcc,
    entornoExterior: puntajeExt
  };

  const puntajeBase = Math.round((
    subindices.seguridadCritica * 0.25 +
    subindices.aguaSaneamiento * 0.20 +
    subindices.estructuraCubiertas * 0.18 +
    subindices.climatizacion * 0.15 +
    subindices.alimentacionCocina * 0.10 +
    subindices.accesibilidad * 0.07 +
    subindices.entornoExterior * 0.05
  ) * 10) / 10;

  let factorMultiplicador = 1.0;
  for (const pen of penalizadores) {
    factorMultiplicador *= pen.factor;
  }
  factorMultiplicador = Math.round(factorMultiplicador * 100) / 100;

  const puntajeFinal = Math.max(0, Math.min(100, Math.round(puntajeBase * factorMultiplicador)));
  let clasificacion = 'Crítico';
  if (puntajeFinal >= 85) clasificacion = 'Óptimo';
  else if (puntajeFinal >= 70) clasificacion = 'Bueno';
  else if (puntajeFinal >= 50) clasificacion = 'Regular';

  // Actualizar campos de la institución
  if (respuestas[2]) inst.director = String(respuestas[2]);
  if (respuestas[5]) inst.telefono = String(respuestas[5]);
  if (respuestas[6]) inst.email = String(respuestas[6]);
  if (respuestas[18] && Number(respuestas[18]) > 0) inst.matricula2025 = Number(respuestas[18]);
  if (respuestas[148] === 'si' || respuestas[148] === 'no') inst.tieneRampa = (respuestas[148] === 'si');
  if (respuestas[152] === 'si' || respuestas[152] === 'no') inst.tieneBanoAdaptado = (respuestas[152] === 'si');

  const listaEvidencias = (borrador.fotos || borrador.evidencias || []).map((f, idx) => ({
    id: f.id || ('foto-' + idx),
    seccionId: f.seccionId || 1,
    preguntaId: f.preguntaId || 1,
    timestamp: f.timestamp || Date.now(),
    dataUrl: f.dataUrl || null
  }));

  const idRel = borrador.uuid || ('REL-2026-' + inst.cue);
  inst.relevamiento = {
    id: idRel,
    fecha: fecha,
    tecnico: tecnico,
    estado: borrador.finalizado ? 'CONSOLIDADO' : 'EN_RELEVAMIENTO',
    hashIntegridad: String(borrador.hashIntegridad || 'sello-sha256-verificado').slice(0, 24),
    superficieM2: Number(respuestas[16] || inst.relevamiento.superficieM2 || 0),
    calefactoresFuncionando: funcionandoCalef,
    calefactoresGas: Number(respuestas[67] || 0),
    calefactoresElectricos: Number(respuestas[68] || 0),
    calefactoresAveriados: fueraServicioCalef,
    coberturaCalefaccion: respuestas[70] === 'si' ? 'Sí (Completa)' : (respuestas[70] === 'no' ? 'No (Incompleta)' : 'Sin informar'),
    ventiladoresInstalados: Number(respuestas[80] || 0),
    ventiladoresFuncionando: Number(respuestas[81] || 0),
    airesInstalados: Number(respuestas[82] || 0),
    airesFuncionando: Number(respuestas[83] || 0),
    respuestasCargadas: keys.length,
    respuestas: respuestas,
    fotosCargadas: listaEvidencias.length,
    evidencias: listaEvidencias
  };

  inst.ies = {
    global: puntajeFinal,
    puntajeBase: puntajeBase,
    clasificacion: clasificacion,
    tieneKillSwitch: penalizadores.length > 0,
    factorKillSwitch: factorMultiplicador,
    motivoKillSwitch: penalizadores.length > 0 ? penalizadores.map((p) => p.motivo).join(' · ') : null,
    subindices: subindices,
    completitudDimensiones: completitudDimensiones
  };

  inst.incidencias = incidencias;
  inst.historialIes = [
    {
      periodo: 'Relevamiento ' + fecha,
      fecha: fecha,
      indiceAnterior: puntajeFinal,
      indiceNuevo: puntajeFinal,
      variacion: 0,
      ies: puntajeFinal,
      ordenTrabajo: idRel,
      jurisdiccion: 'FoDeMEEP',
      motivo: 'Relevamiento técnico in situ (' + keys.length + ' respuestas · ' + incidencias.length + ' hallazgos)',
      hito: 'Relevamiento in situ (' + keys.length + ' respuestas · ' + incidencias.length + ' hallazgos)'
    }
  ];

  return true;
}

function recalcularResumenGlobalBbdd(bbdd) {
  const relevadas = bbdd.instituciones.filter((i) => i.ies && i.ies.clasificacion !== 'Sin relevar');
  const sumaIes = relevadas.reduce((acc, i) => acc + i.ies.global, 0);
  const iesProm = relevadas.length > 0 ? Math.round((sumaIes / relevadas.length) * 10) / 10 : 0;

  // Actualizar frecuencias de catálogo según hallazgos reales
  const conteoPorTipo = {};
  let totalFod = 0;
  let totalProv = 0;
  let totalCriticas = 0;

  bbdd.instituciones.forEach((inst) => {
    if (inst.ies && (inst.ies.tieneKillSwitch || inst.ies.clasificacion === 'Crítico')) {
      totalCriticas++;
    }
    (inst.incidencias || []).forEach((inc) => {
      const cod = inc.tipoCodigo || inc.tipoId;
      conteoPorTipo[cod] = (conteoPorTipo[cod] || 0) + 1;
      if (inc.jurisdiccion === 'FoDeMEEP') totalFod++;
      else totalProv++;
    });
  });

  (bbdd.catalogoIncidencias || []).forEach((cat) => {
    const cod = cat.codigo || cat.id;
    cat.frecuenciaHistorica = conteoPorTipo[cod] || 0;
  });

  const nOptimas = relevadas.filter((i) => i.ies.clasificacion === 'Óptimo').length;
  const nBuenas = relevadas.filter((i) => i.ies.clasificacion === 'Bueno').length;
  const nRegulares = relevadas.filter((i) => i.ies.clasificacion === 'Regular').length;
  const nKillSwitch = relevadas.filter((i) => i.ies.tieneKillSwitch).length;
  const nSinRelevar = bbdd.instituciones.length - relevadas.length;

  if (!bbdd.resumenGlobal) bbdd.resumenGlobal = {};
  bbdd.resumenGlobal.institucionesRelevadas = relevadas.length;
  bbdd.resumenGlobal.iesPromedioCiudad = iesProm;
  bbdd.resumenGlobal.escuelasOptimas = nOptimas;
  bbdd.resumenGlobal.escuelasBuenas = nBuenas;
  bbdd.resumenGlobal.escuelasRegulares = nRegulares;
  bbdd.resumenGlobal.escuelasCriticas = totalCriticas;
  bbdd.resumenGlobal.escuelasConKillSwitch = nKillSwitch;
  bbdd.resumenGlobal.totalIncidenciasActivas = totalFod + totalProv;
  bbdd.resumenGlobal.incidenciasFodemeep = totalFod;
  bbdd.resumenGlobal.incidenciasProvincia = totalProv;

  if (bbdd.metadata) {
    bbdd.metadata.promedioIesGlobal = iesProm;
    bbdd.metadata.alertasKillSwitchActivas = nKillSwitch;
    bbdd.metadata.conteoSemaforo = {
      Optimo: nOptimas,
      Bueno: nBuenas,
      Regular: nRegulares,
      Critico: totalCriticas,
      SinRelevar: nSinRelevar
    };
    if (bbdd.metadata.demarcacionCompetencias) {
      if (bbdd.metadata.demarcacionCompetencias.fodemeepMunicipal) {
        bbdd.metadata.demarcacionCompetencias.fodemeepMunicipal.IncidenciasActivas = totalFod;
      }
      if (bbdd.metadata.demarcacionCompetencias.provinciaMayor) {
        bbdd.metadata.demarcacionCompetencias.provinciaMayor.IncidenciasActivas = totalProv;
      }
    }
  }

  if (relevadas.length > 0) {
    const f = relevadas[0].relevamiento.fecha || new Date().toISOString().split('T')[0];
    bbdd.serieHistoricaGlobal = [
      {
        mes: f,
        periodo: 'Relevamiento ' + f,
        fecha: f,
        hito: relevadas.length + ' establecimiento(s) relevado(s) en campo (' + (totalFod + totalProv) + ' hallazgos)',
        iesPromedio: iesProm,
        optimas: nOptimas,
        buenas: nBuenas,
        regulares: nRegulares,
        criticas: totalCriticas,
        escuelasCriticas: totalCriticas,
        ordenesCerradas: 0,
        intervencionesAcumuladas: relevadas.length
      }
    ];
  } else {
    bbdd.serieHistoricaGlobal = [];
  }
}

module.exports = {
  REGLAS_PREGUNTAS,
  MAPA_TIPO_CATALOGO,
  MAPA_DIM_AFECTADA,
  evaluarBorradorSobreInstitucion,
  recalcularResumenGlobalBbdd
};
