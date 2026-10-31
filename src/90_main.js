/* ===========================================================================
   EON COMMANDO — 90 main
   Canvas setup, the fixed-timestep loop, and the debug harness used to
   capture the screenshots in docs/.
   =========================================================================== */

var canvas, ctx;
var _last = 0, _acc = 0;

/* surface runtime errors instead of failing silently */
window.addEventListener('error', function (e) {
  (window.__eonErrors = window.__eonErrors || []).push(String(e.message));
  try { document.title = 'ERR ' + e.message; } catch (err) {}
});

function boot() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  if (PARAMS.shot) document.body.classList.add('shot');
  if (PARAMS.touch === '1') document.body.classList.add('touch');
  buildScanlines();
  Input.init();
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitCanvas);
    window.visualViewport.addEventListener('scroll', fitCanvas);
  }
  window.addEventListener('orientationchange', function () {
    setTimeout(fitCanvas, 150);
  });

  Snd.setMuted(!!Store.get('muted', false));
  Game.init();

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    Snd.resume();
    Game.pressStart();
  });

  window.__eon = Game;              // test hook

  /* PWA: only over http(s), never from file:// */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  if (PARAMS.demo) runDemo(parseInt(PARAMS.demo, 10) || 240);

  _last = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  var dt = (now - _last) / 1000;
  _last = now;
  if (dt > 0.25) dt = 0.25;
  _acc += dt;

  if (window.__freeze) { Render(ctx); requestAnimationFrame(loop); return; }

  var steps = 0;
  while (_acc >= STEP && steps < 5) {
    Input.frame();
    if (Input.pressed('fullscreen')) toggleFullscreen();
    Game.update();
    _acc -= STEP;
    steps++;
  }

  Render(ctx);
  requestAnimationFrame(loop);
}

/* ---- fullscreen + wake lock -------------------------------------------- */
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  } catch (e) {}
}

var _wakeLock = null;
function keepAwake(on) {
  if (!('wakeLock' in navigator)) return;
  try {
    if (on && !_wakeLock) {
      navigator.wakeLock.request('screen').then(function (lock) {
        _wakeLock = lock;
        lock.addEventListener('release', function () { _wakeLock = null; });
      }).catch(function () {});
    } else if (!on && _wakeLock) {
      _wakeLock.release().catch(function () {});
      _wakeLock = null;
    }
  } catch (e) {}
}

/* ---- deterministic demo: used for screenshots and smoke tests ----------- */
function runDemo(n) {
  Game.startGame();
  if (PARAMS.stage) {
    var idx = clamp(parseInt(PARAMS.stage, 10) - 1, 0, STAGES.length - 1);
    Game.loadStage(idx);
  }
  if (PARAMS.warp) {
    Game.player.x = parseFloat(PARAMS.warp);
    Game.camX = clamp(Game.player.x - W * 0.42, 0, Game.stage.length - W);
    Game.pending = Game.pending.filter(function (e) { return e.x > Game.player.x - 100; });
  }
  if (PARAMS.hp) Game.player.hp = parseInt(PARAMS.hp, 10);

  var fire = PARAMS.idle !== '1' && PARAMS.fire !== '0';
  var move = PARAMS.idle !== '1' && PARAMS.right !== '0';
  var jump = PARAMS.jump !== '0';
  for (var i = 0; i < n; i++) {
    Input.touch.right = move;
    Input.touch.fire = fire;
    Input.touch.jump = jump && move && (i % 96 < 5);
    Input.touch.up = PARAMS.aimup === '1' && (i % 120 < 40);
    Input.frame();
    Game.update();
  }
  /* optional final pose, then settle the camera */
  if (PARAMS.px) Game.player.x = parseFloat(PARAMS.px);
  if (PARAMS.py) Game.player.y = parseFloat(PARAMS.py);
  if (PARAMS.px || PARAMS.py) {
    Game.camX = Game.arenaLocked ? Game.stage.arenaStart
      : clamp(Game.player.x - W * 0.42, 0, Game.stage.length - W);
    for (var s2 = 0; s2 < 3; s2++) { Input.frame(); Game.update(); }
  }
  Input.touch = {};
  Game.stateTimer = Math.max(Game.stateTimer, 0);
  if (PARAMS.pose === 'settings') { Game.state = 'settings'; Game.settingsIndex = 0; }
  if (PARAMS.pose === 'leaderboard') { Game.score = 24500; Game.recordRun('EON SECURED'); }
  if (Game.boss) Game.boss.flash = 0;
  if (Game.player) { Game.player.dead = false; Game.player.hurtFlash = 0; Game.player.invuln = 0; }
  window.__freeze = true;
  if (PARAMS.debug) {
    var b = Game.boss;
    document.title = 'DBG cam=' + Math.round(Game.camX) + ' locked=' + Game.arenaLocked +
      ' boss=' + (b ? (Math.round(b.x) + ',' + Math.round(b.y) + ' hp' + b.hp + ' intro' + b.introT) : 'none') +
      ' player=' + Math.round(Game.player.x) + ',' + Math.round(Game.player.y) +
      ' state=' + Game.state + ' banner=' + (Game.banner ? Game.banner.life : '-');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
