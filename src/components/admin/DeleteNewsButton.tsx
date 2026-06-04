'use client';

import { useRouter } from 'next/navigation';
import { HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function DeleteNewsButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('کیا آپ واقعی یہ خبر حذف کرنا چاہتے ہیں؟')) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('خبر حذف ہو گئی');
        router.refresh();
      } else {
        toast.error('کچھ غلط ہو گیا');
      }
    } catch {
      toast.error('کچھ غلط ہو گیا');
    }
  };

  return (
    <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded text-red-600">
      <HiTrash className="w-4 h-4" />
    </button>
  );
}
