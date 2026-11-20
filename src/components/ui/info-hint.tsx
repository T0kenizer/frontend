'use client';

import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  type TooltipProps,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { cn } from '@lib/utils';

export interface InfoHintProps
  extends React.ComponentProps<'button'>, TooltipProps {
  contentProps?: Omit<TooltipContentProps, 'children'>;
}

export const InfoHint: React.FC<InfoHintProps> = ({
  className,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  contentProps: { className: contentClassName, ...contentProps } = {},
  ...props
}) => (
  <Tooltip
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    delayDuration={delayDuration}
    disableHoverableContent={disableHoverableContent}
  >
    <TooltipTrigger asChild>
      <button
        type="button"
        data-slot="info-hint"
        className={cn(
          'text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 cursor-help rounded-full focus-visible:ring-2 focus-visible:outline-none [&>svg]:size-4',
          className,
        )}
        {...props}
      >
        <Info aria-hidden />
      </button>
    </TooltipTrigger>
    <TooltipContent className={cn('w-64', contentClassName)} {...contentProps}>
      {children}
    </TooltipContent>
  </Tooltip>
);
