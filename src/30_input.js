/* ===========================================================================
   EON COMMANDO — 30 input
   One action set, three sources: keyboard, touch pads, gamepad.
   =========================================================================== */

var Input = {
  keys: {},          // physical keys currently down
  touch: {},         // on-screen buttons currently down
  pad: {},           // gamepad-derived actions
  cur: {},           // merged actions this frame
  prev: {},          // merged actions last frame
  anyKey: false,

  MAP: {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    Space: 'jump', KeyX: 'jump', KeyK: 'jump',
    KeyZ: 'fire', KeyJ: 'fire', ControlLeft: 'fire', ControlRight: 'fire',
    Enter: 'start', NumpadEnter: 'start',
    KeyP: 'pause', Escape: 'pause',
    KeyM: 'mute',
    KeyR: 'restart'
  },

  ACTIONS: ['left', 'right', 'up', 'down', 'jump', 'fire', 'start', 'pause', 'mute', 'restart'],

  init: function () {
    var self = this;

    window.addEventListener('keydown', function (e) {
      var a = self.MAP[e.code];
      if (a) {
        self.keys[a] = true;
        self.anyKey = true;
        if (e.code === 'Space' || e.code.indexOf('Arrow') === 0 || e.code === 'Enter') e.preventDefault();
      }
      Snd.resume();
    }, { passive: false });

    window.addEventListener('keyup', function (e) {
      var a = self.MAP[e.code];
      if (a) self.keys[a] = false;
    });

    window.addEventListener('blur', function () {
      self.keys = {};
      self.touch = {};
    });

    /* on-screen pads -------------------------------------------------------- */
    var buttons = document.querySelectorAll('[data-k]');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var action = btn.getAttribute('data-k');
        var down = function (e) {
          e.preventDefault();
          self.touch[action] = true;
          btn.classList.add('on');
          Snd.resume();
        };
        var up = function (e) {
          if (e) e.preventDefault();
          self.touch[action] = false;
          btn.classList.remove('on');
        };
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointercancel', up);
        btn.addEventListener('pointerleave', up);
        btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      })(buttons[i]);
    }

    var pauseBtn = document.getElementById('btnPause');
    if (pauseBtn) {
      pauseBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        self.touch.pause = true;
        Snd.resume();
        setTimeout(function () { self.touch.pause = false; }, 120);
      });
    }

    /* touch capability detection ------------------------------------------- */
    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
                  window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) document.body.classList.add('touch');

    window.addEventListener('pointerdown', function () { Snd.resume(); }, { passive: true });
  },

  frame: function () {
    this.prev = this.cur;
    var cur = {};
    for (var i = 0; i < this.ACTIONS.length; i++) {
      var a = this.ACTIONS[i];
      cur[a] = !!(this.keys[a] || this.touch[a] || this.pad[a]);
    }
    this.cur = cur;
    this.pollGamepad();
  },

  pollGamepad: function () {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i];
      if (!p) continue;
      var b = p.buttons, ax = p.axes;
      this.pad.left = (b[14] && b[14].pressed) || ax[0] < -0.4;
      this.pad.right = (b[15] && b[15].pressed) || ax[0] > 0.4;
      this.pad.up = (b[12] && b[12].pressed) || ax[1] < -0.4;
      this.pad.down = (b[13] && b[13].pressed) || ax[1] > 0.4;
      this.pad.jump = !!(b[0] && b[0].pressed);
      this.pad.fire = !!((b[2] && b[2].pressed) || (b[1] && b[1].pressed));
      this.pad.start = !!((b[9] && b[9].pressed) || (b[8] && b[8].pressed));
      this.pad.pause = !!(b[9] && b[9].pressed);
      return;
    }
  },

  held: function (a) { return !!this.cur[a]; },
  pressed: function (a) { return !!this.cur[a] && !this.prev[a]; },
  released: function (a) { return !this.cur[a] && !!this.prev[a]; },
  axis: function () { return (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0); }
};

/* ---- canvas scaling ------------------------------------------------------
   Keep the 480x270 buffer crisp: scale by a whole number where possible.   */
function fitCanvas() {
  var cv = document.getElementById('c');
  if (!cv) return;

  /* logical width follows the window's aspect ratio (16:9 -> 21:9) */
  var w = viewWidthFor(window.innerWidth, window.innerHeight);
  if (w !== W) {
    W = w;
    cv.width = W;
    cv.height = H;
    var g2 = cv.getContext('2d');
    g2.imageSmoothingEnabled = false;
    if (typeof Game !== 'undefined' && Game.stage) {
      Game.camX = clamp(Game.camX, 0, Game.stage.length - W);
    }
  }

  var availW = window.innerWidth;
  var availH = window.innerHeight;
  if (PARAMS.shot) {
    var sc0 = Math.min(availW / W, availH / H);
    cv.style.width = Math.round(W * sc0) + 'px';
    cv.style.height = Math.round(H * sc0) + 'px';
    return;
  }

  var pad = document.body.classList.contains('touch') ? 4 : 24;
  availW -= pad;
  availH -= document.body.classList.contains('touch') ? 4 : 60;
  var scale = Math.min(availW / W, availH / H);
  var snapped = Math.floor(scale);
  if (snapped >= 1 && snapped / scale > 0.9) scale = snapped;
  cv.style.width = Math.round(W * scale) + 'px';
  cv.style.height = Math.round(H * scale) + 'px';
}
