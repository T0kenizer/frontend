'use client';

import { HubFreeIntermission } from '@components/game/table/hub/free/hub-free-intermission';
import { HubFreeTurn } from '@components/game/table/hub/free/hub-free-turn';
import { HubFreeWatch } from '@components/game/table/hub/free/hub-free-watch';
import { HubFinished } from '@components/game/table/hub/hub-finished';
import { HubIntermission } from '@components/game/table/hub/hub-intermission';
import { HubLobby } from '@components/game/table/hub/hub-lobby';
import { HubTransition } from '@components/game/table/hub/hub-shell';
import { HubShowdown } from '@components/game/table/hub/hub-showdown';
import { HubTurn } from '@components/game/table/hub/hub-turn';
import { HubWatch } from '@components/game/table/hub/hub-watch';
import type { TableActions } from '@components/game/table/table-actions';
import type { TableView } from '@components/game/table/use-table-view';
import { GameMode } from '@tokenizer/shared/types';
import { AnimatePresence } from 'motion/react';
import * as React from 'react';

/**
 * The middle of the table: whatever the game is asking of you right now.
 *
 * This is the whole of the screen's second half, and it holds every control the
 * table has. The ring around it draws people; this draws decisions. Keeping
 * them apart is what lets a turn change swap this panel out entirely without
 * the chairs so much as blinking — and it is also what stops the question "what
 * can I do" from being answered in nine places around the felt.
 *
 * All this component itself decides is _which_ panel. Each panel then decides
 * what to offer, and {@link TableActions} carries out whatever is chosen.
 *
 * Two of the five states are the game's own — the one you act in and the one
 * you watch — so the mode is read before the phase for those, and once only.
 * The lobby and the end of the night are the same screen whatever was played.
 */

export interface TableHubProps {
  view: TableView;
  actions: TableActions;
  tableName: string;
  /**
   * Takes the panel's place when the player is filling something in — claiming
   * a chair, changing their name. Deliberately a replacement rather than a
   * dialog over the top: on a phone the panel _is_ the screen, and a modal over
   * it would only hide the table it is about.
   */
  form?: Nullable<React.ReactNode>;
}

export const TableHub: React.FC<TableHubProps> = ({
  view,
  actions,
  tableName,
  form,
}) => {
  const { key, panel } = React.useMemo(() => {
    if (form) return { key: 'form', panel: form };

    switch (view.phase) {
      case 'lobby':
        return {
          key: 'lobby',
          panel: (
            <HubLobby view={view} actions={actions} tableName={tableName} />
          ),
        };

      case 'betting':
        // The fork the whole screen turns on: a panel you act in, or a panel
        // that tells you what is being done to you.
        if (view.mode === GameMode.Free) {
          return view.canAct
            ? {
                key: 'turn',
                panel: <HubFreeTurn view={view} actions={actions} />,
              }
            : {
                key: 'watch',
                panel: <HubFreeWatch view={view} actions={actions} />,
              };
        }
        return view.canAct
          ? { key: 'turn', panel: <HubTurn view={view} actions={actions} /> }
          : { key: 'watch', panel: <HubWatch view={view} /> };

      case 'showdown':
        // Poker's alone: a free round settles when the host says so, from the
        // panel it is still being played on.
        return view.mode === GameMode.Poker
          ? {
              key: 'showdown',
              panel: <HubShowdown view={view} actions={actions} />,
            }
          : {
              key: 'watch',
              panel: <HubFreeWatch view={view} actions={actions} />,
            };

      case 'intermission':
        return {
          key: 'intermission',
          panel:
            view.mode === GameMode.Free ? (
              <HubFreeIntermission view={view} actions={actions} />
            ) : (
              <HubIntermission view={view} actions={actions} />
            ),
        };

      case 'finished':
        return { key: 'finished', panel: <HubFinished view={view} /> };
    }
  }, [view, actions, tableName, form]);

  return (
    // `wait`, so the outgoing panel is gone before the next arrives: two glass
    // panels crossfading through each other over a dark felt reads as a smear.
    <AnimatePresence mode="wait" initial={false}>
      <HubTransition key={key} transitionKey={key}>
        {panel}
      </HubTransition>
    </AnimatePresence>
  );
};
