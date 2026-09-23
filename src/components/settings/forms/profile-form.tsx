'use client';

import { EmailInput } from '@components/inputs/email-input';
import { UsernameInput } from '@components/inputs/username-input';
import { EmailConfirmationNotice } from '@components/settings/email-confirmation-notice';
import { SettingsRow } from '@components/settings/settings-row';
import { useSettingsSaveBar } from '@components/settings/settings-save-bar';
import { Field, FieldError } from '@components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { partialUpdateUserOptions } from '@services/users/users.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { partialUpdateUserDataSchema } from '@tokenizer/shared/schemas';
import { PartialUpdateUserData } from '@tokenizer/shared/types';
import { User } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type FormData = z.infer<typeof partialUpdateUserDataSchema>;

const DISCARD_DIRTY = { keepDirtyValues: false } as const;

export const ProfileForm: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const values: FormData = useMemo(
    () => ({
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
    }),
    [user?.displayName, user?.email],
  );

  const form = useForm<FormData>({
    resolver: zodResolver(partialUpdateUserDataSchema),
    values,
    resetOptions: { keepDirtyValues: true },
  });
  const { mutate: partialUpdateUser, isPending } = useMutation(
    partialUpdateUserOptions(),
  );

  const handleSubmit = (data: FormData) => {
    if (isPending || !user) return;

    const { dirtyFields } = form.formState;
    const payload: PartialUpdateUserData = {};

    if (dirtyFields.displayName) payload.displayName = data.displayName;
    if (dirtyFields.email) payload.email = data.email;

    if (Object.keys(payload).length === 0) return;

    partialUpdateUser(
      { uuid: user.uuid, data: payload },
      {
        onSuccess: () => {
          form.reset(data, DISCARD_DIRTY);
          toast.success(
            payload.email !== undefined
              ? 'Profile updated — check your inbox to confirm your new email address'
              : 'Profile updated',
          );
        },
        onError: (error) => applyServerError(form, error),
      },
    );
  };

  useSettingsSaveBar({
    dirtyCount: Object.keys(form.formState.dirtyFields).length,
    isPending,
    onSave: form.handleSubmit(handleSubmit),
    onReset: () => form.reset(values, DISCARD_DIRTY),
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
      <SettingsRow label="Username" htmlFor="profile-username">
        <UsernameInput
          id="profile-username"
          value={user?.username ?? ''}
          groupClassName="max-w-sm"
          disabled
        />
      </SettingsRow>
      <Controller
        name="displayName"
        control={form.control}
        render={({ field, fieldState }) => (
          <SettingsRow label="Display name" htmlFor="profile-display-name">
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <InputGroup className="max-w-sm">
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  value={field.value ?? ''}
                  id="profile-display-name"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  placeholder={user?.displayName ?? ''}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          </SettingsRow>
        )}
      />
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <SettingsRow label="Email" htmlFor="profile-email">
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <EmailInput
                {...field}
                id="profile-email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                groupClassName="max-w-sm"
                placeholder={user?.email ?? ''}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <EmailConfirmationNotice />
            </Field>
          </SettingsRow>
        )}
      />
    </form>
  );
};
