import { DeleteAccountDialog } from '@components/settings/dialogs/delete-account-dialog';
import { ChangePasswordForm } from '@components/settings/forms/change-password-form';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsSection } from '@components/settings/settings-section';
import { Button } from '@components/ui/button';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.security');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => (
  <SettingsTabContainer>
    <SettingsSection title="Password">
      <ChangePasswordForm />
    </SettingsSection>
    <SettingsSection
      variant="danger"
      title="Delete account"
      description="Permanently delete your account and all associated data."
    >
      <div className="pt-4">
        <DeleteAccountDialog>
          <Button variant="destructive">Delete account</Button>
        </DeleteAccountDialog>
      </div>
    </SettingsSection>
  </SettingsTabContainer>
);

export default Page;
