export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getWatermarkedUrl } from '@/lib/watermark';
import { getUrduDate } from '@/lib/urdu';

export default async function ColumnDetailPage({ params }: { params: { slug: string } }) {
  const column = await prisma.columnArticle.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!column || column.status !== 'PUBLISHED') notFound();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/" className="hover:text-primary-600">صفحہ اول</Link>
        <span>/</span>
        <span className="text-gray-600">{column.title}</span>
      </nav>

      {column.featuredImage && (
        <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
          <Image src={getWatermarkedUrl(column.featuredImage)} alt={column.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 900px" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-bold">
          {column.columnistName.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-900">{column.columnistName}</p>
          {column.columnistBio && <p className="text-sm text-gray-500">{column.columnistBio}</p>}
        </div>
      </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-[2.25] mb-4 text-gray-900">
        {column.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
        <span>{getUrduDate(column.publishedAt)}</span>
        <span>{column.views.toLocaleString('en-US')} ملاحظات</span>
      </div>

      <div
        className="text-lg leading-loose text-gray-800 article-content"
        dangerouslySetInnerHTML={{ __html: column.content }}
      />
    </div>
  );
}
