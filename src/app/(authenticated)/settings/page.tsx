import { Main } from '@components/layout';
import { SettingsPage } from '@components/settings/settings-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

const Page: React.FC = () => (
  <Main>
    <SettingsPage />
  </Main>
);

export default Page;
