import { notFound } from 'next/navigation';

import { RoleEditor } from '@/features/access/roles';

interface RolePageProps {
  params: Promise<{ id: string }>;
}

export default async function RolePage({ params }: RolePageProps) {
  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) notFound();

  return <RoleEditor roleId={roleId} />;
}
