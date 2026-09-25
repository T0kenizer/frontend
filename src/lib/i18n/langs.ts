import type { LanguageCode } from 'iso-639-1';

export type LocaleTag = LanguageCode | `${LanguageCode}-${string}`;

export const ALLOWED_LANGS = [
  'fr-FR',
  'en-US',
] as const satisfies readonly LocaleTag[];

export type Lang = (typeof ALLOWED_LANGS)[number];

export const DEFAULT_LANG: Lang = 'en-US';
