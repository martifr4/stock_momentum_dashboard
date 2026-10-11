# Reel 00 · Presentación — Storyboard «En tu cabeza viven dos»

**Duración total: 1680 fotogramas = 56,0 s a 30 fps** · 1080 × 1920 · estilo Riso · papel «niebla» `#E6ECE4` en todo el Reel.
**Fuentes:** `script.md` (ideas aprobadas), `characters/BIBLE.md`, `characters/riso/riso.js`, `posts/00-presentacion/render.js` (helpers `G()`, `leash()`, `ticket()`, `countdown()`, `shiftPlate()`, `clipLayers()`, `nodArcs()`: se copian al render del Reel).
**Subtítulos:** `captions.srt` (mismos tiempos que este documento).

---

## 0. Convenciones (leer antes de construir)

**Numeración.** Fotogramas desde 0. Un plano «570–669» incluye los dos extremos. Un subtítulo «in 570 / out 670» se ve en 570…669 y desaparece en 670 (out exclusivo). En el SRT, tiempo = fotograma / 30.

**Cadencia.**
- **Chispa:** en «dos». Solo cambia de dibujo en fotogramas **pares**. Todas sus claves están en pares; entre claves se mantiene el dibujo. En reposo vibra ±1 px en x, alternando cada 2 fotogramas (+1, −1…). Nunca se interpola.
- **Pausa:** en «unos». Se interpola con suavidad (`easeInOutSine` si no se dice otra cosa). Posiciones, `look`, `lid` y `squash` se interpolan; las expresiones y poses cambian de golpe, salvo donde se indica una interpolación de pose (§ activos nuevos, `pausa()` con `arms`/`mug`).
- **Atrezo:** monedas, carteles y ticket en «dos», salvo el balón (unos, porque cruza muy rápido).
- **Cámara y texto:** en «unos».

**Curvas.** `snap` = cambio en un fotograma. `ease-out` = `easeOutCubic`. `ease-in` = `easeInCubic`. `ease-io` = `easeInOutSine`. `overshoot` = se pasa del valor y vuelve; se dan los valores fotograma a fotograma.

**Cámara.** La escena se dibuja en coordenadas de mundo. Cámara = `translate(−camX, 0)` y, para los empujes, `scale(z)` alrededor de un ancla A: `pantalla = A + (mundo − A) · z`. El temblor suma (dx, dy) en pantalla. **Los subtítulos no se mueven con la cámara ni tiemblan**, salvo los marcados «anclado al mundo».

**Personajes.** Coordenadas = el `x, y, s` de `chispa()` / `pausa()`. Suelo: el pie de Chispa queda en `y + 127·s`; la base de Pausa, en `y + 122·s`. Para un suelo G: `y_Chispa = G − 127·s`, `y_Pausa = G − 122·s`. Sombra de suelo con `shadowEllipse` en cada plano (salvo en el aire, que va `liftedShadow` al suelo).

**Tintas que se pisan.** Nunca ciruela en una cara. Si algo rojo pisa algo azul (o al revés), el de delante lleva `knockFor` en la plancha del otro. Si Chispa pisa atrezo rojo (botón, etiquetas, carteles), lleva `halo: 8`. Las monedas llevan su propio halo de reserva (ver activos).

**Desregistro.** Estándar de `riso()` en todo el Reel. El único desregistro exagerado es el de la figura de Pausa (planos 3 y 5). **El texto nunca se desregistra de más.**

**Textura.** Semillas fijas de la biblia. El grano no «hierve».

### Sistema de subtítulos
- **Estilo:** Bricolage Grotesque 800, ancho 75 %, `opsz` 96, interletra −0,01 em, interlineado 1,0. Negro `#26232E`; los nombres y las frases de cada personaje en su tinta (rojo ≥ 56 px, se cumple siempre).
- **Zona por defecto «ARRIBA»:** centrado en x = 500, ancho máximo 840 (x 80–920). Primera línea base en y = 400 (tamaños ≤ 96) o y = 410 (112). Segunda línea a +1,0 × tamaño.
- **Entrada «sello»:** fotograma de entrada a escala 1,08 (ancla en el centro del bloque); +1 → 1,03; +2 → 1,00. Sin fundidos. **Salida:** corte seco.
- **Sello por segmentos:** en las tarjetas marcadas, cada segmento aparece con su propio sello y el texto anterior se queda. El bloque se compone con las líneas finales desde el principio, así nada salta de sitio.
- **Cortes de línea:** son los que se indican (`/`). Medir con `R.measurer()`. Si una línea pasa de 840 px, bajar el tamaño de 4 en 4 px hasta que quepa. **No volver a cortar.**
- No hay bocadillos. Las frases de personaje van junto a quien habla.

### Zonas seguras (comprobadas en cada plano)
Caras y subtítulos dentro de x 60–940, y 260–1480. Ningún subtítulo en y > 1480 ni en x > 940. El atrezo puede salirse; los cuerpos pueden cortar por abajo.

---

## 1. Tabla de planos

| Plano | Fotogramas | Segundos | Duración | Beat | Riesgo |
|---|---|---|---|---|---|
| 1 | 0–119 | 0,00–4,00 | 120 f · 4,0 s | **Gancho:** Chispa cae sobre «COMPRAR YA», lluvia de monedas; Pausa ni se entera | Medio (monedas) |
| 2 | 120–329 | 4,00–11,00 | 210 f · 7,0 s | **Chispa:** cruza corriendo, coge el «−70 %», frena, mira a cámara | Bajo-medio (ciclo de carrera nuevo) |
| 3 | 330–569 | 11,00–19,00 | 240 f · 8,0 s | **Pausa:** paneo lento, su plancha azul llega tarde, sorbo, parpadeo lento | Medio (gag de plancha + pose nueva) |
| 4 | 570–779 | 19,00–26,00 | 210 f · 7,0 s | **El giro:** 4a Chispa saca pecho · 4b esquiva el balón · 4c Pausa y el semáforo | Bajo |
| 5 | 780–1049 | 26,00–35,00 | 270 f · 9,0 s | **El problema:** pantalla partida, la caja registradora, el ticket que no para | **ALTO** |
| 6 | 1050–1289 | 35,00–43,00 | 240 f · 8,0 s | **El villano:** caen los carteles, ojos en espiral, Pausa duerme | Medio |
| 7 | 1290–1529 | 43,00–51,00 | 240 f · 8,0 s | **La promesa:** el tirón de la correa, a un milímetro; las dos a cámara | **ALTO** |
| 8 | 1530–1679 | 51,00–56,00 | 150 f · 5,0 s | **Cierre y bucle:** pregunta, votos, Chispa se escapa y salta → fotograma 0 | Medio-alto (costura del bucle) |

**Decorado compartido 1 / 7 / 8 («el botón»).** Es el mismo encuadre y debe ser idéntico, porque el final del plano 8 empalma con el fotograma 0:
- Suelo G = 1400.
- **Botón** `buyButton` centrado en x = 320, escala 0,9. Base negra de 360 × 56 (x 140–500, y 1344–1400). Tapa roja levantada de 320 × 100 (y 1236–1336, **arriba de la tapa en y = 1236**). Pulsada: tapa de 320 × 78 (y 1262–1340, arriba en y = 1262). Rótulo «COMPRAR YA» en reserva, 58 px.
- **Pausa:** `x 830, y 1324, s 0.62, flip: true` (mira hacia el botón). Sentada. Cuerpo en x ≈ 715–939; cara en x ≈ 783–828 e y ≈ 1330.
  - Con `pose: 'sit'`: taza en (697, 1377) y asa en (671, 1366).
