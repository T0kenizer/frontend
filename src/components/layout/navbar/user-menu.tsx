'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import ROUTES from '@constants/routes';
import { useSignOut } from '@services/sessions/sessions.hooks';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';
import { SerializedUser } from '@tokenizer/shared/types';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export interface UserMenuProps {
  user: SerializedUser;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const { signOut: handleSignOut } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer flex-row items-center gap-2 [&[data-state=open]>svg]:rotate-180">
        <Avatar size="lg">
          <AvatarImage src={user.avatarUrl ?? ''} alt="User Avatar" />
          <AvatarFallback />
        </Avatar>
        <ChevronDown className="transition-transform" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/">Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {ADMIN_ROLES.includes(user.role) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.admin()}>Admin</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
