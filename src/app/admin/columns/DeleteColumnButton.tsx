'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteColumnButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('کیا آپ واقعی یہ کالم حذف کرنا چاہتے ہیں؟')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/columns/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
      else alert('حذف کرنے میں ناکامی');
    } catch {
      alert('حذف کرنے میں ناکامی');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
    >
      {loading ? 'حذف ہو رہا ہے...' : 'حذف'}
    </button>
  );
}
