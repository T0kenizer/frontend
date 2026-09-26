'use client';

import {
  UserMenu,
  UserMenuProps,
  useUserAvatar,
} from '@components/layout/user-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { ChipsGroup } from '@components/ui/chips-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter as UISidebarFooter,
  useSidebar,
} from '@components/ui/sidebar';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { SerializedUser } from '@tokenizer/shared/types';
import { LogIn, Play, Plus, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export interface SidebarFooterProps {
  user?: SerializedUser;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ user }) => {
  const t = useTranslations('Sidebar');
  const { isMobile, setOpenMobile } = useSidebar();
  const avatar = useUserAvatar(user);

  const close = () => setOpenMobile(false);

  return (
    <UISidebarFooter className="space-y-2">
      {isMobile && (
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-3">
            {user ? (
              <>
                <Button size="sm" asChild>
                  <Link href={ROUTES.game.new()} onClick={close}>
                    <Plus />
                    {t('newGame')}
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={ROUTES.game.join()}>
                    <Play />
                    {t('join')}
                  </Link>
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href={ROUTES.game.join()} onClick={close}>
                  <Play />
                  {t('join')}
                </Link>
              </Button>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          {user ? (
            <UserMenu
              user={user}
              side={isMobile ? 'bottom' : 'right'}
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                  <AvatarFallback />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.displayName}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </SidebarMenuButton>
            </UserMenu>
          ) : (
            <GuestMenu
              side={isMobile ? 'bottom' : 'right'}
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                  <AvatarFallback />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {t('guest.name')}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {t('guest.status')}
                  </span>
                </div>
              </SidebarMenuButton>
            </GuestMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </UISidebarFooter>
  );
};

type GuestMenuProps = Omit<UserMenuProps, 'user'>;

const GuestMenu: React.FC<GuestMenuProps> = ({
  children,
  className,
  side,
  align = 'end',
  sideOffset = 4,
}) => {
  const t = useTranslations('Sidebar.guest');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('min-w-56 rounded-lg', className)}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="bg-muted rounded-sm border font-normal">
          <ChipsGroup denominations={[25, 100, 500]} />
          <span className="mt-2 block text-sm font-bold">{t('title')}</span>
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {t('description')}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.auth.signUp()}>
            <UserPlus />
            {t('signUp')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.auth.signIn()}>
            <LogIn />
            {t('signIn')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
