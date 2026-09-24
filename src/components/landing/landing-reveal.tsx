'use client';

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealTag = 'div' | 'ol' | 'ul' | 'li';

// The tags share every prop the reveals use, so typing them all as a div keeps
// the props simple without losing anything that matters here.
const TAGS: Record<RevealTag, typeof motion.div> = {
  div: motion.div,
  ol: motion.ol as typeof motion.div,
  ul: motion.ul as typeof motion.div,
  li: motion.li as typeof motion.div,
};

/**
 * Fades content up as it scrolls into view, once.
 *
 * With reduced motion the rise is dropped and only the fade remains, so the
 * page still eases in without anything moving across the screen.
 */

const itemVariants = (
  reduce: boolean,
  offset: number,
  delay = 0,
): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : offset },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: reduce ? 0.3 : 0.7, ease: EASE, delay },
  },
});

export type LandingRevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  offset?: number;
  /** Plays on mount rather than when scrolled into view — for the hero. */
  immediate?: boolean;
};

export const LandingReveal: React.FC<LandingRevealProps> = ({
  delay = 0,
  offset = 24,
  immediate = false,
  ...props
}) => {
  const reduce = !!useReducedMotion();

  return (
    <motion.div
      variants={itemVariants(reduce, offset, delay)}
      initial="hidden"
      {...(immediate
        ? { animate: 'shown' }
        : { whileInView: 'shown', viewport: { once: true, amount: 0.2 } })}
      {...props}
    />
  );
};

export type LandingRevealGroupProps = HTMLMotionProps<'div'> & {
  as?: RevealTag;
  stagger?: number;
  delay?: number;
  immediate?: boolean;
};

/** Staggers the `LandingRevealItem`s inside it. */
export const LandingRevealGroup: React.FC<LandingRevealGroupProps> = ({
  as = 'div',
  stagger = 0.1,
  delay = 0,
  immediate = false,
  ...props
}) => {
  const Component = TAGS[as];

  return (
    <Component
      variants={{
        hidden: {},
        shown: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      initial="hidden"
      {...(immediate
        ? { animate: 'shown' }
        : { whileInView: 'shown', viewport: { once: true, amount: 0.15 } })}
      {...props}
    />
  );
};

export type LandingRevealItemProps = HTMLMotionProps<'div'> & {
  as?: RevealTag;
  offset?: number;
};

export const LandingRevealItem: React.FC<LandingRevealItemProps> = ({
  as = 'div',
  offset = 24,
  ...props
}) => {
  const reduce = !!useReducedMotion();
  const Component = TAGS[as];

  return <Component variants={itemVariants(reduce, offset)} {...props} />;
};

export type LandingDrawnUnderlineProps = HTMLMotionProps<'span'> & {
  delay?: number;
};

/** A stroke that draws itself from left to right under a word. */
export const LandingDrawnUnderline: React.FC<LandingDrawnUnderlineProps> = ({
  delay = 0,
  ...props
}) => {
  const reduce = !!useReducedMotion();

  return (
    <motion.span
      aria-hidden
      initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
      animate={reduce ? { opacity: 1 } : { scaleX: 1 }}
      transition={{ duration: reduce ? 0.3 : 0.8, ease: EASE, delay }}
      style={{ originX: 0 }}
      {...props}
    />
  );
};
