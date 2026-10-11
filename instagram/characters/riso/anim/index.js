// Motor de animación «Riso» (Reels de Dinero Irracional). Punto de entrada.
//   timeline  — pistas de claves, curvas (linear, ease-in/out, easeOutBack, spring), dos, escalonados
//   rigs      — squash, anticipación, respiración, parpadeos, ciclos, mirada, plancha que llega tarde, cámara
//   props     — atrezo de Reels (botón, monedas sin divisa, ticket que crece, correa, caja, semáforo…)
//   captions  — subtítulos en losas de papel con sello y tintas mezcladas, zona segura
//   texture   — grano/papel precocinados a PNG con las semillas de la biblia
//   renderer  — plantilla, workers Playwright, ffmpeg, portada, hoja de contactos, preview
module.exports = {
  T: require('./timeline.js'),
  RIG: require('./rigs.js'),
  PROPS: require('./props.js'),
  CAP: require('./captions.js'),
  TX: require('./texture.js'),
  RENDER: require('./renderer.js'),
};
