# Post 01 · El supermercado está diseñado para Chispa — notas de ilustración

## Qué se ha construido
- `props.js`: todo lo nuevo, importando `characters/riso/riso.js` **sin modificarlo** (ni nada de `anim/`).
  - Helpers del post 00: `G`, `clipLayers`, `shiftPlate`, más `tf` y `shape` (pinta en su tinta y reserva en las demás planchas).
  - Envases genéricos sin marca ni texto: `caja`, `botella`, `lata`, `bolsaSnack`, `brick`, `huevera` y `baguette`.
  - `carrito` (vista lateral, carga detrás de los alambres delanteros), con `cargaLlena` y `cargaMedia`.
  - Poses de Chispa por `limbs` desde los enchufes `SOCK`: `empuja`, `empujaLenta`, `alcanza`, `zombi`, `abraza`, `pica` y `trofeo`. En `empuja` y `zombi` el brazo lejano pasa por detrás del cuerpo (`knockFor: ['black']`).
  - Pausa con objeto (`pausaProp`), por los parámetros `arms`/`mug` de la librería: banderín, lista mini y lupa.
  - `STORE` + `storeMap` (completo y mini: la misma función a dos escalas), `stopBadge` (reserva su círculo en la plancha azul), 7 pictogramas, `stopHeader`, `pausaCorner` y `sourceLine`.
  - Atrezo de escena: `altavoz`, `nota`, `mostradorPan`, `balda`, `etiquetaMuda`, `cartelEstallido`, `envaseCorte`, `mostradorCaja`, `expositorSnacks`, `correaTensa`, `listaCompra`/`listaMini`, `casilla`, `chincheta` y `avionPapel`.
- `render.js`: `node render.js` (las 11 + `overview.png`) o `node render.js 3 7`. `overview.py` monta la cuadrícula de 4 × 3.
- Texto literal de **copy.md** (versión final, que manda sobre el brief):
  - Slide 4 y lista: «Ve directamente…».
  - Slide 6: «Chispa ve el cartel y entiende «barato»».
  - Slide 7: «4 € + 2 € = 6 € por las dos → 3 € cada una. Es un 25 %.».
  - Slide 9: «…y te puede el cansancio.».
  - Espacio de no separación entre cifra y €/%.
- Papel «niebla» en las 11 slides. El cartel de oferta va en rojo flúor (no hay tinta amarilla).
- El rojo solo aparece en texto display («Chispa» a ≥ 80 px). El azul de Pausa va siempre a ≥ 36 px.
- Las líneas de fuente van en DM Mono 24 px negro, con los nombres de revista en cursiva, en y 1186/1216, sin dibujos en esa franja.
- Revisado: cada slide a tamaño completo (dos rondas como mínimo), la portada a 150 px y las slides 1, 5 y 7 a 360 px. Las fuentes de 24 px se leen a 360 px.

## Desviaciones del brief
- **Firma de la slide 11:** el brief pedía `@dinero_irracional`, pero la decisión vigente del coordinador es «sin handle»: firma «Dinero Irracional», como en el post 00.
- **Slide 1:** Pausa va encima del montón, pero la carga sube algo por encima de y 650 en el bote más alto. La barra de pan es pequeña y asoma en diagonal a la izquierda.
- **Slide 4:**
  - La ruta azul serpentea por el suelo de la escena, bajo Chispa, en vez de hacer una S alta, para no tapar el carrito.
  - Pausa (`sit`, `esceptico`) sostiene la taza a la izquierda.
  - En las slides 3–9, la taza de Pausa queda siempre a su izquierda (hacia Chispa). Es lo que hace posible la correa de la 9.
- **Slide 5:**
  - Sin «segundo par de marcas de párpado»: no se leía a 360 px.
  - El brazo de jarras de `hips` se cambió por un brazo colgando, porque con `flip` parecía una flecha.
- **Slide 6:** el estallido de «OFERTA» se apoya sobre la botella derecha, no encima de la balda entera.
- **Slide 7:** sin `burst` alto: las marcas de exaltación quedan dentro de la cúpula para no chocar con el cartel.
- **Slide 8:** Chispa lleva una tercera caja más pequeña (con el mismo nivel del 70 %) bajo el brazo. Las dos cajas de la balda siguen siendo idénticas.
- **Slide 10:**
  - Los renglones azules van cada 104 px, alineados con los 7 ítems; el título queda entre el borde arrancado y el primer renglón.
  - La hoja lleva un filete fino negro en el contorno para que el blanco se lea sobre el niebla.
- **Slide 11:** el pan sube como trofeo en la mano derecha, con el brazo modificado por `limbs`.

## Expresión `espiral`
Validada en la slide 6 a tamaño completo y a 360 px: se lee como hipnosis. Puede pasar a la tabla de la biblia (§7).

## Puntos débiles conocidos
- **Slide 1:** el montón de la cesta es denso; a 150 px se lee «carrito lleno», pero no los envases uno a uno.
- **Slide 9:** el carrito de Chispa, cortado por el borde izquierdo, queda casi fuera; se intuye más que se ve.
- **Slide 10:** Pausa es muy pequeña en la esquina. Es intencionado, para que la hoja se pueda recortar sola.
- **Minimapa:** a 540 px se distingue la parada roja; a 360 px el plano es muy esquemático, pero la insignia grande de la izquierda repite el número.
- `riso.js` no se ha tocado. Si el animador cambia la API (`limbs`, `arms`, `mug`, `knockFor`), conviene volver a renderizar con `node render.js` y revisar.
