import { SUPPORTED_LOCALES, localizedPath } from '../i18n/languages.mjs';

const routePaths = ['/', '/apps/', '/about/', '/writing/', '/writing/self-introduction/', '/billloopr/', '/billloopr/privacy/', '/billloopr/support/', '/rosterslate/', '/rosterslate/privacy/', '/rosterslate/support/'];

export function GET() {
  const body = routePaths
    .flatMap((path) => SUPPORTED_LOCALES.map((locale) => `https://www.mrfung.cn${localizedPath(locale, path)}`))
    .join('\n');
  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
