// components/layout/main-layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="animate-in flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
