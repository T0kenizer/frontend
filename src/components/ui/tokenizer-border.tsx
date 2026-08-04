'use client';

import { cn } from '@lib/utils';
import * as React from 'react';
import { useEffect, useState } from 'react';

export interface TokenizerBorderProps extends React.ComponentProps<'button'> {
  thickness?: number;
  rounded?: string;
  flip?: boolean;
}

export const TokenizerBorder: React.FC<TokenizerBorderProps> = ({
  thickness = 10,
  rounded = 'rounded-full',
  flip = false,
  className,
  children,
  ...props
}) => {
  const [flipped, setFlipped] = useState(!flip);

  useEffect(() => {
    if (!flip) return;
    requestAnimationFrame(() => setFlipped(true));
  }, [flip]);

  return (
    <div style={flip ? { perspective: '600px' } : undefined}>
      <button
        type="button"
        className={cn(
          'group relative cursor-pointer border',
          rounded,
          className,
        )}
        style={{
          padding: thickness,
          ...(flip && {
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }),
        }}
        {...props}
      >
        <div
          className={cn('tokenizer-chip-border absolute inset-0', rounded)}
        />
        <div className={cn('relative', rounded)}>{children}</div>
      </button>
    </div>
  );
};
