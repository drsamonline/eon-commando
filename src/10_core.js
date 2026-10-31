/* ===========================================================================
   EON COMMANDO — 10 core
   Constants, maths, storage, small helpers. No dependencies.
   =========================================================================== */
'use strict';

var W = 480, H = 270;              // internal resolution, upscaled by CSS
var GROUND_Y = 232;                // world y of the ground surface
var FPS = 60, STEP = 1 / FPS;

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function sign(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { if (b === undefined) { b = a; a = 0; } return a + Math.random() * (b - a); }
function rndi(a, b) { return Math.floor(rnd(a, b + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
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
