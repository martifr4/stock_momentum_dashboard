# Art brief — Post 01 · El supermercado está diseñado para Chispa

**Formato:** carrusel, 11 slides, 1080 × 1350 · estilo Riso · mismo sistema de página que el post 00 (es la misma serie).
**Personajes:** **Chispa** (roja, Sistema 1) y **Pausa** (azul, Sistema 2), siempre en femenino.
**Biblia:** `/home/user/stock_momentum_dashboard/instagram/characters/BIBLE.md`. Lo que no diga este brief lo dice la biblia.
**Referencia de serie:** `/home/user/stock_momentum_dashboard/instagram/posts/00-presentacion/` (`render.js`, `notes.md`, `overview.png`). Copia de ahí los helpers `G()`, `clipLayers()`, `shiftPlate()` y el patrón de `ticket()`.
**Texto:** el de `copy.md` (v2), **literal**. No se reescribe, no se acorta y no se cambia la puntuación. Lo que el guion marca en **negrita** va en Bricolage 800. Hay dos dudas de texto que **bloquean** las slides 6 y 7 (ver «Bloqueos de texto»). Esas dos slides se maquetan con el texto literal y no se dan por cerradas hasta que responda el dueño de la cuenta.

> **Regla de código (obligatoria):** **no se toca** `characters/riso/riso.js`, porque el animador lo está cambiando ahora. Tampoco se importa nada de `characters/riso/anim/`, que también se está moviendo. Todo lo nuevo va en `posts/01-supermercado/props.js`, que hace `require('../../characters/riso/riso.js')` y exporta lo nuevo. Las poses nuevas se construyen **sin editar la librería**:
> - En Chispa, con el parámetro `limbs`, que sobrescribe codo y mano o rodilla y pie de una pose existente. Las extremidades siguen saliendo de los enchufes `SOCK`.
> - En Pausa, con los parámetros `arms` y `mug`.
> - El atrezo que lleva en la mano se dibuja en la posición global de la mano, calculada con `G()`.
>
> No hace falta ninguna expresión nueva. Si `riso.js` cambia de API mientras trabajas y algo se rompe, **no lo parchees en la librería**: anótalo en `notes.md` y avisa.

---

## La historia en 11 slides

El carrusel es **una ruta**: se entra por la puerta en la portada y se sale por la caja en la slide 9. El lector recorre el súper parada a parada con Pausa de guía, mientras Chispa cae en cada trampa.

| # | Beat | Imagen |
|---|---|---|
| 1 | Gancho: «entraste a por pan» | Chispa sale empujando un carrito desbordado; Pausa va montada encima, resignada |
| 2 | El mapa | Plano del súper, ruta azul y 7 paradas rojas; Pausa de guía con banderín; Chispa en la puerta con el carrito vacío |
| 3–9 | 7 paradas | Plantilla fija: parada + minimapa → título → explicación → escena de Chispa (izquierda) + rincón de Pausa con el antídoto (derecha) → fuente |
| 10 | La lista para guardar | Hoja de libreta arrancada con 7 casillas; Pausa satisfecha en la esquina |
| 11 | Tu turno | 7 botones de parada para comentar; Chispa sale **solo con el pan**; Pausa brinda |

**Arco emocional:** risa de reconocimiento (1) → curiosidad, «enséñame el mapa» (2) → «ay, esa soy yo» × 7, cada vez más cómplice (3–9) → alivio y utilidad (10) → participación y pequeña victoria (11).
**Arco del carrito:** lleno hasta arriba (1) → vacío en la puerta (2) → se va llenando parada a parada (3, 4, 9) → fuera el carrito: Chispa sale con una barra de pan (11). Es el remate visual del post; no se explica con texto.

---

## Sistema común (las 11 slides)

**Papel: «niebla» `#E6ECE4` en las 11 slides, también en la portada.** Grano normal, semillas de la biblia y desregistro estándar.
- **Por qué no lila en la portada:**
  - En el post 00 el lila de la portada fue una decisión expresa: hace que el **post fijado** destaque en la cuadrícula (`00-presentacion/notes.md`, ronda 2).
  - Si la portada del 01 también es lila, se pierde esa señal desde el primer post de contenido, y las dos portadas lila quedarían juntas en el perfil.
  - El gancho del 01 no depende del papel: lo hacen la cara de Chispa en rojo flúor y el carrito.
  - La hoja blanca de la slide 10 (reserva) resalta más sobre el niebla verdoso que sobre el lila.
- **Por qué no hielo:** queda demasiado cerca del niebla para servir de acento.
- **Consecuencia para la biblia:** su §4 dice «lila = portadas de serie», y eso contradice esta decisión. Ver «Decisiones abiertas».

**Cabecera:** `pageChrome({ n, total: 11, ink, post: 'N.º 01' })`, idéntica a la del post 00.
- «DINERO IRRACIONAL» a la izquierda y «N.º 01» a la derecha (DM Mono 24 px, línea base y = 92).
- Filete en y = 114.

**Pie:**
- Filete en y = 1236.
- «Desliza →» en las slides 1–10. En la 11 va `signoff: '@dinero_irracional'`, como en el post 00.
- Contador `01 / 11` … `11 / 11` y tira de progreso de 11 puntos. Con `total: 11` la tira va de x = 832 a 1012.
- **Tinta del punto actual:**
  - Rojo: 1 y 3–9 (las trampas son de Chispa).
  - Azul: 2 (Pausa guía) y 10 (su lista).
  - Ciruela: solo en la 11.

**Tipografía:**
- Titulares en Bricolage 800 (ancho 75 %), negro.
- «Chispa» y «Pausa» van en su tinta **solo a ≥ 56 px**. En texto corrido van en negro.
- Texto corrido en Bricolage 600 (ancho 88 %), 38–40 px, interlineado 1,2, negro.
- Etiquetas en DM Mono 500.
- Todo el texto alineado a la izquierda, salvo donde se indique.
- Espacio de no separación (U+202F o U+00A0) entre cifra y «€» o «%», para que nunca se partan. No es reescribir: es composición.

**Emojis del guion:** se dibujan en tinta, nunca como glifos de emoji (criterio del post 00).
- 🔵 → disco azul de r 12.
- 📌 → chincheta en rojo (cabeza) y negro (aguja).
- 📤 → avión de papel en tinta negra, el icono de «enviar» de Instagram. Así se evita una flecha hacia arriba que pueda leerse como gráfico.

