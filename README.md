# woyuxiaji-site-v1

我与夏季是一个个人主页，纯原生 HTML + CSS + jQuery，无构建步骤，直接静态托管。

## 目录结构

```
index.html              唯一页面
css/                    样式（唯一真源，没有 scss 中间层）
img/                    图片资源（位图统一为 WebP）
js/                     脚本
  heroBg.js             首屏背景：必应锁屏图池随机
  style.js              导航、侧边菜单、主题切换、首屏时间
  navbar.js             导航栏滚动吸顶
  aboutMe.js            标签页标题滚动彩蛋
  footer.js             右键菜单项行为
  rcMenu.js             双色右键菜单
  sakuraDrops.js        樱花飘落
  plugins/              jQuery 插件（clipboardGuard）
  init/bootstrap.js     入口装配 + 全局轻提示 AppToast
  jquery.min.js         CDN 失败时的本地回退
```

## 脚本加载与依赖

- jQuery 走 CDN，失败时用 `document.write` 同步插入本地副本。不能用动态
  `appendChild`：那样插入的脚本默认 `async`，会晚于所有 `defer` 脚本执行，
  导致 `$ is not defined`、整页交互失效。
- 所有自有脚本统一 `defer`，按依赖顺序排列，入口为 `js/init/bootstrap.js`。
- 静态托管没有文件名指纹，改动资源后请统一提升 `index.html` 里的 `?v=` 版本号。

## 样式约定

- `css/` 是唯一真源。历史上存在过的 `scss/` 已移除（缺少构建配置，改 scss 不会生效）。
- `css/navbar.css` 把滚动条宽度设为 0，因此不要在别处再写自定义滚动条样式。
- 深浅色沿用「整页 `filter: invert(1)` + 局部 `.inverseRepair` 再反色」的方案：
  新增需要保持原色的图片元素时，把它加进 `js/style.js` 里的 `$inverseTargets`，
  不要再复制一份新的清单。

## 资源约定

- 位图用 WebP（`cwebp -q 78~85`），SVG 保留矢量。
- 首屏背景来自必应锁屏图池，`img/hero-fallback.jpg` 是断网/超时时的本地兜底图。
  HPImageArchive 接口不返回 CORS 头，静态页面读不到它的 JSON，因此图池内置在
  `js/heroBg.js` 中，图片本体直连 bing.com CDN。
