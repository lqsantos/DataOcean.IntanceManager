// components/layout/main-layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PATModal } from '@/components/pat/pat-modal';

import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fechar a sidebar em dispositivos móveis quando mudar de página
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background" data-testid="main-layout-container">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden" data-testid="main-layout-content">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto p-4 animate-in md:p-6" data-testid="main-layout-main">
          <div className="mx-auto max-w-7xl" data-testid="main-layout-children-container">
            {children}
          </div>
        </main>
      </div>
      {/* Include the PAT Modal here so it's available throughout the app */}
      <PATModal />
    </div>
  );
}
