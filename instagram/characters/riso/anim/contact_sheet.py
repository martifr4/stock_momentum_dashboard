# Hoja de contactos: un fotograma cada `every`, rotulado con código de tiempo (mm:ss.ff y n.º de fotograma).
import sys
from PIL import Image, ImageDraw, ImageFont

frames_dir, out, total, every, cols, tw, fps = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:8])
idx = list(range(0, total, every))
th = int(tw * 1920 / 1080)
lab = 30
rows = (len(idx) + cols - 1) // cols
pad = 10
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), '#26232E')
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
except OSError:
    font = ImageFont.load_default()
d = ImageDraw.Draw(sheet)
for i, t in enumerate(idx):
    im = Image.open(f'{frames_dir}/f{t:04d}.png').convert('RGB').resize((tw, th), Image.LANCZOS)
    x = pad + (i % cols) * (tw + pad)
    y = pad + (i // cols) * (th + lab + pad)
    sheet.paste(im, (x, y + lab))
    s = t / fps
    d.text((x + 4, y + 5), f'{int(s // 60):02d}:{s % 60:05.2f}  f{t}', fill='#E6ECE4', font=font)
sheet.save(out, optimize=True)
print('contact sheet', out, sheet.size)
