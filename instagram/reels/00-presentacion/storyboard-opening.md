# Reel 00 · Apertura v4 — «Kahneman y los dos sistemas» (storyboard del bloque nuevo)

**Qué cambia:** las tarjetas c1–c2 («En tu cabeza viven dos.» / «Y una acaba de gastarse tu dinero.», f0–94) se sustituyen por un bloque de **329 f (10,97 s)** con cinco tarjetas N1–N5. c3…c22 no se tocan y se desplazan **+234 f**. Total: **1368 f = 45,6 s** (1134 − 95 + 329). 30 fps, 1080×1920, papel niebla, estilo Riso. Datos máquina: `opening-v4.json`.
**Qué NO cambia:** `scene.js` no se toca en esta entrega; todo lo de c3…c22 (dibujo, poses, cámara, efectos) queda idéntico, solo más tarde.

## 0. Un cambio respecto al borrador de voz (y por qué)
El borrador cerraba con «Chispa será el 1. Pausa, el 2.». Eso choca con el empalme: las últimas 36 f del bloque son la carrera de entrada de Chispa (antiguo f58–94: agacharse, lanzarse, barrido, correr, frenar) y en ellas **solo se ve a Chispa**. Con el orden del borrador, la voz diría «Pausa, el 2.» sobre una pantalla donde Pausa ya no está (≈1 s de desajuste). Por eso la última línea pasa a **«Pausa será el 2. Chispa, el 1.»**: Pausa se nombra con ambas en pantalla, y «Chispa, el 1.» cae justo cuando Chispa se agacha y sale disparada, y enlaza con «Esta es Chispa.». N3 y N4 siguen el orden de Kahneman (1, luego 2). Si el dueño prefiere el orden del borrador hay que alargar el bloque ≈ 27 f (ver preguntas abiertas).
Otros ajustes menores: se quita «El» de N3/N4 («Sistema 1: …»), para que quepa en ≈ 10 s. Texto de pantalla = texto de voz (con cifras «1», «2»; el TTS las lee «uno», «dos»: comprobado con Piper A).

## 1. Voz y tarjetas (voz A, Piper; duración medida con `voiceover.py --preset A`)
Regla: tarjeta = inicio de voz … fin de voz + 0,18 s. Fin exclusivo.

| Tarjeta | Fotogramas | s | Dur. | Voz (dur.) | Texto en pantalla (líneas) |
|---|---|---|---|---|---|
| N1 | 0–54 | 0,00–1,83 | 55 f | «Daniel Kahneman, Nobel de Economía,» (1,64 s) | «Daniel Kahneman,» / «Nobel de Economía,» |
| N2 | 55–117 | 1,83–3,93 | 63 f | «explicó que decides con dos sistemas.» (1,92 s) | «explicó que decides» / «con dos sistemas.» |
| N3 | 118–185 | 3,93–6,20 | 68 f | «Sistema 1: rápido e impulsivo.» (2,10 s) | «**Sistema 1:**» (rojo) / «rápido e impulsivo.» |
| N4 | 186–256 | 6,20–8,57 | 71 f | «Sistema 2: lento y reflexivo.» (2,19 s) | «**Sistema 2:**» (azul) / «lento y reflexivo.» |
| N5 | 257–328 | 8,57–10,97 | 72 f | «Pausa será el 2. Chispa, el 1.» (2,22 s) | «**Pausa** será el **2.**» (azul) / «**Chispa**, el **1.**» (rojo). Sello por segmentos: línea 1 en f257, línea 2 en f295 |
| c3 | 329… | 10,97 | — | «Esta es Chispa.» | (sin cambios) |

Voz total 10,05 s; bloque 10,97 s. Huecos de voz entre tarjetas: 0,18 s (5–6 f), ninguno mayor. Palabras por tarjeta 4–6, ≥ 1,2 s por cada 4 palabras en todas.
Tipografía: Bricolage Grotesque 800, ancho 75 %, `opsz` 96, interletra −0,01 em, interlineado 1,0. Tamaño objetivo 104 px (N1 100), con el ajuste automático de siempre (`CAP.prepare`, máx. 840 px de ancho, bajar de 4 en 4). **Nunca por debajo de 84 px** (altura de mayúscula ≥ 62 px; si «Nobel de Economía,» no cabe a 84, partir en 3 líneas no: bajar a 84 y listo). Primera línea con la parte alta en **y 256** (las tarjetas antiguas están en 240; no se tocan). Centrado en x 500. Entrada: `pop6` existente (0,85 → 0,95 → 1,05 → 1,03 → 1,01 → 1,0 en 6 f), corte seco a la salida.
Tintas: negro por defecto; «Sistema 1:» rojo; «Sistema 2:» azul; en N5 «Pausa… 2.» azul y «Chispa… 1.» rojo (cada una habla en su tinta; nunca ciruela sobre una cara).

