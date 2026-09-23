'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

/** Slack, in pixels, for a scroll position that still counts as "at the edge". */
const EDGE_THRESHOLD = 1;

interface ScrollEdges {
  start: boolean;
  end: boolean;
}

const NO_EDGES: ScrollEdges = { start: false, end: false };

export const scrollFadeVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'overflow-x-auto',
      vertical: 'overflow-y-auto',
    },
    /** How far the content has faded out by the time it reaches the edge. */
    size: {
      /**
       * Barely a softening: for tight rails where a wide fade would eat a whole
       * item.
       */
      sm: '[--scroll-fade:0.75rem]',
      default: '[--scroll-fade:1.5rem]',
      /**
       * For roomy panes, where the fade has to survive being scrolled past
       * quickly.
       */
      lg: '[--scroll-fade:3rem]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'default',
  },
});

/**
 * Fades out the half-visible content rather than painting a gradient over it,
 * so the component works on any background. Only the sides that can actually be
 * scrolled towards are faded.
 */
const buildMaskImage = (
  { start, end }: ScrollEdges,
  isVertical: boolean,
): Optional<string> => {
  if (!start && !end) return undefined;

  const stops = [
    start ? 'transparent 0' : '#000 0',
    '#000 var(--scroll-fade)',
    '#000 calc(100% - var(--scroll-fade))',
    end ? 'transparent 100%' : '#000 100%',
  ];

  return `linear-gradient(to ${isVertical ? 'bottom' : 'right'}, ${stops.join(', ')})`;
};

export interface ScrollFadeProps
  extends
    React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof scrollFadeVariants> {
  /** Merge onto the child element instead of rendering a wrapper. */
  asChild?: boolean;
}

/**
 * Scroller that fades its edges while there is more to scroll to, hinting that
 * the content runs past what is on screen. The `size` variant sets the fade
 * width, which `--scroll-fade` can also override directly.
 */
export const ScrollFade: React.FC<ScrollFadeProps> = ({
  className,
  style,
  orientation = 'horizontal',
  size,
  asChild = false,
  ...props
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState<ScrollEdges>(NO_EDGES);
  const isVertical = orientation === 'vertical';

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const position = isVertical ? element.scrollTop : element.scrollLeft;
      const overflow = isVertical
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;

      const next: ScrollEdges = {
        start: position > EDGE_THRESHOLD,
        end: position < overflow - EDGE_THRESHOLD,
      };

      setEdges((previous) =>
        previous.start === next.start && previous.end === next.end
          ? previous
          : next,
      );
    };

    element.addEventListener('scroll', update, { passive: true });

    // Observing the children too: the scroller keeps its size when its content
    // grows or shrinks. `observe` fires once on its own, which seeds the state.
    const resizeObserver = new ResizeObserver(update);
    const observe = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(element);
      for (const child of Array.from(element.children))
        resizeObserver.observe(child);
    };

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(element, { childList: true });

    return () => {
      element.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isVertical]);

  const maskImage = React.useMemo(
    () => buildMaskImage(edges, isVertical),
    [edges, isVertical],
  );
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      ref={ref}
      data-slot="scroll-fade"
      data-orientation={orientation}
      data-scroll-start={edges.start || undefined}
      data-scroll-end={edges.end || undefined}
      className={cn(scrollFadeVariants({ orientation, size }), className)}
      style={{ ...style, maskImage, WebkitMaskImage: maskImage }}
      {...props}
    />
  );
};
