# Art brief — Post 00 · Presentación (fijado)

**Formato:** carrusel, 9 slides, 1080 × 1350 · estilo Riso · post fijado (es lo primero que ve quien llega al perfil).
**Personajes:** **Chispa** (roja, Sistema 1) y **Pausa** (azul, Sistema 2), siempre en femenino.
**Biblia:** `/home/user/stock_momentum_dashboard/instagram/characters/BIBLE.md` (construcción, paleta, tipografía, poses aprobadas). Todo lo que no diga este brief, lo dice la biblia.
**Texto:** el de `copy.md`, **literal**. No se reescribe, no se acorta, no se cambia la puntuación. Las negritas del guion van en Bricolage 800.

---

## La historia en 9 slides
El carrusel es una mini película de presentación con un giro en el medio:

| # | Beat | Quién manda en la imagen |
|---|---|---|
| 1 | Gancho: «en tu cabeza viven dos» | Chispa enorme delante; Pausa diminuta al fondo |
| 2–3 | Las fichas: conocerlas | Una cada una, en cartas gemelas |
| 4 | Giro: Chispa no es la mala | Chispa orgullosa; Pausa le da la razón |
| 5 | Problema: Pausa llega tarde | Chispa ya ha pagado; Pausa entra sin aliento |
| 6 | Revelación: el mundo habla con Chispa | Chispa rodeada; Pausa dormida |
| 7 | Promesa de la cuenta | Por primera vez, juntas y mirando al lector |
| 8 | Credibilidad: Kahneman, fuentes | Pausa lee; Chispa cotillea |
| 9 | Acción: comenta con un color | Las dos celebran hacia el lector |

**Arco emocional:** sonrisa (1) → coleccionismo (2–3) → sorpresa (4) → «ay, soy yo» (5) → indignación cómplice (6) → alivio y promesa (7) → confianza (8) → participación (9).
**Arco de distancia:** Pausa empieza lejos (1), se va acercando (5 entra por el borde, 6 en una esquina) y en el 7 se pone por fin al lado de Chispa. La cercanía física entre las dos **es** la promesa de la cuenta.

---

## Sistema común (las 9 slides)

**Papel:** «niebla» `#E6ECE4` en las 9 (es el papel del hero y del avatar). Grano normal (`grain: 1`), semillas de la biblia, desregistro estándar.

**Cabecera (igual en las 9):**
- Izquierda: `DINERO IRRACIONAL` — DM Mono 500, 24 px, interletra 0,12, x = 64, línea base y = 92.
- Derecha: `N.º 00` — mismo estilo, alineado a x = 1016.
- Filete negro de 3 px de x = 64 a x = 1016 en y = 114.

**Pie (igual en las 9):**
- Filete negro de 3 px en y = 1236.
- Izquierda: `Desliza →` — DM Mono 500, 30 px, línea base y = 1292. **En la slide 9 no va**; en su lugar, `Dinero Irracional` en Bricolage 800, 40 px (firma, como en la hoja de expresiones).
- Derecha: contador `01 / 09` … `09 / 09` — DM Mono 500, 24 px, interletra 0,12, alineado a x = 1016.
- Encima del contador, una tira de progreso de 9 puntos de 8 px (separación 18 px): los ya vistos y el actual en negro; los que faltan, en semitono negro claro. El punto actual se imprime en la tinta de quien protagoniza la slide (rojo en 1, 2, 4, 5, 6; azul en 3, 8; ciruela solo en 7 y 9, que son de las dos).

**Zona de contenido:** x 64–1016, y 140–1210. Los personajes pueden pisar el filete del pie solo en las slides 1 y 9 (energía de entrada y salida); el texto nunca.

**Tipografía del texto:**
- Titular / negritas: Bricolage Grotesque 800, ancho 75 %, negro. Tamaño según slide (indicado abajo).
- Texto corrido: Bricolage Grotesque 600, ancho 88 %, 40 px, interlineado 1,2, negro.
- Los nombres **«Chispa» y «Pausa» dentro de titulares (≥ 56 px) van en su tinta** (rojo / azul); en texto corrido, en negro (el rojo pequeño no se lee).
- Las frases que *dicen* los personajes van en su tinta, sin bocadillo, junto a quien habla.
- Texto siempre alineado a la izquierda, bloque anclado arriba, salvo donde se indique.

