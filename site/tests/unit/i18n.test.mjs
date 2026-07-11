import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SUPPORTED_LOCALES,
  localizedPath,
  normalizeLocale,
  resolvePreferredLocale,
} from '../../src/i18n/languages.mjs';
import { getMessages } from '../../src/i18n/messages/index.mjs';
import { validateMessageShape } from '../../src/i18n/messages/schema.mjs';

test('supported locales match both apps', () => {
  assert.deepEqual(SUPPORTED_LOCALES, [
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
});

test('normalizes browser locales', () => {
  assert.equal(normalizeLocale('zh-CN'), 'zh-Hans');
  assert.equal(normalizeLocale('zh-HK'), 'zh-Hant');
  assert.equal(normalizeLocale('pt-PT'), 'pt-BR');
  assert.equal(normalizeLocale('de-DE'), 'de');
  assert.equal(normalizeLocale('nl-NL'), null);
});

test('prefers saved locale and falls back to English', () => {
  assert.equal(resolvePreferredLocale(['ja-JP'], 'ar'), 'ar');
  assert.equal(resolvePreferredLocale(['ja-JP'], null), 'ja');
  assert.equal(resolvePreferredLocale(['nl-NL'], null), 'en');
});

test('localized paths preserve page semantics', () => {
  assert.equal(localizedPath('ja', '/about/'), '/ja/about/');
  assert.equal(
    localizedPath('ar', '/fr/billloopr/privacy/'),
    '/ar/billloopr/privacy/'
  );
  assert.equal(localizedPath('en', '/'), '/en/');
});

test('every locale has complete non-empty fixed copy', () => {
  const reference = getMessages('en');

  for (const locale of SUPPORTED_LOCALES) {
    assert.deepEqual(
      validateMessageShape(reference, getMessages(locale)),
      [],
      locale
    );
  }
});

test('app privacy sections stay structurally aligned', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const messages = getMessages(locale);
    assert.equal(messages.billloopr.privacy.sections.length, 10, locale);
    assert.equal(messages.rosterslate.privacy.sections.length, 11, locale);
  }
});

test('non-English app catalogs do not retain English body copy', () => {
  const english = getMessages('en');
  const englishBodies = new Set([
    english.billloopr.privacy.intro,
    english.billloopr.support.intro,
    ...english.billloopr.privacy.sections.flatMap((section) => section),
    ...english.billloopr.support.topics,
    english.rosterslate.privacy.intro,
    english.rosterslate.support.intro,
    ...english.rosterslate.privacy.sections.flatMap((section) => section),
    ...english.rosterslate.support.topics,
  ]);

  for (const locale of SUPPORTED_LOCALES.filter((value) => value !== 'en')) {
    const catalog = JSON.stringify(getMessages(locale));
    const retainedEnglish = [...englishBodies].filter((value) =>
      catalog.includes(JSON.stringify(value).slice(1, -1))
    );
    assert.deepEqual(retainedEnglish, [], `${locale}: ${retainedEnglish.join(' | ')}`);
  }
});
