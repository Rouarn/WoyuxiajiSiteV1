/**
 * 双色右键菜单。
 *
 * 旧实现用 $('.light') 选中菜单容器，但 #woyuxaiji 根节点也带 light 类，
 * 结果整页都绑上了菜单；而 $('.dark') 在加载时是空集，深色菜单永远打不开。
 * 现在统一绑在页面根节点上，按当前主题选择要展示的菜单。
 */
(function ($, window, document) {
  'use strict';

  var $root = $('#woyuxaiji');
  var $lightMenu = $('.light-menu-list');
  var $darkMenu = $('.dark-menu-list');
  var VIEWPORT_MARGIN = 8;

  if (!$root.length) return;

  function hideAll() {
    $lightMenu.removeClass('menu-show').find('li').removeClass('menu-item-show');
    $darkMenu.removeClass('menu-show').find('li').removeClass('menu-item-show');
  }

  function show($menu, x, y, origin) {
    if (!$menu.length) return;

    // 菜单常态是 height:0 + overflow:hidden，只能用 scrollWidth/scrollHeight 量真实尺寸，
    // 量到的值同时写进 CSS 变量，.menu-show 靠它展开
    var width = $menu[0].scrollWidth;
    var height = $menu[0].scrollHeight;

    // 贴边时向内收，避免菜单被视口裁掉
    var left = Math.min(x, window.innerWidth - width - VIEWPORT_MARGIN);
    var top = Math.min(y, window.innerHeight - height - VIEWPORT_MARGIN);

    $menu
      .attr('style', '--width: ' + width + 'px; --height: ' + height + 'px;')
      .css({ top: Math.max(VIEWPORT_MARGIN, top) + 'px', left: Math.max(VIEWPORT_MARGIN, left) + 'px' })
      .addClass('menu-show')
      .find('li')
      .addClass('menu-item-show');

    // 供菜单项的行为（如“复制/删除”）读取被右键的元素
    $menu.data('ctxTarget', origin || null);
  }

  $root.on('contextmenu', function (e) {
    var original = e.originalEvent || e;
    e.preventDefault();

    var dark = $root.hasClass('theme-dark');
    show(dark ? $darkMenu : $lightMenu, original.clientX, original.clientY, original.target);
  });

  $(document).on('click', hideAll);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) hideAll();
  });
  $(window).on('resize', hideAll);
})(window.jQuery, window, document);
