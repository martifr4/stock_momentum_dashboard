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
- **Firma de la slide 11:** `@dinero_irracional`. El handle ya existe; el coordinador lo cambió en `render.js` en la ronda 2.
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

## Ronda 2 — cambios (crítica 52/70)
**Correcciones obligatorias**
1. **Slide 7, línea de cálculo:**
   - Va en Bricolage 600 a 48 px; solo «25 %» va en 800, y en negro (el azul queda solo para la voz de Pausa).
   - «+», «=» y «→» van a 60 px en 800, a altura de mayúscula, y en tramos propios. Así desaparece el doble espacio antes de «→».
2. **Slide 6:**
   - La escena se reordena: Chispa viene desde la izquierda, con los brazos al frente hacia el cartel; la balda con las dos botellas idénticas queda a la derecha.
   - La lupa de Pausa (muñón a media altura) apunta a la izquierda, a la etiqueta de la botella de «OFERTA», sin nada en medio.
   - La lupa reserva ≥ 20 px de papel alrededor del aro, en las planchas roja y negra.
3. **Pan nuevo y único** (`baguette`), usado en las slides 1, 4 y 11:
   - Cuerpo rojo de puntas redondas, 3–4 cortes diagonales gordos en reserva y vientre tostado en trama negra.
   - Un halo de papel opcional lo separa de otras formas rojas.
   - El mostrador de la slide 4 lleva tres barras grandes en abanico sobre una cesta trenzada: se lee como pan.
4. **Portada:**
   - La escena crece a ×1,45 (antes ×1,12). La carga empieza hacia y 660 y la banda vacía desaparece.
   - A 150 px, la cara de Chispa mide ≈ 45 px de ancho y Pausa (s 0,58) se reconoce en el carrito.
   - «Chispa salió con 43 €.» pasa a Bricolage 800 con anchura del 88 % y 82 px: el «€» ya no parece una «C» a 150 px.
5. **Mapa:**
   - La caja de arriba a la izquierda se estrecha y se separa 20 px de la primera góndola (`STORE.cajas`), así que ya no forma un «1».
   - La insignia de la parada actual en el minimapa pasa a r 18.

**Extras**
- **Slide 9:**
  - Fuera el carrito cortado.
  - La correa tensa sube unos 28 px: la taza va más alta en el rincón (`mugAt`) y el tobillo, más arriba. Así se separa de la base del mostrador.
  - Las marcas de tirón son más grandes (tres trazos de 5 px).
- **Slide 3:** la botella que cae lleva tres trazos de movimiento.
- **Slide 7:** las botellas van fuera de la silueta de Chispa, con los brazos abiertos, y sin gota de sudor.
- **Slide 8:** Pausa ya no repite la lupa. Está sentada, escéptica, mirando la caja que se lleva Chispa, y no hay solapes con la caja.
- **Slide 5:** las líneas de mirada arrancan justo fuera del ojo.
- **Líneas de fuente:** pasan a 26 px (líneas base 1183 y 1216) y mantienen los cortes.

**Revisado:** todas las slides a tamaño completo y a 360 px, y la portada a 150 px.


## Ronda 3 · portada (por indicación del dueño)
- **Portada sin Chispa ni Pausa en el texto:** habla a la persona y a lo que le pasa.
  - Antes: «Entraste a por pan. / Chispa salió con 43 €.»
  - Ahora: «Fuiste / a por pan, / pero saliste con la bolsa llena.» (titular 150 px; la segunda parte, en rojo a 70 px).
  - La ilustración no cambia. Los 43 € ya no salen en la portada.
- Se añade texto alternativo de las 11 slides en `copy.md`, y el estado pasa a «final».