**Reglas fijas de este post:** Chispa nunca rota más de ~8° (usar `lean`); sin ciruela en caras (usar `knockFor` cuando se pisen); sombra de suelo en semitono bajo cada personaje que toque suelo.

---

## Slide 1 · Portada

**Texto (literal):**
> En tu cabeza viven dos.
> **Y las dos deciden qué haces con tu dinero.**

**Maqueta:** bloque de texto arriba, y 160–520, x 64–1016.
- «En tu cabeza viven dos.» — Bricolage 800, ≈ 128 px, 2 líneas («En tu cabeza / viven dos.»). Es el gancho: debe leerse en la miniatura.
- «Y las dos deciden qué haces con tu dinero.» — Bricolage 800, ≈ 56 px, 2 líneas, debajo.
- Mitad inferior (y 560–1300) para las personajes. Esquina inferior izquierda libre para `Desliza →`.

**Personajes y encuadre:** plano general con profundidad, el único del carrusel.
- **Chispa**, primer plano, centrada-izquierda (centro ≈ x 400, y 860), grande (s ≈ 1,7): ocupa ~45 % del ancho. Saltando hacia el lector: `pose: 'cheer'`, `expr: 'euforia'`, `sweat: 2`, marcas de exaltación (`burst`) sobre la cúpula, sombra de suelo **despegada** (más pequeña y clara, 60 px por debajo de los pies) para que se lea el salto. Puede pisar el filete del pie.
- **Pausa**, al fondo a la derecha, pequeña (s ≈ 0,5, centro ≈ x 830, y 1010): `pose: 'sit'`, `expr: 'neutral'`, taza humeante, mirando a cámara de reojo (`look: [-6, 4]`). **Ni se inmuta.**
- No se tocan (evita ciruela). Separación mínima de 40 px.

**Beat:** sonrisa inmediata. La cara de Chispa es el gancho a tamaño de feed; Pausa es el chiste que se descubre en un segundo vistazo.

**Reutiliza:** Chispa euforia/cheer (cover-mock, hoja). Pausa neutral/sit (hero).
**Nuevo:** nada de personaje. Solo la sombra despegada (variante de `shadowEllipse`).
**Comprobar:** miniatura a 150 px y recorte de cuadrícula: cara de Chispa y «viven dos» legibles.

---

## Slides 2 y 3 · Fichas de personaje (cartas gemelas)

Son las dos piezas que tienen que volverse **icónicas**: cartas coleccionables de fanzine, idénticas en estructura y opuestas en carácter. Mismo esqueleto, píxel a píxel; cambia la tinta y la actitud. Pensadas para que alguien haga captura y diga «yo soy esta».

### Esqueleto común de la ficha
- **Titular sobre la carta** (y 150–260): «Esta es **Chispa.**» / «Y esta es **Pausa.**» — Bricolage 800, ≈ 96 px; el nombre en su tinta.
- **Carta:** rectángulo de x 88 a x 992 (904 px), y 290 a y 1196, esquinas redondeadas de 18 px, girada **−1,5°** en Chispa y **+1,5°** en Pausa (como dos cartas tiradas sobre la mesa). Sin contorno: la carta es **papel en reserva** con un **marco de tinta de 14 px** impreso en la plancha de la personaje (rojo / azul). Fondo exterior a la carta: el papel de siempre.
- **Banda superior de la carta** (alto 96 px, tinta llena de la personaje): a la izquierda, el nombre en reserva (papel) — Bricolage 800, 72 px, mayúsculas: `CHISPA` / `PAUSA`. A la derecha, en DM Mono 500 22 px en reserva: `SISTEMA 1 · 01` / `SISTEMA 2 · 02` (número de carta coleccionable).
- **Ventana del retrato** (alto 400 px, bajo la banda): fondo de **semitono de la tinta de la personaje** (puntos al 20–30 %, más densos hacia abajo), y la personaje encima. La plancha de la personaje se reserva detrás de su cuerpo para que la figura no se empaste con la trama.
- **Medidor** en la esquina inferior derecha de la ventana: 5 rayos/segmentos en negro, sin texto. Chispa: 5 de 5 llenos. Pausa: 1 de 5 lleno y los otros 4 en semitono. Es el «Velocidad» hecho dibujo.
- **Bloque de datos** (bajo la ventana, hasta 40 px del borde inferior): filas separadas por filetes negros de 2 px. Etiqueta a la izquierda en **DM Mono 500, 26 px, interletra 0,04**, tal cual está escrita («Velocidad:», «Trabajo:»…) (columna fija de 230 px); valor a la derecha en **Bricolage 600, 36 px**, negro.
- **Fila «Frase»** siempre la última, anclada al fondo de la carta: la etiqueta igual que las demás y el valor en **Bricolage 800, 52 px, en la tinta de la personaje** (es ella hablando).
- Las filas intermedias se reparten el alto restante, de modo que la ventana, la banda y la fila «Frase» caen en el mismo sitio en las dos cartas aunque Pausa tenga una fila más.

