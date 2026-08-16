import { AvatarUpload } from '@components/settings/avatar-upload';
import { ProfileForm } from '@components/settings/forms/profile-form';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsSection } from '@components/settings/settings-section';

const Page: React.FC = () => (
  <SettingsTabContainer>
    <SettingsSection title="Profile">
      <AvatarUpload />
      <ProfileForm />
    </SettingsSection>
  </SettingsTabContainer>
);

export default Page;
