'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AUTHOR');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        toast.success('صارف شامل ہو گیا');
        setName('');
        setEmail('');
        setPassword('');
        setRole('AUTHOR');
        fetchUsers();
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
    if (!confirm('کیا آپ واقعی یہ صارف حذف کرنا چاہتے ہیں؟')) return;

    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('صارف حذف ہو گیا');
      fetchUsers();
    } else {
      toast.error('صارف حذف نہیں ہو سکا');
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    AUTHOR: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">صارفین</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">نیا صارف</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ای میل"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="پاس ورڈ"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="AUTHOR">مصنف</option>
              <option value="EDITOR">ایڈیٹر</option>
              <option value="ADMIN">ایڈمن</option>
            </select>
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
          <h2 className="text-lg font-bold mb-4">تمام صارفین</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-3">نام</th>
                  <th className="text-right p-3">ای میل</th>
                  <th className="text-right p-3">کردار</th>
                  <th className="text-right p-3">تاریخ</th>
                  <th className="text-right p-3">کارروائی</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-3">{user.name || '-'}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{new Date(user.createdAt).toLocaleDateString('ur-PK')}</td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">حذف</button>
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