> Nota tipográfica: las etiquetas no se pasan a mayúsculas; se respeta la caja del guion, con sus dos puntos. Las únicas mayúsculas de la carta son los rótulos de sistema de la banda (`CHISPA`, `SISTEMA 1 · 01`), que no forman parte del guion.

### Slide 2 · Ficha de Chispa

**Texto (literal):**
> Esta es **Chispa.**
> - **Velocidad:** más rápida que tu pulgar.
> - **Trabajo:** decidir sin preguntar.
> - **Le pierde:** «Solo hoy», «Últimas unidades», el botón de «Comprar ya».
> - **Frase:** «¡Ya, ya, ya!»

**Personaje:** Chispa en la pose del hero: `pose: 'lunge'`, `lean: -16`, `rot: -6`, `expr: 'euforia'`, `sweat: 3`, `speed: 4`. Escala ≈ 1,05, centrada en la ventana y desplazada a la izquierda para que las líneas de velocidad entren desde el borde.
**Rompe la carta:** la mano delantera y el pie trasero **salen de la ventana y pisan la banda o el marco** (en la plancha negra, por encima). Chispa no cabe en su propia carta.
**Atrezo:** una etiqueta de precio pequeña (`priceTag`, «−70 %», escala 0,4) entrando por el borde derecho de la ventana, a la que apunta su mano. Es la misma que persigue en el hero.
**Beat:** energía, reconocimiento («el botón de "Comprar ya"… soy yo»).
**Reutiliza:** pose y expresión completas del hero. **Nuevo:** la plantilla de carta (marco, banda, ventana, filas, medidor) — construirla como componente `fichaCard({ink, nombre, numero, filas, frase, rot})` para usarla en futuros personajes o invitados.

### Slide 3 · Ficha de Pausa

**Texto (literal):**
> Y esta es **Pausa.**
> - **Velocidad:** sin prisa.
> - **Trabajo:** hacer cuentas y leer la letra pequeña.
> - **Le encanta:** comparar precios y consultarlo con la almohada.
> - **Defecto:** llega tarde. Pensar cansa.
> - **Frase:** «Espera… déjame pensarlo.»

**Personaje:** Pausa `pose: 'sit'`, `expr: 'neutral'`, taza humeante, mirando al lector (`look: [0, 5]`). Escala ≈ 0,85, sentada en el borde inferior de la ventana, **completamente dentro** de la carta (contraste con Chispa). Lo único que asoma fuera del marco es el vapor de la taza.
**Gag de imprenta:** la plancha azul de **esta carta** imprime con desregistro exagerado (≈ 8 px abajo-derecha) en el marco y la banda: la carta de Pausa «llegó tarde a la imprenta». El texto de las filas va en la plancha negra y queda en su sitio; el nombre `PAUSA` en reserva se desplaza con la banda, pero sigue legible.
**Beat:** calma, ternura, contrapunto a la slide 2. Al pasar de 2 a 3 el lector tiene que ver dos cartas gemelas con dos temperamentos.
**Reutiliza:** Pausa neutral/sit (hoja, hero). **Nuevo:** nada aparte de la carta compartida.

---

## Slide 4 · El giro

**Texto (literal):**
> Spoiler: **Chispa no es la mala.**
> Gracias a ella frenas antes de pensar, esquivas un balón y reconoces una cara en un segundo.
> Sin Chispa, tardarías media hora en cruzar la calle.

