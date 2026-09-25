import { getServerLang } from '@lib/i18n/cookie';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = await getServerLang();

  return {
    locale,
    messages: (
      (await import(`./messages/${locale}.json`)) as {
        default: IntlMessages;
      }
    ).default,
  };
});
