-- =============================================================================
-- ESQUEMA RELACIONAL POSTGRESQL / SUPABASE - SISTEMA FODEMEP RÍO CUARTO
-- Infraestructura, Relevamiento Móvil en Campo, Índices IES y Obras
-- =============================================================================

-- Extensiones recomendadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- -----------------------------------------------------------------------------

CREATE TYPE modalidad_educativa AS ENUM (
    'COMUN',
    'ADULTOS',
    'ESPECIAL',
    'ARTISTICA'
);

CREATE TYPE sector_educativo AS ENUM (
    'PUBLICO',
    'PRIVADO',
    'MUNICIPAL'
);

CREATE TYPE ambito_educativo AS ENUM (
    'URBANO',
    'RURAL',
    'PERIFERICO'
);

CREATE TYPE estado_semaforo AS ENUM (
    'CRITICO',   -- 0 a 39 puntos
    'ALERTA',    -- 40 a 59 puntos
    'ACEPTABLE', -- 60 a 79 puntos
    'OPTIMO'     -- 80 a 100 puntos
);

CREATE TYPE rol_usuario AS ENUM (
    'ADMIN_PROVINCIAL',
    'SUPERVISOR_MUNICIPAL',
    'INSPECTOR_CAMPO',
    'DIRECTIVO_ESCOLAR',
    'CONTRATISTA'
);

CREATE TYPE estado_relevamiento AS ENUM (
    'BORRADOR',
    'EN_PROCESO',
    'COMPLETADO',
    'AUDITADO'
);

CREATE TYPE calificacion_rubrica AS ENUM (
    'BUENO',
    'REGULAR',
    'MALO',
    'NO_POSEE',
    'NO_APLICA'
);

CREATE TYPE severidad_incidencia AS ENUM (
    'LEVE',
    'MEDIA',
    'GRAVE',
    'CRITICA'
);

CREATE TYPE jurisdiccion_incidencia AS ENUM (
    'FODEMEP',         -- Descentralizado municipal / Mantenimiento correctivo y preventivo
    'PROVINCIA_MAYOR', -- Infraestructura mayor provincial
    'COOPERADORA'      -- Institucional propio
);

CREATE TYPE estado_incidencia AS ENUM (
    'REPORTADA',
    'PRESUPUESTADA',
    'EN_EJECUCION',
    'RESUELTA',
    'CANCELADA'
);

-- -----------------------------------------------------------------------------
-- 2. TABLAS PRINCIPALES
-- -----------------------------------------------------------------------------

