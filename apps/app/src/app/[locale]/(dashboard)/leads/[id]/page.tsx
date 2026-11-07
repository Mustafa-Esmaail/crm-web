import { notFound } from 'next/navigation';

import { LeadDetail } from '@/features/sales/leads';

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) notFound();

  return <LeadDetail id={leadId} />;
}
