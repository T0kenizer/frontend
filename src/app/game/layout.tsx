export const metadata = {
  title: {
    template: `Game - %s`,
    default: 'Game',
  },
};

/**
 * The felt shell. Everything under `/game` sits outside `(hub)` on purpose:
 * these screens are a table, not a page in the app, so they take the felt the
 * connection hero leads with instead of the themed page background.
 *
 * Only `min-h-dvh` here, deliberately not `h-dvh overflow-hidden`: that hard
 * viewport lock belongs to the live table and the join flow, which must never
 * themselves become something you scroll to see the rest of. They opt into it
 * via `(table)/layout.tsx`. `/game/new` is a form, not a table — this is what
 * lets its own scroll live on the page instead of being trapped in a box the
 * size of one viewport.
 *
 * `self-start` matters as much as `min-h-dvh` does: `<body>` is a flex row
 * (it also seats the hub's sidebar) with a fixed `h-dvh`, and its default
 * stretch alignment would otherwise clamp `<main>` back to exactly one
 * viewport regardless of `min-h-dvh` — content taller than that would then
 * overflow past it, scrolling `<body>` while the felt background stayed one
 * viewport short of covering it.
 */
const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="felt-surface flex min-h-dvh w-full flex-col self-start">
    {children}
  </main>
);

export default GameLayout;
