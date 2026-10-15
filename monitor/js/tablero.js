/* ==========================================================================
   tablero.js — Monitor de Control del Programa FoDeMEEP RCU
   Dirección de Estadística, Control de Calidad y Procesos · Gobierno de Río Cuarto
   ========================================================================== */

(function () {
  'use strict';

  /* --- Reglas y Motor de Evaluación IES (Espejo de PWA de Campo) ---------- */
  const REGLAS_PREGUNTAS = [{"id":9,"seccionNum":2,"seccionTitulo":"Sobre el Establecimiento y Espacios","opciones":{"no":{"tipo":"MOBILIARIO","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Aulas sin uso activo por falta de acondicionamiento"}}},{"id":23,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"reg":{"tipo":"ALBAÑILERIA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Desgaste y piezas flojas en pisos"},"mal":{"tipo":"ALBAÑILERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Baldosas faltantes y roturas generalizadas"},"cri":{"tipo":"OBRA","criticidad":"ALTA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":7,"descripcion":"Hundimiento severo de piso con peligro de accidente"}}},{"id":25,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"si":{"tipo":"ALBAÑILERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Riesgo de tropiezo o desnivel peligroso en solado"}}},{"id":27,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"reg":{"tipo":"PINTURA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Pintura deteriorada y humedad superficial en muros"},"mal":{"tipo":"ALBAÑILERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Revoques desprendidos y humedad ascendente en paredes"},"cri":{"tipo":"OBRA","criticidad":"CRITICA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":8,"descripcion":"Fallas estructurales severas en muros portantes"}}},{"id":28,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"si":{"tipo":"OBRA","criticidad":"CRITICA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":8,"descripcion":"Grietas estructurales activas en muros","esKillSwitch":true,"motivoAlerta":"Grietas estructurales pasantes"}}},{"id":30,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"reg":{"tipo":"FILTRACIONES","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Mantenimiento preventivo en cubiertas"},"mal":{"tipo":"FILTRACIONES","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Goteras activas y membranas rotas en techos"},"cri":{"tipo":"OBRA","criticidad":"CRITICA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":10,"descripcion":"Peligro de colapso de techos o filtración masiva"}}},{"id":32,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"si":{"tipo":"FILTRACIONES","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Filtración activa de lluvia en sectores de la escuela"}}},{"id":34,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"si":{"tipo":"ALBAÑILERIA","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":8,"descripcion":"Peligro de caída de mampostería o cielorraso","esKillSwitch":true,"motivoAlerta":"Riesgo inminente de desprendimiento de revoques/cielorraso"}}},{"id":36,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"reg":{"tipo":"HERRERIA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Ajuste de cerrajería y bisagras en aberturas"},"mal":{"tipo":"HERRERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Aberturas trabadas y vidrios rajados"},"cri":{"tipo":"HERRERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Peligro de corte por vidrios astillados o puertas caídas"}}},{"id":39,"seccionNum":3,"seccionTitulo":"Estructura Edilicia — Pisos, Paredes y Techos","opciones":{"reg":{"tipo":"HERRERIA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Mantenimiento preventivo en cerramientos"},"mal":{"tipo":"HERRERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Portones caídos o rejas vencidas"},"cri":{"tipo":"HERRERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Falla perimetral grave con inseguridad escolar"}}},{"id":43,"seccionNum":4,"seccionTitulo":"Instalaciones de Gas","opciones":{"no":{"tipo":"GAS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Instalación de gas sin habilitación vigente"}}},{"id":45,"seccionNum":4,"seccionTitulo":"Instalaciones de Gas","opciones":{"reg":{"tipo":"GAS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Pintura y sujeciones de caños de gas"},"mal":{"tipo":"GAS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Cañerías de gas corroídas o antirreglamentarias"},"cri":{"tipo":"GAS","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":10,"descripcion":"Peligro grave en tendido de gas","esKillSwitch":true,"motivoAlerta":"Riesgo grave en instalación de gas"}}},{"id":46,"seccionNum":4,"seccionTitulo":"Instalaciones de Gas","opciones":{"si":{"tipo":"GAS","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":12,"descripcion":"Olor a gas o fuga reportada activa","esKillSwitch":true,"motivoAlerta":"Pérdida o fuga de gas reportada"}}},{"id":51,"seccionNum":4,"seccionTitulo":"Instalaciones de Gas","opciones":{"algunos":{"tipo":"GAS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Faltan llaves de paso de gas individuales"},"mayoria":{"tipo":"GAS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Falta generalizada de llaves de corte de gas"}}},{"id":52,"seccionNum":4,"seccionTitulo":"Instalaciones de Gas","opciones":{"deficientes":{"tipo":"GAS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Rejillas de ventilación de gas tapadas o deterioradas"},"inexistentes":{"tipo":"GAS","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":9,"descripcion":"Locales con artefactos sin ventilación reglamentaria","esKillSwitch":true,"motivoAlerta":"Peligro de monóxido de carbono por falta de ventilación"}}},{"id":58,"seccionNum":5,"seccionTitulo":"Cloacas y Desagües","opciones":{"reg":{"tipo":"LIMPIEZA DE DESAGUES","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Descargas lentas en sanitarios"},"mal":{"tipo":"DESAGOTE","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Saturación cloacal recurrente"},"cri":{"tipo":"OBRA","criticidad":"CRITICA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":8,"descripcion":"Colapso total de sistema cloacal"}}},{"id":59,"seccionNum":5,"seccionTitulo":"Cloacas y Desagües","opciones":{"si":{"tipo":"DESAGOTE","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Desbordes u olores cloacales en el edificio"}}},{"id":60,"seccionNum":5,"seccionTitulo":"Cloacas y Desagües","opciones":{"reg":{"tipo":"LIMPIEZA DE DESAGUES","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Canaletas con hojas y suciedad"},"mal":{"tipo":"LIMPIEZA DE DESAGUES","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Canaletas pluviales desprendidas o rotas"},"cri":{"tipo":"OBRA","criticidad":"ALTA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":6,"descripcion":"Falta total de drenaje pluvial con anegamiento"}}},{"id":70,"seccionNum":6,"seccionTitulo":"Climatización y Ventilación (Calefacción y Aire)","opciones":{"no":{"tipo":"ADQUISICION DE ARTEFACTOS DE CLIMATIZACION","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Faltan calefactores en aulas activas"}}},{"id":89,"seccionNum":7,"seccionTitulo":"Sistema de Agua, Tanques y Bombas","opciones":{"reg":{"tipo":"LIMPIEZA DE TANQUE/CISTERNA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Limpieza y desinfección preventiva de tanques"},"mal":{"tipo":"LIMPIEZA DE TANQUE/CISTERNA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Fisuras o tapas deterioradas en tanques"},"cri":{"tipo":"OBRA","criticidad":"CRITICA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":10,"descripcion":"Riesgo de colapso de torre o contaminación grave de agua","esKillSwitch":true,"motivoAlerta":"Riesgo hídrico y sanitario en tanques"}}},{"id":90,"seccionNum":7,"seccionTitulo":"Sistema de Agua, Tanques y Bombas","opciones":{"no":{"tipo":"PLOMERIA","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":7,"descripcion":"Tanques de agua sin tapa hermética reglamentaria","esKillSwitch":true,"motivoAlerta":"Tanques de agua potable sin tapa"},"algunos":{"tipo":"PLOMERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Ciertas reservas de agua sin tapa adecuada"}}},{"id":91,"seccionNum":7,"seccionTitulo":"Sistema de Agua, Tanques y Bombas","opciones":{"b_0":{"tipo":"BOMBA","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":8,"descripcion":"Sin bomba en servicio: falta de agua inminente","esKillSwitch":true,"motivoAlerta":"Falla total del sistema de bombeo de agua"}}},{"id":93,"seccionNum":7,"seccionTitulo":"Sistema de Agua, Tanques y Bombas","opciones":{"reg":{"tipo":"BOMBA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Bomba con ruidos o automático manual"},"mal":{"tipo":"BOMBA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Pérdida en sello mecánico de bomba"},"cri":{"tipo":"BOMBA","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":8,"descripcion":"Electrobomba quemada o trabada"}}},{"id":106,"seccionNum":8,"seccionTitulo":"Sanitarios, Griferías y Mesadas","opciones":{"reg":{"tipo":"PLOMERIA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Goteos leves en canillas"},"mal":{"tipo":"PLOMERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Canillas con pérdidas continuas y volantes rotos"},"cri":{"tipo":"PLOMERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Faltante masivo de griferías con desperdicio de agua"}}},{"id":113,"seccionNum":9,"seccionTitulo":"Iluminación y Electricidad Interna","opciones":{"reg":{"tipo":"ELECTRICIDAD","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Tubos quemados en aulas"},"mal":{"tipo":"ELECTRICIDAD","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Falta general de luminarias en pasillos y aulas"},"cri":{"tipo":"ELECTRICIDAD","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":7,"descripcion":"Artefactos de iluminación con peligro eléctrico"}}},{"id":116,"seccionNum":9,"seccionTitulo":"Iluminación y Electricidad Interna","opciones":{"reg":{"tipo":"ELECTRICIDAD","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Tapas de luz flojas"},"mal":{"tipo":"ELECTRICIDAD","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Tomacorrientes rotos o sueltos"},"cri":{"tipo":"ELECTRICIDAD","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":8,"descripcion":"Tomacorrientes con chispazos o cables accesibles","esKillSwitch":true,"motivoAlerta":"Peligro de electrocución en tomas"}}},{"id":117,"seccionNum":9,"seccionTitulo":"Iluminación y Electricidad Interna","opciones":{"reg":{"tipo":"ELECTRICIDAD","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Tablero eléctrico desordenado sin rotular"},"mal":{"tipo":"ELECTRICIDAD","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Tablero sin puerta o térmicas sobrecargadas"},"cri":{"tipo":"ELECTRICIDAD","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":10,"descripcion":"Tablero en estado peligroso con bornes vivos expuestos"}}},{"id":118,"seccionNum":9,"seccionTitulo":"Iluminación y Electricidad Interna","opciones":{"no":{"tipo":"ELECTRICIDAD","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":12,"descripcion":"Ausencia de disyuntor diferencial en tablero principal","esKillSwitch":true,"motivoAlerta":"Peligro letal: Tablero sin disyuntor diferencial"}}},{"id":119,"seccionNum":9,"seccionTitulo":"Iluminación y Electricidad Interna","opciones":{"si":{"tipo":"ELECTRICIDAD","criticidad":"CRITICA","jurisdiccion":"FoDeMEEP","puntosImpacto":10,"descripcion":"Cables bajo tensión expuestos o empalmes con cinta aisladora floja","esKillSwitch":true,"motivoAlerta":"Cables bajo tensión expuestos"}}},{"id":127,"seccionNum":10,"seccionTitulo":"Seguridad, Matafuegos y Evacuación","opciones":{"no":{"tipo":"MATAFUEGOS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Matafuegos con carga y oblea vencida"},"algunos":{"tipo":"MATAFUEGOS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":3,"descripcion":"Matafuegos con vencimiento parcial"}}},{"id":136,"seccionNum":10,"seccionTitulo":"Seguridad, Matafuegos y Evacuación","opciones":{"deficiente":{"tipo":"HERRERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":5,"descripcion":"Salidas de emergencia trabadas o sin barral antipánico"},"no":{"tipo":"OBRA","criticidad":"ALTA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":5,"descripcion":"Sin salida de evacuación reglamentaria"}}},{"id":143,"seccionNum":11,"seccionTitulo":"Espacios Verdes y Exteriores","opciones":{"si":{"tipo":"PODA/CORTE DE PASTO","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Árboles de gran porte con ramas secas sobre patios o techos"}}},{"id":144,"seccionNum":11,"seccionTitulo":"Espacios Verdes y Exteriores","opciones":{"reg":{"tipo":"ALBAÑILERIA","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Baldosas sueltas en vereda externa"},"mal":{"tipo":"ALBAÑILERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Vereda rota con pozos y peligro de caída"},"cri":{"tipo":"ALBAÑILERIA","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Destrucción masiva de vereda perimetral"}}},{"id":148,"seccionNum":12,"seccionTitulo":"Accesibilidad Universal","opciones":{"no":{"tipo":"ALBAÑILERIA","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Falta rampa de acceso para sillas de ruedas"}}},{"id":152,"seccionNum":12,"seccionTitulo":"Accesibilidad Universal","opciones":{"no":{"tipo":"OBRA","criticidad":"ALTA","jurisdiccion":"PROVINCIA_MAYOR","puntosImpacto":6,"descripcion":"Falta sanitario adaptado para personas con discapacidad"}}},{"id":159,"seccionNum":13,"seccionTitulo":"Equipamiento de Cocina y Comedor (PAICOR)","opciones":{"reg":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Mantenimiento de hornallas en cocina PAICOR"},"mal":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Falla en termocuplas o quemadores de cocina"},"cri":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Cocina industrial fuera de servicio"}}},{"id":162,"seccionNum":13,"seccionTitulo":"Equipamiento de Cocina y Comedor (PAICOR)","opciones":{"reg":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Burletes gastados en heladera"},"mal":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Pérdida de frío en heladera/freezer"},"cri":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Heladera o freezer fuera de servicio"}}},{"id":163,"seccionNum":13,"seccionTitulo":"Equipamiento de Cocina y Comedor (PAICOR)","opciones":{"reg":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"BAJA","jurisdiccion":"FoDeMEEP","puntosImpacto":2,"descripcion":"Limpieza de sarro en calefón"},"mal":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"MEDIA","jurisdiccion":"FoDeMEEP","puntosImpacto":4,"descripcion":"Goteo o falla de encendido en termotanque"},"cri":{"tipo":"REPARACION/MANTENIMIENTO DE ARTEFACTOS","criticidad":"ALTA","jurisdiccion":"FoDeMEEP","puntosImpacto":6,"descripcion":"Sin agua caliente sanitaria en cocina"}}}];
  const MAPA_TIPO_CATALOGO = {"PLOMERIA":{"id":"PLOMERIA","nombre":"PLOMERIA","cuadrilla":"Plomero matriculado / griferías y flotantes"},"ELECTRICIDAD":{"id":"ELECTRICIDAD","nombre":"ELECTRICIDAD","cuadrilla":"Electricista matriculado / normalización de tableros"},"HERRERIA":{"id":"HERRERIA","nombre":"HERRERIA","cuadrilla":"Herrero / soldadura y ajuste de cerramientos"},"GAS":{"id":"GAS","nombre":"GAS","cuadrilla":"Gasista matriculado / inspección NAG-200"},"DESINFECCIÓN":{"id":"DESINFECCION","nombre":"DESINFECCIÓN","cuadrilla":"Empresa de saneamiento ambiental"},"VARIOS":{"id":"VARIOS","nombre":"VARIOS","cuadrilla":"Mantenimiento menor general"},"PINTURA":{"id":"PINTURA","nombre":"PINTURA","cuadrilla":"Cuadrilla de pintura"},"ALBAÑILERIA":{"id":"ALBANILERIA","nombre":"ALBAÑILERIA","cuadrilla":"Albañil / reparaciones de mampostería"},"REPARACION/MANTENIMIENTO DE ARTEFACTOS":{"id":"REPARACION_ARTEFACTOS","nombre":"REPARACION/MANT. DE ARTEFACTOS","cuadrilla":"Servicio técnico electromecánico / gas"},"REPARACION/MANT. DE ARTEFACTOS":{"id":"REPARACION_ARTEFACTOS","nombre":"REPARACION/MANT. DE ARTEFACTOS","cuadrilla":"Servicio técnico electromecánico / gas"},"FILTRACIONES":{"id":"FILTRACIONES","nombre":"FILTRACIONES","cuadrilla":"Techista / colocación de membrana o zinguería"},"MATAFUEGOS":{"id":"MATAFUEGOS","nombre":"MATAFUEGOS","cuadrilla":"Proveedor certificado de extintores"},"PODA/CORTE DE PASTO":{"id":"PODA_PASTO","nombre":"PODA/CORTE DE PASTO","cuadrilla":"Cuadrilla de espacios verdes / motosierristas"},"BOMBA":{"id":"BOMBA","nombre":"BOMBA","cuadrilla":"Bobinador / recambio o service de electrobombas"},"LIMPIEZA DE TANQUE/CISTERNA":{"id":"LIMPIEZA_TANQUE","nombre":"LIMPIEZA DE TANQUE/CISTERNA","cuadrilla":"Cuadrilla especializada con análisis bacteriológico"},"MOBILIARIO":{"id":"MOBILIARIO","nombre":"MOBILIARIO","cuadrilla":"Carpintería / reposición de mobiliario escolar"},"DESAGOTE":{"id":"DESAGOTE","nombre":"DESAGOTE","cuadrilla":"Camión atmosférico municipal"},"LIMPIEZA DE DESAGUES":{"id":"LIMPIEZA_DESAGUES","nombre":"LIMPIEZA DE DESAGUES","cuadrilla":"Cuadrilla de desobstrucción pluvial"},"OBRA":{"id":"OBRA_MAYOR","nombre":"OBRA","cuadrilla":"Derivación formal a Infraestructura Provincial"},"ADQUISICION DE ARTEFACTOS DE CLIMATIZACION":{"id":"ADQUISICION_CLIMA","nombre":"ADQUISICION ART. CLIMATIZACION","cuadrilla":"Compra y provisión de equipamiento nuevo"},"ADQUISICION ART. CLIMATIZACION":{"id":"ADQUISICION_CLIMA","nombre":"ADQUISICION ART. CLIMATIZACION","cuadrilla":"Compra y provisión de equipamiento nuevo"},"CAMION CISTERNA":{"id":"CAMION_CISTERNA","nombre":"CAMION CISTERNA","cuadrilla":"Suministro de emergencia de agua potable"}};
  const MAPA_DIM_AFECTADA = {"GAS":"seguridadCritica","ELECTRICIDAD":"seguridadCritica","MATAFUEGOS":"seguridadCritica","PLOMERIA":"aguaSaneamiento","BOMBA":"aguaSaneamiento","LIMPIEZA DE TANQUE/CISTERNA":"aguaSaneamiento","DESAGOTE":"aguaSaneamiento","LIMPIEZA DE DESAGUES":"aguaSaneamiento","FILTRACIONES":"estructuraCubiertas","ALBAÑILERIA":"estructuraCubiertas","HERRERIA":"estructuraCubiertas","PINTURA":"estructuraCubiertas","OBRA":"estructuraCubiertas","REPARACION/MANTENIMIENTO DE ARTEFACTOS":"climatizacion","REPARACION/MANT. DE ARTEFACTOS":"climatizacion","ADQUISICION DE ARTEFACTOS DE CLIMATIZACION":"climatizacion","ADQUISICION ART. CLIMATIZACION":"climatizacion","PODA/CORTE DE PASTO":"entornoExterior","MOBILIARIO":"estructuraCubiertas"};
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

  // Cálculo de las 7 dimensiones (idéntico a src/services/engineIndice.ts)
  const fallasSeguridad = incidencias.filter((i) => ['GAS', 'ELECTRICIDAD', 'MATAFUEGOS'].includes(i.tipoNombre));
  const puntosRestaSeg = fallasSeguridad.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeSeguridad = Math.round(Math.max(10, Math.min(100, 100 - puntosRestaSeg * 2.2)));

  const fallasAgua = incidencias.filter((i) =>
    ['PLOMERIA', 'BOMBA', 'LIMPIEZA DE TANQUE/CISTERNA', 'DESAGOTE', 'LIMPIEZA DE DESAGUES'].includes(i.tipoNombre)
  );
  const puntosRestaAgua = fallasAgua.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeAgua = Math.round(Math.max(10, Math.min(100, 100 - puntosRestaAgua * 2.5)));

  const fallasEstructura = incidencias.filter((i) =>
    ['FILTRACIONES', 'ALBAÑILERIA', 'HERRERIA', 'PINTURA', 'OBRA'].includes(i.tipoNombre)
  );
  const puntosRestaEst = fallasEstructura.reduce((acc, c) => acc + c.puntosRecuperables, 0);
  const puntajeEstructura = Math.round(Math.max(10, Math.min(100, 100 - puntosRestaEst * 2.2)));

  const fueraServicioCalef = Number(respuestas[69] || 0);
  const funcionandoCalef = Number(respuestas[66] || 0);
  const totalCalef = funcionandoCalef + fueraServicioCalef;
  const ratioCalef = totalCalef > 0 ? (totalCalef - fueraServicioCalef) / totalCalef : 1;
  const fallasClima = incidencias.filter((i) =>
    ['REPARACION/MANT. DE ARTEFACTOS', 'ADQUISICION ART. CLIMATIZACION'].includes(i.tipoNombre)
  );
  let puntajeClima = Math.round(Math.max(15, Math.min(100, ratioCalef * 70 + (30 - fallasClima.length * 5))));

  const fallasCocina = incidencias.filter((i) => i.seccion.includes('Cocina'));
  const puntajeCocina = Math.round(Math.max(20, Math.min(100, 100 - fallasCocina.length * 15)));

  const fallasAcc = incidencias.filter((i) => i.seccion.includes('Accesibilidad'));
  const puntajeAcc = Math.round(Math.max(20, Math.min(100, 100 - fallasAcc.length * 20)));

  const fallasExt = incidencias.filter((i) => ['PODA/CORTE DE PASTO'].includes(i.tipoNombre));
  const puntajeExt = Math.round(Math.max(20, Math.min(100, 100 - fallasExt.length * 18)));

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
    calefactoresAveriados: fueraServicioCalef,
    respuestasCargadas: keys.length,
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
    subindices: subindices
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
  async function iniciar() {
    try {
      let datos = null;
      try {
        const resp = await fetch('datos/bbdd-fodemeep.json');
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
        const tsNuevo = Number(b.fechaUltimaModificacion || (b.fechaModificacion ? Date.parse(b.fechaModificacion) : 0) || 0);
        const prev = ESTADO.borradoresActivos[inst.id];
        const tsPrev = prev ? Number(prev.fechaUltimaModificacion || (prev.fechaModificacion ? Date.parse(prev.fechaModificacion) : 0) || 0) : 0;
        const fotosNuevas = (b.fotos || b.evidencias || []);
        const fotosPrevias = prev ? (prev.fotos || prev.evidencias || []) : (inst.relevamiento && inst.relevamiento.evidencias ? inst.relevamiento.evidencias : []);
        const aportaFotos = fotosNuevas.length > fotosPrevias.length;

        if (prev && tsPrev > tsNuevo && !b.forzarActualizacion && !aportaFotos) return;

        const borradorCombinado = Object.assign({}, prev || {}, b, {
          fotos: fotosNuevas.length > 0 ? fotosNuevas : fotosPrevias
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

    // 3. Leer desde /api/relevamientos-vivos (o datos/relevamientos-activos.json)
    try {
      const resp = await fetch('/api/relevamientos-vivos');
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.activos) {
          Object.values(data.activos).forEach(function (b) {
            if (obtenerIdEscuelaBorrador(b)) recolectados.push(b);
          });
        }
      }
    } catch (e) {}

    // 4. Leer desde Relay Cloud HTTPS (para sincronización directa con celulares en campo, incluyendo fotos adjuntas)
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

    if (recolectados.length > 0) {
      aplicarListaBorradores(recolectados, false);
    }

    // Si ya hay alguna escuela relevada en bbdd-fodemeep.json, seleccionarla por defecto
    const primeraRelevada = ESTADO.bbdd.instituciones.find(function (i) {
      return i.ies && i.ies.clasificacion !== 'Sin relevar';
    });
    if (primeraRelevada) {
      ESTADO.escuelaSeleccionadaId = primeraRelevada.id;
    }
  }

  /* Vincula escuchas en vivo (BroadcastChannel, Storage, postMessage y SSE Cloud Relay) */
  function vincularSincronizacionTiempoReal() {
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

    // Suscripción SSE en tiempo real al Relay Cloud para recibir cierres y fotos desde iPhone/Android al instante
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
      (!inst.incidencias || inst.incidencias.length === 0)
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

      if (!estabaResuelta && ahoraResuelta) {
        subDinamico[dim] = Math.min(100, subDinamico[dim] + inc.impactoPuntosIes * 2);
        puntosRecuperados += inc.impactoPuntosIes;
        intervencionesSimuladas++;
      } else if (estabaResuelta && !ahoraResuelta) {
        subDinamico[dim] = Math.max(20, subDinamico[dim] - inc.impactoPuntosIes * 2);
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

    const globalFinal = Math.max(15, Math.min(100, Math.round(puntajeBase * factorKillSwitch)));
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
            const nombreCorto = b.nombre.replace(/^Bo.s*/i, '');
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
              '<span class="pill-dato"><span class="icono icono--chico" aria-hidden="true">local_fire_department</span> Calefactores activos: <strong>' + inst.relevamiento.calefactoresFuncionando + '/' + (inst.relevamiento.calefactoresFuncionando + inst.relevamiento.calefactoresAveriados) + '</strong></span>' +
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

    // 4.2 Desglose de las 7 Dimensiones Ponderadas
    const contDim = document.getElementById('desglose-dimensiones-escuela');
    if (contDim) {
      contDim.innerHTML = ESTADO.bbdd.dimensionesIes.map(function (dim, idx) {
        const valorActual = est.subindices[dim.id] || 0;
        const valorOriginal = inst.ies.subindices[dim.id] || 0;
        const delta = valorActual - valorOriginal;
        const serieColor = 'var(--serie-' + ((idx % 7) + 1) + ')';
        return '<div class="fila-dimension">' +
          '<div class="cabecera-dimension">' +
            '<div>' +
              '<span class="nombre-dimension">' + escapar(dim.nombre) + '</span> ' +
              '<span class="peso-dimension">(' + Math.round(dim.ponderacion * 100) + '% · ' + escapar(dim.secciones) + ')</span>' +
            '</div>' +
            '<div class="texto-numero">' +
              '<strong>' + valorActual + ' / 100</strong>' +
              (delta > 0 ? ' <span class="estado estado--ok">+' + delta + ' pts</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="pista-barra">' +
            '<div class="relleno-barra" style="width: ' + valorActual + '%; background: ' + serieColor + ';"></div>' +
          '</div>' +
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
    const contenido = '\uFEFF' + encabezados.join(',') + '\n' + filas.join('\n');
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
  const BBDD_RESPALDO_LOCAL = {
  "metadata": {
    "programa": "FoDeMEEP Río Cuarto — Fondo para la Descentralización del Mantenimiento de Edificios Escolares Provinciales",
    "organismo": "Dirección de Estadística, Control de Calidad y Procesos · Secretaría de Gestión y Participación Ciudadana · Gobierno de Río Cuarto",
    "fechaCorte": "2026-10-14",
    "periodo": "Octubre 2026",
    "versionMotorIes": "2.4.0-RCU",
    "totalInstitucionesPublicas": 126,
    "totalModalidadComun": 84,
    "matriculaTotalAlcanzada": 30224,
    "alumnosDiscapacidadTotal": 531,
    "promedioIesGlobal": 97,
    "conteoSemaforo": {
      "Optimo": 1,
      "Bueno": 0,
      "Regular": 0,
      "Critico": 0,
      "SinRelevar": 125
    },
    "alertasKillSwitchActivas": 0,
    "demarcacionCompetencias": {
      "fodemeepMunicipal": {
        "IncidenciasActivas": 3,
        "PresupuestoEstimadoARS": 0,
        "IntervencionesHistoricas": 0,
        "Alcance": "Mantenimiento preventivo y correctivo descentralizado: plomería, electricidad, tableros, gas NAG-200, calefactores, filtraciones localizadas, herrería, limpieza de tanques, desinfección, matafuegos y desmalezado."
      },
      "provinciaMayor": {
        "IncidenciasActivas": 0,
        "PresupuestoEstimadoARS": 0,
        "IntervencionesHistoricas": 0,
        "Alcance": "Obras mayores de infraestructura escolar provincial: recambio estructural de cubiertas de losa/chapa, ampliación de aulas, construcción de núcleos sanitarios nuevos, recalce de fundaciones y tendido integral de redes de gas."
      }
    }
  },
  "dimensionesIes": [
    {
      "id": "seguridadCritica",
      "nombre": "Seguridad de Vida e Instalaciones Críticas",
      "ponderacion": 0.25,
      "secciones": "Sec. 4 (Gas) + Sec. 9 (Electricidad) + Sec. 10 (Incendio)",
      "descripcion": "Prevención de riesgos vitales en redes de gas NAG-200, protecciones diferenciales y extinción."
    },
    {
      "id": "aguaSaneamiento",
      "nombre": "Agua Potable y Saneamiento",
      "ponderacion": 0.2,
      "secciones": "Sec. 5 (Cloacas) + Sec. 7 (Tanques/Bombas) + Sec. 8 (Sanitarios)",
      "descripcion": "Salubridad hídrica, continuidad de suministro EMOS, limpieza de cisternas y núcleos sanitarios."
    },
    {
      "id": "estructuraCubiertas",
      "nombre": "Estructura Edilicia y Cubiertas",
      "ponderacion": 0.18,
      "secciones": "Sec. 3 (Techos, Filtraciones, Muros, Pisos, Aberturas)",
      "descripcion": "Integridad física de cubiertas, impermeabilización de losas, mampostería y cerramientos."
    },
    {
      "id": "climatizacion",
      "nombre": "Climatización y Acondicionamiento Térmico",
      "ponderacion": 0.15,
      "secciones": "Sec. 6 (Calefactores Tiro Balanceado, Calderas, Ventilación)",
      "descripcion": "Bienestar térmico invernal/estival y operatividad del parque de calefactores."
    },
    {
      "id": "alimentacionCocina",
      "nombre": "Espacios de Alimentación y Cocina (PAICOR)",
      "ponderacion": 0.1,
      "secciones": "Sec. 13 (Cocina, Cámaras Frigoríficas, Termotanques)",
      "descripcion": "Condiciones bromatológicas y operativas de comedores escolares PAICOR."
    },
    {
      "id": "accesibilidad",
      "nombre": "Accesibilidad Universal e Inclusión",
      "ponderacion": 0.07,
      "secciones": "Sec. 12 (Rampas, Sanitarios Adaptados, Circulación)",
      "descripcion": "Eliminación de barreras arquitectónicas y cumplimiento de Ley de Accesibilidad."
    },
    {
      "id": "entornoExterior",
      "nombre": "Entorno Exterior, Patios y Perímetro",
      "ponderacion": 0.05,
      "secciones": "Sec. 11 (Arbolado, Veredas, Cercos Perimetrales)",
      "descripcion": "Seguridad en patios recreativos, arbolado sin riesgo y cierre perimetral."
    }
  ],
  "catalogoIncidencias": [
    {
      "codigo": "PLOMERIA",
      "nombre": "Plomería y Grifería",
      "seccionId": 8,
      "seccion": "Sanitarios y Griferías",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Cuadrilla Sanitaria / Plomería Municipal",
      "costoBase": 0,
      "impactoBase": 5
    },
    {
      "codigo": "ELECTRICIDAD",
      "nombre": "Electricidad e Iluminación",
      "seccionId": 9,
      "seccion": "Instalación Eléctrica",
      "dimension": "seguridadCritica",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Electricista Matriculado FoDeMEEP",
      "costoBase": 0,
      "impactoBase": 8
    },
    {
      "codigo": "HERRERIA",
      "nombre": "Herrería y Cerramientos",
      "seccionId": 3,
      "seccion": "Estructura y Aberturas",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 1,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Taller de Herrería y Soldadura",
      "costoBase": 0,
      "impactoBase": 4
    },
    {
      "codigo": "GAS",
      "nombre": "Gas y Calefacción (NAG-200)",
      "seccionId": 4,
      "seccion": "Instalación de Gas",
      "dimension": "seguridadCritica",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "CRITICA",
      "cuadrilla": "Gasista Matriculado Categoría 1ª",
      "costoBase": 0,
      "impactoBase": 12
    },
    {
      "codigo": "DESINFECCION",
      "nombre": "Desinfección y Control Vectorial",
      "seccionId": 7,
      "seccion": "Saneamiento Ambiental",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Saneamiento Ambiental y Zoonosis",
      "costoBase": 0,
      "impactoBase": 4
    },
    {
      "codigo": "VARIOS",
      "nombre": "Mantenimiento General y Cerrajería",
      "seccionId": 2,
      "seccion": "Mantenimiento Edilicio General",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "LEVE",
      "cuadrilla": "Cuadrilla Operativa Multipropósito",
      "costoBase": 0,
      "impactoBase": 2
    },
    {
      "codigo": "PINTURA",
      "nombre": "Pintura Interior y Fachada",
      "seccionId": 3,
      "seccion": "Muros y Cielorrasos",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "LEVE",
      "cuadrilla": "Cuadrilla de Pintura Escolar",
      "costoBase": 0,
      "impactoBase": 3
    },
    {
      "codigo": "ALBANILERIA",
      "nombre": "Albañilería, Revoques y Solados",
      "seccionId": 3,
      "seccion": "Estructura, Pisos y Muros",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 2,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Cuadrilla de Albañilería y Mampostería",
      "costoBase": 0,
      "impactoBase": 6
    },
    {
      "codigo": "REPARACION_ARTEFACTOS",
      "nombre": "Reparación y Mant. de Artefactos",
      "seccionId": 6,
      "seccion": "Climatización y Cocina",
      "dimension": "climatizacion",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Servicio Técnico Electromecánico / Gas",
      "costoBase": 0,
      "impactoBase": 5
    },
    {
      "codigo": "FILTRACIONES",
      "nombre": "Filtraciones, Cubiertas y Zinguería",
      "seccionId": 3,
      "seccion": "Techos y Cubiertas",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Especialistas en Cubiertas e Impermeabilización",
      "costoBase": 0,
      "impactoBase": 8
    },
    {
      "codigo": "MATAFUEGOS",
      "nombre": "Matafuegos y Seguridad Siniestral",
      "seccionId": 10,
      "seccion": "Seguridad contra Incendios",
      "dimension": "seguridadCritica",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Proveedor Certificado de Extintores e Higiene",
      "costoBase": 0,
      "impactoBase": 6
    },
    {
      "codigo": "PODA_CORTE_PASTO",
      "nombre": "Poda, Desmalezado y Espacios Verdes",
      "seccionId": 11,
      "seccion": "Entorno Exterior y Patios",
      "dimension": "entornoExterior",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "LEVE",
      "cuadrilla": "Cuadrilla de Espacios Verdes y Arbolado",
      "costoBase": 0,
      "impactoBase": 4
    },
    {
      "codigo": "BOMBA",
      "nombre": "Bombas Elevadoras y Presurizadoras",
      "seccionId": 7,
      "seccion": "Provisión de Agua Potable",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Electromecánica y Bobinado Hidráulico",
      "costoBase": 0,
      "impactoBase": 9
    },
    {
      "codigo": "LIMPIEZA_TANQUE",
      "nombre": "Limpieza y Cloración de Tanques/Cisternas",
      "seccionId": 7,
      "seccion": "Calidad de Agua y Reserva",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Cuadrilla Bromatológica y Saneamiento Hídrico",
      "costoBase": 0,
      "impactoBase": 8
    },
    {
      "codigo": "MOBILIARIO",
      "nombre": "Mobiliario Escolar y Carpintería",
      "seccionId": 2,
      "seccion": "Aulas y Equipamiento",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "LEVE",
      "cuadrilla": "Carpintería y Restauración de Mobiliario",
      "costoBase": 0,
      "impactoBase": 2
    },
    {
      "codigo": "DESAGOTE",
      "nombre": "Desagote de Pozos y Cámaras Sépticas",
      "seccionId": 5,
      "seccion": "Red Cloacal y Efluentes",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "GRAVE",
      "cuadrilla": "Servicio de Camión Atmosférico Municipal",
      "costoBase": 0,
      "impactoBase": 7
    },
    {
      "codigo": "LIMPIEZA_DESAGUES",
      "nombre": "Limpieza de Desagües Pluviales y Canaletas",
      "seccionId": 5,
      "seccion": "Desagües Pluviales",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Cuadrilla de Desobstrucción Hidráulica",
      "costoBase": 0,
      "impactoBase": 4
    },
    {
      "codigo": "OBRA",
      "nombre": "Obra Mayor / Refacción Estructural Provincial",
      "seccionId": 3,
      "seccion": "Infraestructura Mayor Edilicia",
      "dimension": "estructuraCubiertas",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "PROVINCIA_MAYOR",
      "severidadDefault": "CRITICA",
      "cuadrilla": "Dirección de Infraestructura Escolar — Ministerio Prov. Córdoba",
      "costoBase": 0,
      "impactoBase": 18
    },
    {
      "codigo": "CLIMATIZACION",
      "nombre": "Adquisición de Artefactos de Climatización",
      "seccionId": 6,
      "seccion": "Confort Térmico Aulas",
      "dimension": "climatizacion",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "MEDIA",
      "cuadrilla": "Adquisición e Instalación FoDeMEEP",
      "costoBase": 0,
      "impactoBase": 6
    },
    {
      "codigo": "CAMION_CISTERNA",
      "nombre": "Asistencia Hídrica por Camión Cisterna",
      "seccionId": 7,
      "seccion": "Emergencia Hídrica",
      "dimension": "aguaSaneamiento",
      "frecuenciaHistorica": 0,
      "jurisdiccion": "FoDeMEEP",
      "severidadDefault": "CRITICA",
      "cuadrilla": "Defensa Civil / EMOS Suministro de Emergencia",
      "costoBase": 0,
      "impactoBase": 11
    }
  ],
  "serieHistoricaGlobal": [
    {
      "mes": "2026-10-14",
      "periodo": "Relevamiento 2026-10-14",
      "fecha": "2026-10-14",
      "hito": "1 establecimiento(s) relevado(s) en campo (3 hallazgos)",
      "iesPromedio": 97,
      "optimas": 1,
      "buenas": 0,
      "regulares": 0,
      "criticas": 0,
      "escuelasCriticas": 0,
      "ordenesCerradas": 0,
      "intervencionesAcumuladas": 1
    }
  ],
  "instituciones": [
    {
      "id": "ESC-140088000",
      "cue": "140088000",
      "codigoEmp": "EE0640482",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. LEOPOLDO LUGONES",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Las Delicias",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Fray Quirico Porreca 1320",
      "latitud": -33.121204,
      "longitud": -64.323419,
      "matricula2024": 118,
      "matricula2025": 114,
      "alumnosDiscapacidad": 5,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Delicias",
      "codvec": 37
    },
    {
      "id": "ESC-140088500",
      "cue": "140088500",
      "codigoEmp": "EE0640496",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. PROVINCIA DE SANTA CRUZ",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Jardín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Uruguay 102",
      "latitud": -33.102028,
      "longitud": -64.330835,
      "matricula2024": 149,
      "matricula2025": 161,
      "alumnosDiscapacidad": 6,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 39
    },
    {
      "id": "ESC-140088800",
      "cue": "140088800",
      "codigoEmp": "EE0640465",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. MODELO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General Roca",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Lavalle 1410",
      "latitud": -33.132046,
      "longitud": -64.344776,
      "matricula2024": 123,
      "matricula2025": 117,
      "alumnosDiscapacidad": 9,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 7
    },
    {
      "id": "ESC-140088900",
      "cue": "140088900",
      "codigoEmp": "EE0640509",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. DOMINGO FAUSTINO SARMIENTO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Parque Bimaco",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Fray Mamerto Esquiú 1035",
      "latitud": -33.137911,
      "longitud": -64.368067,
      "matricula2024": 146,
      "matricula2025": 138,
      "alumnosDiscapacidad": 3,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Parque Bimaco",
      "codvec": 14
    },
    {
      "id": "ESC-140089000",
      "cue": "140089000",
      "codigoEmp": "EE0640487",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. TTE. GRAL. EDUARDO RACEDO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Arturo M. Bas 1696",
      "latitud": -33.124473,
      "longitud": -64.370379,
      "matricula2024": 132,
      "matricula2025": 161,
      "alumnosDiscapacidad": 3,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Intendente Mójica",
      "codvec": 10
    },
    {
      "id": "ESC-140091300",
      "cue": "140091300",
      "codigoEmp": "EE0640504",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. MARIANO MORENO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Pedro Goyena 550",
      "latitud": -33.136423,
      "longitud": -64.3344,
      "matricula2024": 136,
      "matricula2025": 128,
      "alumnosDiscapacidad": 4,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140091400",
      "cue": "140091400",
      "codigoEmp": "EE0640502",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. ARZOBISPO MARIANO ANTONIO ESPINOSA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General Güemes",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Olegario Andrade 1070",
      "latitud": -33.137383,
      "longitud": -64.326471,
      "matricula2024": 143,
      "matricula2025": 124,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Pueblo Alberdi",
      "codvec": 6
    },
    {
      "id": "ESC-140091500",
      "cue": "140091500",
      "codigoEmp": "EE0640466",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. MERCEDES SAN MARTIN DE BALCARCE",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Alberdi Norte",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Entre Ríos 750",
      "latitud": -33.132146,
      "longitud": -64.329982,
      "matricula2024": 121,
      "matricula2025": 122,
      "alumnosDiscapacidad": 4,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 21
    },
    {
      "id": "ESC-140140300",
      "cue": "140140300",
      "codigoEmp": "EE0640503",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. BERNARDINO RIVADAVIA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Las Quintas (El Bañado)",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Wenceslao Tejerina & & Ruta Nacional A005",
      "latitud": -33.095919,
      "longitud": -64.366309,
      "matricula2024": 156,
      "matricula2025": 161,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Quintas",
      "codvec": 99
    },
    {
      "id": "ESC-140140700",
      "cue": "140140700",
      "codigoEmp": "EE0640463",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. GREGORIA MATORRAS DE SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Buena Vista",
      "macrozona": "Sector C (Centro)",
      "domicilio": "9 de Julio 352",
      "latitud": -33.118839,
      "longitud": -64.35356,
      "matricula2024": 80,
      "matricula2025": 71,
      "alumnosDiscapacidad": 1,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 12
    },
    {
      "id": "ESC-140153400",
      "cue": "140153400",
      "codigoEmp": "EE0640485",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. DR. ADOLFO ALSINA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General San Martín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Av. Gral. José Garibaldi 796",
      "latitud": -33.096697,
      "longitud": -64.344592,
      "matricula2024": 152,
      "matricula2025": 161,
      "alumnosDiscapacidad": 3,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 43
    },
    {
      "id": "ESC-140153700",
      "cue": "140153700",
      "codigoEmp": "EE0640475",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. REPUBLICA DEL URUGUAY",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "San Luis 348",
      "latitud": -33.112571,
      "longitud": -64.33746,
      "matricula2024": 76,
      "matricula2025": 79,
      "alumnosDiscapacidad": 3,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140154000",
      "cue": "140154000",
      "codigoEmp": "EE0640474",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. ALMIRANTE BROWN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Río Juramento 641",
      "latitud": -33.109278,
      "longitud": -64.351275,
      "matricula2024": 63,
      "matricula2025": 68,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "José de Calasanz",
      "codvec": 3
    },
    {
      "id": "ESC-140168600",
      "cue": "140168600",
      "codigoEmp": "EE0640539",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. MANUELA GUILLERMINA MALDONADO DE PARTELLI",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana",
      "barrio": "Ejido Periurbano / Rural",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "CALLE PUBLICA LA ESQUINA P/TRES ACEQUIAS",
      "latitud": -33.019183,
      "longitud": -64.438947,
      "matricula2024": 13,
      "matricula2025": 18,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Quintas",
      "codvec": 0
    },
    {
      "id": "ESC-140177600",
      "cue": "140177600",
      "codigoEmp": "EE0640478",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. 21 DE JULIO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Segunda",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Lavalle 510",
      "latitud": -33.123089,
      "longitud": -64.341962,
      "matricula2024": 92,
      "matricula2025": 93,
      "alumnosDiscapacidad": 8,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 98
    },
    {
      "id": "ESC-140177900",
      "cue": "140177900",
      "codigoEmp": "EE0640461",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. DAMAS MENDOCINAS",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Saint Remy 564",
      "latitud": -33.131148,
      "longitud": -64.356626,
      "matricula2024": 148,
      "matricula2025": 133,
      "alumnosDiscapacidad": 7,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140180200",
      "cue": "140180200",
      "codigoEmp": "EE0640511",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. CLODOMIRA VERA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Segunda",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General Paz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. Pres. Perón Centro 167",
      "latitud": -33.135567,
      "longitud": -64.348746,
      "matricula2024": 136,
      "matricula2025": 137,
      "alumnosDiscapacidad": 5,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "General Paz",
      "codvec": 24
    },
    {
      "id": "ESC-140214100",
      "cue": "140214100",
      "codigoEmp": "EE0640494",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. TTE. GRAL. JULIO A. ROCA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Santa Rosa",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Vélez Sarsfield 945",
      "latitud": -33.126749,
      "longitud": -64.338751,
      "matricula2024": 94,
      "matricula2025": 92,
      "alumnosDiscapacidad": 3,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 19
    },
    {
      "id": "ESC-140214400",
      "cue": "140214400",
      "codigoEmp": "EE0640462",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. GENERAL SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Santa Rosa",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Belgrano 986",
      "latitud": -33.125764,
      "longitud": -64.338178,
      "matricula2024": 32,
      "matricula2025": 36,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 19
    },
    {
      "id": "ESC-140299600",
      "cue": "140299600",
      "codigoEmp": "EE0330368",
      "codigoInspeccion": "040503  04Región 05DGES 03Inspección",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126653,
      "longitud": -64.350762,
      "matricula2024": 148,
      "matricula2025": 133,
      "alumnosDiscapacidad": 7,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140300200",
      "cue": "140300200",
      "codigoEmp": "EE0640481",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. GRAL. JOSE MARIA PAZ",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Mitre 1325",
      "latitud": -33.128811,
      "longitud": -64.354212,
      "matricula2024": 247,
      "matricula2025": 222,
      "alumnosDiscapacidad": 9,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140301500",
      "cue": "140301500",
      "codigoEmp": "EE0640483",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. JUSTO SOCRATES ANAYA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Fénix",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Alte. Brown 1245",
      "latitud": -33.14408,
      "longitud": -64.344026,
      "matricula2024": 146,
      "matricula2025": 174,
      "alumnosDiscapacidad": 1,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Fénix",
      "codvec": 2
    },
    {
      "id": "ESC-140371600",
      "cue": "140371600",
      "codigoEmp": "EE0640498",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J.DE INF. GRAL. I. H. FOTHERINGHAM",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana",
      "barrio": "S/D N.º 4 - Sector C Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. Amadeo Sabattini 3800",
      "latitud": -33.155734,
      "longitud": -64.359116,
      "matricula2024": 40,
      "matricula2025": 36,
      "alumnosDiscapacidad": 1,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Ferias",
      "codvec": 99
    },
    {
      "id": "ESC-140375500",
      "cue": "140375500",
      "codigoEmp": "EE0640464",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. MANUEL BELGRANO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Primera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Gral. Paz 1316",
      "latitud": -33.130008,
      "longitud": -64.349591,
      "matricula2024": 198,
      "matricula2025": 189,
      "alumnosDiscapacidad": 6,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140384700",
      "cue": "140384700",
      "codigoEmp": "EE0640024",
      "codigoInspeccion": "2001-01-04",
      "nombre": "jose",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Ejido Periurbano / Rural",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Estación Colonia del Carmen",
      "latitud": -33.097188,
      "longitud": -64.43079,
      "matricula2024": 3,
      "matricula2025": 3,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "No Aplica",
      "codvec": 0
    },
    {
      "id": "ESC-140476400",
      "cue": "140476400",
      "codigoEmp": "EE0640461",
      "codigoInspeccion": "4029",
      "nombre": "J. DE INF. JUAN BAUTISTA ALBERDI",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Nueva Argentina",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Tomás Anchorena & Güemes",
      "latitud": -33.136419,
      "longitud": -64.317482,
      "matricula2024": 93,
      "matricula2025": 92,
      "alumnosDiscapacidad": 2,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 26
    },
    {
      "id": "ESC-140476600",
      "cue": "140476600",
      "codigoEmp": "EE0640563",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. HEBE SAN MARTIN DE DUPRAT",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Segunda",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Jardín Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Araucanos & 17 de Octubre",
      "latitud": -33.089303,
      "longitud": -64.336149,
      "matricula2024": 91,
      "matricula2025": 85,
      "alumnosDiscapacidad": 1,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Jardín Norte",
      "codvec": 44
    },
    {
      "id": "ESC-140476700",
      "cue": "140476700",
      "codigoEmp": "EE0640565",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. MAESTRO INDIO FELIPE ROSAS",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Segunda",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Ingeniero Manuel Pizarro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Geronimo del Barco 3041",
      "latitud": -33.147843,
      "longitud": -64.36506,
      "matricula2024": 91,
      "matricula2025": 87,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ingeniero Manuel Pizarro",
      "codvec": 16
    },
    {
      "id": "ESC-140515900",
      "cue": "140515900",
      "codigoEmp": "EE0640577",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. MADRE TERESA DE CALCUTA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana",
      "barrio": "Bo. Ciudad Nueva",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Dr. Carlos Gaudard 3480",
      "latitud": -33.152266,
      "longitud": -64.371842,
      "matricula2024": 67,
      "matricula2025": 64,
      "alumnosDiscapacidad": 2,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ciudad Nueva",
      "codvec": 49
    },
    {
      "id": "ESC-140542400",
      "cue": "140542400",
      "codigoEmp": "EE0640583",
      "codigoInspeccion": "2001-01-04",
      "nombre": "10 DE JUNIO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "Tercera",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Florencio Sánchez 1780",
      "latitud": -33.104,
      "longitud": -64.3345,
      "matricula2024": 130,
      "matricula2025": 122,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Valacco",
      "codvec": 13
    },
    {
      "id": "ESC-140581800",
      "cue": "140581800",
      "codigoEmp": "EE0640030",
      "codigoInspeccion": "2001-01-04",
      "nombre": "JARDIN MATERNAL RAYITO DE SOL-UNRC",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Ejido Periurbano / Rural",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Sin domicilio registrado",
      "latitud": -33.110823,
      "longitud": -64.300871,
      "matricula2024": 104,
      "matricula2025": 104,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": "REL-140581800-RAYITO-20261014",
        "fecha": "2026-10-14",
        "tecnico": "Franco Campetelli",
        "estado": "CONSOLIDADO",
        "hashIntegridad": "sello-sha256-verificado-",
        "superficieM2": 0,
        "calefactoresFuncionando": 6,
        "calefactoresAveriados": 0,
        "respuestasCargadas": 42,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 97,
        "puntajeBase": 96.8,
        "clasificacion": "Óptimo",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 100,
          "aguaSaneamiento": 100,
          "estructuraCubiertas": 82,
          "climatizacion": 100,
          "alimentacionCocina": 100,
          "accesibilidad": 100,
          "entornoExterior": 100
        }
      },
      "historialIes": [
        {
          "periodo": "Relevamiento 2026-10-14",
          "fecha": "2026-10-14",
          "indiceAnterior": 97,
          "indiceNuevo": 97,
          "variacion": 0,
          "ies": 97,
          "ordenTrabajo": "REL-140581800-RAYITO-20261014",
          "jurisdiccion": "FoDeMEEP",
          "motivo": "Relevamiento técnico in situ (42 respuestas · 3 hallazgos)",
          "hito": "Relevamiento in situ (42 respuestas · 3 hallazgos)"
        }
      ],
      "incidencias": [
        {
          "id": "INC-ESC-140581800-P23",
          "tipoId": "ALBANILERIA",
          "tipoCodigo": "ALBANILERIA",
          "tipoNombre": "ALBAÑILERIA",
          "titulo": "Desgaste y piezas flojas en pisos",
          "descripcion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos) · Pregunta N° 23",
          "seccion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos)",
          "dimensionAfectada": "estructuraCubiertas",
          "criticidad": "BAJA",
          "severidad": "BAJA",
          "jurisdiccion": "FoDeMEEP",
          "cuadrilla": "Albañil / reparaciones de mampostería",
          "estado": "ABIERTA",
          "avance": 0,
          "avancePorcentaje": 0,
          "puntosRecuperables": 2,
          "impactoPuntosIes": 2,
          "esKillSwitch": false,
          "factorKillSwitch": 1,
          "factorPenalizacion": 1,
          "motivoKillSwitch": null,
          "costoEstimado": 0,
          "fechaDeteccion": "2026-10-14"
        },
        {
          "id": "INC-ESC-140581800-P25",
          "tipoId": "ALBANILERIA",
          "tipoCodigo": "ALBANILERIA",
          "tipoNombre": "ALBAÑILERIA",
          "titulo": "Riesgo de tropiezo o desnivel peligroso en solado",
          "descripcion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos) · Pregunta N° 25",
          "seccion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos)",
          "dimensionAfectada": "estructuraCubiertas",
          "criticidad": "ALTA",
          "severidad": "ALTA",
          "jurisdiccion": "FoDeMEEP",
          "cuadrilla": "Albañil / reparaciones de mampostería",
          "estado": "ABIERTA",
          "avance": 0,
          "avancePorcentaje": 0,
          "puntosRecuperables": 4,
          "impactoPuntosIes": 4,
          "esKillSwitch": false,
          "factorKillSwitch": 1,
          "factorPenalizacion": 1,
          "motivoKillSwitch": null,
          "costoEstimado": 0,
          "fechaDeteccion": "2026-10-14"
        },
        {
          "id": "INC-ESC-140581800-P36",
          "tipoId": "HERRERIA",
          "tipoCodigo": "HERRERIA",
          "tipoNombre": "HERRERIA",
          "titulo": "Ajuste de cerrajería y bisagras en aberturas",
          "descripcion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos) · Pregunta N° 36",
          "seccion": "Sec. 3 (Estructura Edilicia — Pisos, Paredes y Techos)",
          "dimensionAfectada": "estructuraCubiertas",
          "criticidad": "BAJA",
          "severidad": "BAJA",
          "jurisdiccion": "FoDeMEEP",
          "cuadrilla": "Herrero / soldadura y ajuste de cerramientos",
          "estado": "ABIERTA",
          "avance": 0,
          "avancePorcentaje": 0,
          "puntosRecuperables": 2,
          "impactoPuntosIes": 2,
          "esKillSwitch": false,
          "factorKillSwitch": 1,
          "factorPenalizacion": 1,
          "motivoKillSwitch": null,
          "costoEstimado": 0,
          "fechaDeteccion": "2026-10-14"
        }
      ],
      "barrioAnterior": "No Aplica",
      "codvec": 0,
      "director": "no",
      "telefono": "no",
      "email": "si"
    },
    {
      "id": "ESC-149000500",
      "cue": "149000500",
      "codigoEmp": "EE1490005",
      "codigoInspeccion": "2001-01-04",
      "nombre": "J. DE INF. ROSARIO VERA PEÑALOZA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Inicial",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "ADA",
      "latitud": -33.128234,
      "longitud": -64.348784,
      "matricula2024": 127,
      "matricula2025": 127,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140087900",
      "cue": "140087900",
      "codigoEmp": "EE0640417",
      "codigoInspeccion": "412151",
      "nombre": "ESCUELA 21 DE JULIO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 552",
      "latitud": -33.122797,
      "longitud": -64.342319,
      "matricula2024": 433,
      "matricula2025": 433,
      "alumnosDiscapacidad": 28,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 98
    },
    {
      "id": "ESC-140088600",
      "cue": "140088600",
      "codigoEmp": "EE0640434",
      "codigoInspeccion": "413123",
      "nombre": "ESCUELA TTE. GRAL. EDUARDO RACEDO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Trabajo y Prevision 1100",
      "latitud": -33.12234,
      "longitud": -64.369582,
      "matricula2024": 592,
      "matricula2025": 592,
      "alumnosDiscapacidad": 33,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Lomitas de Oro",
      "codvec": 10
    },
    {
      "id": "ESC-140088700",
      "cue": "140088700",
      "codigoEmp": "EE0640326",
      "codigoInspeccion": "413112",
      "nombre": "ESCUELA DOMINGO FAUSTINO SARMIENTO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Parque Bimaco",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Fray Mamerto Esquiú 1045",
      "latitud": -33.138727,
      "longitud": -64.368744,
      "matricula2024": 398,
      "matricula2025": 398,
      "alumnosDiscapacidad": 19,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Parque Bimaco",
      "codvec": 14
    },
    {
      "id": "ESC-140091600",
      "cue": "140091600",
      "codigoEmp": "EE0640515",
      "codigoInspeccion": "414112",
      "nombre": "ESCUELA MARIANO MORENO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Montevideo 528",
      "latitud": -33.136904,
      "longitud": -64.334257,
      "matricula2024": 319,
      "matricula2025": 276,
      "alumnosDiscapacidad": 10,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140113200",
      "cue": "140113200",
      "codigoEmp": "EE0640036",
      "codigoInspeccion": "412112",
      "nombre": "JOSE DE SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario, Inicial",
      "ambito": "Periférico",
      "categoria": "No categorizada",
      "turno": "Mañana, Tarde",
      "barrio": "Ejido Periurbano / Rural",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "RUTA 30 KM 69 COLONIA EL CARMEN",
      "latitud": -33.095088,
      "longitud": -64.43163,
      "matricula2024": 11,
      "matricula2025": 11,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "No Aplica",
      "codvec": 0
    },
    {
      "id": "ESC-140140100",
      "cue": "140140100",
      "codigoEmp": "EE0640516",
      "codigoInspeccion": "Cód. Nuevo 04020116    411132",
      "nombre": "ESCUELA BERNARDINO RIVADAVIA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Las Quintas (El Bañado)",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Wenceslao Tejerina Nte. 1171",
      "latitud": -33.095511,
      "longitud": -64.366129,
      "matricula2024": 303,
      "matricula2025": 303,
      "alumnosDiscapacidad": 13,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Quintas",
      "codvec": 99
    },
    {
      "id": "ESC-140153500",
      "cue": "140153500",
      "codigoEmp": "EE0640337",
      "codigoInspeccion": "Cód. Nuevo 04020112      411112",
      "nombre": "ESCUELA REPUBLICA DEL URUGUAY",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "San Luis 342",
      "latitud": -33.112669,
      "longitud": -64.337529,
      "matricula2024": 333,
      "matricula2025": 333,
      "alumnosDiscapacidad": 10,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140154100",
      "cue": "140154100",
      "codigoEmp": "EE0640368",
      "codigoInspeccion": "413125",
      "nombre": "ESCUELA ALMIRANTE BROWN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Río Quinto 660",
      "latitud": -33.10876,
      "longitud": -64.353316,
      "matricula2024": 256,
      "matricula2025": 256,
      "alumnosDiscapacidad": 11,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "José de Calasanz",
      "codvec": 3
    },
    {
      "id": "ESC-140154200",
      "cue": "140154200",
      "codigoEmp": "EE0640439",
      "codigoInspeccion": "Cód. Nuevo 04020115      411131",
      "nombre": "ESCUELA DOCTOR ADOLFO ALSINA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General San Martín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Av. Gral. José Garibaldi 740",
      "latitud": -33.097282,
      "longitud": -64.343949,
      "matricula2024": 514,
      "matricula2025": 514,
      "alumnosDiscapacidad": 23,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 43
    },
    {
      "id": "ESC-140176500",
      "cue": "140176500",
      "codigoEmp": "EE0640324",
      "codigoInspeccion": "412111",
      "nombre": "ESCUELA BARTOLOME MITRE",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Lavalle 1452",
      "latitud": -33.132193,
      "longitud": -64.345356,
      "matricula2024": 324,
      "matricula2025": 324,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140177700",
      "cue": "140177700",
      "codigoEmp": "EE0640433",
      "codigoInspeccion": "412121",
      "nombre": "ESCUELA PROVINCIA DE SANTA CRUZ",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Jardín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Santa Fe & Uruguay",
      "latitud": -33.103054,
      "longitud": -64.33008,
      "matricula2024": 649,
      "matricula2025": 649,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 39
    },
    {
      "id": "ESC-140178000",
      "cue": "140178000",
      "codigoEmp": "EE0640325",
      "codigoInspeccion": "413111",
      "nombre": "ESCUELA VELEZ SARSFIELD",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Mendoza 1502",
      "latitud": -33.13053,
      "longitud": -64.355928,
      "matricula2024": 503,
      "matricula2025": 503,
      "alumnosDiscapacidad": 24,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140194100",
      "cue": "140194100",
      "codigoEmp": "EE0640403",
      "codigoInspeccion": "412141",
      "nombre": "ESCUELA TTE. GRAL. JULIO ARGENTINO ROCA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Santa Rosa",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Juan José Paso 790",
      "latitud": -33.126371,
      "longitud": -64.338237,
      "matricula2024": 246,
      "matricula2025": 246,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 19
    },
    {
      "id": "ESC-140203800",
      "cue": "140203800",
      "codigoEmp": "EE0640329",
      "codigoInspeccion": "Cód. Nuevo 04020111     411111",
      "nombre": "ESCUELA MANUEL BELGRANO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Sobremonte 1333",
      "latitud": -33.129863,
      "longitud": -64.3503,
      "matricula2024": 656,
      "matricula2025": 656,
      "alumnosDiscapacidad": 67,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140213600",
      "cue": "140213600",
      "codigoEmp": "EE0640328",
      "codigoInspeccion": "413121",
      "nombre": "ESCUELA GENERAL PAZ",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Mitre 850",
      "latitud": -33.123787,
      "longitud": -64.353023,
      "matricula2024": 642,
      "matricula2025": 642,
      "alumnosDiscapacidad": 44,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140213800",
      "cue": "140213800",
      "codigoEmp": "EE0640331",
      "codigoInspeccion": "COD. NUEVO 040204-12 (414121)",
      "nombre": "ESCUELA GENERAL SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3° P.C.",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Santa Rosa",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Belgrano 986",
      "latitud": -33.125746,
      "longitud": -64.338194,
      "matricula2024": 102,
      "matricula2025": 97,
      "alumnosDiscapacidad": 5,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 19
    },
    {
      "id": "ESC-140299600",
      "cue": "140299600",
      "codigoEmp": "EE0330371",
      "codigoInspeccion": "2001-01-04",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126608,
      "longitud": -64.350736,
      "matricula2024": 465,
      "matricula2025": 465,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140300400",
      "cue": "140300400",
      "codigoEmp": "EE0640517",
      "codigoInspeccion": "Cód. Nuevo 04020114       411122",
      "nombre": "ESCUELA LEOPOLDO LUGONES",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Las Delicias",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Fray Quirico Porreca 1310",
      "latitud": -33.120724,
      "longitud": -64.323199,
      "matricula2024": 354,
      "matricula2025": 354,
      "alumnosDiscapacidad": 14,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Delicias",
      "codvec": 37
    },
    {
      "id": "ESC-140300700",
      "cue": "140300700",
      "codigoEmp": "EE0640435",
      "codigoInspeccion": "Cód. Nuevo 04020113      411121",
      "nombre": "ESCUELA GOBERNADOR DR. AMADEO SABATTINI",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General Paz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Mansilla 320",
      "latitud": -33.134794,
      "longitud": -64.348413,
      "matricula2024": 397,
      "matricula2025": 397,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "General Paz",
      "codvec": 24
    },
    {
      "id": "ESC-140301200",
      "cue": "140301200",
      "codigoEmp": "EE0640357",
      "codigoInspeccion": "Cód. Nuevo 04020119     414122",
      "nombre": "ESCUELA GENERAL JUSTO SOCRATES ANAYA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Fénix",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Azopardo 1270",
      "latitud": -33.144939,
      "longitud": -64.342906,
      "matricula2024": 479,
      "matricula2025": 479,
      "alumnosDiscapacidad": 15,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Fénix",
      "codvec": 2
    },
    {
      "id": "ESC-140301800",
      "cue": "140301800",
      "codigoEmp": "EE0640330",
      "codigoInspeccion": "Cód. Nuevo 04020219 (414111)",
      "nombre": "ESCUELA NICOLAS AVELLANEDA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Vicente López y Planes 538",
      "latitud": -33.134345,
      "longitud": -64.333926,
      "matricula2024": 449,
      "matricula2025": 449,
      "alumnosDiscapacidad": 21,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140301900",
      "cue": "140301900",
      "codigoEmp": "EE0640456",
      "codigoInspeccion": "Cód. Nuevo 04020120      414131",
      "nombre": "ESCUELA ARZOBISPO ANTONIO ESPINOSA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General Güemes",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Olegario Andrade 1020",
      "latitud": -33.136971,
      "longitud": -64.325494,
      "matricula2024": 398,
      "matricula2025": 398,
      "alumnosDiscapacidad": 12,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 6
    },
    {
      "id": "ESC-140324200",
      "cue": "140324200",
      "codigoEmp": "EE0640444",
      "codigoInspeccion": "412136",
      "nombre": "ESCUELA MANUELA GUILLERMINA MALDONADO DE PARTELLI",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3°PU",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Parque Alihuén",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Sin domicilio registrado",
      "latitud": -33.0954,
      "longitud": -64.3412,
      "matricula2024": 44,
      "matricula2025": 44,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "No Aplica",
      "codvec": 53
    },
    {
      "id": "ESC-140348100",
      "cue": "140348100",
      "codigoEmp": "EE0640327",
      "codigoInspeccion": "412131",
      "nombre": "ESCUELA FLORENTINO AMEGHINO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Buena Vista",
      "macrozona": "Sector C (Centro)",
      "domicilio": "9 de Julio 314",
      "latitud": -33.118478,
      "longitud": -64.35348,
      "matricula2024": 339,
      "matricula2025": 339,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 12
    },
    {
      "id": "ESC-140371700",
      "cue": "140371700",
      "codigoEmp": "EE0640440",
      "codigoInspeccion": "413113",
      "nombre": "ESCUELA GRAL. IGNACIO HAMILTON FOTHERINGHAM",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana",
      "barrio": "Bo. Las Ferias",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Av. Amadeo Sabattini 3800",
      "latitud": -33.155802,
      "longitud": -64.359051,
      "matricula2024": 130,
      "matricula2025": 130,
      "alumnosDiscapacidad": 3,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Ferias",
      "codvec": 30
    },
    {
      "id": "ESC-140384700",
      "cue": "140384700",
      "codigoEmp": "EE0640421",
      "codigoInspeccion": "Cód. Nuevo 04020117   411133",
      "nombre": "GENERAL JOSE DE SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3°PU",
      "turno": "Mañana",
      "barrio": "Ejido Periurbano / Rural",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "Ruta Nacional 36 km 614",
      "latitud": -33.0621,
      "longitud": -64.3185,
      "matricula2024": 7,
      "matricula2025": 7,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "No Aplica",
      "codvec": 0
    },
    {
      "id": "ESC-140468400",
      "cue": "140468400",
      "codigoEmp": "EE0640364",
      "codigoInspeccion": "412126",
      "nombre": "10 DE JUNIO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1ª",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Valacco",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "El Salvador 850",
      "latitud": -33.104174,
      "longitud": -64.313046,
      "matricula2024": 272,
      "matricula2025": 272,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Valacco",
      "codvec": 40
    },
    {
      "id": "ESC-140475200",
      "cue": "140475200",
      "codigoEmp": "EE0640560",
      "codigoInspeccion": "413114",
      "nombre": "ESCUELA MAESTRO INDIO FELIPE ROSAS",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Ingeniero Manuel Pizarro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Geronimo del Barco 3075",
      "latitud": -33.148254,
      "longitud": -64.365267,
      "matricula2024": 248,
      "matricula2025": 248,
      "alumnosDiscapacidad": 13,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ingeniero Manuel Pizarro",
      "codvec": 16
    },
    {
      "id": "ESC-140480400",
      "cue": "140480400",
      "codigoEmp": "EE0640564",
      "codigoInspeccion": "Cód. Nuevo 04020118    411134",
      "nombre": "ESCUELA HEBE SAN MARTIN DE DUPRAT(EX-S/N DE BOJARDIN NORTE)",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "S/D N.º 2 - Sector B Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Grito de Alcorta & Araucanos",
      "latitud": -33.088216,
      "longitud": -64.336161,
      "matricula2024": 227,
      "matricula2025": 227,
      "alumnosDiscapacidad": 14,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Jardín Norte",
      "codvec": 99
    },
    {
      "id": "ESC-140480700",
      "cue": "140480700",
      "codigoEmp": "EE0640562",
      "codigoInspeccion": "040204-13 (4141-33)",
      "nombre": "ESCUELA MARIA EVA DUARTE",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Nueva Argentina",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Tomás Anchorena 100-198",
      "latitud": -33.135509,
      "longitud": -64.317492,
      "matricula2024": 275,
      "matricula2025": 250,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 26
    },
    {
      "id": "ESC-140516000",
      "cue": "140516000",
      "codigoEmp": "EE0640578",
      "codigoInspeccion": "413115",
      "nombre": "ESCUELA MADRE TERESA DE CALCUTA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana",
      "barrio": "Bo. Ciudad Nueva",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Dr. Carlos Gaudard 3480",
      "latitud": -33.15333,
      "longitud": -64.372029,
      "matricula2024": 145,
      "matricula2025": 145,
      "alumnosDiscapacidad": 10,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ciudad Nueva",
      "codvec": 49
    },
    {
      "id": "ESC-140299600",
      "cue": "140299600",
      "codigoEmp": "EE0330369",
      "codigoInspeccion": "040503 04Región 05DGES 03Inspección",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126653,
      "longitud": -64.350762,
      "matricula2024": 468,
      "matricula2025": 460,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140178300",
      "cue": "140178300",
      "codigoEmp": "EE0310553",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 128 DR. MANUEL BELGRANO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Sobremonte 1357",
      "latitud": -33.130022,
      "longitud": -64.34988,
      "matricula2024": 587,
      "matricula2025": 587,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140299500",
      "cue": "140299500",
      "codigoEmp": "EE0320211",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 283 FRAY MAMERTO ESQUIU",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 463",
      "latitud": -33.122305,
      "longitud": -64.342912,
      "matricula2024": 428,
      "matricula2025": 428,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140299502",
      "cue": "140299502",
      "codigoEmp": "EE0310437",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. N° 444",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3°",
      "turno": "Tarde",
      "barrio": "Bo. Ciudad Nueva",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Dr. Carlos Gaudard 3480",
      "latitud": -33.153357,
      "longitud": -64.372051,
      "matricula2024": 133,
      "matricula2025": 133,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ciudad Nueva",
      "codvec": 49
    },
    {
      "id": "ESC-140299600",
      "cue": "140299600",
      "codigoEmp": "EE0330370",
      "codigoInspeccion": "(04) 05-03  04Rïo Cuarto 05DGES 03Inspección",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126653,
      "longitud": -64.350736,
      "matricula2024": 979,
      "matricula2025": 1018,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140299700",
      "cue": "140299700",
      "codigoEmp": "EE0310512",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. 95 MARIQUITA SANCHEZ DE THOMPSON",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Manco Cápac 50",
      "latitud": -33.10291,
      "longitud": -64.335155,
      "matricula2024": 933,
      "matricula2025": 933,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140299900",
      "cue": "140299900",
      "codigoEmp": "EE0310719",
      "codigoInspeccion": "REGION 4 ZONA 1 RIO CUARTO / JUAREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ.Υ Τ. № 203 DR. JUAN BAUTISTA DICHIARA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Bolívar 335",
      "latitud": -33.127245,
      "longitud": -64.346004,
      "matricula2024": 718,
      "matricula2025": 672,
      "alumnosDiscapacidad": 33,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140301300",
      "cue": "140301300",
      "codigoEmp": "EE0310433",
      "codigoInspeccion": "2001-01-04",
      "nombre": "Ι.Ρ.Ε.Τ. № 79 ING. RENATO DE MARCO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Once de Noviembre",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Leandro N. Alem 1735",
      "latitud": -33.151452,
      "longitud": -64.341751,
      "matricula2024": 400,
      "matricula2025": 400,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 36
    },
    {
      "id": "ESC-140391000",
      "cue": "140391000",
      "codigoEmp": "EE0320210",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 281 DR. CARLOS A. LUCERO KELLY",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 463",
      "latitud": -33.122341,
      "longitud": -64.342997,
      "matricula2024": 774,
      "matricula2025": 774,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140400300",
      "cue": "140400300",
      "codigoEmp": "EE0640072",
      "codigoInspeccion": "2001-01-04",
      "nombre": "Ι.Ρ.Ε.Τ. 259 AMBROSIO OLMOS",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 527",
      "latitud": -33.122788,
      "longitud": -64.342536,
      "matricula2024": 934,
      "matricula2025": 934,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 98
    },
    {
      "id": "ESC-140447400",
      "cue": "140447400",
      "codigoEmp": "EE0310926",
      "codigoInspeccion": "2001-01-04",
      "nombre": "Ι.Ρ.Ε.Τ. № 26 JUAN FILLOY",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Belisario Roldán 535",
      "latitud": -33.136598,
      "longitud": -64.335248,
      "matricula2024": 508,
      "matricula2025": 508,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140447500",
      "cue": "140447500",
      "codigoEmp": "EE0310927",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. 27. DR. RENE FAVALORO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. San Antonio de Padua",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "11 de Noviembre 1150",
      "latitud": -33.105864,
      "longitud": -64.355964,
      "matricula2024": 335,
      "matricula2025": 335,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "San Antonio de Padua",
      "codvec": 20
    },
    {
      "id": "ESC-140447600",
      "cue": "140447600",
      "codigoEmp": "EE0310928",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 28 VILLA DE LA CONCEPCION DEL RIO CUARTO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Jardín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Venezuela 950",
      "latitud": -33.108368,
      "longitud": -64.318372,
      "matricula2024": 384,
      "matricula2025": 384,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 39
    },
    {
      "id": "ESC-140447700",
      "cue": "140447700",
      "codigoEmp": "EE0310929",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 29 FELIPE GALIZIA",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Las Quintas (El Bañado)",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "CERVANTES S/N",
      "latitud": -33.093275,
      "longitud": -64.367122,
      "matricula2024": 320,
      "matricula2025": 320,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Quintas",
      "codvec": 99
    },
    {
      "id": "ESC-140475700",
      "cue": "140475700",
      "codigoEmp": "EE0640077",
      "codigoInspeccion": "2001-01-04",
      "nombre": "Ι.Ρ.Ε.Τ. Ν° 314. LIBERTADOR GENERAL DON JOSE DE SAN MARTIN",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Mañana",
      "barrio": "Bo. Nueva Argentina",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Güemes 1600",
      "latitud": -33.136054,
      "longitud": -64.317055,
      "matricula2024": 273,
      "matricula2025": 273,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 26
    },
    {
      "id": "ESC-140504700",
      "cue": "140504700",
      "codigoEmp": "EE0310948",
      "codigoInspeccion": "I.R. 4 RÍO CUARTO / JUÁREZ CELMAN",
      "nombre": "Ι.Ρ.Ε.Μ. № 330 EDGARDO ROBERTO PRAMPARO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana, Tarde",
      "barrio": "S/D N.º 4 - Sector C Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. Amadeo Sabattini 4000",
      "latitud": -33.160016,
      "longitud": -64.359342,
      "matricula2024": 227,
      "matricula2025": 227,
      "alumnosDiscapacidad": 3,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Ferias",
      "codvec": 99
    },
    {
      "id": "ESC-140538000",
      "cue": "140538000",
      "codigoEmp": "EE0640079",
      "codigoInspeccion": "2001-01-04",
      "nombre": "Ι.Ρ.Ε.Τ. 362 JUAN ANDRES POLITANO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1",
      "turno": "No especificado",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Pcia de la Rioja 1620",
      "latitud": -33.123194,
      "longitud": -64.369216,
      "matricula2024": 451,
      "matricula2025": 451,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro / No especificado",
      "codvec": 10
    },
    {
      "id": "ESC-140562400",
      "cue": "140562400",
      "codigoEmp": "EE0311462",
      "codigoInspeccion": "REGION 4 RIO CUARTO",
      "nombre": "ESCUELA EXPERIMENTAL CON ENFASIS EN TECNOLOGIAS DE LA INFORMACION Y LA COMUNICACION",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. General San Martín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Roberto Payró 970",
      "latitud": -33.096288,
      "longitud": -64.343615,
      "matricula2024": 148,
      "matricula2025": 150,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 43
    },
    {
      "id": "ESC-140566600",
      "cue": "140566600",
      "codigoEmp": "EE0311467",
      "codigoInspeccion": "R4 Río Cuarto",
      "nombre": "ESCUELA EXPERIMENTAL CON ENFASIS EN TECNOLOGIAS DE LA INFORMACION Y LA COMUNICACION",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "Tarde, Mañana",
      "barrio": "Bo. Industrial",
      "macrozona": "Sector D (Distrito Periférico)",
      "domicilio": "General Enrique Mosconi 240",
      "latitud": -33.15056,
      "longitud": -64.351977,
      "matricula2024": 147,
      "matricula2025": 147,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Industrial",
      "codvec": 23
    },
    {
      "id": "ESC-140577300",
      "cue": "140577300",
      "codigoEmp": "EE0311500",
      "codigoInspeccion": "REGION 4 ZONA 1 RIO CUARTO / JUAREZ CELMAN",
      "nombre": "ESCUELA SECUNDARIA DE FORMACION PROFESIONAL Nvas. Tecnologías aplicadas al Agro",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Mañana",
      "barrio": "S/D N.º 5 - Sector B Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Frua Teresa 1526",
      "latitud": -33.1141,
      "longitud": -64.314042,
      "matricula2024": 74,
      "matricula2025": 97,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 99
    },
    {
      "id": "ESC-140177400",
      "cue": "140177400",
      "codigoEmp": "EE0310303                                                              EE0310339",
      "codigoInspeccion": "040503 DGES INSPIII",
      "nombre": "CONSERVATORIO SUPERIOR DE MUSICA JULIAN AGUIRRE",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior, Secundario",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Córdoba 960",
      "latitud": -33.102976,
      "longitud": -64.335874,
      "matricula2024": 326,
      "matricula2025": 402,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140194000",
      "cue": "140194000",
      "codigoEmp": "EE0310308     EE0310330",
      "codigoInspeccion": "040503 DGES INSPIII",
      "nombre": "ESCUELA SUPERIOR DE BELLAS ARTES LIBERO PIERINI",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior, Secundario",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. España 171",
      "latitud": -33.117053,
      "longitud": -64.347851,
      "matricula2024": 473,
      "matricula2025": 491,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 3
    },
    {
      "id": "ESC-140299600",
      "cue": "140299600",
      "codigoEmp": "EE0330371",
      "codigoInspeccion": "040503 DGES INSPIII",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126617,
      "longitud": -64.350714,
      "matricula2024": 262,
      "matricula2025": 1711,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140299602",
      "cue": "140299602",
      "codigoEmp": "EE0640086",
      "codigoInspeccion": "040503 DGES INSPIII",
      "nombre": "ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA ANEXO EXTENSION AULICA RIO CUARTO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Bolívar 335",
      "latitud": -33.127302,
      "longitud": -64.34606,
      "matricula2024": 222,
      "matricula2025": 222,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140299800",
      "cue": "140299800",
      "codigoEmp": "EE0310106",
      "codigoInspeccion": "040503 DGES INSPIII",
      "nombre": "INST. SUP. RAMON MENENDEZ PIDAL",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Av. Gral. José Garibaldi 50",
      "latitud": -33.103511,
      "longitud": -64.335846,
      "matricula2024": 291,
      "matricula2025": 990,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140513104",
      "cue": "140513104",
      "codigoEmp": "EE0640088",
      "codigoInspeccion": "2001-01-04",
      "nombre": "ESCUELA DE SUBOFICIALES Y AGENTES GRAL MANUEL BELGRANO ANEXO RIO CUARTO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Superior",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Bo. Doctor Carlos Mayer",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "General Enrique Mosconi 486",
      "latitud": -33.151529,
      "longitud": -64.348219,
      "matricula2024": 115,
      "matricula2025": 115,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 29
    },
    {
      "id": "ESC-140091800",
      "cue": "140091800",
      "codigoEmp": "EE0111274",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA PAULA ALBARRACIN DE SARMIENTO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Belisario Roldán 535",
      "latitud": -33.136625,
      "longitud": -64.33527,
      "matricula2024": 17,
      "matricula2025": 17,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140091801",
      "cue": "140091801",
      "codigoEmp": "EE0111274",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA PAULA ALBARRACIN DE SARMIENTO - ANEXO MALABIA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Barrios Unidos",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "José Severo Malavia & Adelia María",
      "latitud": -33.145905,
      "longitud": -64.327646,
      "matricula2024": 12,
      "matricula2025": 12,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Pueblo Alberdi",
      "codvec": 48
    },
    {
      "id": "ESC-140091802",
      "cue": "140091802",
      "codigoEmp": "EE0111274",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA PAULA ALBARRACIN DE SARMIENTO ANEXO EXTENSION AULICA LAS DELICIAS",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Nueva Argentina",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Fray Quirico Porreca 1310",
      "latitud": -33.135153,
      "longitud": -64.317068,
      "matricula2024": 15,
      "matricula2025": 15,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Delicias",
      "codvec": 26
    },
    {
      "id": "ESC-140214200",
      "cue": "140214200",
      "codigoEmp": "EE0111232",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA DR.SANTIAGO ARIAS DE CABRERA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 552",
      "latitud": -33.12286,
      "longitud": -64.342238,
      "matricula2024": 25,
      "matricula2025": 25,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140214201",
      "cue": "140214201",
      "codigoEmp": "EE0111232",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA DR.SANTIAGO ARIAS DE CABRERA - ANEXO ISLAS MALVINAS",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Ciudad Nueva",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Dr. Carlos Gaudard 3480",
      "latitud": -33.15341,
      "longitud": -64.372029,
      "matricula2024": 20,
      "matricula2025": 20,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ciudad Nueva",
      "codvec": 49
    },
    {
      "id": "ESC-140214202",
      "cue": "140214202",
      "codigoEmp": "EE0111232",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA DR.SANTIAGO ARIAS DE CABRERA ANEXO N°1",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Mañana",
      "barrio": "Bo. Ingeniero Manuel Pizarro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. Amadeo Sabattini 2652",
      "latitud": -33.144341,
      "longitud": -64.356263,
      "matricula2024": 53,
      "matricula2025": 53,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ingeniero Manuel Pizarro",
      "codvec": 16
    },
    {
      "id": "ESC-140091807",
      "cue": "140091807",
      "codigoEmp": "EE0111274",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA PAULA ALBARRACIN DE SARMIENTO EXTENSION AULICA B BANDA NORTE",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Manco Cápac 50",
      "latitud": -33.102842,
      "longitud": -64.335027,
      "matricula2024": 16,
      "matricula2025": 16,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140214205",
      "cue": "140214205",
      "codigoEmp": "EE0111232",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA DR.SANTIAGO ARIAS DE CABRERA ANEXO EXT. AULICA Bº LOMITAS DE ORO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Antonio F. Lucero 740",
      "latitud": -33.118354,
      "longitud": -64.370727,
      "matricula2024": 24,
      "matricula2025": 24,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Lomitas de Oro",
      "codvec": 10
    },
    {
      "id": "ESC-140214208",
      "cue": "140214208",
      "codigoEmp": "EE0111232",
      "codigoInspeccion": "40801",
      "nombre": "ESCUELA NOCTURNA DR.SANTIAGO ARIAS DE CABRERA ANEXO EXT AUL B° ROQUE SAENZ PEÑA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Primario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Roque Sáenz Peña",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Sadi Carnot 1515",
      "latitud": -33.127403,
      "longitud": -64.368876,
      "matricula2024": 22,
      "matricula2025": 22,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Roque Sáenz Peña",
      "codvec": 1
    },
    {
      "id": "ESC-140140900",
      "cue": "140140900",
      "codigoEmp": "EE0110352",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Sobremonte 1357",
      "latitud": -33.129948,
      "longitud": -64.34991,
      "matricula2024": 108,
      "matricula2025": 108,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140140904",
      "cue": "140140904",
      "codigoEmp": "EE0115035",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. Ν° 73 DR. ARTURO JAURETCHE ANEXO N° 01",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Tarde",
      "barrio": "Bo. Ingeniero Manuel Pizarro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. Amadeo Sabattini 2652",
      "latitud": -33.144315,
      "longitud": -64.356252,
      "matricula2024": 141,
      "matricula2025": 141,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "General Paz",
      "codvec": 16
    },
    {
      "id": "ESC-140140906",
      "cue": "140140906",
      "codigoEmp": "EE0117044",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE ANEXO SEDE EDUCACION A DISTANCIA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Sobremonte 1353",
      "latitud": -33.129889,
      "longitud": -64.350218,
      "matricula2024": 63,
      "matricula2025": 63,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140140911",
      "cue": "140140911",
      "codigoEmp": "EE0115153",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE - ANEXO CIUDAD NUEVA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Ciudad Nueva",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Dr. Carlos Gaudard 3480",
      "latitud": -33.153384,
      "longitud": -64.372018,
      "matricula2024": 58,
      "matricula2025": 58,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ciudad Nueva",
      "codvec": 49
    },
    {
      "id": "ESC-140140912",
      "cue": "140140912",
      "codigoEmp": "EE0115182",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE ANEXO BARRIO PIZARRO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Ingeniero Manuel Pizarro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Geronimo del Barco 3075",
      "latitud": -33.148263,
      "longitud": -64.365192,
      "matricula2024": 59,
      "matricula2025": 59,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Ingeniero Manuel Pizarro",
      "codvec": 16
    },
    {
      "id": "ESC-140140914",
      "cue": "140140914",
      "codigoEmp": "EE0117223",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE ANEXO SEDE LIBERO PIERINI",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Tarde",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. España 171",
      "latitud": -33.117053,
      "longitud": -64.347893,
      "matricula2024": 54,
      "matricula2025": 54,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 3
    },
    {
      "id": "ESC-140140915",
      "cue": "140140915",
      "codigoEmp": "EE0115191",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 73 DR. ARTURO JAURETCHE ANEXO Bº SAN MARTIN",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Tarde",
      "barrio": "Bo. General San Martín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Ruy Díaz de Guzmán 499",
      "latitud": -33.099875,
      "longitud": -64.350543,
      "matricula2024": 32,
      "matricula2025": 32,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "San Martín",
      "codvec": 43
    },
    {
      "id": "ESC-140176301",
      "cue": "140176301",
      "codigoEmp": "EE0117040",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. 243 ΑΝEXO SEDE AGEC",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Cabrera 331",
      "latitud": -33.119413,
      "longitud": -64.350241,
      "matricula2024": 81,
      "matricula2025": 81,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140176400",
      "cue": "140176400",
      "codigoEmp": "EE0110235",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 24",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Baigorria 463",
      "latitud": -33.121902,
      "longitud": -64.343004,
      "matricula2024": 49,
      "matricula2025": 49,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140176402",
      "cue": "140176402",
      "codigoEmp": "EE0117198",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. № 24 SEDE MUNICIPALIDAD",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Mañana",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Belgrano 200",
      "latitud": -33.123079,
      "longitud": -64.346662,
      "matricula2024": 106,
      "matricula2025": 106,
      "alumnosDiscapacidad": 2,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140176406",
      "cue": "140176406",
      "codigoEmp": "EE0115118",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. Ν° 24 - ΑΝΕXO BARRIO ALBERDI",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Pueblo Alberdi",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Belisario Roldán 535",
      "latitud": -33.136643,
      "longitud": -64.335248,
      "matricula2024": 46,
      "matricula2025": 46,
      "alumnosDiscapacidad": 1,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 5
    },
    {
      "id": "ESC-140176407",
      "cue": "140176407",
      "codigoEmp": "EE0115120",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. Ν° 24 - ΑΝΕΧΟ Β° ROQUE SAENZ PEÑA",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Pcia de la Rioja 1600",
      "latitud": -33.12341,
      "longitud": -64.368915,
      "matricula2024": 51,
      "matricula2025": 51,
      "alumnosDiscapacidad": 4,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Roque Sáenz Peña",
      "codvec": 10
    },
    {
      "id": "ESC-140512500",
      "cue": "140512500",
      "codigoEmp": "EE0115101",
      "codigoInspeccion": "40801",
      "nombre": "CEIJA N° 12 REMEDIOS ESCALADA DE SAN MARTIN",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Constitución 1040",
      "latitud": -33.126626,
      "longitud": -64.350725,
      "matricula2024": 211,
      "matricula2025": 211,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 98
    },
    {
      "id": "ESC-140512502",
      "cue": "140512502",
      "codigoEmp": "EE0115155",
      "codigoInspeccion": "40801",
      "nombre": "CEIJA N° 12 REMEDIOS ESCALADA DE SAN MARTIN ANEXO Bº ALBERDI",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Nueva Argentina",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "Entre Ríos 1600",
      "latitud": -33.135307,
      "longitud": -64.317008,
      "matricula2024": 60,
      "matricula2025": 60,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Alberdi Norte",
      "codvec": 26
    },
    {
      "id": "ESC-140512503",
      "cue": "140512503",
      "codigoEmp": "EE0115134",
      "codigoInspeccion": "40801",
      "nombre": "CEIJA N° 12 REMEDIOS ESCALADA DE SAN MARTIN ANEXO BERTA PERASSI",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Tarde",
      "barrio": "Bo. Barrios Unidos",
      "macrozona": "Sector A (Alberdi)",
      "domicilio": "José Severo Malavia & Adelia María",
      "latitud": -33.14595,
      "longitud": -64.327614,
      "matricula2024": 58,
      "matricula2025": 58,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Pueblo Alberdi",
      "codvec": 48
    },
    {
      "id": "ESC-140512504",
      "cue": "140512504",
      "codigoEmp": "EE0115171",
      "codigoInspeccion": "40801",
      "nombre": "CEIJA N° 12 REMEDIOS ESCALADA DE SAN MARTIN ANEXO LAS DELICIAS",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Las Delicias",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Fray Quirico Porreca 1310",
      "latitud": -33.120807,
      "longitud": -64.323229,
      "matricula2024": 52,
      "matricula2025": 52,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Delicias",
      "codvec": 37
    },
    {
      "id": "ESC-140512501",
      "cue": "140512501",
      "codigoEmp": "EE0115116",
      "codigoInspeccion": "40801",
      "nombre": "CEIJA N° 12 REMEDIOS ESCALADA DE SAN MARTIN ANEXO LAS HIGUERAS",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Centro",
      "macrozona": "Sector C (Centro)",
      "domicilio": "ESPAÑA 36",
      "latitud": -33.1245,
      "longitud": -64.3482,
      "matricula2024": 0,
      "matricula2025": 0,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro / No especificado",
      "codvec": 98
    },
    {
      "id": "ESC-140545600",
      "cue": "140545600",
      "codigoEmp": "EE0115121",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. ΒANDA NORTE",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Manco Cápac 50",
      "latitud": -33.102865,
      "longitud": -64.335209,
      "matricula2024": 97,
      "matricula2025": 97,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140545602",
      "cue": "140545602",
      "codigoEmp": "EE0115119",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. BANDA NORTE ANEXO BARRIO IPV",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Noche",
      "barrio": "Bo. Cabrales (José Antonio y José Mario Cabral)",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "GRITO DE ALCORTA 560",
      "latitud": -33.093583,
      "longitud": -64.337083,
      "matricula2024": 31,
      "matricula2025": 31,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Jardín Norte",
      "codvec": 31
    },
    {
      "id": "ESC-140545603",
      "cue": "140545603",
      "codigoEmp": "EE0117290",
      "codigoInspeccion": "40801",
      "nombre": "C.Ε.Ν.Μ.Α. ΒANDA NORTE SEDE LAS FERIAS",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "3",
      "turno": "Tarde",
      "barrio": "Bo. Jardín",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "GENERAL ENRIQUE MOSCONI 286",
      "latitud": -33.1088,
      "longitud": -64.3215,
      "matricula2024": 0,
      "matricula2025": 0,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Las Ferias",
      "codvec": 39
    },
    {
      "id": "ESC-140462700",
      "cue": "140462700",
      "codigoEmp": "EE0640118",
      "codigoInspeccion": "2001-01-04",
      "nombre": "CEDER RIO CUARTO",
      "modalidad": "Adultos",
      "esModalidadComun": false,
      "nivel": "F. Profesional",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Bo. Santa Rosa",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Belgrano 1135",
      "latitud": -33.126041,
      "longitud": -64.335775,
      "matricula2024": 151,
      "matricula2025": 151,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Santa Rosa",
      "codvec": 19
    },
    {
      "id": "ESC-140178100",
      "cue": "140178100",
      "codigoEmp": "EE0310229",
      "codigoInspeccion": "(04-10) - 07-01",
      "nombre": "ESC. ESP. VICENTA CASTRO CAMBON",
      "modalidad": "Especial",
      "esModalidadComun": false,
      "nivel": "Todos",
      "ambito": "Urbano",
      "categoria": "3°",
      "turno": "Mañana, Tarde, Noche",
      "barrio": "Bo. Roque Sáenz Peña",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Trejo y Sanabria 1270",
      "latitud": -33.124848,
      "longitud": -64.374274,
      "matricula2024": 14,
      "matricula2025": 20,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Roque Sáenz Peña",
      "codvec": 1
    },
    {
      "id": "ESC-140193700",
      "cue": "140193700",
      "codigoEmp": "EE0310212",
      "codigoInspeccion": "(04-10) - 07-01",
      "nombre": "ESC. ESP. LUCIERNAGAS",
      "modalidad": "Especial",
      "esModalidadComun": false,
      "nivel": "Todos",
      "ambito": "Urbano",
      "categoria": "2°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Roque Sáenz Peña",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Pje. Abilene 1151",
      "latitud": -33.127808,
      "longitud": -64.363342,
      "matricula2024": 26,
      "matricula2025": 24,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Roque Sáenz Peña",
      "codvec": 1
    },
    {
      "id": "ESC-140348200",
      "cue": "140348200",
      "codigoEmp": "EE0310205",
      "codigoInspeccion": "(04-10) - 07-01",
      "nombre": "ESCUELA ESPECIAL DRA. CECILIA GRIERSON",
      "modalidad": "Especial",
      "esModalidadComun": false,
      "nivel": "Todos",
      "ambito": "Urbano",
      "categoria": "1°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Mariano López Cobo 100-598",
      "latitud": -33.112736,
      "longitud": -64.34943,
      "matricula2024": 29,
      "matricula2025": 24,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "José de Calasanz",
      "codvec": 3
    },
    {
      "id": "ESC-140177400",
      "cue": "140177400",
      "codigoEmp": "EE0640122",
      "codigoInspeccion": "2001-01-04",
      "nombre": "CONSERVATORIO SUPERIOR DE MUSICA JULIAN AGUIRRE",
      "modalidad": "Artística",
      "esModalidadComun": false,
      "nivel": "Todos",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Bo. Banda Norte",
      "macrozona": "Sector B (Banda Norte)",
      "domicilio": "Córdoba 960",
      "latitud": -33.102949,
      "longitud": -64.335852,
      "matricula2024": 326,
      "matricula2025": 402,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Banda Norte",
      "codvec": 13
    },
    {
      "id": "ESC-140194000",
      "cue": "140194000",
      "codigoEmp": "EE0640123",
      "codigoInspeccion": "2001-01-04",
      "nombre": "ESCUELA SUPERIOR DE BELLAS ARTES LIBERO PIERINI",
      "modalidad": "Artística",
      "esModalidadComun": false,
      "nivel": "Todos",
      "ambito": "Urbano",
      "categoria": "No categorizada",
      "turno": "No especificado",
      "barrio": "Bo. San José de Calasanz",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Av. España 171",
      "latitud": -33.11708,
      "longitud": -64.347861,
      "matricula2024": 473,
      "matricula2025": 491,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": false,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Centro",
      "codvec": 3
    },
    {
      "id": "ESC-140500600",
      "cue": "140500600",
      "codigoEmp": "EE0310255",
      "codigoInspeccion": "(04-10) - 07-01",
      "nombre": "CENTRO DE ATENCIÓN PARA DISCAPACITADOS AUDITIVOS (CADA)",
      "modalidad": "Especial",
      "esModalidadComun": false,
      "nivel": "Secundario, Primario, Inicial",
      "ambito": "Urbano",
      "categoria": "3°",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Parque Bimaco",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Maipú 2546",
      "latitud": -33.140256,
      "longitud": -64.366402,
      "matricula2024": 0,
      "matricula2025": 0,
      "alumnosDiscapacidad": 0,
      "tieneRampa": true,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": true,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Parque Bimaco",
      "codvec": 14
    },
    {
      "id": "ESC-140538000",
      "cue": "140538000",
      "codigoEmp": "EE0311393",
      "codigoInspeccion": "REGION IV -DGETYFP",
      "nombre": "IPET 362 JUAN POLITANO",
      "modalidad": "Común",
      "esModalidadComun": true,
      "nivel": "Secundario",
      "ambito": "Urbano",
      "categoria": "1º",
      "turno": "Mañana, Tarde",
      "barrio": "Bo. Intendente Mójica",
      "macrozona": "Sector C (Centro)",
      "domicilio": "Pcia de la Rioja 1615",
      "latitud": -33.123526,
      "longitud": -64.369316,
      "matricula2024": 456,
      "matricula2025": 400,
      "alumnosDiscapacidad": 0,
      "tieneRampa": false,
      "tieneBanoAdaptado": true,
      "tieneSillaRuedas": false,
      "relevamiento": {
        "id": null,
        "fecha": null,
        "tecnico": null,
        "estado": "SIN_RELEVAR",
        "hashIntegridad": "sin-relevamiento",
        "superficieM2": 0,
        "calefactoresFuncionando": 0,
        "calefactoresAveriados": 0,
        "fotosCargadas": 0,
        "evidencias": []
      },
      "ies": {
        "global": 0,
        "puntajeBase": 0,
        "clasificacion": "Sin relevar",
        "tieneKillSwitch": false,
        "factorKillSwitch": 1,
        "motivoKillSwitch": null,
        "subindices": {
          "seguridadCritica": 0,
          "aguaSaneamiento": 0,
          "estructuraCubiertas": 0,
          "climatizacion": 0,
          "alimentacionCocina": 0,
          "accesibilidad": 0,
          "entornoExterior": 0
        }
      },
      "historialIes": [],
      "incidencias": [],
      "barrioAnterior": "Roque Sáenz Peña",
      "codvec": 10
    }
  ],
  "resumenGlobal": {
    "institucionesRelevadas": 1,
    "iesPromedioCiudad": 97,
    "escuelasOptimas": 1,
    "escuelasBuenas": 0,
    "escuelasRegulares": 0,
    "escuelasCriticas": 0,
    "escuelasConKillSwitch": 0,
    "totalIncidenciasActivas": 3,
    "incidenciasFodemeep": 3,
    "incidenciasProvincia": 0
  }
};
  const BARRIOS_RESPALDO_LOCAL = {"metadata":{"fuente":"Dirección General de Estadística y Censos — Municipalidad de Río Cuarto","repositorio":"https://github.com/Direccion-de-Estadistica-Rio-Cuarto/Mapas.git","capa":"Barrios / 2026_barrios_estandarizados","crsOriginal":"EPSG:22174 (POSGAR 98 / Argentina 4)","crsDestino":"EPSG:4326 (WGS 84)","totalBarrios":62},"barrios":[{"fid":1,"codvec":44,"nombre":"Bo. Jardín Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.33376,"lat":-33.09044},"bbox":[-64.34034,-33.09251,-64.32711,-33.0884],"rings":[[[-64.3357,-33.0925],[-64.33738,-33.0925],[-64.3402,-33.09251],[-64.34021,-33.09251],[-64.34033,-33.09251],[-64.34034,-33.09251],[-64.3403,-33.09055],[-64.34028,-33.08949],[-64.34026,-33.08837],[-64.33882,-33.08838],[-64.3375,-33.08838],[-64.33612,-33.08839],[-64.33451,-33.08839],[-64.33318,-33.08839],[-64.33252,-33.08839],[-64.33185,-33.0884],[-64.33119,-33.0884],[-64.32998,-33.0884],[-64.32886,-33.08839],[-64.32734,-33.08839],[-64.32724,-33.0884],[-64.32724,-33.0888],[-64.32722,-33.08947],[-64.32716,-33.09053],[-64.32716,-33.09062],[-64.32717,-33.09246],[-64.32903,-33.09247],[-64.33135,-33.09248],[-64.33136,-33.09248],[-64.33364,-33.09249],[-64.3357,-33.0925],[-64.3357,-33.0925]]]},{"fid":2,"codvec":31,"nombre":"Bo. Cabrales (José Antonio y José Mario Cabral)","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.33896,"lat":-33.09372},"bbox":[-64.3417,-33.09573,-64.3357,-33.0925],"rings":[[[-64.3357,-33.0925],[-64.33593,-33.09271],[-64.33702,-33.09373],[-64.33813,-33.09475],[-64.3383,-33.0949],[-64.33924,-33.09576],[-64.34008,-33.09511],[-64.34167,-33.09389],[-64.34021,-33.09251],[-64.3402,-33.09251],[-64.33738,-33.0925],[-64.3357,-33.0925]]]},{"fid":3,"codvec":53,"nombre":"Bo. Parque Alihuén","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.34187,"lat":-33.09535},"bbox":[-64.34804,-33.09936,-64.33676,-33.09255],"rings":[[[-64.34021,-33.09251],[-64.34167,-33.09389],[-64.34008,-33.09511],[-64.33924,-33.09576],[-64.33684,-33.09758],[-64.33793,-33.09858],[-64.33873,-33.09935],[-64.33886,-33.09946],[-64.33966,-33.09887],[-64.34007,-33.09855],[-64.34137,-33.09755],[-64.34367,-33.09581],[-64.34603,-33.09401],[-64.34794,-33.09252],[-64.34458,-33.09253],[-64.34239,-33.09252],[-64.34034,-33.09251],[-64.34033,-33.09251],[-64.34021,-33.09251]]]},{"fid":6,"codvec":40,"nombre":"Bo. Valacco","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.31523,"lat":-33.09883},"bbox":[-64.32451,-33.10757,-64.30961,-33.09247],"rings":[[[-64.32058,-33.09242],[-64.31097,-33.09245],[-64.31085,-33.10254],[-64.30978,-33.10346],[-64.31126,-33.10486],[-64.31126,-33.10517],[-64.31175,-33.10562],[-64.31254,-33.10635],[-64.31399,-33.10768],[-64.31571,-33.1063],[-64.31623,-33.10591],[-64.31679,-33.10549],[-64.31861,-33.10411],[-64.32042,-33.10272],[-64.31823,-33.10069],[-64.31804,-33.10083],[-64.31607,-33.099],[-64.3159,-33.09882],[-64.32327,-33.09322],[-64.3233,-33.0932],[-64.32428,-33.09245],[-64.32246,-33.09244],[-64.32058,-33.09242]]]},{"fid":7,"codvec":35,"nombre":"Bo. Pueblo Nuevo","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.33226,"lat":-33.09648},"bbox":[-64.33935,-33.10296,-64.32328,-33.09246],"rings":[[[-64.32428,-33.09245],[-64.3233,-33.0932],[-64.32369,-33.09355],[-64.32542,-33.09516],[-64.32545,-33.09518],[-64.32653,-33.09619],[-64.32764,-33.09722],[-64.32873,-33.09823],[-64.33201,-33.10126],[-64.33386,-33.10296],[-64.33392,-33.10301],[-64.33399,-33.10296],[-64.33752,-33.10027],[-64.33873,-33.09935],[-64.33793,-33.09858],[-64.33684,-33.09758],[-64.33924,-33.09576],[-64.3383,-33.0949],[-64.33813,-33.09475],[-64.33702,-33.09373],[-64.33593,-33.09271],[-64.3357,-33.0925],[-64.3357,-33.0925],[-64.33364,-33.09249],[-64.33136,-33.09248],[-64.33135,-33.09248],[-64.32903,-33.09247],[-64.32717,-33.09246],[-64.32673,-33.09246],[-64.32466,-33.09246],[-64.32457,-33.09246],[-64.32428,-33.09245]]]},{"fid":8,"codvec":43,"nombre":"Bo. General San Martín","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.34713,"lat":-33.09907},"bbox":[-64.35549,-33.10657,-64.33876,-33.09262],"rings":[[[-64.34794,-33.09252],[-64.34603,-33.09401],[-64.34367,-33.09581],[-64.34137,-33.09755],[-64.34007,-33.09855],[-64.33966,-33.09887],[-64.33886,-33.09946],[-64.33902,-33.09961],[-64.34012,-33.10061],[-64.34122,-33.10163],[-64.3445,-33.10468],[-64.34665,-33.10666],[-64.34673,-33.1066],[-64.34757,-33.10553],[-64.34683,-33.10476],[-64.34799,-33.10385],[-64.34922,-33.10293],[-64.35277,-33.10028],[-64.35322,-33.10002],[-64.35317,-33.10159],[-64.35538,-33.09968],[-64.35347,-33.09777],[-64.35348,-33.09672],[-64.35232,-33.09563],[-64.35037,-33.09385],[-64.349,-33.09253],[-64.34898,-33.09253],[-64.34835,-33.09254],[-64.34828,-33.09253],[-64.34794,-33.09252]]]},{"fid":9,"codvec":38,"nombre":"Bo. Alto Privado Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.35485,"lat":-33.09493},"bbox":[-64.35941,-33.09964,-64.349,-33.09251],"rings":[[[-64.349,-33.09253],[-64.35037,-33.09385],[-64.35232,-33.09563],[-64.35348,-33.09672],[-64.35347,-33.09777],[-64.35538,-33.09968],[-64.35636,-33.0984],[-64.35784,-33.09593],[-64.35852,-33.0949],[-64.35874,-33.09434],[-64.3593,-33.09254],[-64.3593,-33.09254],[-64.35435,-33.09246],[-64.35346,-33.09247],[-64.35122,-33.0925],[-64.35072,-33.0925],[-64.349,-33.09253]]]},{"fid":11,"codvec":41,"nombre":"Bo. Residencial Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.32179,"lat":-33.09797},"bbox":[-64.32772,-33.10264,-64.31582,-33.09328],"rings":[[[-64.32764,-33.09722],[-64.32653,-33.09619],[-64.32545,-33.09518],[-64.32542,-33.09516],[-64.32369,-33.09355],[-64.3233,-33.0932],[-64.32327,-33.09322],[-64.3159,-33.09882],[-64.31607,-33.099],[-64.31804,-33.10083],[-64.31823,-33.10069],[-64.32042,-33.10272],[-64.3216,-33.1018],[-64.3228,-33.10087],[-64.32403,-33.09996],[-64.32644,-33.09812],[-64.32764,-33.09722]]]},{"fid":12,"codvec":9,"nombre":"Bo. Las Quintas","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.36263,"lat":-33.10192},"bbox":[-64.3695,-33.10824,-64.35582,-33.09456],"rings":[[[-64.3606,-33.09451],[-64.3604,-33.09518],[-64.35993,-33.09526],[-64.35781,-33.10042],[-64.35729,-33.10047],[-64.35668,-33.10104],[-64.35691,-33.10221],[-64.35633,-33.10309],[-64.35599,-33.10397],[-64.35596,-33.10407],[-64.35731,-33.10392],[-64.3584,-33.10709],[-64.35884,-33.10836],[-64.36271,-33.10744],[-64.3649,-33.10691],[-64.36643,-33.10653],[-64.36792,-33.10614],[-64.36946,-33.10578],[-64.36944,-33.10576],[-64.36904,-33.10453],[-64.36883,-33.10389],[-64.36861,-33.10325],[-64.36818,-33.10197],[-64.36759,-33.10028],[-64.3673,-33.0994],[-64.3667,-33.09768],[-64.36643,-33.0969],[-64.3606,-33.09451]]]},{"fid":13,"codvec":39,"nombre":"Bo. Jardín","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.32392,"lat":-33.10544},"bbox":[-64.33408,-33.11358,-64.31383,-33.09737],"rings":[[[-64.32764,-33.09722],[-64.32644,-33.09812],[-64.32403,-33.09996],[-64.3228,-33.10087],[-64.3216,-33.1018],[-64.32042,-33.10272],[-64.31861,-33.10411],[-64.31679,-33.10549],[-64.31623,-33.10591],[-64.31571,-33.1063],[-64.31399,-33.10768],[-64.31472,-33.10836],[-64.31613,-33.1097],[-64.31638,-33.10993],[-64.31817,-33.11155],[-64.31903,-33.11235],[-64.31987,-33.11314],[-64.32049,-33.11368],[-64.32054,-33.11372],[-64.32338,-33.11159],[-64.32399,-33.11114],[-64.32444,-33.11055],[-64.3249,-33.10994],[-64.32549,-33.1095],[-64.32551,-33.10948],[-64.32788,-33.10766],[-64.32788,-33.10765],[-64.32849,-33.10719],[-64.32905,-33.10676],[-64.32908,-33.10674],[-64.32939,-33.1065],[-64.33029,-33.1058],[-64.33031,-33.10579],[-64.33141,-33.10495],[-64.33353,-33.10332],[-64.33392,-33.10301],[-64.33386,-33.10296],[-64.33201,-33.10126],[-64.32873,-33.09823],[-64.32764,-33.09722]]]},{"fid":14,"codvec":17,"nombre":"Bo. Villa Dalcar","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.37271,"lat":-33.10473},"bbox":[-64.37756,-33.11051,-64.36816,-33.10046],"rings":[[[-64.37733,-33.1039],[-64.37717,-33.10346],[-64.37703,-33.10313],[-64.37691,-33.10289],[-64.37677,-33.10263],[-64.37659,-33.10234],[-64.37639,-33.10204],[-64.37622,-33.10182],[-64.37601,-33.10156],[-64.37576,-33.10128],[-64.37572,-33.10124],[-64.37554,-33.10105],[-64.37531,-33.10084],[-64.37508,-33.10065],[-64.37485,-33.10046],[-64.37475,-33.10039],[-64.37422,-33.10053],[-64.37272,-33.10087],[-64.37061,-33.10138],[-64.3697,-33.10159],[-64.36818,-33.10197],[-64.36861,-33.10325],[-64.36883,-33.10389],[-64.36904,-33.10453],[-64.36944,-33.10576],[-64.36946,-33.10578],[-64.36993,-33.10706],[-64.37044,-33.10832],[-64.37093,-33.10961],[-64.37115,-33.11018],[-64.37147,-33.11058],[-64.37269,-33.11001],[-64.37311,-33.10961],[-64.37341,-33.1091],[-64.37375,-33.1086],[-64.37399,-33.10826],[-64.37446,-33.10765],[-64.37485,-33.10716],[-64.37538,-33.10649],[-64.376,-33.10573],[-64.37611,-33.10564],[-64.37635,-33.10536],[-64.37653,-33.10512],[-64.37671,-33.10489],[-64.37704,-33.10446],[-64.37717,-33.10437],[-64.3772,-33.10437],[-64.37747,-33.1043],[-64.37734,-33.10394],[-64.37733,-33.1039]]]},{"fid":16,"codvec":20,"nombre":"Bo. San Antonio de Padua","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.35668,"lat":-33.11043},"bbox":[-64.36024,-33.1155,-64.3532,-33.10397],"rings":[[[-64.35596,-33.10407],[-64.3559,-33.10434],[-64.35581,-33.10468],[-64.35527,-33.10645],[-64.35487,-33.10793],[-64.35451,-33.10936],[-64.35425,-33.1109],[-64.35377,-33.11138],[-64.35381,-33.11141],[-64.35385,-33.11233],[-64.35392,-33.11389],[-64.35384,-33.11408],[-64.35337,-33.11532],[-64.35535,-33.11509],[-64.35536,-33.11506],[-64.3561,-33.11482],[-64.35634,-33.11554],[-64.35714,-33.11525],[-64.35773,-33.11462],[-64.35803,-33.11434],[-64.35891,-33.11353],[-64.3602,-33.11243],[-64.36019,-33.1124],[-64.36011,-33.11219],[-64.35968,-33.11092],[-64.35949,-33.11036],[-64.35925,-33.10965],[-64.35905,-33.10901],[-64.35884,-33.10837],[-64.35884,-33.10836],[-64.3584,-33.10709],[-64.35731,-33.10392],[-64.35596,-33.10407]]]},{"fid":18,"codvec":33,"nombre":"Bo. La Agustina","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.32921,"lat":-33.11418},"bbox":[-64.33788,-33.12163,-64.32043,-33.10659],"rings":[[[-64.32939,-33.1065],[-64.32908,-33.10674],[-64.32905,-33.10676],[-64.32849,-33.10719],[-64.32788,-33.10765],[-64.32788,-33.10766],[-64.32551,-33.10948],[-64.32549,-33.1095],[-64.3249,-33.10994],[-64.32444,-33.11055],[-64.32399,-33.11114],[-64.32338,-33.11159],[-64.32054,-33.11372],[-64.32113,-33.11425],[-64.32225,-33.11528],[-64.3233,-33.11627],[-64.32441,-33.11718],[-64.32545,-33.11803],[-64.32615,-33.11869],[-64.32941,-33.12172],[-64.33088,-33.12061],[-64.33207,-33.11971],[-64.33207,-33.11968],[-64.33329,-33.11876],[-64.33378,-33.1184],[-64.33419,-33.11745],[-64.33537,-33.11655],[-64.33657,-33.11562],[-64.33657,-33.11562],[-64.33777,-33.11471],[-64.33778,-33.1147],[-64.33275,-33.11008],[-64.3319,-33.10928],[-64.33059,-33.1081],[-64.33048,-33.108],[-64.3308,-33.10775],[-64.33072,-33.10768],[-64.33023,-33.10725],[-64.32939,-33.1065]]]},{"fid":19,"codvec":12,"nombre":"Bo. Buena Vista","sector":"Sector C (Centro)","centroide":{"lng":-64.35809,"lat":-33.11707},"bbox":[-64.36387,-33.12179,-64.35251,-33.11149],"rings":[[[-64.36269,-33.11494],[-64.36268,-33.11494],[-64.36251,-33.11445],[-64.36216,-33.11347],[-64.36181,-33.11243],[-64.36144,-33.11139],[-64.3614,-33.11142],[-64.36124,-33.11155],[-64.36073,-33.11197],[-64.36048,-33.11217],[-64.36019,-33.1124],[-64.3602,-33.11243],[-64.35891,-33.11353],[-64.35803,-33.11434],[-64.35773,-33.11462],[-64.35714,-33.11525],[-64.35634,-33.11554],[-64.3561,-33.11482],[-64.35536,-33.11506],[-64.35535,-33.11509],[-64.35337,-33.11532],[-64.35262,-33.11659],[-64.35259,-33.11665],[-64.35318,-33.11852],[-64.35426,-33.1219],[-64.35626,-33.12142],[-64.35819,-33.12094],[-64.35788,-33.12005],[-64.35774,-33.11967],[-64.35774,-33.11967],[-64.35926,-33.11931],[-64.36076,-33.11896],[-64.36229,-33.11859],[-64.36382,-33.11823],[-64.36382,-33.11823],[-64.36316,-33.11631],[-64.3627,-33.11497],[-64.36269,-33.11494]]]},{"fid":20,"codvec":18,"nombre":"Bo. Lomitas de Oro","sector":"Sector C (Centro)","centroide":{"lng":-64.36714,"lat":-33.1159},"bbox":[-64.37185,-33.11943,-64.36264,-33.11183],"rings":[[[-64.36893,-33.11176],[-64.36831,-33.11204],[-64.36687,-33.1127],[-64.36544,-33.11335],[-64.36402,-33.114],[-64.36344,-33.11422],[-64.36269,-33.11494],[-64.3627,-33.11497],[-64.36316,-33.11631],[-64.36382,-33.11823],[-64.36426,-33.11951],[-64.36577,-33.11914],[-64.3673,-33.11879],[-64.36881,-33.11841],[-64.3694,-33.11826],[-64.37032,-33.11801],[-64.37106,-33.11783],[-64.37179,-33.11764],[-64.37183,-33.11763],[-64.37056,-33.11392],[-64.37047,-33.11394],[-64.37028,-33.11399],[-64.37018,-33.11401],[-64.37008,-33.11404],[-64.36988,-33.11408],[-64.36976,-33.11411],[-64.36975,-33.11412],[-64.36969,-33.11397],[-64.36969,-33.11397],[-64.36963,-33.11377],[-64.36956,-33.1136],[-64.36955,-33.11355],[-64.3695,-33.11342],[-64.36945,-33.11328],[-64.36944,-33.11324],[-64.36938,-33.11308],[-64.3694,-33.11308],[-64.36932,-33.11283],[-64.36928,-33.11269],[-64.36921,-33.11249],[-64.36912,-33.11223],[-64.3691,-33.11224],[-64.36893,-33.11176]]]},{"fid":21,"codvec":34,"nombre":"Bo. Paraiso","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.31974,"lat":-33.11525},"bbox":[-64.32056,-33.11812,-64.31892,-33.11235],"rings":[[[-64.32049,-33.11368],[-64.31987,-33.11314],[-64.31903,-33.11235],[-64.31899,-33.1168],[-64.32045,-33.11813],[-64.32049,-33.11368]]]},{"fid":22,"codvec":26,"nombre":"Bo. Nueva Argentina","sector":"Sector A (Alberdi)","centroide":{"lng":-64.31555,"lat":-33.13516},"bbox":[-64.32174,-33.14194,-64.31102,-33.12309],"rings":[[[-64.31844,-33.12976],[-64.31788,-33.12957],[-64.31739,-33.12966],[-64.31691,-33.12979],[-64.31636,-33.12995],[-64.31591,-33.12992],[-64.31553,-33.12975],[-64.315,-33.12952],[-64.31416,-33.12927],[-64.31361,-33.12897],[-64.31322,-33.12874],[-64.31276,-33.12828],[-64.31253,-33.12793],[-64.31237,-33.12742],[-64.31235,-33.12722],[-64.31239,-33.12698],[-64.31249,-33.12677],[-64.31256,-33.12653],[-64.3125,-33.12616],[-64.31245,-33.12553],[-64.31225,-33.12494],[-64.31191,-33.12442],[-64.31104,-33.12309],[-64.31104,-33.12322],[-64.31103,-33.12397],[-64.31163,-33.12634],[-64.31165,-33.12952],[-64.31174,-33.14205],[-64.31402,-33.14156],[-64.31868,-33.14047],[-64.3202,-33.14011],[-64.3217,-33.13976],[-64.32131,-33.13847],[-64.32048,-33.13593],[-64.32004,-33.13463],[-64.3193,-33.13481],[-64.31888,-33.13352],[-64.31963,-33.13334],[-64.31936,-33.13251],[-64.31844,-33.12976]]]},{"fid":23,"codvec":27,"nombre":"Bo. Quintitas Golf","sector":"Sector C (Centro)","centroide":{"lng":-64.38253,"lat":-33.10825},"bbox":[-64.38628,-33.11534,-64.3773,-33.10192],"rings":[[[-64.38607,-33.10182],[-64.38312,-33.10252],[-64.37797,-33.10374],[-64.37733,-33.1039],[-64.37734,-33.10394],[-64.37747,-33.1043],[-64.37751,-33.10443],[-64.3777,-33.10497],[-64.37788,-33.10551],[-64.37817,-33.10638],[-64.37832,-33.10683],[-64.37839,-33.10706],[-64.37866,-33.10788],[-64.37899,-33.10884],[-64.37925,-33.1096],[-64.37937,-33.10997],[-64.37962,-33.11071],[-64.37975,-33.11109],[-64.37998,-33.11179],[-64.38016,-33.11231],[-64.38044,-33.11315],[-64.38063,-33.11371],[-64.38083,-33.11434],[-64.38093,-33.11464],[-64.38103,-33.11488],[-64.3812,-33.11539],[-64.3817,-33.11528],[-64.38182,-33.11525],[-64.38397,-33.11476],[-64.38593,-33.11429],[-64.38591,-33.11016],[-64.38591,-33.11016],[-64.38591,-33.10879],[-64.38593,-33.1085],[-64.38594,-33.10834],[-64.38598,-33.10784],[-64.386,-33.1056],[-64.38606,-33.1056],[-64.38607,-33.10182]]]},{"fid":24,"codvec":11,"nombre":"Bo. Golf","sector":"Sector C (Centro)","centroide":{"lng":-64.3759,"lat":-33.11516},"bbox":[-64.38165,-33.12389,-64.36882,-33.1044],"rings":[[[-64.37747,-33.1043],[-64.3772,-33.10437],[-64.37717,-33.10437],[-64.37704,-33.10446],[-64.37671,-33.10489],[-64.37653,-33.10512],[-64.37635,-33.10536],[-64.37611,-33.10564],[-64.376,-33.10573],[-64.37538,-33.10649],[-64.37485,-33.10716],[-64.37446,-33.10765],[-64.37399,-33.10826],[-64.37375,-33.1086],[-64.37341,-33.1091],[-64.37311,-33.10961],[-64.37269,-33.11001],[-64.37147,-33.11058],[-64.3714,-33.11061],[-64.37103,-33.11078],[-64.37015,-33.1112],[-64.36967,-33.11142],[-64.36893,-33.11176],[-64.3691,-33.11224],[-64.36912,-33.11223],[-64.36921,-33.11249],[-64.36928,-33.11269],[-64.36932,-33.11283],[-64.3694,-33.11308],[-64.36938,-33.11308],[-64.36944,-33.11324],[-64.36945,-33.11328],[-64.3695,-33.11342],[-64.36955,-33.11355],[-64.36956,-33.1136],[-64.36963,-33.11377],[-64.36969,-33.11397],[-64.36969,-33.11397],[-64.36975,-33.11412],[-64.36976,-33.11411],[-64.36988,-33.11408],[-64.37008,-33.11404],[-64.37018,-33.11401],[-64.37028,-33.11399],[-64.37047,-33.11394],[-64.37056,-33.11392],[-64.37183,-33.11763],[-64.37185,-33.11763],[-64.37227,-33.11895],[-64.37269,-33.12026],[-64.37232,-33.12034],[-64.37275,-33.12162],[-64.37313,-33.12272],[-64.37356,-33.12398],[-64.37548,-33.12359],[-64.377,-33.12328],[-64.37855,-33.12297],[-64.37931,-33.12281],[-64.38011,-33.12265],[-64.38162,-33.12234],[-64.38163,-33.12234],[-64.37941,-33.11581],[-64.3808,-33.11548],[-64.38094,-33.11545],[-64.3812,-33.11539],[-64.38103,-33.11488],[-64.38093,-33.11464],[-64.38083,-33.11434],[-64.38063,-33.11371],[-64.38044,-33.11315],[-64.38016,-33.11231],[-64.37998,-33.11179],[-64.37975,-33.11109],[-64.37962,-33.11071],[-64.37937,-33.10997],[-64.37925,-33.1096],[-64.37899,-33.10884],[-64.37866,-33.10788],[-64.37839,-33.10706],[-64.37832,-33.10683],[-64.37817,-33.10638],[-64.37788,-33.10551],[-64.3777,-33.10497],[-64.37751,-33.10443],[-64.37747,-33.1043]]]},{"fid":25,"codvec":47,"nombre":"Bo. Villa Golf","sector":"Sector C (Centro)","centroide":{"lng":-64.38978,"lat":-33.11523},"bbox":[-64.3961,-33.12248,-64.38565,-33.1081],"rings":[[[-64.38594,-33.10834],[-64.38593,-33.1085],[-64.38591,-33.10879],[-64.38591,-33.11016],[-64.38591,-33.11016],[-64.38593,-33.11429],[-64.38593,-33.11566],[-64.3859,-33.1169],[-64.3859,-33.11703],[-64.3859,-33.11703],[-64.38588,-33.11844],[-64.38584,-33.11984],[-64.38586,-33.12143],[-64.38586,-33.12143],[-64.38587,-33.12224],[-64.38588,-33.12244],[-64.39216,-33.12253],[-64.39216,-33.12212],[-64.39216,-33.12175],[-64.39216,-33.12151],[-64.39216,-33.12128],[-64.39216,-33.12106],[-64.39216,-33.12083],[-64.39216,-33.12061],[-64.39216,-33.12038],[-64.39216,-33.12016],[-64.39216,-33.11994],[-64.39216,-33.11973],[-64.39216,-33.11953],[-64.39216,-33.11953],[-64.39216,-33.11878],[-64.39216,-33.11864],[-64.39216,-33.11843],[-64.39221,-33.11841],[-64.39508,-33.11812],[-64.3956,-33.11778],[-64.39602,-33.11745],[-64.39333,-33.11277],[-64.39271,-33.10802],[-64.38976,-33.1081],[-64.38845,-33.10812],[-64.38766,-33.10813],[-64.38702,-33.10813],[-64.38674,-33.10815],[-64.38649,-33.10818],[-64.38633,-33.10821],[-64.38608,-33.10829],[-64.38594,-33.10834]]]},{"fid":26,"codvec":37,"nombre":"Bo. Las Delicias","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.3236,"lat":-33.12126},"bbox":[-64.33002,-33.12754,-64.32012,-33.11368],"rings":[[[-64.32054,-33.11372],[-64.32049,-33.11368],[-64.32045,-33.11813],[-64.32041,-33.11815],[-64.32033,-33.12425],[-64.32032,-33.12522],[-64.32031,-33.12683],[-64.32061,-33.1266],[-64.32097,-33.12694],[-64.32129,-33.12723],[-64.32172,-33.12762],[-64.32289,-33.12669],[-64.32411,-33.12581],[-64.32532,-33.12488],[-64.32654,-33.12395],[-64.32774,-33.12303],[-64.32835,-33.12359],[-64.32944,-33.1226],[-64.32994,-33.12222],[-64.32988,-33.12215],[-64.32941,-33.12172],[-64.32615,-33.11869],[-64.32545,-33.11803],[-64.32441,-33.11718],[-64.3233,-33.11627],[-64.32225,-33.11528],[-64.32113,-33.11425],[-64.32054,-33.11372]]]},{"fid":27,"codvec":28,"nombre":"Bo. San Pablo","sector":"Sector C (Centro)","centroide":{"lng":-64.38317,"lat":-33.11822},"bbox":[-64.38606,-33.12229,-64.37939,-33.11436],"rings":[[[-64.38593,-33.11429],[-64.38397,-33.11476],[-64.38182,-33.11525],[-64.3817,-33.11528],[-64.3812,-33.11539],[-64.38094,-33.11545],[-64.3808,-33.11548],[-64.37941,-33.11581],[-64.38163,-33.12234],[-64.38319,-33.12201],[-64.38397,-33.12185],[-64.38467,-33.12169],[-64.38586,-33.12143],[-64.38586,-33.12143],[-64.38584,-33.11984],[-64.38588,-33.11844],[-64.3859,-33.11703],[-64.3859,-33.11703],[-64.3859,-33.1169],[-64.38593,-33.11566],[-64.38593,-33.11429]]]},{"fid":28,"codvec":10,"nombre":"Bo. Intendente Mójica","sector":"Sector C (Centro)","centroide":{"lng":-64.36564,"lat":-33.12194},"bbox":[-64.3736,-33.12617,-64.35771,-33.11778],"rings":[[[-64.37183,-33.11763],[-64.37179,-33.11764],[-64.37106,-33.11783],[-64.37032,-33.11801],[-64.3694,-33.11826],[-64.36881,-33.11841],[-64.3673,-33.11879],[-64.36577,-33.11914],[-64.36426,-33.11951],[-64.36382,-33.11823],[-64.36382,-33.11823],[-64.36229,-33.11859],[-64.36076,-33.11896],[-64.35926,-33.11931],[-64.35774,-33.11967],[-64.35774,-33.11967],[-64.35788,-33.12005],[-64.35819,-33.12094],[-64.35819,-33.12094],[-64.35843,-33.12158],[-64.35861,-33.12202],[-64.35891,-33.12275],[-64.35891,-33.12275],[-64.35929,-33.12368],[-64.35951,-33.12421],[-64.35951,-33.12422],[-64.36,-33.12542],[-64.36,-33.12543],[-64.36037,-33.12628],[-64.36038,-33.12632],[-64.36038,-33.12632],[-64.36471,-33.12556],[-64.36616,-33.12532],[-64.36696,-33.12517],[-64.36928,-33.12479],[-64.36925,-33.1247],[-64.37063,-33.12447],[-64.37356,-33.12398],[-64.37313,-33.12272],[-64.37275,-33.12162],[-64.37232,-33.12034],[-64.37269,-33.12026],[-64.37227,-33.11895],[-64.37185,-33.11763],[-64.37183,-33.11763]]]},{"fid":29,"codvec":21,"nombre":"Bo. Alberdi Norte","sector":"Sector A (Alberdi)","centroide":{"lng":-64.32856,"lat":-33.13011},"bbox":[-64.33757,-33.13461,-64.31836,-33.12431],"rings":[[[-64.33072,-33.1322],[-64.33073,-33.1322],[-64.33225,-33.13186],[-64.33377,-33.1315],[-64.33528,-33.13113],[-64.3368,-33.13078],[-64.33751,-33.13062],[-64.33748,-33.13059],[-64.33648,-33.1297],[-64.33633,-33.12956],[-64.3363,-33.12951],[-64.3363,-33.12951],[-64.33613,-33.12934],[-64.33678,-33.12887],[-64.33679,-33.12887],[-64.33612,-33.12824],[-64.3361,-33.12823],[-64.33533,-33.1275],[-64.33478,-33.12699],[-64.33449,-33.12671],[-64.33446,-33.1265],[-64.33384,-33.12595],[-64.33339,-33.12555],[-64.33196,-33.12425],[-64.33193,-33.12416],[-64.33187,-33.1242],[-64.33119,-33.12459],[-64.33044,-33.12559],[-64.33011,-33.12592],[-64.328,-33.12791],[-64.32652,-33.12887],[-64.32515,-33.12968],[-64.32377,-33.13061],[-64.32296,-33.1313],[-64.32149,-33.13166],[-64.321,-33.13063],[-64.31844,-33.12976],[-64.31936,-33.13251],[-64.31963,-33.13334],[-64.31888,-33.13352],[-64.3193,-33.13481],[-64.32004,-33.13463],[-64.32006,-33.13463],[-64.32156,-33.13427],[-64.3231,-33.13392],[-64.32615,-33.13323],[-64.3277,-33.13288],[-64.32845,-33.13272],[-64.32921,-33.13255],[-64.32921,-33.13255],[-64.33072,-33.1322]]]},{"fid":30,"codvec":7,"nombre":"Bo. General Roca","sector":"Sector A (Alberdi)","centroide":{"lng":-64.34262,"lat":-33.12941},"bbox":[-64.34675,-33.13264,-64.33715,-33.12627],"rings":[[[-64.34295,-33.12664],[-64.34294,-33.12664],[-64.34192,-33.12687],[-64.33717,-33.12799],[-64.33753,-33.12831],[-64.33804,-33.12879],[-64.33851,-33.12922],[-64.33878,-33.12947],[-64.33947,-33.1301],[-64.34036,-33.13094],[-64.34085,-33.13139],[-64.34122,-33.13174],[-64.34129,-33.1318],[-64.34178,-33.13226],[-64.34219,-33.13264],[-64.34225,-33.13269],[-64.34674,-33.1317],[-64.34578,-33.12877],[-64.34538,-33.12758],[-64.34492,-33.12619],[-64.34386,-33.12643],[-64.34295,-33.12664]]]},{"fid":31,"codvec":5,"nombre":"Bo. Pueblo Alberdi","sector":"Sector A (Alberdi)","centroide":{"lng":-64.33528,"lat":-33.1367},"bbox":[-64.34215,-33.14284,-64.32831,-33.13072],"rings":[[[-64.33072,-33.1322],[-64.33115,-33.13347],[-64.33156,-33.13477],[-64.33196,-33.13603],[-64.33237,-33.1373],[-64.33266,-33.13817],[-64.33305,-33.13944],[-64.33151,-33.13977],[-64.33151,-33.13977],[-64.32999,-33.14011],[-64.32846,-33.14045],[-64.32923,-33.14298],[-64.33231,-33.14233],[-64.33385,-33.14201],[-64.3369,-33.14133],[-64.33846,-33.14099],[-64.33996,-33.14065],[-64.33876,-33.13679],[-64.33848,-33.13592],[-64.33848,-33.13591],[-64.34001,-33.13558],[-64.34073,-33.13541],[-64.34154,-33.13523],[-64.34203,-33.13486],[-64.34108,-33.13396],[-64.33989,-33.13283],[-64.33917,-33.13216],[-64.33872,-33.13174],[-64.3387,-33.13173],[-64.33817,-33.13123],[-64.33751,-33.13062],[-64.3368,-33.13078],[-64.33528,-33.13113],[-64.33377,-33.1315],[-64.33225,-33.13186],[-64.33073,-33.1322],[-64.33072,-33.1322]]]},{"fid":33,"codvec":24,"nombre":"Bo. General Paz","sector":"Sector C (Centro)","centroide":{"lng":-64.35266,"lat":-33.13728},"bbox":[-64.36006,-33.1442,-64.34438,-33.13233],"rings":[[[-64.35993,-33.13612],[-64.3598,-33.13568],[-64.35911,-33.13354],[-64.35904,-33.13356],[-64.35903,-33.13356],[-64.35859,-33.13217],[-64.35759,-33.13244],[-64.35663,-33.13268],[-64.35463,-33.13319],[-64.35364,-33.13344],[-64.35265,-33.1337],[-64.3526,-33.13371],[-64.3516,-33.13397],[-64.35057,-33.13423],[-64.34765,-33.13499],[-64.3466,-33.13526],[-64.34592,-33.13544],[-64.34507,-33.13566],[-64.34443,-33.13581],[-64.34537,-33.13666],[-64.34537,-33.13667],[-64.34659,-33.13776],[-64.34651,-33.13778],[-64.34777,-33.13888],[-64.34771,-33.13889],[-64.34896,-33.13999],[-64.34888,-33.14001],[-64.34964,-33.14062],[-64.35027,-33.14108],[-64.35027,-33.14108],[-64.35169,-33.14213],[-64.35209,-33.14253],[-64.35301,-33.14322],[-64.35394,-33.14391],[-64.35422,-33.14411],[-64.35443,-33.14426],[-64.35579,-33.14396],[-64.35581,-33.14396],[-64.35382,-33.13751],[-64.35534,-33.13716],[-64.35686,-33.13682],[-64.3584,-33.13647],[-64.35993,-33.13612]]]},{"fid":34,"codvec":32,"nombre":"Bo. Excuarteles","sector":"Sector A (Alberdi)","centroide":{"lng":-64.34126,"lat":-33.13758},"bbox":[-64.34377,-33.14061,-64.33845,-33.13444],"rings":[[[-64.34203,-33.13486],[-64.34154,-33.13523],[-64.34073,-33.13541],[-64.34001,-33.13558],[-64.33848,-33.13591],[-64.33848,-33.13592],[-64.33876,-33.13679],[-64.33996,-33.14065],[-64.33997,-33.14064],[-64.34148,-33.14029],[-64.34269,-33.14002],[-64.34269,-33.13998],[-64.3432,-33.13856],[-64.34322,-33.13849],[-64.34371,-33.13717],[-64.34372,-33.13704],[-64.34331,-33.13574],[-64.34306,-33.1352],[-64.34262,-33.13439],[-64.34203,-33.13486]]]},{"fid":35,"codvec":46,"nombre":"Bo. Juan Martín de Pueyrredón","sector":"Sector C (Centro)","centroide":{"lng":-64.35787,"lat":-33.14005},"bbox":[-64.36193,-33.14389,-64.3538,-33.13618],"rings":[[[-64.35993,-33.13612],[-64.3584,-33.13647],[-64.35686,-33.13682],[-64.35534,-33.13716],[-64.35382,-33.13751],[-64.35581,-33.14396],[-64.36119,-33.14276],[-64.36191,-33.1426],[-64.36152,-33.14132],[-64.36112,-33.14006],[-64.36071,-33.13872],[-64.35993,-33.13612]]]},{"fid":36,"codvec":16,"nombre":"Bo. Ingeniero Manuel Pizarro","sector":"Sector C (Centro)","centroide":{"lng":-64.36394,"lat":-33.1473},"bbox":[-64.37045,-33.15446,-64.35439,-33.14174],"rings":[[[-64.36191,-33.1426],[-64.36119,-33.14276],[-64.35581,-33.14396],[-64.35579,-33.14396],[-64.35443,-33.14426],[-64.35591,-33.14533],[-64.3561,-33.1453],[-64.35632,-33.14546],[-64.35744,-33.14629],[-64.35749,-33.14632],[-64.35797,-33.14668],[-64.35896,-33.14741],[-64.35946,-33.1478],[-64.36032,-33.14847],[-64.36169,-33.14952],[-64.36191,-33.14978],[-64.36312,-33.1507],[-64.36813,-33.15448],[-64.37045,-33.15446],[-64.37025,-33.15382],[-64.37005,-33.15319],[-64.36965,-33.1519],[-64.36927,-33.15062],[-64.36927,-33.15062],[-64.36909,-33.14997],[-64.36885,-33.14916],[-64.36852,-33.14804],[-64.36813,-33.14676],[-64.36813,-33.14676],[-64.36774,-33.14547],[-64.36773,-33.14545],[-64.36733,-33.14417],[-64.36733,-33.14417],[-64.36694,-33.14287],[-64.36694,-33.14287],[-64.36653,-33.1416],[-64.36191,-33.1426]]]},{"fid":37,"codvec":23,"nombre":"Bo. Industrial","sector":"Sector D (Distrito Periférico)","centroide":{"lng":-64.35243,"lat":-33.14882},"bbox":[-64.35788,-33.1523,-64.34701,-33.1454],"rings":[[[-64.35632,-33.14546],[-64.3561,-33.1453],[-64.35591,-33.14533],[-64.35468,-33.14558],[-64.35311,-33.14591],[-64.34764,-33.14713],[-64.34704,-33.14727],[-64.34704,-33.14729],[-64.34742,-33.1485],[-64.34742,-33.1485],[-64.3478,-33.14986],[-64.34781,-33.14987],[-64.34821,-33.15113],[-64.34821,-33.15113],[-64.34864,-33.1524],[-64.35142,-33.15178],[-64.35473,-33.15106],[-64.35624,-33.15072],[-64.35785,-33.15039],[-64.35785,-33.15039],[-64.35632,-33.14546]]]},{"fid":38,"codvec":29,"nombre":"Bo. Doctor Carlos Mayer","sector":"Sector A (Alberdi)","centroide":{"lng":-64.34661,"lat":-33.15115},"bbox":[-64.34927,-33.15473,-64.34397,-33.14732],"rings":[[[-64.34704,-33.14729],[-64.34549,-33.14765],[-64.34418,-33.14795],[-64.34418,-33.14795],[-64.34398,-33.148],[-64.34608,-33.15474],[-64.34809,-33.15474],[-64.3483,-33.15458],[-64.34842,-33.15447],[-64.34927,-33.15447],[-64.34864,-33.1524],[-64.34864,-33.1524],[-64.34821,-33.15113],[-64.34821,-33.15113],[-64.34781,-33.14987],[-64.3478,-33.14986],[-64.34742,-33.1485],[-64.34742,-33.1485],[-64.34704,-33.14729]]]},{"fid":39,"codvec":49,"nombre":"Bo. Ciudad Nueva","sector":"Sector C (Centro)","centroide":{"lng":-64.37229,"lat":-33.15229},"bbox":[-64.3752,-33.15449,-64.36926,-33.14968],"rings":[[[-64.36927,-33.15062],[-64.36927,-33.15062],[-64.36965,-33.1519],[-64.37005,-33.15319],[-64.37025,-33.15382],[-64.37045,-33.15446],[-64.37492,-33.15449],[-64.37492,-33.15444],[-64.37517,-33.15413],[-64.37519,-33.1541],[-64.37502,-33.15349],[-64.37462,-33.15221],[-64.37422,-33.15092],[-64.37382,-33.14963],[-64.37234,-33.14996],[-64.37082,-33.15029],[-64.36927,-33.15062]]]},{"fid":40,"codvec":30,"nombre":"Bo. Las Ferias","sector":"Sector D (Distrito Periférico)","centroide":{"lng":-64.35403,"lat":-33.15424},"bbox":[-64.35914,-33.15739,-64.34818,-33.15049],"rings":[[[-64.35785,-33.15039],[-64.35624,-33.15072],[-64.35473,-33.15106],[-64.35142,-33.15178],[-64.34864,-33.1524],[-64.34864,-33.1524],[-64.34927,-33.15447],[-64.34842,-33.15447],[-64.3483,-33.15458],[-64.34827,-33.15657],[-64.35571,-33.15742],[-64.3557,-33.15721],[-64.35739,-33.1574],[-64.35851,-33.15662],[-64.35904,-33.156],[-64.35912,-33.15562],[-64.35909,-33.15452],[-64.3586,-33.153],[-64.35833,-33.15201],[-64.35824,-33.15168],[-64.35788,-33.15039],[-64.35785,-33.15039]]]},{"fid":41,"codvec":50,"nombre":"Bo. Cielos del Oeste","sector":"Sector D (Distrito Periférico)","centroide":{"lng":-64.40844,"lat":-33.11095},"bbox":[-64.41495,-33.12264,-64.40233,-33.1046],"rings":[[[-64.40387,-33.10498],[-64.4039,-33.10756],[-64.40505,-33.10752],[-64.405,-33.10766],[-64.40373,-33.10966],[-64.40359,-33.10986],[-64.40244,-33.11168],[-64.4053,-33.11135],[-64.4053,-33.11217],[-64.4053,-33.11265],[-64.4053,-33.11354],[-64.4053,-33.11366],[-64.4053,-33.11395],[-64.4053,-33.11417],[-64.4053,-33.11424],[-64.4053,-33.11424],[-64.4053,-33.11442],[-64.4053,-33.11447],[-64.4053,-33.11462],[-64.4053,-33.11467],[-64.4053,-33.1148],[-64.4053,-33.11481],[-64.4053,-33.11486],[-64.4053,-33.11499],[-64.4053,-33.11504],[-64.4053,-33.11504],[-64.4053,-33.11516],[-64.4053,-33.11517],[-64.4053,-33.11522],[-64.4053,-33.11536],[-64.4053,-33.11539],[-64.4053,-33.11541],[-64.4053,-33.11554],[-64.4053,-33.11559],[-64.4053,-33.11572],[-64.4053,-33.11577],[-64.4053,-33.11591],[-64.4053,-33.11596],[-64.4053,-33.11596],[-64.4053,-33.11609],[-64.4053,-33.11614],[-64.4053,-33.11625],[-64.4053,-33.11628],[-64.4053,-33.11633],[-64.4053,-33.11646],[-64.4053,-33.11647],[-64.4053,-33.11651],[-64.4053,-33.11659],[-64.4053,-33.1166],[-64.4053,-33.11664],[-64.4053,-33.11676],[-64.4053,-33.11681],[-64.4053,-33.11682],[-64.4053,-33.11694],[-64.4053,-33.11699],[-64.4053,-33.11711],[-64.4053,-33.11711],[-64.4053,-33.11716],[-64.4053,-33.11729],[-64.4053,-33.11734],[-64.4053,-33.1174],[-64.4053,-33.11746],[-64.4053,-33.11751],[-64.4053,-33.11764],[-64.4053,-33.11769],[-64.4053,-33.11769],[-64.4053,-33.11782],[-64.4053,-33.11787],[-64.4053,-33.11798],[-64.4053,-33.11799],[-64.4053,-33.11804],[-64.4053,-33.1181],[-64.4053,-33.11817],[-64.4053,-33.11822],[-64.4053,-33.11834],[-64.4053,-33.11839],[-64.4053,-33.11839],[-64.4053,-33.11852],[-64.4053,-33.11857],[-64.4053,-33.11869],[-64.4053,-33.11874],[-64.4053,-33.11882],[-64.4053,-33.11887],[-64.4053,-33.11892],[-64.4053,-33.11904],[-64.4053,-33.1191],[-64.4053,-33.11919],[-64.4053,-33.11922],[-64.4053,-33.11927],[-64.4053,-33.11932],[-64.4053,-33.1194],[-64.4053,-33.11945],[-64.4053,-33.11954],[-64.4053,-33.11957],[-64.4053,-33.11962],[-64.4053,-33.11975],[-64.4053,-33.1198],[-64.4053,-33.11983],[-64.4053,-33.11992],[-64.4053,-33.11997],[-64.4053,-33.1201],[-64.4053,-33.12011],[-64.4053,-33.12015],[-64.4053,-33.12027],[-64.4053,-33.12033],[-64.4053,-33.1204],[-64.4053,-33.12045],[-64.4053,-33.1205],[-64.4053,-33.12063],[-64.4053,-33.12068],[-64.4053,-33.12075],[-64.4053,-33.1208],[-64.4053,-33.12093],[-64.4053,-33.12098],[-64.4053,-33.12098],[-64.4053,-33.12111],[-64.4053,-33.12116],[-64.4053,-33.12126],[-64.4053,-33.12129],[-64.4053,-33.12134],[-64.4053,-33.12147],[-64.4053,-33.12152],[-64.4053,-33.12155],[-64.4053,-33.12165],[-64.4053,-33.1217],[-64.4053,-33.12183],[-64.4053,-33.12184],[-64.4053,-33.12188],[-64.4053,-33.12202],[-64.4053,-33.12207],[-64.4053,-33.12213],[-64.4053,-33.12231],[-64.4053,-33.12236],[-64.4053,-33.12239],[-64.4053,-33.1227],[-64.40748,-33.12273],[-64.40736,-33.11276],[-64.41475,-33.11277],[-64.41471,-33.10766],[-64.41471,-33.10718],[-64.41326,-33.10723],[-64.41321,-33.10616],[-64.41213,-33.10618],[-64.41212,-33.10575],[-64.40943,-33.10586],[-64.40943,-33.1061],[-64.40838,-33.10611],[-64.40837,-33.10453],[-64.40387,-33.1046],[-64.40387,-33.10498]]]},{"fid":43,"codvec":2,"nombre":"Bo. Fénix","sector":"Sector C (Centro)","centroide":{"lng":-64.34677,"lat":-33.14322},"bbox":[-64.35595,-33.14818,-64.34037,-33.13672],"rings":[[[-64.34372,-33.13704],[-64.34371,-33.13717],[-64.34322,-33.13849],[-64.3432,-33.13856],[-64.34269,-33.13998],[-64.34269,-33.14002],[-64.34267,-33.14006],[-64.34215,-33.14148],[-64.34212,-33.14157],[-64.34172,-33.14267],[-64.34159,-33.14302],[-64.3411,-33.14437],[-64.34051,-33.146],[-64.34163,-33.14574],[-64.34167,-33.14575],[-64.34216,-33.14723],[-64.34249,-33.14833],[-64.34307,-33.1482],[-64.34398,-33.148],[-64.34418,-33.14795],[-64.34418,-33.14795],[-64.34549,-33.14765],[-64.34704,-33.14729],[-64.34704,-33.14727],[-64.34764,-33.14713],[-64.35311,-33.14591],[-64.35468,-33.14558],[-64.35591,-33.14533],[-64.35443,-33.14426],[-64.35422,-33.14411],[-64.35394,-33.14391],[-64.35301,-33.14322],[-64.35209,-33.14253],[-64.35169,-33.14213],[-64.35027,-33.14108],[-64.35027,-33.14108],[-64.34964,-33.14062],[-64.34888,-33.14001],[-64.34896,-33.13999],[-64.34771,-33.13889],[-64.34777,-33.13888],[-64.34651,-33.13778],[-64.34659,-33.13776],[-64.34537,-33.13667],[-64.34537,-33.13666],[-64.34372,-33.13704]]]},{"fid":44,"codvec":15,"nombre":"Bo. Peirano","sector":"Sector A (Alberdi)","centroide":{"lng":-64.3233,"lat":-33.14192},"bbox":[-64.33316,-33.14621,-64.31165,-33.13752],"rings":[[[-64.3217,-33.13976],[-64.3202,-33.14011],[-64.31868,-33.14047],[-64.31402,-33.14156],[-64.31174,-33.14205],[-64.31174,-33.14206],[-64.31175,-33.14426],[-64.31476,-33.14353],[-64.31628,-33.14319],[-64.3178,-33.14286],[-64.31934,-33.14251],[-64.31939,-33.1425],[-64.31964,-33.14328],[-64.31977,-33.14365],[-64.31972,-33.14366],[-64.31975,-33.1438],[-64.32017,-33.1451],[-64.32061,-33.14634],[-64.32211,-33.14598],[-64.32363,-33.14563],[-64.32515,-33.14529],[-64.32666,-33.14495],[-64.32816,-33.14462],[-64.32965,-33.14429],[-64.32923,-33.14298],[-64.32846,-33.14045],[-64.32999,-33.14011],[-64.33151,-33.13977],[-64.33151,-33.13977],[-64.33305,-33.13944],[-64.33266,-33.13817],[-64.33237,-33.1373],[-64.32779,-33.13836],[-64.32629,-33.1387],[-64.32476,-33.13907],[-64.32324,-33.13942],[-64.3217,-33.13976]]]},{"fid":45,"codvec":4,"nombre":"Bo. Leandro N. Alem","sector":"Sector A (Alberdi)","centroide":{"lng":-64.33579,"lat":-33.14502},"bbox":[-64.34284,-33.14993,-64.32919,-33.14016],"rings":[[[-64.33996,-33.14065],[-64.33846,-33.14099],[-64.3369,-33.14133],[-64.33385,-33.14201],[-64.33231,-33.14233],[-64.32923,-33.14298],[-64.32965,-33.14429],[-64.33007,-33.14559],[-64.3315,-33.15005],[-64.3397,-33.1482],[-64.34019,-33.14686],[-64.34051,-33.146],[-64.3411,-33.14437],[-64.34159,-33.14302],[-64.34172,-33.14267],[-64.34212,-33.14157],[-64.34215,-33.14148],[-64.34267,-33.14006],[-64.34269,-33.14002],[-64.34148,-33.14029],[-64.33997,-33.14064],[-64.33996,-33.14065]]]},{"fid":46,"codvec":48,"nombre":"Bo. Barrios Unidos","sector":"Sector A (Alberdi)","centroide":{"lng":-64.3268,"lat":-33.15003},"bbox":[-64.333,-33.15481,-64.32058,-33.14439],"rings":[[[-64.32061,-33.14634],[-64.32099,-33.14763],[-64.32327,-33.15478],[-64.333,-33.15481],[-64.33251,-33.15327],[-64.33228,-33.15252],[-64.33205,-33.15176],[-64.33172,-33.15073],[-64.3315,-33.15005],[-64.33007,-33.14559],[-64.32965,-33.14429],[-64.32816,-33.14462],[-64.32666,-33.14495],[-64.32515,-33.14529],[-64.32363,-33.14563],[-64.32211,-33.14598],[-64.32061,-33.14634]]]},{"fid":47,"codvec":36,"nombre":"Bo. Once de Noviembre","sector":"Sector A (Alberdi)","centroide":{"lng":-64.34178,"lat":-33.15124},"bbox":[-64.34608,-33.15474,-64.3369,-33.14579],"rings":[[[-64.34051,-33.146],[-64.34019,-33.14686],[-64.3397,-33.1482],[-64.33955,-33.14861],[-64.33939,-33.14905],[-64.33869,-33.1507],[-64.33863,-33.15083],[-64.33855,-33.15098],[-64.33799,-33.15205],[-64.33797,-33.15208],[-64.3377,-33.15257],[-64.33764,-33.15267],[-64.33701,-33.15339],[-64.34089,-33.15446],[-64.34187,-33.15473],[-64.34284,-33.15473],[-64.34442,-33.15474],[-64.34608,-33.15474],[-64.34398,-33.148],[-64.34307,-33.1482],[-64.34249,-33.14833],[-64.34216,-33.14723],[-64.34167,-33.14575],[-64.34163,-33.14574],[-64.34051,-33.146]]]},{"fid":49,"codvec":51,"nombre":"Bo. Aero Village","sector":"Sector D (Distrito Periférico)","centroide":{"lng":-64.3351,"lat":-33.16101},"bbox":[-64.34106,-33.166,-64.32759,-33.15349],"rings":[[[-64.33701,-33.15339],[-64.33691,-33.15352],[-64.33586,-33.15482],[-64.33448,-33.15631],[-64.3277,-33.16098],[-64.32778,-33.16614],[-64.34067,-33.16601],[-64.34065,-33.16445],[-64.34065,-33.16232],[-64.34064,-33.16021],[-64.34064,-33.15887],[-64.34064,-33.15779],[-64.34063,-33.15679],[-64.34061,-33.15537],[-64.34062,-33.15509],[-64.34089,-33.15446],[-64.33701,-33.15339]]]},{"fid":52,"codvec":42,"nombre":"Bo. Tiro Federal","sector":"Sector C (Centro)","centroide":{"lng":-64.37166,"lat":-33.133},"bbox":[-64.38375,-33.13847,-64.35902,-33.12758],"rings":[[[-64.37882,-33.1285],[-64.37729,-33.1289],[-64.37581,-33.12928],[-64.37581,-33.12928],[-64.37275,-33.13002],[-64.37138,-33.13036],[-64.37124,-33.13039],[-64.37124,-33.13039],[-64.36827,-33.13113],[-64.36683,-33.13149],[-64.36552,-33.13183],[-64.3629,-33.13246],[-64.36297,-33.13264],[-64.36063,-33.13318],[-64.35911,-33.13354],[-64.3598,-33.13568],[-64.35993,-33.13612],[-64.36071,-33.13872],[-64.36072,-33.13872],[-64.36301,-33.1382],[-64.36446,-33.13787],[-64.36499,-33.13775],[-64.36499,-33.13775],[-64.36486,-33.1374],[-64.36486,-33.1374],[-64.36855,-33.13646],[-64.37241,-33.13551],[-64.37326,-33.13529],[-64.37457,-33.13496],[-64.37727,-33.13428],[-64.37738,-33.13426],[-64.38051,-33.13346],[-64.38204,-33.13309],[-64.38357,-33.13273],[-64.38358,-33.12731],[-64.38334,-33.12736],[-64.3818,-33.12774],[-64.38026,-33.12813],[-64.37883,-33.1285],[-64.37882,-33.1285]]]},{"fid":53,"codvec":14,"nombre":"Bo. Parque Bimaco","sector":"Sector C (Centro)","centroide":{"lng":-64.3714,"lat":-33.13816},"bbox":[-64.37875,-33.14274,-64.36481,-33.13442],"rings":[[[-64.37727,-33.13428],[-64.37457,-33.13496],[-64.37326,-33.13529],[-64.37241,-33.13551],[-64.36855,-33.13646],[-64.36486,-33.1374],[-64.36486,-33.1374],[-64.36499,-33.13775],[-64.36499,-33.13775],[-64.36554,-33.13906],[-64.36606,-33.14032],[-64.36606,-33.14032],[-64.36653,-33.1416],[-64.36653,-33.1416],[-64.36694,-33.14287],[-64.36694,-33.14287],[-64.36823,-33.14259],[-64.36982,-33.14223],[-64.37051,-33.14207],[-64.37006,-33.14081],[-64.36984,-33.14019],[-64.37135,-33.1398],[-64.37287,-33.13945],[-64.37287,-33.13945],[-64.37333,-33.13934],[-64.37484,-33.13898],[-64.3771,-33.13847],[-64.37857,-33.13813],[-64.37868,-33.1381],[-64.37727,-33.13428]]]},{"fid":54,"codvec":52,"nombre":"Bo. Residencial Castelli I","sector":"Sector C (Centro)","centroide":{"lng":-64.37903,"lat":-33.14097},"bbox":[-64.38366,-33.14492,-64.37283,-33.13701],"rings":[[[-64.37868,-33.1381],[-64.37857,-33.13813],[-64.3771,-33.13847],[-64.37484,-33.13898],[-64.37333,-33.13934],[-64.37287,-33.13945],[-64.3731,-33.14009],[-64.37388,-33.13989],[-64.37432,-33.14119],[-64.37475,-33.14245],[-64.37519,-33.14372],[-64.37563,-33.14501],[-64.37563,-33.14501],[-64.37732,-33.14462],[-64.37914,-33.14419],[-64.38164,-33.14361],[-64.38177,-33.14358],[-64.3818,-33.14367],[-64.3818,-33.14368],[-64.38183,-33.14367],[-64.38199,-33.14363],[-64.38341,-33.14329],[-64.38352,-33.14326],[-64.38351,-33.14105],[-64.38352,-33.14077],[-64.38351,-33.14021],[-64.38351,-33.13967],[-64.38352,-33.13912],[-64.38353,-33.1383],[-64.38353,-33.13689],[-64.38341,-33.13692],[-64.38179,-33.13731],[-64.38003,-33.13777],[-64.37868,-33.1381]]]},{"fid":55,"codvec":22,"nombre":"Bo. Indio Felipe Rosas","sector":"Sector C (Centro)","centroide":{"lng":-64.36356,"lat":-33.14019},"bbox":[-64.36655,-33.14255,-64.3607,-33.1378],"rings":[[[-64.36071,-33.13872],[-64.36112,-33.14006],[-64.36152,-33.14132],[-64.36191,-33.1426],[-64.36653,-33.1416],[-64.36653,-33.1416],[-64.36606,-33.14032],[-64.36606,-33.14032],[-64.36554,-33.13906],[-64.36499,-33.13775],[-64.36446,-33.13787],[-64.36301,-33.1382],[-64.36072,-33.13872],[-64.36071,-33.13872]]]},{"fid":56,"codvec":8,"nombre":"Bo. San Eduardo","sector":"Sector C (Centro)","centroide":{"lng":-64.37273,"lat":-33.14264},"bbox":[-64.37564,-33.14584,-64.36983,-33.13948],"rings":[[[-64.37287,-33.13945],[-64.37287,-33.13945],[-64.37135,-33.1398],[-64.36984,-33.14019],[-64.37006,-33.14081],[-64.37051,-33.14207],[-64.37051,-33.14208],[-64.37053,-33.14211],[-64.37139,-33.14463],[-64.37183,-33.14588],[-64.37268,-33.14569],[-64.37407,-33.14537],[-64.37563,-33.14501],[-64.37519,-33.14372],[-64.37475,-33.14245],[-64.37432,-33.14119],[-64.37388,-33.13989],[-64.3731,-33.14009],[-64.37287,-33.13945]]]},{"fid":57,"codvec":25,"nombre":"Bo. Casanovas","sector":"Sector C (Centro)","centroide":{"lng":-64.37663,"lat":-33.14848},"bbox":[-64.3837,-33.15452,-64.36693,-33.14211],"rings":[[[-64.37051,-33.14207],[-64.36982,-33.14223],[-64.36823,-33.14259],[-64.36694,-33.14287],[-64.36733,-33.14417],[-64.36733,-33.14417],[-64.36773,-33.14545],[-64.36774,-33.14547],[-64.36813,-33.14676],[-64.36813,-33.14676],[-64.36852,-33.14804],[-64.36885,-33.14916],[-64.36909,-33.14997],[-64.36927,-33.15062],[-64.37082,-33.15029],[-64.37234,-33.14996],[-64.37382,-33.14963],[-64.37422,-33.15092],[-64.37462,-33.15221],[-64.37502,-33.15349],[-64.37519,-33.1541],[-64.37517,-33.15413],[-64.37492,-33.15444],[-64.37492,-33.15449],[-64.3825,-33.15453],[-64.38352,-33.15339],[-64.38352,-33.14871],[-64.38354,-33.14614],[-64.38353,-33.14326],[-64.38352,-33.14326],[-64.38341,-33.14329],[-64.38199,-33.14363],[-64.38183,-33.14367],[-64.3818,-33.14368],[-64.3818,-33.14367],[-64.38177,-33.14358],[-64.38164,-33.14361],[-64.37914,-33.14419],[-64.37732,-33.14462],[-64.37563,-33.14501],[-64.37563,-33.14501],[-64.37407,-33.14537],[-64.37268,-33.14569],[-64.37183,-33.14588],[-64.37139,-33.14463],[-64.37053,-33.14211],[-64.37051,-33.14208],[-64.37051,-33.14207]]]},{"fid":48,"codvec":99,"nombre":"S/D N.º 3 - Sector A Alberdi","sector":"Sector A (Alberdi)","centroide":{"lng":-64.33537,"lat":-33.15152},"bbox":[-64.3398,-33.15478,-64.33147,-33.14829],"rings":[[[-64.3397,-33.1482],[-64.3315,-33.15005],[-64.33172,-33.15073],[-64.33205,-33.15176],[-64.33228,-33.15252],[-64.33251,-33.15327],[-64.333,-33.15481],[-64.33586,-33.15482],[-64.33691,-33.15352],[-64.33701,-33.15339],[-64.33764,-33.15267],[-64.3377,-33.15257],[-64.33797,-33.15208],[-64.33799,-33.15205],[-64.33855,-33.15098],[-64.33863,-33.15083],[-64.33869,-33.1507],[-64.33939,-33.14905],[-64.33955,-33.14861],[-64.3397,-33.1482]]]},{"fid":60,"codvec":3,"nombre":"Bo. San José de Calasanz","sector":"Sector C (Centro)","centroide":{"lng":-64.35105,"lat":-33.11061},"bbox":[-64.35715,-33.1178,-64.34523,-33.10116],"rings":[[[-64.35596,-33.10407],[-64.35599,-33.10397],[-64.35633,-33.10309],[-64.35691,-33.10221],[-64.35668,-33.10104],[-64.35527,-33.10232],[-64.35429,-33.10331],[-64.35376,-33.10371],[-64.35224,-33.10466],[-64.35137,-33.10531],[-64.35087,-33.1055],[-64.34843,-33.10719],[-64.3487,-33.10793],[-64.34771,-33.10882],[-64.34747,-33.10914],[-64.3459,-33.11212],[-64.34577,-33.11235],[-64.34541,-33.11298],[-64.34585,-33.11328],[-64.3461,-33.11346],[-64.34612,-33.11348],[-64.34631,-33.11363],[-64.34642,-33.11383],[-64.34675,-33.1149],[-64.34726,-33.11654],[-64.34748,-33.11721],[-64.3477,-33.1179],[-64.34872,-33.11768],[-64.34975,-33.11745],[-64.35125,-33.11677],[-64.35146,-33.1167],[-64.35262,-33.11659],[-64.35337,-33.11532],[-64.35384,-33.11408],[-64.35392,-33.11389],[-64.35385,-33.11233],[-64.35381,-33.11141],[-64.35377,-33.11138],[-64.35425,-33.1109],[-64.35451,-33.10936],[-64.35487,-33.10793],[-64.35527,-33.10645],[-64.35581,-33.10468],[-64.3559,-33.10434],[-64.35596,-33.10407]]]},{"fid":61,"codvec":45,"nombre":"Bo. Santa Teodora","sector":"Sector C (Centro)","centroide":{"lng":-64.34529,"lat":-33.11795},"bbox":[-64.34853,-33.12161,-64.34229,-33.11301],"rings":[[[-64.34235,-33.11693],[-64.34244,-33.11708],[-64.34298,-33.11871],[-64.34248,-33.11878],[-64.34247,-33.11878],[-64.34284,-33.11997],[-64.34312,-33.12082],[-64.34341,-33.12166],[-64.34442,-33.12143],[-64.34549,-33.12119],[-64.34649,-33.12096],[-64.34751,-33.12072],[-64.34852,-33.12051],[-64.34798,-33.11882],[-64.3477,-33.1179],[-64.34748,-33.11721],[-64.34726,-33.11654],[-64.34675,-33.1149],[-64.34642,-33.11383],[-64.34631,-33.11363],[-64.34612,-33.11348],[-64.3461,-33.11346],[-64.34585,-33.11328],[-64.34541,-33.11298],[-64.34532,-33.11313],[-64.34499,-33.11393],[-64.34495,-33.11423],[-64.34467,-33.11442],[-64.34435,-33.11467],[-64.34409,-33.11515],[-64.34331,-33.11606],[-64.34235,-33.11693]]]},{"fid":62,"codvec":19,"nombre":"Bo. Santa Rosa","sector":"Sector C (Centro)","centroide":{"lng":-64.33852,"lat":-33.12277},"bbox":[-64.34323,-33.12817,-64.33181,-33.11598],"rings":[[[-64.34235,-33.11693],[-64.3423,-33.11697],[-64.34114,-33.11588],[-64.33955,-33.11678],[-64.33684,-33.11878],[-64.3365,-33.12075],[-64.33655,-33.12092],[-64.33652,-33.12094],[-64.33288,-33.12377],[-64.33258,-33.12349],[-64.332,-33.12412],[-64.33193,-33.12416],[-64.33196,-33.12425],[-64.33339,-33.12555],[-64.33384,-33.12595],[-64.33446,-33.1265],[-64.33449,-33.12671],[-64.33478,-33.12699],[-64.33533,-33.1275],[-64.3361,-33.12823],[-64.33612,-33.12824],[-64.33622,-33.1282],[-64.33717,-33.12799],[-64.34192,-33.12687],[-64.34294,-33.12664],[-64.34295,-33.12664],[-64.34265,-33.12581],[-64.34172,-33.12306],[-64.3414,-33.12211],[-64.34111,-33.12127],[-64.34312,-33.12082],[-64.34284,-33.11997],[-64.34247,-33.11878],[-64.34248,-33.11878],[-64.34298,-33.11871],[-64.34244,-33.11708],[-64.34235,-33.11693]]]},{"fid":63,"codvec":98,"nombre":"Bo. Centro","sector":"Sector C (Centro)","centroide":{"lng":-64.35094,"lat":-33.12723},"bbox":[-64.36304,-33.13683,-64.33594,-33.11677],"rings":[[[-64.35262,-33.11659],[-64.35146,-33.1167],[-64.35125,-33.11677],[-64.34975,-33.11745],[-64.34872,-33.11768],[-64.3477,-33.1179],[-64.34798,-33.11882],[-64.34852,-33.12051],[-64.34751,-33.12072],[-64.34649,-33.12096],[-64.34549,-33.12119],[-64.34442,-33.12143],[-64.34341,-33.12166],[-64.34312,-33.12082],[-64.34111,-33.12127],[-64.3414,-33.12211],[-64.34172,-33.12306],[-64.34265,-33.12581],[-64.34295,-33.12664],[-64.34386,-33.12643],[-64.34492,-33.12619],[-64.34538,-33.12758],[-64.34578,-33.12877],[-64.34674,-33.1317],[-64.34225,-33.13269],[-64.34219,-33.13264],[-64.34178,-33.13226],[-64.34129,-33.1318],[-64.34122,-33.13174],[-64.34085,-33.13139],[-64.34036,-33.13094],[-64.33947,-33.1301],[-64.33878,-33.12947],[-64.33851,-33.12922],[-64.33804,-33.12879],[-64.33753,-33.12831],[-64.33717,-33.12799],[-64.33622,-33.1282],[-64.33612,-33.12824],[-64.33679,-33.12887],[-64.33678,-33.12887],[-64.33613,-33.12934],[-64.3363,-33.12951],[-64.3363,-33.12951],[-64.33633,-33.12956],[-64.33648,-33.1297],[-64.33748,-33.13059],[-64.33751,-33.13062],[-64.33817,-33.13123],[-64.3387,-33.13173],[-64.33872,-33.13174],[-64.33917,-33.13216],[-64.33989,-33.13283],[-64.34108,-33.13396],[-64.34203,-33.13486],[-64.34262,-33.13439],[-64.34306,-33.1352],[-64.34331,-33.13574],[-64.34372,-33.13704],[-64.34537,-33.13666],[-64.34443,-33.13581],[-64.34507,-33.13566],[-64.34592,-33.13544],[-64.3466,-33.13526],[-64.34765,-33.13499],[-64.35057,-33.13423],[-64.3516,-33.13397],[-64.3526,-33.13371],[-64.35265,-33.1337],[-64.35364,-33.13344],[-64.35463,-33.13319],[-64.35663,-33.13268],[-64.35759,-33.13244],[-64.35859,-33.13217],[-64.35903,-33.13356],[-64.35904,-33.13356],[-64.35911,-33.13354],[-64.36063,-33.13318],[-64.36297,-33.13264],[-64.3629,-33.13246],[-64.3629,-33.13246],[-64.36238,-33.1312],[-64.36197,-33.13023],[-64.36196,-33.13021],[-64.3618,-33.12981],[-64.36141,-33.12882],[-64.36141,-33.12882],[-64.36077,-33.12722],[-64.36076,-33.12722],[-64.36038,-33.12632],[-64.36038,-33.12632],[-64.36037,-33.12628],[-64.36,-33.12543],[-64.36,-33.12542],[-64.35951,-33.12422],[-64.35951,-33.12421],[-64.35929,-33.12368],[-64.35891,-33.12275],[-64.35891,-33.12275],[-64.35861,-33.12202],[-64.35843,-33.12158],[-64.35819,-33.12094],[-64.35819,-33.12094],[-64.35626,-33.12142],[-64.35426,-33.1219],[-64.35318,-33.11852],[-64.35259,-33.11665],[-64.35262,-33.11659]]]},{"fid":32,"codvec":6,"nombre":"Bo. General Güemes","sector":"Sector A (Alberdi)","centroide":{"lng":-64.32621,"lat":-33.13597},"bbox":[-64.33241,-33.13965,-64.32001,-33.13232],"rings":[[[-64.32004,-33.13463],[-64.32048,-33.13593],[-64.32131,-33.13847],[-64.3217,-33.13976],[-64.32324,-33.13942],[-64.32476,-33.13907],[-64.32629,-33.1387],[-64.32779,-33.13836],[-64.33237,-33.1373],[-64.33196,-33.13603],[-64.33156,-33.13477],[-64.33115,-33.13347],[-64.33072,-33.1322],[-64.32921,-33.13255],[-64.32921,-33.13255],[-64.32845,-33.13272],[-64.3277,-33.13288],[-64.32615,-33.13323],[-64.3231,-33.13392],[-64.32156,-33.13427],[-64.32006,-33.13463],[-64.32004,-33.13463]]]},{"fid":51,"codvec":1,"nombre":"Bo. Roque Sáenz Peña","sector":"Sector C (Centro)","centroide":{"lng":-64.36954,"lat":-33.12771},"bbox":[-64.37888,-33.13228,-64.36034,-33.12346],"rings":[[[-64.377,-33.12328],[-64.37548,-33.12359],[-64.37356,-33.12398],[-64.37063,-33.12447],[-64.36925,-33.1247],[-64.36928,-33.12479],[-64.36696,-33.12517],[-64.36616,-33.12532],[-64.36471,-33.12556],[-64.36038,-33.12632],[-64.36076,-33.12722],[-64.36077,-33.12722],[-64.36141,-33.12882],[-64.36141,-33.12882],[-64.3618,-33.12981],[-64.36196,-33.13021],[-64.36197,-33.13023],[-64.36238,-33.1312],[-64.3629,-33.13246],[-64.3629,-33.13246],[-64.36552,-33.13183],[-64.36683,-33.13149],[-64.36827,-33.13113],[-64.37124,-33.13039],[-64.37124,-33.13039],[-64.37138,-33.13036],[-64.37275,-33.13002],[-64.37581,-33.12928],[-64.37581,-33.12928],[-64.37729,-33.1289],[-64.37882,-33.1285],[-64.37834,-33.12718],[-64.37749,-33.12463],[-64.377,-33.12328]]]},{"fid":4,"codvec":99,"nombre":"S/D N.º 1 - Sector A Alberdi","sector":"Sector A (Alberdi)","centroide":{"lng":-64.31676,"lat":-33.14939},"bbox":[-64.32327,-33.15478,-64.31164,-33.14258],"rings":[[[-64.31175,-33.14426],[-64.31179,-33.14915],[-64.31182,-33.15474],[-64.32327,-33.15478],[-64.32099,-33.14763],[-64.32061,-33.14634],[-64.32017,-33.1451],[-64.31975,-33.1438],[-64.31972,-33.14366],[-64.31977,-33.14365],[-64.31964,-33.14328],[-64.31939,-33.1425],[-64.31934,-33.14251],[-64.3178,-33.14286],[-64.31628,-33.14319],[-64.31476,-33.14353],[-64.31175,-33.14426]]]},{"fid":5,"codvec":99,"nombre":"S/D N.º 2 - Sector B Banda Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.34224,"lat":-33.08705},"bbox":[-64.35932,-33.09254,-64.32034,-33.07674],"rings":[[[-64.32058,-33.09242],[-64.32246,-33.09244],[-64.32428,-33.09245],[-64.32457,-33.09246],[-64.32466,-33.09246],[-64.32673,-33.09246],[-64.32717,-33.09246],[-64.32716,-33.09062],[-64.32716,-33.09053],[-64.32722,-33.08947],[-64.32724,-33.0888],[-64.32724,-33.0884],[-64.32734,-33.08839],[-64.32886,-33.08839],[-64.32998,-33.0884],[-64.33119,-33.0884],[-64.33185,-33.0884],[-64.33252,-33.08839],[-64.33318,-33.08839],[-64.33451,-33.08839],[-64.33612,-33.08839],[-64.3375,-33.08838],[-64.33882,-33.08838],[-64.34026,-33.08837],[-64.34028,-33.08949],[-64.3403,-33.09055],[-64.34034,-33.09251],[-64.34239,-33.09252],[-64.34458,-33.09253],[-64.34794,-33.09252],[-64.34828,-33.09253],[-64.34835,-33.09254],[-64.34898,-33.09253],[-64.349,-33.09253],[-64.35072,-33.0925],[-64.35122,-33.0925],[-64.35346,-33.09247],[-64.35435,-33.09246],[-64.3593,-33.09254],[-64.35932,-33.09231],[-64.35931,-33.0921],[-64.35893,-33.08966],[-64.35819,-33.0879],[-64.35731,-33.08657],[-64.35685,-33.08583],[-64.35642,-33.08471],[-64.35662,-33.08276],[-64.34139,-33.08304],[-64.34131,-33.08285],[-64.34126,-33.08267],[-64.34123,-33.0825],[-64.34122,-33.08232],[-64.34115,-33.07652],[-64.32717,-33.0873],[-64.32059,-33.08735],[-64.32058,-33.09242]]]},{"fid":10,"codvec":99,"nombre":"Bo. Las Quintas (El Bañado)","sector":"Sector D (Distrito Periférico)","centroide":{"lng":-64.37562,"lat":-33.097},"bbox":[-64.38625,-33.1038,-64.36057,-33.09255],"rings":[[[-64.3606,-33.09451],[-64.36643,-33.0969],[-64.3667,-33.09768],[-64.3673,-33.0994],[-64.36759,-33.10028],[-64.36818,-33.10197],[-64.3697,-33.10159],[-64.37061,-33.10138],[-64.37272,-33.10087],[-64.37422,-33.10053],[-64.37475,-33.10039],[-64.37485,-33.10046],[-64.37508,-33.10065],[-64.37531,-33.10084],[-64.37554,-33.10105],[-64.37572,-33.10124],[-64.37576,-33.10128],[-64.37601,-33.10156],[-64.37622,-33.10182],[-64.37639,-33.10204],[-64.37659,-33.10234],[-64.37677,-33.10263],[-64.37691,-33.10289],[-64.37703,-33.10313],[-64.37717,-33.10346],[-64.37733,-33.1039],[-64.37797,-33.10374],[-64.38312,-33.10252],[-64.38607,-33.10182],[-64.38607,-33.10182],[-64.38608,-33.09252],[-64.36117,-33.09254],[-64.36117,-33.09254],[-64.36107,-33.09289],[-64.3606,-33.09451]]]},{"fid":17,"codvec":99,"nombre":"Bo. Río Limay","sector":"Sector C (Centro)","centroide":{"lng":-64.36519,"lat":-33.1099},"bbox":[-64.37153,-33.11484,-64.3588,-33.10589],"rings":[[[-64.35884,-33.10836],[-64.35884,-33.10837],[-64.35905,-33.10901],[-64.35925,-33.10965],[-64.35949,-33.11036],[-64.35968,-33.11092],[-64.36011,-33.11219],[-64.36019,-33.1124],[-64.36048,-33.11217],[-64.36073,-33.11197],[-64.36124,-33.11155],[-64.3614,-33.11142],[-64.36144,-33.11139],[-64.36181,-33.11243],[-64.36216,-33.11347],[-64.36251,-33.11445],[-64.36268,-33.11494],[-64.36269,-33.11494],[-64.36344,-33.11422],[-64.36402,-33.114],[-64.36544,-33.11335],[-64.36687,-33.1127],[-64.36831,-33.11204],[-64.36893,-33.11176],[-64.36967,-33.11142],[-64.37015,-33.1112],[-64.37103,-33.11078],[-64.3714,-33.11061],[-64.37147,-33.11058],[-64.37115,-33.11018],[-64.37093,-33.10961],[-64.37044,-33.10832],[-64.36993,-33.10706],[-64.36946,-33.10578],[-64.36792,-33.10614],[-64.36643,-33.10653],[-64.3649,-33.10691],[-64.36271,-33.10744],[-64.35884,-33.10836]]]},{"fid":42,"codvec":99,"nombre":"Bo. San Eduardo","sector":"Sector C (Centro)","centroide":{"lng":-64.39826,"lat":-33.11351},"bbox":[-64.40548,-33.1227,-64.38589,-33.10518],"rings":[[[-64.38606,-33.1056],[-64.386,-33.1056],[-64.38598,-33.10784],[-64.38594,-33.10834],[-64.38608,-33.10829],[-64.38633,-33.10821],[-64.38649,-33.10818],[-64.38674,-33.10815],[-64.38702,-33.10813],[-64.38766,-33.10813],[-64.38845,-33.10812],[-64.38976,-33.1081],[-64.39271,-33.10802],[-64.39333,-33.11277],[-64.39602,-33.11745],[-64.3956,-33.11778],[-64.39508,-33.11812],[-64.39221,-33.11841],[-64.39216,-33.11843],[-64.39216,-33.11864],[-64.39216,-33.11878],[-64.39216,-33.11953],[-64.39216,-33.11953],[-64.39216,-33.11973],[-64.39216,-33.11994],[-64.39216,-33.12016],[-64.39216,-33.12038],[-64.39216,-33.12061],[-64.39216,-33.12083],[-64.39216,-33.12106],[-64.39216,-33.12128],[-64.39216,-33.12151],[-64.39216,-33.12175],[-64.39216,-33.12212],[-64.39216,-33.12253],[-64.39276,-33.12253],[-64.4053,-33.1227],[-64.4053,-33.12239],[-64.4053,-33.12236],[-64.4053,-33.12231],[-64.4053,-33.12213],[-64.4053,-33.12207],[-64.4053,-33.12202],[-64.4053,-33.12188],[-64.4053,-33.12184],[-64.4053,-33.12183],[-64.4053,-33.1217],[-64.4053,-33.12165],[-64.4053,-33.12155],[-64.4053,-33.12152],[-64.4053,-33.12147],[-64.4053,-33.12134],[-64.4053,-33.12129],[-64.4053,-33.12126],[-64.4053,-33.12116],[-64.4053,-33.12111],[-64.4053,-33.12098],[-64.4053,-33.12098],[-64.4053,-33.12093],[-64.4053,-33.1208],[-64.4053,-33.12075],[-64.4053,-33.12068],[-64.4053,-33.12063],[-64.4053,-33.1205],[-64.4053,-33.12045],[-64.4053,-33.1204],[-64.4053,-33.12033],[-64.4053,-33.12027],[-64.4053,-33.12015],[-64.4053,-33.12011],[-64.4053,-33.1201],[-64.4053,-33.11997],[-64.4053,-33.11992],[-64.4053,-33.11983],[-64.4053,-33.1198],[-64.4053,-33.11975],[-64.4053,-33.11962],[-64.4053,-33.11957],[-64.4053,-33.11954],[-64.4053,-33.11945],[-64.4053,-33.1194],[-64.4053,-33.11932],[-64.4053,-33.11927],[-64.4053,-33.11922],[-64.4053,-33.11919],[-64.4053,-33.1191],[-64.4053,-33.11904],[-64.4053,-33.11892],[-64.4053,-33.11887],[-64.4053,-33.11882],[-64.4053,-33.11874],[-64.4053,-33.11869],[-64.4053,-33.11857],[-64.4053,-33.11852],[-64.4053,-33.11839],[-64.4053,-33.11839],[-64.4053,-33.11834],[-64.4053,-33.11822],[-64.4053,-33.11817],[-64.4053,-33.1181],[-64.4053,-33.11804],[-64.4053,-33.11799],[-64.4053,-33.11798],[-64.4053,-33.11787],[-64.4053,-33.11782],[-64.4053,-33.11769],[-64.4053,-33.11769],[-64.4053,-33.11764],[-64.4053,-33.11751],[-64.4053,-33.11746],[-64.4053,-33.1174],[-64.4053,-33.11734],[-64.4053,-33.11729],[-64.4053,-33.11716],[-64.4053,-33.11711],[-64.4053,-33.11711],[-64.4053,-33.11699],[-64.4053,-33.11694],[-64.4053,-33.11682],[-64.4053,-33.11681],[-64.4053,-33.11676],[-64.4053,-33.11664],[-64.4053,-33.1166],[-64.4053,-33.11659],[-64.4053,-33.11651],[-64.4053,-33.11647],[-64.4053,-33.11646],[-64.4053,-33.11633],[-64.4053,-33.11628],[-64.4053,-33.11625],[-64.4053,-33.11614],[-64.4053,-33.11609],[-64.4053,-33.11596],[-64.4053,-33.11596],[-64.4053,-33.11591],[-64.4053,-33.11577],[-64.4053,-33.11572],[-64.4053,-33.11559],[-64.4053,-33.11554],[-64.4053,-33.11541],[-64.4053,-33.11539],[-64.4053,-33.11536],[-64.4053,-33.11522],[-64.4053,-33.11517],[-64.4053,-33.11516],[-64.4053,-33.11504],[-64.4053,-33.11504],[-64.4053,-33.11499],[-64.4053,-33.11486],[-64.4053,-33.11481],[-64.4053,-33.1148],[-64.4053,-33.11467],[-64.4053,-33.11462],[-64.4053,-33.11447],[-64.4053,-33.11442],[-64.4053,-33.11424],[-64.4053,-33.11424],[-64.4053,-33.11417],[-64.4053,-33.11395],[-64.4053,-33.11366],[-64.4053,-33.11354],[-64.4053,-33.11265],[-64.4053,-33.11217],[-64.4053,-33.11135],[-64.40244,-33.11168],[-64.40359,-33.10986],[-64.40373,-33.10966],[-64.405,-33.10766],[-64.40505,-33.10752],[-64.4039,-33.10756],[-64.40387,-33.10498],[-64.38606,-33.1056]]]},{"fid":50,"codvec":99,"nombre":"S/D N.º 4 - Sector C Centro","sector":"Sector C (Centro)","centroide":{"lng":-64.36707,"lat":-33.15504},"bbox":[-64.38657,-33.16672,-64.34,-33.12193],"rings":[[[-64.38163,-33.12234],[-64.38162,-33.12234],[-64.38011,-33.12265],[-64.37931,-33.12281],[-64.37855,-33.12297],[-64.377,-33.12328],[-64.37749,-33.12463],[-64.37834,-33.12718],[-64.37882,-33.1285],[-64.37883,-33.1285],[-64.38026,-33.12813],[-64.3818,-33.12774],[-64.38334,-33.12736],[-64.38358,-33.12731],[-64.38357,-33.13273],[-64.38204,-33.13309],[-64.38051,-33.13346],[-64.37738,-33.13426],[-64.37727,-33.13428],[-64.37868,-33.1381],[-64.38003,-33.13777],[-64.38179,-33.13731],[-64.38341,-33.13692],[-64.38353,-33.13689],[-64.38353,-33.1383],[-64.38352,-33.13912],[-64.38351,-33.13967],[-64.38351,-33.14021],[-64.38352,-33.14077],[-64.38351,-33.14105],[-64.38352,-33.14326],[-64.38353,-33.14326],[-64.38354,-33.14614],[-64.38352,-33.14871],[-64.38352,-33.15339],[-64.3825,-33.15453],[-64.37492,-33.15449],[-64.37045,-33.15446],[-64.36813,-33.15448],[-64.36312,-33.1507],[-64.36191,-33.14978],[-64.36169,-33.14952],[-64.36032,-33.14847],[-64.35946,-33.1478],[-64.35896,-33.14741],[-64.35797,-33.14668],[-64.35749,-33.14632],[-64.35744,-33.14629],[-64.35632,-33.14546],[-64.35785,-33.15039],[-64.35785,-33.15039],[-64.35788,-33.15039],[-64.35824,-33.15168],[-64.35833,-33.15201],[-64.3586,-33.153],[-64.35909,-33.15452],[-64.35912,-33.15562],[-64.35904,-33.156],[-64.35851,-33.15662],[-64.35739,-33.1574],[-64.3557,-33.15721],[-64.35571,-33.15742],[-64.34827,-33.15657],[-64.3483,-33.15458],[-64.34809,-33.15474],[-64.34608,-33.15474],[-64.34442,-33.15474],[-64.34284,-33.15473],[-64.34187,-33.15473],[-64.34089,-33.15446],[-64.34062,-33.15509],[-64.34061,-33.15537],[-64.34063,-33.15679],[-64.34064,-33.15779],[-64.34064,-33.15887],[-64.34064,-33.16021],[-64.34065,-33.16232],[-64.34065,-33.16445],[-64.34067,-33.16601],[-64.34073,-33.166],[-64.3556,-33.16655],[-64.36756,-33.16678],[-64.37414,-33.1668],[-64.37814,-33.16678],[-64.38428,-33.16674],[-64.38238,-33.1653],[-64.38591,-33.15704],[-64.38591,-33.15467],[-64.38591,-33.15465],[-64.38585,-33.15452],[-64.38585,-33.15365],[-64.38587,-33.15145],[-64.3859,-33.14943],[-64.38589,-33.14721],[-64.38589,-33.14606],[-64.3859,-33.14399],[-64.3859,-33.14195],[-64.3859,-33.13992],[-64.3859,-33.138],[-64.38592,-33.13574],[-64.38593,-33.1336],[-64.38591,-33.1322],[-64.38592,-33.13035],[-64.38591,-33.12848],[-64.38589,-33.12676],[-64.38589,-33.12531],[-64.38588,-33.12401],[-64.38588,-33.12282],[-64.38588,-33.12244],[-64.38587,-33.12224],[-64.38586,-33.12143],[-64.38467,-33.12169],[-64.38397,-33.12185],[-64.38319,-33.12201],[-64.38163,-33.12234]]]},{"fid":58,"codvec":99,"nombre":"S/D N.º 5 - Sector B Banda Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.32746,"lat":-33.11697},"bbox":[-64.36177,-33.13122,-64.31059,-33.09306],"rings":[[[-64.3593,-33.09254],[-64.35874,-33.09434],[-64.35852,-33.0949],[-64.35784,-33.09593],[-64.35636,-33.0984],[-64.35538,-33.09968],[-64.35317,-33.10159],[-64.35322,-33.10002],[-64.35277,-33.10028],[-64.34922,-33.10293],[-64.34799,-33.10385],[-64.34683,-33.10476],[-64.34757,-33.10553],[-64.34673,-33.1066],[-64.34665,-33.10666],[-64.34433,-33.10851],[-64.34469,-33.10883],[-64.34376,-33.11007],[-64.34248,-33.11091],[-64.34226,-33.11073],[-64.3411,-33.11167],[-64.34001,-33.11273],[-64.33895,-33.11379],[-64.33885,-33.11386],[-64.33778,-33.1147],[-64.33777,-33.11471],[-64.33657,-33.11562],[-64.33657,-33.11562],[-64.33537,-33.11655],[-64.33419,-33.11745],[-64.33378,-33.1184],[-64.33329,-33.11876],[-64.33207,-33.11968],[-64.33207,-33.11971],[-64.33088,-33.12061],[-64.32941,-33.12172],[-64.32988,-33.12215],[-64.32994,-33.12222],[-64.32944,-33.1226],[-64.32835,-33.12359],[-64.32774,-33.12303],[-64.32654,-33.12395],[-64.32532,-33.12488],[-64.32411,-33.12581],[-64.32289,-33.12669],[-64.32172,-33.12762],[-64.32129,-33.12723],[-64.32097,-33.12694],[-64.32061,-33.1266],[-64.32031,-33.12683],[-64.32032,-33.12522],[-64.32033,-33.12425],[-64.32041,-33.11815],[-64.32045,-33.11813],[-64.31899,-33.1168],[-64.31903,-33.11235],[-64.31817,-33.11155],[-64.31638,-33.10993],[-64.31613,-33.1097],[-64.31472,-33.10836],[-64.31399,-33.10768],[-64.31254,-33.10635],[-64.31175,-33.10562],[-64.31126,-33.10517],[-64.31106,-33.12142],[-64.31104,-33.12309],[-64.31191,-33.12442],[-64.31225,-33.12494],[-64.31245,-33.12553],[-64.3125,-33.12616],[-64.31256,-33.12653],[-64.31249,-33.12677],[-64.31239,-33.12698],[-64.31235,-33.12722],[-64.31237,-33.12742],[-64.31253,-33.12793],[-64.31276,-33.12828],[-64.31322,-33.12874],[-64.31361,-33.12897],[-64.31416,-33.12927],[-64.315,-33.12952],[-64.31553,-33.12975],[-64.31591,-33.12992],[-64.31636,-33.12995],[-64.31691,-33.12979],[-64.31739,-33.12966],[-64.31788,-33.12957],[-64.31844,-33.12976],[-64.321,-33.13063],[-64.32149,-33.13166],[-64.32296,-33.1313],[-64.32377,-33.13061],[-64.32515,-33.12968],[-64.32652,-33.12887],[-64.328,-33.12791],[-64.33011,-33.12592],[-64.33044,-33.12559],[-64.33119,-33.12459],[-64.33187,-33.1242],[-64.33193,-33.12416],[-64.332,-33.12412],[-64.33258,-33.12349],[-64.33288,-33.12377],[-64.33652,-33.12094],[-64.33655,-33.12092],[-64.3365,-33.12075],[-64.33684,-33.11878],[-64.33955,-33.11678],[-64.34114,-33.11588],[-64.3423,-33.11697],[-64.34235,-33.11693],[-64.34331,-33.11606],[-64.34409,-33.11515],[-64.34435,-33.11467],[-64.34467,-33.11442],[-64.34495,-33.11423],[-64.34499,-33.11393],[-64.34532,-33.11313],[-64.34541,-33.11298],[-64.34577,-33.11235],[-64.3459,-33.11212],[-64.34747,-33.10914],[-64.34771,-33.10882],[-64.3487,-33.10793],[-64.34843,-33.10719],[-64.35087,-33.1055],[-64.35137,-33.10531],[-64.35224,-33.10466],[-64.35376,-33.10371],[-64.35429,-33.10331],[-64.35527,-33.10232],[-64.35668,-33.10104],[-64.35729,-33.10047],[-64.35781,-33.10042],[-64.35993,-33.09526],[-64.3604,-33.09518],[-64.3606,-33.09451],[-64.36107,-33.09289],[-64.36117,-33.09254],[-64.3596,-33.09254],[-64.3593,-33.09254]]]},{"fid":59,"codvec":13,"nombre":"Bo. Banda Norte","sector":"Sector B (Banda Norte)","centroide":{"lng":-64.33808,"lat":-33.10695},"bbox":[-64.34677,-33.11461,-64.32928,-33.09945],"rings":[[[-64.33873,-33.09935],[-64.33752,-33.10027],[-64.33399,-33.10296],[-64.33392,-33.10301],[-64.33353,-33.10332],[-64.33141,-33.10495],[-64.33031,-33.10579],[-64.33029,-33.1058],[-64.32939,-33.1065],[-64.33023,-33.10725],[-64.33072,-33.10768],[-64.3308,-33.10775],[-64.33048,-33.108],[-64.33059,-33.1081],[-64.3319,-33.10928],[-64.33275,-33.11008],[-64.33778,-33.1147],[-64.33885,-33.11386],[-64.33895,-33.11379],[-64.34001,-33.11273],[-64.3411,-33.11167],[-64.34226,-33.11073],[-64.34248,-33.11091],[-64.34376,-33.11007],[-64.34469,-33.10883],[-64.34433,-33.10851],[-64.34665,-33.10666],[-64.3445,-33.10468],[-64.34122,-33.10163],[-64.34012,-33.10061],[-64.33902,-33.09961],[-64.33886,-33.09946],[-64.33873,-33.09935]]]}]};

  document.addEventListener('DOMContentLoaded', iniciar);
})();
