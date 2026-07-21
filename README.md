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
- BillLoopr 与 RosterSlate 可直接打开与 App 设置一致的语言页面

## 目录

- `site/`：Astro 源码项目
- `site/src/pages/`：页面源码
- `site/public/`：构建时复制到发布目录的静态资源
- `site/public/assets/img/monster-sun-station-design/`：怪兽小太阳驿站设计文章图纸与现场图片
- 根目录 HTML/CSS/XML：`npm run build` 后从 `site/dist` 复制出来的发布产物

## 常用命令

```bash
cd site
npm install
npm run build
npm run test:unit
npm run test:e2e
```

构建完成后，将 `site/dist` 内容复制到仓库根目录并提交。