## 2. Línea de fuente (en pantalla)
- **Texto** (DM Mono 500, **30 px**, interletra 0,06, negro, centrado en x 500; el título del libro en DM Mono *cursiva*):
  - línea a: «Kahneman (2011),» · línea b: «*Pensar rápido, pensar despacio*». Líneas base **y 492 y 530**.
  - Entra con sello 1,08 → 1,03 → 1,00 en **f12** (tras el golpe del ¡CLAC! y para no tapar el gancho) y sale en corte seco en **f118** (con N3). Visible 106 f.
- **Aviso de metáfora (BIBLE § 11):** línea c, DM Mono 500 30 px, «Son metáforas, no zonas del cerebro.», línea base **y 568**. Entra con sello en **f61** (6 f después del cambio a N2) y sale en f118.
- Zona: todo entre y 470 y 575, x 130–870; bajo el bloque de tarjeta (que acaba en y ≈ 440) y sobre los personajes (y > 760). Sin fondo. Si la línea b mide > 840 px, bajar a 28 px.

## 3. Escenario y reparto
Decorado «el botón» (el del plano 1; **mismo encuadre que f0**): suelo G = 1460, botón `buyButton` en x 262 (s 1,2), pulsado desde f5. Chispa s 1,05 de pie sobre la tapa (`YST1`), con `halo: 8`. Pausa `sit`, `flip`, x 742, s 1,0, con correa en reposo. Nada se sale de x 60–940 salvo cuerpos (la cara de Pausa queda en x < 940 en todo el bloque).

**Reutilizado (nada nuevo en personajes):** Chispa `hold` (caída), `golpe`, `cheer` (saltitos de 8 f: y 0, −30, −44, −30), `happy`, `stand`, `shrug`, `lunge`; expresiones `euforia`, `feliz`, `neutral`, `esceptico`; extras `sweat`, `sweatIdx`, `burst`, `fallLines`, `motionLines`, `limbs.legL` (golpeteo A/B, el mismo de c22). Pausa `sit`, `sorbo`; expresión `neutral`; parámetros `look`, `lid`, `squash`; `thinkDots`; `RIG.blinkSlow`; vapor `steamAlt`.
**Etiquetas (único atrezo nuevo, ver § 8):** `sign()` de `riso.js` ya existe (texto en reserva, `ink` rojo/azul) → píldoras «SISTEMA 1» / «SISTEMA 2». Y un `dotBadge()` circular (punto con cifra opcional).

Cadencia: Chispa en «dos» (cambios solo en fotogramas pares), Pausa en «unos» interpolada, atrezo en «dos», cámara y texto en «unos» (reglas del storyboard principal).

## 4. Cámara (z = zoom, ax = ancla x; ancla y = 1150 como en el código actual)
| f | z | ax | curva |
|---|---|---|---|
| 0–8 | 1,00 → 1,12 | 470 | ease-out (gancho existente, idéntico) |
| 8–34 | 1,12 → 1,14 | 470 | lineal |
| 34–54 | 1,14 → 1,10 | 470 | lineal |
| **55–58** (N2) | 1,10 → 1,03 | 470 | ease-out, **golpe hacia fuera** |
| 58–117 | 1,03 → 1,06 | 470 | lineal |
| **118–121** (N3) | 1,06 → 1,11 | 470 | ease-out, **golpe hacia dentro** |
| 121–185 | 1,11 → 1,13 | 470 | lineal |
| **186–189** (N4) | 1,13 → 1,05 | 470 → 680 en f186–200 (ease-io) | ease-out, golpe hacia fuera + **paneo hacia Pausa** |
| 189–256 | 1,05 → 1,08 | 680 | lineal |
| **257–260** (N5) | 1,08 → 1,12 | 680 → 540 en f257–265 (ease-out) | golpe hacia dentro |
| 260–290 | 1,12 → **z₀** | 540 | lineal; **z₀ = z antiguo de f57** (≈ 1,040; leerlo del código: `punch(57)`) |
| 291–328 | = `punch(v − 234)` | 540 | exactamente la cámara antigua de f57–94 |
Comprobaciones: con ax 470 y z ≤ 1,14 (como ya aprobado en f0–34) la cara de Pausa queda < 940; con ax 680 y z 1,08 el cuerpo de Pausa llega a x ≈ 960 y la cara a ≈ 780; el lado izquierdo de Chispa queda en x ≥ 80. Nunca más de 4 f sin que algo se mueva (la cámara deriva siempre).
Temblor del impacto en f5–9 (existente): se mantiene idéntico.

