# 《雪满楼》作品页实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 MrFung 网站发布郭清枫原创诗作《雪满楼》，提供与诗意一致的雪景、克制的下雪动画、中性作品解读和完整版权声明。

**Architecture:** 使用独立内容模块锁定原诗、解读和版权文本；使用单一 Astro 文章组件渲染无前缀页与 12 个本地化外壳；使用页面专属内联 CSS 实现原创矢量雪景、动画、响应式、深色模式、打印与减少动态效果。沿用现有 `BaseLayout`、`LocalizedPage`、静态路由、RSS、Atom 和 sitemap 机制，不引入第三方依赖。

**Tech Stack:** Astro 7、JavaScript ES Modules、HTML/CSS、Node.js `node:test`、Playwright、GitHub Pages 静态导出。

## Global Constraints

- 原诗逐字、逐标点、逐行与整理稿一致。
- 标题固定为《雪满楼》，作者固定为郭清枫，创作日期固定为 `2016.12.7`。
- 所有语言地址均保留同一份简体中文原诗、作品解读和版权声明，不制作译文。
- 解读区标题固定为“作品解读”，页面不得出现“我的理解”“我认为”“在我看来”“我的推荐”等第一人称评述。
- 版权声明必须包含禁止未经授权转载、复制、改编、商业使用及 AI 模型训练、语料库或数据集使用的完整条款。
- 雪花仅覆盖首屏，使用 CSS 动画；`prefers-reduced-motion: reduce` 时停止移动。
- 首屏图景必须包含木楼、栏杆、雪山、白地和飘雪，不引用外部图片、字体、CDN 或运行时请求。
- 不增加第三方依赖、追踪脚本、评论、点赞、复制、下载、背景音乐、视差或鼠标跟随能力。
- 新增代码文件和单个函数遵守项目复杂度限制；代码、文档、注释和提交信息使用中文。
- 不创建新分支，直接在当前 `master` 分支按任务提交。

---

## 文件结构

### 新增

- `site/src/content/snowFullTower.mjs`：作品标题、作者、日期、摘要、原诗、解读和版权的唯一事实源。
- `site/src/components/SnowFullTowerArticle.astro`：雪景首屏、原诗、解读、版权区的语义结构。
- `site/src/styles/snowFullTower.css`：页面专属雪景、雪花动画、响应式、深色、打印与减少动态效果。
- `site/src/pages/writing/snow-full-tower/index.astro`：无前缀兼容页面。
- `site/tests/unit/snow-full-tower-content.test.mjs`：原诗、署名、日期、解读语气、版权和样式约束的锁定测试。
- `site/tests/e2e/snow-full-tower.spec.ts`：真实浏览器中的内容、路由、动画、移动端、入口和订阅验证。

### 修改

- `site/src/components/LocalizedPage.astro`：识别作品页、加载专属样式、渲染组件、增加首页和文章目录入口。
- `site/src/pages/[locale]/[...path].astro`：生成 12 个本地化作品地址。
- `site/src/pages/index.astro`：无前缀首页增加作品入口。
- `site/src/pages/writing/index.astro`：无前缀文章目录增加作品入口。
- `site/src/pages/sitemap.txt.ts`：收录本地化作品地址。
- `site/public/rss.xml`：增加作品订阅项并更新构建日期。
- `site/public/atom.xml`：增加作品订阅项并更新 feed 时间。
- `README.md`：记录原创诗歌发布规则和作品页。
- 仓库根目录构建产物：由 `site/dist` 同步生成。

---

### Task 1：锁定作品内容事实源

**Files:**

- Create: `site/tests/unit/snow-full-tower-content.test.mjs`
- Create: `site/src/content/snowFullTower.mjs`

**Interfaces:**

- Produces: `SNOW_FULL_TOWER_META`、`SNOW_FULL_TOWER_STANZAS`、`SNOW_FULL_TOWER_INTERPRETATION`、`SNOW_FULL_TOWER_COPYRIGHT`。
- `SNOW_FULL_TOWER_META` 包含 `title`、`author`、`createdAt`、`createdAtDisplay`、`publishedAt`、`description`、`summary`、`path`。
- `SNOW_FULL_TOWER_STANZAS` 是冻结的二维字符串数组。
- `SNOW_FULL_TOWER_INTERPRETATION` 包含 `lead`、`sections`、`closing`、`closingNote`。
- `SNOW_FULL_TOWER_COPYRIGHT` 包含 `notice`、`terms`、`email`。

- [ ] **Step 1：编写失败的内容锁定测试**

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SNOW_FULL_TOWER_COPYRIGHT,
  SNOW_FULL_TOWER_INTERPRETATION,
  SNOW_FULL_TOWER_META,
  SNOW_FULL_TOWER_STANZAS,
} from '../../src/content/snowFullTower.mjs';

const expectedStanzas = [
  ['木楼，', '独倚栏杆；', '远望，', '天清地阔，', '雪山成片；', '仿似世间唯一人，', '单手可揽天下。'],
  ['蓦然飘雪，', '沾了衣，', '惹了楼，', '白地三千里，', '不及念你一缕思绪。'],
  ['雪已满楼，', '披衣离去，', '来日为你再登楼。'],
];

test('锁定雪满楼原诗、署名和日期', () => {
  assert.equal(SNOW_FULL_TOWER_META.title, '雪满楼');
  assert.equal(SNOW_FULL_TOWER_META.author, '郭清枫');
  assert.equal(SNOW_FULL_TOWER_META.createdAt, '2016.12.7');
  assert.equal(SNOW_FULL_TOWER_META.path, '/writing/snow-full-tower/');
  assert.deepEqual(SNOW_FULL_TOWER_STANZAS, expectedStanzas);
});

