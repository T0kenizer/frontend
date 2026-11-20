'use client';

import {
  FeltBadge,
  type FeltBadgeProps,
} from '@components/game/felt/felt-stage';
import { STREET_LABELS } from '@constants/games';
import { cn } from '@lib/utils';
import { Street } from '@tokenizer/shared/types';

export type HandStage = Street | 'showdown';

type StageStyle = { accent: string; board: number };

const STAGES: Record<HandStage, StageStyle> = {
  [Street.Preflop]: { accent: 'rgb(255 255 255 / 0.92)', board: 0 },
  [Street.Flop]: { accent: 'oklch(0.80 0.10 225)', board: 3 },
  [Street.Turn]: { accent: 'oklch(0.76 0.13 320)', board: 4 },
  [Street.River]: { accent: 'oklch(0.74 0.17 22)', board: 5 },
  showdown: { accent: 'oklch(0.24 0.04 60)', board: 5 },
};

const STAGE_LABELS: Record<HandStage, string> = {
  ...STREET_LABELS,
  showdown: 'Showdown',
};

export type StreetBadgeProps = Omit<FeltBadgeProps, 'tone' | 'children'> & {
  stage: HandStage;
  /** Shows the five board cards. Defaults to true. */
  showBoard?: boolean;
};

export const StreetBadge: React.FC<StreetBadgeProps> = ({
  stage,
  showBoard = true,
  className,
  style,
  ...props
}) => {
  const { accent, board } = STAGES[stage];
  const isShowdown = stage === 'showdown';

  return (
    <FeltBadge
      data-stage={stage}
      tone="active"
      aria-live="polite"
      style={{ '--stage': accent, ...style } as React.CSSProperties}
      className={cn(
        'inline-flex h-7.5 items-center gap-2.25 rounded-full',
        showBoard ? 'pr-3.25 pl-2.75' : 'px-3.25',
        'text-[11px] font-extrabold tracking-[0.12em] uppercase',
        'border border-white/15 bg-black/35 text-white',
        'transition-[background-color,color,border-color] duration-300 motion-reduce:transition-none',
        isShowdown &&
          'animate-showdown border-transparent bg-[oklch(0.80_0.16_80)] text-[oklch(0.24_0.04_60)] motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      {showBoard && (
        <span aria-hidden className="flex gap-0.75">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${i * 60}ms` }}
              className={cn(
                'h-2.5 w-1.75 rounded-xs border transition-colors duration-200 motion-reduce:transition-none',
                i < board
                  ? 'border-(--stage) bg-(--stage)'
                  : 'border-white/30 bg-transparent',
              )}
            />
          ))}
        </span>
      )}
      <span className={isShowdown ? undefined : 'text-(--stage)'}>
        {STAGE_LABELS[stage]}
      </span>
    </FeltBadge>
  );
};
