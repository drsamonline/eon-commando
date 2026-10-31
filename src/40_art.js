/* ===========================================================================
   EON COMMANDO — 40 art
   A 5x7 bitmap font and every sprite, drawn from primitives at runtime.
   Nothing here loads a file: no PNGs, no atlases, no fonts.
   =========================================================================== */

function px(g, x, y, w, h, c) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ---- 5x7 font ----------------------------------------------------------- */
var FONT_SRC = {
  'A': '.###./#...#/#...#/#####/#...#/#...#/#...#',
  'B': '####./#...#/#...#/####./#...#/#...#/####.',
  'C': '.###./#...#/#..../#..../#..../#...#/.###.',
  'D': '####./#...#/#...#/#...#/#...#/#...#/####.',
  'E': '#####/#..../#..../####./#..../#..../#####',
  'F': '#####/#..../#..../####./#..../#..../#....',
  'G': '.###./#...#/#..../#.###/#...#/#...#/.###.',
  'H': '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  'I': '#####/..#../..#../..#../..#../..#../#####',
  'J': '..###/...#./...#./...#./...#./#..#./.##..',
  'K': '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  'L': '#..../#..../#..../#..../#..../#..../#####',
  'M': '#...#/##.##/#.#.#/#...#/#...#/#...#/#...#',
  'N': '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  'O': '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  'P': '####./#...#/#...#/####./#..../#..../#....',
  'Q': '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  'R': '####./#...#/#...#/####./#.#../#..#./#...#',
  'S': '.####/#..../#..../.###./....#/....#/####.',
  'T': '#####/..#../..#../..#../..#../..#../..#..',
  'U': '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  'V': '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  'W': '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
  'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  'Y': '#...#/#...#/.#.#./..#../..#../..#../..#..',
  'Z': '#####/....#/...#./..#../.#.../#..../#####',
  '0': '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  '1': '..#../.##../..#../..#../..#../..#../.###.',
  '2': '.###./#...#/....#/...#./..#../.#.../#####',
  '3': '####./....#/....#/.###./....#/....#/####.',
  '4': '...#./..##./.#.#./#..#./#####/...#./...#.',
  '5': '#####/#..../####./....#/....#/#...#/.###.',
  '6': '..##./.#.../#..../####./#...#/#...#/.###.',
  '7': '#####/....#/...#./..#../.#.../.#.../.#...',
  '8': '.###./#...#/#...#/.###./#...#/#...#/.###.',
  '9': '.###./#...#/#...#/.####/....#/...#./.##..',
  ' ': '...../...../...../...../...../...../.....',
  '.': '...../...../...../...../...../..##./..##.',
  ',': '...../...../...../...../..##./..##./.#...',
  ':': '...../..##./..##./...../..##./..##./.....',
  ';': '...../..##./..##./...../..##./..##./.#...',
  '-': '...../...../...../#####/...../...../.....',
  '+': '...../..#../..#../#####/..#../..#../.....',
  '!': '..#../..#../..#../..#../..#../...../..#..',
  '?': '.###./#...#/....#/..##./..#../...../..#..',
  "'": '..#../..#../...../...../...../...../.....',
  '"': '.#.#./.#.#./...../...../...../...../.....',
  '/': '....#/....#/...#./..#../.#.../#..../#....',
  '(': '...#./..#../.#.../.#.../.#.../..#../...#.',
  ')': '.#.../..#../...#./...#./...#./..#../.#...',
  '[': '..###/..#../..#../..#../..#../..#../..###',
  ']': '###../..#../..#../..#../..#../..#../###..',
  '<': '...#./..#../.#.../#..../.#.../..#../...#.',
  '>': '.#.../..#../...#./....#/...#./..#../.#...',
  '*': '...../#.#.#/.###./#####/.###./#.#.#/.....',
  '%': '##..#/##.#./..#../.#.../#..##/...##/.....',
  '=': '...../...../#####/...../#####/...../.....',
  '#': '.#.#./#####/.#.#./.#.#./#####/.#.#./.....',
  'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  '♥': '.#.#./#####/#####/#####/.###./..#../.....',
  '▲': '..#../.###./#####/..#../..#../..#../..#..',
  '▼': '..#../..#../..#../..#../#####/.###./..#..',
  '◀': '...#./..##./.####/#####/.####/..##./...#.',
  '▶': '.#.../.##../####./#####/####./.##../.#...',
  '·': '...../...../...../..##./..##./...../.....',
  '→': '...../..#../...#./#####/...#./..#../.....'
};

