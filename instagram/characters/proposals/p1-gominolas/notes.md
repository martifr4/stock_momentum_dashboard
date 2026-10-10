# Propuesta 1 — «Gominolas» (ronda 2)

**Estilo:** pegatina kawaii de gominola. Tres adjetivos: **blandito, brillante, entrañable**.

## Idea central
Mapi y Capi son **dos formas de pensar dentro de un mismo cerebro**: dos gominolas
con circunvoluciones. No representan hemisferios ni regiones reales (evitamos el
mito del «cerebro izquierdo / derecho»). El truco memorable: **cuando se abrazan se
funden en UNA sola silueta de cerebro**: se pintan primero los dos contornos y
luego los dos rellenos, de modo que el contorno interior desaparece y queda un
único perfil cerrado con una cisura fina donde se tocan. Es el avatar y el logotipo.

## Lenguaje de formas
| | Mapi (Sistema 1) | Capi (Sistema 2) |
|---|---|---|
| Silueta | Bola **alta y estrecha**, pesada arriba, **8 lóbulos grandes e irregulares**, un único rizo suelto. | **Cúpula/pera ancha y baja** (≈1,4× más ancha que Mapi), peso abajo, **6 lóbulos amplios y simétricos**, taza humeante. Sin aristas rectas. |
| Surcos | 2 surcos largos y sinuosos (uno cruza la frente; otro baja por el costado) + 2 espuelas con remate de bola. | 4 surcos largos, ondulados y **paralelos**, que recorren el cuerpo de arriba abajo (dos a cada lado de la cara) + uno corto central. |
| Ojos | Enormes, separados; **asimétricos** (el izquierdo un 10 % mayor, siempre). | Párpados a media asta; sólo los abre del todo cuando se alarma. |
| Postura por defecto | **Inclinado (−7°) con un pie en el aire.** Nunca quieto. | Vertical, asentado, brazos caídos o con la taza. |
| Valor en gris | Claro (L* 58) | Oscuro (L* 37) → 21 puntos de diferencia, se distinguen en blanco y negro. |

Proporciones chibi: cabeza = cuerpo; brazos y piernas son «salchichas» de gominola.

## Firmas propias (para no ser «kawaii genérico»)
1. **Surco con remate de bola:** todo surco que acaba dentro del cuerpo termina en
   una bolita de tinta, como una gota de gominola. Aparece en ambos y en el logo.
2. **Ojos asimétricos de Mapi:** el ojo izquierdo siempre algo más grande; refuerza
   su descontrol sin necesidad de gestos.
3. **El abrazo-fusión:** dos siluetas que se convierten en una.

## Construcción
- `chars.js`: `lobed()` genera cada cuerpo a partir de una elipse base y una lista
  de cúspides (ángulos + abombamiento por lóbulo); `smooth()` traza surcos
  (Catmull-Rom → Bézier). Ojos paramétricos (`eye()`), cejas, bocas, rubor,
  extremidades (`limb()`, con opción rígida), sudor y taza. Expresiones de Mapi:
  `neutral`, `alarm`, `euphoria`, `happy`, `skeptic`; de Capi: `neutral`, `alarm`,
  `happy`, `skeptic`. Poses: `stand`, `panic`, `run`, `cheer`, `hips` / `stand`,
  `mug`, `mugFront`, `sides`, `raise`, `point`, `shrug`, y `custom`.
- `scenes.js`: escenas y accesorios (bolsas, etiqueta, monedas, monedero de
  boquilla, bocadillos, filtro de pegatina, `hug()` con fusión de siluetas, logotipo).
- `render.js`: `node render.js [escena…]` → `<escena>.svg` + `<escena>.png`.

## Acabado
- Contorno ciruela de 9 px (nunca negro), surcos de 5 px, extremos redondeados.
- Sombreado plano de una sola capa (el tono base desplazado 12 px hacia la luz
  sobre el tono sombra, recortado a la silueta). Sin degradados.
- Brillo de caramelo: un trazo blanco curvo + un punto en el lóbulo alto exterior.
- Contorno blanco de pegatina sólo en avatar y en el «7» de la portada.
- Fondos pastel planos, uno por post.

