'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('applications');

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
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua plataforma DataOcean.
        </p>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="applications" data-testid="settings-tab-applications">
              Aplicações
            </TabsTrigger>
            <TabsTrigger value="environments" data-testid="settings-tab-environments">
              Ambientes
            </TabsTrigger>
            <TabsTrigger value="locations" data-testid="settings-tab-locations">
              Localidades
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
