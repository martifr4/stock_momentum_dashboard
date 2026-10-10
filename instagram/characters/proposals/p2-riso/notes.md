# Propuesta 2 — «Riso»

**Dos tintas, un cerebro.** Mapi y Capi son formas geométricas puras impresas en risografía: cada personaje es, literalmente, una plancha de tinta del mismo cerebro.

## Idea central (lo inesperado)
- **Cada personaje es una plancha.** Mapi se imprime en rojo flúor y Capi en azul. Donde se pisan aparece una tercera tinta por sobreimpresión (multiply): un **ciruela** oscuro. Es el «cerebro completo»: se reserva para momentos de acento (rubor no; caras nunca).
- **Capi llega tarde hasta en la imprenta.** La plancha azul siempre imprime un poco desplazada (≈3,5 px abajo a la derecha y 0,12° de giro), y la roja va 2 px por delante. Es un desregistro de riso real convertido en rasgo del personaje. En un Reel se puede exagerar: la plancha azul entra deslizándose y «encaja» medio segundo tarde.
- **Gag del hero:** Capi no se levanta ni para sujetar a Mapi. Lo tiene atado al asa de la taza.
- **Portada:** Mapi, subido al «7», lanza monedas que salen volando del encuadre; Capi lo mira desde abajo: «Mapi…».
- **Cada uno habla en su tinta:** lo que dice Mapi va en rojo y lo que dice Capi, en azul. Así no hacen falta bocadillos (los contornos quedan fuera del estilo).

## Personajes y lenguaje de formas
| | **Mapi — Sistema 1** | **Capi — Sistema 2** |
|---|---|---|
| Forma | Perfil de cerebro facetado con **base plana** y laterales que se estrechan abajo; la cúpula son **7 lóbulos romos** (arcos), de los que solo 3 son puntas afiladas. | **Canto rodado** con tres lóbulos suaves, base plana y pesada. |
| Pliegues | Dos surcos en zigzag concéntricos bajo la cúpula + una cisura horizontal en la nuca, todo en reserva de papel. | Surcos «peinados»: serpenteos lentos, todos en la misma dirección, con gancho final. |
| Tamaño | ≈ 0,6× el ancho de Capi; patas largas. | Grande, sin patas visibles: solo dos piececitos que asoman. |
| Extremidades | Alambre negro quebrado en ángulo, siempre desde **4 enchufes fijos** en la mitad baja (`SOCK`), lejos de la cara. Manos de punto, pies en cuña. | Brazos-muñón en la misma tinta azul, separados del cuerpo por un hueco de reserva. |
| Ojos | Círculos grandes de papel con pupila negra y brillo; cejas rectas en ángulo. | Medias lunas grandes (r 27): párpado a media asta (línea negra gruesa), pupila grande caída. Cara centrada hacia el cuerpo; la boca cambia en cada expresión. |
| Energía | Sudor (gotas en tinta azul), líneas de velocidad, marcas de exaltación. | Taza humeante, trama de brillo en semitono, sombra pesada. |
| Silueta | Picos, pequeño, en el aire. | Curvo, ancho, en el suelo. |

Proporciones: no hay «cabeza» y «cuerpo»; el cerebro es todo el personaje. Mapi: cuerpo ≈ 235 × 195 + patas de 55. Capi: ≈ 380 × 265 + pies.

Sin contornos: las formas se definen solo por la tinta. Los surcos, ojos y dientes son **reservas** (papel sin imprimir). La única línea es la tinta negra de extremidades, rasgos y atrezo.

## Paleta (3 tintas + papel)
| Uso | Hex |
|---|---|
| Rojo flúor (Mapi) | `#FF4458` |
| Azul riso (Capi) | `#2F5FD0` |
| Negro riso (rasgos, texto) | `#26232E` |
| Sobreimpresión rojo × azul (resultado) | ≈ `#2F1940` (ciruela) |
| Papel «niebla» (base) | `#E6ECE4` |
| Papel «lila» (portadas) | `#E6E2EC` |
| Papel «hielo» (alternativa) | `#DFE7EC` |

Un papel claro distinto por serie de posts; nunca crema.

## Textura (efecto riso)
- Cada plancha es un `<g>` con `mix-blend-mode: multiply` y su propio filtro: `feDisplacementMap` suave (bordes de tinta irregulares), motas de papel con `feTurbulence` de alta frecuencia y una «lavada» de baja frecuencia (tinta desigual).
- Semitono AM real (puntos de tamaño variable en retícula a 45°) para sombras, brillo de Capi y rubor (rubor rojo sobre azul = ciruela).
- Papel con grano fino y fibra muy leve. El avatar usa el 40 % del grano para que no ensucie a 150 / 60 px.
- Semillas de ruido fijas por plancha (azul 3, rojo 21, negro 41; papel 8 y 13): el grano es idéntico en cada render, estable para vídeo.
- Todo es lo bastante suave para sobrevivir a la compresión de Instagram; las formas grandes y planas comprimen bien.