**Maqueta:** texto arriba, y 160–620.
- «Spoiler:» — DM Mono 500, 30 px, como antetítulo.
- «Chispa no es la mala.» — Bricolage 800, ≈ 104 px, 2 líneas, «Chispa» en rojo.
- Párrafo «Gracias a ella…» — texto corrido 40 px.
- Debajo, una **tira de 3 pictogramas** en tinta negra (≈ 90 px cada uno, sin texto): pedal de freno, balón, cara esquemática. Ilustran el párrafo sin añadir palabras.
- «Sin Chispa, tardarías media hora en cruzar la calle.» — texto corrido 40 px, debajo de la tira (y ≈ 760–840), a la izquierda; deja la derecha libre para Chispa.

**Personajes y encuadre:** plano medio, en el tercio inferior.
- **Chispa**, a la derecha (centro ≈ x 760, y 1010, s ≈ 1,05), **sacando pecho**: `pose: 'hips'` (en jarras) con `lean: +8` (se echa hacia atrás), barbilla arriba. Expresión **nueva** «orgullosa» («¿lo ves?»). Una gota de sudor (sigue siendo ella).
- **Pausa**, abajo a la izquierda (centro ≈ x 270, y 1110, s ≈ 0,7), `pose: 'sit'`, `expr: 'neutral'` mirando hacia arriba, a Chispa (`look: [8, -6]`), **asintiendo**: dos marcas de movimiento (pequeños arcos negros) a un lado de la cúpula.
**Beat:** sorpresa y alivio. Chispa deja de ser la culpable; el lector se siente reivindicado.

**Reutiliza:** pose `hips`; Pausa neutral/sit con `look`.
**Nuevo:**
- Expresión de Chispa **`orgullosa`**: un ojo cerrado en arco (de `feliz`) y el otro abierto con pupila hacia el lector, cejas levantadas, sonrisa cerrada de lado (sin dientes). Validar a 150 px y añadir a la hoja.
- Marcas de asentimiento de Pausa (dos arcos de 4 px).
- Pictogramas: freno, balón, cara (tinta negra, formas planas, mismo grosor que las extremidades de Chispa).

---

## Slide 5 · El problema

**Texto (literal):**
> El problema es otro:
> **Chispa decide primero. Pausa llega tarde.**
> Y cuando llega… Chispa ya ha pagado.

**Maqueta:** texto arriba, y 160–560.
- «El problema es otro:» — texto corrido 40 px.
- «Chispa decide primero. Pausa llega tarde.» — Bricolage 800, ≈ 92 px, en dos líneas, una frase por línea: «Chispa» en rojo, «Pausa» en azul.
- «Y cuando llega… Chispa ya ha pagado.» — texto corrido 40 px; es el remate y debe ir justo encima de la escena.

**Personajes y encuadre:** plano general horizontal, como una viñeta de cómic leída de izquierda a derecha.
- **Chispa**, a la izquierda (centro ≈ x 300, y 870, s ≈ 0,95): `pose: 'hold'` modificada — un brazo en alto con una **bolsa de la compra**, el otro sujetando el ticket. `expr: 'feliz'` (feliz e ignorante: el lector se ve en ella).
- **Ticket larguísimo**: tira de papel en reserva con líneas negras de importes ilegibles (rayas, no cifras ni marcas), que sale de su mano, cae al suelo y **serpentea por todo el ancho de la slide** hasta los pies de Pausa. Al final, una línea más gruesa (el total), sin cifra legible.
- **Pausa**, entrando por el borde derecho, **cortada por el encuadre** (un tercio fuera; centro ≈ x 960, y 1080, s ≈ 0,8), inclinada hacia delante, **sin aliento**, taza en mano con el café salpicando (dos gotas negras en lugar de vapor). Sudor en **rojo** (regla de la biblia: el sudor va en la tinta de la otra). Su plancha azul con **desregistro exagerado** (≈ 12 px): todavía no ha llegado del todo.
**Beat:** «ay, soy yo». El momento de reconocimiento más fuerte del carrusel.

