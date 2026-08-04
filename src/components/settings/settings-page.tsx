'use client';

import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { ChangePasswordForm } from './change-password-form';
import { DeleteAccountSection } from './delete-account-section';
import { UnlinkGoogleSection } from './unlink-google-section';
import { UpdateProfileForm } from './update-profile-form';

export const SettingsPage: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Profile</h2>
        <UpdateProfileForm user={user} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Password</h2>
        <ChangePasswordForm
          hasPassword={user.hasPassword}
          hasGoogleId={user.hasGoogleId}
        />
      </section>

      {user.hasGoogleId && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Google Account</h2>
          <UnlinkGoogleSection />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <DeleteAccountSection />
      </section>
    </div>
  );
};
