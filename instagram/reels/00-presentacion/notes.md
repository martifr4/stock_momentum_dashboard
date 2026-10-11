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

## Render (ronda 1, histórico)
- **Máquina:** 4 núcleos, 15 GB de RAM. 4 workers de Playwright con trozos de 24 fotogramas.
- **Texturas** (una vez, en el scratchpad): ≈ 6 s.
- **Render completo** (1680 fotogramas): **757 s** (12 min 37 s). 1480 dibujados y 200 copiados por repetición; ≈ 1,8 s por dibujo y worker, de los que ≈ 1 s son filtros de plancha.
- **Codificación + portada + hoja de contactos + preview:** ≈ 71 s.
- **Re-render parcial** de f156–229 (ajuste de la salpicadura): 16 s.
- **Fotogramas:** `/tmp/claude-0/…/scratchpad/reel00-frames/f0000–f1679.png`, fuera del repo.
- **`reel.mp4` (ffprobe):** H.264 High, yuv420p, bt709, 1080 × 1920, 30/1 fps, 1680 fotogramas, 56,000 s, **22,96 MB** (≈ 3,28 Mb/s). Sin pista de audio.
- **Reproducir:**
  ```
  node build.js layout
  node build.js frames
  node build.js encode
  ```
  o `node build.js all`. `REEL_FRAMES` / `REEL_SCRATCH` cambian las carpetas.

## Control de calidad hecho (ronda 1)
- Por plano, fotogramas clave revisados a tamaño completo y en tiras secuenciales.
- Al menos dos iteraciones por plano:
  - **1:** contactos de puños y pies con la tapa.
  - **2:** percha tumbada y sorbo.
  - **4:** holgura del balón ≈ 40 px.
  - **5:** brazo sobre la caja, «¡DING!», ticket con filete e inglete.
  - **6:** losas por segmentos.
  - **7:** halo delante del botón y quitar las comillas de «Chispa, no.».
  - **2:** salpicadura (dos veces).
- **Costura del bucle:** f1670–1679 → f0–9 revisados en una tira.
  - Chispa (321, 779) → (320, 778), mismo dibujo `hold` con `fallLines`.
  - Pausa en `sit`/`neutral`/`look [8, 6]`/`lid 0,5`; la correa en el trazado de reposo y el botón levantado.
  - Solo cambia la tarjeta de texto, como pide el storyboard.
- **Zona segura de subtítulos:** comprobada en el layout, sin ninguna línea fuera de x 60–940, y 260–1480. Ningún subtítulo ha tenido que bajar de tamaño.
- **Portada:** revisada a 150 px de ancho (recorte de cuadrícula). El título se lee y Chispa se reconoce.

## Puntos débiles conocidos
- **Escala:** los personajes ocupan sobre todo la banda y 900–1450, y el tercio inferior (y > 1480) queda vacío en casi todos los planos, como manda el storyboard. En el móvil se leen, pero hay aire de sobra. Si se repite, conviene subir el suelo o el tamaño.
- **Grano en pantalla:** es fijo en pantalla, no en el mundo. En el paneo del plano 3 y en los empujes la textura no viaja con el dibujo (efecto «cristal»). Es sutil, pero se nota en el paneo.
- **Plano 5:** a 1080 px los paneles son bajos y los personajes, pequeños (s 0,85 / 0,8). Tras el empuje se ven los dos filetes de los paneles cruzando en horizontal por encima del total.
- **Plano 7:** el `lunge` volteado no lleva `lean`, porque el storyboard calculó la mano sin él. El salto se lee algo erguido. Durante el congelado la correa recta parte de detrás de Chispa.
- **Lazo al soltarse (f1654–1658):** cae por detrás de las patas de Chispa y apenas se ve.
- **Coste:** Pausa va en unos (con respiración) en casi todos los planos, así que se deduplican pocos fotogramas.

---

## Ronda 2 — cambios (crítica 48/70)

**Restricción respetada:** `riso.js` no cambia en esta ronda (ni valores por defecto ni firmas). Todo lo nuevo va en `anim/` o en `scene.js`.