-- Instituciones Educativas Oficiales
CREATE TABLE instituciones_educativas (
    id VARCHAR(50) PRIMARY KEY,
    cue VARCHAR(20) UNIQUE,
    codigo_inspeccion VARCHAR(50),
    inspector_nombre VARCHAR(150),
    inspector_telefono VARCHAR(50),
    codigo_emp VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    modalidad modalidad_educativa NOT NULL DEFAULT 'COMUN',
    nivel VARCHAR(100) NOT NULL, -- 'Inicial', 'Primario', 'Secundario', 'Superior', etc.
    sector sector_educativo NOT NULL DEFAULT 'PUBLICO',
    ambito ambito_educativo NOT NULL DEFAULT 'URBANO',
    turno VARCHAR(100),
    categoria VARCHAR(50),
    
    -- Ubicación y contacto
    domicilio VARCHAR(255) NOT NULL,
    barrio VARCHAR(100),
    localidad VARCHAR(100) NOT NULL DEFAULT 'Río Cuarto',
    departamento VARCHAR(100) NOT NULL DEFAULT 'Río Cuarto',
    latitud NUMERIC(10, 7),
    longitud NUMERIC(10, 7),
    telefono VARCHAR(100),
    email_institucional VARCHAR(255),
    directivo_nombre VARCHAR(150),
    directivo_telefono VARCHAR(50),
    directivo_email VARCHAR(255),

    -- Matrícula y accesibilidad
    matricula_2024 INT DEFAULT 0,
    matricula_2025 INT DEFAULT 0,
    alumnos_discapacidad INT DEFAULT 0,
    tiene_rampa BOOLEAN DEFAULT FALSE,
    tiene_bano_adaptado BOOLEAN DEFAULT FALSE,
    tiene_silla_ruedas BOOLEAN DEFAULT FALSE,
    silla_ruedas_urgente VARCHAR(50),

    -- Estado del índice en tiempo real
    ultimo_indice_ies NUMERIC(5, 2) DEFAULT 100.00 CHECK (ultimo_indice_ies >= 0 AND ultimo_indice_ies <= 100),
    estado_semaforo estado_semaforo NOT NULL DEFAULT 'OPTIMO',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuarios del Sistema (Inspectores, Coordinadores FODEMEP, Directores)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'INSPECTOR_CAMPO',
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cabecera de Relevamiento Técnico a Campo (PWA Móvil)
CREATE TABLE relevamientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institucion_id VARCHAR(50) NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
    inspector_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_relevamiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado estado_relevamiento NOT NULL DEFAULT 'BORRADOR',

    -- Puntaje global y semaforización
    indice_ies_total NUMERIC(5, 2) CHECK (indice_ies_total >= 0 AND indice_ies_total <= 100),
    estado_semaforo estado_semaforo NOT NULL DEFAULT 'OPTIMO',
    bloqueo_kill_switch BOOLEAN DEFAULT FALSE,
    motivo_kill_switch TEXT,

    -- Desglose por dimensiones (0 - 100)
    indice_seguridad NUMERIC(5, 2),
    indice_habitabilidad NUMERIC(5, 2),
    indice_servicios NUMERIC(5, 2),
    indice_confort NUMERIC(5, 2),
    indice_accesibilidad NUMERIC(5, 2),
    indice_exteriores NUMERIC(5, 2),
    indice_conectividad NUMERIC(5, 2),

    observaciones_generales TEXT,
    firma_inspector TEXT,
    firma_directivo TEXT,
    sincronizado_offline BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detalle de Respuestas del Cuestionario Homogéneo (14 secciones, 166 preguntas)
CREATE TABLE respuestas_relevamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relevamiento_id UUID NOT NULL REFERENCES relevamientos(id) ON DELETE CASCADE,
    seccion_id INT NOT NULL CHECK (seccion_id BETWEEN 1 AND 14),
    pregunta_id INT NOT NULL CHECK (pregunta_id BETWEEN 1 AND 166),
    calificacion calificacion_rubrica,
    valor_texto TEXT,
    valor_numero NUMERIC(12, 2),
    valor_json JSONB,
    observacion TEXT,

    CONSTRAINT uq_relevamiento_pregunta UNIQUE (relevamiento_id, pregunta_id)
);

-- Catálogo Oficial de 20 Incidencias FODEMEP
CREATE TABLE catalogo_incidencias (
    codigo VARCHAR(50) PRIMARY KEY, -- PLOMERIA, ELECTRICIDAD, GAS, etc.
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    jurisdiccion_default jurisdiccion_incidencia NOT NULL DEFAULT 'FODEMEP',
    severidad_default severidad_incidencia NOT NULL DEFAULT 'MEDIA',
    orden_visual INT DEFAULT 0
);

-- Incidencias detectadas en campo
CREATE TABLE incidencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institucion_id VARCHAR(50) NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
    relevamiento_id UUID REFERENCES relevamientos(id) ON DELETE SET NULL,
    tipo_codigo VARCHAR(50) NOT NULL REFERENCES catalogo_incidencias(codigo),
    seccion_id INT,
    pregunta_id INT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    severidad severidad_incidencia NOT NULL DEFAULT 'MEDIA',
    jurisdiccion jurisdiccion_incidencia NOT NULL DEFAULT 'FODEMEP',
    estado estado_incidencia NOT NULL DEFAULT 'REPORTADA',
    costo_estimado NUMERIC(12, 2),
    costo_final NUMERIC(12, 2),
    fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_resolucion TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidencias Fotográficas
