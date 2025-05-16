// components/layout/header.tsx
'use client';

import { Bell, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';

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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { setTheme, theme } = useTheme();

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      data-testid="header-container"
    >
      <div className="flex h-16 items-center px-4">
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

        <div className="flex items-center gap-2 md:hidden" data-testid="header-logo-mobile">
          <div className="gradient-blue flex h-8 w-8 items-center justify-center rounded-md shadow-lg">
            <span className="text-primary-foreground font-bold">DO</span>
          </div>
          <span className="text-lg font-bold">DataOcean</span>
        </div>

        <div className="flex flex-1 items-center gap-4 md:ml-auto md:justify-end">
          <form className="hidden w-full max-w-sm items-center space-x-2 md:flex" data-testid="header-search-form">
            <div className="relative w-full">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full border-border/50 bg-secondary/50 pl-8 focus-visible:ring-primary/30"
                data-testid="header-search-input"
              />
            </div>
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-background/80"
                data-testid="header-notifications-button"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-primary p-0" data-testid="header-notifications-badge">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass w-80" data-testid="header-notifications-dropdown">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto" data-testid="header-notifications-list">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem
                    key={i}
                    className="cursor-pointer p-4 hover:bg-secondary/50 focus:bg-secondary/50"
                    data-testid={`header-notification-item-${i}`}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">New instance deployed</p>
                      <p className="text-muted-foreground text-sm">
                        Instance "api-gateway" was successfully deployed to production
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="mr-2 hover:bg-background/80"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            data-testid="header-theme-toggle"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

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
                    alt="User"
                    data-testid="header-user-avatar"
                  />
                  <AvatarFallback className="gradient-blue" data-testid="header-user-avatar-fallback">DO</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass w-56" align="end" forceMount data-testid="header-user-dropdown">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none" data-testid="header-user-name">Admin User</p>
                  <p className="text-muted-foreground text-xs leading-none" data-testid="header-user-email">admin@dataocean.io</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-secondary/50 focus:bg-secondary/50" data-testid="header-profile-option">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-secondary/50 focus:bg-secondary/50" data-testid="header-logout-option">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