- **Correa en el suelo (estado de reposo):** `M671 1366 C650 1404 580 1406 520 1402` (3,5 px, negra) y lazo abierto en (520, 1402): el lazo de `leash()` girado 0° y abierto, sin cerrar el bucle. Está en el plano 1 desde el fotograma 0 (es el estado en el que la deja el plano 8).

---

## 2. Planos

### PLANO 1 · Gancho · 0–119 (0,00–4,00 s)

**Papel:** niebla. **Decorado:** el del botón (ver arriba), sin la correa atada: en reposo en el suelo.

**Personajes de partida**
- **Chispa:** s 1.2. `knockFor: ['blue']` de f6 a f62 (las monedas pasan por detrás) y `halo: 8` mientras pisa la tapa.
- **Pausa:** decorado compartido. `pose 'sit'`, `expr 'neutral'`, `look [8, 6]` (mira su taza). Vapor normal.

**Chispa: claves**
| f | x | y | pose | expr | extras |
|---|---|---|---|---|---|
| 0 | 320 | 778 | `hold` (brazos arriba) | `euforia`, `look [0,4]` | `sweat 2`, `fallLines` sobre la cúpula (3 trazos verticales de y 575 a 615), `liftedShadow(320,1400,120,14)` |
| 2 | 320 | 818 | `hold` | = | fallLines |
| 4 | 320 | 908 | `hold` | = | fallLines |
| 6 | 320 | 1078 | **`golpe`** (nuevo) | `euforia` | **IMPACTO.** `burst` en cada mano (G(C,±70,132)). Botón pulsado (snap) |
| 8 | 320 | 1086 | `golpe` | = | se hunde con la tapa |
| 10 | 320 | 1090 | `golpe` | = | |
| 12 | 320 | 1070 | `cheer` | `euforia` | rebota sobre la tapa |
| 14 | 320 | 1100 | `cheer` | | |
| 16 | 320 | 1110 | `cheer` | | apoyada en la tapa pulsada (1262 − 127·1,2 ≈ 1110) |
| 18–50 | 320 | ciclo de saltitos cada 8 f: +0, −30, −44, −30 (f18, 20, 22, 24; se repite en 26, 34, 42) | `cheer` | `euforia` | termina en f50 con y 1110 |
| 52 | 320 | 1110 | `happy` | `feliz`, `look [0,2]` (a cámara) | vibra ±1 px hasta f98 |
| 100 | 320 | 1122 | `shrug` (agachada) | `euforia`, `look [6,0]` | anticipación |
| 108 | 380 | 1000 | `lunge` | `euforia` | `speed 4`, `lean −12` |
| 110 | 500 | 880 | `lunge` | | |
| 112 | 640 | 800 | `lunge` | | |
| 114 | 790 | 770 | `lunge` | | pasa por encima de Pausa: `knockFor ['blue']` |
| 116 | 950 | 790 | `lunge` | | |
| 118 | 1110 | 840 | `lunge` | | sale por la derecha |

**Botón:** levantado en f0–5; pulsado (snap) en f6–107. Al soltarse en f108 la tapa salta 6 px por encima de su sitio (arriba de la tapa en y 1230) y en f110 vuelve a 1236.

**Lluvia de monedas** (12 `coinBlank`, r 26, en «dos»). Salen en f6 desde (320, 1240). Con t = f − 6:
`x = 320 + vx·t`, `y = 1240 + vy·t + 1,2·t²` (gravedad 2,4 px/f²). Se dibujan en los pares desde f6. Cada moneda alterna cara/canto en cada dibujo (las impares empiezan de canto). El canto es una elipse de rx 26 y ry 8, girada `rot0 + 40°·(t/2)`. Se quitan cuando y > 1960 (todas antes de f62). Pico más alto: y ≈ 632, por debajo del subtítulo.

| moneda | vx | vy | rot0 | | moneda | vx | vy | rot0 |
|---|---|---|---|---|---|---|---|---|
| c1 | −10 | −46 | 0 | | c7 | 9 | −42 | 30 |
| c2 | −7 | −52 | 20 | | c8 | 12 | −38 | 70 |
| c3 | −4 | −54 | 45 | | c9 | −13 | −36 | 10 |
| c4 | −1 | −50 | 80 | | c10 | 15 | −44 | 55 |
| c5 | 3 | −53 | 15 | | c11 | −2 | −40 | 35 |
| c6 | 6 | −48 | 60 | | c12 | 5 | −34 | 90 |

**Pausa: acción.** No reacciona a nada (ese es el chiste).
- Vapor alterno (`steamAlt`) cada 8 f.
- **Parpadeo lento:** `lid` 0,5 → 1,0 en f70–78 (`ease-in`); cerrado de f78 a f86; 1,0 → 0,5 en f86–100 (`ease-out`).

**Cámara:** fija. **Temblor en el impacto** (pantalla, en unos): f6 (0, +14), f7 (−8, −6), f8 (6, 4), f9 (−3, −2), f10 (0, 0).

**Rótulo de sonido:** «¡CLAC!» en f6–19. Bricolage 800, 84 px, negro, ancla izquierda en (520, 1150), rot −8°, sello 1,3 → 1,0 en f6–8. Va sobre la cúpula de Pausa (y 1090–1150) y no la toca.

**Subtítulos**
| # | in | out | texto (líneas) | tamaño | posición |
|---|---|---|---|---|---|
| 1 | 0 | 51 | «En tu cabeza / viven dos.» | 112 | ARRIBA, líneas base 400 y 510. **Visible en el fotograma 0** |
| 2 | 51 | 156 | «Y **una** acaba de / gastarse tu dinero.» («una» en rojo) | 80 | ARRIBA |

**SFX:**
- f0: silbido de caída corto.
- f6: «¡clac!» de botón grande + «cha-ching» + cascada de monedas (f6–50).
- f52: risita.
- f100: muelle (anticipación).
- f108: «fiuuu» de salida.

**Transición:** corte seco a f120. Chispa sale por la derecha y entra por la izquierda en el plano 2: continuidad de dirección.

---

### PLANO 2 · Chispa · 120–329 (4,00–11,00 s)

**Papel:** niebla. **Suelo** G = 1400. **Chispa:** s 1.3 → y de pie = 1235.

**Atrezo**
- **Percha de la etiqueta:** palo negro de 8 px de (700, 1400) a (700, 1150), brazo a (640, 1150) e hilo de 3,5 px hasta la etiqueta.
- **Etiqueta:** `priceTag(640, 1205, 10, '−70 %', 0.42)`.
- **Desde f132** la etiqueta va en la mano: posición `G(C,176,−18) + [70, −8]`, rot 10. Es el mismo montaje que la slide 2: `limbs.armR [[150,18],[176,−18]]` y `halo: 8`. El hilo roto (de (640,1150) a (640,1185)) se balancea ±6° en f132–150 (2 dibujos).