test('作品解读保持中性语气', () => {
  const copy = JSON.stringify(SNOW_FULL_TOWER_INTERPRETATION);
  assert.doesNotMatch(copy, /我的理解|我认为|在我看来|我的推荐/);
  assert.equal(SNOW_FULL_TOWER_INTERPRETATION.sections.length, 3);
  assert.equal(SNOW_FULL_TOWER_INTERPRETATION.closing, '雪满的既是楼，也是一个人的心。');
});

test('版权条款锁定作者权利与授权方式', () => {
  assert.equal(SNOW_FULL_TOWER_COPYRIGHT.notice, '© 郭清枫。保留所有权利。');
  assert.match(SNOW_FULL_TOWER_COPYRIGHT.terms, /未经作者事先书面授权/);
  assert.match(SNOW_FULL_TOWER_COPYRIGHT.terms, /人工智能模型训练、语料库或数据集/);
  assert.equal(SNOW_FULL_TOWER_COPYRIGHT.email, 'MrFung1231@icloud.com');
});
```

- [ ] **Step 2：运行测试并确认因模块不存在而失败**

Run:

```bash
cd site
node --test tests/unit/snow-full-tower-content.test.mjs
```

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND` 和 `snowFullTower.mjs`。

- [ ] **Step 3：实现唯一内容事实源**

```js
export const SNOW_FULL_TOWER_META = Object.freeze({
  title: '雪满楼',
  author: '郭清枫',
  createdAt: '2016.12.7',
  createdAtDisplay: '二〇一六年十二月七日',
  publishedAt: '2026-07-25',
  description: '郭清枫原创诗作《雪满楼》：从天地辽阔，回到一人思念。',
  summary: '一场从天地辽阔，回到一人思念的雪。',
  path: '/writing/snow-full-tower/',
});

export const SNOW_FULL_TOWER_STANZAS = Object.freeze([
  Object.freeze([
    '木楼，',
    '独倚栏杆；',
    '远望，',
    '天清地阔，',
    '雪山成片；',
    '仿似世间唯一人，',
    '单手可揽天下。',
  ]),
  Object.freeze([
    '蓦然飘雪，',
    '沾了衣，',
    '惹了楼，',
    '白地三千里，',
    '不及念你一缕思绪。',
  ]),
  Object.freeze([
    '雪已满楼，',
    '披衣离去，',
    '来日为你再登楼。',
  ]),
]);

export const SNOW_FULL_TOWER_INTERPRETATION = Object.freeze({
  lead: '这是一首从“拥有天下”的想象，走向“放不下一个人”的诗。开头辽阔而孤高，雪落之后，天地忽然有了触感，万里山河也被收束成一缕思念。',
  sections: Object.freeze([
    Object.freeze({
      index: '一',
      eyebrow: '孤高',
      title: '木楼上的唯一人',
      body: '木楼、栏杆、雪山与天地，共同把人物托举到一个高而远的位置。“单手可揽天下”既有豪气，也暴露出无人相伴的寂寥。',
    }),
    Object.freeze({
      index: '二',
      eyebrow: '收束',
      title: '三千里与一缕思绪',
      body: '“白地三千里”极重、极广，“一缕思绪”极轻、极细。两者相对，思念反而压过整片雪原，成为全诗真正的重量。',
    }),
    Object.freeze({
      index: '三',
      eyebrow: '等待',
      title: '离去，却没有放下',
      body: '“披衣离去”不是结束。“来日为你再登楼”让木楼变成记忆与等待的场所：人暂时离开，心仍留在雪中。',
    }),
  ]),
  closing: '雪满的既是楼，也是一个人的心。',
  closingNote: '情绪从孤高、豪迈，经由触景与思念，最后落在克制的离去和漫长的等待上。',
});

export const SNOW_FULL_TOWER_COPYRIGHT = Object.freeze({
  notice: '© 郭清枫。保留所有权利。',
  terms: '本作品为郭清枫原创。除法律法规另有规定外，未经作者事先书面授权，任何个人或机构不得转载、复制、摘编、改编、翻译、汇编、发行、通过信息网络传播、用于商业用途，亦不得用于人工智能模型训练、语料库或数据集。经授权使用时，须完整保留作者署名、作品名称、原文链接和本版权声明。',
  email: 'MrFung1231@icloud.com',
});
```

- [ ] **Step 4：运行内容测试并确认通过**

Run:

```bash
cd site
node --test tests/unit/snow-full-tower-content.test.mjs
```

Expected: 3 tests PASS。

- [ ] **Step 5：提交内容事实源**

```bash
git add site/src/content/snowFullTower.mjs site/tests/unit/snow-full-tower-content.test.mjs
git commit -m "锁定雪满楼作品内容"
```

---

### Task 2：实现作品页、雪景与下雪动画

**Files:**

- Create: `site/tests/e2e/snow-full-tower.spec.ts`
- Create: `site/src/components/SnowFullTowerArticle.astro`
- Create: `site/src/styles/snowFullTower.css`
- Create: `site/src/pages/writing/snow-full-tower/index.astro`
- Modify: `site/tests/unit/snow-full-tower-content.test.mjs`

**Interfaces:**

- Consumes: Task 1 导出的四个 `SNOW_FULL_TOWER_*` 常量。
- Produces: `<SnowFullTowerArticle />`，根节点为 `article.snow-full-tower[lang="zh-Hans"]`。
- CSS 通过 `?inline` 传给 `BaseLayout.inlineStyles`，样式标识为 `snow-full-tower`。
- 雪花容器为 `[data-snowfall]`，设置 `aria-hidden="true"`；每个雪花为 `.snow-full-tower__flake`。

- [ ] **Step 1：编写失败的首屏、原诗、版权和移动端测试**

