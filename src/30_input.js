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

  /* ---- bindings: data-driven, persisted, per player -------------------- */
  BINDINGS: null,
  rev: {}, rev2: {},
  listening: null,          /* { player, action } while rebinding */

  DEFAULTS: {
    p1: {
      /* One cluster under the left hand: Z X jump, C V melee, A S D fire/dash,
         T auto-fire. No reaching for Control, no second row of duplicates. */
      left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
      jump: ['Space', 'KeyX'], fire: ['KeyZ', 'KeyA'], dash: ['ShiftLeft', 'KeyS'],
      melee: ['KeyC', 'KeyV'], grenade: ['KeyG'], power: ['KeyE'], autofire: ['KeyT'],
      pause: ['KeyP'], start: ['Enter'], start2: ['Digit2'], mute: ['KeyM'],
      restart: ['KeyR'], fullscreen: ['KeyF'], settings: ['KeyO'], daily: ['KeyD']
    },
    p2: {
      left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'],
      jump: ['Period'], fire: ['Comma'], dash: ['Slash'], melee: ['Semicolon'],
      grenade: ['Quote'], start: ['Digit2']
    }
  },

  /* Bumping this throws away saved bindings once, so a layout change actually
     reaches someone who has played before — otherwise their old scattered keys
     live in localStorage forever and the new default is only for strangers. */
  BINDINGS_VERSION: 2,

  loadBindings: function () {
    var ver = Store.get('bindingsVersion', 0);
    var saved = ver >= this.BINDINGS_VERSION ? Store.get('bindings', null) : null;
    if (ver < this.BINDINGS_VERSION) Store.set('bindingsVersion', this.BINDINGS_VERSION);

    var out = {}, pl, a;
    for (pl in this.DEFAULTS) {
      out[pl] = {};
      for (a in this.DEFAULTS[pl]) {
        var v = saved && saved[pl] && saved[pl][a];
        out[pl][a] = (Array.isArray(v) && v.length) ? v.slice() : this.DEFAULTS[pl][a].slice();
      }
      /* an action added later must never be unbound just because it is not in
         somebody's saved map */
      for (a in this.DEFAULTS[pl]) {
        if (!out[pl][a] || !out[pl][a].length) out[pl][a] = this.DEFAULTS[pl][a].slice();
      }
    }
    this.BINDINGS = out;
    this.buildMaps();
  },

  saveBindings: function () {
    Store.set('bindings', this.BINDINGS);
    this.buildMaps();
  },

  buildMaps: function () {
    this.rev = {};
    this.rev2 = {};
    var pl, a, i;
    for (pl in this.BINDINGS) {
      var target = pl === 'p1' ? this.rev : this.rev2;
      for (a in this.BINDINGS[pl]) {
        var list = this.BINDINGS[pl][a];
        for (i = 0; i < list.length; i++) {
          if (!target[list[i]]) target[list[i]] = [];
          target[list[i]].push(a);
        }
      }
    }
  },

  /* bind one key to one action, clearing it from any other action for that player */
  bind: function (player, action, code) {
    if (!code) return;
    var map = this.BINDINGS[player];
    var a, i;
    for (a in map) {
      var idx = map[a].indexOf(code);
      if (idx >= 0) map[a].splice(idx, 1);
      if (!map[a].length) map[a] = this.DEFAULTS[player][a].slice(0, 1);
    }
    map[action] = [code];
    this.saveBindings();
  },

  resetBindings: function (player) {
    var a;
    for (a in this.DEFAULTS[player]) this.BINDINGS[player][a] = this.DEFAULTS[player][a].slice();
    this.saveBindings();
  },

  MAP: {}, MAP2: {},

  ACTIONS: ['left', 'right', 'up', 'down', 'jump', 'fire', 'dash', 'melee', 'grenade',
            'start', 'start2', 'pause', 'mute', 'restart', 'fullscreen', 'settings', 'daily', 'replay', 'power',
            'autofire'],

  init: function () {
    var self = this;
    this.loadBindings();

    window.addEventListener('keydown', function (e) {
      Snd.resume();
      self.anyKey = true;

      /* rebinding: swallow the next key press */
      if (self.listening) {
        if (e.code !== 'Escape') {
          self.bind(self.listening.player, self.listening.action, e.code);
          self.listening = null;
        }
        e.preventDefault();
        return;
      }

      var hits = self.rev[e.code];
      if (hits) {
        for (var i = 0; i < hits.length; i++) self.keys[hits[i]] = true;
        if (e.code === 'Space' || e.code.indexOf('Arrow') === 0 || e.code === 'Enter') e.preventDefault();

        /* Auto-fire had no key at all — it lived only inside the settings menu,
           so a player who wanted it had to leave the game to find it. */
        if (hits.indexOf('autofire') !== -1 && !self.autofireHeld) {
          self.autofireHeld = true;
          SET.autoFire = SET.autoFire ? 0 : 1;
          if (typeof applyAutoLayout === 'function') applyAutoLayout();
          saveSettings();
          Snd.sfx('coin');
        }
      }
      var hits2 = self.rev2[e.code];
      if (hits2) {
        for (var j = 0; j < hits2.length; j++) self.keys2[hits2[j]] = true;
        if (e.code === 'Period' || e.code === 'Comma') e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keyup', function (e) {
      var hits = self.rev[e.code];
      if (hits) for (var i = 0; i < hits.length; i++) self.keys[hits[i]] = false;
      if (hits && hits.indexOf('autofire') !== -1) self.autofireHeld = false;
      var hits2 = self.rev2[e.code];
      if (hits2) for (var j = 0; j < hits2.length; j++) self.keys2[hits2[j]] = false;
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
      set.power = !!((b[6] && b[6].pressed) || (b[5] && b[5].pressed));
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

  /* logical width follows the aspect ratio */
  W = viewWidthFor(vw, vh);

  /* Portrait gets a taller canvas: the 270px world band sits at the top and the
     earth continues below it, with the thumb pads over that lower band. */
  if (portrait) {
    VIEW_H = clamp(Math.round(W * (vh / vw)), H, 900);
  } else {
    VIEW_H = H;
  }
  Y0 = 0;

  DPR = clamp(window.devicePixelRatio || 1, 1, 2);
  var wantW = Math.round(W * DPR), wantH = Math.round(VIEW_H * DPR);
  if (cv.width !== wantW || cv.height !== wantH) {
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

  var scale = Math.min(vw / W, vh / VIEW_H);
  if (scale <= 0) scale = 1;

  /* snap to a whole number when it costs almost nothing — crisper pixels */
  var snapped = Math.floor(scale);
  if (snapped >= 1 && snapped / scale > 0.88) scale = snapped;

  cv.style.width = Math.round(W * scale) + 'px';
  cv.style.height = Math.round(VIEW_H * scale) + 'px';
}

