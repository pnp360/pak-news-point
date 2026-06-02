import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ColumnEditor from '../ColumnEditor';

export const dynamic = 'force-dynamic';

export default async function EditColumnPage({ params }: { params: { id: string } }) {
  const column = await prisma.columnArticle.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!column) notFound();

  return <ColumnEditor column={column} />;
}