**Reutiliza:** Chispa `feliz`; base de pose `hold`.
**Nuevo:**
- Pose de Chispa **`compra`**: variante de `hold` con bolsa en una mano y ticket en la otra.
- Pose de Pausa **`llega`**: cuerpo girado ≈ 6° hacia delante, pies en zancada (elipses separadas, una levantada), muñón con taza por delante. Sigue siendo lenta: nada de líneas de velocidad, solo *squash*.
- Expresión de Pausa **`jadeo`**: párpados a media asta, boca abierta en O (la de `alarma`) más pequeña, dos trazos de resoplido.
- Atrezo: bolsa de la compra (tinta negra con asas en reserva, sin logos), ticket largo, salpicadura de taza.

---

## Slide 6 · Lo que nadie te cuenta

**Texto (literal):**
> Ofertas flash. Cuentas atrás. «Quedan 2».
> **Todo eso está diseñado para hablar con Chispa…**
> **antes de que Pausa se entere.**

**Maqueta:** texto arriba, y 160–520.
- Primera línea (Ofertas flash… Quedan 2) — DM Mono 500, 32 px (suena a ruido de anuncios).
- «Todo eso está diseñado para hablar con Chispa…» / «antes de que Pausa se entere.» — Bricolage 800, ≈ 76 px, cuatro líneas como máximo; «Chispa» en rojo, «Pausa» en azul.

**Personajes y encuadre:** plano centrado y agobiante en la mitad inferior (y 560–1220).
- **Chispa**, en el centro (centro ≈ x 520, y 900, s ≈ 0,9), quieta e hipnotizada: `pose: 'stand'` con los brazos pegados (o `shrug`), `expr: 'alarma'` — **ojos como platos**, pupilas pequeñas. `sweat: 3`.
- **Rodeándola**, en la plancha roja (todo el mundo comercial está impreso en la tinta de Chispa: el mundo habla su idioma):
  - 2–3 etiquetas `priceTag` («−70 %», «−50 %») inclinadas;
  - un **reloj de cuenta atrás** (cuerpo en negro, dígitos en reserva, «00:59»);
  - un cartel `QUEDAN 2` y uno `OFERTA FLASH`;
  - opcional: `SOLO HOY` y `COMPRAR YA` (ya aparecen en la ficha de Chispa).
  Los carteles cierran un círculo alrededor de ella, se tocan con los bordes del encuadre y **dejan libre un pasillo** hacia la esquina de Pausa.
- **Pausa**, en la esquina inferior derecha, pequeña (s ≈ 0,5), parcialmente cortada por el filete del pie, **dormida**: taza en el suelo sin vapor, «z z z» en azul.
**Beat:** indignación cómplice («me lo están haciendo a propósito»). El color hace la explicación: rojo por todas partes, el único azul está dormido.

**Reutiliza:** Chispa `alarma` (construida, pendiente de validar en hoja), `priceTag` de scenes.js.
**Nuevo:**
- Expresión de Pausa **`dormida`**: ojos cerrados como líneas casi planas (curva leve hacia abajo), boca entreabierta pequeña, «z z z» en Bricolage 800 azul.
- Pose de Pausa **`duerme`**: `nomug` sin muñón visible, taza dejada en el suelo junto a ella, cuerpo un poco hundido (*squash* 5 %).
- Atrezo: reloj de cuenta atrás y carteles de oferta (sin marcas ni logos, solo las palabras indicadas).

---

## Slide 7 · De qué va esta cuenta

**Texto (literal):**
> Todos tenemos una Chispa y una Pausa.
> Aquí no vamos a apagar a Chispa.
> **Vamos a enseñar a Pausa a llegar a tiempo.**
> Cada semana: un truco que usa tu Chispa y cómo frenarlo.

**Maqueta:** texto arriba, y 160–640.
- «Todos tenemos una Chispa y una Pausa.» y «Aquí no vamos a apagar a Chispa.» — texto corrido 44 px.
- «Vamos a enseñar a Pausa a llegar a tiempo.» — Bricolage 800, ≈ 88 px, 3 líneas, «Pausa» en azul. Subrayado con **dos trazos superpuestos**, uno rojo y otro azul, que se cruzan: donde se pisan sale el ciruela (el único acento ciruela del carrusel junto al punto de progreso).
- «Cada semana: un truco que usa tu Chispa y cómo frenarlo.» — texto corrido 40 px.

