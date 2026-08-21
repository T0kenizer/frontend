import { DeleteAccountDialog } from '@components/settings/dialogs/delete-account-dialog';
import { ChangePasswordForm } from '@components/settings/forms/change-password-form';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsSection } from '@components/settings/settings-section';
import { Button } from '@components/ui/button';

const Page: React.FC = () => (
  <SettingsTabContainer>
    <SettingsSection title="Password">
      <ChangePasswordForm />
    </SettingsSection>
    <SettingsSection
      title="Delete account"
      description="Permanently delete your account and all associated data."
    >
      <DeleteAccountDialog>
        <Button variant="destructive">Delete account</Button>
      </DeleteAccountDialog>
    </SettingsSection>
  </SettingsTabContainer>
);

export default Page;
