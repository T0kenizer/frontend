'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { formatAmount, toAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { PokerAction, type LegalAction } from '@tokenizer/shared/types';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

/**
 * Your move.
 *
 * The one panel in the app that is genuinely urgent — a room full of people is
 * waiting on it — so it states whose decision it is before it states anything
 * else, and puts the legal moves within a thumb's reach of the bottom of the
 * screen.
 *
 * It renders exactly the moves the server called legal, at exactly the sizes it
 * called legal. Nothing here works out whether a check is available or how
 * small a raise may be: that is the hand's business, it already decided, and a
 * client that guesses alongside it is a client that eventually offers a button
 * the server then refuses.
 */

/** Whether a move needs a number, or comes at one price. */
const isSized = (action: LegalAction) =>
  action.min !== undefined &&
  action.max !== undefined &&
  action.min !== action.max;

const isFree = (action: LegalAction) => action.min === undefined;

export interface HubTurnProps {
  view: PokerTableView;
  actions: TableActions;
}

export const HubTurn: React.FC<HubTurnProps> = ({ view, actions }) => {
  const { legalActions, proxySeat, mySeat, pot, toCall, streetLabel } = view;

  // The host covering an empty chair spends that chair's stack, not their own.
  const actingSeat = proxySeat ?? mySeat;

  // Naming the seat is what makes the move legal server-side: without it the
  // host's action would be read as one for their own chair, and refused
  // because it is not their turn.
  const target = proxySeat?.id;

  const [picked, setPicked] = useState<Nullable<LegalAction>>(null);

  // A new set of legal moves means the turn moved on; a half-typed raise from
  // the turn before must not survive into it. Adjusted during render rather
  // than in an effect, so the stale amount never gets a frame on screen.
  const legalIds = legalActions
    .map((action) => `${action.action}:${action.min}-${action.max}`)
    .join(',');
  const [seenLegalIds, setSeenLegalIds] = useState(legalIds);
  if (seenLegalIds !== legalIds) {
    setSeenLegalIds(legalIds);
    setPicked(null);
  }

  const eyebrow = proxySeat ? 'Playing an empty chair' : 'Your turn';
  const title = proxySeat ? `Seat ${proxySeat.seatIndex + 1}` : 'Your move';
  const description = proxySeat
    ? 'Nobody claimed this chair, so you play it for the table.'
    : undefined;

  return (
    <HubShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        { label: 'To call', value: toCall ? formatAmount(toCall) : '—' },
        {
          label: proxySeat ? 'Chair' : 'Your stack',
          value: formatAmount(actingSeat?.balance ?? 0),
        },
      ]}
      footnote={streetLabel ? `${streetLabel} betting` : undefined}
      className={cn(
        // A live turn is worth an outline you can see from across a table.
        'ring-warning/45 ring-3',
      )}
    >
      {actions.error && (
        <FeltNotice tone="error" className="mb-3 text-left">
          {actions.error}
        </FeltNotice>
      )}

      <HubStack className="grid-cols-2">
        {legalActions.map((action, index) => (
          <Button
            key={action.action}
            // Filled for the one-tap moves that commit nothing, outlined for
            // the ones that cost chips or drop you out of the hand — so the
            // safe move is the one your thumb finds without reading.
            variant={
              action.action === PokerAction.Check ? 'felt-inverse' : 'line'
            }
            size="lg"
            loading={actions.pending === action.action}
            aria-pressed={picked?.action === action.action}
            className={cn(
              'w-full',
              picked?.action === action.action && 'ring-warning ring-3',
              // An odd number of moves leaves the last one spanning the row
              // rather than sitting in a half-empty one.
              legalActions.length % 2 === 1 &&
                index === legalActions.length - 1 &&
                'col-span-2',
            )}
            onClick={() => {
              if (isSized(action)) {
                setPicked((current) =>
                  current?.action === action.action ? null : action,
                );
                return;
              }
              setPicked(null);
              // A move at one price carries it; the server would work the
              // same number out, and sending it keeps the two agreeing.
              actions.submitAction(action.action, action.min, target);
            }}
          >
            {isFree(action)
              ? action.label
              : `${action.label} ${formatAmount(isSized(action) ? action.min! : action.min!)}`}
          </Button>
        ))}
      </HubStack>

      <AnimatePresence initial={false}>
        {picked && (
          <AmountStep
            key={picked.action}
            action={picked}
            pending={actions.pending === picked.action}
            onConfirm={(amount) => {
              actions.submitAction(picked.action, amount, target);
              setPicked(null);
            }}
            onCancel={() => setPicked(null)}
          />
        )}
      </AnimatePresence>

      {!legalActions.length && (
        <p className="text-on-media-muted-foreground text-xs">
          No move is available to you right now.
        </p>
      )}
    </HubShell>
  );
};

/**
 * How much, for the moves that take a number.
 *
 * Bounded by the server's own `min`/`max` rather than by the stack: under pot
 * limit and fixed limit the most that may go in is well short of what is in
 * front of the player, and a slider that let them past it would only be
 * offering a move about to be refused.
 */
const AmountStep: React.FC<{
  action: LegalAction;
  pending: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}> = ({ action, pending, onConfirm, onCancel }) => {
  const reduceMotion = useReducedMotion();
  const min = action.min!;
  const max = action.max!;
  const [amount, setAmount] = useState(min);

  // A minimum, the middle, and the lot: the three sizes people actually pick,
  // without anyone doing arithmetic at a table with a drink in their hand.
  const presets = [
    { label: 'Min', value: min },
    { label: 'Half', value: Math.floor((min + max) / 2) },
    { label: max === min ? 'Max' : 'Max', value: max },
  ].filter(
    (preset, index, all) =>
      preset.value >= min &&
      preset.value <= max &&
      all.findIndex((other) => other.value === preset.value) === index,
  );

  const isValid = amount >= min && amount <= max;

  return (
    <motion.div
      className="mt-3 overflow-hidden text-left"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
    >
      <div className="border-on-media-hairline grid gap-2 border-t pt-3">
        <label
          htmlFor="turn-amount"
          className="text-on-media-muted-foreground text-[0.625rem] font-bold tracking-[0.09em] uppercase"
        >
          {action.label} to — {formatAmount(min)} to {formatAmount(max)}
        </label>

        <Input
          id="turn-amount"
          inputMode="numeric"
          autoFocus
          variant="felt"
          size="xl"
          value={amount ? formatAmount(amount) : ''}
          placeholder={String(min)}
          aria-invalid={!isValid || undefined}
          onChange={(event) =>
            setAmount(Math.min(toAmount(event.target.value), max))
          }
          className="text-center text-base font-extrabold tabular-nums"
        />

        <div className="flex gap-1.5">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="line"
              size="sm"
              className="flex-1"
              onClick={() => setAmount(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="line"
            size="lg"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="felt-inverse"
            size="lg"
            className="flex-2"
            loading={pending}
            disabled={!isValid}
            onClick={() => onConfirm(amount)}
          >
            {isValid ? `${action.label} ${formatAmount(amount)}` : action.label}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
