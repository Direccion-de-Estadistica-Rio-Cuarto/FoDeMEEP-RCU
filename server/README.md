# FoDeMEEP Backend API & Sincronización Relacional

Servidor de API REST transaccional para la recepción, auditoría, cálculo y persistencia de relevamientos técnicos de infraestructura escolar en Río Cuarto.

---

## 📌 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/sync` | **Ingesta y sincronización transaccional** del relevamiento móvil con sellado SHA-256 |
| `GET` | `/api/v1/escuelas` | Catálogo de instituciones educativas públicas de Río Cuarto (filtro por nivel, ámbito, CUE) |
| `GET` | `/api/v1/escuelas/:id` | Detalle institucional e historial de relevamientos técnicos |
| `GET` | `/api/v1/relevamientos` | Listado consolidado de relevamientos realizados con estado de auditoría |
| `GET` | `/api/v1/relevamientos/:id` | Expediente completo (164 respuestas normalizadas, evidencias y trazabilidad) |
| `GET` | `/api/v1/kpis` | Métricas municipales en vivo (cobertura escolar, desglose FoDeMEEP vs Provincia) |
| `GET` | `/api/health` | Healthcheck para sondeo de conectividad y latencia desde la PWA |

---

## 🚀 Ejecución Local

```bash
# 1. Instalar dependencias
cd server
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar en modo desarrollo
npm run dev
```

El servidor estará activo en `http://localhost:3001`.

---

## 🐳 Despliegue con Docker

Desde la raíz del proyecto, ejecuta:

```bash
docker compose up -d
```

Esto levantará automáticamente:
1. **PostgreSQL 16** con el esquema FoDeMEEP y el padrón de escuelas cargado en el puerto `5432`.
2. **Servidor API REST** compilado en producción en el puerto `3001`.