**Personajes:**
- Chispa nunca rota más de ~8° (usa `lean`).
- Nada de ciruela en las caras: usa `knockFor` o `halo` cuando se pisen con algo de la otra tinta.
- Sombra de suelo en semitono bajo quien toque el suelo.
- Solo en las slides 1 y 11 pueden los personajes pisar el filete del pie.

**Atrezo de súper:**
- Envases **genéricos y en blanco**: cajas, botellas, latas, bolsas de snack, cartón de leche, huevera y barra de pan.
- **Sin marcas ni logos, y sin texto en los envases.** Las «etiquetas» son bandas en reserva o rayas.
- Los envases van en negro y rojo; el **azul es solo de Pausa**, de su ruta y del sudor de Chispa.
- **Precios solo donde los pone el guion:** 43 € (slide 1) y 4 €, 2 €, 3 €, 6 € y 25 % (slide 7). En el resto, las etiquetas de precio son formas sin cifras.
- **Nada de imaginería de bolsa:** ni flechas arriba o abajo, ni barras, ni líneas de cotización. Ojo con las baldas, el minimapa y las «líneas de mirada»: que no se lean como gráficos.

---

## Geometría del súper (compartida por el mapa, el minimapa y las escenas)

Defínela **una sola vez** en `props.js` como `STORE` (coordenadas locales del plano, origen arriba a la izquierda, 888 × 610 de paredes y 40 px de etiquetas debajo). El mapa de la slide 2 y el minimapa de las slides 3–9 son la **misma función a dos escalas**, de modo que el lector reconoce el recorrido.

| Elemento | Coordenadas locales | Dibujo |
|---|---|---|
| Paredes | rect. 0,0 → 888,610, esquinas r 16 | Línea negra de 6 px (3 px en el mini) |
| Puerta de entrada | hueco en la pared inferior, x 724–824 | Sin pared; etiqueta `ENTRADA` debajo, fuera del plano |
| Salida junto a la caja | hueco en la pared inferior, x 105–155 | Sin pared |
| Mostrador del fondo | x 600–860, y 8–44 | Negro lleno con `FONDO` en reserva (DM Mono 500, 22 px, interletra 0,12) |
| Góndolas (4) | x 84–134, 264–314, 444–494, 624–674; y 150–440 | Negro lleno. En la de x 264–314, `ESTANTES` en reserva, en vertical |
| Cajas (2) | x 20–100 y 160–240; y 520–600 | Negro lleno con 3 rayas de cinta en reserva; etiqueta `CAJA` debajo, fuera del plano |
| **Ruta** | (774,610) → (774,95) → (559,95) → (559,480) → (379,480) → (379,95) → (199,95) → (199,480) → (130,480) → (130,610) | **Azul** (la ruta de Pausa), 7 px, discontinua 18/14, puntas redondas. Esquinas redondeadas (r 24). Chevrons azules pequeños cada ~220 px indicando el sentido |
| Parada 1 · música | (774, 520) | Junto a la entrada |
| Parada 2 · fondo | (680, 95) | Bajo el mostrador del fondo |
| Parada 3 · estante | (559, 270) | Pasillo 3 |
| Parada 4 · cartel | (469, 480) | Cabecera de la góndola 444–494 |
| Parada 5 · 2.ª unidad | (379, 290) | Pasillo 2 |
| Parada 6 · reduflación | (199, 290) | Pasillo 1 |
| Parada 7 · caja | (130, 560) | Entre las dos cajas |

Las etiquetas `ENTRADA`, `FONDO`, `ESTANTES` y `CAJA` salen literalmente del guion («entrada → fondo → estantes → caja»). **No añadas otros rótulos.**

**Insignia de parada** `stopBadge(x, y, n, { r })`: disco **rojo** con el número en reserva (Bricolage 800, ≈ 1,2 × r). Va encima de la ruta y **reserva su círculo en la plancha azul** (círculo de papel de r + 4 en `blue`), para que la ruta no salga ciruela bajo la insignia. Es el mismo objeto en el mapa, el minimapa, la cabecera de parada, la lista (10) y los botones (11).

---

## Plantilla de las paradas (slides 3–9)

Las 7 slides comparten esqueleto píxel a píxel. Solo cambian el contenido y la escena de Chispa.

| Zona | y | Contenido |
|---|---|---|
| Cabecera | 0–114 | `pageChrome` |
| **Franja de parada** | 136–264 | Izquierda: `stopBadge` con centro (100, 200) y r 34, número en Bricolage 800 de 42 px. Rótulo de la parada en x = 150, línea base 210, DM Mono 500, 26 px, interletra 0,1, **en mayúsculas**: es el encabezado del guion («Parada 1: la música» → `PARADA 1: LA MÚSICA`). Derecha: **minimapa**, x 836–1016 (escala 0,2027 → 180 × 124), y 140–264 |
| Título | desde ≈ 290 | Bricolage 800, negro, 64–72 px, interlineado 0,98, máximo 3 líneas a 952 px de ancho |
| Explicación | debajo, +24 px | Bricolage 600, 38–40 px, negro; las negritas en 800 |
| **Escena** | del final del texto a **1150** | Izquierda, x 64–620: Chispa cae en el truco. Derecha, x 640–1016: el **rincón de Pausa** |
| **Zona de fuente** | 1160–1230 | **Solo texto.** Ningún dibujo, sombra ni pie entra aquí |
| Pie | 1236– | `pageChrome` |

**Minimapa** (`storeMap({ mode: 'mini', current: n })`):
- Paredes de 3 px, góndolas y cajas en negro lleno, sin rótulos ni pictogramas.
- Ruta recorrida hasta la parada actual: azul continua de 4 px. Ruta pendiente: azul discontinua 6/6 de 3 px.
- Paradas ya pasadas: punto negro de r 5. Paradas futuras: círculo de papel de r 5 con aro negro de 2 px.
- **Parada actual: insignia roja de r 14** con el número en reserva (18 px). Es el «estás aquí».
- Comprobar a 540 px de ancho que se distingue qué parada está en rojo.

