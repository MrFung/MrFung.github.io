# MrFung 全站多语言与 App 联动 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MrFung 网站全部固定文案升级为 12 种语言单语展示，并让 BillLoopr、RosterSlate 从 App 内打开与当前 App 语言一致的网站页面。

**Architecture:** Astro 继续静态导出。语言前缀 URL 是页面语言事实源；共享语言配置负责规范化、路径生成和浏览器回退，翻译按 `site`、`billloopr`、`rosterslate` 三个领域及 locale 拆分。页面组件只消费当前 locale 的结构化文案，无前缀旧路由作为英文可读兼容入口并在客户端尽早跳转。两个 Swift App 各自使用可测试的纯 URL 生成器构造语言前缀链接。

**Tech Stack:** Astro 7、ES modules、Node `node:test`、Playwright、SwiftUI、Swift Testing、SwiftLint、GitHub Pages 静态输出。

## Global Constraints

- 固定文案支持 `en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`es`、`fr`、`de`、`pt-BR`、`it`、`ru`、`ar`，一次只显示当前语言。
- 未设置网站语言时按浏览器首选语言；无法匹配时回退英文。
- 现有“自我介绍”文章的中文和英文均为创作原文，不随界面 locale 改写或隐藏。
- 首页顶部 MrFung 介绍属于固定文案，必须按当前 locale 单语展示。
- 阿拉伯语使用 RTL，其余语言使用 LTR。
- 不引入服务端、数据库、翻译 SaaS、分析 SDK、Cookie 追踪或新 npm 依赖。
- 保持现有网站视觉层级、颜色、间距和响应式风格，不做视觉重设计。
- 不改变两款 App 的支持语言列表、业务数据、CloudKit、排班、计时或导出行为。
- 网站、BillLoopr、RosterSlate 是三个独立 Git 仓库；每个仓库分别验证和提交。
- BillLooprProject 与 RosterSlateProject 当前存在用户未提交改动，只触达本计划列出的文件，提交时逐文件暂存。

## File Structure

### AppStorePages

- Create `site/src/i18n/languages.mjs`: 12 种语言事实源、浏览器语言规范化、路径生成和静态路由参数。
- Create `site/src/i18n/messages/schema.mjs`: 固定文案递归结构校验。
- Create `site/src/i18n/messages/site/<locale>.mjs`: 导航、页脚、首页、关于、应用目录、文章外壳、404 固定文案。
- Create `site/src/i18n/messages/billloopr/<locale>.mjs`: BillLoopr 产品、隐私、支持文案。
- Create `site/src/i18n/messages/rosterslate/<locale>.mjs`: RosterSlate 产品、隐私、支持文案。
- Create `site/src/i18n/messages/index.mjs`: 静态导入 36 个翻译模块并提供 `getMessages(locale)`。
- Create `site/src/content/selfIntroduction.mjs`: 现有自我介绍文章原始中英双语内容。
- Modify `site/src/components/BaseLayout.astro`: 单语站点外壳、SEO、canonical、`hreflang`、本地化导航和页脚。
- Modify `site/src/components/Hero.astro`: 接收一份当前语言 hero 文案，不再接收 `zh` / `en`。
- Create `site/src/components/LanguageSwitcher.astro`: 原生语言名选择器与选择持久化。
- Create `site/src/components/LegacyLanguageRedirect.astro`: 无前缀旧路由的浏览器语言跳转。
- Create `site/src/components/pages/HomePage.astro`, `AboutPage.astro`, `AppsPage.astro`, `WritingIndexPage.astro`, `SelfIntroductionPage.astro`, `AppProductPage.astro`, `AppPrivacyPage.astro`, `AppSupportPage.astro`: 共享渲染组件。
- Create `site/src/pages/[locale]/index.astro`, `apps/index.astro`, `about.astro`, `writing/index.astro`, `writing/self-introduction/index.astro`, `billloopr/index.astro`, `billloopr/privacy/index.astro`, `billloopr/support/index.astro`, `rosterslate/index.astro`, `rosterslate/privacy/index.astro`, `rosterslate/support/index.astro`: 本地化薄路由。
- Modify `site/src/pages/index.astro`, `apps/index.astro`, `about.astro`, `writing/index.astro`, `writing/self-introduction/index.astro`, `billloopr/index.astro`, `billloopr/privacy/index.astro`, `billloopr/support/index.astro`, `rosterslate/index.astro`, `rosterslate/privacy/index.astro`, `rosterslate/support/index.astro`, `404.astro`: 无前缀兼容入口与根 404。
- Create `site/src/pages/sitemap.txt.ts`: 生成正式本地化 URL sitemap。
- Remove `site/public/sitemap.txt`: 避免覆盖生成的 sitemap。
- Modify `site/public/assets/css/mrfung-site.css`: 语言选择器、单语布局、RTL 和长文本适配。
- Create `site/tests/unit/i18n.test.mjs`: 语言规范化、路径与翻译完整性测试。
- Modify `site/tests/e2e/home.spec.ts`: 全站单语、持久化、文章原文、RTL 和 SEO E2E。
- Modify `site/package.json`: 增加 `test:unit` 与聚合 `test` 脚本。
- Modify `README.md`: 更新多语言架构、构建和测试说明。

### BillLooprProject

- Create `BillLoopr/BillLoopr/Services/BillLooprExternalLinks.swift`: 语言规范化和产品/隐私/支持 URL 生成。
- Modify `BillLoopr/BillLoopr/Views/Settings/SettingsActions.swift`: 移除固定链接常量。
- Modify `BillLoopr/BillLoopr/Views/Settings/SettingsSections.swift`: 按 `selectedAppLanguage` 构造链接。
- Create `BillLoopr/BillLooprTests/ExternalLinksTests.swift`: 12 种语言、System 和回退测试。
- Modify `BillLoopr/BillLooprTests/ReleaseComplianceTests.swift`: 审核链接断言改为语言前缀地址。
- Modify `BillLoopr.md`: 记录网站语言联动和验证结果。

### RosterSlateProject

- Create `RosterSlate/RosterSlate/Support/RosterSlateExternalLinks.swift`: 语言规范化和产品/隐私/支持 URL 生成。
- Modify `RosterSlate/RosterSlate/ContentView.swift`: 移除固定链接常量并按 `selectedAppLanguage` 构造链接。
- Create `RosterSlate/RosterSlateTests/ExternalLinksTests.swift`: 增加 12 种语言、System 和回退测试。
- Modify `RosterSlate.md`: 记录网站语言联动和验证结果。

---

### Task 1: 网站语言事实源与红灯测试

**Files:**
- Create: `site/tests/unit/i18n.test.mjs`
- Create: `site/src/i18n/languages.mjs`
- Modify: `site/package.json`

**Interfaces:**
- Produces: `SUPPORTED_LOCALES: readonly string[]`, `LANGUAGES: readonly { code, nativeName, dir }[]`, `normalizeLocale(value): string | null`, `resolvePreferredLocale(values, saved): string`, `localizedPath(locale, pathname): string`, `getStaticLocalePaths(): { params: { locale: string } }[]`.

- [ ] **Step 1: 写语言覆盖、规范化和路径的失败测试**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  resolvePreferredLocale,
  localizedPath,
} from '../../src/i18n/languages.mjs';

test('supported locales match both apps', () => {
  assert.deepEqual(SUPPORTED_LOCALES, [
    'en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es',
    'fr', 'de', 'pt-BR', 'it', 'ru', 'ar',
  ]);
});

test('normalizes browser locales and falls back to English', () => {
  assert.equal(normalizeLocale('zh-CN'), 'zh-Hans');
  assert.equal(normalizeLocale('zh-HK'), 'zh-Hant');
  assert.equal(normalizeLocale('pt-PT'), 'pt-BR');
  assert.equal(normalizeLocale('de-DE'), 'de');
  assert.equal(resolvePreferredLocale(['nl-NL'], null), 'en');
  assert.equal(resolvePreferredLocale(['ja-JP'], 'ar'), 'ar');
});

test('localized paths preserve page semantics', () => {
  assert.equal(localizedPath('ja', '/about/'), '/ja/about/');
  assert.equal(localizedPath('ar', '/fr/billloopr/privacy/'), '/ar/billloopr/privacy/');
});
```

