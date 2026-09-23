'use client';

import {
  FeltEyebrow,
  FeltPanel,
  FeltStat,
  FeltStatGroup,
} from '@components/game/felt/felt-stage';
import { cn } from '@lib/utils';
import { motion, useReducedMotion } from 'motion/react';

/**
 * The frame every centre panel is poured into.
 *
 * The middle of the table is the only place the game is ever _played_ from —
 * lobby, turn, wait, payout, the lot — and each of those is a different panel.
 * The frame they share is here so they differ only in what they ask of the
 * player, not in how wide they are or where their title sits. Without it the
 * panel visibly jumped a few pixels every time the state of play changed, which
 * on a table in the middle of a room reads as a glitch.
 */

export interface HubFact {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface HubShellProps {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
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
  <FeltPanel
    size="sm"
    className={cn('rounded-3xl px-5 py-5 text-center', className)}
  >
    <FeltEyebrow size="xs">{eyebrow}</FeltEyebrow>

    <h2 className="font-heading mt-1.5 text-lg leading-tight font-extrabold tracking-[-0.03em] text-balance">
      {title}
    </h2>

    {description && (
      <p className="text-on-media-muted-foreground mt-1 text-xs leading-relaxed">
        {description}
      </p>
    )}

    {!!facts?.length && (
      <FeltStatGroup className="border-on-media-hairline my-4 border-y py-3 text-center">
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
  </FeltPanel>
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
