import { SpectatorRoom } from '@components/game/spectator-room';

interface SpectatorPageProps {
  params: Promise<{ uuid: string }>;
}

const SpectatorPage: React.FC<SpectatorPageProps> = async ({ params }) => {
  const { uuid } = await params;

  return <SpectatorRoom gameId={uuid} />;
};

export default SpectatorPage;
