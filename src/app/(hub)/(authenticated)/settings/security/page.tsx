import { DeleteAccountDialog } from '@components/settings/dialogs/delete-account-dialog';
import { ChangePasswordForm } from '@components/settings/forms/change-password-form';
import { SessionsList } from '@components/settings/sessions-list';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsSection } from '@components/settings/settings-section';
import { Button } from '@components/ui/button';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.security');

  return { title: t('metaTitle') };
};

const Page: React.FC = async () => {
  const t = await getTranslations('Settings.security');

  return (
    <SettingsTabContainer>
      <SettingsSection title={t('password.title')}>
        <ChangePasswordForm />
      </SettingsSection>
      <SettingsSection
        title={t('sessions.title')}
        description={t('sessions.description')}
      >
        <SessionsList />
      </SettingsSection>
      <SettingsSection
        variant="danger"
        title={t('deleteAccount.title')}
        description={t('deleteAccount.description')}
      >
        <div className="pt-4">
          <DeleteAccountDialog>
            <Button variant="destructive">{t('deleteAccount.action')}</Button>
          </DeleteAccountDialog>
        </div>
      </SettingsSection>
    </SettingsTabContainer>
  );
};

export default Page;
