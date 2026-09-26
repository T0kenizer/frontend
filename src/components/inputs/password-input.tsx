'use client';

import { InputProps } from '@components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@components/ui/input-group';
import { cn } from '@lib/utils';
import { Eye, EyeClosed, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export type PasswordInputProps = Omit<InputProps, 'type'> & {
  groupClassName?: string;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  groupClassName,
  className,
  ...props
}) => {
  const t = useTranslations('PasswordInput');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <InputGroup className={groupClassName}>
      <InputGroupAddon>
        <Lock />
      </InputGroupAddon>
      <InputGroupInput
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        className={cn('h-full', className)}
        placeholder="••••••••••••"
        {...props}
      />
      <InputGroupButton
        onClick={handleTogglePassword}
        aria-label={showPassword ? t('hide') : t('show')}
      >
        {showPassword ? <Eye /> : <EyeClosed />}
      </InputGroupButton>
    </InputGroup>
  );
};
