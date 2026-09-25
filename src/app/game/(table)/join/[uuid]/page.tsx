import { JoinGame } from '@components/game/join-game';

interface JoinGameTablePageProps {
  params: Promise<{ uuid: string }>;
}

const JoinGameTablePage: React.FC<JoinGameTablePageProps> = async ({
  params,
}) => {
  const { uuid } = await params;

  return <JoinGame gameUuid={uuid} />;
};

export default JoinGameTablePage;