**Rincón de Pausa** (`pausaCorner({ expr, look, pose, prop, quote })`). Es el mismo en las 7 slides, para que el antídoto esté siempre en el mismo sitio y se encuentre de un vistazo:
- **Pausa:**
  - Centro (866, 1046), s 0,7, `flip: true` (mira a la izquierda, hacia Chispa); la taza queda a su izquierda.
  - Sombra de suelo bajo ella, con el borde inferior ≤ 1150.
  - Su ancho (~266 px) pide una Chispa de s ≈ 0,65–0,8 en la escena vecina. Es un plano aparte, pero que la proporción siga sonando a la biblia.
- **Antídoto** encima de ella, en la columna x 640–1016 (376 px), anclado abajo en y ≈ 920:
  - Línea 1: disco azul de r 12 + «Pausa:» (Bricolage 800, 36 px, azul).
  - Debajo, la frase entre «», en Bricolage 800 de 44 px, interlineado 1,05, azul.
  - Es ella hablando: sin bocadillo y junto a su cuerpo.
- Si una frase pasa de 4 líneas, baja a 40 px. Nunca por debajo de 32 px, el mínimo de la biblia para el azul.

**Línea de fuente** (`sourceLine(lines)`):
- DM Mono 500, **24 px**, interletra 0, negro.
- Anclada abajo: la última línea con línea base en **y = 1216**; si hay dos, la primera en y = 1186.
- Cortes de línea **a mano** donde se indica, con un máximo de 2 líneas a 952 px. DM Mono a 24 px da ≈ 14,4 px por carácter, es decir, ~66 caracteres por línea.
- Los nombres de revista (en cursiva en el guion) van en **DM Mono 500 cursiva**.
- Sin filete ni adorno. Nunca roja ni azul.

---

## Slide 1 · Portada

**Texto (literal):**
> Entraste a por pan.
> **Chispa salió con 43 €.**
> *7 trucos del súper (y cómo frenarlos)*

**Maqueta (texto en y 150–630):**
- «Entraste a por pan.»:
  - Bricolage 800, ≈ 150 px, interlineado 0,92, en dos líneas («Entraste / a por pan.»).
  - Es el gancho y debe leerse en la miniatura.
- «Chispa salió con 43 €.»:
  - Bricolage 800, ≈ 80 px, una línea; «Chispa» en rojo y el resto en negro.
  - Cifra y € unidos.
- «7 trucos del súper (y cómo frenarlos)»:
  - El **«7» va dentro de una `stopBadge` roja** de r 26: es la primera aparición del sistema de paradas, y el carácter sigue siendo el del guion.
  - El resto, en DM Mono 500 cursiva de 32 px, en negro, en la misma línea (≈ y 600).
- Mitad inferior (y 650–1236) para la escena. Esquina inferior izquierda libre para «Desliza →».

**Personajes y encuadre:** plano lateral; se lee de izquierda a derecha, como quien sale de la tienda.
- **Chispa:**
  - Centro ≈ (330, 960), s ≈ 1,15. **La cara es el gancho.**
  - `pose: 'empuja'` (NUEVA, ver tabla), `lean: −8`, `expr: 'euforia'`, `look: [2, −1]` (al lector), `sweat: 2`, `speed: 3` (sale disparada).
  - Puede pisar el filete del pie.
- **Carrito** a su derecha (x ≈ 500–960):
  - El asa a la altura de sus manos.
  - Desbordado de envases genéricos: cajas, botellas, cartón de leche, huevera, bolsas de snack; mezcla de negro y rojo.
  - **Una sola barra de pan** asoma en diagonal en lo alto del montón. Es lo único que venía a comprar, y lo más pequeño del carrito.
  - El montón no sube por encima de y ≈ 650.
- **Pausa, montada en el carrito**, sentada sobre el montón (centro ≈ (760, 720), s ≈ 0,45):
  - `pose: 'sit'`, `expr: 'esceptico'`, `look` al lector, taza en la mano con vapor.
  - Se la llevan de paseo: el Sistema 2 va de pasajera, no conduce.
  - Los alambres delanteros de la cesta van **por encima** de su plancha (en la negra), y así se lee que está dentro.
  - Sin ciruela: Chispa y Pausa no se tocan.

**Beat:** risa de reconocimiento inmediata. La cara de Chispa se lee primero; el pan diminuto y Pausa de pasajera son los chistes del segundo vistazo.
**Reutiliza:** Chispa `euforia` + `speed` + `sweat`; Pausa `esceptico` + `sit`.
**Nuevo:** pose `empuja`; `carrito` con carga; envases genéricos; `baguette`.
**Comprobar:** a 150 px de ancho deben leerse «a por pan», la cara de Chispa y el carrito lleno. Revisar también el recorte de la cuadrícula del perfil (4:5 → 3:4).

---

## Slide 2 · El mapa

**Texto (literal):**
> El súper no es un sitio neutral.
> Cada pasillo está pensado para hablar con **Chispa**.
> Hoy lo recorremos con **Pausa** de guía.

**Maqueta:**
- Columna de texto en x 64–660, y 150–560:
  - «El súper no es un sitio neutral.»: Bricolage 800, ≈ 80 px, 2 líneas.
  - Los dos párrafos siguientes: texto corrido de 40 px, a 596 px de ancho. «Chispa» y «Pausa» en **800 negro**: a este tamaño no van en su tinta.
- **Plano** (`storeMap({ mode: 'full' })`, escala ≈ 0,95): x ≈ 118–962, y ≈ 590–1210, **a lo ancho y centrado**.
- Sin línea de fuente.

**Plano:**
- La geometría `STORE` completa: ruta azul, 7 `stopBadge` rojas de r 30 y rótulos.
- Junto a cada insignia, **fuera de la ruta**, un **pictograma** en tinta negra de ≈ 40 px. Hacen que el plano se lea como un mapa sin añadir palabras:
  1. dos corcheas;
  2. barra de pan;
  3. ojo;
  4. cartel con forma de estallido;
  5. dos envases iguales juntos;
  6. caja con una línea discontinua de llenado a media altura;
  7. cinta de caja con dos envases.
- Formas planas, sin texto y con el mismo grosor que las extremidades de Chispa (6 px).

**Personajes:**
- **Pausa, la guía:**
  - Arriba a la derecha (centro ≈ (870, 400), s ≈ 0,5), `flip: true` para que mire al texto y al mapa.
  - `pose: 'guia'` (NUEVA), `expr: 'neutral'`, `look: [−4, 8]` (mira el plano).
  - Con el muñón levantado sostiene un **banderín de guía** azul que apunta hacia la `ENTRADA`.
  - La taza en la otra mano.
