function normalizeSpacing(text: string): string {
  let s = text
    .replace(/\s{2,}/g, ' ')
    .replace(/ ([\.؟،!؛:])/g, '$1')
    .replace(/([\.؟،!؛:]) /g, '$1 ')
    .replace(/ ?\( ?/g, ' (')
    .replace(/ ?\) ?/g, ') ')
    .replace(/ ([\/\\]) /g, '$1')
    .replace(/["""] /g, '\u201D')
    .replace(/ ["""]/g, '\u201C')
    .replace(/ *\n */g, '\n')
    .trim();
  if (!s.endsWith('\u06D4') && !s.endsWith('.') && !s.endsWith('!') && !s.endsWith('\u061F') && s.length > 0) {
    s += '\u06D4';
  }
  return s;
}

const JOURNALISM_VOCAB: [RegExp, string][] = [
  // Remove redundant "ہے" from headlines and sentence endings
  [/\b(کیا|کی|کا)\s*(گیا|گئی|گئے)\s*(ہے|ہیں)\b/g, '$1 $2'],

  // Fix "کے بارے میں" → "سے متعلق" (journalism style)
  [/\bکے بارے میں\b/g, 'سے متعلق'],

  // "کی طرف سے" attribution → "کے مطابق"
  [/\bکی طرف سے\b/g, 'کے مطابق'],

  // "کا تعلق" → "سے تعلق" (more natural)
  [/\bکا تعلق\b/g, 'سے تعلق'],

  // Collapse "کہ وہ" → "کہ" where the وہ is redundant
  [/\bکہ وہ (ایک|کچھ|بہت|کوئی|یہ|اس)\b/g, 'کہ $1'],

  // "نے کہا کہ" is fine, but "بتایا کہ" → "کہا کہ" in news context
  [/\bبتایا کہ\b/g, 'کہا کہ'],

  // "خیال رکھیں" → "خیال رکھا جائے" (news style)
  // This is specific, skip for now

  // "کا سامنا" → "کا سامنا کرنا پڑا" → simplify
  [/\bکا سامنا کرنا پڑا\b/g, 'سے دوچار'],

  // Remove English-style passive voice artifacts
  [/\bکیا گیا ہے کہ\b/g, 'کیا گیا کہ'],
  [/\bکی گئی ہے کہ\b/g, 'کی گئی کہ'],
  [/\bکیے گئے ہیں کہ\b/g, 'کیے گئے کہ'],

  // "جاری ہے" in news → keep (it's fine), but "ہے جاری" → "جاری ہے"
  [/\bہے جاری\b/g, 'جاری ہے'],
  [/\bہیں جاری\b/g, 'جاری ہیں'],

  // "فی الحال" → "اس وقت" (more news-like)
  [/\bفی الحال\b/g, 'اس وقت'],

  // "بہت سے" → "متعدد" (more formal/journalistic)
  [/\bبہت سے\b(?! لوگ| افراد)/g, 'متعدد'],

  // "کافی عرصہ" → "طویل عرصہ"
  [/\bکافی عرصہ\b/g, 'طویل عرصہ'],

  // "اس دوران" → keep, it's fine

  // "اس حوالے سے" → keep, it's common in Pakistani Urdu

  // "اس سلسلے میں" → keep, it's fine

  // Remove trailing "ہے" at end of headlines
  [/(^[^۔]*?[\.\u06D4])\s*ہے\s*$/gm, '$1'],
];

const HEADLINE_FIXES: [RegExp, string][] = [
  // Remove trailing "ہے", "ہیں", "گا", "گی" from headlines
  [/(^[^۔\n]{10,100}?)\s*(ہے|ہیں|ہوں)\s*$/gm, '$1'],
  // Remove "کیا" at the end of headlines (e.g., "کا اعلان کیا" → "کا اعلان")
  [/(^[^۔\n]{10,100}?)\s*(کیا)\s*$/gm, '$1'],
  // Remove "کر" at the end
  [/(کیا|کی|کا)\s*کر\s*$/gm, '$1'],
  // Ensure headlines end with proper Urdu stop character
  [/(^[^۔\n]{10,200}[ء-ي]+)\s*$/, '$1۔'],
];

const PROPAGANDA_FIXES: [RegExp, string][] = [
  [/\bہلاک\b(?!.*فلسطینی|.*غزہ|.*اسرائیل)/g, 'ہلاک'],
  // Journalism uses "ہلاک" for war/conflict casualties
  // "مر گئے" → "ہلاک" for disaster/news context
  [/\bمر گئے\b/g, 'ہلاک ہو گئے'],
  [/\bمر گیا\b/g, 'ہلاک ہو گیا'],
  [/\bمر گئی\b/g, 'ہلاک ہو گئی'],
  // "زخمی ہو گئے" → "زخمی" (shorter, news style)
  [/\bزخمی ہو گئے\b/g, 'زخمی'],
  [/\bزخمی ہو گیا\b/g, 'زخمی'],
  [/\bزخمی ہو گئی\b/g, 'زخمی'],
  // "متاثرہ افراد" → "متاثرین" (shorter)
  [/\bمتاثرہ افراد\b/g, 'متاثرین'],
  [/\bمتاثرہ شخص\b/g, 'متاثرہ'],
];

const PUNCTUATION_FIXES: [RegExp, string][] = [
  // Replace English period with Urdu stop where appropriate
  [/([ء-ي])\.(?=\s|$)/g, '$1\u06D4'],
  // Ensure space after Urdu stop
  [/\u06D4([^\s])/g, '\u06D4 $1'],
  // Fix comma usage — Urdu tends to use fewer commas
  // Remove comma before "اور"
  [/،\s*اور/g, ' اور'],
  // Remove comma before "کہ"
  [/،\s*کہ/g, ' کہ'],
  // Replace English comma with Urdu comma
  [/,(?=\s)/g, '،'],
  // Ensure Urdu question mark
  [/\?(?=\s|$)/g, '\u061F'],
];

export function applyUrduJournalism(text: string, isHeadline: boolean = false): string {
  let result = text;

  // 1. Apply punctuation fixes
  for (const [pattern, replacement] of PUNCTUATION_FIXES) {
    result = result.replace(pattern, replacement);
  }

  // 2. Apply vocabulary normalization
  for (const [pattern, replacement] of JOURNALISM_VOCAB) {
    result = result.replace(pattern, replacement);
  }

  // 3. Apply propaganda/news-style fixes
  for (const [pattern, replacement] of PROPAGANDA_FIXES) {
    result = result.replace(pattern, replacement);
  }

  // 4. If headline, apply headline-specific fixes
  if (isHeadline) {
    for (const [pattern, replacement] of HEADLINE_FIXES) {
      result = result.replace(pattern, replacement);
    }
  }

  // 5. Normalize spacing
  result = normalizeSpacing(result);

  return result;
}

export function cleanTitleForDisplay(title: string): string {
  let t = title
    .replace(/^["""]\s*/, '')
    .replace(/\s*["""]$/, '')
    .replace(/\s*[\.\u06D4]\s*$/, '')
    .trim();
  if (!t.endsWith('\u06D4') && !t.endsWith('!') && !t.endsWith('\u061F')) {
    t += '\u06D4';
  }
  return t;
}
