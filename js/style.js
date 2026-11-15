/**
 * 导航（含移动端侧边菜单）、主题切换、首屏时间。
 *
 * 主题沿用「整页反色 + 局部再反色」的既有方案，本轮不改视觉：
 * 因此任何需要保持原色的图片元素都必须挂 .inverseRepair，统一收敛在
 * $inverseTargets 一处，避免像旧实现那样在 4 个 handler 里各抄一份清单。
 */
(function ($, window, document) {
  'use strict';

  var $root = $('#woyuxaiji');
  var $html = $('html');
  var $markBtnShow = $('#MarkBtnShow');
  var $markBtnConceal = $('#MarkBtnConceal');
  var $topBgMask = $('#topBgMask');
  var $navLinkMarkBox = $('#navLinkMarkBox');
  var $linkMark = $('#LinkMark');
  var $sideItems = $('.sideList');
  var $themeBtn = $('#navLink5');
  var $underLine = $('#underLine');
  var $lightIcon = $('#lightColor');
  var $darkIcon = $('#darkColor');
  var $darkMask = $('#DarkColorMask');

  // 反色后需要恢复原色的元素，新增图片元素时只改这一处
  var $inverseTargets = $(
    '#footer, #topBg, #LinkMark, .lightColor, #DarkButton, #navLogoMain, #navLogoText, .DarkColorMask, .workLinkPic'
  );

  var SIDE_ACTIVE_BG = 'rgba(255, 255, 255, .6)';
  var ACCENT_LIGHT = 'rgba(0, 255, 0, .6)';
  var ACCENT_DARK = '#aaaaff';

  // 右键菜单里那几句玩笑文案，深浅色各一套（原实现直接写死在两个 handler 里）
  var MENU_LABELS = {
    light: ['小黑子', '唱,跳', 'rap', '篮球', '你会吗'],
    dark: ['坤坤爱跳舞', '坤坤爱唱歌', '坤坤爱rap', '坤坤爱篮球', '坤坤两年半']
  };

  function isDark() {
    return $root.hasClass('theme-dark');
  }

  function clearSideActive() {
    $sideItems.css('backgroundColor', 'transparent');
  }

  function openSideMenu() {
    $navLinkMarkBox.show();
    $linkMark.show();
    $markBtnConceal.show();
    // 遮罩只在移动端存在，桌面端 CSS 用 display:none 屏蔽，这里不重复判断
    $topBgMask.show().css('zIndex', 10);
    // .hidden 负责隐藏按钮自身的 ::before 横线，不能只改宽高
    $markBtnShow.css({ width: '0', height: '0' }).addClass('hidden').attr('aria-expanded', 'true');
  }

  function closeSideMenu() {
    $navLinkMarkBox.hide();
    $linkMark.hide();
    $markBtnConceal.hide();
    $topBgMask.hide().css('zIndex', -10);
    $markBtnShow.show().css({ width: '25px', height: '2px' }).attr('aria-expanded', 'false');
    clearSideActive();
  }

  function setMenuLabels(dark) {
    var labels = dark ? MENU_LABELS.dark : MENU_LABELS.light;
    for (var i = 0; i < labels.length; i++) {
      $('#lightMenuList' + (i + 1)).text(labels[i]);
    }
  }

  /**
   * 深浅色切换的唯一入口。
   * 注意：无论从导航栏按钮还是侧边菜单触发，都走这里，避免两套逻辑再次分叉。
   */
  function setTheme(dark) {
    if (dark) {
      $lightIcon.hide();
      $darkIcon.show();
      $darkMask.show().css('zIndex', 9);
      $underLine.css('backgroundColor', ACCENT_DARK);
      $root.addClass('theme-dark').removeClass('theme-light');
      $html.css('filter', 'invert(1)');
      $inverseTargets.addClass('inverseRepair');
    } else {
      $darkIcon.hide();
      $lightIcon.show();
      $darkMask.hide();
      $underLine.css('backgroundColor', ACCENT_LIGHT);
      $root.removeClass('theme-dark').addClass('theme-light');
      $html.css('filter', 'invert(0)');
      $inverseTargets.removeClass('inverseRepair');
    }

    // 侧边菜单里两个条目互为「当前未启用」状态，只显示其中一个
    $('#sideList5').css('visibility', dark ? 'hidden' : 'visible');
    $('#sideList6').css('visibility', dark ? 'visible' : 'hidden');

    $themeBtn.attr('aria-pressed', dark ? 'true' : 'false');
    setMenuLabels(dark);
  }

  // 移动端菜单开合
  $markBtnShow.on('click', openSideMenu);
  $markBtnConceal.on('click', closeSideMenu);
  $topBgMask.on('click', closeSideMenu);
  $('#sideListboxMark').on('click', clearSideActive);

  // 侧边菜单跳转时高亮当前项，并收起菜单
  $('#sideList1, #sideList2, #sideList3, #sideList4').on('click', function () {
    clearSideActive();
    $(this).css('backgroundColor', SIDE_ACTIVE_BG);
    closeSideMenu();
  });

  // 主题切换：导航栏按钮与侧边菜单的两个条目共用 setTheme
  $themeBtn.on('click', function (e) {
    e.preventDefault();
    setTheme(!isDark());
  });
  $('#sideList5').on('click', function (e) {
    e.preventDefault();
    setTheme(true);
  });
  $('#sideList6').on('click', function (e) {
    e.preventDefault();
    setTheme(false);
  });

  // 点击首屏之外的主要锚点时收起移动端菜单，替代旧版三个重复的 handler
  $('#about, #works, #backToTop').on('click', closeSideMenu);

  // 首屏时间：只更新文本节点，避免每秒重新解析 innerHTML；页面隐藏时停表
  var $currentTime = $('#currentTime');
  if ($currentTime.length) {
    var clockTimer = null;

    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function renderClock() {
      var d = new Date();
      $currentTime.text(
        '今天是' +
          d.getFullYear() +
          '年' +
          pad(d.getMonth() + 1) +
          '月' +
          pad(d.getDate()) +
          '日' +
          pad(d.getHours()) +
          ':' +
          pad(d.getMinutes()) +
          ':' +
          pad(d.getSeconds())
      );
    }

    function startClock() {
      if (clockTimer) return;
      renderClock();
      clockTimer = window.setInterval(renderClock, 1000);
    }

    function stopClock() {
      if (!clockTimer) return;
      window.clearInterval(clockTimer);
      clockTimer = null;
    }

    startClock();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopClock();
      else startClock();
    });
  }

  // 打字机动画结束后去掉光标边框（6s 动画 + 1s 缓冲）
  var $h2Span = $('#h2Span');
  if ($h2Span.length) {
    window.setTimeout(function () {
      $h2Span.css('borderRight', 'none');
    }, 7000);
  }
})(window.jQuery, window, document);
