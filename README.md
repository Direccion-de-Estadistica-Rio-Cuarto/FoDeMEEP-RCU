# FoDeMEEP · Formulario de Relevamiento de Infraestructura Escolar

> **Gobierno de Río Cuarto**  
> Secretaría de Gestión y Participación Ciudadana  
> Dirección de Estadística, Control de Calidad y Procesos  
> Programa FoDeMEEP (Fondo para la Descentralización del Mantenimiento de Edificios Escolares Provinciales)

🌐 **Acceso Web en Vivo:** [https://direccion-de-estadistica-rio-cuarto.github.io/FoDeMEEP-RCU/](https://direccion-de-estadistica-rio-cuarto.github.io/FoDeMEEP-RCU/)

---

## 📋 Descripción del Proyecto

Aplicación Web Progresiva (**PWA**) diseñada para el relevamiento técnico, ágil y estandarizado en campo de artefactos, instalaciones edilicias e infraestructura en todas las instituciones educativas públicas de Río Cuarto (inicial, primario, secundario, superior y formación profesional).

La herramienta opera bajo arquitectura **Offline-First**, permitiendo a los técnicos inspectores relevar establecimientos en zonas urbanas y rurales sin depender de conexión a internet activa, calculando en tiempo real el **Índice IES (Índice de Estado de Infraestructura Escolar)** y detectando automáticamente incidencias clasificadas según jurisdicción de intervención (FODEMEP municipal o Provincia mayor).

---

## ✨ Características Principales

- **📱 Optimización Nativa para Dispositivos Móviles (iOS / iPhone)**:
  - Diseño ergonómico adaptado a una sola mano en campo.
  - Soporte completo para `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` (notch / Dynamic Island).
  - Tipografía oficial **Google Sans Flex** y sistema de íconos unificado **Google Material Symbols & Icons**.
- **⚡ 100% Offline-First (PWA)**:
  - Service Worker (Workbox) con precaché de fuentes locales, assets gráficos y lógica de cálculo.
  - Persistencia de borradores y estados en `localStorage` con aislamiento por establecimiento.
  - Indicador dinámico de estado en línea / fuera de línea (`wifi` / `wifi_off`).
- **📊 Motor de Calificación Técnica (Índice IES 0-100)**:
  - Ponderación de 7 dimensiones: Estructura Edilicia (22%), Instalación de Gas (18%), Instalación Sanitaria (18%), Instalación Eléctrica (18%), Confort Térmico (10%), Seguridad contra Incendios (8%) y Accesibilidad Universal (6%).
  - Mecanismo de penalización severa y *Kill-Switch* ante riesgos críticos para la vida o habitabilidad escolar.
  - Catálogo normalizado de **20 tipos de incidencias técnicas** con delimitación de incumbencia FODEMEP vs Provincia.
- **📷 Evidencias Fotográficas con Compresión en Cliente**:
  - Captura directa desde la cámara del dispositivo móvil.
  - Compresión automática WebP/JPEG (< 250 KB por fotografía) para optimizar memoria local y transferencia.
- **🔍 Catálogo Escolar Completo de Río Cuarto**:
  - Padrón preinstalado con todas las escuelas públicas de modalidad común (urbanas y rurales) con CUE, nivel, matrícula, superficie, dirección y autoridades.
- **📤 Exportación y Auditoría**:
  - Resumen ejecutivo de auditoría previo al cierre.
  - Exportación de expedientes técnicos en formato estructurado JSON compatible con el sistema central.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Estilos** | Tailwind CSS v4, Variables CSS temáticas (Claro / Oscuro) |
| **Tipografía e Íconos** | Google Sans Flex, Google Material Symbols & Icons |
| **PWA & Offline** | Vite Plugin PWA, Workbox |
| **Base de Datos Relacional** | PostgreSQL / Supabase SQL & Prisma ORM Schema |

---

## 🚀 Puesta en Marcha Local

### Requisitos Previos
- Node.js 18+ o superior
- npm o pnpm

### Instalación

```bash
# 1. Clonar el repositorio
git clone git@github.com:Direccion-de-Estadistica-Rio-Cuarto/FoDeMEEP-RCU.git
cd FoDeMEEP-RCU

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/` (o en la IP de red local para probar en iPhone/Android en la misma red Wi-Fi).

### Compilación para Producción

```bash
npm run build
npm run preview
```

---

## 🗄️ Modelo de Datos y Base Relacional

El proyecto cuenta con el diseño completo del modelo relacional para PostgreSQL, Supabase y Prisma:

- **Documentación de Arquitectura**: [`ARQUITECTURA_SISTEMA_FODEMEP.md`](./ARQUITECTURA_SISTEMA_FODEMEP.md)
- **Modelo Relacional Detallado**: [`MODELO_DATOS_RELACIONAL_FODEMEP.md`](./MODELO_DATOS_RELACIONAL_FODEMEP.md)
- **Definiciones Prisma**: [`prisma/schema.prisma`](./prisma/schema.prisma)
- **Esquema y Seeds SQL**: [`supabase/schema.sql`](./supabase/schema.sql) y [`supabase/seed.sql`](./supabase/seed.sql)

---

## 🏛️ Institucional

**Municipalidad de Río Cuarto**  
Secretaría de Gestión y Participación Ciudadana  
Dirección de Estadística, Control de Calidad y Procesos  
Río Cuarto, Provincia de Córdoba, Argentina
