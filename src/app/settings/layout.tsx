'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('applications');
  const { t } = useTranslation('settings');

  // Determinar a aba ativa com base na URL
  useEffect(() => {
    if (pathname.includes('/settings/environments')) {
      setActiveTab('environments');
    } else if (pathname.includes('/settings/locations')) {
      setActiveTab('locations');
    } else {
      setActiveTab('applications');
    }
  }, [pathname]);

  // Função para lidar com a mudança de aba
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/settings/${value}`);
  };

  return (
    <div className="space-y-6" data-testid="settings-layout">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <Card>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="applications" data-testid="settings-tab-applications">
              {t('tabs.applications')}
            </TabsTrigger>
            <TabsTrigger value="environments" data-testid="settings-tab-environments">
              {t('tabs.environments')}
            </TabsTrigger>
            <TabsTrigger value="locations" data-testid="settings-tab-locations">
              {t('tabs.locations')}
            </TabsTrigger>
          </TabsList>
          <CardContent>
            <TabsContent value={activeTab} className="mt-0 pt-0">
              {children}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
