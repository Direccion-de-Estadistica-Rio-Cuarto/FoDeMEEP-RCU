#!/usr/bin/env bash
# ============================================================================
# revisar-tablero.sh — controles automáticos del tablero.
#
# Corre local  ->  bash scripts/revisar-tablero.sh
# Corre en CI  ->  .github/workflows/ci.yml (job "reglas")
#
# Verifica los puntos marcados 🤖 en CHECKLIST.md. Lo que necesita criterio
# (👤) se repasa a mano con la guía de CHECKLIST.md.
#
# ALCANCE: solo unificación visual (header/footer iguales, design system,
# metadata, accesibilidad). NO toca seguridad ni datos — cada equipo sigue con
# su método (ver SECURITY.md del repo, que no cambió).
#
# Salida: ✗ = falla, corregir antes de publicar (exit 1)
#         ⚠ = aviso, no bloquea pero conviene mirarlo (exit 0)
# ============================================================================

AQUI="$(cd "$(dirname "$0")" && pwd)"
cd "$AQUI/.." || exit 2

# Mientras exista el archivo PLANTILLA en la raíz, esto es la plantilla sin
# instanciar: los textos de ejemplo y la metadata a medio llenar se reportan
# como aviso, no como falla. Al crear un tablero, se borra ese archivo.
modo_plantilla=0
[ -f PLANTILLA ] && modo_plantilla=1

# Páginas que NO son un tablero (andamiaje de la plantilla).
EXCEPTUADAS_RE='^guia-diseno\.html$'

# --- Colores (se apagan si la salida no es una terminal) --------------------
if [ -t 1 ]; then
  ROJO=$'\e[31m'; VERDE=$'\e[32m'; AMAR=$'\e[33m'; GRIS=$'\e[90m'; FIN=$'\e[0m'
else
  ROJO=; VERDE=; AMAR=; GRIS=; FIN=
fi

fallos=0
avisos=0

ok()      { printf '  %s✓%s %s\n' "$VERDE" "$FIN" "$1"; }
mal()     { printf '  %s✗%s %s\n' "$ROJO" "$FIN" "$1"; fallos=$((fallos + 1)); }
aviso()   { printf '  %s⚠%s %s\n' "$AMAR" "$FIN" "$1"; avisos=$((avisos + 1)); }
# Falla, salvo en la plantilla sin instanciar (ahí es solo un recordatorio).
pendiente() { if [ "$modo_plantilla" = 1 ]; then aviso "$1"; else mal "$1"; fi; }
detalle() { printf '%s\n' "$1" | sed '/^[[:space:]]*$/d;s/^/      /'; }
seccion() { printf '\n%s%s%s\n' "$GRIS" "$1" "$FIN"; }

# Filesystem, no git: una página nueva sin commitear igual tiene que cumplir.
paginas_todas() {
  find . -name '*.html' -not -path './.git/*' | sed 's|^\./||' | sort
}
paginas_tablero() {
  paginas_todas | grep -vE "$EXCEPTUADAS_RE"
}

# ===========================================================================
seccion "1. Consistencia del tablero"
# ===========================================================================

# Piezas que tienen que estar en TODA página de tablero, iguales a la plantilla.
HEADER_REQ='class="encabezado" class="logo" id="boton-tema" icono-luna icono-sol'
FOOTER_REQ='class="pie" pie-textos enlaces-paginas guia-diseno.html'

for page in $(paginas_tablero); do
  falta=""
  for tok in $HEADER_REQ; do grep -qF "$tok" "$page" || falta="$falta header:$tok"; done
  for tok in $FOOTER_REQ; do grep -qF "$tok" "$page" || falta="$falta footer:$tok"; done
  grep -q 'class="intro"' "$page" || falta="$falta seccion:.intro"
  if [ -n "$falta" ]; then
    mal "$page: header/footer/intro incompletos o modificados —$falta"
  else
    ok "$page: header, footer e intro completos y sin cambios de estructura"
  fi

  # Textos de ejemplo de la plantilla que hay que reemplazar.
  ph=$(grep -nFe 'Título del tablero' \
                -e 'Una línea que explica qué muestra este tablero' \
                -e 'Una línea que describe qué muestra este tablero' \
                -e 'Actualizá esta fecha' \
                -e 'Empezá tu tablero acá' "$page")
  if [ -n "$ph" ]; then
    pendiente "$page: quedaron textos de ejemplo de la plantilla sin reemplazar:"
    detalle "$ph"
  fi
done

if [ "$modo_plantilla" = 1 ]; then
  aviso "Existe el archivo PLANTILLA: esto es la plantilla sin instanciar. Al crear tu tablero, borralo (y así estos controles pasan a bloquear de verdad)."
fi

# ===========================================================================
seccion "2. Metadata mínima"
# ===========================================================================

for page in $(paginas_tablero); do
  meta_falta=""
  meta_pend=""

  grep -qE '<title>[^<]+</title>' "$page" || meta_falta="$meta_falta <title>"
  grep -qF '<title>Tablero — Gobierno de Río Cuarto</title>' "$page" && meta_pend="$meta_pend <title>(sigue el de la plantilla)"

  if grep -qiE '<meta[^>]+name="description"' "$page"; then
    grep -qiE '<meta[^>]+name="description"[^>]+content="[^"]{15,}"' "$page" \
      || meta_pend="$meta_pend description(vacía o muy corta)"
  else
    meta_falta="$meta_falta meta-description"
  fi

  grep -qiE '<meta[^>]+name="author"[^>]+content="[^"]{5,}"' "$page" || meta_falta="$meta_falta meta-author"

  grep -qE 'class="actualizado"|name="dcterms.modified"' "$page" || meta_falta="$meta_falta fecha-de-actualización"

  [ -n "$meta_falta" ] && mal "$page: falta metadata —$meta_falta"
  [ -n "$meta_pend" ]  && pendiente "$page: metadata a medio llenar —$meta_pend"
  [ -z "$meta_falta$meta_pend" ] && ok "$page: metadata mínima completa"
