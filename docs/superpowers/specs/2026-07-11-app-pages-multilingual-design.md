# App 内容页多语言与 App 联动设计

> 日期：2026-07-11
> 状态：设计已确认，待实施
> 维护人：guofeng&Codex

## 1. 背景与目标

`www.mrfung.cn` 当前使用 Astro 静态导出，BillLoopr 与 RosterSlate 的产品、隐私和支持页面采用中英双语同屏。两个 App 均支持相同的 12 种语言：English、简体中文、繁體中文、日本語、한국어、Español、Français、Deutsch、Português (Brasil)、Italiano、Русский、العربية。

本次目标是：

- BillLoopr 和 RosterSlate 的产品页、隐私页、支持页支持与 App 完全一致的 12 种语言。
- App 内容页一次只展示一种语言，页面导航、正文、按钮、元数据和页脚均使用当前页面语言。
- 网站可按用户选择切换语言并持久化；没有网站选择时按浏览器语言选择，无法匹配时回退英文。
- 两个 App 打开产品、隐私或支持页面时，直接进入与 App 当前语言一致的地址。
- 首页、应用目录、关于、文章和其它非 App 专属页面继续保持当前中英双语，不扩展为 12 种完整翻译。
- 阿拉伯语页面使用 RTL，其余页面使用 LTR。

## 2. 已确认方案与取舍

采用语言前缀静态路由，而不是在同一 URL 内用 JavaScript 替换正文，也不采用查询参数。

示例：

```text
/en/billloopr/privacy/
/zh-Hans/billloopr/privacy/
/ja/rosterslate/support/
/ar/rosterslate/
```

选择该方案的原因：

- 每种语言有稳定、可分享、可直接由 App 打开的 URL。
- GitHub Pages 仍然只托管静态文件，不引入服务器或运行时接口。
- 搜索引擎和 App Store 审核可以直接读取完整正文，不依赖客户端翻译。
- 每页可以设置正确的 `html lang`、`dir`、canonical 和 `hreflang`。
- 浏览器刷新、前进后退和禁用 JavaScript 时仍能阅读指定语言页面。

## 3. 路由与兼容策略

### 3.1 新的正式路由

两款 App 各生成三个页面，每页生成 12 种语言，共 72 个正式本地化页面：

```text
/{locale}/billloopr/
/{locale}/billloopr/privacy/
/{locale}/billloopr/support/
/{locale}/rosterslate/
/{locale}/rosterslate/privacy/
/{locale}/rosterslate/support/
```

支持的 `locale` 固定为：

```text
en
zh-Hans
zh-Hant
ja
ko
es
fr
de
pt-BR
it
ru
ar
```

### 3.2 旧地址兼容

现有地址继续保留：

```text
/billloopr/
/billloopr/privacy/
/billloopr/support/
/rosterslate/
/rosterslate/privacy/
/rosterslate/support/
```

旧地址是兼容入口，不删除、不返回 404。页面在头部尽早执行轻量语言解析并跳转到正式语言地址；JavaScript 不可用或解析失败时，旧地址保留可阅读的英文内容和语言入口，保证历史 App Store 配置、收藏和外部链接仍然有效。

语言解析优先级：

1. 当前 URL 中的合法语言前缀。
2. 网站语言选择器保存的 `localStorage` 值。
3. `navigator.languages` / `navigator.language` 中第一个可映射语言。
4. 英文 `en`。

语言规范化规则：

- `zh-CN`、`zh-SG` 和未指定地区的简体中文映射为 `zh-Hans`。
- `zh-TW`、`zh-HK`、`zh-MO` 和繁体中文映射为 `zh-Hant`。
- 葡萄牙语映射为 `pt-BR`。
- 其它带地区的语言按主语言匹配，例如 `de-DE` 映射为 `de`。
- 未支持语言回退为 `en`。

## 4. 网站架构与组件边界

### 4.1 语言定义

新增单一语言配置模块，维护语言代码、原生名称、文本方向和浏览器语言映射。路由生成、语言选择器、SEO 标签、测试和 App URL 约定均以这份配置为事实源，避免分别维护 12 份列表。

### 4.2 翻译内容

翻译内容按 App 和语言拆分，每个文件包含该 App 的产品、隐私和支持页面文案。页面结构由共享类型约束，确保每种语言都有相同的章节、按钮和链接，不把 12 种语言堆入单个超大 Astro 文件。

品牌名、邮箱、Apple 产品名和技术名保持原样。隐私政策只翻译当前已确认的事实，不新增法律、税务、医疗、工资或数据处理承诺。日期使用对应语言可读形式，但生效日期仍代表同一天。

### 4.3 页面组件

新增 App 内容页专用布局和共享组件：

- App 页面布局：设置当前语言、方向、标题、描述、canonical、`hreflang` 和单语导航/页脚。
- 语言选择器：使用每种语言自己的名称；切换后保存选择并导航到当前 App、当前页面的对应语言地址。
- 产品页、隐私页、支持页：共享结构，消费当前 App 和当前语言的数据，不在模板内硬编码双语段落。
- 旧地址兼容入口：只负责语言解析、跳转和英文无脚本兜底，不复制 12 份业务内容。

