export const SUPPORTED_LOCALES = Object.freeze([
  'en',
  'zh-Hans',
  'zh-Hant',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR',
  'it',
  'ru',
  'ar',
]);

const languageRows = [
  ['en', 'English', 'ltr'],
  ['zh-Hans', '简体中文', 'ltr'],
  ['zh-Hant', '繁體中文', 'ltr'],
  ['ja', '日本語', 'ltr'],
  ['ko', '한국어', 'ltr'],
  ['es', 'Español', 'ltr'],
  ['fr', 'Français', 'ltr'],
  ['de', 'Deutsch', 'ltr'],
  ['pt-BR', 'Português (Brasil)', 'ltr'],
  ['it', 'Italiano', 'ltr'],
  ['ru', 'Русский', 'ltr'],
  ['ar', 'العربية', 'rtl'],
];

export const LANGUAGES = Object.freeze(
  languageRows.map(([code, nativeName, dir]) =>
    Object.freeze({ code, nativeName, dir })
  )
);

export const DEFAULT_LOCALE = 'en';

export function normalizeLocale(value) {
  if (!value || typeof value !== 'string') return null;

  const tag = value.replaceAll('_', '-');
  if (SUPPORTED_LOCALES.includes(tag)) return tag;

  const lowerTag = tag.toLowerCase();
  if (/^zh-(tw|hk|mo|hant)/.test(lowerTag)) return 'zh-Hant';
  if (lowerTag.startsWith('zh')) return 'zh-Hans';
  if (lowerTag.startsWith('pt')) return 'pt-BR';

  return (
    SUPPORTED_LOCALES.find((locale) =>
      lowerTag.startsWith(locale.toLowerCase())
    ) ?? null
  );
}

export function resolvePreferredLocale(values = [], saved = null) {
  const savedLocale = normalizeLocale(saved);
  if (savedLocale) return savedLocale;

  return values.map(normalizeLocale).find(Boolean) ?? DEFAULT_LOCALE;
}

export function localizedPath(locale, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift();

  const suffix = segments.length ? `${segments.join('/')}/` : '';
  return `/${locale}/${suffix}`;
}

export function getStaticLocalePaths() {
  return SUPPORTED_LOCALES.map((locale) => ({ params: { locale } }));
}

export function requireLocale(value) {
  return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

export function languageDefinition(locale) {
  return LANGUAGES.find((language) => language.code === locale) ?? LANGUAGES[0];
}
