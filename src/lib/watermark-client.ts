const ALLOWED_HOSTS = ['images.pexels.com', 'images.unsplash.com', 'plus.unsplash.com', 'source.unsplash.com'];

function getCacheBuster(): number {
  return Math.floor(Date.now() / (60 * 60 * 1000));
}

export function getWatermarkedUrl(url: string): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return url;
  const cb = getCacheBuster();
  return `/api/image-proxy?url=${encodeURIComponent(url)}&v=${cb}`;
}

export function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_HOSTS.includes(u.hostname) || u.protocol === 'https:';
  } catch {
    return false;
  }
}
