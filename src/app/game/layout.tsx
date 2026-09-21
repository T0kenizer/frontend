export const metadata = {
  title: {
    template: `Game - %s`,
    default: 'Game',
  },
};

/**
 * The table shell. Everything under `/game` sits outside `(hub)` on purpose:
 * these screens are a table, not a page in the app, so they take the felt the
 * connection hero leads with instead of the themed page background.
 */
const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="felt-surface flex h-dvh w-full flex-col overflow-hidden">
    {children}
  </main>
);

export default GameLayout;
