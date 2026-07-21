import { expect, test } from '@playwright/test';

test('design article renders drawings in the localized Chinese shell', async ({ page }) => {
  await page.goto('/zh-Hans/writing/monster-sun-station-design/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.getByRole('heading', { name: '怪兽小太阳驿站设计' })).toBeVisible();
  await expect(page.getByText('项目类型｜越野跑品牌综合空间')).toBeVisible();
  await expect(page.getByText('空间设计图纸总览。点击图片可查看原尺寸。')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/方案\s*A|选用\s*A|下一阶段/);

  const overview = page.getByAltText('怪兽小太阳山野会客厅空间设计图纸总览，包含一二层平面和沿街正立面');
  await expect(overview).toBeVisible();
  await expect(overview).toHaveJSProperty('complete', true);
  await expect(overview.evaluate((image) => image.naturalWidth)).resolves.toBe(1800);
});

test('design article stays within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/writing/monster-sun-station-design/');

  await expect(page.getByRole('heading', { name: '怪兽小太阳驿站设计' })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test('all design article images decode and render while scrolling the article', async ({ page }) => {
  await page.goto('/zh-Hans/writing/monster-sun-station-design/');

  const articleImages = page.locator('.trail-project img');
  await expect(articleImages).toHaveCount(8);

  const lazyImageCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('loading') === 'lazy').length,
  );
  expect(lazyImageCount).toBe(0);

  const asyncDecodingCount = await articleImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute('decoding') === 'async').length,
  );
  expect(asyncDecodingCount).toBe(0);

  for (let index = 0; index < await articleImages.count(); index += 1) {
    const image = articleImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);

    const renderedBox = await image.boundingBox();
    expect(renderedBox?.width).toBeGreaterThan(100);
    expect(renderedBox?.height).toBeGreaterThan(100);

    const renderedPixels = await image.screenshot();
    expect(renderedPixels.byteLength).toBeGreaterThan(10_000);
  }
});
