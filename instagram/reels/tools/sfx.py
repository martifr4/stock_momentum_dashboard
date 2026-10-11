#!/usr/bin/env python3
"""Efectos de sonido sintéticos para los Reels (sin samples ni licencias).

Cada efecto se genera con numpy a 44,1 kHz, mono, y se coloca según un
`sfx-cues.json` ([{frame, type}], 30 fps). También puede generar una base
rítmica suave (`--bed`) y mezclarlo todo con la voz, bajando la base cuando habla.

Uso:
  python3 sfx.py cues.json --duration 37.8 --out sfx.wav [--bed bed.wav] [--tweaks sfx-mix.json]
  python3 sfx.py --mix vo.wav sfx.wav [bed.wav] --video reel.mp4 --out reel-audio.mp4
"""
import argparse, json, subprocess, wave
import numpy as np

SR, FPS = 44100, 30
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.003, r=0.1, shape=4.0):
    x = np.arange(n) / SR
    att = np.clip(x / max(a, 1e-4), 0, 1)
    rel = np.exp(-shape * np.clip(x - a, 0, None) / max(r, 1e-4))
    return att * rel


def noise(d):
    return rng.standard_normal(int(SR * d))


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y


def bandsweep(x, f0, f1):
    """Ruido con un filtro paso bajo que se desplaza (barato, suficiente para whooshes)."""
    n = len(x); y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        f = f0 + (f1 - f0) * i / n
        a = np.exp(-2 * np.pi * f / SR)
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y - lowpass(y, 200)


def tone(f, d, wave_='sine'):
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f, (int(SR * d),))) / SR
    return np.sin(ph) if wave_ == 'sine' else np.sign(np.sin(ph)) * 0.6


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


# ---- biblioteca --------------------------------------------------------------
def fx_clac():
    body = tone(np.linspace(180, 60, int(SR * .18)), .18) * env(int(SR * .18), .001, .06)
    click = lowpass(noise(.03), 6000) * env(int(SR * .03), .0005, .01)
    out = np.zeros(int(SR * .18)); out[:len(click)] += click * 1.2; out += body
    return norm(out)


def fx_whoosh(d=.32):
    n = noise(d); w = bandsweep(n, 400, 5000)
    e = np.sin(np.linspace(0, np.pi, len(w))) ** 1.5
    return norm(w * e, .6)


def fx_swoosh():
    return fx_whoosh(.22)


def fx_pop():
    d = .09; f = np.linspace(900, 300, int(SR * d))
    return norm(tone(f, d) * env(int(SR * d), .001, .03), .55)


def fx_splash():
    d = .35; n = lowpass(noise(d), 2500) * env(int(SR * d), .002, .12, 3)
    blip = tone(np.linspace(500, 120, int(SR * .12)), .12) * env(int(SR * .12), .001, .05)
    n[:len(blip)] += blip * .6
    return norm(n, .7)


def fx_slide():
    d = .45; f = np.linspace(220, 520, int(SR * d))
    s = tone(f, d) * 0.5 + bandsweep(noise(d), 300, 1500) * 0.4
    return norm(s * np.sin(np.linspace(0, np.pi, len(s))), .5)


def fx_ding():
    d = .9; x = t(d)
    s = sum(a * np.sin(2 * np.pi * f * x) for f, a in ((1568, 1), (3136, .35), (4704, .15)))
    return norm(s * np.exp(-5 * x) * env(len(x), .001, 10), .6)


def fx_tick():
    d = .04; return norm(lowpass(noise(d), 9000) * env(int(SR * d), .0003, .008), .35)


def fx_thunk():
    d = .22; f = np.linspace(140, 70, int(SR * d))
    s = tone(f, d) * env(int(SR * d), .001, .07) + lowpass(noise(d), 1200) * env(int(SR * d), .001, .02) * .5
    return norm(s, .8)


def fx_zzz():
    d = .7; x = t(d)
    s = tone(110 + 6 * np.sin(2 * np.pi * 3 * x), d, 'square') * 0.3
    return norm(lowpass(s, 900) * np.sin(np.linspace(0, np.pi, len(s))), .25)


def fx_snap():
    d = .16; c = lowpass(noise(d), 7000) * env(int(SR * d), .0005, .02)
    tw = tone(np.linspace(700, 250, int(SR * d)), d) * env(int(SR * d), .001, .05) * .5
    return norm(c + tw, .75)


def fx_boing():
    d = .4; x = t(d); f = 220 + 140 * np.sin(2 * np.pi * 9 * x) * np.exp(-6 * x)
    return norm(tone(f, d) * env(len(x), .002, .2, 3), .5)


def fx_coins():
    out = np.zeros(int(SR * .7))
    for k in range(9):
        st = int(SR * (k * .065 + rng.uniform(0, .02))); d = .18
        f = rng.uniform(2500, 4200); x = t(d)
        s = np.sin(2 * np.pi * f * x) * np.exp(-28 * x) + .4 * np.sin(2 * np.pi * f * 1.5 * x) * np.exp(-35 * x)
        out[st:st + len(s)] += s[:len(out) - st] * rng.uniform(.5, 1)
    return norm(out, .45)


