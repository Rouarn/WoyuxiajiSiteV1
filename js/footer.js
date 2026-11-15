/**
 * 右键菜单项的点击行为。
 *
 * 旧实现按 li 的索引绑定（index===0 复制、index===5 删除…），而深浅两套菜单的
 * 条目数量和顺序并不一致，于是浅色菜单第 6 项会被当成「删除」并真的把 DOM 移除。
 * 现在改为读取 li 上的 data-action，两套菜单共用同一份逻辑。
 */
(function ($, window, document) {
  'use strict';

  var COPY_TEXT = '(●ˇ∀ˇ●) 不让复制';

  function toast(message) {
    if (window.AppToast) window.AppToast(message);
  }

  function copyPageLink() {
    var text = '网址：' + window.location.href + '  标题：' + document.title + '  内容：' + COPY_TEXT;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        /* 无权限时静默，提示已经给出 */
      });
    }
    toast('你在复制什么呢？');
  }

  var ACTIONS = {
    copy: copyPageLink,
    paste: function () {
      toast('你在粘贴什么呢？');
    },
    cut: function () {
      toast('你在剪切什么呢？');
    },
    download: function () {
      toast('你在保存什么呢？');
    },
    delete: function () {
      // 只提示，不再真实删除页面节点：误触会把正文永久移除，且刷新前无法恢复
      toast('你在删除什么呢？');
    }
  };

  $('.light-menu-list, .dark-menu-list').on('click', 'li[data-action]', function (e) {
    e.preventDefault();
    var handler = ACTIONS[$(this).data('action')];
    if (handler) handler();
  });
})(window.jQuery, window, document);