**Chispa: claves**
| f | x | y | pose | expr | extras |
|---|---|---|---|---|---|
| 120 | −260 | 1235 | `corre_a` (nueva) | `euforia` | `speed 4`, `lean −12` |
| 122 | −150 | 1221 | `corre_b` | | bote: y −14 en los dibujos B |
| 124 | −40 | 1235 | `corre_a` | | |
| 126 | 70 | 1221 | `corre_b` | | |
| 128 | 180 | 1235 | `corre_a` | | |
| 130 | 290 | 1221 | `corre_b` | | |
| 132 | 400 | 1235 | `corre_a` + `limbs.armR` de la etiqueta | | **coge la etiqueta** (snap) |
| 134 | 450 | 1235 | **`frena`** (nueva) | `alarma` | `lean +8`, polvo (`dust`) en los pies |
| 136 | 485 | | `frena` | | |
| 138 | 505 | | `frena` | | |
| 140 | 515 | | `frena` | | |
| 142–154 | 520 | 1235 | `frena` | `euforia` desde f146 | vibra ±1. El polvo crece (r 10 → 34) y se deshace en f134–146 |
| 156 | 520 | 1219 | `stand` + `limbs.armR` de la etiqueta | `feliz`, `look [0,2]` | **gira a cámara** (pop) |
| 158 | 520 | 1239 | = | | |
| 160–188 | 520 | 1235 | = | = | vibra |
| 190 | 520 | 1235 | = | `neutral`, `look [0,2]` | sacude la etiqueta: rot 10 → −6 → 10 en f190, 192, 194 |
| 230 | 520 | 1211 | = | `euforia` | saltito («Rápida.»): f230 −24, f232 −30, f234 −12, f236 0 |
| 242 | 520 | 1235 | = | `euforia` | «Impulsiva.»: la etiqueta tiembla (rot 10, −10, 10, −10, 10 en f242–250), aparece `sweatIdx [1]` |
| 254 | 520 | 1235 | `hips` (etiqueta en la mano derecha, en G(C,108,64)) | `orgullosa` | «Decide sin preguntar.» |
| 290 | 520 | 1235 | `cheer` (etiqueta en la mano derecha, arriba) | `euforia` | `sweat 3`, `burst`. Saltitos por cada «ya» |
| 290 / 300 / 310 | 520 | saltito: +0, −36, −50, −36, 0 en los 4 pares siguientes a cada clave | `cheer` | | un saltito por palabra |
| 320 | 520 | 1235 | `cheer` | | aterriza |
| 322 | 520 | 1215 | `cheer` | | empieza un 4.º saltito que el plano 3 congela a cámara lenta |
| 324–328 | 520 | 1195 | `cheer` | | |

**Salpicadura de tinta** (`inkSplash`, roja) detrás de «Chispa.» del subtítulo 3. Tres dibujos: f156 mancha pequeña; f158 mancha grande y 5 gotas que salen; f160–229 mancha asentada con las gotas quietas. Va en la plancha roja, detrás del texto rojo, desplazada (+18, +10) para que la palabra se lea. La mancha queda dentro de x 80–920.

**Cámara:** fija.

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 3 | 156 | 230 | «Esta es **Chispa.**» («Chispa.» en rojo) | 96 | ARRIBA, una línea |
| 4 | 230 | 290 | «Rápida. Impulsiva. / Decide sin preguntar.». Sello por segmentos: «Rápida.» en f230, «Impulsiva.» en f242, «Decide sin preguntar.» en f254 | 80 | ARRIBA |
| 5 | 290 | 384 | «¡Ya, ya, ya!» en **rojo**. Sello por palabra: f290, f300, f310 | 96 | **Anclado al mundo:** ancla izquierda en (620, 960), rot −4°, junto a Chispa. En el plano 3 se va con el paneo |

**SFX:**
- f120: carrerilla de pasitos rápidos.
- f132: «fwip» (arranca la etiqueta).
- f134: frenazo de dibujos animados.
- f156: «pop» + «splotch» de tinta.
- f230, 242, 254: tres golpes de sello.
- f290, 300, 310: tres «boing» agudos.

**Transición:** sin corte. En f330 empieza el paneo del plano 3 sobre el mismo decorado (mundo continuo).

---

### PLANO 3 · Pausa · 330–569 (11,00–19,00 s)

**Mundo:** el decorado del plano 2 sigue a la izquierda. **Pausa** en el mundo: `x 1330, y 1260 (G 1400), s 1.15`, `pose 'sit'`, `flip: false` (taza a la derecha).

**Cámara (el beat):** `camX` de 0 a 700 en f330–420, `ease-io` (`camX = 700·(1 − cos(π·t))/2`, t = (f−330)/90). Después, fija en 700. En pantalla, Pausa queda en x 630, la cara en ≈ 676 y el asa de la taza en ≈ 931.

**Todo se ralentiza:** Chispa sigue su 4.º saltito «en seises» (un dibujo cada 6 f) y sale de cuadro por la izquierda:
| f | y |
|---|---|
| 330 | 1185 |
| 336 | 1177 |
| 342 | 1173 |
| 348 | 1173 |
| 354 | 1177 |
| 360 | 1185 |
| 366 | 1185 |
Hacia f400 está fuera de cuadro, porque la cámara se la lleva. Su «¡Ya, ya, ya!» (anclado al mundo) se va con ella y en f384 todavía está visible (x ≈ 160–440).

**Gag de imprenta: la plancha azul llega tarde.**
- Desde f330 se dibuja la **plancha negra** de Pausa en su sitio: pupilas, rayas de los párpados, boca, taza y vapor. Los blancos de los ojos van en la plancha azul, así que viajan con ella: hasta f458 se ven unas pupilas y una sonrisa flotando sobre el papel.
- La **plancha azul** (cuerpo, pies, muñones, blancos de los ojos) se desplaza con `shiftPlate(pz,'blue',dx,dy)` más un giro alrededor de (1330, 1260):
  - f330–457: dx = +720, dy = +40, giro 3° (fuera de cuadro).
  - f458–494: dx 720 → 0, dy 40 → 0, giro 3° → 0, `ease-out` en unos (se desliza y encaja).
  - f494: **encaja.** `squash` 0,96 en f494; 0,98 en f498; 1,00 en f504 (`ease-out`).
- **Desde f494 vale el desregistro estándar.** El texto no se desplaza nunca.

**Pausa: acción** (en unos)
| f | qué | curva |
|---|---|---|
| 384–457 | quieta (solo plancha negra), `look [−4,6]` | — |
| 458 | `look` → [0, 6] (a cámara) en f458–470 | ease-io |
| 500–514 | **sorbo:** sube la taza. `arms` de [146,86,182,96] a [140,80,112,66]; `mug` de [214,86] a [100,56] (pose `sorbo`, nueva) | ease-io |
| 514–526 | bebe: `lid` 0,5 → 0,8; vapor alterno | ease-io |
| 526–540 | baja la taza a la pose `sit`, `lid` vuelve a 0,5 | ease-io |
| 540–548 | **parpadeo lentísimo:** `lid` 0,5 → 1,0 | ease-in |
| 548–556 | cerrado | — |
| 556–569 | `lid` 1,0 → 0,5 (tarda en subir) | ease-out |

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 6 | 384 | 446 | «Y esta es **Pausa.**» («Pausa.» en azul) | 96 | ARRIBA |
| 7 | 446 | 494 | «Tranquila. / Hace las cuentas…» | 80 | ARRIBA |
| 8 | 494 | 532 | «…cuando llega.» Entra **justo** cuando la plancha encaja | 96 | ARRIBA |
| 9 | 532 | 570 | «Espera… / déjame pensarlo.» en **azul** | 80 | Junto a Pausa: centrado en x 600, líneas base 930 y 1010 (la cúpula está en y ≈ 1088) |

**SFX:**
- f330: cinta que se frena (efecto «slow-mo»).
- f384: colchón tranquilo.
- f458: silbato de émbolo que baja despacio.
- f494: «clonc» suave de encaje.
- f514: sorbo.
- f540: el parpadeo, en silencio (o un «crrr» muy suave).

**Transición:** corte seco a f570.

---

### PLANO 4 · El giro · 570–779 (19,00–26,00 s)

