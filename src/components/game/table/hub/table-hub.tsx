'use client';

import { HubFinished } from '@components/game/table/hub/hub-finished';
import { HubIntermission } from '@components/game/table/hub/hub-intermission';
import { HubLobby } from '@components/game/table/hub/hub-lobby';
import { HubTransition } from '@components/game/table/hub/hub-shell';
import { HubTurn } from '@components/game/table/hub/hub-turn';
import { HubWatch } from '@components/game/table/hub/hub-watch';
import type { TableActions } from '@components/game/table/table-actions';
import type { TableView } from '@components/game/table/use-table-view';
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

      case 'round':
        // The fork the whole screen turns on: a panel you act in, or a panel
        // that tells you what is being done to you.
        return view.canAct
          ? { key: 'turn', panel: <HubTurn view={view} actions={actions} /> }
          : { key: 'watch', panel: <HubWatch view={view} actions={actions} /> };

      case 'intermission':
        return {
          key: 'intermission',
          panel: <HubIntermission view={view} actions={actions} />,
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