### MUST FIX
1. **Escala y composición (todo el Reel).** Suelo en y 1460. La banda 560–950 queda solo para la acción (arcos de salto, monedas, carteles).
   - **Botón (planos 1, 7 y 8, el decorado del bucle):** botón a s 1,2 (base de 432 px) centrado en x 262. Pausa a s 1,0, con `flip`, en x 742 (borde derecho ≈ 927). Chispa a s 1,05 en el plano 1 (≈ 0,65 × el ancho de Pausa) y a s 1,0 en los planos 7 y 8. La correa en reposo acaba en (380, 1486), delante de la base.
   - **Planos en solitario:** Chispa a s 1,9 en el plano 2 (la percha y la etiqueta escalan con ella) y en 4a (pop 1,75 → 2,05 → 1,95 → 1,9).
   - **4b:** viñeta en x 60–940, y 520–1460, con Chispa a s 1,8. El balón tiene r 74 y pasa ≈ 29 px por encima de la cúpula agachada.
   - **4c:** Pausa a s 1,2 sobre la acera (y 1350) y semáforo más alto.
   - **Plano 6:** Chispa a s 1,6; carteles recompuestos a su alrededor; Pausa dormida a s 0,52 en la esquina, dentro de x ≤ 930.
   - **Plano 3:** Pausa a s 1,6 y paneo de 900 px (antes 700) para que Chispa salga de cuadro.
2. **Subtítulos grandes**, con los mismos cortes y todos dentro de 840 px. No ha hecho falta bajar ningún tamaño.
   - c1 y c21: 160 px (≈ 632 y 712 px de ancho).
   - Tarjetas de dos líneas (2, 4, 7, 9, 10, 11, 13, 15, 17–20): 104 px.
   - c16: 88 px.
   - Una línea (3, 6, 8, 12, 14): 120 px.
   - «¡Ya, ya, ya!» y «Comenta ● o ●»: 120 px, con puntos de r 36.
   - @dinero_irracional: 60 px.
   - «Chispa, no.»: 96 px.
   - La parte alta de la primera línea va en y 240 (línea base = 240 + 0,74 × tamaño) y el interlineado es 1,0. El chequeo de zona segura usa ese umbral y no da ningún aviso.
3. **Espacios entre tintas** (`captions.js`): cada span se mide sin espacios en los bordes y el hueco se mide con las fuentes reales («n n» − «nn» ≈ 0,22 em). Las palabras con halo llevan además 12 px de margen. Arreglados «Pausa llega tarde.», «Pausa se entere.» y «Esta es Chispa.»; la salpicadura se aparta 26 px más a la derecha.
4. **El tirón «a un milímetro» (plano 7):**
   - Zambullida nueva: piernas atrás en horizontal, `lean −10` y brazo largo recto hacia abajo. La mano es de r 12 (solo en este plano) y la yema queda a 30 px de la tapa (y 1263). Pies a ≈ 100 px y cuerpo a ≈ 140 px por encima de la tapa, con `liftedShadow` sobre la tapa.
   - Empuje en el congelado: z 1 → 1,35 anclado en la yema (f1330–1340), que se mantiene hasta f1361 y vuelve a 1 en f1362–1378. Desaparece el segundo empuje (los personajes ya son grandes).
   - Correa tensa de 5 px con el lazo del tobillo a 1,5×.
   - Tirón de Pausa: rot +12° con 2 líneas de movimiento (f1322–1326).
   - Antes del salto (f1290–1313), Chispa camina delante de Pausa dormida (`knockFor` azul y negro) y se queda en x ≥ 625, más de 20 px a la derecha de la tapa.
5. **Pantalla partida (plano 5):**
   - Paneles en x 60–940 (A y 480–950, B y 970–1460). Chispa a s 1,1; caja en x 520–740 (`register` ahora es relativo a su cuerpo).
   - Pausa a s 1,0 y camina de x 250 a 330 (empezar en 200 la sacaba del panel B por la izquierda; manda «entera dentro del panel»).
   - Ticket: recorrido nuevo (728, 862) → (752, 960) → (860, 1050) → (710, 1160) → (710, 1420), a 27 px del asa.
   - En f990 desaparecen los marcos y la caja se funde en 10 f. Empuje a z 1,35 anclado en (500, 1340): quedan la cara de Pausa (x ≈ 216), el ticket y «TOTAL 189,99 €» (x ≈ 783).
6. **Plano 3:**
   - Pausa a s 1,6.
   - La plancha azul espera con dx +400 (medio cuerpo visible en el borde derecho).
   - La percha caída ya no se dibuja desde f330.
   - c8 va de f494 a f520 y c9 de f520 a f570 (50 f).

