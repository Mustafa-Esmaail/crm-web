import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { RegisterForm } from '@/features/auth';
import { authPageMetadata } from '@/features/auth/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return authPageMetadata(t('registerTitle'), '/register');
}

export default function RegisterPage() {
  return <RegisterForm />;
}
