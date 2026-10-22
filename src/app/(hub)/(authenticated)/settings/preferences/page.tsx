import { LangSwitcher } from '@components/lang/lang-switcher';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SettingsRow } from '@components/settings/settings-row';
import { SettingsSection } from '@components/settings/settings-section';
import { ThemeSwitcher } from '@components/theme/theme-switcher';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.preferences');

  return { title: t('metaTitle') };
};

const Page: React.FC = async () => {
  const t = await getTranslations('Settings.preferences');

  return (
    <SettingsTabContainer>
      <SettingsSection title={t('appearance')}>
        <SettingsRow label={t('language')} hint={t('languageHint')}>
          <LangSwitcher />
        </SettingsRow>
        <SettingsRow label={t('theme')} hint={t('themeHint')}>
          <ThemeSwitcher />
        </SettingsRow>
      </SettingsSection>
    </SettingsTabContainer>
  );
};

export default Page;
