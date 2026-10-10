# Biblia de personajes — Dinero Irracional

**Versión 1.0 · 2026-10-10** · Dirección aprobada: **Propuesta 2 «Riso»** (dos tintas, un cerebro).
Fuente de verdad del dibujo: `proposals/p2-riso/build.js` (construcción) y `proposals/p2-riso/scenes.js` (escenas de referencia). Si esta biblia y el código discrepan, manda el código hasta que se actualice esta biblia; cualquier cambio de construcción se anota aquí.

> **Nombres definitivos.** **Chispa** (roja, Sistema 1; antes «Mapi») y **Pausa** (azul, Sistema 2; antes «Capi»). Las dos van **siempre en femenino**: «Chispa es la que paga», «Pausa llega tarde», «las dos», «subida al 7», «sentada». En el código las funciones siguen llamándose `mapi()` y `capi()`; ver «Pendientes» al final.

---

## 1. La idea en una frase
Chispa y Pausa son **dos planchas de tinta del mismo cerebro**. Chispa se imprime en rojo flúor; Pausa, en azul. Donde se pisan aparece una tercera tinta, el **ciruela** (rojo × azul): el «cerebro completo». La técnica de impresión es el concepto, no un filtro.

Tres adjetivos del estilo: **gráfico, impreso, nervioso-pesado.**

---

## 2. Personajes

### Chispa — Sistema 1 (roja)
- **Qué es:** el pensamiento rápido, automático y emocional.
- **Personalidad:** impulsiva, entusiasta, estresada, adorable de lo desastre que es. Decide antes de preguntar. **No es la mala:** gracias a ella frenas, esquivas un balón y reconoces una cara en un segundo. El problema es que llega primero, y el mundo (ofertas, cuentas atrás, «quedan 2») está diseñado para hablar con ella.
- **Rol en cada post:** actúa primero y cae en el sesgo. **El lector tiene que reconocerse en ella**, nunca reírse de ella desde arriba.
- **Energía:** siempre en movimiento, sudando, ojos muy abiertos, en el aire.
- **Frases:** «¡Ya, ya, ya!» · «¡Pero estaba rebajado!»

### Pausa — Sistema 2 (azul)
- **Qué es:** el pensamiento lento, deliberado y racional.
- **Personalidad:** tranquila, algo vaga (pensar cansa), irónica pero cariñosa. Hace las cuentas y lee la letra pequeña… cuando llega.
- **Rol en cada post:** llega tarde, analiza y da el antídoto. Nunca sermonea: suspira, sonríe de lado y ayuda.
- **Energía:** quieta, en el suelo, párpados a media asta, taza humeante.
- **Frases:** «Espera… déjame pensarlo.» · «Chispa, no.» · «Chispa…» (resignada, como en la portada).

### Relación
Se quieren y se necesitan. No son enemigas ni «emoción contra razón»: son un equipo con un problema de horarios. Estructura de cada viñeta: **Chispa actúa → Pausa reacciona.** Pregunta de la cuenta: «¿Eres más Chispa o más Pausa?»

---

## 3. Gags recurrentes (obligatorios en el universo, no en cada slide)
1. **Pausa siempre llega tarde.** En la historia (entra cuando Chispa ya ha pagado) y en la imprenta (ver 2).
2. **La plancha azul imprime desregistrada.** Es un rasgo del personaje: la plancha azul va siempre ≈ 3,5 px a la derecha, 2,5 px abajo y 0,12° girada; la roja va 2 px *por delante* (−2, −1, −0,06°). Cuando Pausa «aún no ha llegado» se puede exagerar el desregistro de su plancha (8–14 px) y, cuando por fin piensa, encaja en su sitio. En Reels, la plancha azul entra deslizándose y encaja medio segundo tarde. **El texto nunca se desregistra de más:** el exagerado solo afecta a la figura de Pausa.
3. **La correa atada al asa de la taza.** Pausa no se levanta ni para sujetar a Chispa: la tiene atada con un hilo negro del **asa de la taza al tobillo de Chispa** (lazo en el tobillo). Referencia: `proposals/p2-riso/hero.png`. Hilo de 3,5 px, curva suelta (nunca recta tensa salvo en el chiste de «tirón»).
4. **El sudor se imprime con la tinta de la otra.** Las gotas de Chispa van en azul. (Regla nueva para Pausa: si alguna vez suda, sus gotas van en rojo.)

---

## 4. Paleta (3 tintas + papel)

