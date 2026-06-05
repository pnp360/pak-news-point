import slugify from 'slugify';

export function generateSlug(title: string): string {
  const latinSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'en',
  });

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);

  return `${latinSlug}-${timestamp}${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\[!\[.*?\]\(.*?\)\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/^(PAKISTAN|WORLD|SPORTS|BUSINESS|TECHNOLOGY|ENTERTAINMENT|HEALTH|EDUCATION)\s*[-–—|]\s*/gi, '')
    .trim();
}

export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
