import { billlooprMessages } from './billloopr.mjs';
import { rosterslateMessages } from './rosterslate.mjs';
import { siteMessages } from './site.mjs';

export function getMessages(locale) {
  const safeLocale = Object.hasOwn(siteMessages, locale) ? locale : 'en';
  return {
    site: siteMessages[safeLocale],
    billloopr: billlooprMessages[safeLocale],
    rosterslate: rosterslateMessages[safeLocale],
  };
}
