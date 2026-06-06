'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<{ id: string; url: string; filename: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    const res = await fetch('/api/media');
    const data = await res.json();
    setMedia(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('تصویر اپ لوڈ ہو گئی');
        fetchMedia();
      } else {
        toast.error('اپ لوڈ ناکام');
      }
    } catch {
      toast.error('اپ لوڈ ناکام');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL کاپی ہو گیا');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">میڈیا لائبریری</h1>

      {/* Upload */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <label className={`inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'اپ لوڈ ہو رہا ہے...' : 'تصویر اپ لوڈ کریں'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group cursor-pointer" onClick={() => copyUrl(item.url)}>
            <div className="relative h-32">
              <Image src={item.url} alt={item.filename} fill className="object-cover" />
            </div>
            <div className="p-2 text-xs text-gray-500 truncate">{item.filename}</div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            کوئی تصویر نہیں ہے
          </div>
        )}
      </div>
    </div>
  );
}