## 5. Plano a plano

### N1 · f0–54 · «Daniel Kahneman, / Nobel de Economía,» (gancho)
- **f0–42 = idénticos a los f0–42 antiguos** (misma caída, ¡CLAC! en f5, monedas, saltitos de Chispa, temblor, cámara). Solo cambia la tarjeta. Gancho: movimiento en el f0 (Chispa cae con `fallLines`, cámara empujando) + tarjeta en negrita con su pop en el f0. El f0 de vídeo es igual que antes, así que `cover.png` y el bucle no cambian.
- **f43–54:** el mapa pasa a 1:1 del antiguo tc 51–62: Chispa `happy`/`feliz`, `look [0,2]`, vibra ±1 px, `sweatIdx [1]`; en f50 y f52 un respingo y −8 px (para no quedarse quieta). Pausa: parpadeo lento ya en curso (`blinkSlow`) y vapor alterno.
- **Rótulo «¡CLAC!»:** f5–18 como antes.
- Fuente: entra en f12.
- SFX: f5 `clac`, f5 `coins` (existentes).
- Transición: corte seco + golpe de cámara a N2 (f55).

### N2 · f55–117 · «explicó que decides / con dos sistemas.»
- **Chispa:** f55 `happy` aterriza (squash 0,95 → 1 en 4 f). Desde **f59** saltitos `cheer`/`euforia` en ciclo de 8 f (y 0, −30, −44, −30), continuos hasta f114; aterriza f115 (`feliz`). `look [0,2]` a cámara; `sweat 2`.
- **Pausa** (unos): f55–66 `look` → [0,6] (a cámara, ease-io); f95–103 `look` → [−8,4] (mira a Chispa, ease-io). Vapor alterno cada 8 f, respiración.
- **«Dos»:** f89 **punto rojo** (`dotBadge`, r 30) sobre Chispa en (262, 880), sello 1,3 → 1,0 en 3 f; f95 **punto azul** (r 30) sobre Pausa en (742, 1085), mismo sello. Coinciden con «dos sistemas» (≈ f89–113 de la voz).
- Fuente: línea c («Son metáforas…») entra en f61.
- SFX: f55 `swoosh`; f89 `boing` (agudo), f95 `boing`.
- Transición: corte seco + golpe de cámara a N3 (f118); los puntos se convierten en la píldora (ver N3).

### N3 · f118–185 · «**Sistema 1:** / rápido e impulsivo.»
- **Etiqueta:** el punto rojo se sustituye en f118 por la píldora roja **«SISTEMA 1»** (`sign`, w 360, h 92, texto Bricolage 800 50 px en reserva, rot −4°) centrada en **(300, 820)** (x 120–480). Sello 1,3 → 1,0 en f118–120; luego se mueve con una oscilación de ±3 px cada 2 f. Con `knockFor` donde pise algo.
- **Chispa:** foco. Saltitos `cheer`/`euforia` seguidos, ciclo de 8 f (el pico llega a y ≈ 950, por debajo de la píldora, que acaba en y ≈ 866), `sweat 3`, `burst` en cada pico, `motionLines` rojas/negras a ambos lados alternando versión cada 2 f (f118–185). Se ve «rápido».
- **Pausa:** f118–128 `look` → [−8,4]; **parpadeo lentísimo** `blinkSlow` en f140–170 (baja 8, cerrado 8, sube 14) para el contraste lento/rápido; vapor, respiración.
- Fuente y aviso salen en f118 (corte).
- SFX: f118 `pop`; `boing` en f134 y f150 (dos de los saltos, volumen bajo).
- Transición: corte seco + golpe de cámara a N4 (f186). La píldora roja pasa a **punto rojo r 26** en (262, 900) hasta f257.