- [ ] **Step 2: 运行测试并确认因模块缺失失败**

Run: `cd site && node --test tests/unit/i18n.test.mjs`

Expected: FAIL，包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **Step 3: 实现最小语言模块**

```js
export const SUPPORTED_LOCALES = Object.freeze([
  'en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es',
  'fr', 'de', 'pt-BR', 'it', 'ru', 'ar',
]);

export const LANGUAGES = Object.freeze([
  ['en', 'English', 'ltr'], ['zh-Hans', '简体中文', 'ltr'],
  ['zh-Hant', '繁體中文', 'ltr'], ['ja', '日本語', 'ltr'],
  ['ko', '한국어', 'ltr'], ['es', 'Español', 'ltr'],
  ['fr', 'Français', 'ltr'], ['de', 'Deutsch', 'ltr'],
  ['pt-BR', 'Português (Brasil)', 'ltr'], ['it', 'Italiano', 'ltr'],
  ['ru', 'Русский', 'ltr'], ['ar', 'العربية', 'rtl'],
].map(([code, nativeName, dir]) => Object.freeze({ code, nativeName, dir })));

export function normalizeLocale(value) {
  if (!value) return null;
  const normalized = value.replace('_', '-');
  if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  const lower = normalized.toLowerCase();
  if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-Hant';
  if (lower.startsWith('zh')) return 'zh-Hans';
  if (lower.startsWith('pt')) return 'pt-BR';
  return SUPPORTED_LOCALES.find((code) => lower.startsWith(code.toLowerCase())) ?? null;
}

export function resolvePreferredLocale(values = [], saved = null) {
  return normalizeLocale(saved) ?? values.map(normalizeLocale).find(Boolean) ?? 'en';
}

export function localizedPath(locale, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (normalizeLocale(segments[0]) === segments[0]) segments.shift();
  return `/${locale}/${segments.join('/')}${segments.length ? '/' : ''}`;
}

export const getStaticLocalePaths = () =>
  SUPPORTED_LOCALES.map((locale) => ({ params: { locale } }));
```

