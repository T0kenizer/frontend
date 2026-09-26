import { AvatarUpload } from '@components/settings/avatar-upload';
import { ProfileForm } from '@components/settings/forms/profile-form';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsRow } from '@components/settings/settings-row';
import { SettingsSection } from '@components/settings/settings-section';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.profile');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => (
  <SettingsTabContainer>
    <SettingsSection title="Profile">
      <SettingsRow label="Avatar">
        <AvatarUpload />
      </SettingsRow>
      <ProfileForm />
    </SettingsSection>
  </SettingsTabContainer>
);

export default Page;
