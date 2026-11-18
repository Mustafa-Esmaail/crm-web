import { notFound } from 'next/navigation';

import { EmployeeReportPageContent } from '@/features/reports';

interface EmployeeReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeReportPage({ params }: EmployeeReportPageProps) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound();

  return <EmployeeReportPageContent employeeId={employeeId} />;
}