现有非 App 页面继续使用当前双语布局。共享 `BaseLayout` 增加可选语言配置，但默认行为不变，避免首页、文章和关于页面被意外改成单语。

## 5. App 与网站语言联动

### 5.1 BillLoopr

`BillLooprExternalLinks` 从固定 URL 改为按 `BLAppLanguage` 生成产品、隐私和支持 URL。设置页使用当前 `selectedAppLanguage` 创建链接。

### 5.2 RosterSlate

`RosterSlateExternalLinks` 从固定 URL 改为按 `RosterAppLanguage` 生成隐私和支持 URL；同时保留产品页 URL 能力，供分享或后续入口复用。设置页使用当前 App 语言创建链接。

### 5.3 System 语言

当 App 语言设为 `System` 时，App 根据系统首选语言解析为上述 12 种网站语言之一；无法匹配时使用英文。App 不依赖网站读取 App 内 `UserDefaults`，而是直接构造确定的语言路径，因此首次打开也不会闪现错误语言。

App 传入的语言路径优先于网站之前保存的语言选择。用户仍可在网页上临时切换其它语言；该选择只影响之后通过旧兼容地址进入时的默认值，不改变 App 内语言设置。

## 6. SEO、可访问性与布局

- 每个正式语言页面设置准确的 `<html lang>`；阿拉伯语同时设置 `dir="rtl"`。
- 每页输出自身 canonical，以及 12 种语言的 `hreflang` 和 `x-default`。
- sitemap 收录 72 个正式语言页面，并保留非 App 页面；兼容入口不作为主要 canonical。
- 语言选择器有可访问名称，键盘可操作，并以语言原生名称展示。
- RTL 不只翻转文字对齐，还覆盖导航、按钮组、列表缩进和行内图标方向；邮箱、URL、品牌名等必要内容保持可读的双向文本边界。
- 长文本验证至少覆盖德语、法语、俄语和阿拉伯语；移动端不得出现横向滚动、裁切或按钮遮挡。

## 7. 异常与回退

- 非法或未知语言路径返回站点 404，不静默生成不存在的页面。
- 旧地址无法访问 `localStorage` 时继续按浏览器语言解析；浏览器信息也不可用时显示英文。
- `localStorage` 写入失败不阻止语言切换，当前导航仍以 URL 为准。
- 某个翻译字段缺失、为空或语言文件结构不一致时，构建或测试失败，不在生产页面混入英文兜底段落。
- App URL 构造遇到未知语言值时回退英文，不使用强制解包。
- 现有用户业务数据、App 存储、CloudKit、排班、计时和导出逻辑均不受本次链接改造影响。

## 8. 测试与验收

实施遵循测试先行。

### 8.1 网站自动化

- 语言配置测试：12 种代码唯一且与两个 App 的语言枚举一致。
- 翻译完整性测试：两款 App 的三个页面在 12 种语言中字段完整、非空、章节数量一致。
- 构建测试：Astro 静态构建成功，并生成 72 个正式页面和 6 个兼容入口。
- Playwright：
  - 指定语言 URL 一次只显示该语言正文。
  - 语言选择器保持当前 App 和页面类型，只改变语言前缀。
  - 选择结果能够保存。
  - 旧地址按保存值或浏览器语言跳转。
  - 未支持浏览器语言回退英文。
  - 阿拉伯语页面为 `lang="ar"`、`dir="rtl"`。
  - 桌面与移动端的 BillLoopr、RosterSlate 产品/隐私/支持关键内容可见且无横向溢出。
- sitemap、canonical 和 `hreflang` 自动检查。

### 8.2 App 自动化与构建

- BillLoopr 增加外部 URL 生成测试，覆盖 12 种显式语言、`System` 映射和未知值回退。
- RosterSlate 增加同等测试。
- 验证两个 App 的设置页链接使用当前 App 语言，而不是固定地址。
- 运行变更 Swift 文件 SwiftLint、敏感词扫描、现有单元测试和可用平台构建。
- 不把 BillLooprProject 或 RosterSlateProject 工作区中与本任务无关的现有未提交改动纳入提交。

### 8.3 人工验收场景

1. BillLoopr 设为日语，从设置打开隐私政策，直接进入 `/ja/billloopr/privacy/`，页面仅显示日语。
2. RosterSlate 设为简体中文，从设置打开支持页，直接进入 `/zh-Hans/rosterslate/support/`。
3. App 设为 System、系统首选语言为德语时，打开对应 `/de/` 页面。
4. 在网页从德语切换阿拉伯语，保持同一个 App 和页面类型，页面变为 RTL；刷新后仍为阿拉伯语。
5. 直接打开历史 `/billloopr/privacy/`，按已保存的网站语言或浏览器语言进入正式地址；禁用 JavaScript 时仍可读取英文隐私说明。
6. 首页、应用目录、关于和文章仍保持原来的中英双语内容与 URL。

## 9. 非目标

- 不把个人主页、关于、文章正文完整翻译为 12 种语言。
- 不让网站语言选择反向修改 App 内语言。
- 不引入服务端、数据库、翻译 SaaS、分析 SDK 或 Cookie 追踪。
- 不借本次任务重设计网站视觉或重构两个 App 的业务架构。
- 不改变两款 App 当前支持语言列表。

