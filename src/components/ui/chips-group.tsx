import {
  Chip,
  type ChipDenomination,
  type ChipSize,
} from '@components/ui/chip';
import { cn } from '@lib/utils';
import { cva } from 'class-variance-authority';

const DEFAULT_SIZE: ChipSize = 32;
const DEFAULT_DENOMINATIONS: ChipDenomination[] = [25, 100, 500, '1k'];

export const chipsGroupVariants = cva('flex shrink-0 items-center', {
  variants: {
    size: {
      32: '-space-x-2',
      48: '-space-x-3',
      64: '-space-x-4',
      128: '-space-x-8',
      256: '-space-x-16',
      512: '-space-x-32',
    },
  },
});

export const chipsGroupStaggerVariants = cva('', {
  variants: {
    size: {
      32: 'translate-y-1',
      48: 'translate-y-1.5',
      64: 'translate-y-2',
      128: 'translate-y-4',
      256: 'translate-y-8',
      512: 'translate-y-16',
    },
  },
});

export interface ChipsGroupProps extends Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'children'
> {
  denominations?: readonly ChipDenomination[];
  size?: ChipSize;
  staggered?: boolean;
  chipClassName?: string;
}

export const ChipsGroup: React.FC<ChipsGroupProps> = ({
  denominations = DEFAULT_DENOMINATIONS,
  size = DEFAULT_SIZE,
  staggered = false,
  className,
  chipClassName,
  ...props
}) => {
  if (denominations.length === 0) return null;

  return (
    <span
      data-slot="chips-group"
      aria-hidden
      className={cn(chipsGroupVariants({ size }), className)}
      {...props}
    >
      {denominations.map((denomination, index) => (
        <Chip
          key={`${denomination}-${index}`}
          denomination={denomination}
          size={size}
          alt=""
          className={cn(
            staggered && index % 2 === 1 && chipsGroupStaggerVariants({ size }),
            chipClassName,
          )}
        />
      ))}
    </span>
  );
};