```ts
import { expect, test } from '@playwright/test';

const articlePath = '/writing/snow-full-tower/';
const forbiddenInterpretationCopy = /我的理解|我认为|在我看来|我的推荐/;

test.use({ javaScriptEnabled: false });

test('雪满楼作品页展示完整原诗、解读和版权', async ({ page }) => {
  await page.goto(articlePath);

  await expect(page.getByRole('heading', { name: '雪满楼', level: 1 })).toBeVisible();
  await expect(page.locator('article.snow-full-tower[lang="zh-Hans"]')).toBeVisible();
  await expect(page.getByText('仿似世间唯一人，')).toBeVisible();
  await expect(page.getByText('不及念你一缕思绪。')).toBeVisible();
  await expect(page.getByText('来日为你再登楼。')).toBeVisible();
  await expect(page.getByRole('heading', { name: '作品解读' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '版权声明' })).toBeVisible();
  await expect(page.getByText('© 郭清枫。保留所有权利。')).toBeVisible();
  await expect(page.getByRole('link', { name: 'MrFung1231@icloud.com' }))
    .toHaveAttribute('href', 'mailto:MrFung1231@icloud.com');
  await expect(page.locator('body')).not.toContainText(forbiddenInterpretationCopy);
});

test('雪景与下雪层具备无障碍和减少动态效果', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(articlePath);

  await expect(page.locator('[data-snow-landscape]')).toBeVisible();
  await expect(page.locator('[data-snowfall]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.snow-full-tower__flake')).toHaveCount(18);
  await expect(page.locator('.snow-full-tower__flake').first())
    .toHaveCSS('animation-name', 'none');
});

test('雪满楼页面在移动端没有横向滚动', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(articlePath);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
```

- [ ] **Step 2：运行端到端测试并确认作品地址失败**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4331 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome
```

Expected: FAIL，页面没有 `雪满楼` 一级标题。

- [ ] **Step 3：实现作品组件**

组件实现必须包含以下完整结构，SVG 内的山峰、白地、松树、木楼屋檐和栏杆均使用原生图形：

```astro
---
import {
  SNOW_FULL_TOWER_COPYRIGHT,
  SNOW_FULL_TOWER_INTERPRETATION,
  SNOW_FULL_TOWER_META,
  SNOW_FULL_TOWER_STANZAS,
} from '../content/snowFullTower.mjs';

const snowflakes = [
  [4, 5, 12, -5, 42, 0.72],
  [9, 2, 17, -12, -30, 0.55],
  [15, 7, 11, -8, 50, 0.46],
  [21, 3, 15, -2, -36, 0.68],
  [27, 4, 13, -10, 44, 0.58],
  [34, 8, 10, -6, -48, 0.42],
  [40, 3, 18, -13, 26, 0.68],
  [46, 5, 14, -4, -54, 0.56],
  [52, 2, 16, -11, 32, 0.7],
  [58, 7, 11, -1, -42, 0.45],
  [64, 4, 15, -7, 36, 0.65],
  [70, 3, 17, -3, -30, 0.54],
  [76, 6, 12, -9, 46, 0.52],
  [82, 3, 16, -6, -24, 0.66],
  [87, 5, 13, -2, 38, 0.56],
  [91, 2, 18, -14, -32, 0.62],
  [95, 7, 11, -4, 42, 0.44],
  [98, 3, 15, -10, -28, 0.6],
];
---

