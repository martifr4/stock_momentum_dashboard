# Propuesta 3 — «Manguera» (revisión 2)

**Estilo:** cartoon de goma de los años 30 (*rubber hose*) pasado por papel gris verdoso y tinta. Se conservan las extremidades de manguera, las poses en arco y el *squash & stretch*. Se quitan los códigos de título de Cuphead y Fleischer.
**Tres adjetivos:** elástico, entintado, entrañable.

## Fundamento del diseño
- **Mapi (Sistema 1) es una almendra cerebral.**
  - El nombre es un guiño a «amígdala = almendra». Ninguna imagen afirma anatomía.
  - Es pequeño y alto, con la punta inclinada hacia delante: parece una flecha que ya ha salido corriendo.
  - El borde trasero forma **dos lóbulos suaves**, el mismo contorno festoneado de Capi, y lleva **2 o 3 surcos largos** en el mismo lenguaje de pliegues. Así se lee como un trozo de cerebro y no como una gota, un chile o una judía.
  - Ojos enormes y siempre sudando.
- **Capi (Sistema 2) es un lóbulo grande.**
  - Ancho, pesado y bajo, con la corona festoneada y pliegues largos y ordenados («peinados»).
  - Gafas redondas que sobresalen del contorno (se ven en silueta), nariz de bulbo, pajarita roja de lunares y taza humeante.
- **Kit compartido:** brazos y piernas de manguera (un solo tubo de tinta), **manoplas del color de cada personaje** (sin guantes blancos), **pies redondeados en el tono oscuro de cada uno** (sin zapatos negros) y **pupilas ovaladas macizas con brillo** (sin cortes de tarta).
- **Idea inesperada: el cable nervioso.**
  - Mapi y Capi están unidos por un cable rizado de teléfono que va del azul al rojo. Muestra «partes del mismo cerebro» sin texto, y es literalmente una manguera.
  - Está enrollado y apretado en el extremo tranquilo (Capi) y tenso donde tira Mapi.
- **Avatar:** la almendra se apoya en el hueco del lóbulo. Un cerebro, dos caracteres.
- **Gags recurrentes:**
  - el reloj de calle («Capi llega tarde»);
  - la polilla en la cartera vacía;
  - el recibo interminable.

## Paleta (6 + papel)
| Rol | Hex |
|---|---|
| Papel gris verdoso | `#D9DED3` (sombra `#B3BCAD`) |
| Rosa empolvado (solo fondos de escena, p. ej. la tienda) | `#D7BDB6` · `#E6D6D2` |
| Tinta | `#1E1C1A` |
| Rojo tomate (Mapi) | `#C24A32` · oscuro `#8A2C1F` · brillo `#DD7A5C` |
| Azul acero (Capi) | `#5B7F99` · oscuro `#34526A` · brillo `#8EAABD` |
| Blanco frío (ojos, bocadillos, recibo) | `#F7F6F1` |
| Mostaza (acento puntual: cartel, reloj) | `#D3A03E` |

Ni crema, ni sepia, ni viñeta. El ocre solo aparece como acento en el cartel.

## Lenguaje de formas y proporciones
- **Mapi:** almendra vertical de unos 140 × 220 u, con la punta adelantada y dos lóbulos traseros. La cara ocupa el 55 % superior, las piernas un 0,2 de la altura y los brazos son largos para agitarlos.
- **Capi:** lóbulo horizontal de unos 240 × 215 u, con muesca inferior y corona festoneada. La cara está en el tercio delantero (vista 3/4). Tiene aproximadamente 1,6 veces la masa de Mapi a la misma escala.
- **Silueta:** almendra puntiaguda con lomo festoneado frente a nube-lóbulo con gafas. Ambas funcionan en negro a 150 px.

## Línea y textura
- **Contorno grueso-fino:** una copia en tinta desplazada abajo a la derecha más un trazo de 3 px. La luz viene de arriba a la izquierda.
- **Sombreado:** un tono plano por familia de color.
- **Pliegues en relieve:** surco de tinta más cresta clara.
- **Tinta temblorosa:** `feDisplacementMap`, con escala 2,4.
- **Grano de película:** neutro, al 26 %.
- **Fondo:** manchas suaves gris verdosas en el papel.
- **Marco:** sin marco de película ni rayos de sol.

## Tipografía (Google Fonts)
- **Shrikhand** (sustituye a Ultra): display gruesa en cursiva, retro y con rebote; acompaña al movimiento de manguera sin evocar los títulos de tipo cartel de Cuphead. Se usa en titulares, nombres, el *wordmark* y el cartel.
- **Oswald 500/700:** versalitas condensadas para bocadillos, etiquetas y textos secundarios.

