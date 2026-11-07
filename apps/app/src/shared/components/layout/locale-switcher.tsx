'use client';

import { Button } from '@crm/ui';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/lib/i18n/routing';

export function LocaleSwitcher() {
  const t = useTranslations('shell');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const target: Locale = LOCALES.find((candidate) => candidate !== locale) ?? DEFAULT_LOCALE;

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t('switchLanguage')}
      onClick={() => router.replace(pathname, { locale: target })}
    >
      <Languages strokeWidth={1.75} aria-hidden />
      {t(`languageName.${target}`)}
    </Button>
  );
}
