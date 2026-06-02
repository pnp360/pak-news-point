'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  isApproved: boolean;
  createdAt: string;
  article: { id: string; title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments?all=true');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data);
    } catch {
      toast.error('تبصرے لوڈ نہیں ہو سکے');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approved }),
      });
      if (!res.ok) throw new Error();
      setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: approved } : c));
      toast.success(approved ? 'تبصرہ منظور کر لیا گیا' : 'تبصرہ غیر منظور کر دیا گیا');
    } catch {
      toast.error('تبصرہ اپ ڈیٹ نہیں ہو سکا');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('کیا آپ اس تبصرے کو حذف کرنا چاہتے ہیں؟')) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('تبصرہ حذف کر دیا گیا');
    } catch {
      toast.error('تبصرہ حذف نہیں ہو سکا');
    }
  };

  const filtered = comments.filter(c => {
    if (filter === 'pending') return !c.isApproved;
    if (filter === 'approved') return c.isApproved;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">تبصرے</h1>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f === 'pending' ? 'زیر التواء' : f === 'approved' ? 'منظور شدہ' : 'تمام'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">لوڈ ہو رہا ہے...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">کوئی تبصرہ نہیں</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(comment => (
            <div key={comment.id} className={`bg-white rounded-xl p-5 shadow-sm border ${
              comment.isApproved ? 'border-green-200' : 'border-yellow-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{comment.authorName}</span>
                    {comment.authorEmail && (
                      <span className="text-sm text-gray-400">({comment.authorEmail})</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      comment.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {comment.isApproved ? 'منظور' : 'زیر التواء'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{new Date(comment.createdAt).toLocaleString('ur-PK')}</span>
                    <a href={`/news/${comment.article.slug}`} target="_blank" className="text-primary-600 hover:underline truncate max-w-[300px]">
                      {comment.article.title}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleApproval(comment.id, !comment.isApproved)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      comment.isApproved
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {comment.isApproved ? 'غیر منظور' : 'منظور کریں'}
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    حذف کریں
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
