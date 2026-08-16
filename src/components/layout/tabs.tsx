'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export const tabsVariants = cva('relative w-full', {
  variants: {
    variant: {
      default: 'overflow-x-auto border-b',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tabsTriggerVariants = cva(
  'flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground rounded-md px-3 py-2 text-sm font-medium hover:text-foreground data-active:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const tabsSliderVariants = cva(
  'pointer-events-none absolute transition-[transform,width] duration-200 ease-out motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default: 'bg-primary bottom-0 left-0 h-0.5 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TabsItem {
  id: string;
  label: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
  href: string;
  disabled?: boolean;
}

export interface TabsProps
  extends
    Omit<React.ComponentProps<'nav'>, 'children'>,
    VariantProps<typeof tabsVariants> {
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
  variant,
  className,
  ...props
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef(new Map<string, HTMLElement>());
  const [slider, setSlider] = useState<Nullable<Slider>>(null);

  const setTabRef = useCallback(
    (id: string) => (node: Nullable<HTMLElement>) => {
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
      data-variant={variant ?? 'default'}
      className={cn(tabsVariants({ variant }), className)}
      {...props}
    >
      <div
        ref={listRef}
        role="tablist"
        className="relative flex w-max items-end gap-1"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          const triggerClassName = tabsTriggerVariants({ variant });

          if (item.disabled)
            return (
              <span
                key={item.id}
                ref={setTabRef(item.id)}
                data-slot="tabs-trigger"
                role="tab"
                aria-selected={false}
                aria-disabled
                data-disabled
                className={triggerClassName}
              >
                {item.renderIcon(false)}
                {item.label}
              </span>
            );

          return (
            <Link
              key={item.id}
              ref={setTabRef(item.id)}
              href={item.href}
              data-slot="tabs-trigger"
              role="tab"
              aria-selected={isActive}
              data-active={isActive || undefined}
              className={triggerClassName}
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
            tabsSliderVariants({ variant }),
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