### ALSO DO
- **Recorte de ≈ 2,1 s** (62 f) por remapeo de tiempo. `frame(u)` convierte el fotograma de salida en fotograma del storyboard saltando los tramos f192–229 (el reposo neutro tras «Esta es Chispa.»; la tarjeta c3 dura 36 f) y f714–737 (el 2.º ciclo de puntos de 4c).
  - Ajustes de 4c para que no salte nada: la mirada se queda en [10, 4] y el paso `llega` va en f738–744.
  - Duración: 1618 f = 53,93 s. No llega a los 3 s pedidos: recortar más dejaba c3 o c11 por debajo de ≈ 1,1 s de lectura.
  - `captions.srt` se regenera desde los tiempos del storyboard con el mismo remapeo (`node build.js srt`).
- **Bucle:**
  - Los cortes tienen longitud par, así que Chispa sigue en dos.
  - La respiración de Pausa se calcula en tiempo de salida (13 ciclos exactos en 1618 f).
  - Las `fallLines` empiezan en f0. f1678 (salida 1617) es el mismo dibujo sin trazos.
- **Portada:** composición nueva (f20 a la escala nueva). `cover-grid.png` es el recorte 3:4 de 1080 × 1440 (y 240–1680) y `cover-grid-4x5.png`, el 4:5 de 1080 × 1350.

### Otros ajustes de la ronda
- En los planos 7 y 8, Chispa se queda en x 400 (antes 430) para no amontonarse con la taza levantada.
- `mugHalo`: reserva bajo la taza de Pausa cuando pisa la base del botón (plano 7).
- **Motor:** `buyButton({ s })` y `buttonCapTop()`, `register` relativo, `leashTaut(w, loopSc)`, `inkSplash({ k })` y `checkSafe({ yTop, capH })`. Todos los valores por defecto se comportan como antes.

### Puntos débiles que siguen
- En f1290–1313 Chispa tapa la cara de Pausa dormida al pasar por delante: entre la tapa y Pausa no caben las dos a esta escala.
- En los planos 7 y 8, Chispa está delante del botón (con halo) y tapa parte del rótulo «COMPRAR YA».
- La percha tumbada del plano 2 asoma en el borde derecho hasta f329.
- El grano sigue fijo en pantalla (efecto «cristal» en el paneo y los empujes).

### Render (ronda 2)
- **Render completo** (1618 fotogramas, 4 workers): **857 s** (14 min 17 s), con 1439 dibujos y 179 copias.
- **Re-render** de la salida 988–1617 (planos 6–8, tras las correcciones de capas): **382 s**.
- **Codificación + portada + cuadrículas + hoja + preview + SRT:** 93 s.
- **`reel.mp4` (ffprobe):** H.264 High, yuv420p, 1080 × 1920, 30/1 fps, 1618 fotogramas, **53,933 s**, **29,01 MB** (≈ 4,30 Mb/s). Solo hay una pista de vídeo, sin audio: la voz en off se añade aparte.
- **Carrusel:** `posts/00-presentacion/render.js 5 7` sigue saliendo idéntico (PNG píxel a píxel, SVG byte a byte). Los archivos de las slides se han restaurado a su estado previo.

### Control de calidad (ronda 2)
- **Plano a plano:** tiras de fotogramas clave revisadas a tamaño completo y a 360 px de ancho (prueba de móvil). Los subtítulos se leen a 360 px y los espacios entre tintas son correctos.
- **Iteraciones:**
  - Plano 7: la zambullida se rehízo una vez, porque la primera versión aún parecía «de pie sobre el botón».
  - Planos 7 y 8: Chispa pasó al plano delantero para quitar las rayas de reserva sobre la base, y la correa se pasó por detrás de ella.
  - Plano 6: los carteles se recortan por debajo de los subtítulos.
  - Plano 2: la salpicadura se apartó dos veces.
- **Costura:** salida 1608–1617 → 0–10 revisada en una tira. Mismo dibujo de Chispa en el ápice, `fallLines` desde f0 y Pausa, correa y botón idénticos.
- **Portada:** revisada a 150 px en el recorte 3:4.

---

## Ronda 3 — ritmo («manda la voz»)

