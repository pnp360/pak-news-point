export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { toUrduNumber } from '@/lib/urdu';
import { HiPlus, HiPencil, HiTrash, HiRefresh } from 'react-icons/hi';

interface Props {
  searchParams: { page?: string; status?: string };
}

export default async function AdminNewsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const statusFilter = searchParams.status;

  const where: any = {};
  if (statusFilter && ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(statusFilter)) {
    where.status = statusFilter;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { nameUrdu: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'ڈرافٹ',
    PUBLISHED: 'شائع شدہ',
    SCHEDULED: 'مقررہ',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">خبریں</h1>
        <div className="flex items-center gap-2">
          <RefreshImagesButton />
          <Link
            href="/admin/news/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            نئی خبر
          </Link>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'DRAFT', 'PUBLISHED', 'SCHEDULED'].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/news?status=${s}` : '/admin/news'}
            className={`px-4 py-2 rounded-lg text-sm ${
              (statusFilter || '') === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {s ? statusLabels[s] : 'سب'}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          <p className="text-xl">کوئی خبر نہیں ہے</p>
          <Link href="/admin/news/new" className="text-primary-600 hover:underline mt-2 inline-block">
            پہلی خبر تحریر کریں
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-4 font-medium">عنوان</th>
                  <th className="text-right p-4 font-medium">زمرہ</th>
                  <th className="text-right p-4 font-medium">مصنف</th>
                  <th className="text-right p-4 font-medium">حیثیت</th>
                  <th className="text-right p-4 font-medium">ملاحظات</th>
                  <th className="text-right p-4 font-medium">تاریخ</th>
                  <th className="text-right p-4 font-medium">کارروائی</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="p-4 max-w-xs">
                      <p className="font-medium truncate">{article.title}</p>
                    </td>
                    <td className="p-4 text-sm">{article.category.nameUrdu}</td>
                    <td className="p-4 text-sm">{article.author.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[article.status]}`}>
                        {statusLabels[article.status]}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{toUrduNumber(article.views)}</td>
                    <td className="p-4 text-sm">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('ur-PK')
                        : new Date(article.createdAt).toLocaleDateString('ur-PK')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/news/${article.id}`}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={article.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/news?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {toUrduNumber(p)}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RefreshImagesButton() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!confirm('کیا تمام پرانی تصاویر کو اپ ڈیٹ کرنا چاہتے ہیں؟')) return;
        const btn = e.currentTarget.querySelector('button') as HTMLButtonElement;
        btn.disabled = true;
        btn.innerHTML = 'اپ ڈیٹ ہو رہا ہے...';
        const res = await fetch('/api/news/refresh-images', { method: 'POST' });
        const data = await res.json();
        alert(`${data.updated} / ${data.total} تصاویر اپ ڈیٹ ہو گئیں`);
        window.location.reload();
      }}
    >
      <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2">
        <HiRefresh className="w-5 h-5" />
        تصاویر تازہ کریں
      </button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        'use server';
        const { prisma } = await import('@/lib/prisma');
        await prisma.article.delete({ where: { id } });
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (confirm('کیا آپ واقعی یہ خبر حذف کرنا چاہتے ہیں؟')) {
          (e.target as HTMLFormElement).requestSubmit();
        }
      }}
    >
      <button type="submit" className="p-2 hover:bg-red-50 rounded text-red-600">
        <HiTrash className="w-4 h-4" />
      </button>
    </form>
  );
}
