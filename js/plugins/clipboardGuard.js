/**
 * 剪贴板与拖拽拦截。
 *
 * 页面上所有 copy/paste/cut/drag 的拦截只在这里注册一次：旧实现里 aboutMe.js
 * 还有一套 jQuery 版监听，两套都会 preventDefault 并各弹一次提示。
 */
(function (window, document) {
  'use strict';

  var WATERMARK = '(●ˇ∀ˇ●) 不让复制';

  function ClipboardGuard() {
    this.alert = document.querySelector('.Alert');
    this._bind();
  }

  ClipboardGuard.prototype._show = function (text) {
    if (window.AppToast) {
      window.AppToast(text);
      return;
    }
    if (!this.alert) return;
    this.alert.textContent = text;
    this.alert.style.display = 'flex';
    var self = this;
    window.setTimeout(function () {
      self.alert.style.display = 'none';
    }, 3000);
  };

  ClipboardGuard.prototype._bind = function () {
    var self = this;

    document.addEventListener('copy', function (e) {
      self._show('你在复制什么呢？');
      e.preventDefault();
      // 复制出去的内容替换成站点水印，保持旧版行为
      if (e.clipboardData) {
        e.clipboardData.setData(
          'text/plain',
          '网址：' + window.location.href + '  标题：' + document.title + '  内容：' + WATERMARK
        );
      }
    });

    document.addEventListener('paste', function (e) {
      self._show('你在粘贴什么呢？');
      e.preventDefault();
    });

    document.addEventListener('cut', function (e) {
      self._show('你在剪切什么呢？');
      e.preventDefault();
    });

    document.addEventListener('drag', function () {
      self._show('小主, 不要拽了,很痛的o(╥﹏╥)o');
    });
  };

  window.ClipboardGuard = ClipboardGuard;
})(window, document);
