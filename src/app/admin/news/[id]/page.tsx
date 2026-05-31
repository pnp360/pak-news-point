import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArticleEditor from '@/components/admin/ArticleEditor';

interface Props {
  params: { id: string };
}

export default async function EditArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">خبر میں ترمیم کریں</h1>
      <ArticleEditor article={article} />
    </div>
  );
}
