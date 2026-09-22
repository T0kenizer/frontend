'use client';

import {
  CreateGameHint,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { cn } from '@lib/utils';
import { listGameTemplatesOptions } from '@services/games/games.options';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';

export interface CreateGameTemplatesProps {
  selectedId: Nullable<string>;
  onSelect: (templateId: string) => void;
}

export const CreateGameTemplates: React.FC<CreateGameTemplatesProps> = ({
  selectedId,
  onSelect,
}) => {
  const { data: templates, isPending } = useQuery(listGameTemplatesOptions());

  return (
    <CreateGameSection
      title="The rules"
      meta={templates?.length ? `${templates.length} available` : undefined}
    >
      <div className="py-2">
        {isPending && (
          <CreateGameHint>Loading the available rule sets…</CreateGameHint>
        )}

        {templates?.length === 0 && (
          <CreateGameHint>No template is available right now.</CreateGameHint>
        )}

        <ul className="grid gap-2 sm:grid-cols-2">
          {templates?.map((template) => {
            const isSelected = template.id === selectedId;

            return (
              <li key={template.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(template.id)}
                  className={cn(
                    'border-on-media-hairline bg-on-media-scrim flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-warning bg-on-media-film'
                      : 'hover:bg-on-media-film',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-on-media-foreground text-sm font-bold">
                      {template.name}
                    </span>
                    {isSelected && (
                      <Check className="text-warning size-4 shrink-0" />
                    )}
                  </span>
                  <span className="text-on-media-muted-foreground text-xs leading-relaxed">
                    {template.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </CreateGameSection>
  );
};