<article class="snow-full-tower" lang="zh-Hans">
  <header class="snow-full-tower__hero">
    <svg
      class="snow-full-tower__landscape"
      data-snow-landscape
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="木楼栏杆之外，雪山连绵，白地辽阔"
    >
      <defs>
        <linearGradient id="snow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#526774" />
          <stop offset="48%" stop-color="#93a4aa" />
          <stop offset="100%" stop-color="#d9dedc" />
        </linearGradient>
        <linearGradient id="snow-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eef1ef" />
          <stop offset="100%" stop-color="#b9c3c4" />
        </linearGradient>
      </defs>
      <rect width="1440" height="820" fill="url(#snow-sky)" />
      <circle cx="1120" cy="180" r="88" fill="#edf1ef" opacity="0.4" />
      <path d="M0 450 L180 310 L330 405 L520 220 L710 410 L880 278 L1095 430 L1260 320 L1440 450 L1440 820 L0 820 Z" fill="#d5dcdb" />
      <path d="M0 492 L195 356 L340 448 L518 276 L706 458 L884 332 L1090 475 L1265 372 L1440 472 L1440 820 L0 820 Z" fill="#aebcbe" />
      <path d="M0 560 C230 500 420 570 620 510 C830 448 1040 546 1440 470 L1440 820 L0 820 Z" fill="url(#snow-ground)" />
      <path d="M0 680 C350 620 740 700 1100 620 C1240 590 1350 610 1440 602 L1440 820 L0 820 Z" fill="#f5f5f0" opacity="0.82" />
      <g class="snow-full-tower__trees">
        <path d="M925 564 l18 -64 l18 64 h-11 l15 44 h-44 l15 -44z" />
        <path d="M1025 550 l15 -52 l15 52 h-9 l13 38 h-38 l13 -38z" />
        <path d="M1165 565 l17 -61 l17 61 h-10 l14 41 h-42 l14 -41z" />
      </g>
      <g class="snow-full-tower__wood">
        <rect x="0" y="0" width="82" height="820" />
        <rect x="0" y="44" width="500" height="54" />
        <path d="M0 96 L520 96 L445 154 L0 154 Z" />
        <rect x="0" y="650" width="1440" height="38" />
        <rect x="140" y="648" width="34" height="172" />
        <rect x="510" y="648" width="34" height="172" />
        <rect x="880" y="648" width="34" height="172" />
        <rect x="1250" y="648" width="34" height="172" />
        <path class="snow-full-tower__rail" d="M72 716 H1410 M150 660 V820 M520 660 V820 M890 660 V820 M1260 660 V820" />
      </g>
    </svg>

    <div class="snow-full-tower__snowfall" data-snowfall aria-hidden="true">
      {snowflakes.map(([left, size, duration, delay, sway, opacity]) => (
        <span
          class="snow-full-tower__flake"
          style={`--flake-left:${left}%;--flake-size:${size}px;--flake-duration:${duration}s;--flake-delay:${delay}s;--flake-sway:${sway}px;--flake-end-sway:${Math.round(sway * -0.35)}px;--flake-opacity:${opacity}`}
        />
      ))}
    </div>

    <div class="snow-full-tower__hero-copy">
      <p class="snow-full-tower__kicker">{SNOW_FULL_TOWER_META.author} · 原创诗作</p>
      <h1>{SNOW_FULL_TOWER_META.title}</h1>
      <p class="snow-full-tower__date">{SNOW_FULL_TOWER_META.createdAtDisplay}</p>
      <p class="snow-full-tower__hero-line">仿似世间唯一人，单手可揽天下。</p>
    </div>
  </header>

  <section class="snow-full-tower__poem-section" aria-labelledby="snow-poem-heading">
    <div class="snow-full-tower__poem-inner">
      <h2 id="snow-poem-heading" class="snow-full-tower__section-label">原诗</h2>
      <div class="snow-full-tower__poem">
        {SNOW_FULL_TOWER_STANZAS.map((stanza) => (
          <div class="snow-full-tower__stanza">
            {stanza.map((line) => <p>{line}</p>)}
          </div>
        ))}
      </div>
      <p class="snow-full-tower__signature">
        {SNOW_FULL_TOWER_META.author} · {SNOW_FULL_TOWER_META.createdAt}
      </p>
    </div>
  </section>

  <section class="snow-full-tower__interpretation" aria-labelledby="snow-interpretation-heading">
    <div class="snow-full-tower__interpretation-inner">
      <div class="snow-full-tower__interpretation-header">
        <h2 id="snow-interpretation-heading">作品解读</h2>
        <p>{SNOW_FULL_TOWER_INTERPRETATION.lead}</p>
      </div>
      <div class="snow-full-tower__interpretation-grid">
        {SNOW_FULL_TOWER_INTERPRETATION.sections.map((section) => (
          <section class="snow-full-tower__reading-note">
            <p class="snow-full-tower__note-index">{section.index} · {section.eyebrow}</p>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  </section>

  <section class="snow-full-tower__closing" aria-label="作品解读结语">
    <blockquote>{SNOW_FULL_TOWER_INTERPRETATION.closing}</blockquote>
    <p>{SNOW_FULL_TOWER_INTERPRETATION.closingNote}</p>
  </section>

  <section class="snow-full-tower__copyright" aria-labelledby="snow-copyright-heading">
    <div class="snow-full-tower__copyright-inner">
      <h2 id="snow-copyright-heading">版权声明</h2>
      <p>{SNOW_FULL_TOWER_COPYRIGHT.notice}</p>
      <p>{SNOW_FULL_TOWER_COPYRIGHT.terms}</p>
      <p>授权联系：<a href={`mailto:${SNOW_FULL_TOWER_COPYRIGHT.email}`}>{SNOW_FULL_TOWER_COPYRIGHT.email}</a></p>
    </div>
  </section>
</article>
```

- [ ] **Step 4：实现页面专属样式**

`site/src/styles/snowFullTower.css` 必须以 `.snow-full-tower` 为根作用域，包含以下完整行为：

```css
.snow-full-tower {
  --snow-ink: #273038;
  --snow-muted: #69747c;
  --snow-paper: #f8f7f2;
  --snow-paper-deep: #eeeae0;
  --snow-wood: #382f2a;
  --snow-gold: #9b7952;
  overflow: hidden;
  color: var(--snow-ink);
  background: var(--snow-paper);
  font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
}

.snow-full-tower p { margin: 0; color: inherit; }
.snow-full-tower__hero {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  isolation: isolate;
  background: #72808a;
}
.snow-full-tower__landscape {
  position: absolute;
  z-index: -3;
  inset: 0;
  width: 100%;
  height: 100%;
}
.snow-full-tower__hero::before {
  position: absolute;
  z-index: -2;
  inset: 0;
  content: "";
  background:
    linear-gradient(90deg, rgba(17, 23, 26, 0.76), rgba(17, 23, 26, 0.26) 52%, rgba(17, 23, 26, 0.05)),
    linear-gradient(0deg, rgba(18, 22, 23, 0.48), transparent 46%);
}
.snow-full-tower__trees { fill: #4d5555; opacity: 0.62; }
.snow-full-tower__wood { fill: #251f1c; }
.snow-full-tower__rail { fill: none; stroke: #4a3b33; stroke-width: 14; }
.snow-full-tower__hero-copy {
  width: min(1100px, calc(100% - 44px));
  margin: 0 auto;
  padding: 170px 0 96px;
  color: #f9fbfc;
}
.snow-full-tower__kicker,
.snow-full-tower__date {
  color: rgba(249, 251, 252, 0.78);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0.16em;
}
.snow-full-tower__hero h1 {
  margin: 28px 0 18px;
  color: #fff;
  font-size: clamp(3.8rem, 10vw, 7.8rem);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: 0.14em;
  text-shadow: 0 8px 32px rgba(12, 17, 20, 0.36);
}
.snow-full-tower__hero-line {
  max-width: 24em;
  margin-top: 76px;
  color: rgba(249, 251, 252, 0.9);
  font-size: clamp(1.1rem, 2vw, 1.42rem);
  line-height: 1.9;
  letter-spacing: 0.06em;
}
.snow-full-tower__snowfall {
  position: absolute;
  z-index: 6;
  inset: -12% 0 0;
  pointer-events: none;
}
.snow-full-tower__flake {
  position: absolute;
  top: -8%;
  left: var(--flake-left);
  width: var(--flake-size);
  height: var(--flake-size);
  border-radius: 50%;
  opacity: var(--flake-opacity);
  background: #fff;
  animation: snow-full-tower-drift var(--flake-duration) linear var(--flake-delay) infinite;
}
@keyframes snow-full-tower-drift {
  0% { transform: translate3d(0, -10%, 0); }
  50% { transform: translate3d(var(--flake-sway), 55vh, 0); }
  100% { transform: translate3d(var(--flake-end-sway), 118vh, 0); }
}
.snow-full-tower__poem-section {
  background:
    radial-gradient(circle at 88% 4%, rgba(155, 121, 82, 0.08), transparent 24%),
    var(--snow-paper);
}
.snow-full-tower__poem-inner {
  width: min(760px, calc(100% - 44px));
  margin: 0 auto;
  padding: 142px 0 132px;
}
.snow-full-tower__section-label {
  margin: 0 0 54px;
  color: var(--snow-gold);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-align: center;
}
.snow-full-tower__poem {
  font-size: clamp(1.1rem, 2.1vw, 1.34rem);
  line-height: 2.2;
  letter-spacing: 0.08em;
  text-align: center;
}
.snow-full-tower__stanza + .snow-full-tower__stanza { margin-top: 42px; }
.snow-full-tower__signature {
  margin-top: 68px;
  color: var(--snow-muted);
  text-align: center;
}
.snow-full-tower__interpretation {
  padding: 116px 0 126px;
  background: var(--snow-paper-deep);
}
.snow-full-tower__interpretation-inner,
.snow-full-tower__copyright-inner {
  width: min(980px, calc(100% - 44px));
  margin: 0 auto;
}
.snow-full-tower__interpretation-header {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(36px, 8vw, 96px);
}
.snow-full-tower__interpretation h2 {
  margin: 0;
  color: var(--snow-ink);
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 500;
}
.snow-full-tower__interpretation-header > p {
  font-size: clamp(1.15rem, 2vw, 1.42rem);
  line-height: 1.9;
}
.snow-full-tower__interpretation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 38px;
  margin-top: 86px;
  padding-top: 44px;
  border-top: 1px solid rgba(39, 48, 56, 0.18);
}
.snow-full-tower__note-index { color: var(--snow-gold); }
.snow-full-tower__reading-note h3 {
  margin: 20px 0 14px;
  color: var(--snow-ink);
  font-weight: 500;
}
.snow-full-tower__reading-note > p:last-child {
  color: var(--snow-muted);
  line-height: 1.85;
}
.snow-full-tower__closing {
  width: min(760px, calc(100% - 44px));
  margin: 0 auto;
  padding: 136px 0;
  text-align: center;
}
.snow-full-tower__closing blockquote {
  margin: 0;
  color: var(--snow-ink);
  font-size: clamp(1.7rem, 4vw, 3rem);
  line-height: 1.65;
}
.snow-full-tower__closing p {
  margin-top: 28px;
  color: var(--snow-muted);
  line-height: 1.85;
}
.snow-full-tower__copyright {
  color: #d9ddde;
  background: var(--snow-wood);
}
.snow-full-tower__copyright-inner { padding: 72px 0; }
.snow-full-tower__copyright h2 {
  margin: 0 0 24px;
  color: #fff;
  font-size: 1.18rem;
  font-weight: 500;
}
.snow-full-tower__copyright p {
  max-width: 62em;
  color: rgba(242, 244, 244, 0.76);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.85;
}
.snow-full-tower__copyright p + p { margin-top: 16px; }
.snow-full-tower__copyright a { color: #fff; text-decoration: underline; }
[dir="rtl"] .snow-full-tower { direction: ltr; }

@media (prefers-color-scheme: dark) {
  .snow-full-tower {
    --snow-ink: #edf1f0;
    --snow-muted: #b9c2c3;
    --snow-paper: #171b1d;
    --snow-paper-deep: #202426;
    --snow-wood: #171311;
    --snow-gold: #c7a77f;
  }
  .snow-full-tower__interpretation-grid {
    border-top-color: rgba(237, 241, 240, 0.18);
  }
}
@media (max-width: 720px) {
  .snow-full-tower__hero { min-height: 640px; }
  .snow-full-tower__hero-copy { padding-bottom: 72px; }
  .snow-full-tower__hero-line { margin-top: 52px; }
  .snow-full-tower__interpretation-header,
  .snow-full-tower__interpretation-grid { grid-template-columns: 1fr; }
  .snow-full-tower__interpretation-grid { gap: 42px; margin-top: 58px; }
}
@media (prefers-reduced-motion: reduce) {
  .snow-full-tower__flake { animation: none; }
}
@media print {
  .snow-full-tower__flake { display: none; }
  .snow-full-tower__hero { min-height: auto; background: #fff; }
  .snow-full-tower__hero-copy { padding: 72px 0; color: #111; }
  .snow-full-tower__hero h1,
  .snow-full-tower__kicker,
  .snow-full-tower__date,
  .snow-full-tower__hero-line { color: #111; text-shadow: none; }
  .snow-full-tower__landscape,
  .snow-full-tower__hero::before { display: none; }
  .snow-full-tower__copyright { color: #111; background: #fff; }
  .snow-full-tower__copyright h2,
  .snow-full-tower__copyright p,
  .snow-full-tower__copyright a { color: #111; }
}
```

- [ ] **Step 5：增加无前缀页面**

```astro
---
import BaseLayout from '../../../components/BaseLayout.astro';
import SnowFullTowerArticle from '../../../components/SnowFullTowerArticle.astro';
import { SNOW_FULL_TOWER_META } from '../../../content/snowFullTower.mjs';
import snowFullTowerCss from '../../../styles/snowFullTower.css?inline';
---

<BaseLayout
  title={`${SNOW_FULL_TOWER_META.title} - ${SNOW_FULL_TOWER_META.author}`}
  description={SNOW_FULL_TOWER_META.description}
  inlineStyles={[{ id: 'snow-full-tower', css: snowFullTowerCss }]}
>
  <SnowFullTowerArticle />
</BaseLayout>
```

- [ ] **Step 6：扩展单元测试锁定 CSS 约束**

```js
import { readFile } from 'node:fs/promises';

const stylesheetUrl = new URL('../../src/styles/snowFullTower.css', import.meta.url);

test('雪花样式包含减少动态效果与打印回退', async () => {
  const css = await readFile(stylesheetUrl, 'utf8');
  assert.match(css, /@keyframes snow-full-tower-drift/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.snow-full-tower__flake\s*\{\s*animation:\s*none/);
  assert.match(css, /@media print/);
  assert.doesNotMatch(css, /https?:\/\//);
});
```

- [ ] **Step 7：运行单元测试和三条页面测试**

Run:

```bash
cd site
node --test tests/unit/snow-full-tower-content.test.mjs
PLAYWRIGHT_PORT=4331 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome
```

Expected: unit 4 tests PASS；e2e 3 tests PASS。

- [ ] **Step 8：提交作品页主体**

```bash
git add site/src/components/SnowFullTowerArticle.astro site/src/styles/snowFullTower.css site/src/pages/writing/snow-full-tower/index.astro site/tests/unit/snow-full-tower-content.test.mjs site/tests/e2e/snow-full-tower.spec.ts
git commit -m "发布雪满楼作品页主体"
```

---

### Task 3：接入本地化路由、首页与文章目录

**Files:**

- Modify: `site/tests/e2e/snow-full-tower.spec.ts`
- Modify: `site/src/components/LocalizedPage.astro`
- Modify: `site/src/pages/[locale]/[...path].astro`
- Modify: `site/src/pages/index.astro`
- Modify: `site/src/pages/writing/index.astro`

**Interfaces:**

- Consumes: `SNOW_FULL_TOWER_META`、`SnowFullTowerArticle`、`snowFullTowerCss`。
- `LocalizedPage` 新增 `isSnowFullTowerArticle` 分支。
- 所有入口链接均使用 `SNOW_FULL_TOWER_META.path`，本地化入口通过 `localizedPath(locale, path)` 生成。

- [ ] **Step 1：先增加失败的本地化路由与站内入口测试**

```ts
const locales = [
  'en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es',
  'fr', 'de', 'pt-BR', 'it', 'ru', 'ar',
];

for (const locale of locales) {
  test(`${locale} 外壳保留雪满楼中文原文`, async ({ page }) => {
    await page.goto(`/${locale}${articlePath}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('article[lang="zh-Hans"]')).toContainText('白地三千里，');
    await expect(page.getByRole('heading', { name: '作品解读' })).toBeVisible();
  });
}

test('无前缀作品地址沿用浏览器语言跳转', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: true,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.goto(articlePath);
  await expect(page).toHaveURL('/zh-Hans/writing/snow-full-tower/');
  await context.close();
});

test('首页和文章目录发布雪满楼入口', async ({ page }) => {
  for (const path of ['/zh-Hans/', '/zh-Hans/writing/', '/', '/writing/']) {
    await page.goto(path);
    const card = page.locator('.article-card').filter({ hasText: '雪满楼' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('一场从天地辽阔，回到一人思念的雪。');
  }
});

test('作品页专属样式不污染关于页', async ({ page }) => {
  const articleStyles = () =>
    page.locator('style[data-page-stylesheet="snow-full-tower"]');

  await page.goto('/de/about/');
  await expect(articleStyles()).toHaveCount(0);

  await page.goto('/de/writing/snow-full-tower/');
  await expect(articleStyles()).toHaveCount(1);
});
```

- [ ] **Step 2：运行新增测试并确认本地化地址和入口失败**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4332 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome
```

Expected: FAIL，本地化作品地址 404 或首页找不到《雪满楼》卡片。

- [ ] **Step 3：在 LocalizedPage 接入作品组件和元数据**

在 frontmatter 增加：

```astro
import SnowFullTowerArticle from './SnowFullTowerArticle.astro';
import { SNOW_FULL_TOWER_META } from '../content/snowFullTower.mjs';
import snowFullTowerCss from '../styles/snowFullTower.css?inline';

const isSnowFullTowerArticle = routePath === SNOW_FULL_TOWER_META.path;
```

标题、描述与样式数组改为明确分支：

```astro
const title = isSnowFullTowerArticle
  ? `${SNOW_FULL_TOWER_META.title} - ${SNOW_FULL_TOWER_META.author}`
  : isKmpArticle
    ? `${KMP_ARTICLE_META.title} - MrFung`
    : isMonsterSunArticle
      ? '怪兽小太阳驿站设计 - MrFung'
      : isHome
        ? messages.site.meta.title
        : isApps
          ? `${messages.site.apps.title} - MrFung`
          : isAbout
            ? `${messages.site.about.title} - MrFung`
            : isWriting || isSelfArticle
              ? `${messages.site.writing.title} - MrFung`
              : `${isPrivacy ? app.privacy.title : isSupport ? app.support.title : appName} - MrFung`;

const description = isSnowFullTowerArticle
  ? SNOW_FULL_TOWER_META.description
  : isKmpArticle
    ? KMP_ARTICLE_META.description
    : isMonsterSunArticle
      ? '怪兽小太阳越野跑公司办公、品牌展示、跑者接待、赞助商会议与沿街立面的室内设计方案。'
      : isHome
        ? messages.site.meta.description
        : app?.meta?.description ?? messages.site.meta.description;

const inlineStyles = [
  ...(isKmpArticle ? [{ id: 'kmp-three-platform-performance', css: kmpArticleCss }] : []),
  ...(isSnowFullTowerArticle ? [{ id: 'snow-full-tower', css: snowFullTowerCss }] : []),
];
```

将布局调用改为：

```astro
<BaseLayout {locale} {routePath} {title} {description} {inlineStyles} legacy={false}>
```

在文章组件分支中增加：

```astro
{isSnowFullTowerArticle && <SnowFullTowerArticle />}
```

首页和文章目录的 `.writing-list` 首位增加：

```astro
<article class="article-card">
  <div>
    <span class="lang-label">诗歌 · Poetry</span>
    <h3 lang="zh-Hans">{SNOW_FULL_TOWER_META.title}</h3>
    <p lang="zh-Hans">{SNOW_FULL_TOWER_META.summary}</p>
  </div>
  <a href={localizedPath(locale, SNOW_FULL_TOWER_META.path)}>
    {isHome ? messages.site.home.read : messages.site.writing.read}
  </a>
</article>
```

文章目录分支中的标题标签使用 `h2`，其余内容相同。

- [ ] **Step 4：把作品路径加入本地化静态路由**

```astro
const routePaths = [
  '/',
  '/apps/',
  '/about/',
  '/writing/',
  '/writing/self-introduction/',
  '/writing/monster-sun-station-design/',
  '/writing/kmp-three-platform-performance/',
  '/writing/snow-full-tower/',
  '/billloopr/',
  '/billloopr/privacy/',
  '/billloopr/support/',
  '/rosterslate/',
  '/rosterslate/privacy/',
  '/rosterslate/support/',
];
```

- [ ] **Step 5：更新无前缀首页和文章目录**

在 `site/src/pages/index.astro` 与 `site/src/pages/writing/index.astro` 中导入元数据：

```astro
import { SNOW_FULL_TOWER_META } from "../content/snowFullTower.mjs";
```

在 `.writing-list` 首位增加：

```astro
<article class="article-card">
  <div>
    <span class="lang-label">诗歌 · Poetry</span>
    <h2>{SNOW_FULL_TOWER_META.title}</h2>
    <p>{SNOW_FULL_TOWER_META.summary}</p>
  </div>
  <a href={SNOW_FULL_TOWER_META.path}>阅读 / Read</a>
</article>
```

首页使用 `h3`，文章目录使用 `h2`。

- [ ] **Step 6：运行全量作品页端到端测试**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4332 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome
```

Expected: 所有桌面作品页测试 PASS。

- [ ] **Step 7：提交本地化路由和入口**

```bash
git add site/src/components/LocalizedPage.astro site/src/pages/[locale]/[...path].astro site/src/pages/index.astro site/src/pages/writing/index.astro site/tests/e2e/snow-full-tower.spec.ts
git commit -m "接入雪满楼多语言入口"
```

---

### Task 4：接入 sitemap、RSS、Atom 与项目说明

**Files:**

- Modify: `site/tests/e2e/snow-full-tower.spec.ts`
- Modify: `site/src/pages/sitemap.txt.ts`
- Modify: `site/public/rss.xml`
- Modify: `site/public/atom.xml`
- Modify: `README.md`

**Interfaces:**

- sitemap 使用 `/writing/snow-full-tower/` 与 `SUPPORTED_LOCALES` 生成 12 个正式地址。
- RSS 与 Atom 以 `/zh-Hans/writing/snow-full-tower/` 为订阅项永久地址。
- RSS 日期使用 `Sat, 25 Jul 2026 00:00:00 +0800`。
- Atom 时间使用 `2026-07-25T00:00:00+08:00`。

- [ ] **Step 1：增加失败的发现入口测试**

```ts
test('sitemap 与订阅源收录雪满楼和版权提示', async ({ page }) => {
  const sitemap = await (await page.request.get('/sitemap.txt')).text();
  const rss = await (await page.request.get('/rss.xml')).text();
  const atom = await (await page.request.get('/atom.xml')).text();

  expect(sitemap).toContain('/en/writing/snow-full-tower/');
  expect(sitemap).toContain('/zh-Hans/writing/snow-full-tower/');
  expect(sitemap).toContain('/ar/writing/snow-full-tower/');
  expect(rss).toContain('/zh-Hans/writing/snow-full-tower/');
  expect(rss).toContain('© 郭清枫。保留所有权利。');
  expect(atom).toContain('/zh-Hans/writing/snow-full-tower/');
  expect(atom).toContain('<name>郭清枫</name>');
});
```

- [ ] **Step 2：运行发现入口测试并确认失败**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4333 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome --grep "sitemap"
```

Expected: FAIL，sitemap、RSS 或 Atom 不包含 `snow-full-tower`。

- [ ] **Step 3：更新 sitemap 路由列表**

在 `site/src/pages/sitemap.txt.ts` 的 `routePaths` 增加：

```js
'/writing/snow-full-tower/',
```

- [ ] **Step 4：在 RSS 首位增加作品项并更新日期**

```xml
<lastBuildDate>Sat, 25 Jul 2026 00:00:00 +0800</lastBuildDate>
<pubDate>Sat, 25 Jul 2026 00:00:00 +0800</pubDate>
<item>
  <title><![CDATA[雪满楼]]></title>
  <author>MrFung1231@icloud.com (郭清枫)</author>
  <description><![CDATA[一场从天地辽阔，回到一人思念的雪。© 郭清枫。保留所有权利。未经授权不得转载或使用。]]></description>
  <link>https://www.mrfung.cn/zh-Hans/writing/snow-full-tower/</link>
  <guid isPermaLink="true">https://www.mrfung.cn/zh-Hans/writing/snow-full-tower/</guid>
  <pubDate>Sat, 25 Jul 2026 00:00:00 +0800</pubDate>
</item>
```

- [ ] **Step 5：在 Atom 首位增加作品项并更新日期**

```xml
<updated>2026-07-25T00:00:00+08:00</updated>
<entry>
  <title>雪满楼</title>
  <link href="https://www.mrfung.cn/zh-Hans/writing/snow-full-tower/"/>
  <id>https://www.mrfung.cn/zh-Hans/writing/snow-full-tower/</id>
  <updated>2026-07-25T00:00:00+08:00</updated>
  <author>
    <name>郭清枫</name>
    <email>MrFung1231@icloud.com</email>
  </author>
  <rights>© 郭清枫。保留所有权利。未经授权不得转载或使用。</rights>
  <summary>一场从天地辽阔，回到一人思念的雪。</summary>
</entry>
```

- [ ] **Step 6：更新 README 的发布事实**

在“技术栈”规则中增加：

```markdown
- 原创诗作《雪满楼》以中文原文发布，包含中性作品解读、原创矢量雪景、减少动态效果兼容和郭清枫完整版权声明
- 原创作品未经郭清枫事先书面授权不得转载、复制、改编、商业使用或用于人工智能模型训练、语料库和数据集
```

在“目录”中增加：

```markdown
- `site/src/content/snowFullTower.mjs`：锁定《雪满楼》原诗、作品解读和版权信息
```

- [ ] **Step 7：运行发现入口测试和 XML 基础检查**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4333 npx playwright test tests/e2e/snow-full-tower.spec.ts --project=desktop-chrome --grep "sitemap"
node -e "const fs=require('node:fs'); for (const file of ['public/rss.xml','public/atom.xml']) { const text=fs.readFileSync(file,'utf8'); if (!text.includes('</')) process.exit(1); }"
```

Expected: Playwright test PASS；Node 命令退出码 0。

- [ ] **Step 8：提交站点发现入口和说明**

```bash
git add README.md site/src/pages/sitemap.txt.ts site/public/rss.xml site/public/atom.xml site/tests/e2e/snow-full-tower.spec.ts
git commit -m "完善雪满楼订阅与版权入口"
```

---

### Task 5：全量验证、视觉检查与构建产物同步

**Files:**

- Modify: 仅在验证发现问题时修改相关文件。
- Generate: 仓库根目录静态 HTML、XML、sitemap 和 `_astro` 产物。

**Interfaces:**

- `site/dist` 是 Astro 构建结果。
- 仓库根目录是 GitHub Pages 实际发布内容。

- [ ] **Step 1：运行全部单元测试**

Run:

```bash
cd site
npm run test:unit
```

Expected: 所有 unit tests PASS，包含 4 条《雪满楼》内容测试。

- [ ] **Step 2：运行全部端到端测试**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4334 npm run test:e2e
```

Expected: desktop-chrome 与 mobile-chrome 全部 PASS。

- [ ] **Step 3：构建静态站**

Run:

```bash
cd site
npm run build
```

Expected: Astro build 完成，无 error；输出包含 `/writing/snow-full-tower/index.html` 与 12 个本地化作品地址。

- [ ] **Step 4：将构建结果同步到 GitHub Pages 根目录**

Run:

```bash
cd site
cp -R dist/. ..
```

Expected: 根目录新增或更新 `writing/snow-full-tower/index.html`、12 个本地化作品页、`sitemap.txt`、`rss.xml`、`atom.xml` 和必要 `_astro` 资源。

- [ ] **Step 5：验证构建产物内容**

Run:

```bash
rg -n "雪满楼|作品解读|© 郭清枫。保留所有权利。" ../writing/snow-full-tower/index.html ../zh-Hans/writing/snow-full-tower/index.html
rg -n "snow-full-tower" ../sitemap.txt ../rss.xml ../atom.xml
rg -n "我的理解|我认为|在我看来|我的推荐" ../writing/snow-full-tower/index.html ../zh-Hans/writing/snow-full-tower/index.html
```

Expected: 前两条命令找到目标内容；第三条命令无输出。

- [ ] **Step 6：用浏览器截图检查桌面、移动端、深色和减少动态效果**

Run:

```bash
cd site
PLAYWRIGHT_PORT=4335 npx playwright test tests/e2e/snow-full-tower.spec.ts
```

人工检查：

- 1440 像素桌面首屏能看见木楼屋檐、栏杆、雪山、白地和标题。
- 390 像素移动端没有横向滚动，标题、诗句和邮箱不截断。
- 深色模式仍是雪后初晴意境，不变成夜景。
- 减少动态效果下雪花静止。
- 原诗、作品解读和版权区之间层次清楚。

- [ ] **Step 7：运行最终 Git 检查**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: `git diff --check` 无输出；状态只包含本任务源文件与生成产物；单次提交总改动不超过 2000 行。

- [ ] **Step 8：提交构建产物与最终验证调整**

```bash
git add index.html writing/ en/ zh-Hans/ zh-Hant/ ja/ ko/ es/ fr/ de/ pt-BR/ it/ ru/ ar/ sitemap.txt rss.xml atom.xml _astro/ site/
git commit -m "生成雪满楼网站发布页面"
```

- [ ] **Step 9：提交后确认工作区**

Run:

```bash
git status --short --branch
git log -5 --oneline
```

Expected: `master` 工作区干净，本任务提交按内容、入口和构建产物可追溯。

---

## 计划自检

- 设计说明第 1—3 节：Task 1 锁定原诗、署名、日期、解读与版权文本。
- 设计说明第 4—5 节：Task 2 实现原创矢量雪景、古典留白、下雪动画、深色、打印和减少动态效果。
- 设计说明第 6—7 节：Task 3 接入组件、12 种语言外壳、首页与文章目录；Task 4 接入 sitemap、RSS 和 Atom。
- 设计说明第 8—9 节：Task 2 与 Task 5 覆盖静态回退、RTL、移动端、减少动态效果、构建和完整测试。
- 设计说明第 10 节：全局约束明确排除翻译、整本诗集、复制下载、评论、音乐和密集动效。
- 计划不存在占位项、模糊接口或未定义导出。
- Task 1 定义的四个内容常量名称与 Task 2—4 的消费名称一致。