- **Chispa:**
  - Diminuta (s ≈ 0,3), **fuera del plano, junto a la puerta** de entrada (a la derecha de `ENTRADA`, ≈ (950, 1180)).
  - Con el **carrito vacío** (`carrito`, sin carga, s ≈ 0,3), mirando hacia dentro.
  - `pose: 'empuja'`, `expr: 'euforia'`, `lean: −10`: impaciente por entrar.
  - Puede rozar el filete del pie, pero no tapa «Desliza →» ni la tira de progreso.

**Beat:** «enséñame el mapa». Promete un recorrido y da ganas de deslizar para ver cada parada.
**Reutiliza:** Pausa `neutral`; Chispa `euforia`.
**Nuevo:** `storeMap` (completo), `stopBadge`, 7 pictogramas, pose de Pausa `guia` + `banderin`, `carrito` vacío.
**Comprobar:** a 540 px de ancho, que se lean los 7 números y la ruta como un solo camino continuo de la entrada a la caja.

---

## Slide 3 · Parada 1: la música

**Texto (literal):**
> **La música va despacio. Tú también.**
> En un estudio clásico, con música lenta la gente caminaba más despacio y gastaba más que con música rápida.
> Más tiempo en el pasillo = más cosas en el carrito.
> 🔵 **Pausa:** «Entra con lista. Sal cuando la acabes.»
> <sub>Fuente: Milliman (1982), *Journal of Marketing*.</sub>

**Maqueta (plantilla):**
- Franja: `PARADA 1: LA MÚSICA`; minimapa en la parada 1.
- Título a 72 px, 2 líneas («La música va despacio. / Tú también.»).
- Explicación a 38 px: primer párrafo y, tras un espacio de 16 px, «Más tiempo en el pasillo = más cosas en el carrito.».
- Fuente en 1 línea: `Fuente: Milliman (1982), ` + *`Journal of Marketing`* (cursiva) + `.`

**Escena (izquierda):**
- Un **altavoz genérico** cuelga arriba a la izquierda: caja negra con dos círculos en reserva, colgada de dos hilos de 3,5 px.
- Le salen **3–4 notas musicales** en negro, dibujadas como trazos y no con una fuente, que bajan flotando lentamente hacia Chispa.
- **Chispa** (≈ (330, 1030), s ≈ 0,75):
  - En cámara lenta, cosa rara en ella: `pose: 'empuja'` con `lean: +4` (echada hacia atrás, sin prisa), `expr: 'feliz'` (ojos cerrados, embelesada).
  - **Sin** líneas de velocidad.
  - A cada lado de la cúpula, dos arcos de vaivén (los de `nodArcs` del post 00, a 0,6).
- **Carrito** a medio llenar delante de ella, con 3–4 envases. Un envase más está **cayendo dentro** (a medio camino, inclinado): se está llenando solo.

**Rincón de Pausa:**
- `pose: 'muestra'` (NUEVA): el muñón levantado sostiene una **lista de papel mini** (el mismo objeto que la slide 10, en pequeño, como anticipo).
- `expr: 'neutral'`, `look` hacia Chispa.
- Quote: «Entra con lista. Sal cuando la acabes.»

**Beat:** «yo también paseo con la música». Ternura: Chispa por una vez va despacio, y aun así pica.
**Reutiliza:** Chispa `feliz`; arcos de vaivén del post 00; Pausa `neutral`.
**Nuevo:** `altavoz`, `notas`, `listaMini`, pose de Pausa `muestra`.

---

## Slide 4 · Parada 2: lo básico, al fondo

**Texto (literal):**
> **El pan está al fondo. Por algo.**
> Pan, leche, huevos: lo que compras siempre suele estar lejos de la entrada. Para llegar, cruzas medio súper… y Chispa va llenando el carrito.
> 🔵 **Pausa:** «Ve directa a lo que necesitas. Sin pasear pasillos.»
> <sub>Práctica habitual en la distribución de tiendas.</sub>

**Maqueta (plantilla):**
- `PARADA 2: LO BÁSICO, AL FONDO`; minimapa en la parada 2.
- Título a 72 px, 2 líneas («El pan está al fondo. / Por algo.»).
- Explicación a 38 px, ~4 líneas.
- Fuente en 1 línea, toda en redonda.

**Escena (izquierda):** una vista lateral que se lee como «lejísimos».
- En el extremo izquierdo (x 64–170, sobre el suelo), un **mostrador bajo con una cesta** de la que asoman **tres barras de pan**. Es pequeño, está al fondo y casi se sale del encuadre.
- La **ruta azul discontinua** (la del mapa, 7 px) entra por la derecha, desde detrás del rincón de Pausa, y da **un rodeo en S** por el suelo de la escena antes de llegar al pan. El camino largo es el chiste.
- **Chispa** (≈ (430, 1040), s ≈ 0,7):
  - Sobre la ruta, a medio camino, empujando **hacia la izquierda** (`flip: true`) un carrito **ya lleno** antes de haber llegado al pan.
  - `pose: 'empuja'`, `expr: 'feliz'` (ni se ha enterado), `sweat: 1`.

**Rincón de Pausa:**
- `pose: 'sit'`, `expr: 'esceptico'`, `look` hacia el carrito.
- Quote: «Ve directa a lo que necesitas. Sin pasear pasillos.» (3 líneas).

**Beat:** «el pan siempre está al final, es verdad».
**Reutiliza:** pose `empuja`, `carrito`, envases, `baguette`, ruta de `STORE`.
**Nuevo:** `mostradorPan` (mostrador bajo con cesta).

---

## Slide 5 · Parada 3: el estante

**Texto (literal):**
> **Lo que ves primero no es casualidad.**
> Las marcas compiten por estar donde más miras y con más paquetes de frente: cuanto más lo ves, más lo eliges.
> **Dato:** el punto que más se mira no está a la altura de los ojos, sino un poco por debajo.
> 🔵 **Pausa:** «Antes de coger nada, mira arriba y abajo.»
> <sub>Fuentes: Chandon et al. (2009), *Journal of Marketing*; Chen et al. (2021), *Journal of Marketing Research*.</sub>

