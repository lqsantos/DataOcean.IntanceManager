'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
              <span className="text-primary-foreground font-bold">DO</span>
            </div>
            <span className="text-xl font-bold">DataOcean</span>
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
                    'hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === route.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <route.icon className="h-5 w-5" />
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
