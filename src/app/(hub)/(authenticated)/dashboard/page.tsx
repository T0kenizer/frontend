import { GameCTA } from '@components/dashboard/game-cta';
import { PageGreeting } from '@components/dashboard/page-greeting';
import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';

const Page: React.FC = () => (
  <Main>
    <Container>
      <PageGreeting />
      <GameCTA />
    </Container>
  </Main>
);

export default Page;