## Paleta (hex)
| Uso | Hex |
|---|---|
| Contorno / texto | `#33203A` |
| Mapi / sombra | `#F5506A` / `#CF3152` |
| Capi / sombra | `#2850B8` / `#1B3889` |
| Rubor / interior de boca | `#FF9BB5` / `#FF6F8A` |
| Acento (taza, monedas, etiqueta) | `#FFE27A` (`#F2BE3C`) |
| Sudor | `#8FD8F7` |
| Fondos | menta `#CDEFDF` · lila `#E2DAFF` · mantequilla `#FFEDB0` · cielo `#D3E9FF` · melocotón `#FFD9CC` |

(Sin crema `#F4EEE3`, sin coral `#FF5A36`, sin Fraunces.)

## Tipografía
**Fredoka** 500/600/700 (Google Fonts): redondeada, gruesa, buenos acentos y ¿¡.

## Nombres
**Mapi** y **Capi**: cortos, riman (son pareja) y la pregunta «¿Eres más Mapi o
más Capi?» funciona tal cual.

## Animación en Reels
- **Mapi:** squash & stretch exagerado (rebota como gominola); reposo con temblor de
  1–2 px; el rizo va con retraso (follow-through); en pánico, pupilas encogidas que
  vibran y brazos rígidos.
- **Capi:** la mitad de fotogramas que Mapi; parpadeo lento del párpado del 50 % al
  100 %; vapor en bucle. Gag fijo: entra en plano tarde.
- **Cierre:** se abrazan, «blop» de fusión (las dos siluetas se vuelven una), sale el
  corazón → logotipo.

## Puntos débiles conocidos
- Capi, de frente y solo, puede leerse a ratos como «flan/gelatina azul»; los surcos
  largos ayudan, pero su lectura de «cerebro» sigue siendo más débil que la de Mapi.
- La silueta fusionada del abrazo es un cerebro asimétrico (más alto por el lado de
  Mapi): funciona como cerebro de perfil, no como vista frontal simétrica.
- En la hoja de expresiones Capi sale pequeño (por su anchura); su cara es legible
  pero con menos detalle que la de Mapi.
- El kawaii es un territorio muy transitado: la personalidad debe venir también de
  poses y guion.
- Los SVG cargan Fredoka por `@import`; sin conexión caen a una sans genérica.

## Ronda 2 — cambios
1. **Capi redibujado:** cúpula/pera sin aristas rectas, 6 lóbulos amplios, 4 surcos
   largos que recorren todo el cuerpo (+1 central). Ya no es «tofu».
2. **Mapi redibujado:** de ~14 bultos a 8 lóbulos grandes; los ganchos en C se
   sustituyen por 2 surcos largos y continuos; los dos pelos pasan a un solo rizo.
3. **Contraste:** Capi 1,4× más ancho y bajo (peso abajo); azul oscurecido a
   `#2850B8` (L* 37) y Mapi aclarado a `#F5506A` (L* 58): 21 puntos de L*.
   Mapi por defecto inclinado y con un pie en el aire. `check-150px.png` incluye
   siluetas y versión en gris.
4. **Fuera «mitades/hemisferios»:** el texto del hero es «Dos formas de pensar, un
   mismo cerebro.». El abrazo ahora se funde en una sola silueta cerrada (avatar y
   logo); por eso se mantiene el truco.
5. **Textos y expresión:** «Uno compra primero. El otro piensa después.». La alarma
   de Mapi tiene boca de grito ovalada y alta, pupilas encogidas, cejas muy alzadas
   y brazos rígidos con marcas de vibración. La alarma de Capi pasa a ser «abre los
   ojos del todo + gota», para no repetir la de Mapi.
6. **Extras:** monedero rectangular de boquilla con cierre visible en la portada;
   la etiqueta «−70 %» va atada con cordel a la bolsa; la taza de Capi queda a ~50 px
   del borde; firmas propias (surco con bolita, ojos asimétricos, abrazo-fusión).

## Archivos
`hero.png/.svg`, `expressions.png/.svg`, `cover-mock.png/.svg`,
`avatar.png/.svg` (320×320), `check-150px.png/.svg`, `chars.js`, `scenes.js`,
`render.js`, `notes.md`.
