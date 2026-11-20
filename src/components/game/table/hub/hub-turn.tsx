'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { Button, type ButtonProps } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { formatAmount, toAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { PokerAction, type LegalAction } from '@tokenizer/shared/types';
import { Coins } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

const isSized = (action: LegalAction) =>
  action.min !== undefined &&
  action.max !== undefined &&
  action.min !== action.max;

const isFree = (action: LegalAction) => action.min === undefined;

const isRaise = (action: LegalAction) => action.action === PokerAction.Raise;

const verbOf = (action: LegalAction) =>
  isRaise(action) ? `${action.label} to` : action.label;

const variantOf = (action: LegalAction): ButtonProps['variant'] => {
  if (action.action === PokerAction.Check) return 'gold';
  return 'line';
};

const shownAmount = (action: LegalAction, total: number, committed: number) =>
  isRaise(action) ? total : Math.max(0, total - committed);

export interface HubTurnProps {
  view: PokerTableView;
  actions: TableActions;
}

/** The pot, on its own line: the one number every seat is playing for. */
const PotLine: React.FC<{ amount: number }> = ({ amount }) => (
  <dl className="bg-on-media-scrim flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left">
    <Coins
      aria-hidden
      className="text-on-media-muted-foreground size-4 shrink-0"
    />
    <dt className="text-on-media-muted-foreground text-[0.6rem] font-bold tracking-[0.09em] uppercase">
      Pot
    </dt>
    <dd className="ml-auto text-lg font-extrabold tabular-nums">
      {formatAmount(amount)}
    </dd>
  </dl>
);

export const HubTurn: React.FC<HubTurnProps> = ({ view, actions }) => {
  const { legalActions, proxySeat, mySeat, pot, currentBet, committed } = view;

  const actingSeat = proxySeat ?? mySeat;

  const target = proxySeat?.id;

  const [picked, setPicked] = useState<Nullable<LegalAction>>(null);

  const legalIds = legalActions
    .map((action) => `${action.action}:${action.min}-${action.max}`)
    .join(',');
  const [seenLegalIds, setSeenLegalIds] = useState(legalIds);
  if (seenLegalIds !== legalIds) {
    setSeenLegalIds(legalIds);
    setPicked(null);
  }

  return (
    <HubShell
      lead={<PotLine amount={pot} />}
      // Totals for the street, side by side: what this seat has in, what it
      // must reach to stay. What it costs to get there is on the Call button.
      facts={[
        {
          label: proxySeat ? 'Seat bet' : 'Your bet',
          value: formatAmount(committed),
        },
        { label: 'Current bet', value: formatAmount(currentBet) },
        {
          label: proxySeat ? 'Seat stack' : 'Your stack',
          value: formatAmount(actingSeat?.balance ?? 0),
        },
      ]}
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
            variant={variantOf(action)}
            size="lg"
            loading={actions.pending === action.action}
            aria-pressed={picked?.action === action.action}
            className={cn(
              'w-full',
              picked?.action === action.action && 'ring-warning ring-3',
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
              actions.submitAction(action.action, action.min, target);
            }}
          >
            {isFree(action)
              ? action.label
              : `${verbOf(action)} ${formatAmount(shownAmount(action, action.min!, committed))}`}
          </Button>
        ))}
      </HubStack>

      <AnimatePresence initial={false}>
        {picked && (
          <AmountStep
            key={picked.action}
            action={picked}
            committed={committed}
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

const AmountStep: React.FC<{
  action: LegalAction;
  committed: number;
  pending: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}> = ({ action, committed, pending, onConfirm, onCancel }) => {
  const reduceMotion = useReducedMotion();
  const min = action.min!;
  const max = action.max!;
  const [amount, setAmount] = useState(min);
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
          {verbOf(action)} — {formatAmount(min)} to {formatAmount(max)}
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

        {isValid && committed > 0 && (
          <p className="text-on-media-muted-foreground text-center text-xs tabular-nums">
            {formatAmount(amount - committed)} from your stack
          </p>
        )}

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
            variant="gold"
            size="lg"
            className="flex-2"
            loading={pending}
            disabled={!isValid}
            onClick={() => onConfirm(amount)}
          >
            {isValid
              ? `${verbOf(action)} ${formatAmount(shownAmount(action, amount, committed))}`
              : action.label}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