- [ ] **Step 4: 增加测试脚本并运行绿灯**

```json
{
  "scripts": {
    "test:unit": "node --test tests/unit/*.test.mjs",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

Run: `cd site && npm run test:unit`

Expected: 3 tests PASS。

- [ ] **Step 5: 提交网站语言基础**

```bash
git add site/package.json site/src/i18n/languages.mjs site/tests/unit/i18n.test.mjs
git commit -m "建立网站多语言基础"
```

### Task 2: 结构化翻译数据与完整性门禁

**Files:**
- Create: `site/src/i18n/messages/schema.mjs`
- Create: `site/src/i18n/messages/site/{en,zh-Hans,zh-Hant,ja,ko,es,fr,de,pt-BR,it,ru,ar}.mjs`
- Create: `site/src/i18n/messages/billloopr/{en,zh-Hans,zh-Hant,ja,ko,es,fr,de,pt-BR,it,ru,ar}.mjs`
- Create: `site/src/i18n/messages/rosterslate/{en,zh-Hans,zh-Hant,ja,ko,es,fr,de,pt-BR,it,ru,ar}.mjs`
- Create: `site/src/i18n/messages/index.mjs`
- Modify: `site/tests/unit/i18n.test.mjs`

**Interfaces:**
- Consumes: `SUPPORTED_LOCALES` from Task 1.
- Produces: `getMessages(locale): { site, billloopr, rosterslate }`, `validateMessageShape(reference, candidate, path): string[]`.

- [ ] **Step 1: 写翻译完整性失败测试**

```js
import { getMessages } from '../../src/i18n/messages/index.mjs';
import { validateMessageShape } from '../../src/i18n/messages/schema.mjs';

test('every locale has complete non-empty fixed copy', () => {
  const reference = getMessages('en');
  for (const locale of SUPPORTED_LOCALES) {
    assert.deepEqual(validateMessageShape(reference, getMessages(locale)), []);
  }
});

test('app privacy sections stay structurally aligned', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const messages = getMessages(locale);
    assert.equal(messages.billloopr.privacy.sections.length, 10);
    assert.equal(messages.rosterslate.privacy.sections.length, 11);
  }
});
```

- [ ] **Step 2: 运行测试并确认缺少翻译模块**

Run: `cd site && npm run test:unit`

Expected: FAIL，包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **Step 3: 实现递归结构校验器**

```js
export function validateMessageShape(reference, candidate, path = 'messages') {
  if (typeof reference === 'string') {
    return typeof candidate === 'string' && candidate.trim() ? [] : [path];
  }
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate) || candidate.length !== reference.length) return [path];
    return reference.flatMap((item, index) =>
      validateMessageShape(item, candidate[index], `${path}[${index}]`));
  }
  if (!reference || typeof reference !== 'object' || !candidate || typeof candidate !== 'object') {
    return [path];
  }
  const referenceKeys = Object.keys(reference).sort();
  const candidateKeys = Object.keys(candidate).sort();
  if (referenceKeys.join('|') !== candidateKeys.join('|')) return [path];
  return referenceKeys.flatMap((key) =>
    validateMessageShape(reference[key], candidate[key], `${path}.${key}`));
}
```

- [ ] **Step 4: 建立 36 个翻译模块和静态索引**

每个 `site/<locale>.mjs` 必须完整导出以下键，不加入文章正文：

```js
export default {
  meta: { defaultTitle: '', defaultDescription: '' },
  nav: { home: '', apps: '', writing: '', about: '', contact: '', ariaLabel: '' },
  footer: { copyright: '', apps: '', writing: '', about: '', contact: '' },
  language: { label: '' },
  home: { hero: {}, highlights: [], actions: {}, directory: {}, writing: {} },
  apps: { meta: {}, heading: {}, billloopr: {}, rosterslate: {} },
  about: { meta: {}, intro: {}, profile: {}, interests: {}, closing: {} },
  writing: { meta: {}, heading: {}, read: '', originalLanguages: '' },
  notFound: { title: '', description: '', home: '', apps: '', writing: '' },
};
```

每个 App locale 模块必须包含 `meta`、`product`、`privacy`、`support`；`privacy.sections` 保持英文源的章节顺序与事实，`support.topics` 保持对应 App 的现有条目数量。翻译品牌名、邮箱、Apple、CloudKit、iCloud、App Store、ITRA 430 时保持专有名词原样。

索引使用 36 个静态 import，确保 Node 测试与 Astro 构建使用相同数据：

```js
const catalogs = {
  en: { site: siteEn, billloopr: billlooprEn, rosterslate: rosterslateEn },
  'zh-Hans': { site: siteZhHans, billloopr: billlooprZhHans, rosterslate: rosterslateZhHans },
  'zh-Hant': { site: siteZhHant, billloopr: billlooprZhHant, rosterslate: rosterslateZhHant },
  ja: { site: siteJa, billloopr: billlooprJa, rosterslate: rosterslateJa },
  ko: { site: siteKo, billloopr: billlooprKo, rosterslate: rosterslateKo },
  es: { site: siteEs, billloopr: billlooprEs, rosterslate: rosterslateEs },
  fr: { site: siteFr, billloopr: billlooprFr, rosterslate: rosterslateFr },
  de: { site: siteDe, billloopr: billlooprDe, rosterslate: rosterslateDe },
  'pt-BR': { site: sitePtBR, billloopr: billlooprPtBR, rosterslate: rosterslatePtBR },
  it: { site: siteIt, billloopr: billlooprIt, rosterslate: rosterslateIt },
  ru: { site: siteRu, billloopr: billlooprRu, rosterslate: rosterslateRu },
  ar: { site: siteAr, billloopr: billlooprAr, rosterslate: rosterslateAr },
};

