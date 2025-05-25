// components/layout/sidebar.tsx
'use client';

import { BarChart3, Cloud, Database, GitBranch, LayoutDashboard, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Instances',
      href: '/instances',
      icon: Cloud,
    },
    {
      name: 'Clusters',
      href: '/clusters',
      icon: Database,
    },
    {
      name: 'Git Sources',
      href: '/git-sources',
      icon: GitBranch,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Overlay for mobile devices */}
      {open && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar-container"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-card/50 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-border/40 px-4">
          <Link href="/" className="flex items-center gap-2" data-testid="sidebar-logo-link">
            <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
              <span className="font-bold text-primary-foreground">DO</span>
            </div>
            <span className="gradient-blue bg-clip-text text-xl font-bold text-transparent">
              DataOcean
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={onClose}
            data-testid="sidebar-close-button"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)]" data-testid="sidebar-scroll-area">
          <div className="px-3 py-4">
            <nav className="flex flex-col gap-1" data-testid="sidebar-navigation">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  data-testid={`sidebar-link-${route.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                    pathname.startsWith(route.href)
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <route.icon
                    className={cn(
                      'h-5 w-5',
                      pathname.startsWith(route.href) ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
