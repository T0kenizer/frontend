import { GameCTA } from '@components/home/game-cta';
import { PageGreeting } from '@components/home/page-greeting';
import { Main } from '@components/layout/main';

const Page: React.FC = () => (
  <Main>
    <PageGreeting />
    <GameCTA />
  </Main>
);

export default Page;
