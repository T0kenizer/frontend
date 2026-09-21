import { GameCTA } from '@components/home/game-cta';
import { PageGreeting } from '@components/home/page-greeting';
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
