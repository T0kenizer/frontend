'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { useSignOut } from '@services/sessions/sessions.hooks';
import { SerializedUser } from '@tokenizer/shared/types';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const useUserAvatar = (user: Nullish<SerializedUser>) => {
  const t = useTranslations('UserMenu');

  return {
    src: user?.avatarUrl ?? undefined,
    alt: user?.displayName
      ? t('avatarAlt', { name: user.displayName })
      : t('guestAvatarAlt'),
  };
};

export type UserMenuIdentityProps = React.ComponentProps<'div'> & {
  user: SerializedUser;
};

export const UserMenuIdentity: React.FC<UserMenuIdentityProps> = ({
  user,
  className,
  ...props
}) => {
  const avatar = useUserAvatar(user);

  return (
    <div
      className={cn('flex items-center gap-2 text-left text-sm', className)}
      {...props}
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={avatar.src} alt={avatar.alt} />
        <AvatarFallback />
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.displayName}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  );
};

export type UserMenuProps = Pick<
  React.ComponentProps<typeof DropdownMenuContent>,
  'side' | 'align' | 'sideOffset' | 'className'
> & {
  user?: SerializedUser;
  children: React.ReactNode;
};

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  children,
  className,
  side,
  align = 'end',
  sideOffset = 4,
}) => {
  const t = useTranslations('UserMenu');
  const { signOut: handleSignOut } = useSignOut();

  if (!user) return children;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('min-w-56 rounded-lg', className)}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <UserMenuIdentity user={user} className="px-1 py-1.5" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.dashboard()}>
            <LayoutDashboard />
            {t('dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.settings.profile()}>
            <Settings />
            {t('settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