**Maqueta (plantilla):**
- `PARADA 3: EL ESTANTE`; minimapa en la parada 3.
- Título a 68 px, 2 líneas.
- Explicación a 38 px; el párrafo del «Dato:» va en párrafo aparte, 16 px más abajo, con «Dato:» en 800.
- Es la slide con más texto: la escena empieza en ≈ y 760.
- **Fuente en 2 líneas, cortadas así:**
  - `Fuentes: Chandon et al. (2009), ` + *`Journal of Marketing`* + `;`
  - `Chen et al. (2021), ` + *`Journal of Marketing Research`* + `.`

**Escena (izquierda):**
- Un **estante** (`estante`) en x 64–380, y ≈ 770–1150: dos montantes negros y **4 baldas** negras de 6 px.
- Contenido, de arriba abajo:
  - Balda alta: 2 envases negros distintos, uno de frente cada uno.
  - Balda a la altura de los ojos de Chispa: 2 envases distintos.
  - **Balda un poco por debajo de sus ojos: 5 envases rojos idénticos de frente.** Son los que más se ven.
  - Balda baja: 1–2 envases negros.
- **Chispa** (≈ (500, 1060), s ≈ 0,75):
  - De pie frente al estante, `flip: true` (mira a la izquierda).
  - `pose: 'alcanza'` (NUEVA): un brazo estirado hacia la fila roja, el otro en jarras.
  - `expr: 'euforia'`, `look` hacia la fila roja.
- **Línea de mirada:**
  - Dos trazos negros discontinuos de 3,5 px (huecos de 8/8), del ojo a la fila roja, **un poco hacia abajo**. Así se dibuja el «Dato».
  - Que se lea como mirada (abre en cono hacia la fila) y **no como flecha ni gráfico**: sin punta.

**Rincón de Pausa:**
- `pose: 'sit'`, `expr: 'neutral'` con **`look: [0, −9]`** (pupilas arriba, mira la balda alta).
- Opcional, si se lee a 540 px: un segundo par de marcas de párpado que sugieran que también mira abajo. Si no se lee, solo arriba.
- Quote: «Antes de coger nada, mira arriba y abajo.»
- **Sin flechas arriba ni abajo.**

**Beat:** «nunca me había fijado». Revelación pequeña y verificable en el siguiente súper.
**Reutiliza:** Chispa `euforia`; envases.
**Nuevo:** `estante` (baldas con huecos y frentes), `miradaDiscontinua`, pose de Chispa `alcanza`.

---

## Slide 6 · Parada 4: el cartel

**Texto (literal):**
> **El cartel de oferta vende… aunque no haya oferta.**
> Un cartel llamativo hace subir las ventas incluso cuando el precio no ha bajado. Chispa ve amarillo y entiende «barato».
> 🔵 **Pausa:** «Mira el precio, no el cartel.»
> <sub>Fuente: Inman, McAlister y Hoyer (1990), *Journal of Consumer Research*.</sub>

> **Bloqueo 1 (texto e imagen):** el guion dice «Chispa ve **amarillo**», pero la cuenta imprime en tres tintas y no hay amarillo. Se dibuja el cartel en **rojo flúor**, que es la tinta del mundo comercial, como en la slide 6 del post 00. Ver «Bloqueos de texto».

**Maqueta (plantilla):**
- `PARADA 4: EL CARTEL`; minimapa en la parada 4.
- Título a 64 px, 3 líneas.
- Explicación a 38 px.
- **Fuente en 2 líneas:**
  - `Fuente: Inman, McAlister y Hoyer (1990),`
  - *`Journal of Consumer Research`* + `.`

**Escena (izquierda):**
- Una balda corta (`estante`, 1 nivel) con **dos envases idénticos** uno al lado del otro: misma forma, misma banda en reserva.
- Debajo de cada uno, en el canto de la balda, una **etiqueta de precio pequeña e idéntica** (`etiquetaMuda`): forma negra con dos rayas en reserva y **sin cifras**. Son el mismo precio.
- Sobre el envase de la derecha, un **cartel-estallido** rojo grande (`cartelEstallido`, ≈ 240 px, estrella de 14–16 puntas irregulares) con `OFERTA` en reserva (Bricolage 800). La palabra sale del guion.
- **Chispa** (≈ (400, 1050), s ≈ 0,75):
  - Va hacia el cartel **hipnotizada**: `expr: 'espiral'` (existe en código desde los Reels, pendiente de validar en la hoja de la biblia).
  - `pose: 'zombi'` (NUEVA): los dos brazos estirados en horizontal hacia delante, piernas de `tiesa`, `lean: −6`.
  - `sweat: 1`.

**Rincón de Pausa:**
- `pose: 'lupa'` (NUEVA): el muñón levantado sostiene una **lupa** que apunta hacia la izquierda, a las etiquetas.
- `expr: 'esceptico'`.
- Quote: «Mira el precio, no el cartel.»

**Beat:** indignación cómplice: el mismo producto al mismo precio, y aun así...
**Reutiliza:** Chispa `espiral` (Reels); Pausa `esceptico`.
**Nuevo:** `cartelEstallido`, `etiquetaMuda`, `lupa`, poses `zombi` (Chispa) y `lupa` (Pausa).

---

## Slide 7 · Parada 5: la segunda unidad

**Texto (literal):**
> **«2.ª unidad al 50 %» no es un 50 % de descuento.**
> 2 × 4 € = 6 € → 3 € cada una. Es un **25 %**.
> Y solo ahorras si de verdad ibas a usar las dos.
> 🔵 **Pausa:** «¿Necesitas dos? Si no, no es ahorro.»
> <sub>Cálculo: (4 € + 2 €) ÷ 2 = 3 € por unidad.</sub>

> **Bloqueo 2 (texto):** «2 × 4 € = 6 €» es aritméticamente falso (2 × 4 € = 8 €). Se maqueta literal, pero **la slide no se publica** hasta que el guion lo corrija. Ver «Bloqueos de texto».

**Maqueta (plantilla):**
- `PARADA 5: LA SEGUNDA UNIDAD`; minimapa en la parada 5.
- Título a 64 px, 3 líneas; «» y «2.ª» tal cual.
- **Línea de cálculo, protagonista de la slide:**
  - Bricolage 800, 48 px, negro; el **«25 %» en azul**: es la cuenta de Pausa, y el azul vale desde 32 px.
  - Si no cabe en una línea, se corta después de «cada una.».
- «Y solo ahorras si de verdad ibas a usar las dos.»: texto corrido de 38 px.
- Fuente en 1 línea, toda en redonda.

