'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VideoData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string;
  thumbnail: string | null;
  reporterName: string | null;
  categoryId: string | null;
  status: string;
}

export default function VideoEditor({ video }: { video?: VideoData }) {
  const router = useRouter();
  const [title, setTitle] = useState(video?.title || '');
  const [slug, setSlug] = useState(video?.slug || '');
  const [description, setDescription] = useState(video?.description || '');
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || '');
  const [thumbnail, setThumbnail] = useState(video?.thumbnail || '');
  const [reporterName, setReporterName] = useState(video?.reporterName || '');
  const [categoryId, setCategoryId] = useState(video?.categoryId || '');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; nameUrdu: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  function generateSlug(text: string) {
    return text.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase().slice(0, 80) || `video-${Date.now()}`;
  }

  function getYouTubeId(url: string) {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  const youtubeId = getYouTubeId(videoUrl);
  const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;

  async function handleSave(publishStatus: string) {
    if (!title.trim() || !videoUrl.trim()) {
      alert('عنوان اور ویڈیو URL ضروری ہے');
      return;
    }
    setSaving(true);
    const body = {
      title: title.trim(),
      slug: slug || generateSlug(title),
      description: description.trim() || '',
      videoUrl: videoUrl.trim(),
      thumbnail: thumbnail || null,
      reporterName: reporterName.trim() || null,
      categoryId: categoryId || null,
      status: publishStatus,
    };

    try {
      const res = video?.id
        ? await fetch(`/api/videos/${video.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (res.ok) {
        router.push('/admin/videos');
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
        <h1 className="text-2xl font-bold">{video ? 'ویڈیو میں ترمیم' : 'نئی ویڈیو'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">عنوان</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); if (!video) setSlug(generateSlug(e.target.value)); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ویڈیو کا عنوان"
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">ویڈیو URL (YouTube)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {embedUrl && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={title} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">تفصیل</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={5}
              placeholder="ویڈیو کی تفصیل"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">رپورٹر کا نام</label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="مثلاً: علی رضا"
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameUrdu}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تھمب نیل (اختیاری)</label>
              <input
                type="url"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
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