## Construcción reutilizable (fuentes)
- **`chars.js`:** contiene `mapi(opts)` y `capi(opts)`.
  - **Rig:** `x, y, s` (escala), `flip`, `lean`, `sx/sy` (*squash & stretch*) y `bend` (arco de la línea de acción).
  - **Brazos y piernas:** van del hombro o la cadera a un punto, con `bend`, manopla (`open`, `fist`, `point`, `hold`), `aim`, `held` (objeto en la mano) y `back` (detrás del cuerpo).
  - **`expr`:** mirada, párpados (`lidW` para el grosor), ojos cerrados, cejas, boca (`smile`, `worry`, `grin`, `scream`, `flat`, `smirk`, `o`, `calm`), `mw` y `glassesDy`.
- **`props.js`:** cable rizado, cartera, polilla, recibo, bocadillo, trazos de impacto, nubes de polvo y *wordmark*.
- **`render.js`:** genera las cuatro escenas con `node render.js [hero|expressions|cover|avatar|all]`. Escribe `.svg` (autocontenido) y `.png`.
- **`render-lib.js`:** rasterizador con Playwright.

## Animación en Reels
- **Mapi** se anima en «dos»:
  - anticipación con *squash* (`sy` 0,85) → *stretch* (`sy` 1,15, `bend` +30) → fotograma *smear*;
  - temblor constante y gotas de sudor que salen despedidas.
- **Capi** se anima en «cuatros»:
  - los párpados caen un fotograma tarde;
  - asentamiento pesado con rebote al llegar;
  - el vapor de la taza en bucle de 3 fotogramas.
- **El cable marca el ritmo:**
  - se estira mientras Mapi corre y, al llegar al tope, hace *boing* y arrastra a Capi a cuadro tres tiempos tarde;
  - en transiciones puede rizarse en forma de «?».
- **Producción:** grano y temblor horneados como textura en bucle de 3 fotogramas.

## Puntos débiles conocidos
- Las extremidades de manguera siguen siendo de los años 30 por definición. La distancia frente a Cuphead depende ahora de las manoplas de color, las pupilas macizas, el papel gris verdoso y la tipografía.
- Mapi sin contexto puede leerse como «semilla». Los lóbulos traseros y los surcos lo acercan al cerebro, pero sigue siendo el más abstracto de los dos.
- Capi solo tiene vista 3/4; falta una vista frontal.
- La manopla `point` es la menos resuelta.
- Las fuentes se cargan desde Google en el momento del render.

## Registro de cambios — revisión 2 (respuesta a la crítica, 45/70)
1. **Distancia frente a propiedad intelectual existente.**
   - Eliminados el marco de película redondeado y los rayos de sol en las cuatro piezas.
   - Guantes blancos sustituidos por **manoplas del color del cuerpo**.
   - Zapatos negros sustituidos por **pies redondeados en el tono oscuro** de cada personaje; quitadas las polainas de Capi.
   - Pupilas de corte de tarta sustituidas por **pupilas ovaladas macizas con brillo** en los dos personajes.
   - Ultra sustituida por **Shrikhand**.
2. **Mapi como cerebro.**
   - Borde trasero redibujado con **dos lóbulos suaves**, con el mismo método de festón que Capi.
   - Los garabatos cortos se cambian por **tres surcos largos** y uno corto en el lenguaje de pliegues de Capi.
   - Quitado el colorete.
3. **Papel.**
   - Fondo cambiado a **gris verdoso `#D9DED3`**, con manchas y grano neutros.
   - Viñeta sepia eliminada. Rosa empolvado solo para la tienda del *hero*.
4. **Expresiones de Capi.**
   - Línea de párpado más gruesa (5 px).
   - Cejas más gruesas y largas, **por encima de la montura**, con una zona libre de pliegues sobre las gafas.
   - Una boca distinta en cada estado: neutral `calm`, alarma `scream`, feliz `grin`, escéptico `smirk` inclinada.
   - «¡EUFORIA!» pasa a **«¡ALARMA!»**: gafas que saltan, pupilas pequeñas, brazos arriba y trazos de impacto.
   - En «¿En serio?» la mano va a la cadera para no tapar la boca.
   - Comprobado a 360 px de ancho.
5. **Hero:** eliminado el bastón o puño de Capi (el brazo trasero queda oculto) y eliminados los billetes alados y las monedas. Se queda el reloj, que sostiene el gag de «llega tarde». La tienda rosa sustituye a los rayos como fondo.
6. **Avatar:**
   - Personajes reducidos un 10 % y la corona de Capi ya no queda cortada.
   - El brazo de Mapi va por detrás de su cuerpo y saluda por fuera, a la izquierda: ya no cruza la lente de Capi ni toca el borde.
   - Quitadas las manoplas sueltas que asomaban por el borde.
7. **Extras baratos:** «TICKET» pasa a «RECIBO». El rig queda más simple (sin polainas, sin guantes de cinco piezas, sin billetes). La vista frontal de Capi queda pendiente.
