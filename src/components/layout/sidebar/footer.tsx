'use client';

import { SidebarUserMenu } from '@components/layout/sidebar/user-menu';
import { Button } from '@components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter as UISidebarFooter,
  useSidebar,
} from '@components/ui/sidebar';
import { SerializedUser } from '@tokenizer/shared/types';
import { Play, Plus } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export interface SidebarFooterProps {
  user?: SerializedUser;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ user }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const close = () => setOpenMobile(false);

  return (
    <UISidebarFooter className="space-y-2">
      {isMobile && (
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-3">
            {user ? (
              <>
                <Button size="sm" asChild>
                  <Link href="#" onClick={close}>
                    <Plus />
                    New Game
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="#" onClick={close}>
                    <Play />
                    Join
                  </Link>
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="#" onClick={close}>
                  <Play />
                  Join
                </Link>
              </Button>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarUserMenu user={user} />
    </UISidebarFooter>
  );
};