### N4 · f186–256 · «**Sistema 2:** / lento y reflexivo.»
- **Etiqueta:** píldora azul **«SISTEMA 2»** (`sign`, tinta azul, rot +4°) centrada en **(660, 1060)** (x 480–840), sello en f186–188. La cara de Pausa (≈ 700–780, y ≥ 1200) queda libre.
- **Pausa (foco, en unos):**
  - f186–204 sube la taza: `arms`/`mug` interpolan de `sit` a **`sorbo`** (ease-io).
  - f204–216 bebe: `lid` 0,5 → 0,8 (ease-io); vapor alterno.
  - f216–226 mantiene (respira).
  - f226–246 baja la taza de `sorbo` a `sit` (ease-io); `lid` vuelve a 0,5.
  - **`thinkDots`** (azul) sobre la cúpula: 1 punto en f196, 2 en f210, 3 en f224; se borran en f240.
- **Chispa:** aterriza en f186 (`stand`, `neutral`, `look [8,0]` hacia Pausa, `sweatIdx [1]`). Impaciente: golpeteo de pie (`limbs.legL` A/B cada 4 f) y vibra ±1. Es el contraste con N3 (no está en el aire a propósito). En f240 pasa a `esceptico` (snap) hasta f256.
- Punto rojo r 26 sobre Chispa (heredado de N3) hasta f257.
- SFX: f186 `slide` (llega la plancha azul tarde) + `swoosh`; `tick` lento en f204 y f228 (ritmo de Pausa).
- Transición: corte seco + golpe a N5 (f257); el punto azul pasa a la insignia «2».

### N5 · f257–328 · «**Pausa** será el **2.** / **Chispa**, el **1.**»
- **f257 (línea 1, azul):** insignia azul **«2»** (`dotBadge` r 54, cifra en reserva, Bricolage 800 64 px) sobre Pausa en (742, 1085), sello 1,3 → 1,0; el punto rojo de Chispa se retira. Pausa: `blinkSlow` desde f258 (baja 8, cerrado 8, sube 14 → termina en f288 con `lid` 0,5 = su estado antiguo en f57).
- **Chispa f257–275:** dos ciclos de saltitos `cheer`/`euforia` (aterriza en f275); f276–290 `happy`/`feliz`, `look [0,2]`, vibra ±1, `sweatIdx [1]` (= **estado antiguo de f57**: x 262 + vibración, y `YST1`, `halo 8`).
- **f291 = antiguo f57 (empalme exacto).** Desde aquí se reproduce **sin cambios** la secuencia antigua f57–94, +234:
  - f292–296 (antiguo f58–62) `shrug` agachada = anticipación; la tarjeta de línea 2 entra en **f295** («Chispa, el 1.», rojo) y la **insignia roja «1»** (`dotBadge` r 54) se sella sobre Chispa en (262, 880), sello 1,3 → 1,0, `burst`. Coincide con la voz «Chispa, el 1.» (≈ f295).
  - f297–304 (antiguo 63–70) `lunge` hacia la derecha; la insignia roja la sigue 2 f (`knockFor`) y se corta en f300.
  - f302–307 (antiguo 68–73): **barrido de 6 f** con líneas de velocidad (el existente).
  - f305–328 (antiguo 71–94): carrera de Chispa grande, frenazo y polvo.
- Botón: pulsado hasta el antiguo f63 (= f297), con el rebote de la tapa del antiguo f63–65.
- SFX: f257 `pop`; (antiguos, +234) `swoosh` f297, `whoosh` f302. No se añade `splash`: el existente va en f329.
- **Transición a c3: ver § 6.**

## 6. Empalme con c3 y bucle