export const getMessages = (locale) => catalogs[locale] ?? catalogs.en;
```

- [ ] **Step 5: 运行完整性测试**

Run: `cd site && npm run test:unit`

Expected: 5 tests PASS，12 种语言无缺键、空值或章节数量差异。

- [ ] **Step 6: 提交翻译资源**

```bash
git add site/src/i18n/messages site/tests/unit/i18n.test.mjs
git commit -m "补齐全站十二种语言文案"
```

### Task 3: 单语布局、语言选择器与 RTL

**Files:**
- Modify: `site/src/components/BaseLayout.astro`
- Modify: `site/src/components/Hero.astro`
- Create: `site/src/components/LanguageSwitcher.astro`
- Create: `site/src/components/LegacyLanguageRedirect.astro`
- Modify: `site/public/assets/css/mrfung-site.css`
- Modify: `site/tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `LANGUAGES`, `localizedPath`, current locale and `site` messages.
- Produces: `BaseLayout` props `{ locale, routePath, title?, description?, legacy? }`; `Hero` props `{ kicker, title, copy, compact?, home? }`.

- [ ] **Step 1: 写布局与语言选择器 E2E 红灯**

```ts
test('localized shell exposes one language and persistent switching', async ({ page }) => {
  await page.goto('/ja/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.getByLabel('言語')).toHaveValue('ja');
  await page.getByLabel('言語').selectOption('ar');
  await expect(page).toHaveURL('/ar/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.evaluate(() => localStorage.getItem('mrfung.siteLanguage'))).resolves.toBe('ar');
});
```

- [ ] **Step 2: 运行 E2E 并确认 `/ja/` 404**

Run: `cd site && npx playwright test tests/e2e/home.spec.ts --project=desktop-chrome`

Expected: FAIL，`/ja/` 未生成。

- [ ] **Step 3: 实现单语 BaseLayout、Hero 和语言选择器**

`BaseLayout` 必须从 `getMessages(locale).site` 渲染一套导航和页脚；对 12 个 locale 输出 `hreflang`；`LanguageSwitcher` 选择时执行：

```js
const select = document.querySelector('[data-language-switcher]');
select?.addEventListener('change', (event) => {
  const target = event.currentTarget;
  localStorage.setItem('mrfung.siteLanguage', target.value);
  window.location.assign(target.selectedOptions[0].dataset.path);
});
```

`Hero` 改为只输出一段：

```astro
<div class="mf-hero-copy"><p>{copy}</p></div>
```

- [ ] **Step 4: 实现兼容入口语言解析组件**

```astro
<script is:inline define:vars={{ routePath }}>
  const supported = ['en','zh-Hans','zh-Hant','ja','ko','es','fr','de','pt-BR','it','ru','ar'];
  const normalize = (value) => {
    if (!value) return null;
    const tag = value.replace('_', '-');
    if (supported.includes(tag)) return tag;
    const lower = tag.toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-Hant';
    if (lower.startsWith('zh')) return 'zh-Hans';
    if (lower.startsWith('pt')) return 'pt-BR';
    return supported.find((code) => lower.startsWith(code.toLowerCase())) ?? null;
  };
  const saved = normalize(localStorage.getItem('mrfung.siteLanguage'));
  const browser = navigator.languages?.map(normalize).find(Boolean) ?? normalize(navigator.language);
  const locale = saved ?? browser ?? 'en';
  window.location.replace(`/${locale}${routePath}`);
</script>
```

- [ ] **Step 5: 增加 RTL、长文本和选择器样式**

```css
.language-switcher select { min-block-size: 2.75rem; max-inline-size: 100%; }
[dir="rtl"] .nav-inner,
[dir="rtl"] .mf-actions,
[dir="rtl"] .footer-inner { direction: rtl; }
[dir="rtl"] ul { padding-inline-start: 0; padding-inline-end: 1.25rem; }
.mf-hero-copy { max-inline-size: 52rem; }
```

- [ ] **Step 6: 提交共享布局**

```bash
git add site/src/components site/public/assets/css/mrfung-site.css site/tests/e2e/home.spec.ts
git commit -m "实现网站单语布局与语言切换"
```

### Task 4: 固定页面、文章边界与本地化路由

