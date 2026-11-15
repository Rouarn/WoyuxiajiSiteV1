/**
 * 标签切换时的标题滚动小彩蛋。
 *
 * 旧实现把「隐藏」和「显示」拆成两个 visibilitychange 监听，各自起定时器且只清理
 * 自己那一个，快速来回切标签时会残留多个 interval 同时改 document.title。
 * 这里统一成一个监听 + 两个可控定时器，切换前先全部清掉。
 */
(function (window, document) {
  'use strict';

  var ORIGINAL_TITLE = document.title;
  var text = {
    hidden: '   QAQ 酱酱好伤心、好想哭、呜呜呜...',
    visible: '   O(∩_∩)O 你回来了 酱酱好开心、么么哒...'
  };
  var scrollTimer = null;
  var restoreTimer = null;

  function clearTimers() {
    if (scrollTimer) {
      window.clearInterval(scrollTimer);
      scrollTimer = null;
    }
    if (restoreTimer) {
      window.clearTimeout(restoreTimer);
      restoreTimer = null;
    }
  }

  /** 逐帧左移一个字，key 指向 text 里被就地修改的那条文案 */
  function startScroll(key) {
    scrollTimer = window.setInterval(function () {
      text[key] = text[key].substring(1) + text[key].substring(0, 1);
      document.title = text[key];
    }, 500);
  }

  document.addEventListener('visibilitychange', function () {
    clearTimers();

    if (document.hidden) {
      startScroll('hidden');
      return;
    }

    startScroll('visible');
    restoreTimer = window.setTimeout(function () {
      if (scrollTimer) {
        window.clearInterval(scrollTimer);
        scrollTimer = null;
      }
      document.title = ORIGINAL_TITLE;
    }, 5000);
  });
})(window, document);
