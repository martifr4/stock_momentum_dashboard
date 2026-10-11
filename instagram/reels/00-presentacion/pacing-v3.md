# Reel 00 — Ronda 3: ritmo (más dinámico, sin silencios)

**Feedback del dueño de la cuenta:** «aburrido en varias partes, con silencios que aburren». El Reel tiene que funcionar para alguien que hace scroll con el pulgar listo para pasar.

**Diagnóstico:** la voz (A) ocupa 32,0 s de 53,9 s. Hay 22 s sin voz y seis huecos de 1,7 a 2,7 s en los que solo hay animación en espera.

**Nueva regla: manda la voz.** Cada subtítulo dura lo que dura su frase más 0,18 s (mínimo 0,9 s). Las acciones se aceleran o se solapan con la voz para caber; ya no se espera a que termine una acción para seguir.

## Objetivo
- **Duración:** 37,8 s (1134 fotogramas a 30 fps). Los tiempos exactos de cada subtítulo están en `pacing-v3.json` («new_frame» y «slot»). Son vinculantes, salvo ±3 fotogramas para cuadrar un corte.
- La voz final está en `vo.json` y se volverá a generar con los tiempos nuevos. El vídeo sigue saliendo **sin audio**: yo mezclo voz y efectos.

## Reglas de dinamismo
1. **Nada quieto más de 0,5 s.** Si un plano no tiene acción, tiene que haber movimiento secundario: respiración, parpadeo, sudor, un pequeño empuje de cámara (zoom 1,00→1,04) o el humo de la taza.
2. **Cada cambio de subtítulo es un golpe.** El subtítulo entra con *pop* (escala 0,85→1,05→1,0 en 6 fotogramas) y la cámara da un micro-salto: punch-in de 1,0 a 1,05 en 4 fotogramas, alternando acercar y alejar.
3. **Transiciones cortas:** cortes secos, o barridos de 4 a 6 fotogramas con desenfoque de movimiento simulado (líneas de velocidad). Nada de fundidos lentos.
4. **Acciones comprimidas:** anticipación de 2 a 4 fotogramas, sin poses de espera largas.
   - El ticket crece en 1 s.
   - Los carteles caen en ráfaga, uno cada 4–6 fotogramas.
   - La caída inicial dura menos de 1 s.
5. **Gancho:** el fotograma 0 ya tiene acción. Chispa golpea el botón «COMPRAR YA» en el fotograma 6 como mucho (¡CLAC!) y el primer subtítulo ya está en pantalla.
6. **Final y bucle:** el bucle sigue intacto. El último segundo sigue siendo el salto de Chispa hacia el botón, empalmado con el fotograma 0.
7. **Planos dobles:** si un bloque se queda corto para su acción, prioriza que se entienda la idea, no el detalle. Puedes eliminar beats secundarios: las dos viñetas del plano 4 pueden ser una sola si no caben. Anótalo en `notes.md`.

## Entregables
- `reel.mp4` sin audio, 1080×1920, 30 fps, unos 37,8 s.
- `captions.srt` regenerado con los tiempos nuevos.
- **`sfx-cues.json`:** lista de `{frame, type}` con los momentos que necesitan efecto de sonido. Tipos posibles:
  - `clac` (golpe al botón), `whoosh` (barridos y entradas rápidas), `pop` (solo en subtítulos clave, como mucho uno cada 2 s);
  - `splash` (mancha de tinta de «Chispa»), `slide` (llega la plancha azul tarde), `ding` (caja registradora), `tick` (cuenta atrás, cada segundo visible);
  - `thunk` (cada cartel que cae), `zzz` (Pausa dormida), `snap` (tirón de la correa), `boing` (saltos);
  - `coins` (lluvia de monedas), `print` (ticket saliendo), `swoosh` (cualquier otra entrada rápida).
- La portada (`cover.png`, `cover-grid.png` en 3:4, `cover-grid-4x5.png`), `contact-sheet.png` y `notes.md` con un registro de cambios «Ronda 3».
