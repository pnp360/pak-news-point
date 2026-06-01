'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiRefresh } from 'react-icons/hi';

export default function FetchNewsButton() {
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/fetch-news');
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.totalCreated} نئی خبریں لائی گئیں`);
      } else {
        toast.error('کچھ غلط ہو گیا');
      }
    } catch {
      toast.error('کچھ غلط ہو گیا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFetch}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
    >
      <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'خبریں لا رہا ہے...' : 'خبریں لائیں'}
    </button>
  );
}