**Files:**
- Create: `site/src/content/selfIntroduction.mjs`
- Create: `site/src/components/pages/HomePage.astro`
- Create: `site/src/components/pages/AboutPage.astro`
- Create: `site/src/components/pages/AppsPage.astro`
- Create: `site/src/components/pages/WritingIndexPage.astro`
- Create: `site/src/components/pages/SelfIntroductionPage.astro`
- Create: `site/src/pages/[locale]/index.astro`
- Create: `site/src/pages/[locale]/apps/index.astro`
- Create: `site/src/pages/[locale]/about.astro`
- Create: `site/src/pages/[locale]/writing/index.astro`
- Create: `site/src/pages/[locale]/writing/self-introduction/index.astro`
- Modify: `site/src/pages/index.astro`
- Modify: `site/src/pages/apps/index.astro`
- Modify: `site/src/pages/about.astro`
- Modify: `site/src/pages/writing/index.astro`
- Modify: `site/src/pages/writing/self-introduction/index.astro`
- Modify: `site/tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `getMessages(locale)`, `getStaticLocalePaths()`, `BaseLayout`, `Hero`, `LegacyLanguageRedirect`.
- Produces: five fixed page semantics in every locale; article content object `{ languages: ['zh-Hans', 'en'], sections: [...] }` independent of locale.

- [ ] **Step 1: 写首页单语与文章原文边界红灯测试**

```ts
test('home introduction is single-language fixed copy', async ({ page }) => {
  await page.goto('/zh-Hans/');
  await expect(page.getByText('全栈开发者，AICoding 实践者，独立产品打磨者。', { exact: false })).toBeVisible();
  await expect(page.getByText('Full-stack builder, AICoding practitioner', { exact: false })).toHaveCount(0);
});

test('article keeps authored bilingual content under a French shell', async ({ page }) => {
  await page.goto('/fr/writing/self-introduction/');
  await expect(page.getByRole('navigation').getByText('À propos')).toBeVisible();
  await expect(page.getByText('把真实工作流做成能长期维护的工具。')).toBeVisible();
  await expect(page.getByText('Building tools that can stay useful.')).toBeVisible();
});
```

- [ ] **Step 2: 提取文章原文并创建五个共享页面组件**

`selfIntroduction.mjs` 原样保存现有中文和英文标题、导语、段落，并为每个区块记录 `lang`。`HomePage` 的 hero 只能读取 `messages.site.home.hero.copy`，不得 import 文章英文正文。文章组件为两个原文 section 分别输出 `lang="zh-Hans"` 与 `lang="en"`。

- [ ] **Step 3: 创建五组本地化薄路由**

每个路由使用相同模式：

```astro
---
import HomePage from '../../components/pages/HomePage.astro';
import { getStaticLocalePaths } from '../../i18n/languages.mjs';
export const getStaticPaths = getStaticLocalePaths;
const { locale } = Astro.params;
---
<HomePage locale={locale} routePath="/" />
```

- [ ] **Step 4: 将五个旧路由改为英文兜底加兼容跳转**

```astro
<LegacyLanguageRedirect routePath="/about/" />
<AboutPage locale="en" routePath="/about/" legacy />
```

- [ ] **Step 5: 运行单元、E2E 和构建**

Run: `cd site && npm run test:unit && npx playwright test tests/e2e/home.spec.ts --project=desktop-chrome && npm run build`

Expected: unit PASS；新增首页和文章测试 PASS；Astro 生成五组共 60 个正式页面。

- [ ] **Step 6: 提交固定页面迁移**

```bash
git add site/src/content site/src/components/pages site/src/pages site/tests/e2e/home.spec.ts
git commit -m "迁移固定页面到十二种语言"
```

### Task 5: 两款 App 内容页、SEO、sitemap 与 404

**Files:**
- Create: `site/src/components/pages/AppProductPage.astro`
- Create: `site/src/components/pages/AppPrivacyPage.astro`
- Create: `site/src/components/pages/AppSupportPage.astro`
- Create: `site/src/pages/[locale]/billloopr/index.astro`
- Create: `site/src/pages/[locale]/billloopr/privacy/index.astro`
- Create: `site/src/pages/[locale]/billloopr/support/index.astro`
- Create: `site/src/pages/[locale]/rosterslate/index.astro`
- Create: `site/src/pages/[locale]/rosterslate/privacy/index.astro`
- Create: `site/src/pages/[locale]/rosterslate/support/index.astro`
- Modify: `site/src/pages/billloopr/index.astro`
- Modify: `site/src/pages/billloopr/privacy/index.astro`
- Modify: `site/src/pages/billloopr/support/index.astro`
- Modify: `site/src/pages/rosterslate/index.astro`
- Modify: `site/src/pages/rosterslate/privacy/index.astro`
- Modify: `site/src/pages/rosterslate/support/index.astro`
- Modify: `site/src/pages/404.astro`
- Create: `site/src/pages/sitemap.txt.ts`
- Delete: `site/public/sitemap.txt`
- Modify: `site/tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: App message catalogs and shared localized layout.
- Produces: six App page semantics in every locale, 132 total localized pages, generated sitemap and runtime-localized root 404.

- [ ] **Step 1: 写 App 单语、SEO、RTL 和旧路由红灯测试**

