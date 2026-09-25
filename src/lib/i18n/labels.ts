import type { Lang } from '@lib/i18n/langs';
import { primarySubtag } from '@lib/i18n/resolve';
import ISO6391 from 'iso-639-1';

const regionSubtag = (tag: string): Optional<string> =>
  tag.trim().split('-')[1]?.toUpperCase();

const regionName = (lang: Lang): Optional<string> => {
  const region = regionSubtag(lang);

  if (!region) return undefined;

  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(region);
  } catch {
    return region;
  }
};

export const langName = (lang: Lang): string =>
  ISO6391.getName(primarySubtag(lang));

export const langNativeName = (lang: Lang): string =>
  ISO6391.getNativeName(primarySubtag(lang));

export const langLabel = (lang: Lang): string => {
  const name = langNativeName(lang) || langName(lang);
  const region = regionName(lang);

  return region ? `${name} (${region})` : name;
};