| Uso | Hex | Notas |
|---|---|---|
| Rojo flúor — Chispa | `#FF4458` | Plancha roja. Cuerpo de Chispa, sus frases, etiquetas de oferta. |
| Azul riso — Pausa | `#2F5FD0` | Plancha azul. Cuerpo de Pausa, sus frases, sudor de Chispa, monedas. |
| Negro riso | `#26232E` | Extremidades de Chispa, rasgos, atrezo, texto. **Nunca `#000`.** |
| Ciruela (sobreimpresión rojo × azul) | ≈ `#2F1940` | **Resultado, no tinta.** Solo como acento puntual. Nunca en caras, nunca de fondo. |
| Papel «niebla» (base) | `#E6ECE4` | Por defecto (hero, avatar, presentación). |
| Papel «lila» | `#E6E2EC` | Portadas de serie (cover-mock). |
| Papel «hielo» | `#DFE7EC` | Alternativa. |

- Un papel claro por serie de posts; **nunca crema** (era el estilo anterior de la cuenta).
- Blanco `#fff` dentro de una plancha = **reserva** (papel sin imprimir): surcos, ojos, dientes, letras caladas.
- **Contraste del texto:** el rojo sobre papel ronda 2,8:1. Texto rojo solo en tamaño display (≥ 56 px, Bricolage 800). El azul (≈ 4,7:1) vale desde 32 px. Todo el texto corrido va en negro.

---

## 5. Textura riso
- Cada plancha es un grupo con `mix-blend-mode: multiply` y su filtro (`inkFilter`): `feDisplacementMap` suave (bordes irregulares), motas de alta frecuencia y una «lavada» de baja frecuencia.
- **Semillas fijas** (no tocar; el grano es idéntico en cada render y no «hierve» en vídeo): azul **3**, rojo **21**, negro **41** (rugosidad 1,4 y motas al 55 %); papel **8**, fibra **13**.
- Sombras, brillos y rubores con **semitono AM real** (puntos de tamaño variable, retícula a 45°). Sombra de suelo: elipse de semitono negro (`shadowEllipse`).
- Avatar y piezas pequeñas: grano al 40 % (`grain: 0.4`).
- En vídeo, la semilla se mantiene fija; si se quiere «hervir», solo en Chispa y a propósito.

---

## 6. Construcción

**Regla general:** no hay cabeza y cuerpo; **el cerebro es todo el personaje.** **Sin contornos:** las formas se definen solo por la tinta. La única línea es la tinta negra (extremidades de Chispa, rasgos, atrezo). Surcos, ojos y dientes son reservas.

### Chispa (función `mapi()`)
- **Forma:** perfil de cerebro facetado. Cúpula de **7 lóbulos** (`MAPI_TEETH`), de los que **solo 3 son puntas afiladas** (`MAPI_SHARP`); el resto son arcos romos. Laterales facetados que se estrechan hacia una **base plana**.
- **Tamaño (s = 1):** cuerpo ≈ 235 × 195 px + patas de ≈ 55 px. Junto a Pausa en el mismo plano, Chispa mide **0,55–0,65× el ancho de Pausa** (hero: 1,36 frente a 1,42).
- **Surcos (reserva, 6,5 px):** dos zigzags concéntricos bajo la cúpula + una cisura horizontal en la nuca (`MAPI_FOLDS`).
- **Extremidades:** alambre negro de 6 px, quebrado en ángulo (unión en inglete), **siempre desde los 4 enchufes fijos** `SOCK` en la mitad baja del cuerpo, a ≥ 20 px de cualquier rasgo: patas (−34, 68) y (32, 68); brazos (−106, 36) y (106, 34). Manos = punto de r 7. Pies = cuña negra de ≈ 20 px.
- **Cara:** ojos circulares de papel (r 17; r 20 en euforia/alarma) con pupila negra y brillo; cejas rectas en ángulo (5 px); boca debajo, subida para dejar sitio a los enchufes.
- **Acción:** se inclina con `lean` (sesgo; −16° a +8°), que mantiene la base horizontal. **Nunca rotar más de ~8°.** La base plana debe verse en todas las poses.
- **Extras:** gotas de sudor en azul (3 posiciones fijas), líneas de velocidad (hasta 4, negras, 5 px), marcas de exaltación (tres trazos sobre la cúpula).

### Pausa (función `capi()`)
- **Forma:** **canto rodado** con tres lóbulos suaves, base plana y pesada. ≈ 380 × 265 px + dos piececitos (elipses azules separadas del cuerpo por una línea de reserva). **Sin patas visibles; no se pone de pie.**
- **Surcos (reserva, 8,5 px):** «peinados», serpenteos lentos todos en la misma dirección, con gancho final (`CAPI_FOLDS`).
- **Brillo:** semitono de reserva arriba a la izquierda, recortado al cuerpo.
- **Brazos:** muñones-cápsula de 36 px en tinta azul, separados del cuerpo por un hueco de reserva de 6 px (`stub`).
- **Cara:** centrada hacia el cuerpo. Ojos de media luna grandes (r 27, pupila 12, caída), **párpado a media asta** con línea negra de 8 px. Ojos en (34, 12) y (106, 10); boca en (70, 62). Cada expresión cambia párpados **y** boca.
- **Taza:** tinta negra con banda en reserva y vapor de línea fina (3,5 px), a la altura del vientre, separada de la boca.
- **Rubor:** trama clara de reserva sobre el azul. **Nunca morado/ciruela.**

