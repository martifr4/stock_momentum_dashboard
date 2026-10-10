# Propuesta 2 — «Riso»

**Dos tintas, un cerebro.** Mapi y Capi son formas geométricas puras impresas en risografía: cada personaje es, literalmente, una plancha de tinta del mismo cerebro.

## Idea central (lo inesperado)
- **Cada personaje es una plancha.** Mapi se imprime en rojo flúor y Capi en azul. Donde se pisan aparece una tercera tinta por sobreimpresión (multiply): un **ciruela** oscuro. Es el «cerebro completo» y se usa a propósito en el avatar (Mapi apoyado en el hombro de Capi).
- **Capi llega tarde hasta en la imprenta.** La plancha azul siempre imprime un poco desplazada (≈3,5 px abajo a la derecha y 0,12° de giro), y la roja va 2 px por delante. Es un desregistro de riso real convertido en rasgo del personaje. En un Reel se puede exagerar: la plancha azul entra deslizándose y «encaja» medio segundo tarde.
- **Gag del hero:** Capi no se levanta ni para sujetar a Mapi. Lo tiene atado al asa de la taza.
- **Cada uno habla en su tinta:** lo que dice Mapi va en rojo y lo que dice Capi, en azul. Así no hacen falta bocadillos (los contornos quedan fuera del estilo).

## Personajes y lenguaje de formas
| | **Mapi — Sistema 1** | **Capi — Sistema 2** |
|---|---|---|
| Forma | Perfil de cerebro facetado; la cúpula es una **sierra de 7 dientes irregulares** (cada diente, una circunvolución). | **Canto rodado** con tres lóbulos suaves, base plana y pesada. |
| Pliegues | Surcos en zigzag reservados en papel, paralelos a la sierra. | Surcos «peinados»: serpenteos lentos, todos en la misma dirección, con gancho final. |
| Tamaño | ≈ 0,6× el ancho de Capi; patas largas. | Grande, sin patas visibles: solo dos piececitos que asoman. |
| Extremidades | Alambre negro quebrado en ángulo (rodillas y codos en pico), manos de punto, pies en cuña. | Brazos-muñón en la misma tinta azul, separados del cuerpo por un hueco de reserva. |
| Ojos | Círculos grandes de papel con pupila negra y brillo; cejas rectas en ángulo. | Medias lunas: párpado a media asta (línea negra gruesa), pupila grande caída. |
| Energía | Sudor (gotas en tinta azul), líneas de velocidad, marcas de exaltación. | Taza humeante, trama de brillo en semitono, sombra pesada. |
| Silueta | Picos, pequeño, en el aire. | Curvo, ancho, en el suelo. |

Proporciones: no hay «cabeza» y «cuerpo»; el cerebro es todo el personaje. Mapi: cuerpo ≈ 230 × 175 + patas de 50. Capi: ≈ 380 × 265.

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
- Papel con grano fino y fibra muy leve. El avatar usa el 60 % del grano para que no ensucie a 150 px.
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
- `build.js`: paleta, utilidades (polígono con esquinas redondeadas, semitono AM, ojos compartidos), **Mapi** y **Capi** como funciones reutilizables con parámetros `expr` (neutral, euforia, alarma, feliz, esceptico) y `pose` (Mapi: stand, cheer, hips, shrug, lunge, hold, none; Capi: sit, shrug, nomug, hold, string), el compositor de planchas `riso()` y el render con Playwright.
- `scenes.js`: hero, hoja de expresiones, portada y avatar (y unas pruebas internas que no se guardan aquí).
- Re-render: `node build.js all` (o `hero`, `expressions`, `cover`, `avatar`). `SCRATCH=<carpeta>` para dónde van las pruebas a 150 px.
- Los `.svg` llevan las fuentes por `@import` de Google Fonts y los filtros incrustados; se abren solos en un navegador.

## Puntos débiles conocidos
- **Mapi puede leerse como «llama» u «hoja» de un vistazo** si se gira mucho o se pinta sin el surco en zigzag; el surco interior y la base plana son lo que dicen «cerebro». No dibujarlo nunca sin surcos. Cuidado también con el parecido rojo + llamas con Ira de *Del revés*: Mapi no tiene cuerpo humanoide ni fuego en la cabeza, y así debe seguir.
- La **sobreimpresión ciruela** es oscura (rojo × azul reales); funciona como acento, no como color de fondo.
- El grano y el desregistro se generan con filtros SVG: en la exportación de vídeo hay que fijar la semilla para que no «hierva» entre fotogramas (o hacerlo hervir a propósito solo en Mapi).
- Las caras de Capi son pequeñas respecto a su cuerpo (es intencionado, por el peso); en tamaños muy pequeños conviene encuadrar más cerca.
- La hoja de expresiones deja aire entre las dos columnas de Capi; en una versión de maqueta definitiva se puede aprovechar para notas de uso.
