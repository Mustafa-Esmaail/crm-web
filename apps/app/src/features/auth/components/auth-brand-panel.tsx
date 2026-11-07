import { Building2, GitFork, Languages, ScrollText, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

const HIGHLIGHTS = [
  { key: 'permissions', icon: ShieldCheck },
  { key: 'activity', icon: ScrollText },
  { key: 'bilingual', icon: Languages },
  { key: 'structure', icon: GitFork },
] as const;

export function AuthBrandPanel() {
  const t = useTranslations('auth.brand');

  return (
    <aside className="bg-brand-panel text-on-dark hidden flex-col justify-between p-12 lg:flex">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="bg-logo shadow-logo flex size-9 items-center justify-center rounded-md"
        >
          <Sparkles className="size-5" aria-hidden />
        </span>
        <span className="text-card-title font-semibold">{t('name')}</span>
      </div>

      <div className="max-w-xl space-y-8">
        <div className="space-y-5">
          <span className="border-sidebar-active-foreground/40 text-sidebar-active-foreground text-small inline-flex items-center gap-2 rounded-md border px-3 py-1.5">
            <Building2 className="size-4" aria-hidden />
            {t('badge')}
          </span>
          <h2 className="max-w-md text-4xl leading-tight font-bold">{t('headline')}</h2>
          <p className="text-on-dark-muted max-w-md">{t('subheadline')}</p>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {HIGHLIGHTS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="border-on-dark/10 bg-on-dark/5 space-y-1 rounded-lg border p-4"
            >
              <p className="flex items-center gap-2 font-semibold">
                <Icon
                  className="text-sidebar-active-foreground size-4.5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden
                />
                {t(`highlights.${key}.title`)}
              </p>
              <p className="text-small text-on-dark-muted">{t(`highlights.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-caption text-on-dark-muted">{t('footer')}</p>
    </aside>
  );
}
