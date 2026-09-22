/**
 * The felt itself never scrolls: a live table (or the seat picker joining
 * one) has to stay fully on screen, not be something you scroll to see the
 * rest of. `/game/new`, which is a form rather than a table, sits outside
 * this group on purpose so the page can scroll normally instead — see
 * `../layout.tsx`.
 */
const TableLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex h-dvh w-full flex-col overflow-hidden">{children}</div>
);

export default TableLayout;
