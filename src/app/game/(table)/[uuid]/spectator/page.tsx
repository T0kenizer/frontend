import { SpectatorRoom } from '@components/game/spectator-room';

export const metadata = {
  title: 'Spectator',
};

interface SpectatorPageProps {
  params: Promise<{ uuid: string }>;
}

const SpectatorPage = async ({ params }: SpectatorPageProps) => {
  const { uuid } = await params;

  return <SpectatorRoom gameId={uuid} />;
};

export default SpectatorPage;