## Tipografía
- **Bricolage Grotesque** (Google Fonts), 800, ancho 75 %: titulares y frases de los personajes. Grotesca gruesa y compacta, con carácter de fanzine.
- **DM Mono** 500: etiquetas, cabeceras y créditos, en versalitas con espaciado amplio.
- 3 adjetivos del estilo: **gráfico, impreso, nervioso-pesado.**

## Nombres
Se mantienen **Mapi** (rojo, Sistema 1) y **Capi** (azul, Sistema 2). Funcionan bien rotulados en su tinta y riman entre sí («¿Eres más Mapi o más Capi?»).

## Animación en Reels
- **Mapi:** animación a tirones (2 s por dibujo, 12 fps), nunca suavizada. Vibra 1–2 px en reposo, los dientes de la sierra «chisporrotean» (alternar 2 versiones de `MAPI_TEETH`), salta en arcos cortos con líneas de velocidad.
- **Capi:** interpolación lenta y fluida, con «squash» de canto rodado al posarse. Parpadeo lentísimo (el párpado baja y tarda en subir).
- **Transiciones de imprenta:** cada plancha entra por separado (azul, luego rojo, luego negro), como en una pasada de risógrafo. La azul llega tarde.
- **Gag recurrente:** la plancha azul en desregistro exagerado cuando Capi aún «no ha llegado», y encaja en su sitio cuando por fin piensa.

## Construcción y archivos
- `build.js`: paleta, utilidades (polígono con esquinas redondeadas, semitono AM, ojos compartidos), **Mapi** y **Capi** como funciones reutilizables con parámetros `expr` (neutral, euforia, alarma, feliz, esceptico), `pose` (Mapi: stand, happy, cheer, hips, shrug, lunge, hold, armsUp, none; Capi: sit, shrug, nomug, hold) y, en Mapi, `lean` (inclinación de dibujo animado por sesgo: la base sigue horizontal), el compositor de planchas `riso()` y el render con Playwright.
- `scenes.js`: hero, hoja de expresiones, portada y avatar (y unas pruebas internas que no se guardan aquí).
- Re-render: `node build.js all` (o `hero`, `expressions`, `cover`, `avatar`). `SCRATCH=<carpeta>` para dónde van las pruebas a 150 px.
- Los `.svg` llevan las fuentes por `@import` de Google Fonts y los filtros incrustados; se abren solos en un navegador.

## Puntos débiles conocidos
- Mapi, tras la ronda 2, lee como cerebrito (lóbulos romos + surcos + base plana), pero a tamaño de hoja de expresiones puede recordar a una magdalena. Nunca girarlo más de ~8°: para la acción se usa `lean`, que conserva la base. Mantener las 3 puntas como máximo para alejarlo de la llama (Ira de *Del revés*).
- La **sobreimpresión ciruela** es oscura (rojo × azul reales); funciona como acento, no como color de fondo.
- El grano y el desregistro se generan con filtros SVG: en la exportación de vídeo hay que fijar la semilla para que no «hierva» entre fotogramas (o hacerlo hervir a propósito solo en Mapi).
- La hoja de expresiones deja aire entre las dos columnas de Capi; en una versión de maqueta definitiva se puede aprovechar para notas de uso.

## Ronda 2 — cambios
1. **Mapi lee como cerebro:** la cúpula pasa de sierra a 7 lóbulos romos (arcos cúbicos) con solo 3 puntas afiladas; segundo surco en zigzag interior + cisura horizontal en la nuca; laterales que se estrechan hacia una base plana. Cuerpo más alto (≈ 235 × 195). Fuera rotaciones grandes: la acción usa `lean` (sesgo) y la base queda visible en todas las poses (hero: −6° + sesgo −16°). Poses con más «acting»: rodilla arriba en euforia, pie levantado en feliz, en jarras en «¿En serio?», relajado en neutral.
2. **Avatar recompuesto:** encuadre cerrado en las dos caras; Mapi ≈ 41 % del alto del círculo, ambas caras dentro del 60 % central, Mapi delante y reservado en la plancha azul (sin ciruela sobre ninguna cara), una sola gota de sudor dentro del círculo, grano al 40 %. Revisado a 320, 150 y 60 px.
3. **Cara de Capi:** ojos y párpados ×1,5 (r 27, párpado de 8 px), cara ~40 px más hacia el centro del cuerpo, taza más baja y separada de la boca (brazo-muñón a la altura del vientre). Cada expresión cambia también la boca: neutral (línea con comisura levantada), feliz (sonrisa en D con lengua), «¿En serio?» (boca torcida con mueca), alarma (O).
4. **Enchufes fijos de extremidades** (`SOCK`) en la mitad baja de Mapi, a ≥ 20 px de cualquier rasgo; todas las poses parten de ellos. La boca de Mapi sube para dejar sitio.
5. **Rubor de Capi** en reserva de papel (trama clara), sin morado. «N.º 01». En la portada las monedas salen volando del encuadre; Capi ya no las recoge.
- Extras: Neutral de Mapi relajado y distinto de Feliz; pies de Capi visibles en el hero; semillas de grano fijas por plancha.