#### 4a · Chispa saca pecho · 570–609
- **Papel:** niebla. Sombra en y 1360.
- **Chispa:** (500, 1150), `pose 'hips'`, `expr 'orgullosa'`, `look [0,2]`, `lean 6`, `sweatIdx [1]`.
- **Escala con rebote:** s 1,45 en f570 → 1,70 en f572 (además y −10) → 1,62 en f574 → 1,60 en f576, y se queda.
- `burst` sobre la cúpula en f572–580.
- En f592 cambia a `expr 'feliz'`. Vibra.
- **Cámara:** fija.

#### 4b · El balón · 610–669 (viñeta)
- **Marco de viñeta** (`panelFrame`): rectángulo negro de 8 px, rx 14, en x 60–1020, y 600–1440. Entra en snap en f610.
- **Chispa:** (480, 1250), s 1.1, `stand`, `neutral`, `look [0,2]`. Suelo 1390.
- **Balón** (`ball`, r 46, nuevo, en unos): entra en f618 en x 1000, y = 1090. Avanza −64 px/f y gira −30°/f. Lleva 3 líneas de movimiento detrás (negras, 5 px, de 60 px). Pasa sobre Chispa en f625 y sale en f634 (x ≈ −60).

| f | Chispa |
|---|---|
| 614 | `alarma`, `look [6,0]` (lo ve venir) |
| 620 | **se agacha:** y 1296, `lean −16`, `pose 'shrug'`, `sweat 2` (con la cúpula agachada en y ≈ 1164, el balón pasa 28 px por encima) |
| 622–634 | agachada, vibra ±2 |
| 636 | se levanta: y 1230, `pose 'cheer'`, `expr 'orgullosa'`, `burst` |
| 638 | y 1250 |
| 640–669 | quieta, vibra |

#### 4c · Pausa y el semáforo · 670–779 (viñeta)
- **Marco** igual que en 4b.
- **Calzada:** banda de semitono negro claro (`rmax 1,4`) en y 1330–1440, de x 60 a 1020, recortada al marco.
- **Paso de cebra:** 6 franjas de reserva de 60 px de ancho, con 50 px de hueco, inclinadas 10°, desde x 380.
- **Pausa:** en la acera, `x 250, y 1232, s 0.8`, `pose 'sit'`, `flip false`, `expr 'neutral'`.
- **Semáforo** (`trafficLight`, nuevo): palo negro de 14 px de (820, 1440) a (820, 820). Caja de 120 × 230 centrada en (820, 840). Lámpara roja arriba en (820, 785) y azul abajo en (820, 895), r 40. Al empezar: azul encendida (tinta azul) y roja apagada (aro de reserva sobre negro).

| f | qué | curva |
|---|---|---|
| 670 | corte; Pausa `look [8,4]` | — |
| 680–690 | `look` → [−10, 4] (mira a la izquierda) | ease-io |
| 690 / 698 / 706 | aparecen los puntos de pensar 1, 2 y 3 (`thinkDots`, azul, r 8, sobre la cúpula en (300, 1080), (330, 1062), (360, 1050)) | snap |
| 700–710 | `look` → [10, 4] | ease-io |
| 714 | los puntos se borran y vuelven a llenarse en f722, 730 y 738 | snap |
| 716–726 | `look` → [−10, 4] | ease-io |
| 730–744 | **se decide:** pose `llega` (pie levantado), x 250 → 262 | ease-in |
| 744 | **semáforo en rojo:** azul apagada, roja encendida, en snap. `burst` alrededor de la lámpara en f744–750. Temblor de cámara de 6 px, 3 f | snap |
| 746 | Pausa se queda quieta (pose `sit`), se borran los puntos | snap |
| 750 | `expr 'alarma'` | snap |
| 760 | `expr 'esceptico'`, `look [−6,6]`, `pausaSweat` rojo en G(P,10,−150) | snap |
| 760–779 | queda quieta; `squash` 1 → 0,97 → 1 (suspiro) | ease-io |

**Subtítulos (todo el plano 4)**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 10 | 570 | 670 | «Ojo: **Chispa** / no es la mala.» («Chispa» en rojo) | 96 | ARRIBA |
| 11 | 670 | 724 | «Sin ella, tardarías / media hora…» | 80 | ARRIBA (y 400 / 480; el marco empieza en y 600) |
| 12 | 724 | 780 | «…en cruzar la calle.» | 80 | ARRIBA |

**SFX:**
- f570: «boing» de pecho.
- f618: «whoosh» del balón.
- f620: «¡ip!».
- f636: «ding» de orgullo.
- f670: ambiente de calle.
- f690–740: tictac de pensar.
- f744: zumbido del semáforo.
- f750: «womp» corto.

**Transición:** corte seco a f780.

---

### PLANO 5 · El problema · 780–1049 (26,00–35,00 s) — **RIESGO ALTO**

**Composición: pantalla partida horizontal**, con los subtítulos arriba.
- **Panel A (Chispa):** marco negro de 8 px, rx 14, x 60–1020, y 560–990. Suelo A = 960.
- **Panel B (Pausa):** marco igual, y 1010–1450. Suelo B = 1430.
- Cada panel recorta a sus personajes (`clipLayers`). **El ticket no se recorta: rompe los marcos** y pasa de A a B.
- Toda la escena (paneles y ticket) se recorta además a y 540–1480 durante el empuje final, para no invadir los subtítulos.

**Atrezo**
- **Caja registradora** (`register`, nueva): cuerpo negro de 220 × 140 en x 670–890 e y 820–960. Visor encima (x 740–860, y 770–820) con dígitos en reserva, DM Mono 28 px: «0,00» → «189,99» en f810. 3 × 3 teclas de reserva. Cajón (slab de 200 × 24 en la base) que sale 30 px en f810. Ranura del ticket a la derecha, en (880, 900).
- **Ticket** (`ticket()` del carrusel, variante del Reel): ancho 110; «TOTAL» a 34 px y «189,99 €» a 38 px.
  - Recorrido completo: (880, 900) → (900, 990) → (540, 1170) → (540, 1425). Tramos de 92, 402 y 255 px: **749 px en total**.
  - **Crece** en f814–960, en «dos»: longitud L(f) = 749 · (f − 814) / 146. Se dibuja la polilínea truncada en L, con el final rasgado en el extremo actual.
  - El bloque «TOTAL / 189,99 €» solo aparece cuando el ticket llega a su longitud completa (f960), en el último tramo (vertical) a 62 px del final: en (540, 1363), horizontal.

**Chispa (panel A)**, s 0.85, de pie en y = 852:
| f | x | pose | expr | extras |
|---|---|---|---|---|
| 780–802 | 100 → 600 (≈ +45 por dibujo) | `corre_a` / `corre_b` alternas | `euforia` | `speed 4`, `lean −12` |
| 804 | 610 | `frena` | `euforia` | |
| 806 | 610 | `hold` (brazos arriba) | | anticipación |
| 808 | 610 | `golpe` | | aporrea las teclas |
| 810 | 610 | `golpe` | | **¡DING!** visor «189,99», sale el cajón, `burst` sobre la caja |
| 812–960 | 610 | `compra` (bolsa + mano) | `feliz`, `look [4,6]` (mira el ticket) | botecito de −10 px cada 12 f |
| 964–980 | 610 → 1100 (≈ +60 por dibujo) | `compra` + `speed 4` | `feliz` | se va por la derecha con la bolsa |

**Pausa (panel B)**, s 0.8, y = 1430 − 98 = 1332, `flip false`, `pose 'llega'`, `expr 'neutral'`:
- f780–960: x 100 → 240, lineal y lentísima. Bote y ±4 con periodo de 30 f (seno). Mirada al frente.
- f960: **llega:** `expr 'jadeo'`, `pausaSweat` rojo en G(P,10,−150), `shiftPlate(blue, 12, 7)`.
- f960–990: desregistro mantenido. En f990–1010 la plancha vuelve a la posición estándar (`ease-out`).
- En x 240 el asa de la taza queda en x ≈ 467, a 18 px del borde del ticket (485). No se tocan.

