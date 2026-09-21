import { GameRoom } from '@components/game/game-room';

interface GamePageProps {
  params: Promise<{ uuid: string }>;
}

const GamePage = async ({ params }: GamePageProps) => {
  const { uuid } = await params;

  return <GameRoom gameId={uuid} />;
};

export default GamePage;
