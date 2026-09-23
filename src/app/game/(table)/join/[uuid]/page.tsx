import { JoinGame } from '@components/game/join-game';

export const metadata = {
  title: 'Join game',
};

interface JoinGameTablePageProps {
  params: Promise<{ uuid: string }>;
}

/**
 * The join screen with the table already named — where a link, and the QR that
 * carries it, both land. The identification step is behind the visitor before
 * they arrive, so the flow opens on the seat picker.
 */
const JoinGameTablePage = async ({ params }: JoinGameTablePageProps) => {
  const { uuid } = await params;

  return <JoinGame gameUuid={uuid} />;
};

export default JoinGameTablePage;
