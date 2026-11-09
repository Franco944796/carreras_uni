# ESTADO — carreras_uni

## Objetivo
Mapa interactivo de correlativas (Lic. en Informática e Ing. Aeroespacial). Sitio estático, ES modules, sin build.

## Decisiones tomadas
- Estética: oscuro neón con vidrio por defecto; respeta modo claro del sistema (`prefers-color-scheme: light`).
- Fondo de escritorio animado según carrera (`bg` en `js/data/*.js`): `circuit` (Informática) y `space` (Aeroespacial).
- Celular / táctil / "reducir movimiento": solo gradiente CSS; `js/ui/background.js` no se descarga y no hay `backdrop-filter`.
- Celular (<900px al cargar): cartel a pantalla completa que sugiere PC («Copiar/Enviar enlace» / «Continuar igualmente»); continuar se recuerda en `localStorage` (`correlativas:mobile-ok`).
- Materias con `direct: true` se aprueban directo (sin estado regular). Hoy: D1001.
- Promoción (`rules.promo: true`, hoy solo Informática): estado 3 «Promocionada» (violeta, `--pm`). Se elige con las
  correlativas regulares y alguna sin aprobar; vale como regular para cursar, no como aprobada ni para «N aprobadas».
  Pasa sola a Aprobada al aprobar sus correlativas; una Aprobada cuyas correlativas bajan vuelve a Promocionada.
  Sin fecha ni aviso de los 6 meses (decisión del usuario).
- Estado 4 «Cursando» (rosa, `--cu`) en las dos carreras: mismos requisitos que regularizar (también en directas),
  no habilita correlativas (`RANK` 0), suma «N cursando» al contador pero no a la barra.

## Hecho (2026-10-27)
- Rediseño de `css/styles.css` y encabezado de `index.html`.
- `js/ui/background.js`: canvas con pistas y pulsos (circuit) / estrellas, Saturno con anillos (C, B, A, divisiones de Cassini y Encke) y dos lunas (space); DPR máx. 1,5, parallax con el mouse.
- `js/ui/gate.js`: sugerencia de usar computadora en celular.
- Corrección #1 de `correciones.md` aplicada (engine `levels()`, menú y tablero).
- 2026-11-05 Contador de visitas junto a «Reiniciar» (`js/ui/visits.js`, `#visits` en `index.html`): un total para
  toda la web, suma 1 por carga o recarga (cambiar de carrera no recarga, no suma). Abacus:
  `abacus.jasoncameron.dev/hit/franco944796-correlativas/inicio`; en `file://` o localhost usa `/get` (solo lee). Si
  falla, no aparece. Vence a los 6 meses sin visitas. Mismo contador en el portafolio y en Trilex. Ojo: `svg` y `path`
  tienen reglas globales del mapa; el contador las anula. Probado en Firefox (escritorio, las dos carreras, celular).

- 2026-11-09 Estado «Promocionada» en Informática (`engine.js` con `RANK`, `states.js`, `board.js`, `main.js`,
  leyenda y barra en `index.html`/`styles.css`). Probado con Node (lógica) y Chromium headless (claro, oscuro, menú).

- 2026-11-09 Estado «Cursando». Probado igual que el anterior.

## Pendiente
- Nada abierto. `correciones.md` sigue con el ítem 1 escrito (ya resuelto).

## Archivos clave
- `js/main.js` (media query `fancy` decide si carga el fondo), `js/core/engine.js`, `js/ui/{board,menu,background,gate}.js`, `css/styles.css`.
- Probar: `python3 -m http.server` en esta carpeta y abrir `http://localhost:8000/?c=aeroespacial`.

## Problemas conocidos
- Hay Node y Chromium headless (`~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`); Safari no se probó.