**Personajes y encuadre:** plano medio frontal, simétrico, en la mitad inferior. Las dos **del mismo lado** por primera vez, mirando al lector, sobre una única sombra de suelo compartida.
- **Pausa**, a la izquierda (centro ≈ x 360, y 1040, s ≈ 0,85): `pose: 'sit'`, `expr: 'neutral'`, `look: [0, 4]` (al lector), taza.
- **Chispa**, a la derecha (centro ≈ x 780, y 990, s ≈ 0,85): `pose: 'stand'`, `expr: 'neutral'` con pupilas centradas al lector, una gota de sudor.
- **La correa**, del asa de la taza de Pausa al tobillo de Chispa, **floja** (curva caída que toca el suelo): no la apaga ni la arrastra; solo la acompaña.
- No se pisan; 30–40 px de aire entre las dos.
**Beat:** alivio y promesa. Es la imagen que resume la cuenta; debe poder recortarse sola como pieza de marca.

**Reutiliza:** Pausa neutral/sit; Chispa neutral/stand; correa del hero.
**Nuevo:** parámetro `look` en `mapi()` para que Chispa mire al lector (pendiente en la biblia). Subrayado bicolor.

---

## Slide 8 · De dónde salen

**Texto (literal):**
> Chispa y Pausa se inspiran en el **Sistema 1** y el **Sistema 2** del psicólogo **Daniel Kahneman**, premio Nobel de Economía en 2002.
> Son una forma de entender cómo decides, no dos trozos reales de tu cerebro.
> *Aquí todo va con fuentes. Sin humo.*

**Maqueta:** es la slide con más texto; texto arriba, y 160–700.
- Primer párrafo — texto corrido 44 px; las negritas («Sistema 1», «Sistema 2», «Daniel Kahneman») en Bricolage 800.
- Segundo párrafo — texto corrido 44 px.
- «Aquí todo va con fuentes. Sin humo.» — DM Mono 500 cursiva, 30 px, como nota al margen, con un filete corto de 2 px encima.

**Personajes y encuadre:** plano medio, mitad inferior (y 740–1220).
- **Pausa**, centrada (centro ≈ x 540, y 1060, s ≈ 0,9), **leyendo**: los dos muñones sujetan un **libro abierto** genérico delante de la parte baja del cuerpo (páginas en reserva con líneas grises de semitono; sin título ni portada reconocible). **Gafas** de lectura redondas en tinta negra sobre los ojos. `expr: 'neutral'` con `look: [4, 10]` (mirada al libro). La taza en el suelo a su lado, **sin vapor** (guiño a «sin humo»).
- **Chispa**, **asomando por detrás** de Pausa, por encima de su cúpula a la derecha: solo se ven la parte alta del cuerpo, los ojos y las dos manos-punto agarradas al borde de Pausa. `expr: 'neutral'` mirando hacia el libro (curiosa). Pausa reserva su silueta en la plancha roja (`knockFor: ['red']`) para que Chispa quede detrás sin ciruela.
**Beat:** confianza. Pausa en su elemento; Chispa también quiere saber.

**Reutiliza:** expresiones `neutral` de las dos (con `look`).
**Nuevo:**
- Pose de Pausa **`lee`**: dos muñones hacia delante sujetando el libro, sin taza en mano.
- Pose de Chispa **`asomada`**: `pose: 'none'` + dos manos-punto sueltas en el borde; recortada por el cuerpo de Pausa.
- Atrezo: libro abierto genérico, gafas de lectura (atrezo de situación, **no** rasgo permanente de Pausa).
- **No dibujar a Kahneman** ni la portada real de su libro.

---

## Slide 9 · Tu turno

**Texto (literal):**
> ¿Quién manda más en tu cabeza?
> 🔴 Chispa · 🔵 Pausa
> **Comenta con un color.**
> Envíaselo a la Chispa de tu grupo. Y síguenos para que tu Pausa llegue a tiempo.

