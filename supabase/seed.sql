-- =============================================================================
-- SEED DATA: SISTEMA FODEMEP RÍO CUARTO
-- 1. Catálogo Oficial de 20 Incidencias
-- 2. Usuario Inicial Inspector / Supervisor
-- 3. Instituciones Educativas Públicas Provinciales de Río Cuarto (Modalidad Común)
-- =============================================================================

-- 1. Catálogo Oficial de 20 Incidencias FODEMEP
INSERT INTO catalogo_incidencias (codigo, nombre, descripcion, jurisdiccion_default, severidad_default, orden_visual)
VALUES
  ('PLOMERIA', 'Plomería y Grifería', 'Reparación de cañerías, sanitarios, pérdidas de agua y grifería', 'FODEMEP', 'MEDIA', 1),
  ('ELECTRICIDAD', 'Electricidad e Iluminación', 'Tableros, disyuntores diferenciales, cableados, luminarias y tomas', 'FODEMEP', 'GRAVE', 2),
  ('HERRERIA', 'Herrería y Seguridad perimetral', 'Rejas, portones, barandas, cerramientos y aberturas metálicas', 'FODEMEP', 'MEDIA', 3),
  ('GAS', 'Gas y Calefacción', 'Fugas, calefactores de tiro balanceado, reguladores y pruebas de hermeticidad', 'FODEMEP', 'CRITICA', 4),
  ('DESINFECCION', 'Desinfección y Control de Plagas', 'Fumigación, desratización y control vectorial periódico', 'FODEMEP', 'MEDIA', 5),
  ('VARIOS', 'Mantenimiento General / Varios', 'Cerrajería, vidrios, ajustes menores y reparaciones generales', 'FODEMEP', 'LEVE', 6),
  ('PINTURA', 'Pintura', 'Pintura interior de aulas, galerías, fachadas y señalización de seguridad', 'FODEMEP', 'LEVE', 7),
  ('ALBANILERIA', 'Albañilería', 'Revoques, mampostería, solados, contrapisos y fisuras no estructurales', 'FODEMEP', 'MEDIA', 8),
  ('REPARACION_ARTEFACTOS', 'Reparación y Mantenimiento de Artefactos', 'Service técnico a cocinas, anafes, termotanques y calderas', 'FODEMEP', 'MEDIA', 9),
  ('FILTRACIONES', 'Filtraciones y Cubiertas', 'Impermeabilización de losas, reparación de chapas, canaletas y goteras', 'FODEMEP', 'GRAVE', 10),
  ('MATAFUEGOS', 'Matafuegos y Seguridad Siniestral', 'Recarga anual, verificación de manómetros, cartelería de evacuación', 'FODEMEP', 'GRAVE', 11),
  ('PODA_CORTE_PASTO', 'Poda y Desmalezado', 'Corte de césped en patios, desmalezado y poda de ramas con riesgo sobre techos o cableado', 'FODEMEP', 'LEVE', 12),
  ('BOMBA', 'Bomba de Agua', 'Reparación o recambio de bombas elevadoras y presurizadoras de agua', 'FODEMEP', 'GRAVE', 13),
  ('LIMPIEZA_TANQUE', 'Limpieza de Tanque / Cisterna', 'Vaciado, desinfección, cloración y sellado hermético de tanques', 'FODEMEP', 'GRAVE', 14),
  ('MOBILIARIO', 'Mobiliario Escolar', 'Reparación de bancos, sillas, pupitres, pizarrones y armarios', 'FODEMEP', 'LEVE', 15),
  ('DESAGOTE', 'Desagote de Pozos y Cámaras', 'Servicio atmosférico para desagote de pozos negros y cámaras sépticas', 'FODEMEP', 'GRAVE', 16),
  ('LIMPIEZA_DESAGUES', 'Limpieza de Desagües y Pluviales', 'Desobstrucción de pluviales, rejillas de patio, canaletas y bajadas', 'FODEMEP', 'MEDIA', 17),
  ('OBRA', 'Obra / Refacción Estructural', 'Construcción de aulas, núcleos sanitarios completos o intervención mayor', 'PROVINCIA_MAYOR', 'CRITICA', 18),
  ('CLIMATIZACION', 'Adquisición de Artefactos de Climatización', 'Ventiladores industriales de pared, aire acondicionado o calefacción central', 'FODEMEP', 'MEDIA', 19),
  ('CAMION_CISTERNA', 'Provisión por Camión Cisterna', 'Suministro de emergencia de agua potable ante corte o rotura de red', 'FODEMEP', 'CRITICA', 20)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  jurisdiccion_default = EXCLUDED.jurisdiccion_default,
  severidad_default = EXCLUDED.severidad_default;

