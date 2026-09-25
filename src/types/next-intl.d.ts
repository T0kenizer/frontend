import type { Lang } from '@lib/i18n/langs';
import type messages from '@lib/i18n/messages/en-US.json';

declare global {
  type IntlMessages = typeof messages;
}

declare module 'next-intl' {
  interface AppConfig {
    Locale: Lang;
    Messages: IntlMessages;
  }
}
