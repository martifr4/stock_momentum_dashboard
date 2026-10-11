// Motor de animación «Riso» — línea de tiempo.
// Todo es función pura del número de fotograma t (entero, 0-based, 30 fps).
// Pistas de claves con curvas, retenciones, cortes en seco, «dos» y escalonados.

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k));

// ---------- curvas ----------
const EASE = {
  linear: (x) => x,
  easeInCubic: (x) => x * x * x,
  easeOutCubic: (x) => 1 - (1 - x) ** 3,
  easeInOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  easeInOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  easeInSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
  easeOutSine: (x) => Math.sin((x * Math.PI) / 2),
  // se pasa y vuelve (overshoot); s = 1.70158 ≈ 10 %
  easeOutBack: (x, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
  // muelle amortiguado: llega a 1 oscilando
  spring: (x, freq = 2.2, damp = 6) => (x >= 1 ? 1 : 1 - Math.exp(-damp * x) * Math.cos(freq * 2 * Math.PI * x) * (1 - x)),
};
// alias del storyboard
EASE['ease-in'] = EASE.easeInCubic;
EASE['ease-out'] = EASE.easeOutCubic;
EASE['ease-io'] = EASE.easeInOutSine;
EASE.io = EASE.easeInOutSine;
EASE.in = EASE.easeInCubic;
EASE.out = EASE.easeOutCubic;
const ease = (name) => (typeof name === 'function' ? name : EASE[name] || EASE.linear);

// ---------- pistas ----------
// keys: [[f, value, ease?], ...] ordenadas. El ease de una clave gobierna el tramo que LLEGA a ella.
// ease 'snap' (o 'hold') = mantiene el valor anterior hasta el fotograma de la clave y salta.
// value puede ser número o array de números. Antes de la primera clave y después de la última se mantiene.
function track(keys, defEase = 'linear') {
  const K = keys.map((k) => ({ f: k[0], v: k[1], e: k[2] || defEase }));
  return (t) => {
    if (t <= K[0].f) return K[0].v;
    for (let i = 1; i < K.length; i++) {
      if (t < K[i].f) {
        const a = K[i - 1], b = K[i];
        if (b.e === 'snap' || b.e === 'hold') return a.v;
        const k = ease(b.e)((t - a.f) / (b.f - a.f));
        return mix(a.v, b.v, k);
      }
    }
    return K[K.length - 1].v;
  };
}
// valor discreto: el de la última clave con f <= t (poses, expresiones, flags)
function step(keys, before = undefined) {
  return (t) => {
    let v = before;
    for (const [f, val] of keys) { if (f <= t) v = val; else break; }
    return v;
  };
}
// interpola en [a,b] con curva; fuera, satura
function ramp(t, a, b, v0, v1, e = 'linear') { return mix(v0, v1, ease(e)(clamp((t - a) / (b - a)))); }
const inRange = (t, a, b) => t >= a && t <= b; // ambos extremos incluidos
// «en dos»: el dibujo cambia solo en fotogramas pares (respecto a un origen)
const onTwos = (t, origin = 0) => t - (((t - origin) % 2) + 2) % 2;
const onN = (t, n, origin = 0) => t - (((t - origin) % n) + n) % n;
// escalonado: el elemento i empieza gap fotogramas después del anterior
const stagger = (i, gap, start = 0) => start + i * gap;
// vibración de reposo de Chispa: ±amp alternando cada 2 fotogramas
const jitter = (t, amp = 1, origin = 0) => (Math.floor((t - origin) / 2) % 2 === 0 ? amp : -amp);
// secuencia de valores en dos a partir de f0: vals[0] en f0, vals[1] en f0+2…
function seqTwos(t, f0, vals, after = vals[vals.length - 1]) {
  if (t < f0) return undefined;
  const i = Math.floor((t - f0) / 2);
  return i < vals.length ? vals[i] : after;
}
// pseudoaleatorio determinista (para parpadeos y escalonados «sueltos»)
function hash01(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

module.exports = { EASE, ease, clamp, lerp, mix, track, step, ramp, inRange, onTwos, onN, stagger, jitter, seqTwos, hash01 };
