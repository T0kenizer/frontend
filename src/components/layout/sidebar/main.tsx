'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
  href: string;
  isActive?: (pathname: string) => boolean;
  isLocked?: boolean;
  items?: SidebarItem[];
}

export interface SidebarMainProps {
  items: SidebarSection[];
}

export const SidebarMain: React.FC<SidebarMainProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <>
      {items.map((group, groupIndex) => (
        <SidebarGroup key={groupIndex}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item, itemIndex) => {
                const isActive = item.isActive?.(pathname) ?? false;

                return item.items?.length ? (
                  <Collapsible
                    key={itemIndex}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={isActive}
                        >
                          {item.renderIcon(isActive)}
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem, subIndex) => {
                            const isSubActive =
                              subItem.isActive?.(pathname) ?? false;
                            return (
                              <SidebarMenuSubItem key={subIndex}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                >
                                  <Link href={subItem.href}>
                                    {subItem.renderIcon(isSubActive)}
                                    <span>{subItem.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={itemIndex}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                    >
                      <Link href={item.href}>
                        {item.renderIcon(isActive)}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};