### Superposición
Si una se pone delante de la otra, la de delante **reserva su silueta en la plancha de la otra** (`knockFor`) para que no salga ciruela en ninguna cara. El ciruela solo aparece donde se decide (p. ej. la nuca de Chispa sobre Pausa en el avatar).

---

## 7. Expresiones y poses aprobadas

Referencia visual: `proposals/p2-riso/expressions.png` (aún rotulada «Mapi/Capi»; ver «Pendientes»).

### Chispa
| Expresión (`expr`) | Pose de referencia (`pose`) | Uso | Archivo |
|---|---|---|---|
| `neutral` — Neutral | `stand` (relajada, peso en una pierna) | Presentar, escuchar | expressions.png, col. 1 |
| `euforia` — ¡Euforia! | `cheer` (brazos arriba, rodilla arriba) + 2 gotas + marcas | Compra, oferta, subidón | expressions.png col. 2; cover-mock.png |
| `feliz` — Feliz | `happy` (brazos abiertos, pie levantado) | Contenta, ignorante del problema | expressions.png col. 3 |
| `esceptico` — ¿En serio? | `hips` (en jarras) | Duda, mosqueo | expressions.png col. 4 |
| `alarma` — ¡Alarma! | (sin pose fija) | Pánico, ojos como platos | **Construida en código, no validada en hoja** |
| `euforia` + `lunge`, `lean −16`, 3 gotas, 4 líneas de velocidad | — | Se lanza a por algo | hero.png |
| `euforia` + `armsUp` | — | Avatar | avatar.png |

Poses disponibles en código: `stand`, `happy`, `cheer`, `shrug`, `hips`, `lunge`, `hold` (brazos arriba sujetando algo), `armsUp` (solo brazos), `none` (sin extremidades).

### Pausa
| Expresión (`expr`) | Pose (`pose`) | Uso | Archivo |
|---|---|---|---|
| `neutral` — Neutral (media asta, sonrisa de «ya, ya») | `sit` (taza) | Su estado base | expressions.png; hero.png |
| `alarma` — ¡Alarma! (ojos abiertos, boca en O, «!» rojo) | `shrug` (muñones abiertos, sin taza) | Cuando por fin se entera | expressions.png |
| `feliz` — Feliz (ojos cerrados, sonrisa en D, rubor) | `sit` | Satisfacción tras el antídoto | expressions.png |
| `esceptico` — ¿En serio? (párpados desiguales, boca torcida) | `sit` (puede ir `flip`) | «Chispa…» | expressions.png; cover-mock.png |

Poses disponibles en código: `sit`, `hold` (taza + muñón izquierdo levantado), `nomug` (muñón hacia delante), `shrug`. Parámetro `look` para dirigir la mirada.

**Regla de ampliación:** toda expresión o pose nueva se construye como variante en `build.js` (no a mano en una escena), se prueba a 150 px y, una vez aprobada, se añade a esta tabla con su archivo de referencia.

---

## 8. Tipografía
- **Bricolage Grotesque 800, ancho 75 %** (`opsz` 96): titulares y frases de los personajes. Interletra −0,01 a −0,015 em.
- **Bricolage Grotesque 600, ancho 85–90 %**: texto corrido de los carruseles, 38–44 px, interlineado 1,2. *(Ampliación para carruseles; la propuesta solo usaba la 800.)* Lo que el guion marca en **negrita** va en 800.
- **DM Mono 500**: cabeceras, etiquetas, créditos, contador de slides. En mayúsculas con espaciado amplio (0,06–0,12 em). Cursiva de DM Mono para notas al margen.
- **Cada una habla en su tinta:** lo que dice Chispa va en rojo; lo que dice Pausa, en azul. **No hay bocadillos.** La frase se coloca cerca de quien habla.
- Ortografía: ¿? y ¡! siempre; comillas «»; puntos suspensivos «…» (un carácter); signo menos «−»; espacio fino antes de % y € («−70 %», «19,99 €»); «N.º».

### Sistema de página (carruseles 1080 × 1350)
- Márgenes laterales de 64 px (cubren también el recorte de la cuadrícula del perfil).
- **Cabecera:** «DINERO IRRACIONAL» a la izquierda y número de post a la derecha (DM Mono 24 px, interletra 0,12, línea base y = 92), filete negro de 3 px en y = 114.
- **Pie:** filete de 3 px en y = 1236; «Desliza →» (DM Mono 30 px) a la izquierda y contador a la derecha. Detalle por post en su `art-brief.md`.
- Los personajes pueden pisar los filetes para dar energía, nunca el texto.