**Brief:** `pacing-v3.md` + `pacing-v3.json` (37,8 s = 1134 f). Cada subtítulo empieza en su `new_frame` exacto (comprobado: 22/22 sin desvío) y dura su frase + 0,18 s.

### Cómo se ha hecho (sin redibujar)
- **Mapa de tiempo por tramos** (`SEGS` en `scene.js`): el fotograma de salida u (0–1133) se convierte en fotograma del storyboard t, lineal en cada tramo. Los reposos se comprimen y las acciones van cerca de 1:1; lo que no cabe se salta (huecos entre tramos). `storyT(u)` / `outOf(t)` alimentan subtítulos, SRT y efectos.
  - **c2:** el reposo «feliz» va a ×3,4; la salida, la carrera y el frenazo, a ×1,5.
  - **c5:** el paneo de los planos 2→3 se convierte en un **barrido de 6 f** (f231–236) y desacelera hacia Pausa.
  - **c10:** 4a dura 16 f y 4b, 38 f. Se mantienen las dos viñetas del plano 4 (caben).
  - **c18:** el final del plano 6 va a ×3 (empuje sobre la espiral) y el paseo hipnotizado a ×1,4.
  - **c22:** el último salto de Chispa (f1112–1133) va a ≈ 1:1 y empalma con f0.
- **Chispa sigue en «dos» de salida:** se muestrea en el par anterior del vídeo, nunca entre planos.
- **Pausa sigue en «unos»** con tiempo fraccionario. Su respiración son 13 ciclos exactos en 1134 f, así que el bucle no salta.

### Reglas de dinamismo aplicadas
1. **Nada quieto más de 0,5 s:** la cámara deriva siempre entre golpes (1,05 → 1,07 o 1,02 → 1,00 durante cada tarjeta). Además, Pausa respira y Chispa vibra y chisporrotea.
2. **Golpe en cada cambio de subtítulo:**
   - *Pop* de 0,85 → 0,95 → 1,05 → 1,03 → 1,01 → 1,0 en 6 f, contado en fotogramas de salida (también por segmentos y en «¡Ya, ya, ya!»).
   - Micro-salto de cámara de 4 f: las tarjetas pares acercan (1,00 → 1,05) y las impares alejan (1,07 → 1,02).
3. **Transiciones:**
   - Barridos de 6 f (3 de salida a la izquierda y 3 de entrada desde la derecha) con líneas de velocidad en pantalla: planos 1→2, 4a→4b, 4b→4c, 4→5 y 6→7.
   - Barrido del paneo 2→3.
   - Cortes secos con golpe de cámara en 3→4, 5→6 y 7→8.
4. **Acciones comprimidas:**
   - La caída inicial dura 5 f.
   - Anticipaciones de 3–4 f.
   - El ticket crece en 35 f (≈ 1,2 s, storyboard f814–850) y el total aparece al completarse.
   - Los carteles caen en ráfaga, uno cada 6 f (antes, cada 12–18).
5. **Gancho:** en f0 Chispa ya cae, y «En tu cabeza viven dos.» está en pantalla (con pop). **¡CLAC! en f5.**
6. **Bucle intacto:** f1133 → f0 es el mismo salto. La cámara acaba en z 1,00, y la tarjeta 1 empieza en 1,00.

### Entregables nuevos
- **`captions.srt`:** regenerado desde el mapa. Los textos en pantalla no cambian, así que difieren un poco de la voz: «Quedan 2» frente a «Quedan dos».
- **`sfx-cues.json`:** `{ fps, frames, cues: [{ frame, type }] }`, con los tipos del brief.
  - `pop`, solo en tarjetas clave y con ≥ 2 s entre ellos.
  - `tick`, a cada segundo visible de la cuenta atrás, con ≥ 8 f de separación (el tramo de c18 va a ×3).
  - `whoosh`, 3 f antes de cada corte con barrido.

### Desviaciones
- **4b:** se conserva (el brief permitía fundir las dos viñetas del plano 4).
- **Duración:** exacta, 1134 f = 37,8 s.
- **Ticket:** a ×1 son 35 f (1,17 s), no 1,0 s, porque crece durante «El problema…» y queda completo al entrar «Pausa llega tarde.».
- **Velocidad de c4:** va a 0,86× (60 f del storyboard en 70 de salida). Es la única tarjeta ralentizada; se nota poco porque Chispa sigue en dos y la cámara deriva.