**Escena (izquierda):**
- Detrás, inclinado 4°, un **`sign`** rojo de la librería con `2.ª UNIDAD AL 50 %` en reserva.
- **Chispa** (≈ (330, 1040), s ≈ 0,75):
  - `pose: 'hold'` (brazos arriba), con **un envase idéntico en cada mano**: botella roja con banda en reserva y sin cifras.
  - `expr: 'euforia'`, `sweat: 1`, marcas de exaltación (`burst`).
- Sin etiquetas de precio en los envases: las cifras ya están en el texto, y repetirlas en la escena ensucia.

**Rincón de Pausa:**
- `pose: 'sit'`, `expr: 'neutral'`, `look: [−4, −8]`: mira la línea de cálculo de arriba, es su cuenta.
- Quote: «¿Necesitas dos? Si no, no es ahorro.»

**Beat:** «¡anda, es un 25 %!». La sorpresa aritmética es el contenido que más se comparte de este post.
**Reutiliza:** Chispa `hold` + `euforia` + `burst`; `sign`; Pausa `neutral`.
**Nuevo:** botella genérica (de la familia de envases).

---

## Slide 8 · Parada 6: la reduflación

**Texto (literal):**
> **Mismo precio. Menos producto.**
> El envase parece igual, pero trae menos. Es legal si el peso aparece en la etiqueta… y Chispa nunca mira el peso.
> 🔵 **Pausa:** «Compara el precio por kilo o por litro.»
> <sub>Reduflación: menos cantidad por el mismo precio.</sub>

**Maqueta (plantilla):**
- `PARADA 6: LA REDUFLACIÓN`; minimapa en la parada 6.
- Título a 72 px, 2 líneas («Mismo precio. / Menos producto.»).
- Explicación a 38 px.
- Fuente en 1 línea, toda en redonda.

**Escena (izquierda):**
- **Dos cajas idénticas** sobre una balda (x ≈ 90–380): misma silueta, misma banda roja y una **etiqueta de peso diminuta** (rayas negras, sin cifras) en una esquina.
- Las dos con **corte de rayos X** (`envaseCorte`): una ventana en reserva que deja ver el contenido en trama negra.
  - La de la izquierda, **llena hasta arriba**.
  - La de la derecha, **llena a ~70 %**, con el aire en reserva limpia y una línea discontinua de nivel.
- Encima de las dos, la **misma `etiquetaMuda`**, idéntica: mismo precio, sin cifras.
- **Chispa** (≈ (500, 1050), s ≈ 0,7):
  - Se lleva la caja de la derecha bajo el brazo: `pose: 'happy'` con `limbs` para que un brazo abrace la caja.
  - `expr: 'feliz'` (ojos cerrados: literalmente no mira el peso).

**Rincón de Pausa:**
- `pose: 'lupa'` (la de la slide 6), apuntando a la etiqueta de peso.
- `expr: 'neutral'`.
- Quote: «Compara el precio por kilo o por litro.»

**Beat:** «me la han colado mil veces».
**Reutiliza:** Chispa `feliz` + `happy`; `lupa`; `etiquetaMuda`.
**Nuevo:** `envaseCorte` (caja con ventana de rayos X y nivel de llenado configurable).

---

## Slide 9 · Parada 7: la caja

**Texto (literal):**
> **La última trampa está en la cola.**
> Dulces y snacks junto a la caja, justo cuando esperas y estás cansado. En supermercados británicos que los quitaron de ahí, se compraron bastantes menos.
> 🔵 **Pausa:** «La cola no es un pasillo más.»
> <sub>Fuente: Ejlerskov et al. (2018), *PLOS Medicine*.</sub>

**Maqueta (plantilla):**
- `PARADA 7: LA CAJA`; minimapa en la parada 7, con toda la ruta recorrida.
- Título a 72 px, 2 líneas.
- Explicación a 38 px, ~4 líneas.
- Fuente en 1 línea: `Fuente: Ejlerskov et al. (2018), ` + *`PLOS Medicine`* + `.`

**Escena (izquierda):**
- **Mostrador de caja** (`mostradorCaja`) en x ≈ 380–620, y ≈ 990–1140: bloque negro con la cinta en rayas de reserva y dos envases encima.
- Pegado a su izquierda, un **expositor de snacks** (`expositorSnacks`, x ≈ 290–370): columna con 4 ganchos de bolsas rojas en almohada (bordes en zigzag) y tabletas negras. **Sin marcas.**
- **Chispa** (≈ (190, 1050), s ≈ 0,72):
  - En la cola, con el **carrito lleno** detrás de ella, cortado por el borde izquierdo del encuadre.
  - `pose: 'stand'` con `limbs`: el brazo derecho se estira, disimulado y bajo, hacia el expositor. La mano se queda **a 20 px** de una bolsa.
  - `expr: 'neutral'` con `look` de reojo hacia las bolsas. Nada de euforia: está cansada y pica sin pensar.
- **La correa, en tirón** (el gag 3 de la biblia; el único caso en que va recta y tensa):
  - Del asa de la taza de Pausa, en su rincón, al tobillo de Chispa, con el lazo en el tobillo.
  - Hilo de 3,5 px que pasa **por delante** del pie del mostrador.
  - Junto al tobillo, dos trazos cortos de «tirón».
  - Es la primera vez en el post que Pausa llega **a tiempo**.

**Rincón de Pausa:**
- `pose: 'sit'` con la taza de la que sale la correa.
- `expr: 'esceptico'`.
- Quote: «La cola no es un pasillo más.»

**Beat:** «la de veces que he caído en la caja», y la pequeña victoria: Pausa llega a tiempo. Prepara el giro de la slide 11.
**Reutiliza:** Chispa `neutral` + `look`; correa del hero; Pausa `esceptico`.
**Nuevo:** `mostradorCaja`, `expositorSnacks`, `correaTensa` (recta + lazo + marcas de tirón).

---

## Slide 10 · La lista de la compra de Pausa

**Texto (literal):**
> La lista de la compra de Pausa
> ☐ Entra con lista y sal al acabarla.
> ☐ Ve directa a lo básico.
> ☐ Mira arriba y abajo.
> ☐ Precio, no cartel.
> ☐ ¿Necesitas dos?
> ☐ Precio por kilo.
> ☐ En la caja, nada nuevo.

