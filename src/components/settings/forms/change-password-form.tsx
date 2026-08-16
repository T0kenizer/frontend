'use client';

import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { PasswordInput } from '@components/ui/input/password-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { partialUpdateUserOptions } from '@services/users/users.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { partialUpdateUserDataSchema } from '@tokenizer/shared/schemas';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = partialUpdateUserDataSchema
  .extend({
    confirmPassword: partialUpdateUserDataSchema.shape.password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });

type FormData = z.infer<typeof schema>;

export const ChangePasswordForm: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const { mutate: changePassword, isPending } = useMutation(
    partialUpdateUserOptions(),
  );

  const [password, confirmPassword] = form.watch([
    'password',
    'confirmPassword',
  ]);
  const isIncomplete = !password || !confirmPassword;

  const handleSubmit = (data: FormData) => {
    if (isPending || !user) return;

    changePassword(
      {
        uuid: user.uuid,
        data: {
          password: data.password,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success('Your password has been changed');
        },
        onError: (error) => applyServerError(form, error),
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="change-password">New password</FieldLabel>
              <PasswordInput
                {...field}
                id="change-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="change-password-confirm-password">
                Confirm new password
              </FieldLabel>
              <PasswordInput
                {...field}
                id="change-password-confirm-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          type="submit"
          disabled={isPending || isIncomplete}
          className="w-full"
        >
          Change password
        </Button>
      </FieldGroup>
    </form>
  );
};
