import { InputProps } from '@components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import { cn } from '@lib/utils';
import { User } from 'lucide-react';

export type UsernameInputProps = Omit<InputProps, 'type'> & {
  groupClassName?: string;
};

export const UsernameInput: React.FC<UsernameInputProps> = ({
  groupClassName,
  className,
  ...props
}) => (
  <InputGroup className={groupClassName}>
    <InputGroupAddon>
      <User />
    </InputGroupAddon>
    <InputGroupInput
      type="text"
      autoComplete="username"
      placeholder="pocket_aces"
      className={cn('h-full', className)}
      {...props}
    />
  </InputGroup>
);
