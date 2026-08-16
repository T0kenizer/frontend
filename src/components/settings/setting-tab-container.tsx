import { cn } from '@lib/utils';

type SettingsTabContainerProps = React.ComponentProps<'div'>;

export const SettingsTabContainer: React.FC<SettingsTabContainerProps> = ({
  className,
  ...props
}) => <div className={cn('space-y-8 p-6', className)} {...props} />;
