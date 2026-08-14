'use client';

import { cn } from '@lib/utils';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export interface TabsItem {
  id: string;
  label: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
  href: string;
}

export interface TabsProps extends Omit<
  React.ComponentProps<'nav'>,
  'children'
> {
  activeId: string;
  items: TabsItem[];
}

type Slider = {
  left: number;
  width: number;
};

export const Tabs: React.FC<TabsProps> = ({
  activeId,
  items,
  className,
  ...props
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef(new Map<string, HTMLAnchorElement>());
  const [slider, setSlider] = useState<Slider | null>(null);

  const setTabRef = useCallback(
    (id: string) => (node: HTMLAnchorElement | null) => {
      if (node) tabsRef.current.set(id, node);
      else tabsRef.current.delete(id);
    },
    [],
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    const tab = tabsRef.current.get(activeId);

    if (!list || !tab) return setSlider(null);

    setSlider({
      left: tab.offsetLeft - list.offsetLeft,
      width: tab.offsetWidth,
    });
  }, [activeId]);

  useLayoutEffect(measure, [measure, items]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const observer = new ResizeObserver(measure);

    observer.observe(list);
    for (const tab of tabsRef.current.values()) observer.observe(tab);

    return () => observer.disconnect();
  }, [measure, items]);

  return (
    <nav
      data-slot="tabs"
      className={cn('relative w-full overflow-x-auto border-b', className)}
      {...props}
    >
      <div
        ref={listRef}
        role="tablist"
        className="relative flex w-max items-end gap-1"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Link
              key={item.id}
              ref={setTabRef(item.id)}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              data-active={isActive || undefined}
              className={cn(
                'text-muted-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                'hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
                'data-active:text-foreground',
              )}
            >
              {item.renderIcon(isActive)}
              {item.label}
            </Link>
          );
        })}

        <div
          data-slot="tabs-slider"
          aria-hidden
          className={cn(
            'bg-primary pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full',
            'transition-[transform,width] duration-200 ease-out',
            !slider && 'opacity-0',
          )}
          style={{
            width: slider?.width ?? 0,
            transform: `translateX(${slider?.left ?? 0}px)`,
          }}
        />
      </div>
    </nav>
  );
};
