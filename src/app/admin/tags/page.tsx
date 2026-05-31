'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTags(); }, []);

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success('ٹیگ شامل ہو گیا');
        setName('');
        fetchTags();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error('کچھ غلط ہو گیا');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('کیا آپ واقعی یہ ٹیگ حذف کرنا چاہتے ہیں؟')) return;

    const res = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('ٹیگ حذف ہو گیا');
      fetchTags();
    } else {
      toast.error('ٹیگ حذف نہیں ہو سکا');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ٹیگز</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">نیا ٹیگ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ٹیگ کا نام"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'محفوظ...' : 'شامل کریں'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">تمام ٹیگز</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <div key={tag.id} className="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span>{tag.name}</span>
                <span className="text-xs text-gray-500">({tag._count?.articles || 0})</span>
                <button onClick={() => handleDelete(tag.id)} className="text-red-600 hover:text-red-800 text-sm">×</button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-gray-500">کوئی ٹیگ نہیں ہے</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
