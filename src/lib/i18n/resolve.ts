import { ALLOWED_LANGS, DEFAULT_LANG, type Lang } from '@lib/i18n/langs';

export const primarySubtag = (tag: string): string =>
  tag.trim().toLowerCase().split('-')[0] ?? '';

export const parseLang = (value: Nullish<string>): Optional<Lang> => {
  if (!value) return undefined;

  const candidate = value.trim().toLowerCase();

  if (!candidate) return undefined;

  return (
    ALLOWED_LANGS.find((lang) => lang.toLowerCase() === candidate) ??
    ALLOWED_LANGS.find(
      (lang) => primarySubtag(lang) === primarySubtag(candidate),
    )
  );
};

export const parseAcceptLanguage = (
  header: Nullish<string>,
): Optional<Lang> => {
  if (!header) return undefined;

  const ranked = header
    .split(',')
    .map((range) => {
      const [tag = '', ...params] = range.trim().split(';');
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith('q='))
        ?.slice(2);

      return {
        tag: tag.trim(),
        quality: quality === undefined ? 1 : Number.parseFloat(quality),
      };
    })
    .filter(({ tag, quality }) => !!tag && quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const lang = parseLang(tag);

    if (lang) return lang;
  }

  return undefined;
};

export const resolveLang = (
  value: Nullish<string>,
  acceptLanguage?: Nullish<string>,
): Lang =>
  parseLang(value) ?? parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LANG;