### 6.1 Entrada a c3 («Esta es Chispa.», f329)
No hay corte ni salto, porque **los f291–328 son el tramo antiguo f57–94 sin cambiar**: Chispa grande (s 1,9) frena y gira a cámara en el antiguo f95 = nuevo **f329**, con el `pop` de la tarjeta, la salpicadura roja y el `splash`. Detalles:
1. **Paridad:** `delta_frames` = 234 es **par**. Chispa se muestrea «en dos» según la paridad del fotograma de salida; con un desplazamiento par, todos los dibujos de c3…c22 salen idénticos (con uno impar saldrían otros pares). No cambiar a un valor impar.
2. **Cámara:** en f291 vale `punch(57)` y de f291 a f328 se evalúa `punch(v − 234)`; en f329, `punch(95)` = 1,00 (c3 empieza en 1,00).
3. **Estado a f290/f291:** Chispa `happy`, `feliz`, x 262 ± 1, y `YST1`; Pausa `sit`/`neutral`, `look [8,6]`, `lid` 0,5, vapor `vapor` o `vapor2` según `floor(t/8)`: **recalcular la fase del vapor con el tiempo antiguo** (v − 234 desde f291), no con v.
4. **Tarjeta:** N5 sale en f329 en corte seco y c3 entra con su `pop6` (igual que c2 → c3 antes).
5. **Mapa de tiempo (SEGS):** `[0,43,0,51]`, `[43,55,51,63]` (1:1), f55–290 escena propia del bloque (con `t` fijo en 63 para botón/sombras/sin monedas), y desde 291 el resto de `SEGS` con **u0 y u1 + 234** (empezando por `[291,329,99,156]`). `WHIPS`, `WHIP_PAN` y `CARD_U` se recalculan con `outOf` (barrido en f302–307).
6. **Respiración de Pausa:** `breath()` usa `FRAMES / 13`; con 1368 f usar **`FRAMES / 15`** (período 91,2 f, casi igual que 87,2): 15 ciclos exactos, el bucle sigue sin salto. El salto de fase en el empalme es < 1,5 % de squash (< 4 px), invisible.

### 6.2 Bucle (f1367 → f0)
- **f0 es idéntico al antiguo f0** (Chispa en `hold`/`euforia`, `look [0,4]`, `sweat 2`, x 262, y de caída, `fallLines`, `liftedShadow`; botón levantado; Pausa `sit`/`neutral`/`look [8,6]`/`lid` 0,5, correa en reposo `REST_END`; cámara z 1,00, sin temblor). Lo único distinto es la tarjeta (N1 en vez de c1) y que el antiguo f0 → f1 sigue igual.
- **El último fotograma (f1367)** es el antiguo f1133 sin cambios: Chispa `hold` en la cumbre del salto (x 321, y 779, s 1,2 en coordenadas de storyboard), sin `flip`, `euforia`, `look [0,4]`, `sweat 2`, `fallLines`; Pausa `sit` `neutral` `look [8,6]` `lid` 0,5 con la taza abajo y la correa en el suelo (`leashRest`); botón levantado; cámara z ≈ 1,0005; sin barrido.
- La tarjeta saliente es c22 («Comenta ● o ●» + @dinero_irracional); entra N1 con pop en f0, un cambio de tarjeta normal (como antes).
- **Comprobar:** tira de prueba f1357–1367 + f0–10 (el salto debe leerse como un arco continuo), y que en f1367 Pausa y la correa coinciden con f0.
- Sonido del bucle: el `swoosh` del antiguo f1112 (+234 = f1346) enlaza con el silbido de caída de f0.

## 7. Tabla de planos (resumen)
| Id | f | s | Dur. | Beat |
|---|---|---|---|---|
| N1 | 0–54 | 0,00–1,83 | 55 | Gancho: la caída y el ¡CLAC! + «Daniel Kahneman, Nobel de Economía,» + fuente |
| N2 | 55–117 | 1,83–3,93 | 63 | «dos sistemas»: Chispa salta, Pausa mira; puntos rojo y azul; aviso de metáfora |
| N3 | 118–185 | 3,93–6,20 | 68 | Sistema 1 = Chispa, rápida (píldora roja, líneas de velocidad) |
| N4 | 186–256 | 6,20–8,57 | 71 | Sistema 2 = Pausa, lenta (píldora azul, sorbo, puntos de pensar), paneo |
| N5 | 257–328 | 8,57–10,97 | 72 | Asignación: insignias «2» y «1»; Chispa se lanza y entra corriendo (= antiguo f57–94) |

