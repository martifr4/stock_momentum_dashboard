# Hoja de contactos de las 9 slides (3 × 3) -> overview.png
import os
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__))
W, H, G = 360, 450, 24
sheet = Image.new('RGB', (3 * W + 4 * G, 3 * H + 4 * G), (214, 219, 212))
for i in range(9):
    im = Image.open(os.path.join(D, 'slide-%02d.png' % (i + 1))).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = G + (i % 3) * (W + G), G + (i // 3) * (H + G)
    sheet.paste(im, (x, y))
sheet.save(os.path.join(D, 'overview.png'))
print('overview.png')
