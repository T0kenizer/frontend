import { AvatarUpload } from '@components/settings/avatar-upload';
import { ProfileForm } from '@components/settings/forms/profile-form';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsRow } from '@components/settings/settings-row';
import { SettingsSection } from '@components/settings/settings-section';

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