**Rótulo de sonido:** «¡DING!» en f810–825. Bricolage 800, 72 px, negro, ancla izquierda en (700, 740), rot 6°, sello 1,3 → 1,0. Queda dentro del panel A, sobre el visor.

**Cámara**
- f780–989: fija.
- **f990–1004: empuje** z 1 → 1,6, ancla A = (540, 1363) (el total), `ease-out`. Se mantiene hasta f1049.
- Con el zoom: «189,99 €» a ≈ 61 px y la cara de Pausa en ≈ (119, 1326), dentro de la zona segura.

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 13 | 780 | 850 | «El problema: / **Chispa** decide primero.» (rojo) | 76 | ARRIBA (líneas base 380 y 456; el panel A empieza en 560) |
| 14 | 850 | 960 | «**Pausa** llega tarde.» (azul) | 80 | ARRIBA |
| 15 | 960 | 1050 | «Y cuando llega… / **Chispa** ya ha pagado.» (rojo) | 80 | ARRIBA |

**SFX:**
- f780: «swish» de la pantalla partida. Debajo, pasos rápidos (A) contra pasos lentos con chapoteo de taza (B).
- f810: «¡ding!» + «cha-ching».
- f814–960: impresora de tickets continua, que sube de tono.
- f960: jadeo.
- f990: «dun» grave del zoom.

**Transición:** corte seco a f1050.

**Por qué es el plano de más riesgo:** dos acciones a la vez, un atrezo nuevo con estados (la caja), el ticket que crece con una geometría que se recalcula en cada dibujo, el ticket rompiendo los marcos de los paneles y un empuje con recorte.

**Plan B** (si no da tiempo): sin pantalla partida. Plano único con la caja a la derecha y Pausa entrando por la izquierda, como en la slide 5. El ticket crece en el mismo plano, con los mismos tiempos y subtítulos.

---

### PLANO 6 · El villano · 1050–1289 (35,00–43,00 s)

**Papel:** niebla. Suelo 1210.
- **Chispa:** (500, 1060), s 1.15, `pose 'tiesa'`, `halo 9`. Va delante de todos los carteles.
- **Pausa:** en la esquina, `x 830, y 1350, s 0.5`, `pose 'duerme'`, `expr 'dormida'`.
  - Respira con `squash` 0,95 ↔ 1,00 (periodo de 40 f, en unos).
  - «z z z» en azul, 44 px, rot −8°, sobre su cúpula hacia (900, 1250): suben 40 px y se reinician cada 30 f.
  - En f1220, una «Z» grande (72 px) coincidiendo con «Pausa» del subtítulo 18.

**Carteles que caen** (la misma disposición que la slide 6, desplazada (−48, +180)). Cada uno cae desde y_final − 700 durante 6 f (`ease-in`, en unos) y aterriza con rebote: +18 en el f de aterrizaje, −6 a los 2 f, 0 a los 4 f. El giro pasa de 0 al final durante la caída.
| orden | atrezo | posición final, rot | empieza a caer | aterriza |
|---|---|---|---|---|
| 1 | `sign 'OFERTA FLASH'` (390 × 94, 56 px) | (252, 1250), 5° | 1050 | 1056 |
| 2 | `countdown('00:59')` s 0.84 | (188, 1094), −8° | 1068 | 1074 |
| 3 | `sign 'QUEDAN 2'` (300 × 94, 56 px) | (752, 1066), 8° | 1086 | 1092 |
| 4 | `sign 'SOLO HOY'` (300 × 88, 50 px) | (512, 856), −3° | 1104 | 1110 |
| 5 | `priceTag '−70 %'` s 0.6 | (270, 908), −12° | 1118 | 1124 |
| 6 | `priceTag '−50 %'` s 0.56 | (764, 896), 13° | 1130 | 1136 |
- **Temblor en cada aterrizaje** (pantalla): (0, +10), (−6, −4), (3, 2), (0, 0) en los 4 f desde el aterrizaje.
- **La cuenta atrás corre:** desde f1080 baja un segundo cada 10 f (00:59 → 00:58…). En f1289 marca 00:39. Solo cambia el texto (`countdown(label)`).

**Chispa: claves**
| f | expr | extras |
|---|---|---|
| 1050 | `neutral`, `look [0,−6]` (mira arriba) | |
| 1056 | `alarma` | respingo en cada aterrizaje: y −8 en el par del aterrizaje (o el siguiente), y 0 dos fotogramas después |
| 1092 | `alarma` | `sweat 3` |
| 1150 | **`espiral`** (nueva): las dos versiones de la espiral se alternan cada 2 f | vibra ±2 px |
| 1150–1289 | `espiral` | |

**Cámara:** temblores en los aterrizajes. Después, **empuje lento** z 1 → 1,12 en f1200–1289, ancla (500, 1000), `ease-io`. Con el zoom, la cara de Chispa y los carteles siguen en x 60–940.

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 16 | 1050 | 1130 | «Ofertas flash. / Cuentas atrás. «Quedan 2».». Sello por segmentos: «Ofertas flash.» en f1050, «Cuentas atrás.» en f1074, ««Quedan 2».» en f1092 (con su cartel) | **68** (línea 2 ≈ 26 caracteres; medir; si no cabe, 64) | ARRIBA |
| 17 | 1130 | 1210 | «Todo está diseñado / para hablar con **Chispa**…» (rojo) | 76 | ARRIBA |
| 18 | 1210 | **1330** | «…antes de que / **Pausa** se entere.» (azul). **Sigue sobre el corte al plano 7** y desaparece justo cuando Pausa se entera | 80 | ARRIBA |

**SFX:**
- Seis golpes de cartel que se aceleran (f1056, 1074, 1092, 1110, 1124, 1136).
- Tictac de la cuenta atrás desde f1080, uno cada 10 f.
- f1150: «wobble» de hipnosis.
- Ronquido suave en bucle.

**Transición:** corte seco a f1290. El subtítulo 18 sigue.

---

### PLANO 7 · La promesa · 1290–1529 (43,00–51,00 s) — **RIESGO ALTO**

**Decorado:** el del botón (§ 1), con la tapa levantada.

**Pausa** al empezar: `pose 'duerme'` (`flip`), `expr 'dormida'`, respira. Taza en el suelo en (684, 1388), asa ≈ (658, 1378).
**Correa** (con `leash()`), del asa de la taza al tobillo izquierdo de Chispa, G(C, −42, 118). Floja (sag 60) mientras no se diga otra cosa.

