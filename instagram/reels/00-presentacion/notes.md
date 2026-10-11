# Reel 00 · Presentación — notas de animación

## Qué se ha construido

### Motor reutilizable `instagram/characters/riso/anim/`
- `timeline.js`: pistas de claves con curvas (`linear`, `ease-in/out/io`, `easeOutBack`, `spring`), `step` para valores discretos, `ramp`, `onTwos`/`onN`, `jitter` (vibración de reposo en dos), `seqTwos`, `stagger` y `hash01` determinista.
- `rigs.js`:
  - `GC`/`GP`: local → mundo con squash, lean, flip y rot. Con ellos se calculan siempre el asa de la taza y el tobillo, y por tanto la correa.
  - `impactSquash`, `anticipate`, `breathe`.
  - `blinkSlow` (Pausa: baja, se queda, sube despacio) y `blinkFast` (Chispa: un dibujo cerrado cada 40–75 f, en pares).
  - `runCycle`, `walkCycle`, `cycle`, `lookAt`, `mouthSwap`.
  - `latePlate` + `shiftPlate` (la plancha azul que llega tarde), `clipLayers`, `limbHalo` (reserva bajo los alambres de Chispa sobre atrezo negro).
  - Cámara (`camTransform`: paneo + empuje con ancla + temblor) y `shakeTable`.
- `props.js`: `buyButton`, `coinBlank` (sin divisa, con halo de reserva), `fallLines`, `motionLines`, `inkSplash`, `dust`, `ball`, `trafficLight`, `zebra`, `thinkDots`, `panelFrame`, `register`, `ticketGrow` (la tira se trunca, tiene final rasgado, juntas a inglete en los pliegues y el total solo aparece completo), `leashLoose`/`leashTaut`/`leashRest`, `sfxText` y `countdown(label)`.
- `captions.js`:
  - Bricolage 800 (75 %, opsz 96) sobre losas color papel (reserva en las tres planchas).
  - Sello 1,08 → 1,03 → 1,00 (también hay `pop` con overshoot).
  - Sello por segmentos: todas las losas se dibujan bajo todo el texto. Tintas mezcladas por palabra, tarjetas ancladas al mundo, contorno de reserva opcional y comprobación de la zona segura.
  - `prepare()` mide con las fuentes reales y, si una línea pasa de 840 px, baja el tamaño de 4 en 4 px. `render()` es puro.
- `texture.js`: el papel, el grano y la fibra, el mapa de desplazamiento y las motas/lavado de cada plancha se precocinan una vez a PNG con las semillas de la biblia (azul 3, rojo 21, negro 41, papel 8, fibra 13). Cada plancha los compone con `feImage`, sin `feTurbulence` por fotograma. Comparado con `riso()`, la diferencia media es ≈ 0,0003/255, es decir, el mismo aspecto. Admite `variants` para «hervir» el grano en dos, aunque aquí no se usa (ver desviaciones).
- `renderer.js` + `worker.js`:
  - Plantilla HTML única. N workers de Playwright, cada uno con una página que solo actualiza el DOM por fotograma.
  - Captura CDP en PNG rápido. Los dibujos repetidos se detectan por hash y se copian (animación en dos).
  - Codificación con ffmpeg, preview a 540 px y hoja de contactos (`contact_sheet.py`).

### Librería `riso.js` (ampliada sin cambiar nada por defecto)
- **Chispa:**
  - Poses nuevas: `golpe`, `corre_a`, `corre_b`, `frena` y `agachada`.
  - Expresión `espiral`, con dos dibujos (`spin`).
  - Parámetros `squash` (desde los pies), `sizzle` (segunda versión de los lóbulos, biblia § 9) y `blink`.
- **Pausa:**
  - Parámetro `lid`; a partir de 0,97 dibuja el arco cerrado.
  - `arms`/`mug` sobrescribibles para interpolar `sit` ↔ `sorbo` ↔ `brindis`, `steam` y `mugRot`.
  - Pose `sorbo` y vapor alterno `vapor2`.
- `resetUid()` da ids estables por fotograma; sin ellos no se podrían deduplicar los dibujos.
- **Carrusel:** se ha vuelto a renderizar `posts/00-presentacion/render.js 5 7` tras los cambios. Las PNG coinciden píxel a píxel y las SVG son idénticas byte a byte con la base renderizada antes de tocar la librería.

### Reel
- `scene.js`: `frame(t)` puro con los 8 planos, los subtítulos del SRT y la portada.
- `build.js`: `layout | frames [a-b] | stills | encode | all`. Los fotogramas van al scratchpad, nunca al repo.

## Decisiones del dueño aplicadas
- Se mantienen «¡CLAC!» (f6–19) y «¡DING!» (f810–825).
- «Chispa, no.» en azul (60 px), junto a Pausa, de f1322 a f1361: entra con el tirón y sale cuando la correa se afloja. Va sin comillas, igual que «¡Ya, ya, ya!». No coincide con ningún cambio de subtítulo (el 18 → 19 es en f1330) ni con su zona.
- Monedas sin «€».
- **Planos 5 y 7: versión principal.** No hizo falta ningún plan B.

