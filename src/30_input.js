/* ===========================================================================
   EON COMMANDO — 30 input
   One action set, three sources: keyboard, touch pads, gamepad.
   =========================================================================== */

var Input = {
  keys: {},          // physical keys currently down
  touch: {},         // on-screen buttons currently down
  pad: {},           // gamepad-derived actions
  cur: {},           // merged actions this frame (player one)
  prev: {},          // merged actions last frame
  keys2: {}, touch2: {}, pad2: {},
  cur2: {}, prev2: {},   // player two
  anyKey: false,
  anyKey: false,

  /* player two on one keyboard: left hand on WASD, right hand on , . / ; ' */
  MAP2: {
    KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down',
    Period: 'jump', Comma: 'fire',
    Slash: 'dash', Semicolon: 'melee', Quote: 'grenade',
    Digit2: 'start2'
  },

  MAP: {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    Space: 'jump', KeyX: 'jump', KeyK: 'jump',
    KeyZ: 'fire', KeyJ: 'fire', ControlLeft: 'fire', ControlRight: 'fire',
    ShiftLeft: 'dash', ShiftRight: 'dash', KeyL: 'dash',
    KeyV: 'melee', KeyC: 'melee',
    KeyG: 'grenade', KeyB: 'grenade',
    KeyF: 'fullscreen',
    Enter: 'start', NumpadEnter: 'start',
    Digit2: 'start2',
    KeyP: 'pause', Escape: 'pause',
    KeyM: 'mute',
    KeyR: 'restart',
    KeyO: 'settings'
  },

  ACTIONS: ['left', 'right', 'up', 'down', 'jump', 'fire', 'dash', 'melee', 'grenade',
            'start', 'start2', 'pause', 'mute', 'restart', 'fullscreen', 'settings'],

  init: function () {
    var self = this;

    window.addEventListener('keydown', function (e) {
      var a2 = self.MAP2[e.code];
      if (a2) {
        self.keys2[a2] = true;
        self.anyKey = true;
        if (e.code === 'Period' || e.code === 'Comma') e.preventDefault();
      }
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
      var a2 = self.MAP2[e.code];
      if (a2) self.keys2[a2] = false;
    });

    window.addEventListener('blur', function () {
      self.keys = {};
      self.touch = {};
      self.keys2 = {};
      self.touch2 = {};
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
    var cur = {}, i, a;
    for (i = 0; i < this.ACTIONS.length; i++) {
      a = this.ACTIONS[i];
      cur[a] = !!(this.keys[a] || this.touch[a] || this.pad[a]);
    }
    this.cur = cur;

    this.prev2 = this.cur2;
    var cur2 = {};
    for (i = 0; i < this.ACTIONS.length; i++) {
      a = this.ACTIONS[i];
      cur2[a] = !!(this.keys2[a] || this.touch2[a] || this.pad2[a]);
    }
    this.cur2 = cur2;

    this.pollGamepad();
  },

  pollGamepad: function () {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    var seen = 0;
    for (var i = 0; i < pads.length && seen < 2; i++) {
      var p = pads[i];
      if (!p) continue;
      var b = p.buttons, ax = p.axes;
      var set = seen === 0 ? this.pad : this.pad2;
      set.left = (b[14] && b[14].pressed) || ax[0] < -0.4;
      set.right = (b[15] && b[15].pressed) || ax[0] > 0.4;
      set.up = (b[12] && b[12].pressed) || ax[1] < -0.4;
      set.down = (b[13] && b[13].pressed) || ax[1] > 0.4;
      set.jump = !!(b[0] && b[0].pressed);
      set.fire = !!((b[2] && b[2].pressed) || (b[1] && b[1].pressed));
      set.dash = !!((b[5] && b[5].pressed) || (b[7] && b[7].pressed));
      set.melee = !!(b[3] && b[3].pressed);
      set.grenade = !!(b[4] && b[4].pressed);
      set.start = !!((b[9] && b[9].pressed) || (b[8] && b[8].pressed));
      set.pause = !!(b[9] && b[9].pressed);
      seen++;
    }
    if (seen < 2) this.pad2 = {};
  },

  /* player two reads through the same interface as player one */
  ctl2: {
    held: function (a) { return !!Input.cur2[a]; },
    pressed: function (a) { return !!Input.cur2[a] && !Input.prev2[a]; },
    axis: function () { return (Input.cur2.right ? 1 : 0) - (Input.cur2.left ? 1 : 0); }
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

  /* the visual viewport, so mobile browser chrome is accounted for */
  var vv = window.visualViewport;
  var vw = Math.max(240, (vv ? vv.width : window.innerWidth) || 320);
  var vh = Math.max(240, (vv ? vv.height : window.innerHeight) || 320);
  var portrait = vh > vw;
  document.body.classList.toggle('portrait', portrait);

  /* logical width follows the aspect ratio; portrait keeps the 16:9 floor */
  var w = viewWidthFor(vw, vh);
  DPR = clamp(window.devicePixelRatio || 1, 1, 2);
  var wantW = Math.round(w * DPR), wantH = Math.round(H * DPR);
  if (w !== W || cv.width !== wantW || cv.height !== wantH) {
    W = w;
    cv.width = wantW;
    cv.height = wantH;
    var g2 = cv.getContext('2d');
    g2.imageSmoothingEnabled = false;
    if (typeof Game !== 'undefined' && Game.stage) {
      Game.camX = clamp(Game.camX, 0, Math.max(0, Game.stage.length - W));
    }
    if (typeof buildScanlines === 'function') buildScanlines();
  }

  if (PARAMS.shot) {
    var sc0 = Math.min(vw / W, vh / VIEW_H);
    cv.style.width = Math.round(W * sc0) + 'px';
    cv.style.height = Math.round(VIEW_H * sc0) + 'px';
    return;
  }

  /* Portrait: give the canvas the full screen height and let the world band
     sit in the middle, with sky above and earth below. The thumb pads overlay
     the lower dirt, so nothing is reserved and nothing is wasted. */
  if (portrait) {
    /* the band sits at the top where the eyes are; the earth continues below
       and the thumb pads overlay it, so the whole screen is used */
    VIEW_H = clamp(Math.round(W * (vh / vw)), H, 900);
    Y0 = 0;
  } else {
    VIEW_H = H;
    Y0 = 0;
  }
  var wantH = Math.round(VIEW_H * DPR);
  if (cv.height !== wantH) cv.height = wantH;

  var availW = vw;
  var availH = vh;

  var scale = Math.min(availW / W, availH / VIEW_H);
  if (scale <= 0) scale = 1;

  /* snap to a whole number when it costs almost nothing — crisper pixels */
  var snapped = Math.floor(scale);
  if (snapped >= 1 && snapped / scale > 0.88) scale = snapped;

  cv.style.width = Math.round(W * scale) + 'px';
  cv.style.height = Math.round(VIEW_H * scale) + 'px';
}