```ts
test('BillLoopr privacy is single-language and exposes alternates', async ({ page }) => {
  await page.goto('/de/billloopr/privacy/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('link[hreflang="ja"]')).toHaveAttribute('href', /\/ja\/billloopr\/privacy\/$/);
  await expect(page.getByText('Datenschutzrichtlinie')).toBeVisible();
  await expect(page.getByText('隐私政策')).toHaveCount(0);
});

test('legacy App URL follows browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ja-JP' });
  const page = await context.newPage();
  await page.goto('/rosterslate/support/');
  await expect(page).toHaveURL('/ja/rosterslate/support/');
  await context.close();
});
```

- [ ] **Step 2: 实现 App 产品、隐私、支持共享组件和 72 个地址**

产品页读取 `product.hero/features/privacyCard`；隐私页按 `privacy.sections` 渲染单语 section；支持页按 `support.topics` 和 `support.callouts` 渲染。所有内部链接使用 `localizedPath(locale, targetPath)`。

- [ ] **Step 3: 替换六个旧 App 页面为英文兜底兼容入口**

每个旧页面先渲染 `LegacyLanguageRedirect`，再复用对应 App 页面组件的英文 catalog，确保无 JavaScript 时可阅读。

- [ ] **Step 4: 生成 sitemap 并本地化 404**

```ts
export const GET = () => new Response(
  localizedRoutePaths.flatMap((path) =>
    SUPPORTED_LOCALES.map((locale) => `https://www.mrfung.cn${localizedPath(locale, path)}`)
  ).join('\n') + '\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
```

404 内嵌 12 种短文案，只把当前语言写入可见 DOM；合法 URL 首段优先，否则使用保存值和浏览器语言，失败时英文。

- [ ] **Step 5: 运行网站完整验证**

Run: `cd site && npm run test:unit && npm run build && npm run test:e2e`

Expected: unit 全通过；Astro 生成 132 个正式本地化页面；desktop/mobile Playwright 全通过；`dist/sitemap.txt` 包含 132 个正式 URL。

- [ ] **Step 6: 提交 App 页面与 SEO**

```bash
git add site/src site/public/sitemap.txt site/tests/e2e/home.spec.ts
git commit -m "完成应用页面多语言与搜索索引"
```

### Task 6: BillLoopr 网站链接联动

**Files:**
- Create: `BillLoopr/BillLoopr/Services/BillLooprExternalLinks.swift`
- Modify: `BillLoopr/BillLoopr/Views/Settings/SettingsActions.swift`
- Modify: `BillLoopr/BillLoopr/Views/Settings/SettingsSections.swift`
- Create: `BillLoopr/BillLooprTests/ExternalLinksTests.swift`
- Modify: `BillLoopr/BillLooprTests/ReleaseComplianceTests.swift`
- Modify: `BillLoopr.md`

**Interfaces:**
- Produces: `BillLooprExternalLinks.marketing(language:preferredLanguages:)`, `.privacyPolicy(language:preferredLanguages:)`, `.support(language:preferredLanguages:)`, `.websiteLocale(language:preferredLanguages:)`.

- [ ] **Step 1: 写 URL 生成红灯测试**

```swift
import Foundation
import Testing
@testable import BillLoopr

struct ExternalLinksTests {
    @Test func explicitLanguagesBuildLocalizedWebsiteURLs() {
        #expect(BillLooprExternalLinks.privacyPolicy(language: .ja)?.absoluteString
            == "https://www.mrfung.cn/ja/billloopr/privacy/")
        #expect(BillLooprExternalLinks.support(language: .ar)?.absoluteString
            == "https://www.mrfung.cn/ar/billloopr/support/")
    }

    @Test func systemLanguageNormalizesRegionsAndFallsBackToEnglish() {
        #expect(BillLooprExternalLinks.websiteLocale(language: .system, preferredLanguages: ["zh-TW"])
            == "zh-Hant")
        #expect(BillLooprExternalLinks.websiteLocale(language: .system, preferredLanguages: ["nl-NL"])
            == "en")
    }
}
```

- [ ] **Step 2: 运行定向测试确认缺少新 API**

Run: `/usr/bin/env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test -quiet -project BillLoopr/BillLoopr.xcodeproj -scheme BillLoopr -destination 'platform=macOS,arch=arm64' -derivedDataPath /tmp/BillLoopr-site-links-red -only-testing:BillLooprTests/ExternalLinksTests CODE_SIGNING_ALLOWED=NO`

Expected: FAIL，`BillLooprExternalLinks` 没有带语言参数的方法。

- [ ] **Step 3: 实现纯 URL 解析器**

```swift
enum BillLooprExternalLinks {
    static func websiteLocale(
        language: BLAppLanguage,
        preferredLanguages: [String] = Locale.preferredLanguages
    ) -> String {
        guard language == .system else { return language.rawValue }
        return preferredLanguages.lazy.compactMap(normalizedWebsiteLocale).first ?? "en"
    }

    static func privacyPolicy(language: BLAppLanguage, preferredLanguages: [String] = Locale.preferredLanguages) -> URL? {
        websiteURL(path: "privacy/", language: language, preferredLanguages: preferredLanguages)
    }

    static func support(language: BLAppLanguage, preferredLanguages: [String] = Locale.preferredLanguages) -> URL? {
        websiteURL(path: "support/", language: language, preferredLanguages: preferredLanguages)
    }

