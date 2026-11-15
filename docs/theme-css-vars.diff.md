# W1 主题从 `filter: invert(1)` 迁移到 CSS 变量（仅方案，未落地）

> 状态：**未应用**。本文只给出可逐条 review 的 diff，供确认后再动手。
>
> 前置结论（已在真机 Chrome 实测，可勾掉原方案里的假设）：
> `html { filter: invert(1) }` **不会**破坏 `position: fixed`——深色模式下滚动 600px
> 后 `#navbar` 的 `getBoundingClientRect().top` 仍为 0，`.Alert` 仍停在视口垂直中线。
> 所以本次迁移的收益是「配色可控 + 去掉 15 元素反色清单」，而不是修定位 bug。

---

## 1. 新增设计令牌（`css/main.css`，插在 `*` 规则之前）

```diff
+/* 主题令牌：浅色为默认值，深色只在 .theme-dark 下覆盖 */
+:root {
+  --c-page: #ffffff;
+  --c-surface: #f5f5f5;
+  --c-card: #f2f2f2;
+  --c-text: #000000;
+  --c-text-secondary: #6b6b6b;
+  --c-border: #c8c3be;
+  --c-accent: rgba(0, 255, 0, 0.6);
+  --c-hover: rgba(0, 0, 0, 0.1);
+  --c-hero-fallback: #12161b;
+  --c-toast-bg: rgba(0, 0, 0, 0.5);
+  --c-toast-text: #66ff66;
+}
+
+.theme-dark {
+  --c-page: #121212;
+  --c-surface: #1c1c1c;
+  --c-card: #242424;
+  --c-text: #f2f2f2;
+  --c-text-secondary: #b4b4b4;
+  --c-border: #4a4a4a;
+  --c-accent: #aab4ff;
+  --c-hover: rgba(255, 255, 255, 0.12);
+}
```

## 2. 逐条替换硬编码色

```diff
--- a/css/works.css
+++ b/css/works.css
@@ .works {
-  background-color: #f5f5f5;
+  background-color: var(--c-surface);
@@ .works .workTitle, .works .workLinkCat {
-  color: #000000;
+  color: var(--c-text);
@@ .works .workLink {
-  background: url("../img/workLinkPic.webp") no-repeat;
+  background-color: var(--c-card);
+  background-image: url("../img/workLinkPic.webp");
+  background-repeat: no-repeat;
```

其余同类项（`#workLinkPic1..9` 都是 `background: url(...) no-repeat` 简写）只需把
`background` 拆成 `background-image` + `background-repeat`，让底色继续由 `.workLink`
的 `background-color` 提供，不要再逐条写死色值。

```diff
--- a/css/log.css
+++ b/css/log.css
@@ .logText1
-  color: #000000;
+  color: var(--c-text);
@@ .logText2
-  color: #6b6b6b;
+  color: var(--c-text-secondary);
```

```diff
--- a/css/main.css
+++ b/css/main.css
@@ .topBg
-  background-color: #12161b;
+  background-color: var(--c-hero-fallback);
@@ .dividingLine
-  background-color: #c8c3be;
+  background-color: var(--c-border);
@@ .Alert
-  background-color: rgba(0, 0, 0, 0.5);
-  color: #66ff66;
+  background-color: var(--c-toast-bg);
+  color: var(--c-toast-text);
@@ .navLink:hover
-  background-color: rgba(0, 0, 0, 0.1);
+  background-color: var(--c-hover);
```

## 3. 删除「再反色」体系

```diff
--- a/css/main.css
+++ b/css/main.css
@@
-/* 单独反色区 */
-.inverseRepair {
-  filter: invert(1);
-}
```

```diff
--- a/js/style.js
+++ b/js/style.js
@@
-  // 反色后需要恢复原色的元素，新增图片元素时只改这一处
-  var $inverseTargets = $(
-    '#footer, #topBg, #LinkMark, .lightColor, #DarkButton, #navLogoMain, #navLogoText, .DarkColorMask, .workLinkPic'
-  );
@@ function setTheme(dark)
     if (dark) {
       $lightIcon.hide();
       $darkIcon.show();
       $darkMask.show().css('zIndex', 9);
-      $underLine.css('backgroundColor', ACCENT_DARK);
       $root.addClass('theme-dark').removeClass('theme-light');
-      $html.css('filter', 'invert(1)');
-      $inverseTargets.addClass('inverseRepair');
     } else {
       $darkIcon.hide();
       $lightIcon.show();
       $darkMask.hide();
-      $underLine.css('backgroundColor', ACCENT_LIGHT);
       $root.removeClass('theme-dark').addClass('theme-light');
-      $html.css('filter', 'invert(0)');
-      $inverseTargets.removeClass('inverseRepair');
     }
```

`.underLine` 的绿/紫切换改由 CSS 承担：`#underLine { background-color: var(--c-accent) }`，
`ACCENT_LIGHT` / `ACCENT_DARK` 两个 JS 常量随之删除。

## 4. 需要一并处理的三处残留

1. **深色遮罩 `#DarkColorMask`**：现在靠 `filter` 改成暗色，迁移后必须给它显式
   `background-color`（建议 `rgba(0, 0, 0, 0.5)`），否则会变成透明层，首屏点击仍被拦住
   但看不出原因。
2. **图片类元素**：`.workLinkPic`、`#navLogoMain`、`#navLogoText`、`.lightColor`、
   `#DarkButton` 不再需要反向滤镜，但 `#LinkMark` 的菜单底色要改用 `var(--c-surface)`。
3. **`RCMenu.css` 的 `.light-menu-list` / `.dark-menu-list`**：两套菜单的底色分别对应
   `--c-page` 与 `--c-page` 的深色值，迁移后可以合并成一个 `.ctx-menu` 类。

## 5. 验收口径

- 深浅切换前后，逐屏比对 6 个区块：首屏、关于、作品、日志、页脚、右键菜单。
- `document.querySelectorAll('.inverseRepair').length === 0`，且 `html` 的 computed
  `filter === 'none'`。
- 新增一张作品卡片只改 `index.html` + `css/works.css` 两个文件，不需要再碰 JS。
- 深色模式下截图像素抽样：页面底色应接近 `#121212`，而不是浅色反色得到的近似值。
