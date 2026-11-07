import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@crm/ui';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link } from '@/lib/i18n/navigation';

export interface BreadcrumbEntry {
  label: string;
  /** Omit on the current page. */
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-small">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="rtl:rotate-180" aria-hidden />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
