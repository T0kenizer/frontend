'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@lib/utils';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
        /**
         * Sunken segmented control: the raised, rounded thumb reads as a
         * two-way switch rather than a strip of tabs. Used to flip between sign
         * in and sign up without leaving the panel.
         */
        pill: 'bg-surface-sunk border-border relative w-full rounded-full border p-1 group-data-horizontal/tabs:h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground',
        'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        'group-data-[variant=pill]/tabs-list:z-10 group-data-[variant=pill]/tabs-list:h-full group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:font-semibold group-data-[variant=pill]/tabs-list:hover:no-underline',
        /* The active face is painted by `TabsThumb`, which slides between triggers. */
        'group-data-[variant=pill]/tabs-list:data-active:bg-transparent dark:group-data-[variant=pill]/tabs-list:data-active:border-transparent dark:group-data-[variant=pill]/tabs-list:data-active:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

type ThumbRect = {
  left: number;
  width: number;
};

/**
 * Radix marks the selected trigger with `data-state`; Tailwind's `data-active`
 * variant reads that for us in class names, but a DOM query has to ask for it
 * by hand. The bare attribute is matched too, for triggers driven by markup
 * rather than by the primitive.
 */
const ACTIVE_TRIGGER =
  '[data-slot="tabs-trigger"][data-state="active"],[data-slot="tabs-trigger"][data-active]';

/**
 * Sliding face for the active trigger, for lists that read as a switch rather
 * than a strip — drop it as the first child of a `pill` `TabsList`.
 *
 * It follows whichever trigger carries `data-active` by measuring the DOM, so
 * it works with triggers of unequal width and with a controlled `Tabs` whose
 * value is driven from outside (a route, say). Nothing moves until it has a
 * measurement, so the first paint lands in place instead of animating in.
 */
function TabsThumb({
  className,
  style,
  ...props
}: React.ComponentProps<'span'>) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [rect, setRect] = React.useState<Nullable<ThumbRect>>(null);

  React.useLayoutEffect(() => {
    const list = ref.current?.parentElement;

    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>(ACTIVE_TRIGGER);

      setRect(
        active ? { left: active.offsetLeft, width: active.offsetWidth } : null,
      );
    };

    measure();

    // Width follows the triggers; position follows which one is active.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(list);
    for (const trigger of list.querySelectorAll('[data-slot="tabs-trigger"]'))
      resizeObserver.observe(trigger);

    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'data-active'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <span
      ref={ref}
      data-slot="tabs-thumb"
      aria-hidden
      className={cn(
        'bg-card pointer-events-none absolute inset-y-1 left-0 rounded-full shadow-sm transition-[transform,width] duration-300 ease-[cubic-bezier(0.5,1.4,0.5,1)] motion-reduce:transition-none',
        !rect && 'opacity-0',
        className,
      )}
      style={{
        width: rect?.width ?? 0,
        transform: `translateX(${rect?.left ?? 0}px)`,
        ...style,
      }}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  TabsList,
  tabsListVariants,
  TabsThumb,
  TabsTrigger,
};
