import { expect, test } from '@playwright/test';

test('final design article renders the complete drawing set in the localized Chinese shell', async ({ page }) => {
  await page.goto('/zh-Hans/writing/monster-sun-station-design/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.getByRole('heading', { name: '怪兽小太阳驿站设计' })).toBeVisible();
  await expect(page.getByText('项目类型｜越野跑品牌综合空间')).toBeVisible();
  await expect(page.getByText('A-01｜设计总览与图纸目录')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A-01至A-13，构成完整的正式询价图册。' })).toBeVisible();
  await expect(page.getByText('山野会客厅双模式')).toBeVisible();
  await expect(page.getByText('日常以一组低矮沙发、两把单椅和两张组合小几形成4—6人会客；活动时家具归拢，中部腾空，末端使用可移动品牌背景。')).toBeVisible();
  await expect(page.getByText('机动项目区位于图纸下侧', { exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/方案\s*A|方案\s*B|选用\s*A|下一阶段/);

  const overview = page.getByAltText('A-01怪兽小太阳山野会客厅最终设计总览与图纸目录');
  await expect(overview).toBeVisible();
  await expect(overview).toHaveJSProperty('complete', true);
  await expect(overview.evaluate((image) => image.naturalWidth)).resolves.toBeGreaterThanOrEqual(300);
  await expect(overview.evaluate((image) => image.currentSrc)).resolves.toMatch(/drawing-01-(640|1200)\.(avif|webp)$/);
});

test('design article stays within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/writing/monster-sun-station-design/');

  await expect(page.getByRole('heading', { name: '怪兽小太阳驿站设计' })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test('design images use responsive lazy loading while the critical overview stays eager', async ({ page }) => {
  await page.goto('/zh-Hans/writing/monster-sun-station-design/');

  const articleImages = page.locator('.trail-project img');
  await expect(articleImages).toHaveCount(26);

  const eagerImageCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('loading') === 'eager').length,
  );
  expect(eagerImageCount).toBe(1);

  const lazyImageCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('loading') === 'lazy').length,
  );
  expect(lazyImageCount).toBe(25);

  const asyncDecodingCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('decoding') === 'async').length,
  );
  expect(asyncDecodingCount).toBe(25);

  const responsiveImageCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('srcset')?.includes('640w') && image.getAttribute('sizes')).length,
  );
  expect(responsiveImageCount).toBe(26);

  await expect(articleImages.first()).toHaveAttribute('fetchpriority', 'high');
  await expect(articleImages.nth(1)).not.toHaveAttribute('fetchpriority', /.+/);

  const avifSourceCount = await page.locator('.trail-project picture source[type="image/avif"]').count();
  expect(avifSourceCount).toBe(26);

  for (let index = 0; index < await articleImages.count(); index += 1) {
    const image = articleImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);

    const renderedBox = await image.boundingBox();
    expect(renderedBox?.width).toBeGreaterThan(100);
    expect(renderedBox?.height).toBeGreaterThan(100);

  }
});
