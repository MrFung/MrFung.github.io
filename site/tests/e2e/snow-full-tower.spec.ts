import { expect, test } from '@playwright/test';

const articlePath = '/writing/snow-full-tower/';
const forbiddenInterpretationCopy =
  /我的理解|我认为|在我看来|我的推荐/;

test.use({ javaScriptEnabled: false });

test(
  '雪满楼作品页展示完整原诗、解读和版权',
  async ({ page }) => {
    await page.goto(articlePath);

    await expect(
      page.getByRole('heading', {
        name: '雪满楼',
        level: 1,
      })
    ).toBeVisible();
    await expect(
      page.locator(
        'article.snow-full-tower[lang="zh-Hans"]'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        '仿似世间唯一人，',
        { exact: true }
      )
    ).toBeVisible();
    await expect(
      page.getByText('不及念你一缕思绪。')
    ).toBeVisible();
    await expect(
      page.getByText('来日为你再登楼。')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: '作品解读',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: '版权声明',
      })
    ).toBeVisible();
    await expect(
      page.getByText('© 郭清枫。保留所有权利。')
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: 'MrFung1231@icloud.com',
      })
    ).toHaveAttribute(
      'href',
      'mailto:MrFung1231@icloud.com'
    );
    await expect(page.locator('body')).not.toContainText(
      forbiddenInterpretationCopy
    );
  }
);

test(
  '雪景与下雪层具备无障碍和减少动态效果',
  async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: 'reduce',
    });
    await page.goto(articlePath);

    await expect(
      page.locator('[data-snow-landscape]')
    ).toBeVisible();
    await expect(
      page.locator('[data-snowfall]')
    ).toHaveAttribute('aria-hidden', 'true');
    await expect(
      page.locator('.snow-full-tower__flake')
    ).toHaveCount(18);
    await expect(
      page
        .locator('.snow-full-tower__flake')
        .first()
    ).toHaveCSS('animation-name', 'none');
  }
);

test(
  '雪满楼页面在移动端没有横向滚动',
  async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });
    await page.goto(articlePath);

    const hasHorizontalOverflow =
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          window.innerWidth
      );

    expect(hasHorizontalOverflow).toBe(false);
  }
);