    static func marketing(language: BLAppLanguage, preferredLanguages: [String] = Locale.preferredLanguages) -> URL? {
        websiteURL(path: "", language: language, preferredLanguages: preferredLanguages)
    }

    static let termsOfUse = URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")
}
```

规范化函数必须与网站规则一致：中文港台澳映射 `zh-Hant`，其它中文映射 `zh-Hans`，葡萄牙语映射 `pt-BR`，其它支持语言按主语言匹配，未知语言返回 nil。

- [ ] **Step 4: 设置页改用当前 App 语言并更新审核测试**

```swift
if let privacyPolicyURL = BillLooprExternalLinks.privacyPolicy(language: selectedAppLanguage) {
    Link(destination: privacyPolicyURL) {
        Label("Online Privacy Policy", systemImage: "safari")
    }
}
```

ReleaseComplianceTests 使用 `.en` 断言 `/en/billloopr/...`，terms URL 保持不变。

- [ ] **Step 5: 运行 BillLoopr 验证**

Run: `/usr/bin/env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test -quiet -project BillLoopr/BillLoopr.xcodeproj -scheme BillLoopr -destination 'platform=macOS,arch=arm64' -derivedDataPath /tmp/BillLoopr-site-links-green -only-testing:BillLooprTests CODE_SIGNING_ALLOWED=NO`

Expected: BillLooprTests 全部 PASS。

Run: `BillLooprProject/scripts/validate_swift_quality.sh`

Expected: SwiftLint、400 行文件和 50 行函数门禁 PASS。

- [ ] **Step 6: 更新事实源并提交本任务文件**

```bash
git add BillLoopr/BillLoopr/Services/BillLooprExternalLinks.swift BillLoopr/BillLoopr/Views/Settings/SettingsActions.swift BillLoopr/BillLoopr/Views/Settings/SettingsSections.swift BillLoopr/BillLooprTests/ExternalLinksTests.swift BillLoopr/BillLooprTests/ReleaseComplianceTests.swift BillLoopr.md
git commit -m "联动 BillLoopr 与网站语言"
```

### Task 7: RosterSlate 网站链接联动

**Files:**
- Create: `RosterSlate/RosterSlate/Support/RosterSlateExternalLinks.swift`
- Modify: `RosterSlate/RosterSlate/ContentView.swift`
- Create: `RosterSlate/RosterSlateTests/ExternalLinksTests.swift`
- Modify: `RosterSlate.md`

**Interfaces:**
- Produces: `RosterSlateExternalLinks.marketing(language:preferredLanguages:)`, `.privacyPolicy(language:preferredLanguages:)`, `.support(language:preferredLanguages:)`, `.websiteLocale(language:preferredLanguages:)`.

- [ ] **Step 1: 写 RosterSlate URL 红灯测试**

```swift
@Test func websiteLinksFollowExplicitAndSystemLanguages() {
    #expect(RosterSlateExternalLinks.privacyPolicy(language: .ko)?.absoluteString
        == "https://www.mrfung.cn/ko/rosterslate/privacy/")
    #expect(RosterSlateExternalLinks.support(language: .system, preferredLanguages: ["pt-PT"])?.absoluteString
        == "https://www.mrfung.cn/pt-BR/rosterslate/support/")
    #expect(RosterSlateExternalLinks.websiteLocale(language: .system, preferredLanguages: ["nl-NL"])
        == "en")
}
```

- [ ] **Step 2: 运行定向测试确认缺少公开解析器**

Run: `/usr/bin/env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test -quiet -project RosterSlate/RosterSlate.xcodeproj -scheme RosterSlate -destination 'platform=macOS,arch=arm64' -derivedDataPath /tmp/RosterSlate-site-links-red -only-testing:RosterSlateTests CODE_SIGNING_ALLOWED=NO`

Expected: FAIL，现有 `private RosterSlateExternalLinks` 不支持语言参数。

- [ ] **Step 3: 把链接解析器移入独立 Support 文件**

```swift
enum RosterSlateExternalLinks {
    private static let supportedLocales = [
        "en", "zh-Hans", "zh-Hant", "ja", "ko", "es",
        "fr", "de", "pt-BR", "it", "ru", "ar"
    ]

    static func websiteLocale(
        language: RosterAppLanguage,
        preferredLanguages: [String] = Locale.preferredLanguages
    ) -> String {
        guard language == .system else { return language.rawValue }
        return preferredLanguages.lazy.compactMap(normalizedWebsiteLocale).first ?? "en"
    }

    static func marketing(
        language: RosterAppLanguage,
        preferredLanguages: [String] = Locale.preferredLanguages
    ) -> URL? {
        websiteURL(path: "", language: language, preferredLanguages: preferredLanguages)
    }

    static func privacyPolicy(
        language: RosterAppLanguage,
        preferredLanguages: [String] = Locale.preferredLanguages
    ) -> URL? {
        websiteURL(path: "privacy/", language: language, preferredLanguages: preferredLanguages)
    }

    static func support(
        language: RosterAppLanguage,
        preferredLanguages: [String] = Locale.preferredLanguages
    ) -> URL? {
        websiteURL(path: "support/", language: language, preferredLanguages: preferredLanguages)
    }

