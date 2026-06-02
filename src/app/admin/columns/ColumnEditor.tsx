'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ColumnEditor({ column }: { column?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(column?.title || '');
  const [slug, setSlug] = useState(column?.slug || '');
  const [excerpt, setExcerpt] = useState(column?.excerpt || '');
  const [content, setContent] = useState(column?.content || '');
  const [featuredImage, setFeaturedImage] = useState(column?.featuredImage || '');
  const [columnistName, setColumnistName] = useState(column?.columnistName || '');
  const [columnistBio, setColumnistBio] = useState(column?.columnistBio || '');
  const [categoryId, setCategoryId] = useState(column?.categoryId || '');
  const [status, setStatus] = useState(column?.status || 'DRAFT');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  function generateSlug(text: string) {
    return text
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 80) || `column-${Date.now()}`;
  }

  async function handleSave(publishStatus: string) {
    if (!title.trim() || !content.trim() || !columnistName.trim()) {
      alert('عنوان، کالم نگار کا نام، اور مواد ضروری ہے');
      return;
    }
    setSaving(true);
    const body = {
      title: title.trim(),
      slug: slug || generateSlug(title),
      excerpt: excerpt.trim() || title.slice(0, 200),
      content: `<div class="column-content">${content.trim()}</div>`,
      featuredImage: featuredImage || null,
      columnistName: columnistName.trim(),
      columnistBio: columnistBio.trim() || null,
      categoryId: categoryId || null,
      status: publishStatus,
    };

    try {
      const res = column?.id
        ? await fetch(`/api/columns/${column.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/columns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (res.ok) {
        router.push('/admin/columns');
        router.refresh();
      } else {
        const err = await res.json();
        alert('غلطی: ' + (err.error || 'نامعلوم'));
      }
    } catch {
      alert('محفوظ کرنے میں ناکامی');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{column ? 'کالم میں ترمیم' : 'نیا کالم'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">عنوان</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); if (!column) setSlug(generateSlug(e.target.value)); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="کالم کا عنوان"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">مختصر لنک (slug)</label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              placeholder="auto-generated"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">تاثراتی عبارت (Excerpt)</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="مختصر تاثراتی عبارت"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">مواد (Content)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              rows={16}
              placeholder="کالم کا مواد یہاں لکھیں..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">کالم نگار کا نام</label>
              <input
                type="text"
                value={columnistName}
                onChange={e => setColumnistName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="مثلاً: احمد علی"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">کالم نگار کا تعارف</label>
              <textarea
                value={columnistBio}
                onChange={e => setColumnistBio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="مختصر تعارف (اختیاری)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">زمرہ</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">کوئی زمرہ نہیں</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.nameUrdu}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">فیچر تصویر</label>
              <input
                type="url"
                value={featuredImage}
                onChange={e => setFeaturedImage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="تصویر کا URL"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'محفوظ ہو رہا ہے...' : 'ڈرافٹ'}
              </button>
              <button
                onClick={() => handleSave('PUBLISHED')}
                disabled={saving}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'محفوظ ہو رہا ہے...' : 'شائع کریں'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
