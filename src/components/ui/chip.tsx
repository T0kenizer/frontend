import Token1At128 from '@assets/images/chips/128/token-1.png';
import Token10At128 from '@assets/images/chips/128/token-10.png';
import Token100At128 from '@assets/images/chips/128/token-100.png';
import Token1kAt128 from '@assets/images/chips/128/token-1k.png';
import Token25At128 from '@assets/images/chips/128/token-25.png';
import Token5At128 from '@assets/images/chips/128/token-5.png';
import Token50At128 from '@assets/images/chips/128/token-50.png';
import Token500At128 from '@assets/images/chips/128/token-500.png';
import Token1At256 from '@assets/images/chips/256/token-1.png';
import Token10At256 from '@assets/images/chips/256/token-10.png';
import Token100At256 from '@assets/images/chips/256/token-100.png';
import Token1kAt256 from '@assets/images/chips/256/token-1k.png';
import Token25At256 from '@assets/images/chips/256/token-25.png';
import Token5At256 from '@assets/images/chips/256/token-5.png';
import Token50At256 from '@assets/images/chips/256/token-50.png';
import Token500At256 from '@assets/images/chips/256/token-500.png';
import Token1At512 from '@assets/images/chips/512/token-1.png';
import Token10At512 from '@assets/images/chips/512/token-10.png';
import Token100At512 from '@assets/images/chips/512/token-100.png';
import Token1kAt512 from '@assets/images/chips/512/token-1k.png';
import Token25At512 from '@assets/images/chips/512/token-25.png';
import Token5At512 from '@assets/images/chips/512/token-5.png';
import Token50At512 from '@assets/images/chips/512/token-50.png';
import Token500At512 from '@assets/images/chips/512/token-500.png';
import Token1At64 from '@assets/images/chips/64/token-1.png';
import Token10At64 from '@assets/images/chips/64/token-10.png';
import Token100At64 from '@assets/images/chips/64/token-100.png';
import Token1kAt64 from '@assets/images/chips/64/token-1k.png';
import Token25At64 from '@assets/images/chips/64/token-25.png';
import Token5At64 from '@assets/images/chips/64/token-5.png';
import Token50At64 from '@assets/images/chips/64/token-50.png';
import Token500At64 from '@assets/images/chips/64/token-500.png';
import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Image, { type StaticImageData } from 'next/image';
import * as React from 'react';

export const CHIP_DENOMINATIONS = [1, 5, 10, 25, 50, 100, 500, '1k'] as const;

export type ChipDenomination = (typeof CHIP_DENOMINATIONS)[number];

export const CHIP_SIZES = [32, 48, 64, 128, 256, 512] as const;

export type ChipSize = (typeof CHIP_SIZES)[number];

export const CHIP_IMAGES: Record<
  ChipDenomination,
  Record<ChipSize, StaticImageData>
> = {
  1: {
    32: Token1At64,
    48: Token1At64,
    64: Token1At64,
    128: Token1At128,
    256: Token1At256,
    512: Token1At512,
  },
  5: {
    32: Token5At64,
    48: Token5At64,
    64: Token5At64,
    128: Token5At128,
    256: Token5At256,
    512: Token5At512,
  },
  10: {
    32: Token10At64,
    48: Token10At64,
    64: Token10At64,
    128: Token10At128,
    256: Token10At256,
    512: Token10At512,
  },
  25: {
    32: Token25At64,
    48: Token25At64,
    64: Token25At64,
    128: Token25At128,
    256: Token25At256,
    512: Token25At512,
  },
  50: {
    32: Token50At64,
    48: Token50At64,
    64: Token50At64,
    128: Token50At128,
    256: Token50At256,
    512: Token50At512,
  },
  100: {
    32: Token100At64,
    48: Token100At64,
    64: Token100At64,
    128: Token100At128,
    256: Token100At256,
    512: Token100At512,
  },
  500: {
    32: Token500At64,
    48: Token500At64,
    64: Token500At64,
    128: Token500At128,
    256: Token500At256,
    512: Token500At512,
  },
  '1k': {
    32: Token1kAt64,
    48: Token1kAt64,
    64: Token1kAt64,
    128: Token1kAt128,
    256: Token1kAt256,
    512: Token1kAt512,
  },
};

const DEFAULT_SIZE: ChipSize = 64;

export const chipVariants = cva('shrink-0 object-contain select-none', {
  variants: {
    size: {
      32: 'size-8',
      48: 'size-12',
      64: 'size-16',
      128: 'size-32',
      256: 'size-64',
      512: 'size-128',
    },
  },
  defaultVariants: {
    size: DEFAULT_SIZE,
  },
});

export interface ChipProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof Image>,
      'src' | 'alt' | 'width' | 'height'
    >,
    VariantProps<typeof chipVariants> {
  denomination?: ChipDenomination;
  alt?: string;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  denomination = 5,
  size,
  alt,
  ...props
}) => (
  <Image
    data-slot="chip"
    data-denomination={denomination}
    src={CHIP_IMAGES[denomination][size ?? DEFAULT_SIZE]}
    alt={alt ?? `${denomination} chip`}
    className={cn(chipVariants({ size }), className)}
    {...props}
  />
);