**Chispa: claves**
| f | x | y | s | pose | expr | extras |
|---|---|---|---|---|---|---|
| 1290 | 580 | 1273 | 1.0 | `tiesa` | `espiral` | anda hacia el botón |
| 1296 | 560 | 1267 | | `tiesa` | | paso (y −6) |
| 1302 | 540 | 1273 | | | | |
| 1308 | 520 | 1267 | | | | |
| 1310 | 520 | 1273 | | `tiesa` | **`euforia`** (ve el botón) | |
| 1312 | 520 | 1283 | | `shrug` | `euforia` | agachada |
| 1314 | 470 | 1180 | | `lunge` + `flip` + `limbs.armR [[150,60],[190,110]]` (alcanzar abajo) | `euforia` | `speed 4`, `halo 8` |
| 1316 | 430 | 1130 | | = | | |
| 1318 | 405 | 1112 | | = | | **la correa se tensa:** línea recta de 3,5 px |
| 1320 | 395 | 1110 | | = | | la mano queda en (205, 1220); arriba de la tapa en 1236: **16 px** |
| 1322–1328 | 395 ±3 (vibra) | 1110 | | = | `alarma` | estirada y frenada por la correa |
| 1330–1360 | 395 | 1110 | | = | `alarma` | **CONGELADO** (se mantiene el dibujo) |
| 1362 | 420 | 1180 | | `shrug` | `alarma` | correa floja, cae |
| 1364 | 470 | 1250 | | `shrug` | | |
| 1366 | 530 | 1283 | | `shrug` | | aterriza, `dust` |
| 1368 | 530 | 1273 | | `stand` (sin `flip`) | `esceptico`, `look [8,0]` (a Pausa) | «¿en serio?» |
| 1380 | 530 | 1273 | | `stand` | `neutral`, `look [0,2]` (a cámara) | `sweatIdx [1]` |
| 1424 | 530 | 1273 | | `happy` | `feliz` | |
| 1470 | 530 | 1273 | | `happy` | `orgullosa` (guiño a cámara) | |

**Pausa: claves** (en unos)
| f | qué | curva |
|---|---|---|
| 1318 | la taza del suelo da un tirón: x −14 y giro −15° | snap |
| 1320 | **se despierta de golpe:** `expr 'alarma'`, y −10 | snap |
| 1322 | `pose 'hold'` (`flip`): coge la taza (la taza pasa del suelo a su muñón) | snap |
| 1324 | **tirón:** `rot` 0 → +6 (se echa hacia atrás, lejos de Chispa) en f1322–1326 | ease-out |
| 1340–1350 | vuelve a `rot 0` y a `pose 'sit'`; `expr 'neutral'` | ease-io |
| 1350 | `expr 'esceptico'`, `look` hacia Chispa ([−8, 4] en local, girada) | snap |
| 1380 | `expr 'neutral'`, `look [0,6]` (a cámara) | snap |
| 1420–1436 | `pose 'brindis'`: la taza sube por encima de la cúpula (interpolar `arms` y `mug`), `expr 'brindis'` | ease-io |
| 1500–1520 | parpadeo lento (`lid` 0,5 → 1 → 0,5) | ease-in / ease-out |

**Cámara**
- f1330–1360: microempuje z 1,00 → 1,04, ancla (300, 1220) (el dedo y la tapa), en unos. Subraya el congelado.
- f1380–1400: z 1,04 → 1,12, ancla (620, 1250), `ease-out`. Plano de las dos.
- Con 1,12: la cara de Chispa ≈ (622, 1272) y la de Pausa ≈ (819, 1334), dentro de la zona segura.

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 18 | (1210) | 1330 | sigue del plano 6 | | |
| 19 | 1330 | 1410 | «Todos tenemos una / **Chispa** y una **Pausa**.» (rojo / azul) | 80 | ARRIBA. Entra con el congelado |
| 20 | 1410 | 1530 | «Aquí enseñamos a **Pausa** / a llegar a tiempo.» (azul) | 76 | ARRIBA |

**SFX:**
- f1290: ronquido.
- f1314: «whoosh».
- f1318: «twang» de cuerda tensa.
- f1320: respingo de Pausa.
- f1324: frenazo seco.
- f1330: rayado de disco.
- f1366: golpe de aterrizaje.
- f1380: acorde cálido.
- f1420: «clink» de brindis.

**Transición:** corte seco a f1530.

**Por qué es de riesgo alto:** muchos contactos que tienen que coincidir. La mano se queda a 16 px de la tapa. La correa pasa de floja a recta y otra vez a floja. La taza pasa del suelo a la mano. Y el congelado tiene que leerse como «a un milímetro».

**Plan B:** quitar la caminata hipnotizada (f1290–1310), empezar en f1290 con Chispa ya en el aire (como en f1314) y mantener los mismos tiempos de f1318 en adelante.

---

### PLANO 8 · Cierre y bucle · 1530–1679 (51,00–56,00 s)

**Decorado:** el del botón. **Cámara:** vuelve a z 1,0 en snap en f1530 (se nota como un corte).
**Estado al empezar:** Chispa (530, 1273), s 1.0, `cheer`. Pausa en `pose 'brindis'` (`flip`), `expr 'brindis'`. La correa va de la taza levantada al tobillo de Chispa, floja (sag 120).

**Chispa: claves**
| f | x | y | s | pose | expr | extras |
|---|---|---|---|---|---|---|
| 1530 | 530 | 1273 | 1.0 | `cheer` | `euforia` | `sweat 2` |
| 1536 / 1538 / 1540 / 1542 | 530 | 1233 / 1213 / 1233 / 1273 | | `cheer` | | salto + `burst` |
| 1560–1566 | 530 | igual que el salto anterior | | | | segundo saltito |
| 1594 | 530 | saltito −30 en f1594–1598 | | `cheer` | | con el punto rojo |
| 1630 | 530 | 1273 | | `stand` | `euforia`, `look [−6,6]` (mira el botón) | |
| 1646 / 1648 / 1650 / 1652 | 530 | 1273 | | `stand` + `limbs.legL` que alterna patada A/B | `euforia` | se zafa del lazo |
| 1654 | | | | | | **se suelta el lazo:** el extremo de la correa cae al suelo en f1654–1660 (3 dibujos) y queda en (520, 1402), lazo abierto |
| 1660 | 530 | 1288 | 1.0 | `shrug` | `euforia` | agachada |
| 1662 | 500 | 1150 | 1.03 | `lunge` + `flip` | `euforia` | `speed 4`, `halo 8` |
| 1664 | 450 | 1010 | 1.06 | `lunge` | | |
| 1666 | 410 | 920 | 1.09 | `lunge` | | |
| 1668 | 378 | 858 | 1.12 | `hold` | | |
| 1670 | 355 | 818 | 1.15 | `hold` | | |
| 1672 | 338 | 795 | 1.17 | `hold` | | |
| 1674 | 328 | 784 | 1.19 | `hold` | | |
| 1676 | 322 | 780 | 1.20 | `hold` | `euforia`, `look [0,4]` | `sweat 2` |
| 1678 | 321 | 779 | 1.20 | `hold` (**sin `flip`**) | `euforia`, `look [0,4]` | `sweat 2`, `fallLines` (= f0) |
| **→ 0** | 320 | 778 | 1.2 | `hold` | igual | **costura del bucle** |

**Pausa** (en unos)
| f | qué | curva |
|---|---|---|
| 1540–1550 | levanta la taza 10 px más | ease-io |
| 1600 | `squash` 0,96 → 1 en f1600–1610 (con el punto azul) | ease-out |
| 1640 | `expr 'esceptico'`, `look` hacia Chispa («Chispa…») | snap |
| 1660–1676 | de `brindis` a `sit` (interpolar `arms`/`mug`). La correa sigue al asa | ease-io |
| 1672 | `expr 'neutral'`, `look [8,6]` (a su taza, = f0). Se rinde | snap |
| 1679 | **igual que en f0:** `sit`, `neutral`, `look [8,6]`, `lid 0.5`; correa = trazado de reposo del § 1 | — |

**Subtítulos**
| # | in | out | texto | tamaño | posición |
|---|---|---|---|---|---|
| 21 | 1530 | 1590 | «¿Quién manda / en tu cabeza?» | 112 | ARRIBA (líneas base 410 y 522) |
| 22 | 1590 | 1680 | «Comenta ● o ●». Los «●» son círculos de tinta r 30: el primero rojo y el segundo azul. Se sellan en f1594 (rojo) y f1600 (azul) | 96 | ARRIBA, línea base 420 |
| 22b | 1590 | 1680 | «@dinero_irracional», DM Mono 500, 40 px, interletra 0,06, negro | 40 | centrado en x 500, línea base 520 |

