'use client';

import {
  FeltEyebrow,
  FeltStat,
  FeltStatGroup,
} from '@components/game/felt/felt-stage';
import { cn } from '@lib/utils';
import { motion, useReducedMotion } from 'motion/react';

/** Shared spacing for game actions and summaries, directly on the felt. */

export interface HubFact {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface HubShellProps {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  facts?: HubFact[];
  children?: React.ReactNode;
  /** The quiet line under the buttons. */
  footnote?: React.ReactNode;
  className?: string;
}

export const HubShell: React.FC<HubShellProps> = ({
  eyebrow,
  title,
  description,
  facts,
  children,
  footnote,
  className,
}) => (
  <section className={cn('py-3 text-left', className)}>
    {eyebrow && <FeltEyebrow size="xs">{eyebrow}</FeltEyebrow>}

    {title && (
      <h2 className="font-heading mt-1.5 text-xl leading-tight font-extrabold tracking-[-0.03em] text-balance">
        {title}
      </h2>
    )}

    {description && (
      <p className="text-on-media-muted-foreground mt-1 text-xs leading-relaxed">
        {description}
      </p>
    )}

    {!!facts?.length && (
      <FeltStatGroup
        className={cn(
          'border-on-media-hairline mb-4 border-y py-3 text-center',
          (title || description || eyebrow) && 'mt-4',
        )}
      >
        {facts.map((fact, index) => (
          <FeltStat key={index} label={fact.label} value={fact.value} />
        ))}
      </FeltStatGroup>
    )}

    {children && (
      <div className={cn(facts?.length ? '' : 'mt-4')}>{children}</div>
    )}

    {footnote && (
      <p className="text-on-media-muted-foreground mt-2.5 text-[0.65rem] leading-relaxed">
        {footnote}
      </p>
    )}
  </section>
);

/**
 * A panel swapping for another one.
 *
 * Keyed by the caller on whatever counts as "a different thing to do" — the
 * phase, or whose turn it is — so the change of state is something the player
 * sees happen rather than something they notice has already happened.
 */
export const HubTransition: React.FC<{
  transitionKey: string;
  children: React.ReactNode;
}> = ({ transitionKey, children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={transitionKey}
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

/** The buttons at the bottom of a panel, stacked full-width. */
export const HubStack: React.FC<React.ComponentProps<'div'>> = ({
  className,
  ...props
}) => <div className={cn('grid gap-2', className)} {...props} />;
