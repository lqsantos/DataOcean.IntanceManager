// components/layout/main-layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PATModal } from '@/components/pat/pat-modal';
import { cn } from '@/lib/utils';

import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fechar a sidebar em dispositivos móveis quando mudar de página
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    // Carregar preferência de collapse da sidebar do localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');

    if (savedCollapsedState) {
      setSidebarCollapsed(savedCollapsedState === 'true');
    }

    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Salvar preferência de collapse da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Função para alternar o estado de collapse da sidebar
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-background dark:bg-slate-950"
      data-testid="main-layout-container"
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Container de conteúdo à direita da sidebar */}
      <div
        className={cn(
          'relative flex flex-1 flex-col transition-all duration-300',
          sidebarOpen
            ? sidebarCollapsed
              ? 'md:ml-20' // Largura da sidebar quando colapsada
              : 'md:ml-64' // Largura da sidebar quando expandida
            : 'ml-0'
        )}
      >
        {/* Header fixo no topo */}
        <div
          className={cn(
            'fixed left-0 right-0 top-0 z-40',
            sidebarOpen ? (sidebarCollapsed ? 'md:left-20' : 'md:left-64') : ''
          )}
        >
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 px-6 pb-8 pt-24" data-testid="main-layout-main">
          <div className="mx-auto w-full" data-testid="main-layout-children-container">
            {children}
          </div>
        </main>
      </div>

      <PATModal />
    </div>
  );
}
