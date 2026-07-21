# KMP 三端性能技术文章实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 MrFung GitHub Pages 发布一篇不含具体业务信息、拥有完整真机数据图表和三端工程选型结论的中文 KMP 技术白皮书。

**Architecture:** 用独立数据模块维护全部公开测试数字，Astro 文章组件只消费该模块并以语义化 HTML、CSS 柱图和架构图渲染。无前缀兼容页与 12 种语言页复用同一个中文文章组件，现有本地化外壳继续负责导航、SEO 和语言切换。

**Tech Stack:** Astro 7、ES Modules、原生 HTML/CSS、Node Test Runner、Playwright、GitHub Pages 静态导出。

## Global Constraints

- 中文原文在 12 种语言外壳中保持一致，文章正文声明 `lang="zh-Hans"`。
- 不出现具体业务名称、金融或证券品类、内部项目编号、内部工程名、内部类名、故障排查过程和本地绝对路径。
- 不新增外部图表库、CDN、后端、数据库或运行时网络请求。
- 图表必须有标题、单位、可见数值、文字图例、精确数据表和性能分析，不能只依赖颜色表达方案。
- 同平台内比较方案，不用跨设备绝对值给平台排名。
- 保留现有浅色、深色、RTL、移动端和无 JavaScript 阅读能力。
- 当前仓库其它任务的改动不纳入本文章提交。

---

### Task 1: 建立文章数据单一事实源

**Files:**
- Create: `site/src/content/kmpThreePlatformPerformance.mjs`
- Create: `site/tests/unit/kmp-performance-article.test.mjs`

**Interfaces:**
- Produces: `KMP_ARTICLE_META`、`KMP_SCENARIO`、`IOS_RESULTS`、`ANDROID_RESULTS`、`HARMONY_RESULTS`、`PLATFORM_SELECTIONS`、`barPercent(value, maximum)`。
- Consumes: 设计说明中已确认的真机汇总值。

- [ ] **Step 1: 写数据契约失败测试**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dataUrl = new URL('../../src/content/kmpThreePlatformPerformance.mjs', import.meta.url);

test('KMP article publishes the verified three-platform dataset', async () => {
  const source = await readFile(dataUrl, 'utf8').catch(() => '');
  assert.match(source, /KMP_ARTICLE_META/);
  assert.match(source, /83\.39/);
  assert.match(source, /148\.53/);
  assert.match(source, /137\.43/);
});
```

- [ ] **Step 2: 运行测试并确认因数据模块不存在而失败**

Run: `cd site && npm run test:unit`

Expected: 新测试以缺少 `KMP_ARTICLE_META` 或关键真机数值失败，原有 7 项通过。

- [ ] **Step 3: 写最小数据模块并补完整约束**

```js
export const KMP_ARTICLE_META = Object.freeze({
  slug: 'kmp-three-platform-performance',
  title: 'Kotlin Multiplatform 三端高频数据 Core：iOS、Android 与 HarmonyOS 的性能实测与工程选型',
  description: '基于 iOS、Android 与 HarmonyOS 真机数据，分析共享 KMP Core 的性能、内存、调用边界与工程选型。',
  publishedAt: '2026-07-21',
});

export const KMP_SCENARIO = Object.freeze({
  rows: 5000,
  columns: 50,
  visibleRows: 34,
  steadyBatchesPerSecond: 20,
  burstBatchesPerSecond: 100,
  maximumFieldsPerBatch: 816,
});

export function barPercent(value, maximum) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}
```

同一文件补齐以下精确数组：

- iOS：Swift 原生、官方 Framework、C ABI 的常态百分之九十五延迟、突发百分之九十九延迟、常态/突发吞吐和最高常驻内存。
- Android：原生 Kotlin、KMP/JVM 的两项尾部延迟、两项吞吐和最高 PSS。
- HarmonyOS：ArkTS、优化前 KNOI、优化后 KNOI、CPF-KMP 的最高 PSS；CPF 与优化后 KNOI 的运行时长、常态/高压批次速率、结束恢复值和积压量。
- 最终选型：Android 直接 KMP/JVM；iOS Framework + C ABI 双通道；HarmonyOS CPF-KMP + AKInterop Direct ArrayBuffer。

- [ ] **Step 4: 扩展测试并验证数据完整性**

```js
const article = await import('../../src/content/kmpThreePlatformPerformance.mjs');

