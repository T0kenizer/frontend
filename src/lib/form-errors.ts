import { RequesterError } from '@lib/requester';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

const FALLBACK_MESSAGE = 'An unknown error occurred';

/**
 * Puts a failed submission where the user can act on it: a message the server
 * pinned to a field lands on that field, and anything else toasts.
 *
 * An unmapped error is about the attempt rather than about one input — the
 * credentials were refused, the account is locked, the API is down — so it has
 * no field to sit under and would only push the form around if it tried.
 */
export function applyServerError<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
): void {
  const data = error instanceof RequesterError ? error.data : undefined;
  const fields: Record<string, string> = data?.fields ?? {};
  const knownFields = Object.keys(form.getValues());

  let focused = false;
  for (const [name, message] of Object.entries(fields)) {
    if (!knownFields.includes(name)) continue;

    form.setError(
      name as Path<T>,
      { type: 'server', message },
      { shouldFocus: !focused },
    );
    focused = true;
  }

  if (focused) return;

  toast.error(
    data?.message ||
      (error instanceof Error && error.message) ||
      FALLBACK_MESSAGE,
  );
}