Regla «nada quieto más de 0,5 s» (15 f): en todo el bloque siempre se mueve algo de dibujo (saltitos de Chispa, golpeteo de pie, sorbo, parpadeo, puntos de pensar, vapor), además de la deriva de cámara. Tramos más sosegados: f43–54 (Chispa vibra y respinga, parpadeo de Pausa) y f216–226 (Pausa mantiene el sorbo; Chispa golpetea el pie).

## 8. Activos nuevos
| # | Activo | Especificación |
|---|---|---|
| B1 | `dotBadge(x, y, r, ink, label?)` | Disco de tinta (rojo o azul) radio r con aro de reserva de 3 px y, si hay `label`, la cifra en reserva (Bricolage 800, 1,15·r px). Halo de reserva de 6 px en la plancha opuesta. Se usa con r 26 (marcador), 30 (puntos de N2) y 54 (insignias de N5). ≈ 10 líneas, va en el render del Reel. |
| B2 | Píldoras «SISTEMA 1» / «SISTEMA 2» | **Sin código nuevo**: `sign(x, y, rot, label, {w:360, h:92, size:50, ink})` de `riso.js` con tinta roja/azul; si `sign()` no redondea las esquinas lo bastante, `rx` 46. |
| B3 | Línea de fuente | Texto DM Mono con `text()` y cursiva para el título (si no hay cursiva de DM Mono cargada, usar regular y poner el título entre «»). |
| — | Poses/expresiones nuevas | **Ninguna.** Todo es reutilizado. |

Prohibido en este bloque (BIBLE § 11): dibujar cerebros, cortes anatómicos, flechas a «zonas», rótulos tipo «amígdala/corteza»; nada de cara de Kahneman.

## 9. SFX del bloque (tipos de la biblioteca)
| f | tipo | nota |
|---|---|---|
| 5 | `clac` | existente |
| 5 | `coins` | existente |
| 55 | `swoosh` | golpe N2 |
| 89, 95 | `boing` | puntos |
| 118 | `pop` | N3 |
| 134, 150 | `boing` | saltos (gain bajo) |
| 186 | `slide`, `swoosh` | N4 |
| 204, 228 | `tick` | pensar lento |
| 257 | `pop` | N5 (≥ 2 s del anterior `pop`) |
| 297 | `swoosh` | = antiguo 63 + 234 |
| 302 | `whoosh` | = antiguo 68 + 234 |
Todos los demás efectos existentes con frame ≥ 57 se desplazan +234 (el `splash` pasa de 95 a 329). Los de frame 5 no cambian. Hay que revisar `sfx-mix.json`: sus claves son «frame:tipo» y también se desplazan (+234) salvo `5:coins`.

## 10. Voz: tiempos para `vo.json`
Mismas líneas de c3…c22 con `t` + 7,8 s (234/30). Líneas nuevas:
| t (s) | frame | texto |
|---|---|---|
| 0,000 | 0 | Daniel Kahneman, Nobel de Economía, |
| 1,833 | 55 | explicó que decides con dos sistemas. |
| 3,933 | 118 | Sistema 1: rápido e impulsivo. |
| 6,200 | 186 | Sistema 2: lento y reflexivo. |
| 8,567 | 257 | Pausa será el 2. Chispa, el 1. |
| 10,967 | 329 | Esta es Chispa. (antes 3,167) |
`duration` → 45,6 (ahora 37,8). Para la mezcla: `sfx.py --duration 45.6`.

## 11. Subtítulos (`captions.srt`, bloque nuevo; el resto se desplaza +7,8 s)
```
1
00:00:00,000 --> 00:00:01,833
Daniel Kahneman,
Nobel de Economía,

2
00:00:01,833 --> 00:00:03,933
explicó que decides
con dos sistemas.

3
00:00:03,933 --> 00:00:06,200
Sistema 1:
rápido e impulsivo.

4
00:00:06,200 --> 00:00:08,567
Sistema 2:
lento y reflexivo.

5
00:00:08,567 --> 00:00:10,967
Pausa será el 2.
Chispa, el 1.
```
(En el SRT la fuente va en el pie de foto del Reel, no como subtítulo.)

