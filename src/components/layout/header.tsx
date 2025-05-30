// components/layout/header.tsx
'use client';

import { Bell, Key, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/language-switcher';
import { FontSizeControl } from '@/components/layout/font-size-control';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { usePATModal } from '@/contexts/modal-manager-context';
import { getRouteMetadata } from '@/lib/navigation-config';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { setTheme, theme } = useTheme();
  const { openModal } = usePATModal();
  const pathname = usePathname();

  // Obter metadados da página dinamicamente com base na rota atual
  const pageMetadata = getRouteMetadata(pathname);

  // Hook de tradução usando o namespace fornecido nos metadados ou 'common' como fallback
  const { t } = useTranslation(pageMetadata.namespace || 'common');

  // Obter o título e descrição traduzidos
  const pageTitle = t(pageMetadata.titleKey);
  const pageDescription = pageMetadata.descriptionKey ? t(pageMetadata.descriptionKey) : undefined;

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      data-testid="header-container"
    >
      <div className="flex h-16 items-center px-4">
        {/* Botão de menu mobile - visível apenas em telas pequenas */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 hover:bg-background/80 md:hidden"
          onClick={onMenuClick}
          data-testid="header-menu-button"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo mobile - visível apenas em telas pequenas */}
        <div className="flex items-center gap-2 md:hidden" data-testid="header-logo-mobile">
          <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
            <span className="font-bold text-primary-foreground">DO</span>
          </div>
          <span className="text-lg font-bold">DataOcean</span>
        </div>

        <div className="flex flex-1 items-center gap-4 md:justify-between">
          {/* Título da página - visível apenas em telas médias e grandes */}
          <div className="hidden md:block">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-sm text-muted-foreground">{pageDescription}</p>
              )}
            </div>
          </div>

          {/* Área de controles à direita */}
          <div className="flex items-center gap-2">
            <form
              className="hidden w-full max-w-sm items-center space-x-2 md:flex"
              data-testid="header-search-form"
            >
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('common.search')}
                  className="w-full border-border/50 bg-secondary/50 pl-8 focus-visible:ring-primary/30"
                  data-testid="header-search-input"
                />
              </div>
            </form>

            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-background/80"
                  data-testid="header-notifications-button"
                >
                  <Bell className="h-5 w-5" />
                  <Badge
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-primary p-0"
                    data-testid="header-notifications-badge"
                  >
                    3
                  </Badge>
                  <span className="sr-only">{t('common.notifications')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass w-80"
                data-testid="header-notifications-dropdown"
              >
                <DropdownMenuLabel>{t('common.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto" data-testid="header-notifications-list">
                  {[1, 2, 3].map((i) => (
                    <DropdownMenuItem
                      key={i}
                      className="cursor-pointer p-4 hover:bg-secondary/50 focus:bg-secondary/50"
                      data-testid={`header-notification-item-${i}`}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{t('notifications.newInstance')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('notifications.instanceDeployed', { name: 'api-gateway' })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Control */}
            <div className="hidden md:block" data-testid="header-font-size-control">
              <FontSizeControl />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.toggleTheme')}
              className="hover:bg-background/80"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              data-testid="header-theme-toggle"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('common.toggleTheme')}</span>
            </Button>

            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-background/80"
                  data-testid="header-user-menu-button"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage
                      src="https://ui-avatars.com/api/?name=User&background=random"
                      alt={t('common.user')}
                      data-testid="header-user-avatar"
                    />
                    <AvatarFallback
                      className="gradient-blue"
                      data-testid="header-user-avatar-fallback"
                    >
                      DO
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="glass w-56"
                align="end"
                forceMount
                data-testid="header-user-dropdown"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" data-testid="header-user-name">
                      Admin User
                    </p>
                    <p
                      className="text-xs leading-none text-muted-foreground"
                      data-testid="header-user-email"
                    >
                      admin@dataocean.io
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-secondary/50 focus:bg-secondary/50"
                  data-testid="header-profile-option"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('user.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-secondary/50 focus:bg-secondary/50"
                  onClick={openModal}
                  data-testid="header-pat-option"
                >
                  <Key className="mr-2 h-4 w-4" />
                  <span>{t('user.accessToken')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-secondary/50 focus:bg-secondary/50"
                  data-testid="header-logout-option"
                >
                  {t('user.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
