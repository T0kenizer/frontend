const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="felt-surface flex min-h-dvh w-full flex-col self-start">
    {children}
  </main>
);

export default GameLayout;