var FONT = (function () {
  var out = {};
  for (var ch in FONT_SRC) {
    out[ch] = FONT_SRC[ch].split('/');
  }
  return out;
})();

function textWidth(str, scale) {
  scale = scale || 1;
  return (str.length * 6 - 1) * scale;
}

/* draw a string in the 5x7 font. align: 'left' | 'center' | 'right' */
function drawText(g, str, x, y, scale, color, align, shadow) {
  scale = scale || 1;
  str = String(str).toUpperCase();
  var w = textWidth(str, scale);
  if (align === 'center') x -= w / 2;
  else if (align === 'right') x -= w;
  x = Math.round(x); y = Math.round(y);
  if (shadow) drawText(g, str, x + scale, y + scale, scale, shadow, 'left', null);
  g.fillStyle = color || '#fff';
  for (var i = 0; i < str.length; i++) {
    var glyph = FONT[str.charAt(i)] || FONT['?'];
    var gx = x + i * 6 * scale;
    for (var r = 0; r < 7; r++) {
      var row = glyph[r];
      for (var c = 0; c < 5; c++) {
        if (row.charAt(c) === '#') g.fillRect(gx + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

/* ---- deterministic noise ------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---- the commando ------------------------------------------------------- */
var SKIN = {
  outline: '#0a0e16',
  suit: '#2c4a63',
  suitLit: '#3f6b8c',
  armour: '#c8d6e2',
  armourLit: '#eaf2f8',
  visor: '#ffb545',
  visorLit: '#ffe0a3',
  boot: '#16212d',
  gun: '#8b97a6',
  gunDark: '#4b5665',
  skin: '#d8a074'
};

var ENEMY_SKIN = {
  outline: '#120a12',
  body: '#8d2f42',
  bodyLit: '#c05063',
  metal: '#5b6472',
  metalLit: '#8d98a8',
  eye: '#ff4d6d',
  eyeLit: '#ffd0d8'
};

function drawPlayer(g, p) {
  var x = Math.round(p.x), y = Math.round(p.y);
  var f = p.facing >= 0 ? 1 : -1;
  var duck = p.ducking && p.onGround;
  var hurt = p.hurtFlash > 0 && (Math.floor(p.hurtFlash / 3) % 2 === 0);
  var OL = '#070a10';
  function C(c) { return hurt ? '#ffffff' : c; }
  var suit = C('#2f5a78'), suitLit = C('#4d8fb0'), armour = C('#b9cbdb');
  var armourLit = C('#eaf4fc'), boot = C('#16222e'), visor = C('#ffb545'), visorLit = C('#ffe9a8');
  var gun = C('#9aa7b4'), gunDark = C('#4b5665');

  /* mirror-aware local rect: lx measured from the sprite's left edge */
  function R(lx, ly, w, h, c) {
    var dx = f > 0 ? x + lx : x + 12 - lx - w;
    px(g, dx, y + ly, w, h, c);
  }

  if (duck) {
    R(1, 0, 10, 2, OL);
    R(2, 1, 8, 4, suit);
    R(2, 1, 8, 1, suitLit);
    R(5, 2, 4, 2, visor);
    R(6, 2, 2, 1, visorLit);
    R(0, 5, 12, 2, OL);
    R(1, 6, 10, 5, armour);
    R(1, 6, 10, 1, armourLit);
    R(4, 8, 4, 1, suit);
    R(0, 11, 12, 3, OL);
    R(1, 11, 4, 2, suit);
    R(7, 11, 4, 2, suit);
    R(0, 12, 5, 2, boot);
    R(7, 12, 5, 2, boot);
  } else {
    /* helmet + crest */
    R(4, 0, 4, 1, OL);
    R(2, 1, 8, 5, OL);
    R(3, 2, 6, 3, suit);
    R(3, 2, 6, 1, suitLit);
    R(5, 2, 4, 3, visor);
    R(6, 3, 2, 1, visorLit);
    R(3, 5, 6, 1, OL);

    /* collar + backpack */
    R(2, 6, 8, 2, OL);
    R(3, 6, 6, 1, suitLit);
    R(0, 8, 2, 6, OL);
    R(0, 9, 1, 4, C('#24425a'));

    /* torso */
    R(1, 8, 10, 7, OL);
    R(2, 9, 8, 5, armour);
    R(2, 9, 8, 1, armourLit);
    R(4, 11, 4, 1, suit);
    R(2, 13, 8, 1, C('#8fa4b8'));

    /* shoulder pad on the leading side */
    R(1, 8, 3, 3, OL);
    R(2, 9, 2, 1, armourLit);

    /* legs — run cycle */
    var swing = p.onGround ? Math.sin(p.runPhase * Math.PI * 2) : 0.6;
    var legA = Math.round(swing * 3);
    var legB = -legA;
    R(2, 15, 3, 4 + legA, OL);
    R(2, 15, 2, 4 + legA, suit);
    R(7, 15, 3, 4 + legB, OL);
    R(8, 15, 2, 4 + legB, suit);
    R(1, 19 + legA, 4, 2, OL);
    R(2, 19 + legA, 3, 1, boot);
    R(7, 19 + legB, 4, 2, OL);
    R(7, 19 + legB, 3, 1, boot);
  }

  /* arm + weapon, rotated to the aim vector */
  var shoulderX = f > 0 ? x + 8 : x + 4;
  var shoulderY = y + (duck ? 8 : 11);
  g.save();
  g.translate(shoulderX, shoulderY);
  g.rotate(p.aimAngle);
  px(g, -1, -2, 9, 4, OL);
  px(g, 0, -1, 8, 2, gun);
  px(g, 0, -1, 8, 1, C('#d6e2ec'));
  px(g, 4, -2, 5, 3, OL);
  px(g, 5, -1, 4, 1, gunDark);
  px(g, 0, -2, 3, 4, suit);
  if (p.muzzle > 0) {
    px(g, 9, -3, 3, 6, '#ffe9a8');
    px(g, 10, -2, 4, 4, '#ffb545');
    px(g, 12, -1, 2, 2, '#fff8e0');
  }
  g.restore();
}

/* ---- enemies ------------------------------------------------------------ */
function drawGrunt(g, e) {
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  var OL = '#120810';
  function C(c) { return flash ? '#ffffff' : c; }
  var body = C('#8d2f42'), lit = C('#c05063'), dark = C('#5c1c2c');
  var metal = C('#5b6472'), metalLit = C('#98a3b3'), eye = C('#ff4d6d'), eyeLit = C('#ffd0d8');
  function R(lx, ly, w, h, c) {
    var dx = f > 0 ? x + lx : x + 12 - lx - w;
    px(g, dx, y + ly, w, h, c);
  }
  /* helmet */
  R(2, 0, 8, 2, OL);
  R(3, 1, 6, 2, metal);
  R(3, 1, 6, 1, metalLit);
  R(3, 3, 6, 1, OL);
  R(4, 2, 4, 1, eye);
  /* body */
  R(1, 4, 10, 9, OL);
  R(2, 5, 8, 7, body);
  R(2, 5, 8, 1, lit);
  R(3, 7, 6, 1, dark);
  R(2, 9, 8, 1, dark);
  /* arms */
  R(0, 6, 2, 5, OL);
  R(10, 6, 2, 5, OL);
  /* rifle */
  R(9, 8, 6, 3, OL);
  R(9, 9, 5, 1, metalLit);
  /* legs */
  var swing = Math.sin(e.walkPhase * Math.PI * 2);
  var a = Math.round(swing * 1.6), b = -a;
  R(2, 13, 3, 4 + a, OL);
  R(7, 13, 3, 4 + b, OL);
  R(1, 16 + a, 4, 2, OL);
  R(7, 16 + b, 4, 2, OL);
}

function drawRunner(g, e) {
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  var c = flash ? '#ffffff' : '#b8402f';
  var cl = flash ? '#ffffff' : '#e8705a';
  function R(lx, ly, w, h, col) {
    var dx = f > 0 ? x + lx : x + 14 - lx - w;
    px(g, dx, y + ly, w, h, col);
  }
  R(2, 2, 10, 7, '#120a12');
  R(3, 3, 8, 5, c);
  R(4, 3, 5, 2, cl);
  R(10, 4, 3, 2, '#ffd257');
  R(1, 8, 12, 5, '#120a12');
  R(2, 9, 10, 3, c);
  var s = Math.sin(e.walkPhase * Math.PI * 4);
  R(2, 12, 3, 3 + Math.round(s * 2), '#120a12');
  R(9, 12, 3, 3 - Math.round(s * 2), '#120a12');
  R(0, 9, 2, 2, cl);
}

function drawDrone(g, e) {
  var x = Math.round(e.x), y = Math.round(e.y);
  var bob = Math.sin(e.age * 0.12) * 1.5;
  y = Math.round(y + bob);
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  var hull = flash ? '#ffffff' : ENEMY_SKIN.metal;
  px(g, x, y + 3, 16, 6, ENEMY_SKIN.outline);
  px(g, x + 1, y + 4, 14, 4, hull);
  px(g, x + 2, y + 4, 12, 1, ENEMY_SKIN.metalLit);
  px(g, x + 5, y + 2, 6, 2, ENEMY_SKIN.outline);
  px(g, x + 6, y + 2, 4, 1, hull);
  px(g, x + 6, y + 5, 4, 2, flash ? '#ffffff' : ENEMY_SKIN.eye);
  px(g, x + 7, y + 5, 2, 1, ENEMY_SKIN.eyeLit);
  /* rotors */
  var spin = Math.floor(e.age / 3) % 2 === 0 ? 5 : 3;
  px(g, x - 2, y, spin, 1, '#7f8fa6');
  px(g, x + 16 - spin, y, spin, 1, '#7f8fa6');
  px(g, x + 7, y - 1, 1, 1, '#7f8fa6');
}

function drawTurret(g, e) {
  var x = Math.round(e.x), y = Math.round(e.y);
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  var base = flash ? '#ffffff' : ENEMY_SKIN.metal;
  px(g, x, y + 8, 16, 6, ENEMY_SKIN.outline);
  px(g, x + 1, y + 9, 14, 4, base);
  px(g, x + 2, y + 9, 12, 1, ENEMY_SKIN.metalLit);
  px(g, x + 3, y + 2, 10, 7, ENEMY_SKIN.outline);
  px(g, x + 4, y + 3, 8, 5, base);
  px(g, x + 6, y + 4, 4, 2, flash ? '#ffffff' : ENEMY_SKIN.eye);
  /* barrel aims at the player */
  g.save();
  g.translate(x + 8, y + 6);
  g.rotate(e.aimAngle || 0);
  px(g, 0, -1, 10, 3, ENEMY_SKIN.outline);
  px(g, 0, 0, 9, 1, ENEMY_SKIN.metalLit);
  g.restore();
}

function drawJumper(g, e) {
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  var c = flash ? '#ffffff' : '#6b3fa0';
  var cl = flash ? '#ffffff' : '#9a6bd0';
  var squash = e.onGround ? 1 : 0;
  function R(lx, ly, w, h, col) {
    var dx = f > 0 ? x + lx : x + 14 - lx - w;
    px(g, dx, y + ly, w, h, col);
  }
  R(2, 1 + squash, 10, 6 - squash, '#120a12');
  R(3, 2 + squash, 8, 4 - squash, c);
  R(4, 2 + squash, 6, 2, cl);
  R(9, 3 + squash, 3, 2, '#ffd257');
  R(1, 7, 12, 3, '#120a12');
  R(2, 7, 10, 2, c);
  R(0, 9, 3, 2, cl);
  R(11, 9, 3, 2, cl);
}

/* ---- pickups ------------------------------------------------------------ */
function drawCapsule(g, c) {
  var x = Math.round(c.x), y = Math.round(c.y);
  var bob = Math.sin(c.age * 0.1) * 2;
  y += bob;
  var glow = c.kind === 'health' ? '#54ffa8' : (c.kind === 'coin' ? '#ffd257' : '#54e0ff');
  g.globalAlpha = 0.25;
  px(g, x - 2, y - 2, 18, 18, glow);
  g.globalAlpha = 1;
  px(g, x, y, 14, 14, '#0a0e16');
  px(g, x + 1, y + 1, 12, 12, glow);
  px(g, x + 2, y + 2, 10, 3, '#ffffff');
  if (c.kind === 'health') {
    px(g, x + 6, y + 4, 2, 6, '#08301c');
    px(g, x + 4, y + 6, 6, 2, '#08301c');
  } else if (c.kind === 'coin') {
    drawText(g, 'E', x + 5, y + 4, 1, '#4a3200');
  } else {
    drawText(g, c.label || 'W', x + 5, y + 4, 1, '#062231');
  }
}

/* ---- bosses ------------------------------------------------------------- */
function drawWarden(g, b) {
  var x = Math.round(b.x), y = Math.round(b.y);
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  var OL = '#080b12';
  function C(c) { return flash ? '#ffffff' : c; }
  var plate = C('#4a5568'), plateLit = C('#7c8a9e'), plateDark = C('#2c3444');
  var accent = C('#c0392b'), w = b.w, h = b.h;
  var step = Math.round(Math.sin(b.age * 0.08) * 3);

  /* outline pass, then fill pass — every part reads at a distance */
  function P(lx, ly, lw, lh, fill, lit) {
    px(g, x + lx - 1, y + ly - 1, lw + 2, lh + 2, OL);
    px(g, x + lx, y + ly, lw, lh, fill);
    if (lit) px(g, x + lx, y + ly, lw, 2, lit);
  }

  /* legs */
  P(9, h - 28 + step, 13, 28 - step, plate, plateLit);
  P(9, h - 6 + step, 15, 6, plateDark, null);
  P(w - 22, h - 28 - step, 13, 28 + step, plate, plateLit);
  P(w - 24, h - 6 - step, 15, 6, plateDark, null);

  /* hips + torso */
  P(6, 26, w - 12, h - 46, plate, plateLit);
  P(10, 34, w - 20, 8, plateDark, null);
  P(10, 50, w - 20, 3, accent, null);
  P(14, 58, w - 28, 10, plateDark, null);

  /* shoulder cannons */
  P(-4, 28, 13, 13, plateLit, C('#a9b6c6'));
  px(g, x - 8, y + 32, 5, 5, OL);
  P(w - 9, 28, 13, 13, plateLit, C('#a9b6c6'));
  px(g, x + w + 3, y + 32, 5, 5, OL);

  /* head */
  P(w / 2 - 12, 6, 24, 19, plateLit, C('#a9b6c6'));
  px(g, x + w / 2 - 8, y + 12, 16, 7, OL);
  px(g, x + w / 2 - 7, y + 13, 14, 5, accent);
  px(g, x + w / 2 - 4, y + 14, 8, 3, C('#ffe9a8'));
  px(g, x + w / 2 - 14, y + 2, 3, 6, OL);
  px(g, x + w / 2 + 11, y + 2, 3, 6, OL);

  /* core */
  var coreY = y + h - 42;
  px(g, x + w / 2 - 10, coreY - 2, 20, 20, OL);
  px(g, x + w / 2 - 8, coreY, 16, 16, C('#1a1f2a'));
  g.globalAlpha = 0.75;
  px(g, x + w / 2 - 6, coreY + 2, 12, 12, b.phase === 2 ? '#ff5c3c' : '#ffb545');
  g.globalAlpha = 1;
  px(g, x + w / 2 - 4, coreY + 4, 8, 8, '#fff3c4');
}

function drawWraith(g, b) {
  var x = Math.round(b.x), y = Math.round(b.y);
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  var shell = flash ? '#ffffff' : '#2b6f8f';
  var shellLit = flash ? '#ffffff' : '#7fe3ff';
  var w = b.w, h = b.h;
  var flap = Math.sin(b.age * 0.14) * 6;
  /* wings */
  px(g, x - 14, y + 10 + flap, 18, 6, shell);
  px(g, x - 12, y + 8 + flap, 12, 4, shellLit);
  px(g, x + w - 4, y + 10 - flap, 18, 6, shell);
  px(g, x + w - 2, y + 8 - flap, 12, 4, shellLit);
  /* body */
  px(g, x + 4, y + 6, w - 8, h - 12, '#08131c');
  px(g, x + 6, y + 8, w - 12, h - 16, shell);
  px(g, x + 8, y + 10, w - 16, 5, shellLit);
  /* crystal core */
  var cx = x + w / 2, cy = y + h / 2;
  px(g, cx - 9, cy - 9, 18, 18, '#08131c');
  px(g, cx - 7, cy - 7, 14, 14, b.phase === 2 ? '#ff5c3c' : '#bff4ff');
  px(g, cx - 3, cy - 3, 6, 6, '#ffffff');
  /* eye */
  px(g, cx - 12, y + 14, 6, 4, '#08131c');
  px(g, cx + 6, y + 14, 6, 4, '#08131c');
  px(g, cx - 11, y + 15, 4, 2, '#ff4d6d');
  px(g, cx + 7, y + 15, 4, 2, '#ff4d6d');
}

function drawHeart(g, b) {
  var x = Math.round(b.x), y = Math.round(b.y);
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  var cx = x + b.w / 2, cy = y + b.h / 2;
  var spin = b.age * 0.04;
  /* orbiting rings */
  for (var i = 0; i < 3; i++) {
    var a = spin + i * Math.PI * 2 / 3;
    var rx = Math.cos(a) * (b.w / 2 - 4);
    var ry = Math.sin(a) * (b.h / 4);
    px(g, cx + rx - 5, cy + ry - 5, 10, 10, '#0a0e16');
    px(g, cx + rx - 4, cy + ry - 4, 8, 8, flash ? '#ffffff' : '#c9a227');
    px(g, cx + rx - 2, cy + ry - 2, 4, 4, '#ffe9a8');
  }
  /* shell */
  px(g, cx - 26, cy - 26, 52, 52, '#0a0e16');
  px(g, cx - 24, cy - 24, 48, 48, flash ? '#ffffff' : '#3a1030');
  px(g, cx - 20, cy - 20, 40, 8, flash ? '#ffffff' : '#6b1d4f');
  /* the heart itself */
  var pulse = 1 + Math.sin(b.age * 0.16) * 0.12;
  var r = 15 * pulse;
  g.globalAlpha = 0.5;
  px(g, cx - r - 4, cy - r - 4, (r + 4) * 2, (r + 4) * 2, b.phase === 2 ? '#ff3b2f' : '#ff2d95');
  g.globalAlpha = 1;
  px(g, cx - r, cy - r, r * 2, r * 2, b.phase === 2 ? '#ff5c3c' : '#ff2d95');
  px(g, cx - r * 0.6, cy - r * 0.6, r * 1.2, r * 1.2, '#ffd0e4');
  px(g, cx - r * 0.3, cy - r * 0.3, r * 0.6, r * 0.6, '#ffffff');
}