### Comprobación «nada quieto más de 0,5 s» (cierre de la ronda 3)
Dos medidas sobre la línea de tiempo final de 1134 f:
1. **Dibujo idéntico sin cámara.** Se compara el SVG de cada fotograma con el anterior, quitando la transformación de cámara.
   - Antes del arreglo había **un tramo de 24 f (f680–703, tarjeta c15, empuje sobre Pausa)** en el que solo se movía la cámara.
   - Después del arreglo no queda **ningún** tramo de más de 15 f.
2. **Diferencia de píxeles entre fotogramas consecutivos.** Se mide en gris a 270×480 sobre los PNG finales: la diferencia media y el % de píxeles que cambian más de 12 niveles. La deriva de cámara sola da ≈ 0,00 %.
   - El tramo más largo en el que solo se mueve la cámara dura **7 f** (f397–403), por debajo de los 15 f.
   - **f1003–1030 (c20) no estaba quieto:** Chispa bota cada 2 f (diferencia media ≈ 1,1), la taza de Pausa se mece y Pausa parpadea en f≈1016.
   - Los tramos de menos movimiento son f327–345 (c8) y f351–390 (c9). Ahí solo hay movimiento secundario (vapor de la taza cada ≈ 6 f, respiración, la mirada de Pausa). Cumple la regla 1 del brief.

**Arreglo:** Pausa ahora **jadea** al llegar en el plano 5 (f648–703). Es un squash de ±2,2 % con un periodo de 10 f de salida, y las gotas de sudor botan 4 px en fase. Se ha re-renderizado f648–703 y se ha comprobado que sigue on-model.

### Render y codificación finales (ronda 3)
- **Render completo:** 1134 f, 4 workers, **609 s**. Más el re-render de f648–703 (47 s). Los fotogramas están en el scratchpad, fuera del repo.
- **`reel.mp4`:** H.264 High, yuv420p, 1080×1920, 30 fps, sin audio, **37,8 s / 1134 f**.
  - Se ha codificado con **crf 21**, que da **26,2 MB** (≈ 5,6 Mb/s, PSNR medio 43,2 dB). Con crf 18 eran 34,4 MB, por encima del límite de unos 30 MB.
  - `build.js encode` usa ahora crf 21.
- **Regenerados:** `preview-540.mp4`, `contact-sheet.png`, `cover.png`, `cover-grid.png` (3:4) y `cover-grid-4x5.png`.
- **`captions.srt` y `sfx-cues.json`:** se han regenerado contra el mapa final y salen idénticos a la versión del WIP. Son 22 subtítulos y 52 efectos; el último efecto está en f1116.

## Ronda 3 · revisión (crítica: tarjeta 19 y escala del gancho)
Solo cambios visuales; voz, `vo.json`, `sfx-cues.json`, `captions.srt` y audio sin tocar (md5 comprobado). Los fotogramas cambiados se han comparado por SVG contra la versión anterior: **f1–94 y f909–945** (131 f). f0, f95–908 y f946–1133 son idénticos.

1. **Tarjeta 19 («Todos tenemos una Chispa y una Pausa.», f908–970).**
   - **Problema:** el empuje de 1,35 hacia la yema del dedo, sumado al golpe de la tarjeta, sacaba la cabeza de Pausa por la derecha. Sus ojos quedaban en x ≈ 900–1000, bajo la columna de botones.
   - **Arreglo (`shot7`):**
     - El empuje baja a **1,18** (`PUSH7`).
     - La cámara se desplaza **70 px de mundo a la izquierda** en el pico (`SHIFT7`), unos 88 px en pantalla. El desplazamiento es proporcional a (z − 1), así que vale 0 cuando z = 1.
     - Las entradas y salidas de la tarjeta (f908 y f946) no cambian.
   - **Resultado:**
     - La cara de Pausa queda en x ≈ 650–830 durante todo el empuje. Solo la parte de atrás de la cabeza llega a x ≈ 1005, sin cortarse.
     - «COMPRAR YA» se lee entero, salvo que la C roza el borde en el pico.
     - El ritmo se mantiene: golpe de entrada 1,00 → 1,18 en 10 f, retención y vuelta en 16 f, además del golpe de la tarjeta.
   - **Opciones descartadas:** 1,25 con 80–110 px y 1,22 con 100 px. Cortaban «COMPRAR YA» y el pie de Chispa.
