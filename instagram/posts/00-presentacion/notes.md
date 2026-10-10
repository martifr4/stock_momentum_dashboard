# Post 00 · Presentación — notas de ilustración

## Qué se ha construido
- **Librería compartida** `instagram/characters/riso/riso.js`, refactorizada desde `proposals/p2-riso/build.js` (que queda intacta como propuesta histórica):
  - `mapi()` → `chispa()`, `capi()` → `pausa()`, constantes `MAPI_*`/`CAPI_*` → `CHISPA_*`/`PAUSA_*`.
  - `chispa()` admite `look` (mirada al lector u objeto), `limbs` (sobrescribe codo y mano de una pose, siempre desde los enchufes `SOCK`), `halo` (hueco de reserva alrededor de la silueta) y `hands` (manos-punto sueltas).
  - `pausa()` admite `squash` y `halo`.
  - Expresiones nuevas: Chispa `orgullosa` (y `alarma` revisada: pupilas pequeñas centradas y boca pequeña sin dientes); Pausa `jadeo`, `dormida` y `brindis`.
  - Poses nuevas: Chispa `compra` (bolsa + mano del ticket) y `tiesa` (brazos pegados, para la hipnosis de la slide 6); Pausa `llega`, `duerme`, `lee` (libro + gafas) y `brindis`.
  - Atrezo: `bag`, `book`, `glasses`, `mug(steam: 'vapor' | 'salpica' | false)`, `pausaSweat` (en rojo), `nodMarks`, `liftedShadow`, `priceTag`, `sign` y `coin`.
  - Componentes: `fichaCard()` (carta coleccionable), `pageChrome()` (cabecera, pie, contador y tira de progreso), `richText()` (texto con varias tintas por línea, cada tinta en su plancha) y `measurer()` (ajuste de línea con medidas reales de las fuentes).
  - Hoja de prueba de lo nuevo: `characters/riso/poses-check.png`, revisada también a 540 px de ancho.
- **Slides:** `render.js` importa la librería y genera `slide-01…09.png` + `.svg`, y `overview.py` monta `overview.png` (3 × 3). Uso: `node render.js` (todas + overview) o `node render.js 2 5` (sueltas).
- Todo el texto está copiado literal de `copy.md`. El rojo solo aparece en tamaño display (≥ 56 px): nombres en titulares, frase de la ficha y botón de voto. El texto corrido va siempre en negro.

## Desviaciones del brief
- **Slide 1:** el subtítulo se corta a mano en dos líneas («Y las dos deciden qué haces / con tu dinero.») para que no quede una palabra viuda. El texto es literal.
- **Slide 2:** la mano delantera de Chispa sube hasta la banda en vez de apuntar a la etiqueta. La etiqueta «−70 %» queda en la esquina superior derecha de la ventana, a la altura de esa mano. Lo que rompe la carta son el pie trasero, las líneas de velocidad y el brazo.
- **Slide 3:** Pausa va a escala ≈ 1,08 (el brief decía ≈ 0,85) para que la ventana no se vea vacía. Sigue completamente dentro de la carta. El vapor de la taza no sale del marco: a esta escala cruzaba la cara. El gag del desregistro (8 px en marco y banda) sí está.
- **Slide 5:** Chispa va más grande que en el brief (≈ 1,34) y el ticket arranca en vertical antes de serpentear, para llenar el plano. Pausa entra por la derecha, cortada, con la plancha azul desplazada 12 px.
- **Slide 6:** la pose de Chispa es la nueva `tiesa` en vez de `stand` o `shrug`. No hay cartel «COMPRAR YA» (era opcional): con «SOLO HOY» ya hay ruido suficiente.
- **Slide 8:** las manos de Chispa se agarran a la cúpula de Pausa, no a un «borde» lateral.
- **Slide 7:** con un desregistro de 2–3,5 px, el ciruela del subrayado bicolor queda muy fino; se lee como «rojo y azul entrelazados».
- **Tira de progreso:** en los puntos ciruela (7 y 9) se compensa el desregistro estándar para que los dos puntos se pisen enteros.

