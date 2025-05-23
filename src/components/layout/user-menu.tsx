// components/layout/user-menu.tsx
'use client';

import { LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-testid="user-menu-button"
          variant="ghost"
          className="relative h-8 w-8 rounded-full hover:bg-background/80"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
            <AvatarFallback className="gradient-blue">DO</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent data-testid="user-menu-dropdown" align="end" className="glass w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p data-testid="user-menu-username" className="text-sm font-medium leading-none">
              Admin User
            </p>
            <p data-testid="user-menu-email" className="text-xs leading-none text-muted-foreground">
              admin@dataocean.io
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="hover:bg-secondary/50 focus:bg-secondary/50">
            <Link
              href="/profile"
              className="flex w-full cursor-pointer"
              data-testid="user-menu-profile-link"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-secondary/50 focus:bg-secondary/50">
            <Link
              href="/profile/settings"
              className="flex w-full cursor-pointer"
              data-testid="user-menu-settings-link"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="user-menu-logout-button"
          className="hover:bg-secondary/50 focus:bg-secondary/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
