'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@crm/ui';
import { useTranslations } from 'next-intl';

import { PERMISSIONS } from '@/config/permissions';
import { NoPermission } from '@/shared/components/feedback/no-permission';
import { PageHeader } from '@/shared/components/layout/page-header';
import { useCan } from '@/shared/hooks/use-can';

import type { SettingKind } from '../types';
import { RuleList } from './rule-list';
import { SettingList } from './setting-list';

type TabId = SettingKind | 'rules';

export function PipelineSettingsPage() {
  const t = useTranslations('pipelineSettings');
  const tNav = useTranslations('nav');
  const canLead = useCan(PERMISSIONS.leadSettingsManage);
  const canDeal = useCan(PERMISSIONS.dealSettingsManage);

  const tabs: TabId[] = [
    ...(canLead ? (['lead-stages', 'lead-sources', 'rules'] as const) : []),
    ...(canDeal ? (['deal-stages'] as const) : []),
  ];

  return (
    <>
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Breadcrumbs
            items={[
              { label: tNav('items.home'), href: '/' },
              { label: tNav('sections.admin') },
              { label: t('title') },
            ]}
          />
          <PageHeader.Title>{t('title')}</PageHeader.Title>
          <PageHeader.Description>{t('description')}</PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      {tabs.length === 0 ? (
        <NoPermission />
      ) : (
        <Tabs defaultValue={tabs[0]} className="space-y-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {t(`kinds.${tab}.tab`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              {tab === 'rules' ? <RuleList /> : <SettingList kind={tab} />}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}
