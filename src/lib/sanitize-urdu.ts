const SANITIZE_PATTERNS: [RegExp, string][] = [
  [/\bکمپنی\s+سپَچے\b/g, 'اسپیس ایکس'],
  [/\bسپَچے\b/g, 'اسپیس ایکس'],
  [/\b1\.75\s*تن\b/g, '1.75 ٹریلین'],
  [/\b(\d+\.?\d*)\s*تن\b/g, '$1 ٹریلین'],
  [/\bتن\b(?!\s*ٹریلین)/g, 'ٹریلین'],
  [/\btrillion\b/gi, 'ٹریلین'],
  [/\bbillion\b/gi, 'ارب'],
  [/\bmillion\b/gi, 'ملین'],
  [/\bSpaceX\b/gi, 'اسپیس ایکس'],
  [/\bNASA\b/gi, 'ناسا'],
  [/\bGoogle\b/gi, 'گوگل'],
  [/\bApple\b/gi, 'ایپل'],
  [/\bMicrosoft\b/gi, 'مائیکروسافٹ'],
  [/\bAI\b/g, 'مصنوعی ذہانت (AI)'],
  [/\bUK\b/g, 'برطانیہ'],
  [/\bUAE\b/g, 'متحدہ عرب امارات'],
  [/\bIMF\b/gi, 'آئی ایم ایف'],
  [/\bWHO\b/gi, 'ڈبلیو ایچ او'],
];

export function sanitizeUrduPayload(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [pattern, replacement] of SANITIZE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}