**Maqueta:**
- «¿Quién manda más en tu cabeza?» — Bricolage 800, ≈ 104 px, arriba (y 160–400).
- «🔴 Chispa · 🔵 Pausa» — **los emojis se dibujan como puntos de tinta** (círculos llenos de 44 px en rojo y azul), no como glifos de emoji. Bricolage 800, 72 px: «Chispa» en rojo, «·» en negro, «Pausa» en azul. Centrado en y ≈ 470. Cada nombre queda encima de su personaje (Chispa a la izquierda, Pausa a la derecha), como dos botones de voto.
- «Comenta con un color.» — Bricolage 800, 60 px, centrado, y ≈ 560.
- «Envíaselo a la Chispa de tu grupo. Y síguenos para que tu Pausa llegue a tiempo.» — texto corrido 36 px, **abajo**, justo encima del filete del pie (y 1120–1210), a lo ancho.
- Pie: sin «Desliza →»; firma `Dinero Irracional` a la izquierda y `09 / 09` a la derecha.

**Personajes y encuadre:** plano medio, las dos mirando al lector (y 600–1110).
- **Chispa**, izquierda (centro ≈ x 330, y 830, s ≈ 0,95), **saltando**: `pose: 'cheer'`, `expr: 'euforia'` con pupilas al lector, marcas de exaltación, `sweat: 2`, sombra despegada (como en la slide 1: el carrusel empieza y termina con el mismo salto).
- **Pausa**, derecha (centro ≈ x 770, y 960, s ≈ 0,85), **brindando**: muñón derecho en alto con la taza levantada, vapor. Cara de «brindis»: ojos a media asta mirando al lector + sonrisa en D con rubor de `feliz`.
**Beat:** participación y cariño. Cierre amable, sin presión.

**Reutiliza:** Chispa euforia/cheer (cover-mock); boca y rubor de Pausa `feliz`.
**Nuevo:**
- Pose de Pausa **`brindis`**: muñón derecho levantado a la altura de la cúpula, taza arriba.
- Expresión de Pausa **`brindis`**: ojos de `neutral` (`look` al lector) + boca y rubor de `feliz`.
- Puntos de voto en tinta.

---

## Resumen: qué se reutiliza y qué hay que construir

**Reutilizado tal cual (aprobado):**
- Chispa: `euforia`+`cheer` (1, 9), `euforia`+`lunge`+lean −16 del hero (2), `hips` (4), `feliz` (5), `neutral`+`stand` (7, 8).
- Pausa: `neutral`+`sit` (1, 3, 4, 7, 8), boca/rubor de `feliz` (9).
- Atrezo: taza, correa del hero, `priceTag`, `burst`, `shadowEllipse`, semitono.

**Pendiente de validar (ya existe en código):** Chispa `alarma` (6).

**Nuevo — a construir en `build.js` como variantes, probar a 150 px y añadir a la biblia:**
| Tipo | Nombre | Slide |
|---|---|---|
| Expresión Chispa | `orgullosa` | 4 |
| Pose Chispa | `compra` (bolsa + ticket) | 5 |
| Pose Chispa | `asomada` | 8 |
| Parámetro Chispa | `look` en `mapi()` | 7, 9 |
| Expresión Pausa | `jadeo` | 5 |
| Expresión Pausa | `dormida` | 6 |
| Expresión Pausa | `brindis` (ojos neutral + boca feliz) | 9 |
| Pose Pausa | `llega` | 5 |
| Pose Pausa | `duerme` | 6 |
| Pose Pausa | `lee` | 8 |
| Pose Pausa | `brindis` | 9 |
| Componente | `fichaCard` (carta de personaje) | 2, 3 |
| Atrezo | pictogramas freno/balón/cara; bolsa; ticket largo; salpicadura; reloj de cuenta atrás; carteles «QUEDAN 2», «OFERTA FLASH»; libro; gafas; «z z z»; marcas de asentimiento; puntos de voto; subrayado bicolor; sombra despegada | 4–9 |

**Checklist de entrega para el ilustrador:**
- 9 PNG 1080 × 1350 (`slide-01.png` … `slide-09.png`) + SVG + script, en esta carpeta.
- Texto idéntico a `copy.md` (¿¡, tildes, «», …).
- Cabecera y pie idénticos en las 9; «Desliza →» en 1–8.
- Ninguna cara con ciruela; Chispa sin rotaciones > 8°.
- Prueba de la portada a 150 px y de las fichas a 320 px.
