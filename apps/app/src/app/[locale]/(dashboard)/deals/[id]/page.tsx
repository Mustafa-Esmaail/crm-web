import { notFound } from 'next/navigation';

import { DealDetail } from '@/features/sales/deals';

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const dealId = Number(id);
  if (!Number.isInteger(dealId) || dealId <= 0) notFound();

  return <DealDetail id={dealId} />;
}
