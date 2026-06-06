const SYSTEM_PROMPT = `You are a professional Urdu Journalist for the premium news platform 'Azad Khabar'.
Your task is to take the provided raw Urdu news title and body text and completely rewrite it from scratch.
Requirements:
- Write in flawless, natural, and modern Urdu prose (using authentic journalistic terminology, NOT literal machine translation).
- Fix all broken phrasing. For example, never use 'ای' for AI (use 'مصنوعی ذہانت') and never use 'اک' for UK (use 'برطانیہ').
- Maintain a highly professional tone while making the headline punchy and engaging for a digital audience.
- Return the output strictly in a clean JSON format: { "rewritten_title": "...", "rewritten_body": "..." }`;

export interface RewriteResult {
  rewrittenTitle: string;
  rewrittenBody: string;
}

async function callOpenAI(title: string, body: string): Promise<RewriteResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Raw Urdu title: ${title}\nRaw Urdu body: ${body}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`OpenAI API error (${res.status}):`, err);
    return null;
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      rewrittenTitle: parsed.rewritten_title || parsed.rewrittenTitle || title,
      rewrittenBody: parsed.rewritten_body || parsed.rewrittenBody || body,
    };
  } catch {
    return { rewrittenTitle: title, rewrittenBody: body };
  }
}

async function callClaude(title: string, body: string): Promise<RewriteResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Raw Urdu title: ${title}\nRaw Urdu body: ${body}\n\nRespond only with valid JSON.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Claude API error (${res.status}):`, err);
    return null;
  }

  const data = await res.json();
  const raw = data?.content?.[0]?.text;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      rewrittenTitle: parsed.rewritten_title || parsed.rewrittenTitle || title,
      rewrittenBody: parsed.rewritten_body || parsed.rewrittenBody || body,
    };
  } catch {
    return { rewrittenTitle: title, rewrittenBody: body };
  }
}

/**
 * Rewrite a scraped Urdu article using the best available LLM.
 * Priority: OpenAI (GPT-4o) → Claude (Sonnet) → fallback (keep original).
 */
/**
 * Post-rewrite sanitization: fix known LLM transliteration errors
 * for proper nouns, financial terms, and brand names.
 */
const TRANSLITERATION_FIXES: [RegExp, string][] = [
  // Brand names
  [/سپَچے/g, 'اسپیس ایکس'],  // common LLM Urdu misspelling of SpaceX
  [/\bSpaceX\b/gi, 'اسپیس ایکس'],
  [/\bNASA\b/gi, 'ناسا'],
  [/\bGoogle\b/gi, 'گوگل'],
  [/\bApple\b/gi, 'ایپل'],
  [/\bMicrosoft\b/gi, 'مائیکروسافٹ'],
  [/\bMeta\b/gi, 'میٹا'],
  [/\bTesla\b/gi, 'ٹیسلا'],
  [/\bNetflix\b/gi, 'نیٹ فلکس'],
  [/\bDisney\b/gi, 'ڈزنی'],
  [/\bYouTube\b/gi, 'یوٹیوب'],
  [/\bWhatsApp\b/gi, 'واٹس ایپ'],
  [/\bTwitter\b/gi, 'ٹوئٹر'],
  [/\bInstagram\b/gi, 'انسٹاگرام'],

  // Financial & numeric terms – cover raw LLM transliteration "تن" instead of "ٹریلین"
  [/(\d+\.?\d*)\s*تن\b/g, '$1 ٹریلین'],
  [/\bتن\b/g, 'ٹریلین'],
  [/\btrillion\b/gi, 'ٹریلین'],
  [/\bbillion\b/gi, 'ارب'],
  [/\bmillion\b/gi, 'ملین'],

  // Countries & cities (to fix LLM hallucinations)
  [/\bUK\b/gi, 'برطانیہ'],
  [/\bUAE\b/gi, 'متحدہ عرب امارات'],
  [/\bKSA\b/gi, 'سعودی عرب'],
  [/\bIMF\b/gi, 'آئی ایم ایف'],
  [/\bWHO\b/gi, 'ڈبلیو ایچ او'],
  [/\bUN\b/gi, 'اقوام متحدہ'],
];

export function sanitizeRewrittenContent(title: string, body: string): { title: string; body: string } {
  let cleanTitle = title;
  let cleanBody = body;
  for (const [pattern, replacement] of TRANSLITERATION_FIXES) {
    cleanTitle = cleanTitle.replace(pattern, replacement);
    cleanBody = cleanBody.replace(pattern, replacement);
  }
  return { title: cleanTitle, body: cleanBody };
}

export async function rewriteArticle(
  title: string,
  body: string
): Promise<RewriteResult> {
  if (process.env.OPENAI_API_KEY) {
    const result = await callOpenAI(title, body);
    if (result) return result;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const result = await callClaude(title, body);
    if (result) return result;
  }

  return { rewrittenTitle: title, rewrittenBody: body };
}
