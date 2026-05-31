'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, name, nameUrdu, description, order }
        : { name, nameUrdu, description, order };

      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingId ? 'زمرہ اپ ڈیٹ ہو گیا' : 'زمرہ شامل ہو گیا');
        resetForm();
        fetchCategories();
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
    if (!confirm('کیا آپ واقعی یہ زمرہ حذف کرنا چاہتے ہیں؟')) return;

    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('زمرہ حذف ہو گیا');
      fetchCategories();
    } else {
      toast.error('زمرہ حذف نہیں ہو سکا');
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setNameUrdu(cat.nameUrdu);
    setDescription(cat.description || '');
    setOrder(cat.order);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNameUrdu('');
    setDescription('');
    setOrder(0);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">زمرہ جات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'زمرہ میں ترمیم' : 'نیا زمرہ'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="انگریزی نام"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={nameUrdu}
              onChange={(e) => setNameUrdu(e.target.value)}
              placeholder="اردو نام"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفصیل (اختیاری)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              placeholder="ترتیب"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'محفوظ...' : editingId ? 'اپ ڈیٹ کریں' : 'شامل کریں'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  منسوخ
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">تمام زمرہ جات</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-3">ترتیب</th>
                  <th className="text-right p-3">انگریزی نام</th>
                  <th className="text-right p-3">اردو نام</th>
                  <th className="text-right p-3">خبریں</th>
                  <th className="text-right p-3">کارروائی</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="p-3">{cat.order}</td>
                    <td className="p-3">{cat.name}</td>
                    <td className="p-3 font-medium">{cat.nameUrdu}</td>
                    <td className="p-3">{cat._count?.articles || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(cat)} className="text-blue-600 hover:underline">ترمیم</button>
                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
