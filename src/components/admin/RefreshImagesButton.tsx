'use client';

import { useState } from 'react';
import { HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function RefreshImagesButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (!confirm('کیا تمام پرانی تصاویر کو اپ ڈیٹ کرنا چاہتے ہیں؟')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/news/refresh-images', { method: 'POST' });
      const data = await res.json();
      toast.success(`${data.updated} / ${data.total} تصاویر اپ ڈیٹ ہو گئیں`);
      window.location.reload();
    } catch {
      toast.error('کچھ غلط ہو گیا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
    >
      <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'اپ ڈیٹ ہو رہا ہے...' : 'تصاویر تازہ کریں'}
    </button>
  );
}
