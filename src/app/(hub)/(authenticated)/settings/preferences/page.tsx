import { LangSwitcher } from '@components/lang/lang-switcher';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsRow } from '@components/settings/settings-row';
import { SettingsSection } from '@components/settings/settings-section';
import { ThemeSwitcher } from '@components/theme/theme-switcher';
import { APP_NAME } from '@constants/index';

const Page: React.FC = () => (
  <SettingsTabContainer>
    <SettingsSection
      title="Appearance"
      description={`How ${APP_NAME} looks on this device. Saved in this browser, not on your account.`}
    >
      <SettingsRow label="Language" hint="Applies to this browser.">
        <LangSwitcher />
      </SettingsRow>
      <SettingsRow
        label="Theme"
        hint="System follows your device's light or dark setting."
      >
        <ThemeSwitcher />
      </SettingsRow>
    </SettingsSection>
  </SettingsTabContainer>
);

export default Page;
