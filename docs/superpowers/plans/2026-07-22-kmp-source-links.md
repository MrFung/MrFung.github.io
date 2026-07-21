# KMP 技术文章开源项目入口优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 KMP 技术文章的开源项目卡片改为可直接识别、查看完整 URL 并打开仓库的公开源码说明区。

**Architecture:** 开源项目名称、用途、URL、版本标签和操作文案继续由单一内容数据源提供，Astro 文章组件只负责语义化渲染，文章专属 CSS 负责响应式布局。先锁定数据契约，再用 Playwright 验证用户可见文案、完整 URL、真实链接目标和移动端无横向溢出。

**Tech Stack:** Astro 7、JavaScript ES Modules、原生 HTML/CSS、Node.js Test Runner、Playwright、GitHub Pages

## Global Constraints

- 章节标题固定为“相关开源项目与测试版本”。
- 明确说明这些地址不是三端性能 Demo 的下载入口。
- 四个仓库必须展示完整、可点击的 HTTPS URL，并提供“打开源码仓库 →”。
- CPF-KMP Kotlin、AKInterop 使用“本次测试锁定提交”；KuiklyBase、KNOI 使用“对照方案源码”。
- 不修改文章性能数据、技术选型结论、站点导航和文章 URL。
- 保持现有深浅色模式和 390 像素宽移动端无横向溢出。
- 不增加第三方依赖。

---

## 文件结构

- `site/src/content/kmpThreePlatformPerformance.mjs`：维护四个开源项目的用途、URL、版本标签和操作文案。
- `site/src/components/KmpThreePlatformPerformanceArticle.astro`：渲染章节解释和语义化项目卡片。
- `site/src/styles/kmpThreePlatformPerformance.css`：提供卡片、URL 换行、版本信息和操作入口样式。
- `site/tests/unit/kmp-performance-article.test.mjs`：锁定内容数据契约。
- `site/tests/e2e/kmp-three-platform-performance.spec.ts`：验证用户可见链接、文案和响应式行为。
- `writing/kmp-three-platform-performance/index.html` 及 12 个语言目录下同名页面：Astro 构建后的 GitHub Pages 静态产物。

### Task 1: 锁定开源项目数据契约

**Files:**
- Modify: `site/tests/unit/kmp-performance-article.test.mjs`
- Modify: `site/src/content/kmpThreePlatformPerformance.mjs`

**Interfaces:**
- Consumes: 现有 `TECH_REFERENCES: ReadonlyArray<object>` 导出。
- Produces: 每个项目稳定提供 `label`、`description`、`url`、`revisionLabel`、`revision`、`actionLabel` 六个字段。

- [ ] **Step 1: 写入失败的数据契约测试**

在 `technical references use browsable public pages` 测试后增加：

