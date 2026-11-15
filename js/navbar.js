/**
 * 导航栏滚动吸顶样式切换。
 *
 * 首屏高度只在 resize 时重新测量：旧实现每一帧都调 $shouye.height()，
 * 等于每帧强制一次同步布局，滚动越久越容易掉帧。
 */
(function ($, window, document) {
  'use strict';

  var $navbar = $('#navbar');
  var $navLinkBox = $('#navLinkBox');
  var $shouye = $('#shouye');
  var heroHeight = 0;
  var ticking = false;

  function measure() {
    heroHeight = $shouye.length ? $shouye.height() : 0;
  }

  function update() {
    if ($(document).scrollTop() > heroHeight - 90) {
      $navbar.addClass('hidden animate__fadeIn');
      $navLinkBox.addClass('hidden');
    } else {
      $navbar.removeClass('hidden animate__fadeIn');
      $navLinkBox.removeClass('hidden');
    }
    ticking = false;
  }

  measure();

  $(window).on('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  });

  var resizeTimer = null;
  $(window).on('resize', function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      measure();
      update();
    }, 150);
  });
})(window.jQuery, window, document);
