'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AIRewritePage() {
  const [articles, setArticles] = useState<{ id: string; title: string; content: string; category?: { nameUrdu: string } }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ id: string; title: string; success: boolean }[]>([]);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    const res = await fetch('/api/news?status=DRAFT&pageSize=50');
    const data = await res.json();
    setArticles(data.data || []);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(articles.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const runRewrite = async () => {
    if (selected.size === 0) {
      toast.error('براہ کرم کم از کم ایک خبر منتخب کریں');
      return;
    }

    setRunning(true);
    setResults([]);
    const batchResults: { id: string; title: string; success: boolean }[] = [];
    const selectedIds = Array.from(selected);

    for (const id of selectedIds) {
      const article = articles.find((a) => a.id === id);
      if (!article) continue;

      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: id,
          title: article.title,
          content: article.content,
          style: 'standard',
        }),
      });

      const success = res.ok;
      batchResults.push({ id, title: article.title, success });
      setResults([...batchResults]);

      // delay between requests
      await new Promise((r) => setTimeout(r, 1500));
    }

    setRunning(false);
    toast.success(`${batchResults.filter((r) => r.success).length} خبریں دوبارہ تحریر ہو گئیں`);
    fetchDrafts();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">AI ری رائٹر</h1>
      <p className="text-gray-500 mb-6">
        AI کی مدد سے ڈرافٹ خبروں کو پیشہ ورانہ انداز میں دوبارہ تحریر کریں
      </p>

      {!process.env.NEXT_PUBLIC_HF_AVAILABLE && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          نوٹ: AI ری رائٹر Hugging Face کے مفت API کا استعمال کرتا ہے۔
          بہتر کارکردگی کے لیے <code className="bg-yellow-200 px-1 rounded">HF_API_TOKEN</code> سیٹ کریں۔
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            ڈرافٹ خبریں ({articles.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-sm text-primary-600 hover:underline">
              سب منتخب کریں
            </button>
            <button onClick={deselectAll} className="text-sm text-gray-600 hover:underline">
              منسوخ کریں
            </button>
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">کوئی ڈرافٹ خبر نہیں ہے</p>
        ) : (
          <div className="space-y-2 mb-6">
            {articles.map((article) => {
              const done = results.find((r) => r.id === article.id);
              return (
                <label
                  key={article.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected.has(article.id)
                      ? 'bg-primary-50 border-primary-300'
                      : 'hover:bg-gray-50'
                  } ${done ? (done.success ? 'bg-green-50' : 'bg-red-50') : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(article.id)}
                    onChange={() => toggleSelect(article.id)}
                    disabled={running}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-xs text-gray-500">{article.category?.nameUrdu}</p>
                  </div>
                  {done && (
                    <span className={`text-sm font-bold ${done.success ? 'text-green-600' : 'text-red-600'}`}>
                      {done.success ? '✓' : '✗'}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        <button
          onClick={runRewrite}
          disabled={running || selected.size === 0}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          {running ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {results.filter((r) => r.success).length}/{selected.size} مکمل...
            </>
          ) : (
            'AI سے دوبارہ تحریر کریں'
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">نتائج</h2>
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className={r.success ? 'text-green-600' : 'text-red-600'}>
                  {r.success ? '✓' : '✗'}
                </span>
                <span className="text-sm truncate">{r.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
