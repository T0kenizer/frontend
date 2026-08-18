export const metadata = {
  title: {
    template: `Game - %s`,
    default: 'Game',
  },
};

const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="flex h-dvh w-full flex-col overflow-hidden">{children}</main>
);

export default GameLayout;
