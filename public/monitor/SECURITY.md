# Seguridad — leelo una vez, son tres reglas

Un tablero es un sitio **estático**: el servidor le manda todos los archivos al
navegador de quien entra. Cualquiera puede abrir esos archivos y descargar el
JSON, el JS o el CSV **enteros**. No existe una "parte privada" del tablero.

De ahí salen las tres reglas. GitHub las revisa solo en cada cambio (verás una
tilde verde o una cruz roja), pero entenderlas es lo que evita el accidente.

---

## Regla 1 — Ninguna clave en el tablero. Nunca.

No va al repositorio, ni "un ratito para probar":

- claves de API, tokens, contraseñas
- cadenas de conexión (`postgresql://usuario:clave@servidor/base`)
- la clave `service_role` de Supabase, ni claves de Firebase, Google, etc.
- archivos `.env`, `credenciales.json`, `.pem`, `.key`

**"Pero necesito datos de una base."** Entonces la consulta se corre **antes**,
en tu computadora (con la clave en un `.env` que se queda ahí), y publicás solo
el resultado ya agregado:

```
Base de datos  →  script tuyo, en tu máquina (la clave vive acá, en .env)
               →  datos/tu-archivo   (agregado, sin personas)
               →  el tablero lo carga (fetch, <script>, lo que uses)
```

**"Es la anon key de Supabase, es pública."** Aun así, no la pongas sin
avisar al equipo: solo es segura si la base tiene las políticas (RLS) bien
puestas y expone únicamente vistas agregadas. Eso se revisa de a dos.

**Si ya subiste una clave:** dala por comprometida. Hay que **cambiarla** (no
alcanza con borrarla: queda en el historial de git) y avisar al equipo.

---

## Regla 2 — Se publica el resumen, no la fila.

No van al tablero, ni siquiera en una columna "que no se muestra":

> nombre · DNI · CUIL/CUIT · domicilio · teléfono · correo · legajo · patente ·
> expediente asociado a una persona · datos de salud, judiciales o de programas
> sociales.

Lo que sí se publica es el **dato agregado**: totales, promedios y porcentajes
por área, barrio, mes o categoría.

```
❌  una fila por expediente, con el domicilio y el titular
✅  cantidad de expedientes por barrio y por mes
```

**Cuidado con la reidentificación:** si una celda dice "Barrio X, agosto, 1 caso
de un programa social", esa persona quedó identificada aunque no figure el
nombre. Regla práctica: **si un cruce da menos de 5 casos, no se publica esa
celda** (agrupala en "otros" o ampliá el período). Un punto en un mapa **es** un
domicilio: usá polígonos por barrio, no puntos.

---

## Regla 3 — Todo desde el repo, nada desde internet.

Las librerías (como el helper de gráficos) van dentro del proyecto. No se
enlaza nada con `https://...` desde el HTML o el JS: un CDN puede caerse o
cambiar, y no controlás qué código te entrega. Todo lo que el tablero necesita
tiene que estar en `css/`, `js/` o `assets/`.

---

## Qué revisa GitHub por vos

| Chequeo | Qué evita |
|---|---|
| **gitleaks** | Claves o tokens filtrados, también en el historial de git |
| Sin recursos de internet | Un CDN caído o alterado que rompa o comprometa el tablero |
| Sin archivos de credenciales | Un `.env` o `.key` subido por error |
| Sin datos crudos ni planillas | Un Excel con personas subido sin querer |

Si algo sale en rojo, el mensaje dice qué archivo es y cómo arreglarlo. Ante la
duda, **preguntá antes de publicar**. Nadie se enoja por una pregunta; el
problema es el otro caso.