```js
test('technical references explain purpose and revision semantics', async () => {
  const { TECH_REFERENCES } = await import(
    '../../src/content/kmpThreePlatformPerformance.mjs'
  );

  assert.equal(TECH_REFERENCES.length, 4);
  assert.deepEqual(
    TECH_REFERENCES.map(({ revisionLabel }) => revisionLabel),
    ['本次测试锁定提交', '本次测试锁定提交', '对照方案源码', '对照方案源码']
  );

  for (const reference of TECH_REFERENCES) {
    assert.ok(reference.description.length > 0);
    assert.equal(reference.actionLabel, '打开源码仓库 →');
  }
});
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `cd site && npm run test:unit`

Expected: FAIL，失败原因是现有项目没有 `description`、`revisionLabel` 和 `actionLabel`。

- [ ] **Step 3: 为四个项目补齐数据字段**

将 `TECH_REFERENCES` 更新为：

```js
export const TECH_REFERENCES = Object.freeze([
  Object.freeze({
    label: 'CPF-KMP Kotlin',
    description: 'HarmonyOS 使用的 Kotlin/Native 编译器与标准库源码。',
    url: 'https://gitcode.com/CPF-KMP-CMP/kotlin',
    revisionLabel: '本次测试锁定提交',
    revision: '0df42d4f7eaff2f1a5a0f763de4ababc875992f2',
    actionLabel: '打开源码仓库 →',
  }),
  Object.freeze({
    label: 'AKInterop',
    description: 'Kotlin 与 HarmonyOS N-API/ArkTS 之间的直接缓冲区互操作工具。',
    url: 'https://gitcode.com/CPF-KMP-CMP/akinterop',
    revisionLabel: '本次测试锁定提交',
    revision: 'b8b80eaa44b84bc84ee883a2c86224c07fbf2a11',
    actionLabel: '打开源码仓库 →',
  }),
  Object.freeze({
    label: 'KuiklyBase',
    description: '原有 HarmonyOS KMP 运行时与平台适配方案，对照测试来源。',
    url: 'https://github.com/Tencent-TDS/KuiklyBase-platform',
    revisionLabel: '对照方案源码',
    revision: '公开仓库',
    actionLabel: '打开源码仓库 →',
  }),
  Object.freeze({
    label: 'KNOI',
    description: 'KuiklyBase 面向 HarmonyOS 的 Kotlin 注解桥接代码生成工具。',
    url: 'https://github.com/Tencent-TDS/KuiklyBase-components/tree/master/knoi',
    revisionLabel: '对照方案源码',
    revision: '公开仓库',
    actionLabel: '打开源码仓库 →',
  }),
]);
```

- [ ] **Step 4: 运行单元测试并确认通过**

Run: `cd site && npm run test:unit`

Expected: 全部单元测试 PASS，失败数为 0。

- [ ] **Step 5: 提交数据契约**

```bash
git add site/src/content/kmpThreePlatformPerformance.mjs site/tests/unit/kmp-performance-article.test.mjs
git commit -m "完善 KMP 开源项目说明数据"
```

### Task 2: 展示完整源码链接和明确操作入口

**Files:**
- Modify: `site/tests/e2e/kmp-three-platform-performance.spec.ts`
- Modify: `site/src/components/KmpThreePlatformPerformanceArticle.astro`
- Modify: `site/src/styles/kmpThreePlatformPerformance.css`

**Interfaces:**
- Consumes: Task 1 的 `TECH_REFERENCES` 六字段数据契约。
- Produces: `.kmp-paper-reference` 项目卡片、`.kmp-paper-reference__url` 完整链接和 `.kmp-paper-reference__action` 操作入口。

- [ ] **Step 1: 写入失败的用户可见行为测试**

在首个 KMP 白皮书测试后增加：

```ts
test('open-source references expose full repository links and version meaning', async ({ page }) => {
  const repositories = [
    'https://gitcode.com/CPF-KMP-CMP/kotlin',
    'https://gitcode.com/CPF-KMP-CMP/akinterop',
    'https://github.com/Tencent-TDS/KuiklyBase-platform',
    'https://github.com/Tencent-TDS/KuiklyBase-components/tree/master/knoi',
  ];

  await page.goto('/zh-Hans/writing/kmp-three-platform-performance/');
  const section = page.locator('.kmp-paper-version').filter({
    has: page.getByRole('heading', { name: '相关开源项目与测试版本' }),
  });

  await expect(section).toContainText('不是三端性能 Demo 的下载入口');
  await expect(section.getByText('本次测试锁定提交')).toHaveCount(2);
  await expect(section.getByText('对照方案源码')).toHaveCount(2);
  await expect(section.getByRole('link', { name: '打开源码仓库 →' })).toHaveCount(4);

  for (const url of repositories) {
    await expect(section.getByRole('link', { name: url, exact: true })).toHaveAttribute('href', url);
  }
});
```

- [ ] **Step 2: 运行指定浏览器测试并确认按预期失败**

Run: `cd site && PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts --project=desktop-chrome -g "open-source references"`

Expected: FAIL，页面找不到“相关开源项目与测试版本”标题。

- [ ] **Step 3: 将旧列表替换为语义化项目卡片**

将原“公开源码入口”容器替换为：

```astro
<div class="kmp-paper-version">
  <h3>相关开源项目与测试版本</h3>
  <p>这里列出本文涉及的开源项目及本次验证使用的版本，不是三端性能 Demo 的下载入口。项目名称、完整 URL 和操作入口均可打开对应公开仓库。</p>
  <ul class="kmp-paper-references">
    {TECH_REFERENCES.map((item) => (
      <li class="kmp-paper-reference">
        <h4><a href={item.url} target="_blank" rel="noreferrer">{item.label}</a></h4>
        <p class="kmp-paper-reference__description">{item.description}</p>
        <a class="kmp-paper-reference__url" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
        <div class="kmp-paper-reference__revision">
          <span>{item.revisionLabel}</span>
          <code>{item.revision}</code>
        </div>
        <a class="kmp-paper-reference__action" href={item.url} target="_blank" rel="noreferrer">{item.actionLabel}</a>
      </li>
    ))}
  </ul>
