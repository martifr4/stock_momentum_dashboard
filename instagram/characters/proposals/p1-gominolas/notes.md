# Propuesta 1 — «Gominolas»

**Estilo:** pegatina kawaii de gominola. Tres adjetivos: **blandito, brillante, entrañable**.

## Idea central (el truco memorable)
Mapi y Capi son **las dos mitades de un mismo cerebro**. Cada uno tiene un lado
plano (la «cara interior» del hemisferio) y un lado redondo lleno de lóbulos.
Cuando se abrazan, los lados planos encajan y forman un cerebro completo, con un
corazoncito sobre la costura → avatar y logotipo. El lado plano es el «gancho»
visual: en cualquier escena siempre se miran por ese lado, se buscan.

## Lenguaje de formas
| | Mapi (Sistema 1) | Capi (Sistema 2) |
|---|---|---|
| Silueta | Bola alta, **pesada arriba**, contorno con **muchos lóbulos pequeños e irregulares** (nervioso, arrugado), dos pelillos sueltos (pliegues «despeinados»). | Pera ancha, **pesada abajo**, **pocos lóbulos grandes y lisos**, asentada. Siempre con taza humeante (rompe la silueta por un lado). |
| Tamaño | ~80 % de la altura de Capi, más estrecho. | Más grande y ancho (≈1,3× de ancho). |
| Pliegues | Cortos, torcidos, cada uno hacia un lado. Nacen en las muescas del contorno. | Largos, paralelos, con la misma curvatura: «peinados». |
| Ojos | Enormes, separados, bajos; dos brillos; en alarma, brillo duplicado = pupila temblorosa. | Párpados a media asta (párpado = semiplano recortado, curva suave); en alarma, ojos en blanco con pupila diminuta. |
| Postura | Inclinado, brazos arriba, pies en movimiento, gotas de sudor. | Vertical, quieto, brazos caídos o sujetando la taza. |

Proporciones chibi: cabeza = cuerpo (no hay cuello); brazos y piernas son
«salchichas» de gominola con extremo redondo. Cara en el tercio inferior-central
del cuerpo (rasgo kawaii).

## Construcción
- `chars.js` define una sola vez: cuerpos (paths Bézier), pliegues principales
  (tinta) y secundarios (sombra), ojos paramétricos (`eye()` con mirada, párpado e
  inclinación), cejas, bocas, rubor, extremidades, gotas de sudor y taza.
  Expresiones: `neutral`, `alarm`, `euphoria`, `happy`, `skeptic`, `panic` (Mapi);
  `neutral`, `alarm`, `happy`, `skeptic`, `sip` (Capi). Poses: `stand`, `panic`,
  `run`, `cheer`, `hips` / `stand`, `mug`, `cross`, `point`, `shrug`, más `custom`.
- `scenes.js` compone las escenas y los accesorios (bolsas, etiqueta, monedas,
  monedero, bocadillos, filtro de pegatina, abrazo `hug()`, logotipo).
- `render.js`: `node render.js [escena…]` → escribe `<escena>.svg` y `<escena>.png`
  (Playwright + Chromium, Fredoka de Google Fonts).

## Acabado
- Contorno exterior grueso (9 px a escala 1) en ciruela oscura, nunca negro.
  Líneas interiores a 5 px. Puntas y uniones redondeadas.
- Sombreado plano de una sola capa: el cuerpo se dibuja en tono sombra y encima el
  tono base desplazado 12 px hacia la luz (arriba-izquierda en Mapi,
  arriba-derecha en Capi), recortado a la silueta. Nada de degradados.
- Brillo de caramelo: un trazo blanco curvo + un punto, siempre en el lóbulo más
  alto del lado exterior.
- Contorno blanco de pegatina (`feMorphology dilate`) con sombra suave solo en el
  avatar, el logotipo y el «7» de la portada.
- Fondos pastel planos, uno por post, con motitas del mismo tono un paso más oscuro.

## Paleta (hex)
| Uso | Hex |
|---|---|
| Contorno / texto (ciruela) | `#33203A` |
| Mapi rojo cereza / sombra | `#EE3D5B` / `#C2244A` |
| Capi azul / sombra | `#4F86E8` / `#3361C4` |
| Rubor / interior de boca | `#FF9BB5` / `#FF6F8A` |
| Acento (taza, monedas, etiquetas) | `#FFE27A` (`#F2BE3C` sombra) |
| Sudor | `#8FD8F7` |
| Fondos pastel por post | menta `#CDEFDF` · lila `#E2DAFF` · mantequilla `#FFEDB0` · cielo `#D3E9FF` · melocotón `#FFD9CC` |

(Sin crema `#F4EEE3`, sin coral `#FF5A36`, sin Fraunces.)

## Tipografía
**Fredoka** (Google Fonts) 500/600/700: redondeada y gruesa, con buen soporte de
acentos y ¿¡. Títulos 700, bocadillos 600, texto de apoyo 500.

## Nombres
Se mantienen **Mapi** y **Capi**: cortos, simétricos, se leen bien en etiquetas
pequeñas y suenan a mascota. Además riman, lo que refuerza que son pareja, y la
pregunta «¿Eres más Mapi o más Capi?» funciona tal cual.

## Animación en Reels
- **Mapi:** squash & stretch exagerado en cada gesto (es gominola: rebota). Ciclo
  de reposo en 2 fotogramas con temblor de 1–2 px; los pelillos se agitan con
  retraso (follow-through). Pupila temblorosa = brillo que alterna entre dos
  posiciones cada 2 fotogramas. Entra en plano corriendo con líneas de velocidad.
- **Capi:** se mueve a la mitad de fotogramas que Mapi. Parpadeo lento (el
  párpado baja del 50 % al 100 % y sube). Vapor de la taza en bucle. Gag fijo:
  entra en plano tarde, cuando el diálogo ya ha empezado.
- **Encaje:** al final de cada Reel se abrazan y los lados planos se pegan con un
  «blop» de gominola (squash horizontal) → aparece el corazón → logotipo.
- Todo está construido con grupos SVG separados (cuerpo, cara, brazos, piernas,
  accesorios), así que se puede exportar por capas a After Effects/Rive/Lottie.

## Puntos débiles conocidos
- **«Cerebro» a primera vista:** Mapi se lee cerebro gracias a los pliegues; Capi,
  más liso, puede leerse como «gominola azul/nube» si aparece solo. Los pliegues de
  tinta ayudan, pero el concepto «mitades» se entiende de verdad cuando están juntos.
- Mapi, roja y lobulada, puede recordar a una frambuesa a tamaño muy pequeño.
- El estilo kawaii es amable pero muy extendido en stickers; la personalidad tiene
  que venir de las poses y del guion, no solo del dibujo.
- Las extremidades son trazos simples (salchichas); para Reels convendría una
  versión con codo para gestos más ricos.
- La asimetría de tamaños hace que el «cerebro completo» del abrazo no sea
  perfectamente simétrico (se ha compensado escalando a Capi al 96 % en `hug()`).
- Los SVG cargan Fredoka por `@import`; sin conexión caen a una sans genérica (el
  PNG ya va renderizado).

## Archivos
`hero.png/.svg`, `expressions.png/.svg`, `cover-mock.png/.svg`,
`avatar.png/.svg` (320×320), `check-150px.png/.svg` (prueba de lectura a 150 px y
siluetas), `chars.js`, `scenes.js`, `render.js`, `notes.md`.
