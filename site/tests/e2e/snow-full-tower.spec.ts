import { expect, test } from '@playwright/test';

const articlePath = '/writing/snow-full-tower/';
const forbiddenInterpretationCopy =
  /我的理解|我认为|在我看来|我的推荐/;
const locales = [
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
];

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

for (const locale of locales) {
  test(
    `${locale} 外壳保留雪满楼中文原文`,
    async ({ page }) => {
      await page.goto(`/${locale}${articlePath}`);

      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        locale
      );
      await expect(
        page.locator('article[lang="zh-Hans"]')
      ).toContainText('白地三千里，');
      await expect(
        page.getByRole('heading', {
          name: '作品解读',
        })
      ).toBeVisible();
    }
  );
}

test(
  '无前缀作品地址沿用浏览器语言跳转',
  async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: true,
      locale: 'zh-CN',
    });
    const page = await context.newPage();

    await page.goto(articlePath);
    await expect(page).toHaveURL(
      '/zh-Hans/writing/snow-full-tower/'
    );
    await context.close();
  }
);

test(
  '首页和文章目录发布雪满楼入口',
  async ({ page }) => {
    const entries = [
      {
        pagePath: '/zh-Hans/',
        articleHref:
          '/zh-Hans/writing/snow-full-tower/',
      },
      {
        pagePath: '/zh-Hans/writing/',
        articleHref:
          '/zh-Hans/writing/snow-full-tower/',
      },
      {
        pagePath: '/',
        articleHref: articlePath,
      },
      {
        pagePath: '/writing/',
        articleHref: articlePath,
      },
    ];

    for (const entry of entries) {
      await page.goto(entry.pagePath);
      const card = page
        .locator('.article-card')
        .filter({ hasText: '雪满楼' });

      await expect(card).toBeVisible();
      await expect(card).toContainText(
        '一场从天地辽阔，回到一人思念的雪。'
      );
      await expect(
        card.getByRole('link')
      ).toHaveAttribute('href', entry.articleHref);
    }
  }
);

test(
  '作品页专属样式不污染关于页',
  async ({ page }) => {
    const articleStyles = () =>
      page.locator(
        'style[data-page-stylesheet="snow-full-tower"]'
      );

    await page.goto('/de/about/');
    await expect(articleStyles()).toHaveCount(0);

    await page.goto(
      '/de/writing/snow-full-tower/'
    );
    await expect(articleStyles()).toHaveCount(1);
  }
);
