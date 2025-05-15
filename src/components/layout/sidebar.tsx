// components/layout/sidebar.tsx
'use client';

import {
  BarChart3,
  Cloud,
  Cog,
  Database,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  X,
} from 'lucide-react';
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
      name: 'Environments',
      href: '/environments',
      icon: Layers,
    },
    {
      name: 'Locations',
      href: '/locations',
      icon: MapPin,
    },
    {
      name: 'Clusters',
      href: '/clusters',
      icon: Database,
    },
    {
      name: 'Applications',
      href: '/applications',
      icon: Package,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog,
    },
  ];

  return (
    <>
      {/* Overlay for mobile devices */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card/50 fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-border/40 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
              <span className="text-primary-foreground font-bold">DO</span>
            </div>
            <span className="gradient-blue bg-clip-text text-xl font-bold text-transparent">
              DataOcean
            </span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="px-3 py-4">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                    pathname === route.href
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <route.icon
                    className={cn(
                      'h-5 w-5',
                      pathname === route.href ? 'text-primary' : 'text-muted-foreground'
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