test('verified values and final selections stay locked', () => {
  assert.equal(article.IOS_RESULTS.find(({ id }) => id === 'c-abi').peakMemoryMiB, 136.70);
  assert.equal(article.ANDROID_RESULTS.find(({ id }) => id === 'kmp-jvm').peakPssMiB, 137.43);
  assert.equal(article.HARMONY_RESULTS.cpf.peakPssMiB, 83.39);
  assert.equal(article.HARMONY_RESULTS.cpf.recoveryPssMiB, 45.58);
  assert.equal(article.HARMONY_RESULTS.cpf.maximumBacklog, 0);
  assert.deepEqual(article.PLATFORM_SELECTIONS.map(({ platform }) => platform), ['Android', 'iOS', 'HarmonyOS']);
});

test('bar widths are bounded', () => {
  assert.equal(article.barPercent(25, 100), 25);
  assert.equal(article.barPercent(150, 100), 100);
  assert.equal(article.barPercent(-1, 100), 0);
  assert.equal(article.barPercent(1, 0), 0);
});
```

- [ ] **Step 5: 运行单元测试并提交**

Run: `cd site && npm run test:unit`

Expected: 11 项左右全部通过，0 failure。

```bash
git add site/src/content/kmpThreePlatformPerformance.mjs site/tests/unit/kmp-performance-article.test.mjs
git commit -m "新增 KMP 三端性能文章数据源"
```

---

### Task 2: 实现中文技术白皮书页面

**Files:**
- Create: `site/src/components/KmpComparisonChart.astro`
- Create: `site/src/components/KmpThreePlatformPerformanceArticle.astro`
- Create: `site/src/styles/kmpThreePlatformPerformance.css`
- Create: `site/src/pages/writing/kmp-three-platform-performance/index.astro`
- Create: `site/tests/e2e/kmp-three-platform-performance.spec.ts`

**Interfaces:**
- Consumes: Task 1 的数据常量与 `barPercent`。
- Produces: 无前缀文章页，以及供本地化页面复用的 `KmpThreePlatformPerformanceArticle`。

- [ ] **Step 1: 写文章页失败测试**

```ts
import { expect, test } from '@playwright/test';

test('KMP whitepaper renders verified charts and public technical copy', async ({ page }) => {
  await page.goto('/zh-Hans/writing/kmp-three-platform-performance/');
  await expect(page.getByRole('heading', { name: /Kotlin Multiplatform 三端高频数据 Core/ })).toBeVisible();
  await expect(page.locator('article[lang="zh-Hans"]')).toBeVisible();
  await expect(page.locator('[data-performance-chart]')).toHaveCount(8);
  await expect(page.getByText('83.39 MiB', { exact: true })).toBeVisible();
  await expect(page.getByText('一份 Core，三种高频边界')).toBeVisible();
});

