'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const tabs = [
    { name: t('resources.tabs.templates'), href: '/resources/templates' },
    { name: t('resources.tabs.blueprints'), href: '/resources/blueprints' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border/40">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors hover:text-foreground',
              pathname.startsWith(tab.href)
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
