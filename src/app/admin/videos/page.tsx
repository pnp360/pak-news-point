import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteVideoButton from './DeleteVideoButton';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { category: { select: { nameUrdu: true } } },
  });

  const total = videos.length;
  const published = videos.filter(v => v.status === 'PUBLISHED').length;
  const drafts = videos.filter(v => v.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ویڈیوز</h1>
        <Link
          href="/admin/videos/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          نئی ویڈیو
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">کل ویڈیوز</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{published}</p>
          <p className="text-sm text-gray-500">شائع شدہ</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{drafts}</p>
          <p className="text-sm text-gray-500">ڈرافٹ</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-4 py-3 font-semibold text-gray-600">عنوان</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">رپورٹر</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">زمرہ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">حالت</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">تاریخ</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">کارروائی</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">
                    <Link href={`/admin/videos/${video.id}`} className="hover:text-primary-600 transition-colors">
                      {video.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{video.reporterName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{video.category?.nameUrdu || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      video.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : video.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {video.status === 'PUBLISHED' ? 'شائع' : video.status === 'DRAFT' ? 'ڈرافٹ' : video.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('ur-PK') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/videos/${video.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors"
                      >
                        ترمیم
                      </Link>
                      <DeleteVideoButton id={video.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    ابھی تک کوئی ویڈیو نہیں ہے
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