test('KMP whitepaper has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/writing/kmp-three-platform-performance/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
```

- [ ] **Step 2: 运行目标测试并确认路由缺失失败**

Run: `cd site && npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts --project=desktop-chrome`

Expected: 文章标题、正文或图表断言失败。

- [ ] **Step 3: 实现通用对比图组件**

`KmpComparisonChart.astro` 接收以下属性：

```ts
type ChartRow = {
  label: string;
  value: number;
  formattedValue: string;
  scheme: 'native' | 'kmp' | 'optimized';
};

type Props = {
  id: string;
  title: string;
  subtitle: string;
  rows: ChartRow[];
  analysis: string;
  lowerIsBetter?: boolean;
};
```

组件输出 `<figure data-performance-chart>`、带文字的 CSS 柱图、`<table>` 精确值以及 `<figcaption><strong>性能分析：</strong>…</figcaption>`。柱宽统一调用 `barPercent(row.value, maximum)`，不使用客户端 JavaScript。

- [ ] **Step 4: 实现文章组件和样式**

文章按下列固定章节与锚点完整输出：

```text
#summary       结论先行：一份 Core，三种高频边界
#methodology   测试方法：先保证语义一致，再比较性能
#architecture  共享 Core 的边界怎么划
#ios           iOS：Framework 足够快，C ABI 留给高频批量通道
#android       Android：直接使用 KMP/JVM
#harmony       HarmonyOS：运行时和桥接路径决定内存底座
#memory        高频数据链路的七条内存治理规则
#selection     最终工程选型
#limits        适用边界与后续验证
```

页面至少包含 8 个 `data-performance-chart`：iOS 尾部延迟、iOS 吞吐、iOS 最高内存、Android 尾部延迟、Android 最高内存、HarmonyOS 全流程最高内存、KNOI 优化阶梯、CPF 长稳关键节点。架构图和最终选型矩阵使用语义化 HTML，不依赖图片。

样式文件定义文章专属 `kmp-paper-*` 类，覆盖：宽屏双栏数据卡、CSS 横向柱图、响应式数据表、深色模式、打印模式、`prefers-reduced-motion` 和 820/520 像素断点。

- [ ] **Step 5: 新增无前缀兼容页并验证目标测试**

```astro
---
import BaseLayout from '../../../components/BaseLayout.astro';
import KmpThreePlatformPerformanceArticle from '../../../components/KmpThreePlatformPerformanceArticle.astro';
import { KMP_ARTICLE_META } from '../../../content/kmpThreePlatformPerformance.mjs';
---
<BaseLayout title={`${KMP_ARTICLE_META.title} - MrFung`} description={KMP_ARTICLE_META.description}>
  <KmpThreePlatformPerformanceArticle />
</BaseLayout>
```

Run: `cd site && npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts --project=desktop-chrome`

Expected: 文章渲染测试通过；本地化路由测试仍失败，等待 Task 3 接入。

- [ ] **Step 6: 提交页面主体**

```bash
git add site/src/components/KmpComparisonChart.astro site/src/components/KmpThreePlatformPerformanceArticle.astro site/src/styles/kmpThreePlatformPerformance.css site/src/pages/writing/kmp-three-platform-performance/index.astro site/tests/e2e/kmp-three-platform-performance.spec.ts
git commit -m "发布 KMP 三端性能技术白皮书页面"
```

---

### Task 3: 接入 12 种语言外壳和站点入口

**Files:**
- Modify: `site/src/components/LocalizedPage.astro`
- Modify: `site/src/pages/[locale]/[...path].astro`
- Modify: `site/src/pages/writing/index.astro`
- Modify: `site/src/pages/sitemap.txt.ts`
- Modify: `site/public/rss.xml`
- Modify: `site/public/atom.xml`
- Modify: `README.md`
- Modify: `site/tests/e2e/kmp-three-platform-performance.spec.ts`

**Interfaces:**
- Consumes: 文章组件和 `KMP_ARTICLE_META`。
- Produces: 12 个正式本地化文章地址、首页和文章目录入口、订阅项和 sitemap 地址。

- [ ] **Step 1: 扩展失败测试覆盖站点集成**

```ts
for (const locale of ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'it', 'ru', 'ar']) {
  test(`${locale} shell keeps the Chinese KMP original`, async ({ page }) => {
    await page.goto(`/${locale}/writing/kmp-three-platform-performance/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('article[lang="zh-Hans"]')).toContainText('一份 Core，三种高频边界');
  });
}

test('home, writing index and sitemap publish the KMP article', async ({ page }) => {
  await page.goto('/zh-Hans/');
  await expect(page.getByRole('link', { name: /Kotlin Multiplatform 三端高频数据 Core/ })).toBeVisible();
  await page.goto('/zh-Hans/writing/');
  await expect(page.getByRole('link', { name: /Kotlin Multiplatform 三端高频数据 Core/ })).toBeVisible();
  const sitemap = await (await page.request.get('/sitemap.txt')).text();
  expect(sitemap).toContain('/ar/writing/kmp-three-platform-performance/');
});
```

- [ ] **Step 2: 运行测试并确认本地化地址与入口缺失**

Run: `cd site && npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts --project=desktop-chrome`

Expected: 本地化路由或入口断言失败。

- [ ] **Step 3: 接入路由和复用组件**

在 `[...path].astro` 和 `sitemap.txt.ts` 的 `routePaths` 中加入：

```js
'/writing/kmp-three-platform-performance/'
```

在 `LocalizedPage.astro` 中新增 `isKmpArticle`，标题/description 使用 `KMP_ARTICLE_META`；首页和文章目录各增加带 `Technology · KMP` 标签的文章卡；命中该路由时渲染同一个 `<KmpThreePlatformPerformanceArticle />`。

- [ ] **Step 4: 接入兼容文章目录、订阅源和 README**

无前缀文章目录增加同一中文标题与摘要。RSS 新增 `<item>`，Atom 新增 `<entry>`，发布日期统一为 `2026-07-21T00:00:00+08:00`，链接统一使用 `https://www.mrfung.cn/zh-Hans/writing/kmp-three-platform-performance/`。README 记录该文章为中文原文且全部图表无外部依赖。

- [ ] **Step 5: 运行目标测试并提交**

Run: `cd site && npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts`

Expected: 桌面与移动项目全部通过。

```bash
git add site/src/components/LocalizedPage.astro 'site/src/pages/[locale]/[...path].astro' site/src/pages/writing/index.astro site/src/pages/sitemap.txt.ts site/public/rss.xml site/public/atom.xml README.md site/tests/e2e/kmp-three-platform-performance.spec.ts
git commit -m "接入 KMP 技术文章多语言页面与订阅入口"
```

---

### Task 4: 完整验证并生成 GitHub Pages 静态产物

**Files:**
- Modify: 根目录构建产物（由 `site/dist` 生成）

**Interfaces:**
- Consumes: Task 1—3 的 Astro 源码。
- Produces: 可由 GitHub Pages 直接托管的根目录静态站点。

- [ ] **Step 1: 运行内容边界扫描**

Run:

```bash
rg -n 'iFinD|IFM-[0-9]+|ifind_git|自选股|债券|WebSocket内存排查|/Users/' site/src/components/KmpThreePlatformPerformanceArticle.astro site/src/content/kmpThreePlatformPerformance.mjs site/src/styles/kmpThreePlatformPerformance.css
```

Expected: 0 matches。

- [ ] **Step 2: 运行完整测试**

Run: `cd site && npm run test:unit`

Expected: 0 failure。

Run: `cd site && npm run test:e2e`

Expected: 0 failure，桌面与移动端均通过。

- [ ] **Step 3: 构建正式站点**

Run: `cd site && npm run build`

Expected: Astro 静态构建成功，`site/dist/zh-Hans/writing/kmp-three-platform-performance/index.html` 存在。

- [ ] **Step 4: 同步发布产物**

从 `site/dist` 向仓库根目录同步以下生成内容：根 `index.html`、`404.html`、12 个语言目录、`writing/`、`apps/`、`about/`、两款 App 目录、`assets/`、`rss.xml`、`atom.xml`、`sitemap.txt`、`robots.txt`、`CNAME`。不删除 `.git`、`.worktrees`、`site`、`docs` 和 README。

- [ ] **Step 5: 验证静态产物**

```bash
test -f zh-Hans/writing/kmp-three-platform-performance/index.html
test -f ar/writing/kmp-three-platform-performance/index.html
rg -n '83\.39 MiB|一份 Core，三种高频边界' zh-Hans/writing/kmp-three-platform-performance/index.html
rg -n 'kmp-three-platform-performance' sitemap.txt rss.xml atom.xml
```

Expected: 全部命令退出 0，且无本地绝对路径或被排除业务词。

- [ ] **Step 6: 提交正式产物**

```bash
git add 404.html index.html about apps billloopr rosterslate writing en zh-Hans zh-Hant ja ko es fr de pt-BR it ru ar assets rss.xml atom.xml sitemap.txt robots.txt CNAME
git commit -m "生成 KMP 技术文章 GitHub Pages 页面"
```

---

### Task 5: 合并、推送并验证线上地址

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: 通过验证的功能分支提交。
- Produces: `origin/master` 上可公开访问的 GitHub Pages 文章。

- [ ] **Step 1: 核对提交范围**

Run: `git diff --stat master...HEAD`

Expected: 只包含设计/计划、KMP 文章源代码、测试、入口和构建产物，不包含其它文章的额外变动。

- [ ] **Step 2: 合并回 master**

在主工作区确认无冲突后执行 `git merge --ff-only feature/kmp-performance-article`；如主分支在期间新增提交，先把主分支合入功能分支、重跑完整测试，再快进合并。

- [ ] **Step 3: 推送 GitHub Pages**

Run: `git push origin master`

Expected: `master -> master` 成功。

- [ ] **Step 4: 验证线上发布**

检查：

```text
https://www.mrfung.cn/zh-Hans/writing/kmp-three-platform-performance/
https://www.mrfung.cn/en/writing/kmp-three-platform-performance/
https://www.mrfung.cn/sitemap.txt
https://www.mrfung.cn/rss.xml
```

Expected: HTTP 200，文章标题、8 张性能图表、83.39 MiB 关键值、中文原文和站点入口均可见。
