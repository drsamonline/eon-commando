/* ===========================================================================
   EON COMMANDO — 10 core
   Constants, maths, storage, small helpers. No dependencies.
   =========================================================================== */
'use strict';

var VERSION = '4.6.0';
var DPR = 1;                       // device pixel ratio, capped at 2
var W = 480, H = 270;              // world view: W widens with the window
var VIEW_H = 270;                  // logical canvas height (portrait gets taller)
var Y0 = 0;                        // where the world band starts inside the canvas
var W_MIN = 480, W_MAX = 640;      // 16:9 floor, 21:9 ceiling (desktop range)
var ARENA_W = 480;                 // boss arenas keep a fixed 16:9 footprint
var GROUND_Y = 232;                // world y of the ground surface

/* Pick the logical width from the real aspect ratio.
   Landscape keeps a 16:9 floor and widens to 21:9. Portrait switches to a
   square view — a 16:9 band on a phone held upright is only a quarter of the
   screen, and the sprites end up tiny. */
function viewWidthFor(px_w, px_h) {
  var aspect = px_w / Math.max(1, px_h);
  if (aspect < 1) return clamp(Math.round(H * aspect), 220, 360);
  return clamp(Math.round(H * aspect), W_MIN, W_MAX);
}
var FPS = 60, STEP = 1 / FPS;

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function sign(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }
function lerp(a, b, t) { return a + (b - a) * t; }
/* cosmetic randomness routes through the seeded fx stream, so a run is
   reproducible end to end — needed for replays, seeds and screenshot diffs */
function rnd(a, b) { if (b === undefined) { b = a; a = 0; } return a + RNG.f() * (b - a); }
function rndi(a, b) { return Math.floor(rnd(a, b + 1)); }
function pick(arr) { return arr[Math.floor(RNG.f() * arr.length)]; }
function chance(p) { return RNG.f() < p; }
function approach(v, target, step) {
  if (v < target) return Math.min(v + step, target);
  if (v > target) return Math.max(v - step, target);
  return target;
}
function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function overlap(a, b, pad) {
  pad = pad || 0;
  return a.x + pad < b.x + b.w && a.x + a.w - pad > b.x &&
         a.y + pad < b.y + b.h && a.y + a.h - pad > b.y;
}

/* ---- persistence: never throw in private mode / file:// ------------------ */
var Store = {
  key: 'eon-commando-v1',
  read: function () {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}') || {}; }
    catch (e) { return {}; }
  },
  write: function (obj) {
    try { localStorage.setItem(this.key, JSON.stringify(obj)); } catch (e) {}
  },
  get: function (k, dflt) { var o = this.read(); return (k in o) ? o[k] : dflt; },
  set: function (k, v) { var o = this.read(); o[k] = v; this.write(o); }
};

