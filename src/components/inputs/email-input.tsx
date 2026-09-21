import { InputProps } from '@components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import { cn } from '@lib/utils';
import { Mail } from 'lucide-react';

export type EmailInputProps = Omit<InputProps, 'type'> & {
  groupClassName?: string;
};

export const EmailInput: React.FC<EmailInputProps> = ({
  groupClassName,
  className,
  ...props
}) => (
  <InputGroup className={groupClassName}>
    <InputGroupAddon>
      <Mail />
    </InputGroupAddon>
    <InputGroupInput
      type="email"
      autoComplete="email"
      placeholder="you@example.com"
      className={cn('h-full', className)}
      {...props}
    />
  </InputGroup>
);
