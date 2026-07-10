# MrFung GitHub Pages

这是 `www.mrfung.cn` 的 GitHub Pages 站点。

## 技术栈

- Astro 7
- 静态导出
- GitHub Pages
- 自动跟随系统浅色 / 深色模式
- 页面内容中英双语同屏展示

## 目录

- `site/`：Astro 源码项目
- `site/src/pages/`：页面源码
- `site/public/`：构建时复制到发布目录的静态资源
- 根目录 HTML/CSS/XML：`npm run build` 后从 `site/dist` 复制出来的发布产物

## 常用命令

```bash
cd site
npm install
npm run build
```

构建完成后，将 `site/dist` 内容复制到仓库根目录并提交。
