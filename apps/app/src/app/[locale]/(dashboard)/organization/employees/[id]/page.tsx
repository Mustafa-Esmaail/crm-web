import { notFound } from 'next/navigation';

import { EmployeeProfile } from '@/features/organization/employees';

interface EmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeePage({ params }: EmployeePageProps) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound();

  return <EmployeeProfile id={employeeId} />;
}
