#!/usr/bin/env python3
"""Voz en off para los Reels de Dinero Irracional.

Lee un guion de voz con tiempos (JSON), sintetiza cada frase con Piper,
la coloca en su instante y, si se pisa con la siguiente, la acelera un poco
(como mucho ×1,25). Masteriza a −14 LUFS y, si se pasa un vídeo, lo mezcla.

Uso:
  python3 voiceover.py vo.json --preset A --out vo.wav [--video reel.mp4 --mux reel-voz.mp4]

vo.json: {"duration": 53.0, "lines": [{"t": 0.0, "text": "En tu cabeza viven dos."}, ...]}
"""
import argparse, json, os, subprocess, tempfile, wave

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = os.environ.get('PIPER_VOICES', os.path.join(HERE, 'voices'))
SR = 44100
MAX_SPEEDUP = 1.25
GAP = 0.12  # aire mínimo entre frases (s)

# Tonos de voz: modelo de Piper + parámetros + cadena de ffmpeg.
PRESETS = {
    'A': dict(model='es_ES-davefx-medium', speaker=None, length=0.86, noise=0.75, noise_w=0.9,
              fx='equalizer=f=3500:t=q:w=1:g=3'),
    'B': dict(model='es_ES-sharvard-medium', speaker=0, length=0.95, noise=0.7, noise_w=0.8,
              fx='equalizer=f=200:t=q:w=1:g=2'),
    'C': dict(model='es_ES-davefx-medium', speaker=None, length=1.06, noise=0.6, noise_w=0.8,
              fx='asetrate=22050*0.94,aresample=22050,atempo=1.0638,equalizer=f=150:t=q:w=1:g=3'),
}
MASTER = 'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80'


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def duration(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES'


def ensure_model(name):
    """Descarga la voz de Piper la primera vez (no se versiona: pesa ~70 MB)."""
    os.makedirs(VOICES, exist_ok=True)
    _, who, quality = name.split('-')
    for ext in ('.onnx', '.onnx.json'):
        dst = os.path.join(VOICES, name + ext)
        if not os.path.exists(dst):
            run(['curl', '-sfL', '-o', dst, f'{HF}/{who}/{quality}/{name}{ext}'])


def synth(text, preset, out, tmp):
    p = PRESETS[preset]
    ensure_model(p['model'])
    raw = os.path.join(tmp, 'raw.wav')
    txt = os.path.join(tmp, 'line.txt')
    with open(txt, 'w') as f:
        f.write(text)
    cmd = ['python3', '-m', 'piper', '-m', os.path.join(VOICES, p['model'] + '.onnx'),
           '-i', txt, '-f', raw, '--length-scale', str(p['length']),
           '--noise-scale', str(p['noise']), '--noise-w-scale', str(p['noise_w'])]
    if p['speaker'] is not None:
        cmd += ['-s', str(p['speaker'])]
    run(cmd)
    run(['ffmpeg', '-y', '-i', raw, '-af', p['fx'] + ',areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
         'silenceremove=start_periods=1:start_threshold=-50dB', '-ar', str(SR), '-ac', '1', out])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('script')
    ap.add_argument('--preset', choices=PRESETS, default='A')
    ap.add_argument('--out', required=True)
    ap.add_argument('--video')
    ap.add_argument('--mux')
    a = ap.parse_args()
    spec = json.load(open(a.script))
    lines, total = spec['lines'], spec['duration']

    with tempfile.TemporaryDirectory() as tmp:
        clips, report = [], []
        prev_end = 0.0
        for i, ln in enumerate(lines):
            clip = os.path.join(tmp, f'l{i:02d}.wav')
            synth(ln['text'], a.preset, clip, tmp)
            end = lines[i + 1]['t'] - GAP if i + 1 < len(lines) else total - 0.3
            room, dur = end - ln['t'], duration(clip)
            speed = 1.0
            if dur > room:
                speed = min(dur / room, MAX_SPEEDUP)
                fast = clip.replace('.wav', '_f.wav')
                run(['ffmpeg', '-y', '-i', clip, '-af', f'atempo={speed:.4f}', fast])
                clip = fast
            start, dur = ln['t'], duration(clip)
            # Si aun acelerada no cabe, adelanta la frase al hueco que dejó la anterior.
            if dur > room:
                start = max(prev_end + GAP, ln['t'] - (dur - room))
                room = end - start
            prev_end = start + dur
            clips.append((start, clip))
            report.append((start, dur, room, speed, ln['text']))

        inputs, filt = [], []
        for k, (t, clip) in enumerate(clips):
            inputs += ['-i', clip]
            ms = int(round(t * 1000))
            filt.append(f'[{k}:a]adelay={ms}|{ms}[d{k}]')
        mix = ''.join(f'[d{k}]' for k in range(len(clips)))
        filt.append(f'{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={total},'
                    f'atrim=0:{total},{MASTER},loudnorm=I=-14:TP=-1.5:LRA=7[out]')
        run(['ffmpeg', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]',
             '-ar', str(SR), '-ac', '2', a.out])

    for t, d, room, speed, text in report:
        flag = '  ⚠ no cabe' if d > room + 0.05 else ''
        print(f'{t:6.2f}s  {d:5.2f}s/{room:5.2f}s  x{speed:.2f}  {text}{flag}')

    if a.video and a.mux:
        run(['ffmpeg', '-y', '-i', a.video, '-i', a.out, '-map', '0:v', '-map', '1:a',
             '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', a.mux])
        print('vídeo con voz:', a.mux)


if __name__ == '__main__':
    main()
