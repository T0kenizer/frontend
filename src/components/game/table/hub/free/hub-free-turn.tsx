'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type {
  ActionOption,
  FreeTableView,
} from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { formatAmount, toAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { AmountForm } from '@tokenizer/shared/types';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

/**
 * Your move, at a table whose rules the host wrote.
 *
 * The poker panel next door asks the server how much a raise may be and draws
 * the answer; there is no such answer here. A free table declares its moves and
 * nothing else — the runtime never worked out a legal amount, so the only cap
 * this panel can honestly apply is the stack in front of the seat.
 *
 * What it does still refuse to do is invent the list: the moves drawn here are
 * exactly the ones the round called legal, which at a free table means exactly
 * the ones the host put in its catalog.
 */

export interface HubFreeTurnProps {
  view: FreeTableView;
  actions: TableActions;
}

export const HubFreeTurn: React.FC<HubFreeTurnProps> = ({ view, actions }) => {
  const { legalActions, interruptionOpen, proxySeat, mySeat, pot } = view;

  // The host covering an empty chair spends that chair's stack, not their own.
  const actingSeat = proxySeat ?? mySeat;

  // Naming the seat is what makes the move legal server-side: without it the
  // host's action would be read as one for their own chair, and refused
  // because it is not their turn.
  const target = proxySeat?.id;

  const [picked, setPicked] = useState<Nullable<ActionOption>>(null);

  // A new set of legal moves means the turn moved on; a half-typed raise from
  // the turn before must not survive into it. Adjusted during render rather
  // than in an effect, so the stale amount never gets a frame on screen.
  const legalIds = legalActions.map((action) => action.id).join(',');
  const [seenLegalIds, setSeenLegalIds] = useState(legalIds);
  if (seenLegalIds !== legalIds) {
    setSeenLegalIds(legalIds);
    setPicked(null);
  }

  return (
    <HubShell
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        {
          label: proxySeat ? 'Seat stack' : 'Your stack',
          value: formatAmount(actingSeat?.balance ?? 0),
        },
      ]}
      footnote={
        interruptionOpen ? 'First interrupting move takes the turn.' : undefined
      }
    >
      {actions.error && (
        <FeltNotice tone="error" className="mb-3 text-left">
          {actions.error}
        </FeltNotice>
      )}

      <HubStack className="grid-cols-2">
        {legalActions.map((action) => (
          <Button
            key={action.id}
            // Filled for the one-tap moves that commit nothing, outlined for
            // the ones that cost chips or drop you out of the round — so the
            // safe move is the one your thumb finds without reading.
            variant={
              action.amountForm === AmountForm.None && !action.foldsParticipant
                ? 'felt-inverse'
                : 'line'
            }
            size="lg"
            loading={actions.pending === action.id}
            aria-pressed={picked?.id === action.id}
            className={cn(
              'w-full',
              picked?.id === action.id && 'ring-warning ring-3',
              // An odd number of moves leaves the last one spanning the row
              // rather than sitting in a half-empty one.
              legalActions.length % 2 === 1 &&
                action.id === legalActions[legalActions.length - 1].id &&
                'col-span-2',
            )}
            onClick={() => {
              if (action.amountForm === AmountForm.None) {
                setPicked(null);
                actions.submitCatalogAction(action.id, undefined, target);
                return;
              }
              setPicked((current) =>
                current?.id === action.id ? null : action,
              );
            }}
          >
            {action.label}
          </Button>
        ))}
      </HubStack>

      <AnimatePresence initial={false}>
        {picked && (
          <AmountStep
            key={picked.id}
            action={picked}
            max={actingSeat?.balance ?? 0}
            pending={actions.pending === picked.id}
            onConfirm={(amount) => {
              actions.submitCatalogAction(picked.id, amount, target);
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

/** How much, for the moves that need a number. */
const AmountStep: React.FC<{
  action: ActionOption;
  max: number;
  pending: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}> = ({ action, max, pending, onConfirm, onCancel }) => {
  const reduceMotion = useReducedMotion();
  const [amount, setAmount] = useState(0);

  // Quarter, half, the lot: the three bets people actually make, without
  // anyone having to do arithmetic at a table with a drink in their hand.
  const presets = [
    { label: '¼', value: Math.floor(max / 4) },
    { label: '½', value: Math.floor(max / 2) },
    { label: 'All in', value: max },
  ].filter((preset) => preset.value > 0);

  const isValid = amount > 0 && amount <= max;

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
          {action.label} — how much?
        </label>

        <Input
          id="turn-amount"
          inputMode="numeric"
          autoFocus
          variant="felt"
          size="xl"
          value={amount ? formatAmount(amount) : ''}
          placeholder="0"
          aria-invalid={amount > max || undefined}
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
