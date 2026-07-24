# MrFung GitHub Pages

这是 `www.mrfung.cn` 的 GitHub Pages 站点。

## 技术栈

- Astro 7
- 静态导出
- GitHub Pages
- 自动跟随系统浅色 / 深色模式
- 固定文案支持 12 种语言，一次只展示当前语言
- 首次访问跟随浏览器语言，支持全站手动切换并记住选择
- 文章创作内容保持发布时原文；现有自我介绍保留中英双语原文
- 设计文章《怪兽小太阳驿站设计》以中文原文发布，并在各语言站点中保留原文
- 《怪兽小太阳驿站设计》是确定设计的持续展示页，不保留方案比选、选定过程等过程性文案
- 最终设计文章完整展示 A-01 至 A-13 正式图册与 13 张最终效果图，后续修订沿用现有页面地址
- KMP 三端性能技术白皮书以中文原文发布，公开真机数据、工程边界和选型结论
- 原创诗作《雪满楼》以中文原文发布，包含中性作品解读、原创矢量雪景、减少动态效果兼容和郭清枫完整版权声明
- 原创作品未经郭清枫事先书面授权不得转载、复制、改编、商业使用或用于人工智能模型训练、语料库和数据集
- 技术文章的图表使用原生 HTML/CSS 与内联数据，不依赖第三方图表库或 CDN
- 设计文章按 640 / 1200 / 1800 像素生成响应式 WebP；首屏仅立即加载总览图，其余图片按滚动位置延迟加载，点击可查看大图
- BillLoopr 与 RosterSlate 可直接打开与 App 设置一致的语言页面

## 目录

- `site/`：Astro 源码项目
- `site/src/pages/`：页面源码
- `site/src/content/snowFullTower.mjs`：锁定《雪满楼》原诗、作品解读和版权信息
- `site/public/`：构建时复制到发布目录的静态资源
- `site/public/assets/img/monster-sun-station-design/`：怪兽小太阳驿站设计文章图纸与现场图片
- `site/scripts/buildMonsterSunAssets.mjs`：从最终设计总包生成网站响应式图片资源
- 根目录 HTML/CSS/XML：`npm run build` 后从 `site/dist` 复制出来的发布产物

## 常用命令

```bash
cd site
npm install
npm run assets:monster-sun
npm run build
npm run test:unit
npm run test:e2e
```

构建完成后，将 `site/dist` 内容复制到仓库根目录并提交。
