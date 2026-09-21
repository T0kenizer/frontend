import { cn } from '@lib/utils';

type SettingsTabContainerProps = React.ComponentProps<'div'>;

export const SettingsTabContainer: React.FC<SettingsTabContainerProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('@container/settings flex flex-col gap-4', className)}
    {...props}
  />
);