«*(para guardar)*» es una nota del guion, no texto de slide: **no se imprime**.

**Objetivo:** que parezca una **hoja real arrancada de una libreta**, para hacer captura y guardar. Tiene que funcionar recortada sola.

**La hoja** (`listaCompra`):
- Papel en **reserva** (blanco en las tres planchas, como el ticket del post 00), de x ≈ 104 a 912 y de y ≈ 160 a 1196, **girada −1,5°**.
- **Borde superior arrancado:** zigzag irregular de 16–20 dientes de tamaño y altura variables (6–14 px), con 3–4 jirones de papel algo más grandes. No debe ser un zigzag de regla.
- **Sombra** de semitono negro desplazada (8, 10), como la del ticket.
- **Pautado de libreta en las tintas de la casa:**
  - Margen vertical **rojo** de 3 px a 110 px del borde izquierdo de la hoja.
  - Renglones **azules** de 2 px cada 108 px.
  - Son las dos tintas de las dos: la hoja ya es del universo.
- **Título en la hoja:**
  - «La lista de la compra de Pausa»: Bricolage 800, 64 px, negro, 2 líneas («La lista de la compra / de Pausa»).
  - **«Pausa» en azul.**
  - Arriba, a la derecha del margen.
- **7 renglones**, uno por parada, apoyados en los renglones azules:
  - En la columna del margen, una **`stopBadge` roja** de r 22 con el número 1–7: enlaza cada punto con su parada del mapa y con el «Comenta el número» de la 11.
  - Después, una **casilla vacía** (☐) dibujada: cuadrado de 40 px, trazo negro de 4 px, esquinas r 4, cada una girada al azar entre −3° y +3°, para que parezca hecha a mano.
  - El texto en Bricolage 600, 42 px, negro.
  - **Todas las casillas vacías**, como en el guion: las marca el lector.
- Nada de manchas de café, clips ni adornos sin función.

**Personaje:**
- **Pausa**, pequeña (s ≈ 0,5), sentada en la esquina inferior derecha **fuera de la hoja**, pisando solo el borde (centro ≈ (940, 1130)).
- `pose: 'sit'`, `expr: 'feliz'`, taza con vapor.
- No tapa ningún texto. Su plancha va delante de la hoja.
- **Chispa no aparece:** la lista es de Pausa, y así queda limpia para guardar.

**Beat:** utilidad y alivio, el «lo guardo». Es la slide que más se guarda del post.
**Reutiliza:** `stopBadge`; sombra y patrón de papel del `ticket` del post 00; Pausa `feliz`.
**Nuevo:** `listaCompra` (hoja con borde arrancado, pautado, casillas). Haz que `listaMini` (slide 3) sea la misma función a escala 0,12, sin texto: renglones como rayas.
**Comprobar:** a 540 px de ancho deben leerse los 7 renglones.

---

## Slide 11 · Tu turno

**Texto (literal):**
> ¿En qué parada cae tu Chispa siempre?
> **Comenta el número.**
> 📌 Guárdalo para tu próxima compra.
> 📤 Envíaselo a quien «solo iba a por pan».

**Maqueta:**
- «¿En qué parada cae tu Chispa siempre?»: Bricolage 800, ≈ 92 px, 3 líneas, «Chispa» en rojo; y 150–440.
- **Fila de 7 botones:** `stopBadge` de r 40 numeradas del 1 al 7, centradas en y ≈ 520, separadas 124 px. Son los botones de voto del post 00, ahora con número.
- «Comenta el número.»: Bricolage 800, 60 px, centrado, y ≈ 640.
- Las dos líneas de 📌 y 📤: texto corrido de 38 px en y ≈ 700–800, cada una con su icono de tinta de 40 px a la izquierda (chincheta roja y negra; avión de papel negro).
- Pie: firma `@dinero_irracional` y `11 / 11`.

**Personajes y encuadre:** plano medio, las dos al lector, y 830–1236. Es el remate del arco del carrito.
- **Chispa** (izquierda, ≈ (300, 1090), s ≈ 1,0):
  - `pose: 'cheer'`, con **solo una barra de pan** levantada en una mano como un trofeo.
  - **Sin carrito y sin bolsa.**
  - `expr: 'euforia'`, `look` al lector, marcas de exaltación.
  - Puede pisar el filete del pie.
- **Pausa** (derecha, ≈ (760, 1080), s ≈ 1,1):
  - `pose: 'brindis'`, `expr: 'brindis'`, `look` al lector: brinda con la taza.
- Sin correa: hoy no ha hecho falta.

**Beat:** participación y pequeña victoria. «Esta vez, solo pan.»
**Reutiliza:** Chispa `cheer` + `euforia` + `burst`; Pausa `brindis`; `stopBadge`; `baguette`.
**Nuevo:** iconos `chincheta` y `avionPapel`.

---

## Activos nuevos (todos en `posts/01-supermercado/props.js`)

Todo se construye **importando** `riso.js`; **no se edita la librería**. Cada función devuelve capas `{ black, red, blue, defs }`, como el resto de la librería. Los envases y el atrezo van en las planchas negra y roja; el azul solo para Pausa, su ruta, su banderín y el pautado de la lista.