---

## 9. Animación (Reels)
- **Chispa:** a tirones, en «dos» (12 fps), nunca suavizada. Vibra 1–2 px en reposo; los lóbulos «chisporrotean» alternando dos versiones de `MAPI_TEETH`; salta en arcos cortos con líneas de velocidad.
- **Pausa:** interpolación lenta y fluida, *squash* de canto rodado al posarse, parpadeo lentísimo (el párpado baja y tarda en subir).
- **Transiciones de imprenta:** cada plancha entra por separado (azul, roja, negra). La azul llega tarde.

---

## 10. Hacer / No hacer

**Hacer**
- Una sola idea y un pequeño conflicto por viñeta: Chispa actúa, Pausa reacciona.
- Caras grandes y legibles a tamaño de feed; probar cada portada a 150 px.
- Formas grandes y planas (comprimen bien en Instagram).
- Reutilizar poses y expresiones aprobadas antes de inventar.
- Dejar espacio limpio para el texto, decidido antes de dibujar.

**No hacer**
- Contornos, bocadillos, degradados, sombras difusas o brillos «de app».
- Negro puro, papel crema, más de tres tintas.
- Ciruela en caras o como fondo; rubor morado en Pausa.
- Rotar a Chispa más de ~8°, darle más de 3 puntas o hacerla parecer una llama (*Del revés*). Darle pelo, nariz u orejas.
- Poner a Pausa de pie, darle patas o hacerla correr rápido.
- Parecerse a *Del revés / Inside Out*, al búho de Duolingo o a Kurzgesagt (nada de humanoides brillantes, verde Duolingo, ojos redondos enormes en Pausa, vectores con degradado o fondos espaciales).
- Aspecto de IA o *clip art*: nada de texturas genéricas, manos raras o detalle sin función.
- Marcas o logos reales en el atrezo; retratos de personas reales (tampoco de Kahneman).
- **Recomendaciones de inversión** en cualquier imagen: nada de tickers, valores concretos, «compra/vende», flechas que aconsejen ni gráficos de cotizaciones reales.

---

## 11. Nota de ciencia (obligatoria)
El Sistema 1 y el Sistema 2 son **metáforas** de Daniel Kahneman (*Pensar rápido, pensar despacio*, 2011; Nobel de Economía 2002, compartido con Vernon Smith). Él mismo los describe como «personajes» o ficciones útiles, **no como regiones del cerebro**. Chispa y Pausa pueden *parecer* cerebros (lóbulos, surcos), pero ninguna imagen debe afirmar anatomía: nada de rótulos tipo «amígdala» o «corteza prefrontal», cortes anatómicos ni flechas que señalen «aquí está el Sistema 1». Cuando el tema lo pida, se dice explícitamente: «una forma de entender cómo decides, no dos trozos reales de tu cerebro».

---

## 12. Archivos de referencia
| Archivo | Qué es |
|---|---|
| `proposals/p2-riso/hero.png` / `.svg` | Escena de relación: Chispa se lanza a por el «−70 %», Pausa sentada la sujeta con la correa del asa. |
| `proposals/p2-riso/expressions.png` / `.svg` | Hoja de expresiones (4 + 4). |
| `proposals/p2-riso/cover-mock.png` / `.svg` | Portada de serie: Chispa subida al «7» tirando monedas; Pausa escéptica abajo, en papel lila. |
| `proposals/p2-riso/avatar.png` / `.svg` | Foto de perfil 320 × 320 (sin nombres: válida tal cual). |
| `proposals/p2-riso/build.js` | Paleta, filtros, `mapi()` = Chispa, `capi()` = Pausa, `riso()`, render. |
| `proposals/p2-riso/scenes.js` | Composición de las escenas anteriores (`priceTag`, `coin`, `burst`, `rule`). |
| `proposals/p2-riso/notes.md` | Notas de la propuesta y cambios de la ronda 2. |

## Pendientes
1. **Re-render con los nombres definitivos:** hero («Mapi, no.» → «Chispa, no.»; pie «Uno tira. El otro sujeta.» → «Una tira. La otra sujeta.»), cover-mock («Mapi…» → «Chispa…») y hoja de expresiones (rótulos «Chispa»/«Pausa», quitar «PROPUESTA 2»). Mismo dibujo, solo texto.
2. **Renombrar en código** `mapi()` → `chispa()` y `capi()` → `pausa()` (y constantes `MAPI_*`/`CAPI_*`) al pasar el `build.js` a una librería de producción compartida por los posts.
3. **Añadir a la hoja** la expresión `alarma` de Chispa (existe en código, sin validar).
4. Añadir parámetro `look` a `mapi()` para que Chispa pueda mirar al lector o a un objeto (hoy la mirada va fija por expresión).