2. **Gancho (tarjeta 1, f0–42).**
   - **Cámara de la tarjeta 1:**
     - Empuje de 1,00 a 1,12 en f0–8, con salida rápida que acompaña la caída y el ¡CLAC! de f5.
     - Deriva de 1,12 a 1,14 hasta f34.
     - Vuelta a 1,00 en f43 con «io».
     - El ancla x pasa a **470** (centro del grupo botón + Pausa) para que ni el botón ni Pausa se salgan. Con z = 1 el ancla no influye.
   - **Tarjeta 2:** ahora golpea hacia dentro desde 1,00 (1,00 → 1,05 en 4 f y deriva a 1,00 en f95). Así el golpe de f43 se lee como un cambio de sentido, y la tarjeta 3 empieza en 1,00, como antes.
   - **Bucle:** f1133 (z 1,0005) → f0 (z 1,00) sigue sin salto, y f0 es idéntico al de antes. Por eso **`cover.png` y `cover-grid*.png` no cambian** (la portada usa z = 1).
   - **Escala:** el grupo ocupa ≈ 40 % del alto en el pico, frente al 35 % anterior. Pausa llega a x ≈ 970 en el pico, pero solo con la parte de atrás de la cabeza; la cara está por debajo de 940.
- **Render:**
  - Fotogramas: f1–94 en 55 s y f909–945 en 48 s.
  - Codificación más vista previa y hoja de contactos: 67 s.
  - `reel.mp4` se ha recodificado igual: crf 21, 1134 f, 37,8 s, H.264 High, yuv420p, 1080×1920, 30 fps, sin audio, **26,3 MB**.
  - Se han regenerado `preview-540.mp4` y `contact-sheet.png` (la miniatura de f60 cambia).
- **freezedetect** (n = 0,003, d = 0,5) marca **5,33–6,37 s (f160–191, tarjeta c4)**. Ya estaba en la versión anterior y queda fuera del alcance de esta revisión. En ese tramo Chispa vibra en «dos» (≈ 1,4 % de píxeles cada 2 f) y la cámara deriva. Con el umbral por defecto (−60 dB) no se detecta nada. Es candidato a reforzarse en otra ronda.

## Ronda 4 · apertura Kahneman
Nueva apertura de 329 f (N1–N5, f0–328) según `storyboard-opening.md` / `opening-v4.json`; c1–c2 desaparecen y c3…c22 se desplazan +234 f (par). Total **1368 f = 45,6 s**.

- **Cómo:** `frame(U)` en `scene.js`. Para U ≥ 291 llama al `frameOld(U − 234)` (el código antiguo, intacto) con tiempo, vapor, respiración, barridos y SEGS antiguos; solo se añade la tarjeta N5 y la insignia «1». Para U < 291, escena propia (`shotN`, `chispaN`, `pausaN`, `camN`). Helper `dotBadge(x,y,r,ink,label?)`; píldoras con `sign()` (rx 46); fuente y aviso en DM Mono 30 px (título en cursiva).
- **Verificación del tramo desplazado:** hash SHA-1 del SVG de los 1039 fotogramas f329–1367 = hash del antiguo f95–1133: 1039/1039 iguales. f291–328 = antiguo f57–94 salvo tarjeta N5 e insignia (verificado por diferencia con `noCards`). Mundo de f0–42 idéntico al antiguo (sin tarjeta). PNG: 21 fotogramas muestreados f329–1367 comparados con los PNG antiguos renombrados: diferencia máx. 7 niveles (el propio render difiere entre dos pasadas, ruido de los filtros). Se han renombrado los PNG antiguos f95+ (+234) y re-renderizado solo f0–328 (329 f, 202 s).
- **Desviación (bucle/respiración):** en vez de `FRAMES/15` (que habría cambiado el squash de Pausa en c3–c22 y obligado a un render completo), la respiración de f291 en adelante usa el tiempo antiguo (FRAMES_old/13: f1367 = antiguo f1133, bucle igual que antes) y en f0–290 una fase que parte de 0 en f0 y enlaza con la del antiguo f57 (3 ciclos más, periodo ≈ 79,7 f). Vapor y barridos también en tiempo antiguo.
- **Cámara** (§ 4): en f0–33 igual que antes; f34–54 va a 1,10 (no a 1,00). Ancla x 470 → 680 (N4) → 540 (N5). z en f291 = `punch(57)`.
- **Extras:** respingo de Chispa −8 px en f50 y f52. `renderer.js`: se precarga la cursiva de DM Mono (sin ello la línea del título no salía en el primer fotograma de cada worker).
- **Portada:** sin cambios (`cover.png`, cover-grid*). `build.js encode` ya no la regenera.
- **Salidas:** `reel.mp4` 30,5 MB (crf 21), 1368 f, 45,6 s; `preview-540.mp4`, `contact-sheet.png`, `captions.srt` (25 subtítulos), `sfx-cues.json` (1368 f; efectos antiguos con frame ≥ 57 +234, más los del bloque). `vo.json`, `sfx-mix.json` sin tocar (sus claves hay que desplazarlas +234).
- **Quietud:** en f0–328 ningún tramo con cambio de píxeles < 0,02 % (>1 f); mayor en todo el vídeo 5 f. freezedetect (n 0,003, d 0,5) solo marca 13,13–14,17 s (f394–425 = el antiguo c4, ya conocido).
- **Débiles:** línea de fuente a 30 px se lee justa a 360 px de ancho; el botón queda cortado a la izquierda en N3 (z 1,11–1,13 con ancla 470, solo decorado); la cara de Pausa queda lejos del texto de N4 (puntos de pensar pequeños). `reel-final.mp4` (con audio) está desfasado hasta que se rehaga la mezcla.