## Desviaciones del storyboard (con motivo)
1. **Ticket (plano 5):**
   - Con 110 px de ancho no cabía «189,99 €» en horizontal a 38 px (necesita ≈ 180 px en DM Mono). Por eso la tira mide 150 px y el importe va en Bricolage 800 a 38 px (que cabe). «TOTAL» va en DM Mono a 30 px.
   - El recorrido es (900, 900) → (920, 990) → (560, 1170) → (560, 1425): mide ≈ 750 px, como pedía el storyboard. El borde del ticket sigue a 18 px del asa (485). El empuje se ancla en (560, 1363).
   - La tira lleva un filete negro de 2,5 px: el papel en reserva sobre papel no se veía.
2. **Golpe en la caja (plano 5):** con Chispa en x 610 y los puños abajo, no llegaba a las teclas. En f806–810 da un saltito, y en f808–810 el brazo derecho (vía `limbs`) aporrea el teclado mientras el izquierdo queda arriba. Las manos de `golpe` están en y local 136 (no 132) para que toquen la tapa en el plano 1.
3. **Agacharse sin hundir los pies:** el storyboard bajaba `y` con poses de piernas rectas, así que los pies atravesaban el suelo. Ahora:
   - Plano 4b: pose nueva `agachada`, con rodillas fuera y la misma `y` 1296.
   - Anticipaciones y aterrizajes (f100, 1312, 1366, 1660): misma pose con `squash` 0,86–0,9 anclado en los pies.
4. **Plano 2:**
   - El tirón de f132 tumba la percha hacia la derecha (f134–144, en dos). Si se quedaba de pie, cruzaba la etiqueta y el brazo de Chispa toda la escena.
   - «¡Ya, ya, ya!» se mide y su ancla se corre a la izquierda si hace falta para no pasar de x 930. Con la medida real queda en x 620, como pedía el storyboard.
5. **Plano 3:** el 4.º saltito en seises ya no se queda en el aire. Cierra el arco y aterriza en f384 (1199, 1217, 1235 en f372, 378, 384).
6. **Pausa `sorbo`:** la taza va en (100, 70), no en (100, 56). Así toca el borde inferior del ojo en vez de tapar medio ojo.
7. **Planos 7 y 8, Chispa delante del botón:** en x 520–580 su cuerpo pisa la tapa roja (rojo sobre rojo) y sus patas la base negra. Para escenificarla delante, lleva `halo: 8` y `limbHalo` (reserva bajo los alambres). Sus posiciones no cambian.
8. **Mirada de Pausa hacia Chispa (f1350, f1640):** se usa `look [8, 4]`. Con `flip`, la x local está invertida y el `[−8, 4]` del storyboard la hacía mirar hacia el otro lado.
9. **Sombra de la caída (f0–4 y f1678):** el storyboard la ponía en (320, 1400), pero ahí la tapa la base negra. Se dibuja sobre el borde de la tapa (y ≈ 1238) y se encoge con la altura.
10. **Pausa respira** (rig de rol: `squash` ±1,5 %, periodo 120 f, es decir, 14 ciclos exactos en 1680, así que no salta en el bucle) en sus reposos de los planos 1, 3, 4c, 7 y 8. **Chispa** parpadea rápido en los reposos con ojos abiertos (f196–228, 1384–1422, 1600–1628) y chisporrotea los lóbulos en dos.
11. **Grano:** el storyboard (§ 0) y la biblia (§ 5) piden que no hierva, así que es fijo. El motor lo admite (`texture.bake({ variants })`), pero no se usa.
12. **Losas de subtítulo:** son reserva en las tres planchas, y en papel no se ven. En «Esta es Chispa.» no hay losa: la palabra roja lleva un contorno de reserva de 12 px para leerse sobre la salpicadura, que es de su misma tinta.

## Render
RENDER_PLACEHOLDER

## Puntos débiles conocidos
- **Escala:** los personajes ocupan sobre todo la banda y 900–1450, y el tercio inferior (y > 1480) queda vacío en casi todos los planos, como manda el storyboard. En el móvil se leen, pero hay aire de sobra. Si se repite, conviene subir el suelo o el tamaño.
- **Grano en pantalla:** es fijo en pantalla, no en el mundo. En el paneo del plano 3 y en los empujes la textura no viaja con el dibujo (efecto «cristal»). Es sutil, pero se nota en el paneo.
- **Plano 5:** a 1080 px los paneles son bajos y los personajes, pequeños (s 0,85 / 0,8). Tras el empuje se ven los dos filetes de los paneles cruzando en horizontal por encima del total.
- **Plano 7:** el `lunge` volteado no lleva `lean`, porque el storyboard calculó la mano sin él. El salto se lee algo erguido. Durante el congelado la correa recta parte de detrás de Chispa.
- **Lazo al soltarse (f1654–1658):** cae por detrás de las patas de Chispa y apenas se ve.
- **Coste:** Pausa va en unos (con respiración) en casi todos los planos, así que se deduplican pocos fotogramas.