    private static func websiteURL(
        path: String,
        language: RosterAppLanguage,
        preferredLanguages: [String]
    ) -> URL? {
        let locale = websiteLocale(language: language, preferredLanguages: preferredLanguages)
        return URL(string: "https://www.mrfung.cn/\(locale)/rosterslate/\(path)")
    }

    private static func normalizedWebsiteLocale(_ value: String) -> String? {
        let tag = value.replacingOccurrences(of: "_", with: "-")
        if supportedLocales.contains(tag) { return tag }
        let lower = tag.lowercased()
        if ["zh-tw", "zh-hk", "zh-mo", "zh-hant"].contains(where: lower.hasPrefix) {
            return "zh-Hant"
        }
        if lower.hasPrefix("zh") { return "zh-Hans" }
        if lower.hasPrefix("pt") { return "pt-BR" }
        return supportedLocales.first { lower.hasPrefix($0.lowercased()) }
    }
}
```

从 `ContentView.swift` 删除顶部固定 URL enum。

- [ ] **Step 4: 设置页链接使用 `selectedAppLanguage`**

```swift
if let supportURL = RosterSlateExternalLinks.support(language: selectedAppLanguage) {
    Link(destination: supportURL) {
        Label("Support Page", systemImage: "questionmark.circle")
    }
}
```

- [ ] **Step 5: 运行 RosterSlate 验证**

Run: `/usr/bin/env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test -quiet -project RosterSlate/RosterSlate.xcodeproj -scheme RosterSlate -destination 'platform=macOS,arch=arm64' -derivedDataPath /tmp/RosterSlate-site-links-green -only-testing:RosterSlateTests CODE_SIGNING_ALLOWED=NO`

Expected: RosterSlateTests 全部 PASS。

Run: `cd RosterSlateProject && swiftlint lint --strict --config .swiftlint.yml RosterSlate/RosterSlate/Support/RosterSlateExternalLinks.swift RosterSlate/RosterSlate/ContentView.swift RosterSlate/RosterSlateTests/ExternalLinksTests.swift`

Expected: 变更文件无新增 SwiftLint violation；`RosterSlateExternalLinks.swift` 与 `ExternalLinksTests.swift` 均少于 400 行，所有新增函数少于 50 行。`ContentView.swift` 的历史文件长度单独记录，不把既有超限误报为本任务新增问题。

- [ ] **Step 6: 更新事实源并提交本任务文件**

```bash
git add RosterSlate/RosterSlate/Support/RosterSlateExternalLinks.swift RosterSlate/RosterSlate/ContentView.swift RosterSlate/RosterSlateTests/ExternalLinksTests.swift RosterSlate.md
git commit -m "联动 RosterSlate 与网站语言"
```

### Task 8: 发布产物、跨仓库验收与文档收尾

**Files:**
- Modify: `README.md`
- Modify: root generated HTML/CSS/sitemap files from `site/dist`
- Modify: `BillLooprProject/BillLoopr.md`
- Modify: `RosterSlateProject/RosterSlate.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: GitHub Pages 根目录发布产物和三个仓库的最终验证记录。

- [ ] **Step 1: 更新网站 README**

记录 12 种语言、语言前缀、浏览器回退、文章原文边界、`npm run test:unit`、`npm run test:e2e` 和构建发布流程；删除“页面内容中英双语同屏展示”的旧说明。

- [ ] **Step 2: 运行网站最终验证并同步 dist**

Run: `cd site && npm run test:unit && npm run build && npm run test:e2e`

Expected: 所有单元测试、Astro 构建和 desktop/mobile Playwright PASS。

Run: `cp -R site/dist/. ./`

Expected: 仅覆盖或新增 GitHub Pages 构建产物，不删除仓库文件；根目录包含语言前缀目录、兼容入口、`404.html`、`sitemap.txt` 与静态资源。随后使用 `git status --short` 逐项审核产物边界。

- [ ] **Step 3: 验证构建产物关键路径**

Run: `test -f ja/index.html && test -f ar/about/index.html && test -f de/billloopr/privacy/index.html && test -f zh-Hans/rosterslate/support/index.html && test -f sitemap.txt`

Expected: exit 0。

- [ ] **Step 4: 检查三个仓库差异边界**

Run: `git -C AppStorePages diff --check && git -C BillLooprProject diff --check && git -C RosterSlateProject diff --check`

Expected: exit 0；BillLooprProject 与 RosterSlateProject 的用户既有改动仍存在且未被暂存到本任务提交。

- [ ] **Step 5: 提交网站发布产物与文档**

```bash
git add README.md 404.html sitemap.txt assets apps about writing billloopr rosterslate en zh-Hans zh-Hant ja ko es fr de pt-BR it ru ar
git commit -m "发布全站十二种语言页面"
```

- [ ] **Step 6: 最终状态确认**

Run: `git -C AppStorePages status --short --branch; git -C BillLooprProject status --short --branch; git -C RosterSlateProject status --short --branch`

Expected: AppStorePages 只剩用户原有状态或干净；两个 App 仓库只剩本任务开始前记录的用户未提交改动。最终回复明确列出网站、BillLoopr、RosterSlate 的提交、测试结果和任何仍需人工检查的翻译/RTL 风险。