## Ronda 4 · revisión
Cambios solo en f1–139 y f186–256 (SVG por diferencia con la escena anterior: 210 fotogramas distintos, ningún otro). Los PNG de f329+ no se han vuelto a renderizar (mtime anterior); hash SVG de f257–1367 idéntico al anterior (incluye f329+ = c3…c22). `vo.json`, `sfx-mix.json`, `sfx-cues.json`, `captions.srt` y `cover*.png` sin tocar (md5 igual; `captions.srt` y `sfx-cues.json` regenerados idénticos).
- **Gancho f0–45:** N1 a 112 px (todas las N a 112 px: N1…N5 coherentes), «Nobel de Economía,» en una línea. La cámara sube además el encuadre (`HOOK_DY` −230 px, f1–8, se mantiene hasta f41 y se suelta con el cambio de tarjeta, f42–59): empuje 1,00 → 1,15 (f0–8) → 1,17 (f34), ancla x 470 → 340 durante el gancho (el botón ya no se corta por la izquierda en f8–45). f0 queda idéntico (z 1,00, dy 0). Chispa cae y el botón queda a ≈ 300–400 px del título en vez de ≈ 700.
- **Fuente (f12–117):** DM Mono 38 px (interletra 0,04), líneas en y 522 y 564.
- **Aviso de metáfora:** 40 px, una línea y texto acortado «Metáforas, no zonas del cerebro.» (la frase completa a 40 px no cabe en una línea ni en dos por encima de y 600), y 614 de línea base; visible f61–139 (antes f61–117); bajo N3 no choca con nada.
- **N4 (f186–256):** quitado el punto rojo huérfano → insignia roja «1» (r 46) sobre Chispa; píldora SISTEMA 2 (330 px) sobre la cabeza de Pausa (y 1020); puntos de pensar r 15 (antes 11), en diagonal desde la cúpula hacia la píldora (mismos tiempos f196/210/224/240).
- **Render:** f0–328 en 195 s; codificación + vista previa + hoja de contactos 74 s. `reel.mp4`: crf 21, H.264 yuv420p, 1080×1920, 30 fps, 1368 f, 45,6 s, silencioso, **31,1 MB**. Quietud: tramo más largo con cambio < 0,05 de media = 5 f en todo el vídeo.
- **No hecho / débil:** el desplazamiento de 30 px del decorado del botón en N3/N4 (el botón se comparte con f291+ y f0; habría un salto en f55 y f291), aunque en el gancho se corta menos. Las monedas de f12–35 pasan por detrás de la línea de fuente (más cerca del título ahora). El vacío entre título y personajes sigue en N2–N5 (la cámara baja a su sitio con la tarjeta 2). Tras el recodificado, f329–499 difieren ligeramente del mp4 anterior por el control de tasa del codificador (mismas fuentes).