done

# ===========================================================================
seccion "3. Sistema de diseño"
# ===========================================================================

CSS_REQ="fuentes tokens base componentes iconos tablero"
JS_REQ="tema tablero"

for page in $(paginas_tablero); do
  falta=""
  for c in $CSS_REQ; do grep -q "css/$c\.css" "$page" || falta="$falta css/$c.css"; done
  for j in $JS_REQ; do grep -q "js/$j\.js" "$page" || falta="$falta js/$j.js"; done
  grep -q 'id="boton-tema"' "$page" || falta="$falta #boton-tema"
  grep -q "tablero-tema" "$page" || falta="$falta script-anti-titileo(<head>)"
  if [ -n "$falta" ]; then
    mal "$page no enlaza / no incluye:$falta"
  else
    ok "$page: design system completo (6 CSS, tema.js, tablero.js, header)"
  fi
done

if command -v shasum >/dev/null 2>&1; then
  res=$(shasum -a 256 -c scripts/sistema.sha256 2>&1)
  if printf '%s\n' "$res" | grep -qE ':[[:space:]]*(FAILED|FALL)'; then
    mal "Un archivo compartido del design system fue modificado (no se tocan):"
    detalle "$(printf '%s\n' "$res" | grep -vE ':[[:space:]]*OK$')"
    printf '      %sSi el cambio es a propósito, regenerá los hashes:%s\n' "$GRIS" "$FIN"
    printf '      shasum -a 256 css/base.css css/componentes.css css/iconos.css css/fuentes.css js/tema.js > scripts/sistema.sha256\n'
  else
    ok "Archivos compartidos (base, componentes, iconos, fuentes.css, tema.js) intactos"
  fi
else
  aviso "Sin shasum: no se pudo verificar que los archivos compartidos estén intactos"
fi

hex=$(grep -rnE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' css/tablero.css js/tablero.js 2>/dev/null \
  | grep -vE '#(fff|ffffff|000|000000)\b')
if [ -n "$hex" ]; then
  aviso "Colores hexadecimales a mano (deberían salir de css/tokens.css):"
  detalle "$hex"
else
  ok "Sin colores a mano en css/tablero.css ni js/tablero.js"
fi

vendor=$(git ls-files 'js/vendor/*' 'vendor/*' 'js/lib/*' '*.min.js' | grep -viE '/LEEME\.md$')
if [ -n "$vendor" ]; then
  aviso "Hay librerías de terceros en el repo — confirmá que el equipo las acordó (AGENTS.md §4):"
  detalle "$vendor"
else
  ok "Sin librerías de terceros vendorizadas"
fi

# ===========================================================================
seccion "4. Accesibilidad"
# ===========================================================================

sin_lang=""
for page in $(paginas_todas); do
  grep -qE '<html[^>]*\blang=' "$page" || sin_lang="$sin_lang $page"
done
[ -n "$sin_lang" ] && mal "Páginas sin lang= en <html>:$sin_lang" \
                   || ok "Todas las páginas declaran lang= en <html>"

img_sin_alt=$(grep -rnoE '<img[^>]*>' --include='*.html' --exclude-dir=.git . 2>/dev/null | grep -viE '\balt=')
if [ -n "$img_sin_alt" ]; then
  mal "Hay <img> sin atributo alt:"
  detalle "$img_sin_alt"
else
  ok "Todas las <img> tienen alt"
fi

onclick=$(grep -rnE '<(div|span)[^>]*\bonclick=' --include='*.html' --exclude-dir=.git . 2>/dev/null)
if [ -n "$onclick" ]; then
  mal "Elementos no interactivos con onclick (usá <button> o <a>):"
  detalle "$onclick"
else
  ok "Sin <div>/<span> con onclick"
fi

for page in $(paginas_todas); do
  n=$(grep -oE '<h1[ >]' "$page" | wc -l | tr -d ' ')
  [ "$n" = "1" ] || aviso "$page: tiene $n elementos <h1> (debería haber exactamente 1)"
done

# ===========================================================================
printf '\n%s────────────────────────────────────────%s\n' "$GRIS" "$FIN"
if [ "$fallos" -gt 0 ]; then
  printf '%s%d falla(s)%s y %d aviso(s). Corregí los ✗ antes de publicar.\n' \
    "$ROJO" "$fallos" "$FIN" "$avisos"
  printf 'Falta además el repaso a mano (👤 en CHECKLIST.md): consistencia\n'
  printf 'de header/footer, ODS, contraste de colores nuevos y teclado.\n'
  exit 1
elif [ "$avisos" -gt 0 ]; then
  printf '%s0 fallas, %d aviso(s).%s Mirá los ⚠ (no bloquean).\n' "$AMAR" "$avisos" "$FIN"
  printf 'Falta el repaso a mano (👤 en CHECKLIST.md; con IA, el atajo "revisar:").\n'
  exit 0
else
  printf '%sTodos los controles automáticos pasan.%s\n' "$VERDE" "$FIN"
  printf 'Falta el repaso a mano (👤 en CHECKLIST.md; con IA, el atajo "revisar:").\n'
  exit 0
fi
