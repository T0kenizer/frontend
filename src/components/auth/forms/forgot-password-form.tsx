'use client';

import { EmailInput } from '@components/inputs/email-input';
import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { requestResetOptions } from '@services/password-resets/password-resets.options';
import { useMutation } from '@tanstack/react-query';
import { requestResetDataSchema } from '@tokenizer/shared/schemas';
import { RequestResetData } from '@tokenizer/shared/types';
import { Controller, useForm, useWatch } from 'react-hook-form';

export type ForgotPasswordFormProps = Omit<
  React.ComponentProps<'form'>,
  'onSubmit'
> & {
  /** Prefilled when coming back from the mail screen to fix a typo. */
  defaultEmail?: string;
  onSent: (email: string) => void;
};

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  defaultEmail = '',
  onSent,
  ...props
}) => {
  const form = useForm<RequestResetData>({
    resolver: zodResolver(requestResetDataSchema),
    defaultValues: { email: defaultEmail },
  });
  const { mutate: requestReset, isPending } = useMutation(
    requestResetOptions(),
  );

  const email = useWatch({ control: form.control, name: 'email' });
  const isIncomplete = !email;

  const handleSubmit = (data: RequestResetData) => {
    if (isPending) return;

    /* The caller never learns whether the address was on file — the API does
       not say, and saying would enumerate accounts. */
    requestReset(data, {
      onSuccess: () => onSent(data.email),
      onError: (error) => applyServerError(form, error),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate {...props}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <EmailInput
                {...field}
                id="forgot-email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          type="submit"
          size="lg"
          loading={isPending}
          disabled={isPending || isIncomplete}
          className="mt-1 h-11 w-full text-[0.9375rem]"
        >
          Send reset link
        </Button>
      </FieldGroup>
    </form>
  );
};