CREATE TABLE evidencias_fotograficas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relevamiento_id UUID NOT NULL REFERENCES relevamientos(id) ON DELETE CASCADE,
    seccion_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    incidencia_id UUID REFERENCES incidencias(id) ON DELETE SET NULL,
    url_almacenamiento TEXT NOT NULL,
    nombre_archivo VARCHAR(255),
    peso_bytes INT,
    latitud NUMERIC(10, 7),
    longitud NUMERIC(10, 7),
    es_critica BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intervenciones y Obras (Órdenes de Trabajo)
CREATE TABLE intervenciones_obra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidencia_id UUID NOT NULL REFERENCES incidencias(id) ON DELETE RESTRICT,
    institucion_id VARCHAR(50) NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
    numero_orden VARCHAR(100),
    contratista VARCHAR(255),
    monto_adjudicado NUMERIC(12, 2),
    porcentaje_avance INT DEFAULT 0 CHECK (porcentaje_avance BETWEEN 0 AND 100),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_finalizacion DATE,
    acta_recepcion_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de Evolución del Índice IES (Time-Series)
CREATE TABLE historial_indice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institucion_id VARCHAR(50) NOT NULL REFERENCES instituciones_educativas(id) ON DELETE CASCADE,
    relevamiento_id UUID REFERENCES relevamientos(id) ON DELETE SET NULL,
    incidencia_id UUID REFERENCES incidencias(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    indice_anterior NUMERIC(5, 2) NOT NULL,
    indice_nuevo NUMERIC(5, 2) NOT NULL,
    variacion NUMERIC(5, 2) NOT NULL,
    motivo_cambio VARCHAR(255) NOT NULL,
    estado_semaforo estado_semaforo NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. ÍNDICES DE ALTO RENDIMIENTO
-- -----------------------------------------------------------------------------

CREATE INDEX idx_instituciones_cue ON instituciones_educativas(cue);
CREATE INDEX idx_instituciones_nivel ON instituciones_educativas(nivel);
CREATE INDEX idx_instituciones_modalidad_sector ON instituciones_educativas(modalidad, sector);
CREATE INDEX idx_instituciones_semaforo ON instituciones_educativas(estado_semaforo);
CREATE INDEX idx_instituciones_coordenadas ON instituciones_educativas(latitud, longitud);

CREATE INDEX idx_relevamientos_institucion ON relevamientos(institucion_id);
CREATE INDEX idx_relevamientos_fecha ON relevamientos(fecha_relevamiento);
CREATE INDEX idx_relevamientos_estado ON relevamientos(estado);

CREATE INDEX idx_respuestas_relevamiento_seccion ON respuestas_relevamiento(relevamiento_id, seccion_id);
CREATE INDEX idx_incidencias_institucion ON incidencias(institucion_id);
CREATE INDEX idx_incidencias_estado ON incidencias(estado);
CREATE INDEX idx_incidencias_jurisdiccion ON incidencias(jurisdiccion);
CREATE INDEX idx_historial_institucion_fecha ON historial_indice(institucion_id, fecha DESC);

-- -----------------------------------------------------------------------------
-- 4. POLÍTICAS DE ROW LEVEL SECURITY (RLS PARA SUPABASE)
-- -----------------------------------------------------------------------------

ALTER TABLE instituciones_educativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE relevamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_relevamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervenciones_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias_fotograficas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_indice ENABLE ROW LEVEL SECURITY;

-- Lectura pública o autenticada para instituciones
CREATE POLICY "Instituciones visibles para usuarios autenticados"
    ON instituciones_educativas FOR SELECT
    TO authenticated, anon
    USING (true);

-- Relevamientos editables por inspectores y administradores
CREATE POLICY "Relevamientos accesibles por usuarios autenticados"
    ON relevamientos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
