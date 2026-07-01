'use client';

import { InputProps } from '@components/ui/input';
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from '@components/ui/input-group';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';

export type PasswordInputProps = Omit<InputProps, 'type' | 'autoComplete'>;

export const PasswordInput: React.FC<InputProps> = (props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <InputGroup>
      <InputGroupInput
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        {...props}
      />
      <InputGroupButton onClick={handleTogglePassword}>
        {showPassword ? <Eye /> : <EyeClosed />}
      </InputGroupButton>
    </InputGroup>
  );
};