| Tipo | Nombre | Cómo se construye | Slides |
|---|---|---|---|
| Datos | `STORE` | Geometría del plano (tabla de arriba) | 2–9 |
| Componente | `storeMap({ x, y, s, mode: 'full' \| 'mini', current })` | Paredes, góndolas, cajas, ruta azul (recorrida o pendiente), insignias y, en `full`, rótulos y pictogramas | 2–9 |
| Componente | `stopBadge(x, y, n, { r })` | Disco rojo, número en reserva, reserva de r + 4 en la plancha azul | 1–11 |
| Componente | `stopHeader(n, rotulo)` | Insignia + rótulo mono + minimapa | 3–9 |
| Componente | `pausaCorner({ expr, look, pose, prop, quote })` | Pausa (866, 1046), s 0,7, `flip`; disco + «Pausa:» + frase azul anclada en y 920 | 3–9 |
| Componente | `sourceLine(lines)` | DM Mono 500, 24 px, negro; líneas base 1186 y 1216; tramos en cursiva | 3–9 |
| Pose Chispa | `empuja` | `limbs` sobre `stand`: los dos brazos hacia delante (manos a ≈ (176, 30) y (150, 40), locales); piernas en zancada (legL atrás, legR delante). Desde `SOCK` | 1, 2, 3, 4 |
| Pose Chispa | `alcanza` | `limbs` sobre `hips`: armR estirado (codo (150, 30), mano (210, 40)); armL en jarras | 5 |
| Pose Chispa | `zombi` | `limbs` sobre `tiesa`: los dos brazos en horizontal hacia delante (manos ≈ (190, 20) y (170, 30)) | 6 |
| Pose Chispa | `abraza` | `limbs` sobre `happy`: un brazo doblado que rodea la caja contra el costado | 8 |
| Pose Chispa | `pica` | `limbs` sobre `stand`: armR estirado bajo y hacia el lado | 9 |
| Pose Pausa | `guia` / `muestra` / `lupa` | `pose: 'hold'` + prop dibujado en el extremo del muñón levantado (local (−196, −16), pasado a global con `G()`): banderín, lista mini y lupa | 2 / 3 / 6, 8 |
| Atrezo | `carrito({ s, flip, carga })` | Vista lateral, alambre negro de 5 px: cesta trapezoidal con varillas cada 22 px, asa, bastidor y 2 ruedas visibles (r 14 con buje en reserva). La cesta delantera se dibuja **encima** de la carga y de quien vaya dentro | 1–4, 9 |
| Atrezo | Envases genéricos: `caja`, `botella`, `lata`, `bolsaSnack`, `brick`, `huevera`, `baguette` | Formas planas negras o rojas; «etiquetas» en reserva sin texto. La `baguette`, negra con 3 cortes en reserva | 1, 3–9, 11 |
| Atrezo | `altavoz`, `notas` | Caja negra con 2 conos en reserva; corcheas en trazo | 3 |
| Atrezo | `mostradorPan` | Mostrador bajo con cesta y 3 barras | 4 |
| Atrezo | `estante({ baldas, frentes })` | Montantes y baldas negras de 6 px; rellena con envases | 5, 6, 8 |
| Atrezo | `miradaDiscontinua` | Dos trazos discontinuos en cono, sin punta | 5 |
| Atrezo | `cartelEstallido('OFERTA')` | Estrella roja irregular, texto en reserva | 6 |
| Atrezo | `etiquetaMuda` | Etiqueta negra con 2 rayas en reserva, sin cifras | 6, 8 |
| Atrezo | `lupa` | Aro negro de 8 px, lente en reserva, mango negro | 6, 8 |
| Atrezo | `envaseCorte({ nivel })` | Caja con ventana en reserva y relleno en trama negra hasta `nivel`; línea discontinua de nivel | 8 |
| Atrezo | `mostradorCaja`, `expositorSnacks` | Bloque negro con cinta rayada; columna con bolsas rojas | 9 (y versión simplificada en `STORE`) |
| Atrezo | `correaTensa(p0, p1)` | Recta de 3,5 px + lazo (el de `render.js` del post 00) + 2 marcas de tirón | 9 |
| Atrezo | `banderin` | Asta negra de 4 px + triángulo azul | 2 |
| Atrezo | `listaCompra({ s, items })` y `listaMini` | Hoja en reserva, borde arrancado irregular, sombra en trama, margen rojo, renglones azules, casillas a mano | 10, 3 |
| Iconos | 7 pictogramas del mapa; `chincheta`; `avionPapel` | Tinta plana, ≈ 40 px, trazo de 6 px | 2, 11 |

**Expresiones:** ninguna nueva. Se usa `espiral` de Chispa (construida para los Reels): valídala a 150 px y anótalo en `notes.md` para que pase a la biblia.

---

## Bloqueos de texto (para el dueño de la cuenta; el ilustrador maqueta literal)

1. **Slide 7: «2 × 4 € = 6 €» es falso** (son 8 €). Se cumple lo que dice la fuente de la propia slide, «(4 € + 2 €) ÷ 2 = 3 €», pero la línea grande no. Es lo primero que señalarán en comentarios. **Hasta que se corrija, la slide no se publica.** Propuesta para el redactor (no la aplico): «4 € + 2 € = 6 € → 3 € cada una.»
2. **Slide 6: «Chispa ve amarillo».** La paleta tiene tres tintas y no tiene amarillo. Opciones:
   - (a) El redactor cambia «amarillo» por «rojo» o por algo como «un cartel chillón». **Lo recomiendo**: el mundo comercial ya va en rojo desde el post 00.
   - (b) Se mantiene «amarillo» y el cartel en rojo, con la incoherencia.
   - (c) Una cuarta tinta solo aquí. **No lo recomiendo**: rompe la regla de tres tintas y el concepto de dos planchas.
3. **Género del lector:** la slide 4 y la lista dicen «Ve **directa**», y la slide 9, «estás **cansado**». No afecta al dibujo, pero conviene unificarlo.

---

## Entrega y comprobaciones

**Archivos en `/home/user/stock_momentum_dashboard/instagram/posts/01-supermercado/`:**
- `props.js`, `render.js` (uso: `node render.js [n …]`, igual que en el post 00), `slide-01…11.png` + `.svg` y `overview.png` (cuadrícula de 4 × 3, con la última celda vacía).
- `notes.md`, con las desviaciones del brief.

**Checklist:**
- Texto idéntico a `copy.md` (¿¡, tildes, «», «…» como un solo carácter, «2.ª», espacio fino antes de € y %).
- «N.º 01» en la cabecera; contador `NN / 11`; «Desliza →» en las slides 1–10 y firma en la 11.
- En las slides 3–9:
  - Insignia y minimapa con la parada correcta.
  - Antídoto azul junto a Pausa, siempre en el mismo sitio.
  - **Línea de fuente negra, en mono, de 24 px, encima del filete y sin ningún dibujo en y 1160–1230.**
- Ningún envase con marca, logo ni texto. Precios solo en la 1 (43 €) y la 7.
- Nada que parezca un gráfico de bolsa: baldas, minimapa, ruta y líneas de mirada incluidas.
- Ninguna cara con ciruela; Chispa sin rotaciones de más de 8°; base plana visible.
- **No se ha modificado `characters/riso/riso.js`** (comprobar con `git diff --stat` antes de entregar; no hacer commit).
- Pruebas de tamaño:
  - Portada a 150 px.
  - Mapa, minimapas y lista a 540 px.
  - Recorte de cuadrícula de la portada.