**SFX:**
- f1530: golpe de pregunta.
- f1594: «pop» (rojo).
- f1600: «pop» (azul).
- f1640: suspiro.
- f1654: «fwip» del lazo.
- f1662: «whoosh» que enlaza con el silbido de caída de f0.

**Transición:** fin del vídeo. Instagram vuelve a f0 (ver bucle).

---

## 3. Portada, bucle y voz en off

### Portada
**Portada dedicada** `cover.png` (1080 × 1920), que se sube aparte en la app:
- **Base:** el estado del fotograma **f20** del plano 1: Chispa en `cheer` / `euforia` sobre el botón pulsado, monedas en el aire y Pausa con su taza sin enterarse.
- **Cambios respecto a f20:**
  - Título «En tu cabeza / viven dos.» a **150 px**, líneas base 470 y 610 (≈ 846 px de ancho; medir).
  - Las monedas con y < 640 se quitan, para que no pisen el título.
  - Sin temblor ni rótulo «¡CLAC!».
- **Recorte de la cuadrícula** (1080 × 1350 central = y 285–1635): título, Chispa, botón y Pausa quedan dentro. **Probar a 150 px de ancho:** el título debe leerse y la cara de Chispa reconocerse.

**Respaldo dentro del vídeo:** fotograma 20.

### Bucle
- **f1678 → f0:** el último dibujo de Chispa (321, 779, s 1,2, `hold`, `euforia`, `fallLines`) es casi idéntico al de f0 (320, 778). El salto de f1662–1678 desacelera hacia la cumbre y f0–6 acelera la caída: se lee como un único arco.
- **Pausa** termina en el mismo estado que en f0 (`sit`, `neutral`, `look [8,6]`), y la **correa** queda en el suelo con el trazado de reposo que ya está en el plano 1. Por eso el plano 1 enseña la correa en el suelo desde el principio.
- **Botón:** levantado en f1679 y en f0. **Cámara:** z 1,0 en los dos.
- **Texto:** «Comenta ● o ●» y el usuario salen en f1680; «En tu cabeza viven dos.» entra en f0 con su sello. Es un cambio de tarjeta normal.
- **Sonido:** el «whoosh» de f1662 enlaza con el silbido de caída de f0.

### Voz en off (español neutro; opcional, se graba en la app)
Ajustada a los subtítulos. Entre paréntesis, las réplicas opcionales con voz de personaje.

| Tiempo | Texto |
|---|---|
| 0,0 s | «En tu cabeza viven dos. (1,7 s) Y una acaba de gastarse tu dinero.» |
| 5,2 s | «Esta es Chispa: (7,7 s) rápida, impulsiva, decide sin preguntar.» |
| 9,7 s | *(Chispa)* «¡Ya, ya, ya!» |
| 12,8 s | «Y esta es Pausa. (14,9 s) Tranquila, hace las cuentas… (16,5 s) cuando llega.» |
| 17,7 s | *(Pausa, despacio)* «Espera… déjame pensarlo.» |
| 19,0 s | «Ojo, Chispa no es la mala: (22,3 s) sin ella tardarías media hora en cruzar la calle.» |
| 26,0 s | «El problema es que Chispa decide primero, (28,3 s) Pausa llega tarde… (32,0 s) y cuando llega, Chispa ya ha pagado.» |
| 35,0 s | «Ofertas flash, cuentas atrás, «quedan dos»: (37,7 s) todo está pensado para hablar con Chispa (40,3 s) antes de que Pausa se entere.» |
| 44,3 s | «Todos tenemos una Chispa y una Pausa. (47,0 s) Aquí enseñamos a Pausa a llegar a tiempo.» |
| 51,0 s | «¿Quién manda en tu cabeza? (53,0 s) Comenta rojo o azul.» |

---

## 4. Activos nuevos

Cada pose o expresión nueva se construye como variante en `characters/riso/riso.js`, como pide la regla de ampliación de la biblia, y se prueba a 150 px. El atrezo de un solo uso puede ir en el render del Reel.

### Personajes
| # | Activo | Especificación | Prioridad |
|---|---|---|---|
| A1 | **Chispa `golpe`** | Los dos puños abajo, sobre lo que golpea. Con `limbs`: `armL [[−140,70],[−70,132]]`, `armR [[138,70],[70,132]]`; piernas recogidas `legL [[−62,92],[−44,108]]`, `legR [[58,90],[40,108]]`. Manos en y local 132. Se usa en los planos 1 y 5 | Alta |
| A2 | **Chispa `corre_a` / `corre_b`** | Ciclo de carrera de 2 dibujos. A: `legL [[−70,86],[−112,96]]`, `legR [[56,96],[60,122]]`, brazos de `lunge`. B: piernas cambiadas (`legL [[−40,96],[−44,122]]`, `legR [[74,84],[104,100]]`), brazo derecho atrás `[[118,60],[96,88]]`. Siempre con `lean −12` y `speed 4` | Alta |
| A3 | **Chispa `frena`** | Derrape: piernas adelantadas y rígidas (`legL [[−20,98],[10,122]]`, `legR [[62,96],[96,118]]`), brazos atrás (`armL [[−140,20],[−170,4]]`, `armR [[120,10],[100,−20]]`). Con `lean +8` | Media |
| A4 | **Chispa `expr 'espiral'`** | Hipnosis. Blancos de r 20 (como en euforia) con una espiral negra de 4 px (2,5 vueltas) en lugar de pupila. Dos dibujos (espiral girada 0° y 90°) que alternan en «dos». Cejas de `alarma` y boca pequeña de `alarma`. Probar a 150 px: debe leerse como «hipnotizada», no como «mareada por el alcohol» | Alta |
| A5 | Chispa, patada para zafarse | Solo `limbs.legL` alternando A `[[−60,90],[−80,110]]` / B `[[−30,98],[−36,124]]`. No es una pose de librería | Baja |
| A6 | **Pausa: parámetro `lid`** | `pausa({ lid })` sobrescribe el 0,5 de `halfEyes` (0 = abierto, 1 = cerrado). Hace falta para los parpadeos lentos (planos 1, 3 y 7) y el sorbo. Cambio pequeño en la librería | Alta |
| A7 | **Pausa: `arms` / `mug` sobrescribibles** | `pausa({ arms, mug })`, como `limbs` en Chispa, para interpolar entre poses (`sit` ↔ `sorbo` ↔ `brindis`). La correa sigue al asa | Alta |
| A8 | **Pausa `sorbo`** | `arms [[140,80,112,66]]`, `mug [100,56]`. La taza se acerca a la comisura y apenas toca el borde inferior del ojo derecho. `lid 0,8`. Probar a 150 px | Media |
| A9 | Chispa `chisporroteo` (opcional) | Segunda versión de `CHISPA_TEETH` (±0,08 por lóbulo, mismas 3 puntas) que alterna cada 2 f en reposo (biblia § 9). Se puede omitir | Baja |

