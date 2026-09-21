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
import { requestConfirmationOptions } from '@services/account-confirmations/account-confirmations.options';
import { useMutation } from '@tanstack/react-query';
import { requestConfirmationDataSchema } from '@tokenizer/shared/schemas';
import { RequestConfirmationData } from '@tokenizer/shared/types';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

export type ResendConfirmationFormProps = Omit<
  React.ComponentProps<'form'>,
  'onSubmit'
>;

export const ResendConfirmationForm: React.FC<ResendConfirmationFormProps> = ({
  ...props
}) => {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<RequestConfirmationData>({
    resolver: zodResolver(requestConfirmationDataSchema),
    defaultValues: { email: '' },
  });
  const { mutate: requestConfirmation, isPending } = useMutation(
    requestConfirmationOptions(),
  );

  const email = useWatch({ control: form.control, name: 'email' });
  const isIncomplete = !email;

  const handleSubmit = (data: RequestConfirmationData) => {
    if (isPending) return;

    requestConfirmation(data, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => applyServerError(form, error),
    });
  };

  if (submitted) {
    return (
      <p className="text-muted-foreground text-sm leading-relaxed">
        If an unconfirmed account exists for this email, you will receive a new
        confirmation link shortly.
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate {...props}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="resend-confirmation-email">Email</FieldLabel>
              <EmailInput
                {...field}
                id="resend-confirmation-email"
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
          Send confirmation link
        </Button>
      </FieldGroup>
    </form>
  );
};