/* ---- colour helpers ----------------------------------------------------- */
function rgba(hex, a) {
  var n = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
function shade(hex, f) {
  var n = parseInt(hex.slice(1), 16);
  var r = clamp(Math.round(((n >> 16) & 255) * f), 0, 255);
  var g = clamp(Math.round(((n >> 8) & 255) * f), 0, 255);
  var b = clamp(Math.round((n & 255) * f), 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---- debug / test hooks ------------------------------------------------- */
var PARAMS = (function () {
  var out = {}, q = (location.search || '').replace(/^\?/, '').split('&');
  for (var i = 0; i < q.length; i++) {
    if (!q[i]) continue;
    var kv = q[i].split('=');
    out[decodeURIComponent(kv[0])] = kv.length > 1 ? decodeURIComponent(kv[1]) : '1';
  }
  return out;
})();

/* ---- seeded randomness ---------------------------------------------------
   Two streams: `sim` drives gameplay and must be reproducible (replays,
   daily seeds, future LAN), `fx` drives cosmetics and may vary freely.       */
var RNG = {
  sim: null, fx: null,
  seed: function (s) {
    s = (s >>> 0) || 1;
    this.sim = mulberry32(s);
    this.fx = mulberry32((Math.imul(s, 2654435761) >>> 0) || 7);
  },
  s: function () { return this.sim(); },
  sr: function (a, b) { return a + this.sim() * (b - a); },
  si: function (a, b) { return Math.floor(a + this.sim() * (b - a + 1)); },
  sPick: function (arr) { return arr[Math.floor(this.sim() * arr.length)]; },
  sChance: function (p) { return this.sim() < p; },
  f: function () { return this.fx(); },
  fChance: function (p) { return this.fx() < p; },
  fr: function (a, b) { return a + this.fx() * (b - a); },
  fi: function (a, b) { return Math.floor(a + this.fx() * (b - a + 1)); }
};
RNG.seed(Date.now() & 0x7fffffff);

/* ---- settings ----------------------------------------------------------- */
var SETTINGS_DEFAULTS = {
  difficulty: 1,     /* 0 recruit, 1 commando, 2 eon */
  palette: 0,        /* 0 default, 1 deuteranopia, 2 high contrast */
  reduceMotion: 0,
  flash: 1,          /* 0..1 flash intensity */
  hudScale: 1,       /* 0.85..1.3 */
  music: 1,
  sfx: 1,
  muted: 0,
  autoFire: 0,
  pads: null
};

var SET = (function () {
  var d = {}, k, saved = Store.get('settings', null);
  for (k in SETTINGS_DEFAULTS) d[k] = SETTINGS_DEFAULTS[k];
  if (saved && typeof saved === 'object') {
    for (k in SETTINGS_DEFAULTS) if (saved[k] !== undefined) d[k] = saved[k];
  }
  return d;
})();

function saveSettings() { Store.set('settings', SET); }

/* ---- difficulty --------------------------------------------------------- */
var DIFFICULTY = [
  { name: 'RECRUIT',  hp: 6, lives: 5, dmgTaken: 0.5, enemyHp: 0.8, fireRate: 1.25, drop: 1.3 },
  { name: 'COMMANDO', hp: 4, lives: 3, dmgTaken: 1.0, enemyHp: 1.0, fireRate: 1.0,  drop: 1.0 },
  { name: 'EON',      hp: 2, lives: 1, dmgTaken: 1.5, enemyHp: 1.2, fireRate: 0.8,  drop: 0.7 }
];
function diff() { return DIFFICULTY[clamp(SET.difficulty, 0, 2)]; }

/* ---- colour schemes (accessibility) ------------------------------------- */
var SCHEMES = [
  { name: 'DEFAULT',      hostile: '#ff4d6d', hostileGlow: '#ffd0d8', elite: '#ffe08a', heal: '#54ffa8', gold: '#ffd257' },
  { name: 'DEUTERANOPIA', hostile: '#ff9d00', hostileGlow: '#ffe0a0', elite: '#ffffff', heal: '#5ad4ff', gold: '#ffffff' },
  { name: 'HIGH CONTRAST',hostile: '#ff0000', hostileGlow: '#ff9090', elite: '#ffff00', heal: '#00ff00', gold: '#ffffff' }
];
function scheme() { return SCHEMES[clamp(SET.palette, 0, 2)]; }

/* ---- local leaderboard -------------------------------------------------- */
var Scores = {
  key: 'scores',
  all: function () {
    var a = Store.get(this.key, []);
    return Array.isArray(a) ? a : [];
  },
  add: function (entry) {
    var a = this.all();
    a.push(entry);
    a.sort(function (x, y) { return y.score - x.score; });
    a = a.slice(0, 5);
    Store.set(this.key, a);
    return a;
  },
  best: function () {
    var a = this.all();
    return a.length ? a[0].score : 0;
  }
};

/* ---- lifetime stats ----------------------------------------------------- */
var Stats = {
  get: function () {
    var s = Store.get('stats', null);
    return s && typeof s === 'object' ? s : { runs: 0, kills: 0, deaths: 0, best: 0, time: 0 };
  },
  bump: function (field, by) {
    var s = this.get();
    s[field] = (s[field] || 0) + (by === undefined ? 1 : by);
    Store.set('stats', s);
    return s;
  }
};

/* ---- daily seed ----------------------------------------------------------
   Same date, same run — derived from the local date, no server involved.     */
var Daily = {
  seed: function () {
    var d = new Date();
    var str = 'EON-DAILY-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) || 1;
  },
  label: function () {
    var d = new Date();
    return d.getDate() + '/' + (d.getMonth() + 1);
  }
};

/* ---- input recording -----------------------------------------------------
   Only the inputs and the seed are stored. The simulation is deterministic,
   so replaying them reproduces the run exactly.                              */
var MASK_ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'fire', 'dash', 'melee', 'grenade'];

function maskOf(cur) {
  var m = 0;
  for (var i = 0; i < MASK_ACTIONS.length; i++) if (cur && cur[MASK_ACTIONS[i]]) m |= (1 << i);
  return m;
}
function actionsFromMask(m) {
  var o = {};
  for (var i = 0; i < MASK_ACTIONS.length; i++) o[MASK_ACTIONS[i]] = !!(m & (1 << i));
  return o;
}

var Rec = {
  recording: false,
  frames: [],          /* [count, mask] pairs — RLE, because input is mostly static */
  lastMask: -1,
  seed: 0,
  coop: false,
  limit: 60 * 60 * 6,  /* six minutes of frames */

  start: function (seed, coop) {
    this.recording = true;
    this.frames = [];
    this.lastMask = -1;
    this.seed = seed >>> 0;
    this.coop = !!coop;
    this.total = 0;
  },

  capture: function () {
    if (!this.recording) return;
    if (this.total >= this.limit) { this.recording = false; return; }
    this.total++;
    var m = maskOf(Input.cur) | (maskOf(Input.cur2) << 9);
    if (m === this.lastMask && this.frames.length) {
      this.frames[this.frames.length - 1][0]++;
    } else {
      this.frames.push([1, m]);
      this.lastMask = m;
    }
  },

  stop: function () {
    this.recording = false;
    return { seed: this.seed, coop: this.coop, frames: this.frames.slice(), total: this.total };
  },

  pack: function (rec) {
    return {
      seed: rec.seed,
      coop: rec.coop ? 1 : 0,
      n: rec.total,
      d: rec.frames.map(function (f) { return f[0].toString(36) + '.' + f[1].toString(36); }).join(',')
    };
  },

  unpack: function (packed) {
    if (!packed || !packed.d) return null;
    var parts = packed.d.split(','), frames = [], i;
    for (i = 0; i < parts.length; i++) {
      var ab = parts[i].split('.');
      frames.push([parseInt(ab[0], 36) || 1, parseInt(ab[1], 36) || 0]);
    }
    return { seed: packed.seed >>> 0, coop: !!packed.coop, frames: frames, total: packed.n || 0 };
  },

  /* expand RLE into one mask per frame */
  expand: function (rec) {
    var out = [], i, j;
    for (i = 0; i < rec.frames.length; i++) {
      var c = rec.frames[i][0], m = rec.frames[i][1];
      for (j = 0; j < c; j++) out.push(m);
    }
    return out;
  },

  save: function (rec) { Store.set('lastReplay', this.pack(rec)); },
  load: function () { return this.unpack(Store.get('lastReplay', null)); },
  has: function () { return !!Store.get('lastReplay', null); }
};
