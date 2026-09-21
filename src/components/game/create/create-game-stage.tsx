import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Label } from '@components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
import { cn } from '@lib/utils';
import * as React from 'react';

/**
 * Controls on the felt.
 *
 * The `/game` tree is a table rather than a page, so its surface has no theme
 * to borrow from: every control on it is dressed from the `on-media` family
 * instead. These are the recipes the creation form uses, kept in one place so a
 * row, a seat and a blind never drift apart.
 */
export const FELT_INPUT =
  'border-on-media-border bg-on-media-scrim text-on-media-foreground placeholder:text-on-media-muted-foreground focus-visible:border-warning focus-visible:ring-warning/25';

export const FELT_SWITCH =
  'data-checked:bg-success data-unchecked:bg-on-media-hover';

export const FELT_SEGMENT =
  'border-on-media-hairline bg-on-media-scrim max-w-full flex-wrap border p-[3px]';

export const FELT_SEGMENT_ITEM =
  'text-on-media-muted-foreground hover:bg-on-media-film hover:text-on-media-foreground data-[state=on]:bg-white-95 data-[state=on]:text-felt-inverse-foreground';

export type CreateGameSectionProps = React.ComponentPropsWithoutRef<'div'> & {
  title: React.ReactNode;
  /** The running count in the corner — how many seats, how many blinds. */
  meta?: React.ReactNode;
};

/** One block of the form: a heading and the rows under it. */
export const CreateGameSection: React.FC<CreateGameSectionProps> = ({
  title,
  meta,
  children,
  className,
  ...props
}) => (
  <Card
    variant="felt"
    size="lg"
    className={cn('rounded-2xl', className)}
    {...props}
  >
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {meta && (
        <CardAction className="text-on-media-muted-foreground text-xs">
          {meta}
        </CardAction>
      )}
    </CardHeader>
    <CardContent className="divide-on-media-hairline flex flex-col divide-y">
      {children}
    </CardContent>
  </Card>
);

export type CreateGameRowProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  label: React.ReactNode;
  /** The sentence under the label that says what the setting decides. */
  hint?: React.ReactNode;
  /** Set when the row holds a single field, so the label points at it. */
  htmlFor?: string;
  children: React.ReactNode;
};

/**
 * A setting: what it is called on the left, what it is set with on the right.
 * The two stack on a narrow screen rather than squeezing, because a label that
 * wraps to three lines is no longer a label.
 */
export const CreateGameRow: React.FC<CreateGameRowProps> = ({
  label,
  hint,
  htmlFor,
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      'grid items-start gap-2 py-3.5 sm:grid-cols-[minmax(8rem,11.5rem)_minmax(0,1fr)] sm:gap-5',
      className,
    )}
    {...props}
  >
    <div className="sm:pt-1.5">
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="text-xs font-semibold">
          {label}
        </Label>
      ) : (
        <span className="block text-xs font-semibold">{label}</span>
      )}
      {hint && (
        <span className="text-on-media-muted-foreground mt-1 block text-xs leading-relaxed">
          {hint}
        </span>
      )}
    </div>
    <div className="flex min-w-0 flex-col items-start gap-2.5">{children}</div>
  </div>
);

export type CreateGameHintProps = React.ComponentPropsWithoutRef<'p'>;

/** The line under a control that says what the chosen option means. */
export const CreateGameHint: React.FC<CreateGameHintProps> = ({
  className,
  ...props
}) => (
  <p
    className={cn(
      'text-on-media-muted-foreground text-xs leading-relaxed',
      className,
    )}
    {...props}
  />
);

export type CreateGameSwitchLineProps = {
  children: React.ReactNode;
  /** What the switch is doing right now, not what it is called. */
  label: React.ReactNode;
};

/** A switch and the words that say what it is doing right now. */
export const CreateGameSwitchLine: React.FC<CreateGameSwitchLineProps> = ({
  children,
  label,
}) => (
  <div className="flex items-center gap-2.5">
    {children}
    <span className="text-on-media-muted-foreground text-xs">{label}</span>
  </div>
);

export interface CreateGameSegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** An option the runtime does not honour yet; shown so it is not a surprise. */
  disabled?: boolean;
}

export interface CreateGameSegmentProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly CreateGameSegmentOption<T>[];
  /** Names the group for a screen reader — the row label reads it aloud. */
  label: string;
}

/**
 * The choice between a handful of named options, laid out as one strip.
 *
 * Deliberately not a dropdown: every one of these settings changes how the
 * table plays, so they are worth the width it costs to show them all at once.
 * Deselecting is refused — a strip always has exactly one option chosen.
 */
export function CreateGameSegment<T extends string>({
  value,
  onValueChange,
  options,
  label,
}: CreateGameSegmentProps<T>) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      value={value}
      aria-label={label}
      onValueChange={(next) => next && onValueChange(next as T)}
      className={FELT_SEGMENT}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={FELT_SEGMENT_ITEM}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