-- 2. Usuario Supervisor / Inspector Técnico Inicial
INSERT INTO usuarios (id, email, nombre_completo, rol, telefono, activo)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'inspector.fodemep@riocuarto.gov.ar', 'Técnico de Campo FODEMEP', 'INSPECTOR_CAMPO', '358-4000000', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'coordinador.fodemep@riocuarto.gov.ar', 'Coordinador General FODEMEP Río Cuarto', 'SUPERVISOR_MUNICIPAL', '358-4000001', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Instituciones Educativas Públicas de Modalidad Común (84 instituciones)
INSERT INTO instituciones_educativas (
  id, cue, codigo_inspeccion, inspector_nombre, inspector_telefono, codigo_emp,
  nombre, modalidad, nivel, sector, ambito, turno, categoria,
  domicilio, barrio, localidad, departamento, latitud, longitud,
  telefono, email_institucional, directivo_nombre, directivo_telefono, directivo_email,
  matricula_2024, matricula_2025, alumnos_discapacidad,
  tiene_rampa, tiene_bano_adaptado, tiene_silla_ruedas, silla_ruedas_urgente,
  ultimo_indice_ies, estado_semaforo
)
VALUES
  (
    'ESC-140088000', '140088000', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640482',
    'J. DE INF. LEOPOLDO LUGONES', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Fray Quirico Porreca 1320, X5804 Río Cuarto, Córdoba', 'Las Delicias', 'Río Cuarto', 'Río Cuarto', -33.121204191028355, -64.32341873285046,
    NULL, 'EE0640482@me.cba.gov.ar32lugonesriocuarto@gmail.com', 'BORGOGNO RAQUEL BEATRIZ', '3584240973', 'raqurlbor272@hotmail.com',
    118, 114, 5,
    TRUE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140088500', '140088500', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640496',
    'J. DE INF. PROVINCIA DE SANTA CRUZ', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Uruguay 102, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.102027960363216, -64.33083549052392,
    '3584750898', 'ee0640496@me.cba.gov.ar / 31santacruzriocuarto@gmail.com', 'ARDISSONE PAMELA SUSANA', '3584287781', 'pamelasusana.ardissone@me.cba.gov.ar',
    149, 161, 6,
    TRUE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140088800', '140088800', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640465',
    'J. DE INF. MODELO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Lavalle 1410, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.132045584329376, -64.3447756463413,
    '3586027917', 'ee0640465@me.cba.gov.ar / 21modeloriocuarto@gmail.com', 'MARTIN JIMENA ANAHI', '3385403388', 'jimeanahimartin@gmail.com',
    123, 117, 9,
    TRUE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140088900', '140088900', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640509',
    'J. DE INF. DOMINGO FAUSTINO SARMIENTO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Fray Mamerto Esquiú 1035, X5806DCC Río Cuarto, Córdoba', 'Parque Bimaco', 'Río Cuarto', 'Río Cuarto', -33.13791064478887, -64.3680672770306,
    '3584628657', 'ee0640509@me.cba.gov.ar / 41.sarmiento@gmail.com', 'LOPEZ GISELA RITA', '3584224866', 'giseglop@gmail.com',
    146, 138, 3,
    TRUE, FALSE, TRUE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140089000', '140089000', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640487',
    'J. DE INF. TTE. GRAL. EDUARDO RACEDO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Arturo M. Bas 1696, X5806 Río Cuarto, Córdoba', 'Intendente Mójica', 'Río Cuarto', 'Río Cuarto', -33.1244729831662, -64.3703790077566,
    '3584221832', 'ee0640487@me.cba.gov.ar / 42racedoriocuarto@gmail.com', 'MARCON CLAUDIA EVANGELINA (Directora Suplente)', '3585601491', 'claudiamarcon39@gmail.com',
    132, 161, 3,
    TRUE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140091300', '140091300', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640504',
    'J. DE INF. MARIANO MORENO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Pedro Goyena 550, X5808FQI Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13642330928765, -64.33440023284969,
    '3584669665', 'EE0640504@me.cba.gov.ar', 'ANDINO MARIA GABRIELA', '3585603681', 'gavy.andino@gmail.com',
    136, 128, 4,
    FALSE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140091400', '140091400', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640502',
    'J. DE INF. ARZOBISPO MARIANO ANTONIO ESPINOSA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Olegario Andrade 1070, X5808 Río Cuarto, Córdoba', 'Pueblo Alberdi', 'Río Cuarto', 'Río Cuarto', -33.13738299184863, -64.32647117517719,
    '3584669662', 'EE0640502@me.cba.gov.ar', 'JAIME KARINA CECILIA', '3584312431', 'Karinacjaime@gmail.com',
    143, 124, 1,
    TRUE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140091500', '140091500', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640466',
    'J. DE INF. MERCEDES SAN MARTIN DE BALCARCE', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Entre Ríos 750, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13214576897433, -64.32998214819474,
    '3584669663', 'EE0640466@me.cba.gov.ar', 'CABRAL MARISA ANDREA', '3584119745', 'marisacabral2975@gmail.com',
    121, 122, 4,
    FALSE, FALSE, FALSE, '1',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140140300', '140140300', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640503',
    'J. DE INF. BERNARDINO RIVADAVIA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Wenceslao Tejerina & & Ruta Nacional A005, Córdoba', 'Las Quintas', 'Río Cuarto', 'Río Cuarto', -33.09591889354463, -64.36630923687619,
    NULL, 'ee0640503@me.cba.gov.ar/riocuarto35rivadavia@gmail.com', 'GRATTON JORGELINA', '3584127563', 'jor878@hotmail.com',
    156, 161, 0,
    FALSE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140140700', '140140700', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640463',
    'J. DE INF. GREGORIA MATORRAS DE SAN MARTIN', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    '9 de Julio 352, X5800 BKG, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.1188391573066, -64.35355989066436,
    '3584676827', 'EE0640463@me.cba.gov.ar', 'BONA SILVIA EDITH', '3584181155', 'silviabona@gmail.com',
    80, 71, 1,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140153400', '140153400', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640485',
    'J. DE INF. DR. ADOLFO ALSINA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Av. Gral. José Garibaldi 796, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.09669650008677, -64.34459243299435,
    NULL, 'EE0640485@me.cba.gov.ar /33alsinariocuarto@gmail.com', 'SARANDON ESTEFANIA CAROLINA', '3584901445', 'estefaniacarolina.sarandon@me.cba.gov.ar',
    152, 161, 3,
    FALSE, FALSE, FALSE, '1',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140153700', '140153700', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640475',
    'J. DE INF. REPUBLICA DEL URUGUAY', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'San Luis 348, X5800 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.11257123092749, -64.33745989066456,
    '3584908157', '34uruguayriocuarto@gmail.com', 'LOPEZ LILIAN SOLEDAD', '3584908157', 'liliansoledadlopez83@gmail.com',
    76, 79, 3,
    TRUE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140154000', '140154000', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640474',
    'J. DE INF. ALMIRANTE BROWN', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Río Juramento 641, X5806 Río Cuarto, Córdoba', 'José de Calasanz', 'Río Cuarto', 'Río Cuarto', -33.109277930315564, -64.35127530415816,
    '3584855071', 'EE0640474@me.cba.gov.ar15brownriocuarto@gmail.com', 'CASTILLO MARILEN LEONELA', '3584234206', 'casmarilen@gmail.com',
    63, 68, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140168600', '140168600', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640539',
    'J. DE INF. MANUELA GUILLERMINA MALDONADO DE PARTELLI', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana', 'Tercera',
    'CALLE PUBLICA LA ESQUINA P/TRES ACEQUIAS', 'Las Quintas', 'La Esquina', 'Río Cuarto', -33.01918314471943, -64.4389473135896,
    '3584012650', 'EE0640539@me.cba.gov.ar/13partellilaesquina@gmail.com', 'ABRAHAN MARIA FERNANDA', '3584012650', 'ferabraham11@gmail.com',
    13, 18, 0,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140177600', '140177600', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640478',
    'J. DE INF. 21 DE JULIO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Segunda',
    'Lavalle 510, X5800 Río Cuarto, Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.123089336736825, -64.341962375322,
    '3584676833', 'EE0640478@me.cba.gov.ar', 'MARINO ROMINA', '3584260874', 'rominaimarino@gmail.com',
    92, 93, 8,
    TRUE, FALSE, TRUE, '1',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140177900', '140177900', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640461',
    'J. DE INF. DAMAS MENDOCINAS', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Saint Remy 564, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.1311480515778, -64.3566256906637,
    '3584672930', 'EE0640461@me.cba.gov.ar / 11damasriocuarto@gmail.com', 'BONESSI NORA ANDREA MARIA', '3585096149', 'noritabonessi@gmail.com',
    148, 133, 7,
    TRUE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140180200', '140180200', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640511',
    'J. DE INF. CLODOMIRA VERA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Segunda',
    'Av. Pres. Perón Centro 167, X5800 Río Cuarto, Córdoba', 'General Paz', 'Río Cuarto', 'Río Cuarto', -33.1355669756262, -64.3487455041568,
    '3584672148', '24clodomirariocuarto@gmail.com', 'FERNANDEZ ROJO CLAUDIA', '3585132721', 'fernandezrojoclaudia@gmail.com',
    136, 137, 5,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140214100', '140214100', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640494',
    'J. DE INF. TTE. GRAL. JULIO A. ROCA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Vélez Sarsfield 945, X5800 Río Cuarto, Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.126749443476925, -64.33875061765065,
    '3584355081', 'EE0640494@me.cba.gov.ar /22jardinroca@gmail.com', 'DUCURON VIVIANA RUTH', '3584012771', 'vivianaducuron@hotmail.com',
    94, 92, 3,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140214400', '140214400', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640462',
    'J. DE INF. GENERAL SAN MARTIN', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Belgrano 986, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12576387147461, -64.33817763299284,
    '3584672915', 'EE0640462@me.cba.gov.ar', 'BARRERA LUCIANA MARIAM', '3584366122', 'Lucianababarrera@hotmail.com',
    32, 36, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299600', '140299600', '040503  04Región 05DGES 03Inspección', 'ERNESTO OLMEDO', '358 428-1607', 'EE0330368',
    'ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1º',
    'Constitución 1040, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12665255829525, -64.35076241949945,
    '358 4672917', 'ee0330371@me.cba.gov.ar / ifd_escuelanormal_urquiza@yahoo.com.ar', 'ALEJANDRA GASTALDELLO   REGENTE MARÍA LAURA ZÁRATE', '358 431-8073                             358 447-5251', 'alejandragastaldello@gmail.com       laurazar77@gmail.com',
    148, 133, 7,
    TRUE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140300200', '140300200', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640481',
    'J. DE INF. GRAL. JOSE MARIA PAZ', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Mitre 1325, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12881093859362, -64.3542121618282,
    '3584676820', 'EE0640481@me.cba.gov.ar / 14gralpazriocuarto01@gmail.com', 'MILANESIO ROSANA SILVINA', '3585481594', 'rosanamilanesio@gmail.com',
    247, 222, 9,
    TRUE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140301500', '140301500', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640483',
    'J. DE INF. JUSTO SOCRATES ANAYA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Alte. Brown 1245, X5808 Río Cuarto, Córdoba', 'Fénix', 'Río Cuarto', 'Río Cuarto', -33.1440795007549, -64.34402583743449,
    '3584672143', 'EE0640483@me.cba.gov.ar', 'ZARATE LAURA', '3584375251', 'laurazar77gmail.com',
    146, 174, 1,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140371600', '140371600', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640498',
    'J.DE INF. GRAL. I. H. FOTHERINGHAM', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana', 'Tercera',
    'Av. Amadeo Sabattini 3800, X5802 Río Cuarto, Córdoba', 'Las Ferias', 'Río Cuarto', 'Río Cuarto', -33.15573353282302, -64.35911626182694,
    '3584672110', 'EE0640498@me.cba.gov.ar', 'AMAYA LUCIANA ELENA', '3584197885', 'luamaya35@gmail.com',
    40, 36, 1,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140375500', '140375500', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640464',
    'J. DE INF. MANUEL BELGRANO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Primera',
    'Gral. Paz 1316, X5800ADE Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.13000838757437, -64.34959091949916,
    '3584672921', 'EE0640464@me.cba.gov.ar', 'GONZALEZ MARIA INES', '3585068422', 'marinaines2811@gmail.com',
    198, 189, 6,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140384700', '140384700', NULL, NULL, NULL, NULL,
    'jose', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'No especificado', 'No categorizada',
    'Estación Colonia del Carmen', 'No Aplica', 'Colonia El Carmen', 'Río Cuarto', -33.09718848867749, -64.43078970399763,
    '3584222838', NULL, NULL, NULL, 'oli_zulma@hotmail.com',
    3, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140476400', '140476400', '4029', 'Mónica Cogorno', '3584 40-0062', 'EE0640461',
    'J. DE INF. JUAN BAUTISTA ALBERDI', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Tomás Anchorena & Güemes, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13641900927841, -64.31748166182784,
    '3584672950', 'EE0640561@me.cba.gov.ar', 'SEIMANDI LAURA CECILIA', '3585619616', 'lceciseimandi@hotmail.com',
    93, 92, 2,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140476600', '140476600', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640563',
    'J. DE INF. HEBE SAN MARTIN DE DUPRAT', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Segunda',
    'Araucanos & 17 de Octubre, X5804 Río Cuarto, Córdoba', 'Jardín Norte', 'Río Cuarto', 'Río Cuarto', -33.089302619262, -64.33614874648808,
    '3584672958', 'EE0640563@me.cba.gov.ar / 37dupratriocuarto@gmail.com', 'AVILA MARIELA SOFIA', '3584306453', 'marielavila65@gmail.com',
    91, 85, 1,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140476700', '140476700', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640565',
    'J. DE INF. MAESTRO INDIO FELIPE ROSAS', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Segunda',
    'Geronimo del Barco 3041, X5802CWA Río Cuarto, Córdoba', 'Ingeniero Manuel Pizarro', 'Río Cuarto', 'Río Cuarto', -33.14784268233278, -64.36506023299182,
    '3584672955', 'EE0640565@me.cba.gov.ar/46maestroindioriocuarto@gmail.com', 'MERCAU ELENA', '3584860059', 'elenamercau@gmail.com',
    91, 87, 0,
    FALSE, FALSE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140515900', '140515900', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640577',
    'J. DE INF. MADRE TERESA DE CALCUTA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana', 'Tercera',
    'Dr. Carlos Gaudard 3480, X5806 Río Cuarto, Córdoba', 'Ciudad Nueva', 'Río Cuarto', 'Río Cuarto', -33.152266460965706, -64.3718424464849,
    '3584676843', 'EE0640577@me.cba.gov.ar/47calcutariocuarto@gmail.com', 'ZAPATA CAROLINA BELEN', '3585615756', 'carolinabzapata@gmail.com',
    67, 64, 2,
    TRUE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140542400', '140542400', '2001-01-04', 'Marisa Masuco', '3584172242', 'EE0640583',
    '10 DE JUNIO', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'Tercera',
    'Florencio Sánchez 1780, X5804 Río Cuarto, Córdoba', 'Valacco', 'Río Cuarto', 'Río Cuarto', -33.104, -64.3345,
    '3584654453', 'ee0640583@me.cba.gov.ar', 'DÁNGELO GABRIELA ALEJANDRA', '3584381130', 'gaby31dangelo@gmail.com',
    130, 122, 0,
    FALSE, TRUE, FALSE, 'No',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140581800', '140581800', NULL, NULL, NULL, NULL,
    'JARDIN MATERNAL RAYITO DE SOL-UNRC', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'No especificado', 'No categorizada',
    'Sin domicilio registrado', 'No Aplica', 'Las Higueras', 'Río Cuarto', -33.110822778151466, -64.30087052571193,
    NULL, NULL, NULL, NULL, NULL,
    104, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-149000500', '149000500', NULL, NULL, NULL, 'EE1490005',
    'J. DE INF. ROSARIO VERA PEÑALOZA', 'COMUN', 'Inicial', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'No categorizada',
    'ADA, Gral. Paz 1141, X5800 Río Cuarto, Provincia de Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12823429169027, -64.348784348335,
    '3584645757 / 3584388921', 'jardin@rec.unrc.edu.ar', 'ORDOÑEZ LUCILA', '3584857874', 'lucilaordoñez23@gmail.com',
    127, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140087900', '140087900', '412151', 'MARTA MUÑOZ', '3584206118', 'EE0640417',
    'ESCUELA 21 DE JULIO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Baigorria 552, X5800CQK Río Cuarto, Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.122797453043994, -64.3423188194998,
    '358-4672914', '21dejulioescuela@gmail.com', 'FACIOLO GABRIELA PATRICIA', '358-4300131', 'gfaciolo@gmail.com',
    433, 0, 28,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140088600', '140088600', '413123', 'ANALÍA AVARO', '3584823080', 'EE0640434',
    'ESCUELA TTE. GRAL. EDUARDO RACEDO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Trabajo y Prevision 1100, X5806 Río Cuarto, Córdoba', 'Lomitas de Oro', 'Río Cuarto', 'Río Cuarto', -33.122339764468656, -64.36958163299312,
    '3584235418', 'escuelaracedo@gmail.com', 'VELEZ, MARIA SOL', '3584235410', 'velezmarisol32@gmail.com',
    592, 0, 33,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140088700', '140088700', '413112', 'ANALÍA AVARO', '3584823080', 'EE0640326',
    'ESCUELA DOMINGO FAUSTINO SARMIENTO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Fray Mamerto Esquiú 1045, X5806 Río Cuarto, Córdoba', 'Parque Bimaco', 'Río Cuarto', 'Río Cuarto', -33.13872684930608, -64.36874376182773,
    NULL, 'escuelasarmiento4gmail.com', 'MARIA FANNY MABEL', '3586011982', 'fannymavelmaria@gmail.com',
    398, 0, 19,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140091600', '140091600', '414112', 'MILENA ANDREA GUEVARA', '358-6010199', 'EE0640515',
    'ESCUELA MARIANO MORENO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Montevideo 528, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13690416218026, -64.33425670415667,
    NULL, 'mmoreno4112@gmail.com', 'ALI  MARIA BEATRIZ', '3586013432', 'beaatriz56@gmail.com',
    319, 276, 10,
    FALSE, FALSE, TRUE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140113200', '140113200', '412112', 'MARTA MUÑOZ', '3584206118', NULL,
    'JOSE DE SAN MARTIN', 'COMUN', 'Primario, Inicial', 'PUBLICO', 'PERIFERICO', 'Mañana, Tarde', 'No categorizada',
    'RUTA 30 KM 69 COLONIA EL CARMEN', 'No Aplica', 'Colonia El Carmen', 'Río Cuarto', -33.095088238275174, -64.43162950084337,
    NULL, NULL, NULL, NULL, NULL,
    11, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140140100', '140140100', 'Cód. Nuevo 04020116    411132', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640516',
    'ESCUELA BERNARDINO RIVADAVIA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Wenceslao Tejerina Nte. 1171, X5806 Río Cuarto, Córdoba', 'Las Quintas', 'Río Cuarto', 'Río Cuarto', -33.09551108048971, -64.3661289195011,
    NULL, 'bernardinorivadaviario4@gmail.com', 'TOMASSINI LUDMILA VICTORIA', '3586009284', 'ludmi.rivadavia@gmail.com',
    303, 0, 13,
    FALSE, TRUE, FALSE, 'SI (1)',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140153500', '140153500', 'Cód. Nuevo 04020112      411112', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640337',
    'ESCUELA REPUBLICA DEL URUGUAY', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'San Luis 342, X5804GHF Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.11266894468444, -64.33752851765131,
    NULL, 'c.e.repdeluruguay@gmail.com', 'MARSO ANALIA CRISTINA', '3584010953', 'analiamarso70@gmail.com',
    333, 0, 10,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140154100', '140154100', '413125', 'ANALÍA AVARO', '3584823080', 'EE0640368',
    'ESCUELA ALMIRANTE BROWN', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Río Quinto 660, X5806 Río Cuarto, Córdoba', 'José de Calasanz', 'Río Cuarto', 'Río Cuarto', -33.10876022352248, -64.3533158771715,
    '3584849648', 'brown13125@gmail.com', 'ASTEGIANO, ADRIANA RAQUEL', '3584849648', 'adrianaastegiano@gmail.com',
    256, 0, 11,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140154200', '140154200', 'Cód. Nuevo 04020115      411131', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640439',
    'ESCUELA DOCTOR ADOLFO ALSINA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Av. Gral. José Garibaldi 740, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.09728227569255, -64.3439491934043,
    NULL, 'cedoctoradolfoalsina@gmail.com', 'CAVALLERIS LAURA ISABEL', '3584187721', 'lauracavalleris68@gmail.com',
    514, 0, 23,
    TRUE, TRUE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140176500', '140176500', '412111', 'MARTA MUÑOZ', '3584206118', 'EE0640324',
    'ESCUELA BARTOLOME MITRE', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Lavalle 1452, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.132193031204736, -64.3453561613378,
    NULL, 'mitreriocuarto@gmail.com', 'JAIME, OMAR ANTONIO', '3584029197', 'oaj1972@gmail.com',
    324, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140177700', '140177700', '412121', 'MARTA MUÑOZ', '3584206118', 'EE0640433',
    'ESCUELA PROVINCIA DE SANTA CRUZ', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Santa Fe & Uruguay, X5800 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.10305447541329, -64.33007996032234,
    '358-4751666', 'santacruzbn@gmail.com', 'BURGARELLA ALEJANDRA JUANA', '3584186729', 'creazyjuana@gmail.com',
    649, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140178000', '140178000', '413111', 'ANALÍA AVARO', '3584823080', 'EE0640325',
    'ESCUELA VELEZ SARSFIELD', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Mendoza 1502, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.13052970772379, -64.35592826454308,
    '3584300022', 'sarsfielv@gmail.com', 'BONANSEA, SILVANA MABEL', '3584300022', 'silbonansea1@gmail.com',
    503, 0, 24,
    TRUE, FALSE, TRUE, 'SI',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140194100', '140194100', '412141', 'MARTA MUÑOZ', '3584206118', 'EE0640403',
    'ESCUELA TTE. GRAL. JULIO ARGENTINO ROCA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Juan José Paso 790, X5800 Río Cuarto, Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.12637145909831, -64.33823707810845,
    '3585064579', '41escuelaroca@gmail.com', 'CEBALLOS LORENA BEATRIZ', '3585064579', 'lceballos488@gmail.com',
    246, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140203800', '140203800', 'Cód. Nuevo 04020111     411111', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640329',
    'ESCUELA MANUEL BELGRANO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Sobremonte 1333, X5800ABA Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.1298630370174, -64.35029966457712,
    NULL, 'escmanuelbelgrano@gmail.com', 'MANAVELLA  LORENA NOEMÍ', '3584848053', 'manavellalore@gmail.com',
    656, 0, 67,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140213600', '140213600', '413121', 'ANALÍA AVARO', '3584823080', 'EE0640328',
    'ESCUELA GENERAL PAZ', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Mitre 850, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12378698216998, -64.3530230357267,
    '3585094946', 'cegeneralpaz@gmail.com', 'VIENNY, ANDREA ENSI', '3585094946', 'andreavienny@gmail.com',
    642, 0, 44,
    TRUE, TRUE, TRUE, 'SI',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140213800', '140213800', 'COD. NUEVO 040204-12 (414121)', 'MILENA ANDREA GUEVARA', '358-6010199', 'EE0640331',
    'ESCUELA GENERAL SAN MARTIN', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '3° P.C.',
    'Belgrano 986, X5800 Río Cuarto, Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.12574592775277, -64.3381937221982,
    'dado de baja', 'ee0640331@me.cba.gov.ar / gralsanmartin14@gmail.com', 'MORALES HORACIO ADRIAN', '3584311312', 'horacioadrian@gmail.com',
    102, 97, 5,
    FALSE, TRUE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299600', '140299600', NULL, 'ERNESTO OLMEDO', NULL, 'EE0330371',
    'ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'No categorizada',
    'Constitución 1040, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.126607659680445, -64.35073559336206,
    NULL, NULL, NULL, NULL, NULL,
    465, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140300400', '140300400', 'Cód. Nuevo 04020114       411122', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640517',
    'ESCUELA LEOPOLDO LUGONES', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Fray Quirico Porreca 1310, X5804 Río Cuarto, Córdoba', 'Las Delicias', 'Río Cuarto', 'Río Cuarto', -33.1207239349298, -64.32319915028243,
    NULL, 'lugonesleopoldo74@gmail.com', 'CIPRIANI CLAUDIA', '3584314717', 'caludiaescuela@gmail.com',
    354, 0, 14,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140300700', '140300700', 'Cód. Nuevo 04020113      411121', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640435',
    'ESCUELA GOBERNADOR DR. AMADEO SABATTINI', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Mansilla 320, X5800 Río Cuarto, Córdoba', 'General Paz', 'Río Cuarto', 'Río Cuarto', -33.13479447978429, -64.3484126645404,
    NULL, NULL, 'LANDA RITA MARIA FABIANA', '3584900876', 'ritamarialanda@gmail.com',
    397, 0, 0,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140301200', '140301200', 'Cód. Nuevo 04020119     414122', 'ARIANA J. VIOLA', '0358-154815840', 'EE0640357',
    'ESCUELA GENERAL JUSTO SOCRATES ANAYA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Azopardo 1270, X5808 Río Cuarto, Córdoba', 'Fénix', 'Río Cuarto', 'Río Cuarto', -33.14493930348259, -64.34290606453682,
    NULL, 'anayasócrates@gmail.com', 'PALACIOS LUCIANA', '3584011211', 'rita.palacios85@gmail.com',
    479, 0, 15,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140301800', '140301800', 'Cód. Nuevo 04020219 (414111)', 'MARTA MUÑOZ', '358-6010199', 'EE0640330',
    'ESCUELA NICOLAS AVELLANEDA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Vicente López y Planes 538, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13434536817727, -64.33392596451266,
    '3585608879', 'navellaneda13@gmail.com', 'REDONDO CELINA BEATRÍZ', '3585613090', 'celinaredondo3@gmail.com',
    449, 0, 21,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140301900', '140301900', 'Cód. Nuevo 04020120      414131', 'ARIANA J. VIOLA', '358-154815840', 'EE0640456',
    'ESCUELA ARZOBISPO ANTONIO ESPINOSA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Olegario Andrade 1020, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13697120485559, -64.3254939068665,
    '3585136543', 'cearzobispo@gmail.com', 'QUIROGA MIRIAM LURDES', '3585136543', 'cordobesarc@gmail.com',
    398, 0, 12,
    TRUE, TRUE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140324200', '140324200', '412136', 'MARTA MUÑOZ', '3584206118', 'EE0640444',
    'ESCUELA MANUELA GUILLERMINA MALDONADO DE PARTELLI', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '3°PU',
    'Sin domicilio registrado', 'No Aplica', 'La Esquina', 'Río Cuarto', NULL, NULL,
    '358-4194315', 'partelli36@gmail.com', 'ENRIZ VERÓNICA DEL CARMEN', '358-4194315', 'veronicaenriz1974@gmail.com',
    44, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140348100', '140348100', '412131', 'MARTA MUÑOZ', '3584206118', 'EE0640327',
    'ESCUELA FLORENTINO AMEGHINO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    '9 de Julio 314, X5800 BKG, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.118478354742365, -64.3534799510988,
    '358-4672908', 'ameghinoescuela@gmail.com', 'DOMINGUEZ MARIANA BEATRIZ', '3584220492', 'marianadominguezrio4@gmail.com',
    339, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140371700', '140371700', '413113', 'ANALÍA AVARO', '3584823080', 'EE0640440',
    'ESCUELA GRAL. IGNACIO HAMILTON FOTHERINGHAM', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana', '1°',
    'Av. Amadeo Sabattini 3800, X5802 Río Cuarto, Córdoba', 'Las Ferias', 'Río Cuarto', 'Río Cuarto', -33.15580171776015, -64.3590514589509,
    '3584908327', 'centroe.fotheringham@gmail.com', 'CEJAS SANDRA ROSANA', '3584908327', 'cejass265@gmail.com',
    130, 0, 3,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140384700', '140384700', 'Cód. Nuevo 04020117   411133', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640421',
    'GENERAL JOSE DE SAN MARTIN', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana', '3°PU',
    'Ruta Nacional 36 km 614', 'No Aplica', 'Río Cuarto', 'Río Cuarto', NULL, NULL,
    NULL, 'escuelaespinillo70@gmail.com', 'OLIVO ZULMA DEL VALLE', '3585608071', 'oli_zulma@hotmail.com',
    7, 0, 0,
    FALSE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140468400', '140468400', '412126', 'MARTA MUÑOZ', '3584206118', 'EE0640364',
    '10 DE JUNIO', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1ª',
    'El Salvador 850, X5804 Río Cuarto, Córdoba', 'Valacco', 'Río Cuarto', 'Río Cuarto', -33.104174279195945, -64.31304613575452,
    '358-4672115', 'ce10dejunio@gmail.com', 'NOBLE PAOLA DANIELA', '3585609742', 'paolanoble1978@gmail.com',
    272, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140475200', '140475200', '413114', 'ANALÍA AVARO', '3584823080', 'EE0640560',
    'ESCUELA MAESTRO INDIO FELIPE ROSAS', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Geronimo del Barco 3075, X5802CWA Río Cuarto, Córdoba', 'Ingeniero Manuel Pizarro', 'Río Cuarto', 'Río Cuarto', -33.148254378443376, -64.36526703758999,
    '3584371416', 'maestroifrosas@gmail.com', 'VELEZ DIAZ ANALIA VANESA', '3584371416', 'vediana44@gmail.com',
    248, 0, 13,
    TRUE, FALSE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140480400', '140480400', 'Cód. Nuevo 04020118    411134', 'ARIANA J. VIOLA', '0358- 154815840', 'EE0640564',
    'ESCUELA HEBE SAN MARTIN DE DUPRAT(EX-S/N DE BOJARDIN NORTE)', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Grito de Alcorta & Araucanos, X5804 Río Cuarto, Córdoba', 'Jardín Norte', 'Río Cuarto', 'Río Cuarto', -33.0882163101053, -64.33616103576888,
    NULL, 'hebesmduprat@gmail.com', 'FONSECA ANA CRISTINA', '3584322766', 'anacfmartinez@gmail.com',
    227, 0, 14,
    TRUE, TRUE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140480700', '140480700', '040204-13 (4141-33)', 'MILENA ANDREA GUEVARA', '358-6010199', 'EE0640562',
    'ESCUELA MARIA EVA DUARTE', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Tomás Anchorena 100-198, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13550850201872, -64.31749249337106,
    '3584392138', 'ee0640562@me.cba.gov.ar / esevaduarte@gmail.com', 'GREMIGER,MARÍA ALEJANDRA', '3584392138', 'agremiger@gmail.com',
    275, 250, 0,
    TRUE, TRUE, TRUE, 'SI',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140516000', '140516000', '413115', 'ANALÍA AVARO', '3584823080', 'EE0640578',
    'ESCUELA MADRE TERESA DE CALCUTA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana', '2°',
    'Dr. Carlos Gaudard 3480, X5806 Río Cuarto, Córdoba', 'Ciudad Nueva', 'Río Cuarto', 'Río Cuarto', -33.15332964307637, -64.37202917806451,
    '3584672947', 'c.e.madreteresadecalcuta@gmail.com', 'FIORI, PATRICIA DEL VALLE', '3585176254', 'patobarrios1972@gmail.com',
    145, 0, 10,
    TRUE, TRUE, FALSE, 'NO',
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299600', '140299600', '040503 04Región 05DGES 03Inspección', 'ERNESTO OLMEDO', '358 428-1607', 'EE0330369',
    'ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA', 'COMUN', 'Primario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1º',
    'Constitución 1040, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12665255829525, -64.35076241949945,
    '358 4672917', 'ee0330371@me.cba.gov.ar / ifd_escuelanormal_urquiza@yahoo.com.ar', 'GASTALDELLO, Alejandra   REGENTE SOLIVELLAS, Cira', '358 431-8073', 'alejandragastaldello@gmail.com',
    468, 460, 0,
    TRUE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140178300', '140178300', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310553',
    'Ι.Ρ.Ε.Μ. № 128 DR. MANUEL BELGRANO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Sobremonte 1357, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.13002214531937, -64.34988043572945,
    '4676802', 'EE0310553@me.cba.gov.ar', 'SILVINA JULIA FERNANDEZ', '3584198275', 'juliatrabajo15@gmail.com',
    587, 0, 0,
    FALSE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299500', '140299500', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0320211',
    'Ι.Ρ.Ε.Μ. № 283 FRAY MAMERTO ESQUIU', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Tarde', '1°',
    'Baigorria 463, X5800CQI Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.12230473456522, -64.34291160688267,
    '4672912', 'EE0320211@me.cba.gov.ar', 'LUCAS OLIVERO', '3584188691', 'lucasmatiasolivero@hotmail.com',
    428, 0, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299502', '140299502', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310437',
    'Ι.Ρ.Ε.Μ. N° 444', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Tarde', '3°',
    'Dr. Carlos Gaudard 3480, X5806 Río Cuarto, Córdoba', 'Ciudad Nueva', 'Río Cuarto', 'Río Cuarto', -33.15335658992864, -64.37205063576532,
    '4676842', 'EE0311437@me.cba.gov.ar', 'MARIA FLORENCIA MORALES', '3584285605', 'mariafmorales10@gmail.com',
    133, 0, 1,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299600', '140299600', '(04) 05-03  04Rïo Cuarto 05DGES 03Inspección', 'ERNESTO OLMEDO', '0358-154281607', 'EE0330370',
    'ESC. NORMAL SUPERIOR JUSTO JOSE DE URQUIZA', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde, Noche', '1º',
    'Constitución 1040, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.126652584800716, -64.35073559337289,
    '358 4672917', 'ee0330370@me.cba.gov.ar / ifd_escuelanormal_urquiza@yahoo.com.ar', 'ALEJANDRA GASTALDELLO,   VICED VERÓNICA ARFENONI', '358 431-8073', 'alejandragastaldello@gmail.com',
    979, 1018, 0,
    TRUE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299700', '140299700', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310512',
    'Ι.Ρ.Ε.Μ. 95 MARIQUITA SANCHEZ DE THOMPSON', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Manco Cápac 50, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.10290992608234, -64.3351554069006,
    '4672926', 'EE0310512@me.cba.gov.ar', 'ANALIA BARBOSA', '3584029890', 'barbosaany71@gmail.com',
    933, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140299900', '140299900', 'REGION 4 ZONA 1 RIO CUARTO / JUAREZ CELMAN', 'DELIA CABALLINI', '3584672991', 'EE0310719',
    'Ι.Ρ.Ε.Μ.Υ Τ. № 203 DR. JUAN BAUTISTA DICHIARA', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1°',
    'Bolívar 335, X5800 Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.1272452048372, -64.3460035233572,
    '3584672931', 'ipem203jbd@gmail.com', 'SILVIA POMILIO', '3584 831480', NULL,
    718, 672, 33,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140301300', '140301300', NULL, 'DELIA CABALLINI', '3584672991', 'EE0310433',
    'Ι.Ρ.Ε.Τ. № 79 ING. RENATO DE MARCO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'No categorizada',
    'Leandro N. Alem 1735, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.15145229795483, -64.34175100875747,
    NULL, 'ipem79@yahoo.com.ar', 'MARTINO CLAUDIO', '3585608325', NULL,
    400, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140391000', '140391000', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0320210',
    'Ι.Ρ.Ε.Μ. № 281 DR. CARLOS A. LUCERO KELLY', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana', '1°',
    'Baigorria 463, X5800CQI Río Cuarto, Córdoba', 'Centro', 'Río Cuarto', 'Río Cuarto', -33.122340676410126, -64.34299743752717,
    '4672911', 'EE0320210@me.cba.gov.ar', 'ANDREA ROSSATTO', '3584015758', 'andrearossatto@hotmail.com',
    774, 0, 1,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140400300', '140400300', NULL, 'DELIA CABALLINI', '3584672991', NULL,
    'Ι.Ρ.Ε.Τ. 259 AMBROSIO OLMOS', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde, Noche', '1',
    'Baigorria 527, X5800CQK Córdoba', 'Santa Rosa', 'Río Cuarto', 'Río Cuarto', -33.122788333476265, -64.3425360933558,
    NULL, 'ipet259direccion@gmail.com', 'CARLOS GAITAN', '3584 11-8561', NULL,
    934, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140447400', '140447400', NULL, 'DELIA CABALLINI', '3584672991', 'EE0310926',
    'Ι.Ρ.Ε.Τ. № 26 JUAN FILLOY', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', 'No categorizada',
    'Belisario Roldán 535, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.136597720158086, -64.33524819340157,
    NULL, 'ipet26gestion@gmail.com', 'LASCANO ASTRADA M. ANDREA', '3585041961', 'mariaandrealascano@gmail.com',
    508, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140447500', '140447500', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310927',
    'Ι.Ρ.Ε.Μ. 27. DR. RENE FAVALORO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '2°',
    '11 de Noviembre 1150, X5800ACW Río Cuarto, Córdoba', 'San Antonio de Padua', 'Río Cuarto', 'Río Cuarto', -33.10586434439739, -64.35596359342487,
    '4672946', 'EE0310927@me.cba.gov.ar', 'ALEJANDRO CANTON', '3584170269', 'alejandrocanton2011@gmail.com',
    335, 0, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140447600', '140447600', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310928',
    'Ι.Ρ.Ε.Μ. № 28 VILLA DE LA CONCEPCION DEL RIO CUARTO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '2°',
    'Venezuela 950, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.10836827550753, -64.31837249340965,
    '4676805', 'EE0310928@me.cba.gov.ar', 'MARIEL GONZÁLEZ', '3584115999', 'marielgonzalez1973@yahoo.com.ar',
    384, 0, 0,
    FALSE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140447700', '140447700', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310929',
    'Ι.Ρ.Ε.Μ. № 29 FELIPE GALIZIA', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '2°',
    'CERVANTES S/N, RIO CUARTO, CORDOBA', 'Las Quintas', 'Río Cuarto', 'Río Cuarto', -33.093274743096245, -64.36712153570346,
    '4676826', 'EE0310929@me.cba.gov.ar', 'MABEL EMILIANI', '3584018184', 'mabelemiliani@yahoo.com.ar',
    320, 0, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140475700', '140475700', NULL, 'DELIA CABALLINI', '3584672991', NULL,
    'Ι.Ρ.Ε.Τ. Ν° 314. LIBERTADOR GENERAL DON JOSE DE SAN MARTIN', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana', 'No categorizada',
    'Güemes 1600, X5808 Río Cuarto, Córdoba', 'Alberdi Norte', 'Río Cuarto', 'Río Cuarto', -33.13605381903504, -64.31705513571511,
    NULL, 'ipet314direccion@gmail.com', 'SOMARE LUCIANA', '3585089076', NULL,
    273, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140504700', '140504700', 'I.R. 4 RÍO CUARTO / JUÁREZ CELMAN', 'ELENA ROSSATTO', '0358-154031917', 'EE0310948',
    'Ι.Ρ.Ε.Μ. № 330 EDGARDO ROBERTO PRAMPARO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '2°',
    'Av. Amadeo Sabattini 4000, Río Cuarto, Córdoba', 'Las Ferias', 'Río Cuarto', 'Río Cuarto', -33.16001596018289, -64.35934216452424,
    '4676829', 'EE0310948@me.cba.gov.ar', 'PABLO BOCCHETTO', '3584306950', 'pabloboccetto@gmail.com',
    227, 0, 3,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140538000', '140538000', NULL, NULL, NULL, NULL,
    'Ι.Ρ.Ε.Τ. 362 JUAN ANDRES POLITANO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'No especificado', '1',
    'Pcia de la Rioja 1620, X5806 Río Cuarto, Córdoba', 'Centro / No especificado', 'Río Cuarto', 'Río Cuarto', -33.12319437807595, -64.36921635106026,
    NULL, 'ipet362jpolitano@gmail.com', 'SABINI MARIA BELEN', '3585099155', NULL,
    451, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140562400', '140562400', 'REGION 4 RIO CUARTO', 'DELIA CABALLINI', '3584672991', 'EE0311462',
    'ESCUELA EXPERIMENTAL CON ENFASIS EN TECNOLOGIAS DE LA INFORMACION Y LA COMUNICACION', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '3°',
    'Roberto Payró 970, X5804 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.09628842577719, -64.34361489338723,
    '3585093258', 'riocuarto.ds@escuelasproa.edu.ar', 'VARISCO VIRGINIA', '3585485932', 'vvarisco@escuelasproa.edu.ar',
    148, 150, 1,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140566600', '140566600', 'R4 Río Cuarto', 'DELIA CABALLINI', '3584672991', 'EE0311467',
    'ESCUELA EXPERIMENTAL CON ENFASIS EN TECNOLOGIAS DE LA INFORMACION Y LA COMUNICACION', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Tarde, Mañana', 'No categorizada',
    'General Enrique Mosconi 240, X5802 Río Cuarto, Córdoba', 'Industrial', 'Río Cuarto', 'Río Cuarto', -33.15055998362882, -64.35197652224838,
    NULL, 'riocuarto.bt@escuelasproa.edu.ar', 'COSTAMAGNA IRIS SILVANA', '3584390249', NULL,
    147, 0, 0,
    FALSE, FALSE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140577300', '140577300', 'REGION 4 ZONA 1 RIO CUARTO / JUAREZ CELMAN', 'DELIA CABALLINI', '3584672991', 'EE0311500',
    'ESCUELA SECUNDARIA DE FORMACION PROFESIONAL Nvas. Tecnologías aplicadas al Agro', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana', '3',
    'Frua Teresa 1526, X5800 Río Cuarto, Córdoba', 'Banda Norte', 'Río Cuarto', 'Río Cuarto', -33.11410030358231, -64.3140420648617,
    '3584 320154', 'EE0311500@me.cba.gov.ar', 'ZANDARÍN ANDREA CRISTINA (Coord.)', '54 9 3584 320154', 'escuelaproaagro@gmail.com',
    74, 97, 0,
    TRUE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  ),
  (
    'ESC-140538000', '140538000', 'REGION IV -DGETYFP', 'TEC Y PROF DELIA CABALLINI', '3586003210', 'EE0311393',
    'IPET 362 JUAN POLITANO', 'COMUN', 'Secundario', 'PUBLICO', 'URBANO', 'Mañana, Tarde', '1º',
    'Pcia de la Rioja 1615, X5806HXM Río Cuarto, Córdoba', 'Roque Sáenz Peña', 'Río Cuarto', 'Río Cuarto', -33.12352616403082, -64.36931606447406,
    '3584676828', 'ipem362jpolitano@gmail.com', 'SABINI MARIA BELEN', '3585099155', 'mariabelensabini@gmail.com',
    456, 400, 0,
    FALSE, TRUE, FALSE, NULL,
    100.00, 'OPTIMO'
  )
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  domicilio = EXCLUDED.domicilio,
  latitud = EXCLUDED.latitud,
  longitud = EXCLUDED.longitud,
  matricula_2024 = EXCLUDED.matricula_2024,
  matricula_2025 = EXCLUDED.matricula_2025;
