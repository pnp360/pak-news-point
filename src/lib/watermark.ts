import sharp from 'sharp';

const ALLOWED_HOSTS = ['images.pexels.com', 'images.unsplash.com', 'plus.unsplash.com', 'source.unsplash.com'];

const WATERMARK_TEXT = 'Azad Khabar';

function generateWatermarkSvg(width: number): Buffer {
  const fontSize = Math.max(14, Math.round(width * 0.035));
  const padX = Math.round(fontSize * 0.8);
  const padY = Math.round(fontSize * 0.4);
  const textWidth = fontSize * WATERMARK_TEXT.length * 0.65;
  const svgW = Math.round(textWidth + padX * 2);
  const svgH = Math.round(fontSize + padY * 2);

  const svg = `
    <svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:0.75" />
          <stop offset="100%" style="stop-color:#16213e;stop-opacity:0.75" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="${Math.round(fontSize * 0.25)}" fill="url(#bg)"/>
      <text
        x="${svgW / 2}" y="${svgH / 2 + Math.round(fontSize * 0.32)}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        letter-spacing="1"
      >${WATERMARK_TEXT}</text>
    </svg>`;

  return Buffer.from(svg);
}

export async function processImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width!;
  const h = metadata.height!;

  const watermarkSvg = generateWatermarkSvg(w);

  return sharp(imageBuffer)
    .composite([
      {
        input: watermarkSvg,
        gravity: 'southeast',
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
}

export function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_HOSTS.includes(u.hostname) || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getCacheBuster(): number {
  const now = Date.now();
  return Math.floor(now / 3600000);
}

export function getWatermarkedUrl(url: string): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return url;
  const cb = getCacheBuster();
  return `/api/image-proxy?url=${encodeURIComponent(url)}&v=${cb}`;
}
