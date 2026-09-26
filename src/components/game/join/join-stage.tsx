import {
  FeltFootnote,
  FeltStage,
  FeltSteps,
} from '@components/game/felt/felt-stage';
import { Logo } from '@components/layout/logo/smart-logo';
import { cn } from '@lib/utils';

export const JOIN_STEPS = ['identify', 'seat', 'identity'] as const;

export type JoinStep = (typeof JOIN_STEPS)[number];

export type JoinStageProps = React.ComponentProps<'div'> & {
  step: JoinStep;
};

export const JoinStage: React.FC<JoinStageProps> = ({
  step,
  className,
  children,
  ...props
}) => (
  <FeltStage
    variant="focus"
    data-slot="join-stage"
    className={cn('gap-6', className)}
    {...props}
  >
    <Logo className="shrink-0 self-center" />

    <FeltSteps
      label="Join progress"
      total={JOIN_STEPS.length}
      current={JOIN_STEPS.indexOf(step) + 1}
    />

    <div className="flex flex-1 flex-col justify-center">{children}</div>

    <FeltFootnote className="shrink-0">
      No account needed to play a night.
    </FeltFootnote>
  </FeltStage>
);
