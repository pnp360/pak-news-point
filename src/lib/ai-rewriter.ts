const HF_API_BASE = 'https://api-inference.huggingface.co/models';

const REWRITE_MODEL = process.env.HF_REWRITE_MODEL || 'google/gemma-2b-it';
const HF_TOKEN = process.env.HF_API_TOKEN || '';

export interface RewriteOptions {
  title: string;
  content: string;
  style?: 'standard' | 'simplified' | 'detailed' | 'breaking';
}

export async function rewriteArticle(
  options: RewriteOptions
): Promise<{ title: string; content: string; excerpt: string } | null> {
  const { title, content, style = 'standard' } = options;

  const styleInstructions: Record<string, string> = {
    standard:
      'اردو خبر کو پیشہ ورانہ اور غیر جانبدارانہ انداز میں دوبارہ لکھیں۔',
    simplified:
      'اردو خبر کو آسان اور سلیس زبان میں دوبارہ لکھیں تاکہ عام قاری سمجھ سکے۔',
    detailed:
      'اردو خبر کو تفصیل سے دوبارہ لکھیں، مزید معلومات اور وضاحت شامل کریں۔',
    breaking:
      'اردو خبر کو بریکنگ نیوز کے انداز میں مختصر اور اثر انگیز لکھیں۔',
  };

  const prompt = `<bos><start_of_turn>user
آپ ایک پیشہ ور اردو صحافی اور نیوز ایڈیٹر ہیں۔ ${styleInstructions[style]}

موجودہ خبر کا عنوان: ${title}
موجودہ خبر کا مواد: ${content}

براہ کرم مندرجہ ذیل فارمیٹ میں نئی خبر تیار کریں:
1. بہتر عنوان (نیا، پرکشش اور خبر پر مبنی)
2. ایک مختصر خلاصہ (2-3 جملے)
3. دوبارہ تحریر کردہ مواد (پیراگراف کی شکل میں)

جواب صرف اسی فارمیٹ میں دیں:
عنوان: [نیا عنوان]
خلاصہ: [مختصر خلاصہ]
مواد: [دوبارہ تحریر کردہ مواد]
<end_of_turn>
<start_of_turn>model
`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    const res = await fetch(`${HF_API_BASE}/${REWRITE_MODEL}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('HF API error:', res.status, errText);
      return null;
    }

    const result = await res.json();
    const generated = Array.isArray(result)
      ? result[0]?.generated_text || ''
      : result.generated_text || '';

    const responsePart = generated.split('<start_of_turn>model').pop() || generated;

    const newTitle = responsePart.match(/عنوان:\s*(.+)/)?.[1]?.trim() || title;
    const newExcerpt = responsePart.match(/خلاصہ:\s*(.+)/)?.[1]?.trim() || '';
    const newContentMatch = responsePart.match(/مواد:\s*([\s\S]*)/);
    const newContent = newContentMatch?.[1]?.trim()
      ?.replace(/\n/g, '</p><p>')
      ?.replace(/^/, '<p>')
      ?.replace(/$/, '</p>') || content;

    return {
      title: newTitle,
      content: newContent,
      excerpt: newExcerpt,
    };
  } catch (err) {
    console.error('AI rewrite error:', err);
    return null;
  }
}

export async function rewriteInBulk(
  articles: { id: string; title: string; content: string }[]
): Promise<{ id: string; success: boolean }[]> {
  const results: { id: string; success: boolean }[] = [];

  for (const article of articles) {
    const result = await rewriteArticle({
      title: article.title,
      content: article.content,
      style: 'standard',
    });

    if (result) {
      const { prisma } = await import('./prisma');
      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          content: result.content,
          excerpt: result.excerpt || undefined,
        },
      });
      results.push({ id: article.id, success: true });
    } else {
      results.push({ id: article.id, success: false });
    }

    // Rate limit: 1 second between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}
