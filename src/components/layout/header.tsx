'use client';

import { cn } from '@lib/utils';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const getScrollParent = (element: Nullable<HTMLElement>): HTMLElement | Window => {
  let parent = element?.parentElement ?? null;

  while (parent && parent !== document.body) {
    const { overflowY } = getComputedStyle(parent);

    if (overflowY === 'auto' || overflowY === 'scroll') return parent;

    parent = parent.parentElement;
  }

  return window;
};

export type HeaderContext = {
  scrolled: boolean;
};

const HeaderContext = createContext<HeaderContext>({ scrolled: false });

export const useHeader = () => useContext(HeaderContext);

export type HeaderProps = React.ComponentProps<'header'>;

export const Header: React.FC<HeaderProps> = ({
  className,
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scroller = getScrollParent(ref.current);

    const onScroll = () => {
      const offset =
        scroller === window
          ? window.scrollY
          : (scroller as HTMLElement).scrollTop;

      setScrolled(offset > 0);
    };

    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });

    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const value = useMemo<HeaderContext>(() => ({ scrolled }), [scrolled]);

  return (
    <HeaderContext.Provider value={value}>
      <header
        ref={ref}
        data-slot="header"
        data-scrolled={scrolled || undefined}
        className={cn('sticky top-0 z-10', className)}
        {...props}
      >
        {children}
      </header>
    </HeaderContext.Provider>
  );
};