</div>
```

- [ ] **Step 4: 完成卡片层次和窄屏换行样式**

用以下规则替换现有 `.kmp-paper-references` 四条样式：

```css
.kmp-paper-references { display: grid; gap: 14px; padding: 0; list-style: none; }
.kmp-paper-reference { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--kmp-paper-line); border-radius: 9px; background: var(--kmp-paper-soft); }
.kmp-paper-reference h4,
.kmp-paper-reference p { margin: 0; }
.kmp-paper-reference h4 a,
.kmp-paper-reference__action { color: var(--mf-green); font-weight: 800; }
.kmp-paper-reference__description { color: var(--kmp-paper-muted); }
.kmp-paper-reference__url { color: inherit; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; overflow-wrap: anywhere; word-break: break-word; }
.kmp-paper-reference__revision { display: grid; gap: 5px; }
.kmp-paper-reference__revision span { color: var(--kmp-paper-muted); font-size: 0.78rem; font-weight: 800; }
.kmp-paper-reference__revision code { display: block; overflow-wrap: anywhere; }
.kmp-paper-reference__action { justify-self: start; }
```

- [ ] **Step 5: 运行指定测试并确认通过**

Run: `cd site && PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts --project=desktop-chrome -g "open-source references"`

Expected: 1 test passed。

- [ ] **Step 6: 运行 KMP 页面桌面与移动端回归**

Run: `cd site && PLAYWRIGHT_PORT=4322 npx playwright test tests/e2e/kmp-three-platform-performance.spec.ts`

Expected: KMP 页面在 desktop-chrome 和 mobile-chrome 项目下全部 PASS，移动端横向溢出断言为 `false`。

- [ ] **Step 7: 提交页面源码和测试**

```bash
git add site/src/components/KmpThreePlatformPerformanceArticle.astro site/src/styles/kmpThreePlatformPerformance.css site/tests/e2e/kmp-three-platform-performance.spec.ts
git commit -m "展示 KMP 开源项目完整链接"
```

### Task 3: 构建、同步并发布 GitHub Pages

**Files:**
- Modify: `writing/kmp-three-platform-performance/index.html`
- Modify: `ar/writing/kmp-three-platform-performance/index.html`
- Modify: `de/writing/kmp-three-platform-performance/index.html`
- Modify: `en/writing/kmp-three-platform-performance/index.html`
- Modify: `es/writing/kmp-three-platform-performance/index.html`
- Modify: `fr/writing/kmp-three-platform-performance/index.html`
- Modify: `it/writing/kmp-three-platform-performance/index.html`
- Modify: `ja/writing/kmp-three-platform-performance/index.html`
- Modify: `ko/writing/kmp-three-platform-performance/index.html`
- Modify: `pt-BR/writing/kmp-three-platform-performance/index.html`
- Modify: `ru/writing/kmp-three-platform-performance/index.html`
- Modify: `zh-Hans/writing/kmp-three-platform-performance/index.html`
- Modify: `zh-Hant/writing/kmp-three-platform-performance/index.html`

**Interfaces:**
- Consumes: Task 1 和 Task 2 通过验证的 Astro 源码。
- Produces: GitHub Pages 根目录下 13 个包含完整源码链接的静态文章页面。

- [ ] **Step 1: 执行完整测试和生产构建**

```bash
cd site
npm run test:unit
PLAYWRIGHT_PORT=4322 npm run test:e2e
npm run build
```

Expected: 单元测试和浏览器测试失败数均为 0；Astro 成功生成 170 个页面。

- [ ] **Step 2: 同步静态产物并执行内容检查**

```bash
rsync -a site/dist/ ./
rg -n "相关开源项目与测试版本|打开源码仓库|https://gitcode.com/CPF-KMP-CMP/kotlin" zh-Hans/writing/kmp-three-platform-performance/index.html
git diff --check
```

Expected: 中文静态页面同时命中标题、操作文案和完整 CPF-KMP URL；`git diff --check` 无输出。

- [ ] **Step 3: 提交静态发布文件**

```bash
git add writing/kmp-three-platform-performance/index.html ar/writing/kmp-three-platform-performance/index.html de/writing/kmp-three-platform-performance/index.html en/writing/kmp-three-platform-performance/index.html es/writing/kmp-three-platform-performance/index.html fr/writing/kmp-three-platform-performance/index.html it/writing/kmp-three-platform-performance/index.html ja/writing/kmp-three-platform-performance/index.html ko/writing/kmp-three-platform-performance/index.html pt-BR/writing/kmp-three-platform-performance/index.html ru/writing/kmp-three-platform-performance/index.html zh-Hans/writing/kmp-three-platform-performance/index.html zh-Hant/writing/kmp-three-platform-performance/index.html
git commit -m "更新 KMP 技术文章发布页面"
```

- [ ] **Step 4: 推送并核验线上页面**

```bash
git push origin master
curl -sS -L https://www.mrfung.cn/zh-Hans/writing/kmp-three-platform-performance/ | rg -o "相关开源项目与测试版本|打开源码仓库|https://gitcode.com/CPF-KMP-CMP/kotlin" | sort -u
```

Expected: 推送成功；线上页面返回三个目标文本，完整 URL 可点击并指向公开仓库。

- [ ] **Step 5: 确认最终仓库状态**

Run: `git status --short && git log -4 --oneline`

Expected: 工作区无未提交变更，最近提交包含设计、数据契约、页面展示和静态发布文件。
