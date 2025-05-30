// components/layout/sidebar.tsx
'use client';

import {
  Archive,
  Building2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  GitBranch,
  Globe2,
  Layers,
  LayoutDashboard,
  Settings,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/settings'));

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
      name: 'Resources',
      href: '/resources',
      icon: Archive,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      children: [
        {
          name: 'Applications',
          href: '/settings/applications',
          icon: Building2,
        },
        {
          name: 'Environments',
          href: '/settings/environments',
          icon: Layers,
        },
        {
          name: 'Locations',
          href: '/settings/locations',
          icon: Globe2,
        },
      ],
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

      {/* Sidebar - width changes based on collapsed state */}
      <aside
        data-testid="sidebar-container"
        className={cn(
          'fixed left-0 top-0 z-50 h-full border-r border-border/40 bg-muted shadow-[1px_0_3px_0_rgba(0,0,0,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-muted/80 dark:bg-slate-900/75',
          collapsed ? 'w-20' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0' // Sempre visível em telas médias e grandes
        )}
      >
        {/* Logo e cabeçalho da sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2" data-testid="sidebar-logo-link">
              <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
                <span className="font-bold text-primary-foreground">DO</span>
              </div>
              <span className="gradient-blue bg-clip-text text-xl font-bold text-transparent">
                DataOcean
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex w-full justify-center"
              data-testid="sidebar-logo-collapsed"
            >
              <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
                <span className="font-bold text-primary-foreground">DO</span>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            data-testid="sidebar-close-button"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden md:flex"
            data-testid="sidebar-collapse-button"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            <span className="sr-only">{collapsed ? 'Expandir menu' : 'Colapsar menu'}</span>
          </Button>
        </div>

        {/* Área de rolagem para os links de navegação */}
        <ScrollArea className="h-[calc(100vh-64px)]" data-testid="sidebar-scroll-area">
          <div className={cn('py-4', collapsed ? 'px-2' : 'px-3')}>
            <nav className="flex flex-col gap-1" data-testid="sidebar-navigation">
              {routes.map((route) => {
                const isSettings = route.href === '/settings';
                const isActive = isSettings
                  ? pathname.startsWith(route.href)
                  : pathname === route.href;
                const hasChildren = route.children && route.children.length > 0;

                if (collapsed) {
                  return (
                    <TooltipProvider key={route.href}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'flex h-10 w-full items-center justify-center rounded-md transition-all duration-200',
                                isActive && 'bg-primary/10 text-primary shadow-sm'
                              )}
                              onClick={() => {
                                if (isSettings) {
                                  setSettingsOpen(!settingsOpen);
                                }
                              }}
                            >
                              <route.icon
                                className={cn(
                                  'h-5 w-5',
                                  isActive ? 'text-primary' : 'text-muted-foreground'
                                )}
                              />
                            </Button>
                            {hasChildren && settingsOpen && (
                              <div className="mt-1 space-y-1">
                                {route.children.map((child) => (
                                  <TooltipProvider key={child.href}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link
                                          href={child.href}
                                          className={cn(
                                            'flex h-8 w-full items-center justify-center rounded-md transition-all duration-200',
                                            pathname === child.href &&
                                              'bg-primary/10 text-primary shadow-sm'
                                          )}
                                        >
                                          <child.icon
                                            className={cn(
                                              'h-4 w-4',
                                              pathname === child.href
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                            )}
                                          />
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent side="right">{child.name}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">{route.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return (
                  <div key={route.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive && 'bg-primary/10 text-primary shadow-sm'
                      )}
                      onClick={() => {
                        if (isSettings) {
                          setSettingsOpen(!settingsOpen);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <route.icon
                          className={cn(
                            'h-5 w-5',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        {route.name}
                      </div>
                      {hasChildren && (
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform',
                            settingsOpen && 'rotate-90'
                          )}
                        />
                      )}
                    </Button>
                    {hasChildren && settingsOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                              pathname === child.href
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                            )}
                          >
                            <child.icon
                              className={cn(
                                'h-4 w-4',
                                pathname === child.href
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                            />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