## Puntos débiles conocidos
- **Slide 2:** el brazo delantero de Chispa se alarga (vía `limbs`) para llegar a la banda y queda muy largo y fino; le quita algo de gracia. Sería mejor un brazo más corto que pise solo el marco.
- **Slide 6:** Chispa es pequeña en relación con el ruido. Se lee a 360 px, pero su cara podría crecer un 10–15 %.
- **Slide 8:** las gafas cubren casi toda la cara de Pausa y el libro tapa la boca: la expresión es casi solo de ojos.
- **Pausa `llega` (slide 5):** el «squash» y la zancada se leen poco, porque está cortada por el encuadre. El sudor rojo y la salpicadura hacen casi todo el trabajo.
- **Cotas de texto:** la medición de texto se hace en Chromium con las fuentes reales. Si Google Fonts cambia la versión de Bricolage, conviene revisar los cortes de línea.

## Ronda 2 — cambios (crítica 48/70)
**Bloqueantes**
- **Slide 2:** fuera el brazo largo y recto que, con la etiqueta y el medidor de barras, parecía un gráfico de bolsa. Ahora el brazo es corto y doblado (`limbs.armR`) y agarra la etiqueta «−70 %». Sin rotación del cuerpo: `rot: 0`, `lean: −10`, base horizontal.
- **Slide 1:** titular a 168 px en dos líneas. Subtítulo a 66 px en Bricolage 600 con «tu dinero.» en 800 (la línea del dinero). Pausa a s = 0,7.
- **Papel lila en la slide 1: es intencionado** (decisión del coordinador). Así el post fijado destaca en la cuadrícula del perfil; las slides 2–9 van en «niebla».

**Corregido**
- **Slide 4:** fuera los tres pictogramas. Más sitio para las personajes, en el mismo plano. Pausa a s = 1,25 y Chispa a 0,62 × su ancho. Pausa asiente con arcos de movimiento sobre la cúpula y cara satisfecha (expresión `brindis`: media asta + sonrisa en D + rubor de reserva).
- **Slide 5:**
  - Ticket nuevo: tira de papel en reserva plegada en dos tramos rectos, con renglones cortos (concepto + importe), sombra de semitono, final rasgado en zigzag y «TOTAL 189,99 €».
  - La salpicadura de la taza son ahora gotas que salen en arco.
  - El final del ticket, la taza y el muñón de Pausa quedan separados.
  - El remate «Y cuando llega…» sube para quedar más cerca del titular.
- **Pausa (librería):**
  - Cara recentrada 30 px hacia el centro del cuerpo: ojos (4, 12) y (76, 10), boca (40, 62). Se acorta el surco que habría cruzado el ojo.
  - Afecta a todas las slides; **la biblia (§6) debe actualizar estas coordenadas** (no se ha tocado, está fuera del alcance de esta tarea).
- **Slide 9:**
  - El brazo del brindis es una cápsula aparte que nace en el borde del cuerpo, con su hueco de reserva de 6 px (ya no parece una tetera).
  - Titular cortado como «¿Quién manda más / en tu cabeza?».
  - Chispa pisa el filete del pie.
  - Para que no choque con Chispa, el texto «Envíaselo…» sube bajo «Comenta con un color.» (desviación de la maqueta del brief).
- **Slide 8:** Chispa tiene bracitos de alambre desde sus enchufes hasta las manos agarradas a la cúpula. Se quita la taza huérfana.
- **Slide 6:** Pausa y su taza se levantan del filete y se apartan de la tira de progreso.

**Extras**
- **Slide 6:** carteles apretados alrededor de Chispa y pisándose. «QUEDAN 2» casi la toca y Chispa va delante con un hueco de reserva (`halo`). Chispa crece un ~18 % (s = 1,08).
- **Slide 9:** fuera el «·» suelto entre los dos botones de voto, a petición de la crítica. Es una desviación consciente del literal de copy.md («🔴 Chispa · 🔵 Pausa»): la separación ya la hacen la distancia y los puntos de color.
- **Slides 2–3:**
  - Etiquetas de la carta a 30 px.
  - El medidor pasa a ser un velocímetro de 5 sectores con aguja, sin texto: Chispa a tope, Pausa en el primer sector.

**Puntos débiles que quedan**
- **Slide 5:** «TOTAL 189,99 €» se lee en vertical, porque el ticket está tumbado en el suelo. A tamaño de feed se reconoce como ticket, pero la cifra es pequeña.
- **Slide 8:** el bracito izquierdo de Chispa baja casi en vertical y puede leerse como una pata.
- **Slide 4:** las marcas «( )» del asentimiento siguen siendo una convención de cómic; si no se leen, quitarlas y dejar que lo diga la cara.