### Atrezo
| # | Activo | Especificación | Prioridad |
|---|---|---|---|
| P1 | **`buyButton(x, groundY, s, pressed)`** | Base negra de 360 × 56 y rx 10. Tapa roja de 320 × 100 y rx 22 (pulsada: 320 × 78, 26 px más abajo). «COMPRAR YA» en reserva, Bricolage 800, 64·s px. Sin logos. Planos 1, 7 y 8 | Alta |
| P2 | **`coinBlank(x, y, r, rot, edge)`** | La moneda **sin «€»** (`coin()` lleva «€» y el guion pide monedas sin divisa). Cara: disco azul con un aro de reserva de 2,5 px. Canto (`edge`): elipse azul de rx r y ry 0,3 r, girada. Halo de reserva de 5 px en la plancha azul, para que se lea sobre Pausa | Alta |
| P3 | `fallLines(x, y)` | 3 trazos negros verticales de 5 px y 40 px de largo, separados 34 px, sobre la cúpula | Baja |
| P4 | `inkSplash(x, y, step)` | Mancha roja irregular (8 lóbulos) de r 60 → 110, con 5 `teardrop` rojas que salen en abanico. 3 dibujos | Media |
| P5 | `dust(x, y, r)` | Nube de semitono negro claro (`rmax 2`), círculo con 3 bultos | Baja |
| P6 | **`ball(x, y, r, rot)`** | Disco negro con 3 costuras curvas en reserva (tipo voleibol genérico, sin marca) y 3 líneas de movimiento | Media |
| P7 | **`trafficLight(state)`** | Palo y caja negros. Lámpara roja (`on` = tinta roja; `off` = aro de reserva) y lámpara azul (lo mismo). Sin figuras ni texto | Media |
| P8 | `zebra()` / calzada | Banda de semitono claro con 6 franjas de reserva inclinadas 10° | Baja |
| P9 | `thinkDots(n)` | 1–3 círculos azules de r 8 en arco sobre la cúpula de Pausa | Baja |
| P10 | **`register(state)`** | Caja registradora genérica (ver plano 5). Estados: `idle` («0,00», cajón dentro) y `rung` («189,99», cajón fuera y `burst`). Sin marca | Alta |
| P11 | **Ticket que crece** | `ticket(pts, w, {len, totalSize})`: trunca la polilínea a `len` y pone el final rasgado en el extremo. El total solo aparece cuando `len` llega al total. Total a 34 / 38 px | Alta |
| P12 | `countdown(x, y, rot, s, label)` | El del carrusel con el texto como parámetro | Baja |
| P13 | Correa tensa y lazo abierto | `leashTaut(p0, p1)`: recta de 3,5 px. `leashLoose(p0, p1, sag, open)`: el `leash()` del carrusel con la opción de lazo abierto para la correa en el suelo | Media |
| P14 | `panelFrame(x0, y0, x1, y1)` | Marco negro de 8 px y rx 14 para las viñetas (planos 4b, 4c y 5) | Baja |
| P15 | `steamAlt` | Segunda versión del vapor de `mug()` (curvas en espejo) para que el vapor respire cada 8 f | Baja |
| P16 | Rótulos de sonido | «¡CLAC!» y «¡DING!» con `text()`: Bricolage 800, negro, con sello | Baja |
| P17 | Componente de subtítulo | `captionCard({lines, size, inF, f, segments})`: sello 1,08 → 1,03 → 1,00 y sello por segmentos. Usa `richText()` y `measurer()` | Alta |

**Lo que se reutiliza tal cual:**
- Chispa: `hold`, `cheer`, `happy`, `shrug`, `lunge`, `stand`, `hips`, `tiesa`, `compra` (con `bag`).
- Pausa: `sit`, `hold`, `llega`, `duerme`, `brindis`.
- Expresiones: Chispa `euforia`, `feliz`, `neutral`, `orgullosa`, `alarma`, `esceptico`; Pausa `neutral`, `alarma`, `jadeo`, `dormida`, `brindis`, `esceptico`.
- Atrezo: `priceTag`, `sign`, `burst`, `pausaSweat`, `shadowEllipse`, `liftedShadow`.
- Del carrusel: `ticket()`, `countdown()`, `leash()`, `shiftPlate()`, `clipLayers()`, `G()`.

---

## 5. Cambios respecto al texto del guion (con motivo)

1. **«Sin ella, tardarías media hora en cruzar la calle.»** tiene 9 palabras (el máximo es ~7 por tarjeta). Se parte en dos tarjetas: «Sin ella, tardarías / media hora…» y «…en cruzar la calle.». Las palabras no cambian.
2. **«“Quedan 2”»** pasa a **«Quedan 2»**: la biblia (§ 8) pide comillas latinas, como en la slide 6. Lo mismo en la voz en off.
3. **«Comenta 🔴 o 🔵»:** en pantalla, los emojis son círculos de tinta roja y azul (un emoji en color rompería las tres tintas). En el SRT y el pie de foto se quedan los emojis.
4. **«Aquí enseñamos a Pausa a llegar a tiempo.»** tiene 8 palabras y se deja literal (es la promesa de la cuenta). Va en 2 líneas y está 120 f en pantalla, más que los 72 que pide la regla.
5. **Rótulos de sonido «¡CLAC!» y «¡DING!»:** salen de la acción del guion, para quien ve sin sonido. No son subtítulos ni van en el SRT. Se pueden quitar sin tocar nada más.
6. Los subtítulos 2 y 18 ocupan más que su bloque del guion: el 2 cubre la carrera de entrada y el 18 cruza el corte al plano 7 y desaparece cuando Pausa se despierta. Así no hay huecos sin texto. El único momento sin subtítulo nuevo es f1290–1330, y el 18 sigue en pantalla.
7. **Idea opcional, no incluida:** la frase de Pausa «Chispa, no.» (biblia § 2) durante el tirón (f1324–1360), en azul. No está en el guion aprobado; queda a decisión del dueño de la cuenta.

## 6. Mapa de riesgos (de más a menos)

1. **Plano 5, la carrera y el ticket (ALTO).** Pantalla partida, caja con estados, ticket que crece en cada dibujo y rompe los marcos, empuje con recorte. *Mitigación:* construir primero el ticket que crece en solitario. Hay plan B de plano único.
2. **Plano 7, el tirón (ALTO).** Contactos exactos (mano a 16 px de la tapa, correa floja → tensa → floja, la taza del suelo a la mano) y un congelado que debe leerse como «a un milímetro». *Mitigación:* calcular la correa siempre con `G()` desde el asa y el tobillo de cada fotograma, nunca a mano. Hay plan B.
3. **Plano 8, la costura del bucle (MEDIO-ALTO).** f1676–1679 y f0–4 deben verse como un único salto. *Mitigación:* renderizar f1670–1679 + f0–10 seguidos en una tira de prueba antes de dar el plano por bueno. Comprobar también la correa y la pose de Pausa.
4. **Plano 3, la plancha que llega tarde (MEDIO).** Técnicamente es sencillo (`shiftPlate`), pero el chiste depende de que las pupilas «flotando» se lean como Pausa. *Mitigación:* revisarlo a tamaño de móvil. Si no se entiende, que la plancha empiece a 400 px (que se vea entrar desde el borde) en vez de a 720.
5. **Activos nuevos de personaje:** A4 `espiral` y A2 `corre_a/b` (MEDIO). Hay que validarlos a 150 px antes de animar los planos 2, 5 y 6.
6. **Plano 1, las monedas (MEDIO-BAJO).** Son cálculo, no dibujo. Ojo al `knockFor` para que no salga ciruela sobre Chispa ni sobre Pausa.
7. **Planos 4 y 6 (BAJO).** Caídas con rebote y poses existentes.

**Coste:** Chispa en «dos» supone ≈ 840 dibujos de personaje como máximo, y casi todos son poses de la librería con desplazamiento. Las únicas animaciones «nuevas» son el ciclo de carrera (2 dibujos), las espirales (2) y la patada (2). Lo demás es timing, cámara y atrezo.
