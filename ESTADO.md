# ESTADO — carreras_uni

## Objetivo
Mapa interactivo de correlativas (Lic. en Informática e Ing. Aeroespacial). Sitio estático, ES modules, sin build.

## Decisiones tomadas
- Estética: oscuro neón con vidrio por defecto; respeta modo claro del sistema (`prefers-color-scheme: light`).
- Fondo de escritorio animado según carrera (`bg` en `js/data/*.js`): `circuit` (Informática) y `space` (Aeroespacial).
- Celular / táctil / "reducir movimiento": solo gradiente CSS; `js/ui/background.js` no se descarga y no hay `backdrop-filter`.
- Celular (<900px al cargar): cartel a pantalla completa que sugiere PC («Copiar/Enviar enlace» / «Continuar igualmente»); continuar se recuerda en `localStorage` (`correlativas:mobile-ok`).
- Materias con `direct: true` se aprueban directo (sin estado regular). Hoy: D1001.

## Hecho (2026-10-27)
- Rediseño de `css/styles.css` y encabezado de `index.html`.
- `js/ui/background.js`: canvas con pistas y pulsos (circuit) / estrellas, Saturno con anillos (C, B, A, divisiones de Cassini y Encke) y dos lunas (space); DPR máx. 1,5, parallax con el mouse.
- `js/ui/gate.js`: sugerencia de usar computadora en celular.
- Corrección #1 de `correciones.md` aplicada (engine `levels()`, menú y tablero).

## Pendiente
- Nada abierto. `correciones.md` sigue con el ítem 1 escrito (ya resuelto).

## Archivos clave
- `js/main.js` (media query `fancy` decide si carga el fondo), `js/core/engine.js`, `js/ui/{board,menu,background,gate}.js`, `css/styles.css`.
- Probar: `python3 -m http.server` en esta carpeta y abrir `http://localhost:8000/?c=aeroespacial`.

## Problemas conocidos
- No hay Node en el entorno: se verificó con Firefox headless (lógica + capturas), no en Chrome/Safari reales.
