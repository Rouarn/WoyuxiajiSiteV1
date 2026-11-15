/**
 * 入口初始化：只做装配，不承载业务逻辑。
 *
 * 旧版这里还会初始化 WOW.js 和 themeToggle 插件，两者实际都不起作用
 * （页面没有 .wow 元素；插件用的 .dark-animation/.light-animation 也没有任何样式）。
 * 主题切换现在由 js/style.js 的 setTheme 统一负责。
 */
(function (window, document) {
  'use strict';

  var alertEl = document.querySelector('.Alert');
  var alertTimer = null;

  /**
   * 全站唯一的轻提示。重复调用会重置计时，避免多个 timer 互相抢 display。
   * @param {string} message 纯文本，统一走 textContent，避免拼接 HTML
   */
  function toast(message) {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.style.display = 'flex';
    if (alertTimer) window.clearTimeout(alertTimer);
    alertTimer = window.setTimeout(function () {
      alertEl.style.display = 'none';
      alertTimer = null;
    }, 3000);
  }

  if (alertEl) {
    alertEl.addEventListener('click', function () {
      alertEl.style.display = 'none';
      if (alertTimer) {
        window.clearTimeout(alertTimer);
        alertTimer = null;
      }
    });
    // 提示层上禁用右键菜单，避免和页面的自定义右键菜单叠加
    alertEl.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  window.AppToast = toast;

  if (window.ClipboardGuard) {
    try {
      new window.ClipboardGuard();
    } catch (err) {
      window.console && console.warn('ClipboardGuard 初始化失败', err);
    }
  }
})(window, document);
