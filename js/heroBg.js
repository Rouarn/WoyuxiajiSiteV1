/**
 * 首屏背景：从必应锁屏图池里随机取一张。
 *
 * 为什么不直接请求 HPImageArchive 的 JSON：
 * 该接口不返回 Access-Control-Allow-Origin，纯静态页面 fetch 会被浏览器拦下并在
 * 控制台打印 CORS 报错。因此这里内置一份图池（来源是 HPImageArchive 的 urlbase），
 * 图片本体直连 bing.com CDN，跨域取图不需要 CORS。
 *
 * 兜底策略：预载成功后才替换背景，失败/超时一律保留 CSS 里配置的本地兜底图，
 * 不会出现纯黑首屏。ES5 语法，避免老浏览器直接报错。
 */
(function (window, document) {
  'use strict';

  /** 必应官方锁屏图 id，拼成 https://www.bing.com/th?id=OHR.<id>_1920x1080.jpg */
  var POOL = [
    'FirstFrost_ZH-CN2219029557',
    'BlueHK_ZH-CN1382345392',
    'AbrahamCanada_ZH-CN0344365912',
    'NorthWindow_ZH-CN6734579353',
    'Atlantica_ZH-CN6593995386',
    'RoseIsland_ZH-CN6477140814',
    'TrianaSpain_ZH-CN6329291776',
    'DiwaliLamps_ZH-CN2462894749'
  ];
  var STORAGE_KEY = 'heroBgId';
  var IMAGE_SIZE = '_1920x1080.jpg';
  var TIMEOUT = 8000;
  var target = document.getElementById('topBg');

  // 没有目标节点，或浏览器不支持 Promise 时直接用本地兜底图，不做任何事
  if (!target || typeof window.Promise !== 'function') return;

  function urlOf(id) {
    return 'https://www.bing.com/th?id=OHR.' + id + IMAGE_SIZE;
  }

  // 隐私模式下 sessionStorage 可能抛异常，读写都包一层
  function readLast() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function writeLast(id) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      /* 存不了也不影响主流程 */
    }
  }

  /** 同一会话内尽量不和上一张重复 */
  function pickId() {
    var last = readLast();
    var candidates = POOL.filter(function (id) {
      return id !== last;
    });
    var list = candidates.length ? candidates : POOL;
    return list[Math.floor(Math.random() * list.length)];
  }

  function preload(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        img.src = ''; // 中止仍在进行的请求
        reject(new Error('hero background timeout'));
      }, TIMEOUT);

      img.onload = function () {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(src);
      };
      img.onerror = function () {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(new Error('hero background load error'));
      };

      img.src = src;
    });
  }

  var id = pickId();
  preload(urlOf(id))
    .then(function (src) {
      target.style.backgroundImage = 'url("' + src + '")';
      writeLast(id);
    })
    .catch(function () {
      /* 静默失败：保留 .topBg 里的本地兜底图 */
    });
})(window, document);