def fx_print():
    d = 1.0; x = t(d)
    s = lowpass(noise(d), 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * x)))
    return norm(s * env(len(x), .02, 3, 1), .3)


LIB = {k[3:]: v for k, v in globals().items() if k.startswith('fx_')}
GAIN = {'pop': .7, 'tick': .8, 'zzz': .6, 'print': .7, 'whoosh': .8, 'swoosh': .7}


def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def render_cues(cues, duration):
    out = np.zeros(int(SR * duration) + SR)
    for c in cues:
        typ = c['type']
        if typ not in LIB:
            print('tipo desconocido, se omite:', typ); continue
        s = LIB[typ]() * GAIN.get(typ, 1.0) * c.get('gain', 1.0)
        st = int(c['frame'] / FPS * SR)
        out[st:st + len(s)] += s[:len(out) - st]
    return out[:int(SR * duration)]


def render_bed(duration, bpm=112):
    """Base rítmica mínima: bombo, hi-hat y un bajo en dos notas. Va muy baja."""
    beat = 60 / bpm; out = np.zeros(int(SR * duration))
    kick = tone(np.linspace(120, 45, int(SR * .25)), .25) * env(int(SR * .25), .001, .12)
    hat = (noise(.05) - lowpass(noise(.05), 6000)) * env(int(SR * .05), .0005, .015) * .25
    notes = [55, 55, 65.4, 49]
    n_beats = int(duration / beat)
    for b in range(n_beats):
        st = int(b * beat * SR)
        if b % 2 == 0:
            out[st:st + len(kick)] += kick[:len(out) - st]
        hs = int((b + .5) * beat * SR)
        out[hs:hs + len(hat)] += hat[:len(out) - hs]
        f = notes[(b // 4) % 4]; bd = beat * .9
        bass = lowpass(tone(f, bd, 'square'), 400) * env(int(SR * bd), .005, bd * .6, 2) * .35
        out[st:st + len(bass)] += bass[:len(out) - st]
    fade = int(SR * .3)
    out[:fade] *= np.linspace(0, 1, fade); out[-fade:] *= np.linspace(1, 0, fade)
    return norm(out, .5)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def apply_tweaks(cues, tweaks):
    """Ajustes de mezcla que no tocan el storyboard.

    {"drop": ["710:thunk", ...], "move": {"197:boing": 203}, "gain": {"tick": 0.7}, "cue_gain": {"5:coins": 0.6}}
    """
    out = []
    for c in cues:
        key = f"{c['frame']}:{c['type']}"
        if key in tweaks.get('drop', []):
            continue
        c = dict(c, frame=tweaks.get('move', {}).get(key, c['frame']))
        c['gain'] = (c.get('gain', 1.0) * tweaks.get('gain', {}).get(c['type'], 1.0)
                     * tweaks.get('cue_gain', {}).get(key, 1.0))
        out.append(c)
    return out


def mix(vo, sfx, bed, video, out):
    """Voz al frente; efectos a −6 dB que se agachan ~8 dB cuando hay voz; base a −20 dB que también se agacha."""
    inputs = ['-i', video, '-i', vo, '-i', sfx] + (['-i', bed] if bed else [])
    f = ('[1:a]aformat=channel_layouts=stereo,asplit=3[v][vk][vk2];[2:a]volume=0.5,aformat=channel_layouts=stereo[s0];'
         '[s0][vk2]sidechaincompress=threshold=0.016:ratio=1.6:knee=4:attack=5:release=120[s];')
    if bed:
        f += ('[3:a]volume=0.11,aformat=channel_layouts=stereo[b];'
              '[b][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=250[bd];'
              '[v][s][bd]amix=inputs=3:normalize=0,')
    else:
        f += '[vk]anullsink;[v][s]amix=inputs=2:normalize=0,'
    # loudnorm sobremuestrea a 192 kHz: se vuelve a 48 kHz para Instagram.
    f += 'alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000[a]'
    run(['ffmpeg', '-y', *inputs, '-filter_complex', f, '-map', '0:v', '-map', '[a]',
         '-c:v', 'copy', '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cues', nargs='?')
    ap.add_argument('--duration', type=float)
    ap.add_argument('--out', required=True)
    ap.add_argument('--bed')
    ap.add_argument('--mix', nargs='+', metavar='WAV')
    ap.add_argument('--video')
    ap.add_argument('--tweaks')
    a = ap.parse_args()
    if a.mix:
        vo, sfx = a.mix[0], a.mix[1]
        bed = a.mix[2] if len(a.mix) > 2 else None
        mix(vo, sfx, bed, a.video, a.out); print('mezcla:', a.out); return
    cues = json.load(open(a.cues))
    cues = cues['cues'] if isinstance(cues, dict) else cues
    if a.tweaks:
        cues = apply_tweaks(cues, json.load(open(a.tweaks)))
    write(a.out, render_cues(cues, a.duration)); print('efectos:', a.out, len(cues), 'cues')
    if a.bed:
        write(a.bed, render_bed(a.duration)); print('base:', a.bed)


if __name__ == '__main__':
    main()
