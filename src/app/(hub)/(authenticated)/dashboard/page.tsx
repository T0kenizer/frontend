import { GameCTA } from '@components/dashboard/game-cta';
import { PageGreeting } from '@components/dashboard/page-greeting';
import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Dashboard');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => (
  <Main>
    <Container>
      <PageGreeting />
      <GameCTA />
    </Container>
  </Main>
);

export default Page;
