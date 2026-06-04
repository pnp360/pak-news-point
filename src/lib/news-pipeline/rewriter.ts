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