## 12. Mapa antiguo → nuevo
| Antiguo | Fotogramas antiguos | Fotogramas nuevos | Inicio nuevo | Texto |
|---|---|---|---|---|
| c1 | 0–42 | 0–42 (idénticos) → N1 | 0,00 s | (sustituida por N1) |
| c1/c2 (resto) | 43–56 | sustituidos por N1 (43–54), N2, N3, N4 y N5 (hasta 290) | — | — |
| c2 (cola) | 57–94 | 291–328 | 9,70 s | (cola de N5: carrera de entrada) |

| Tarjeta | Antiguo (f) | Nuevo (f) | Inicio nuevo | Texto |
|---|---|---|---|---|
| c3 | 95–126 | 329–360 | 10.97 s | Esta es Chispa. |
| c4 | 127–196 | 361–430 | 12.03 s | Rápida, impulsiva, decide sin preguntar. |
| c5 | 197–236 | 431–470 | 14.37 s | ¡Ya, ya, ya! |
| c6 | 237–271 | 471–505 | 15.70 s | Y esta es Pausa. |
| c7 | 272–318 | 506–552 | 16.87 s | Tranquila. Hace las cuentas |
| c8 | 319–345 | 553–579 | 18.43 s | cuando llega. |
| c9 | 346–390 | 580–624 | 19.33 s | Espera, déjame pensarlo. |
| c10 | 391–444 | 625–678 | 20.83 s | Ojo: Chispa no es la mala. |
| c11 | 445–499 | 679–733 | 22.63 s | Sin ella, tardarías media hora |
| c12 | 500–534 | 734–768 | 24.47 s | en cruzar la calle. |
| c13 | 535–603 | 769–837 | 25.63 s | El problema: Chispa decide primero. |
| c14 | 604–647 | 838–881 | 27.93 s | Pausa llega tarde. |
| c15 | 648–703 | 882–937 | 29.40 s | Y cuando llega, Chispa ya ha pagado. |
| c16 | 704–786 | 938–1020 | 31.27 s | Ofertas flash. Cuentas atrás. Quedan dos. |
| c17 | 787–853 | 1021–1087 | 34.03 s | Todo está diseñado para hablar con Chispa |
| c18 | 854–907 | 1088–1141 | 36.27 s | antes de que Pausa se entere. |
| c19 | 908–970 | 1142–1204 | 38.07 s | Todos tenemos una Chispa y una Pausa. |
| c20 | 971–1030 | 1205–1264 | 40.17 s | Aquí enseñamos a Pausa a llegar a tiempo. |
| c21 | 1031–1067 | 1265–1301 | 42.17 s | ¿Quién manda en tu cabeza? |
| c22 | 1068–1133 | 1302–1367 | 43.40 s | Comenta rojo o azul. |
Regla: nuevo = antiguo + 234 para todo f ≥ 57 (cartas, efectos, cámara, barridos). Total antiguo 1134 → nuevo 1368 (+234).

## 13. Preguntas abiertas
1. **Orden de N5:** ¿vale «Pausa será el 2. Chispa, el 1.» (por el empalme) o se prefiere el orden del borrador? Mantenerlo exige ≈ 27 f extra (bloque de 356 f, delta 262 par, total 1395 f = 46,5 s) con Pausa en pantalla hasta el final de «Pausa, el 2.» y la salida de Chispa justo después.
2. **Gancho:** «Daniel Kahneman, Nobel de Economía,» no habla al lector en la primera imagen. El dueño dijo que se mantiene; alternativa: N1 «Tu cabeza decide con dos sistemas.» y N2 «Lo explicó Kahneman, Nobel de Economía.» (la fuente entraría en N2). Se mide la voz si se quiere.
3. **«Nobel de Economía»:** el premio se llama formalmente «Premio del Banco de Suecia en Ciencias Económicas en memoria de Alfred Nobel» (2002, compartido con Vernon Smith). Es habitual y aceptado decir «Nobel de Economía»; se deja así.
4. **Portada:** `cover.png` conserva «En tu cabeza viven dos.» (no nombra a Chispa/Pausa y es más fuerte que N1). ¿Se mantiene?
5. **Pie de foto (`script.md`):** ya cita a Kahneman; conviene añadir «Kahneman (2011), *Pensar rápido, pensar despacio*» y «metáforas, no zonas del cerebro».
6. **Tamaño de N1:** «Nobel de Economía,» a 100 px puede no caber en 840 px; el ajuste automático lo bajará (mínimo 84 px). Se confirma al medir.
