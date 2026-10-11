# Hoja de contactos de las 11 slides (4 × 3, última celda vacía) -> overview.png
import os
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
W, H, G = 300, 375, 20
sheet = Image.new('RGB', (4 * W + 5 * G, 3 * H + 4 * G), (214, 219, 212))
for i in range(11):
    im = Image.open(os.path.join(D, 'slide-%02d.png' % (i + 1))).convert('RGB').resize((W, H), Image.LANCZOS)
    sheet.paste(im, (G + (i % 4) * (W + G), G + (i // 4) * (H + G)))
sheet.save(os.path.join(D, 'overview.png'))
print('overview.png')
