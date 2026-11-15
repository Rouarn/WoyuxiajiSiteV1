/**
 * 樱花飘落。
 *
 * 相比旧实现的改动：
 * 1. 旧版 this.opacity = this.w / 50 里 w 不存在，得到 NaN，ctx.globalAlpha 被静默
 *    忽略，透明度其实从未生效；这里改用真实的花瓣宽度。
 * 2. 画布按 devicePixelRatio 放大，2x 屏不再糊。
 * 3. 关闭开关 / 页面隐藏 / 切到手机断点时真正 cancelAnimationFrame，不再空转。
 * 4. resize 防抖 200ms，避免拖动窗口时每像素重建画布。
 * 5. 鼠标横向影响改为限幅的轻微漂移，旧版 mouseX * 5 会把花瓣整体推出画面。
 */
(function (window, document) {
  'use strict';

  var canvas = document.querySelector('.woyuxaiji > canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var PETAL_COUNT = 60;
  var MOBILE_QUERY = '(max-width: 768px)';
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0;
  var height = 0;
  var petals = [];
  var mouseRatio = 0.5;
  var rafId = 0;
  var running = false;
  var enabled = true;
  var toggleBtn = document.getElementById('closeSakura');
  var mq = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
  var resizeTimer = null;

  var img = new Image();

  function Petal() {
    this.reset(true);
  }

  Petal.prototype.reset = function (initial) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height * 2 - height : -40;
    this.size = Math.random() * 15 + 25;
    this.opacity = Math.min(1, this.size / 45);
    this.rotate = Math.random() * Math.PI;
    this.xSpeed = Math.random() * 1.2 + 0.6;
    this.ySpeed = Math.random() + 1.2;
    this.rotateSpeed = Math.random() * 0.02 - 0.01;
  };

  Petal.prototype.step = function () {
    this.x += this.xSpeed + (mouseRatio - 0.5) * 1.2;
    this.y += this.ySpeed;
    this.rotate += this.rotateSpeed;

    if (this.x > width + 40 || this.y > height + 40) {
      this.reset(false);
      this.x = Math.random() * width - 40;
      return;
    }

    ctx.globalAlpha = this.opacity;
    var w = this.size * (0.6 + Math.abs(Math.cos(this.rotate)) / 3);
    var h = this.size * 0.78 * (0.8 + Math.abs(Math.sin(this.rotate)) / 5);
    ctx.drawImage(img, this.x, this.y, w, h);
  };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    // 之后所有绘制都用 CSS 像素坐标，由变换矩阵负责放大
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < petals.length; i++) petals[i].step();
    rafId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running || !enabled || !img.complete || !img.naturalWidth) return;
    running = true;
    rafId = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function seed() {
    petals = [];
    for (var i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());
  }

  function updateToggleText() {
    if (!toggleBtn) return;
    toggleBtn.textContent = enabled ? '关闭樱花飘落' : '打开樱花飘落';
    toggleBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      enabled = !enabled;
      canvas.style.display = enabled ? 'block' : 'none';
      if (enabled) start();
      else stop();
      updateToggleText();
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener('resize', function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resize();
    }, 200);
  });

  function onPointerMove(clientX) {
    if (clientX == null || !width) return;
    mouseRatio = Math.min(1, Math.max(0, clientX / width));
  }

  window.addEventListener('mousemove', function (e) {
    onPointerMove(e.clientX);
  });
  window.addEventListener(
    'touchmove',
    function (e) {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  // 手机端不初始化：CSS 已隐藏画布，这里连图片和解码都不做
  if (mq && mq.matches) {
    canvas.style.display = 'none';
    enabled = false;
    updateToggleText();
    return;
  }

  resize();
  img.onload = function () {
    seed();
    start();
  };
  img.src = './img/sakura.webp';
})(window, document);
