/* ===========================================================================
   EON COMMANDO — 40 art
   Pixel-pure, but drawn with curves: rounded caps, arcs, ellipses and bezier
   limbs instead of stacked rectangles. Everything is still on the 480x270
   grid, still asset-free, still drawn at runtime.
   =========================================================================== */

function px(g, x, y, w, h, c) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ---- curved primitives (pixel-scale friendly) --------------------------- */
function rr(g, x, y, w, h, r, c) {
  r = Math.min(r, w / 2, h / 2);
  g.fillStyle = c;
  g.beginPath();
  if (g.roundRect) {
    g.roundRect(x, y, w, h, r);
  } else {
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
  }
  g.closePath();
  g.fill();
}

function el(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  g.beginPath();
  g.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, 6.2832);
  g.fill();
}

function circ(g, cx, cy, r, c) {
  g.fillStyle = c;
  g.beginPath();
  g.arc(cx, cy, Math.max(0.5, r), 0, 6.2832);
  g.fill();
}

/* a limb: a stroked line with round caps reads as a capsule */
function limb(g, x1, y1, x2, y2, thick, c) {
  g.strokeStyle = c;
  g.lineWidth = thick;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function curve(g, pts, thick, c) {
  g.strokeStyle = c;
  g.lineWidth = thick;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length - 1; i += 2) {
    g.quadraticCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  }
  g.stroke();
}

/* soft radial glow, used for cores, muzzles and pickups */
function glow(g, cx, cy, r, c, alpha) {
  var grd = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, r));
  grd.addColorStop(0, rgba(c, alpha === undefined ? 0.55 : alpha));
  grd.addColorStop(1, rgba(c, 0));
  g.fillStyle = grd;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
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
  '♥': '.#.#./#####/#####/#####/.###./..#../.....',
  '▲': '..#../.###./#####/..#../..#../..#../..#..',
  '▼': '..#../..#../..#../..#../#####/.###./..#..',
  '◀': '...#./..##./.####/#####/.####/..##./...#.',
  '▶': '.#.../.##../####./#####/####./.##../.#...',
  '·': '...../...../...../..##./..##./...../.....',
  '→': '...../..#../...#./#####/...#./..#../.....',
  '★': '..#../..#../#####/.###./.#.#./#...#/.....'
};

var FONT = (function () {
  var out = {};
  for (var ch in FONT_SRC) out[ch] = FONT_SRC[ch].split('/');
  return out;
})();

function textWidth(str, scale) {
  scale = scale || 1;
  return (str.length * 6 - 1) * scale;
}

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

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---- palettes ------------------------------------------------------------
   One rig, three looks: each era reskins the same enemy silhouette.        */
var SUIT = {
  outline: '#070a10',
  suit: '#2f5a78', suitLit: '#4d8fb0', suitDark: '#1c3a4e',
  armour: '#b9cbdb', armourLit: '#eaf4fc', armourDark: '#7f95a8',
  visor: '#ffb545', visorLit: '#ffe9a8',
  boot: '#16222e', gun: '#9aa7b4', gunDark: '#4b5665'
};

var ENEMY_PALETTES = [
  { /* era I — rust and ember */
    name: 'ember',
    body: '#8d2f42', bodyLit: '#c05063', bodyDark: '#5c1c2c',
    metal: '#5b6472', metalLit: '#98a3b3',
    eye: '#ff4d6d', eyeLit: '#ffd0d8'
  },
  { /* era II — glacier */
    name: 'frost',
    body: '#2b6f8f', bodyLit: '#57b3d6', bodyDark: '#164256',
    metal: '#6d8296', metalLit: '#b3c8d8',
    eye: '#8ef0ff', eyeLit: '#e6fdff'
  },
  { /* era III — core */
    name: 'core',
    body: '#7a2b7f', bodyLit: '#b85ac0', bodyDark: '#4a1550',
    metal: '#5a4a72', metalLit: '#9d8cc0',
    eye: '#ff2d95', eyeLit: '#ffd0e4'
  }
];

var ELITE_TINT = {
  body: '#d9a521', bodyLit: '#ffe08a', bodyDark: '#8a6410',
  metal: '#8a7b4a', metalLit: '#e0d3a3',
  eye: '#fff3c4', eyeLit: '#ffffff'
};

function palFor(e) {
  if (e.elite) return ELITE_TINT;
  return ENEMY_PALETTES[clamp(e.pal || 0, 0, ENEMY_PALETTES.length - 1)];
}

/* ---- the commando ------------------------------------------------------- */
function drawPlayer(g, p) {
  var x = Math.round(p.x), y = Math.round(p.y);
  var f = p.facing >= 0 ? 1 : -1;
  var duck = p.ducking && p.onGround;
  var hurt = p.hurtFlash > 0 && (Math.floor(p.hurtFlash / 3) % 2 === 0);
  var OL = SUIT.outline;
  function C(c) { return hurt ? '#ffffff' : c; }

  var suit = C(SUIT.suit), suitLit = C(SUIT.suitLit), suitDark = C(SUIT.suitDark);
  var armour = C(SUIT.armour), armourLit = C(SUIT.armourLit), armourDark = C(SUIT.armourDark);
  var boot = C(SUIT.boot), visor = C(SUIT.visor), visorLit = C(SUIT.visorLit);

  /* draw in local space, mirrored by the transform — curves stay symmetrical */
  g.save();
  g.translate(f > 0 ? x : x + 12, y);
  g.scale(f, 1);

  if (duck) {
    /* crouched: low, coiled, still reads as a soldier */
    limb(g, 3, 12, 2, 13, 4, suitDark);
    limb(g, 9, 12, 10, 13, 4, suitDark);
    rr(g, 1, 6, 10, 6, 2.5, armour);
    rr(g, 1, 6, 10, 2, 1.5, armourLit);
    rr(g, 0.5, 9, 3, 3, 1.2, suit);
    circ(g, 6, 3.4, 3.4, suit);
    rr(g, 4, 1.6, 6, 3.4, 1.6, suit);
    rr(g, 4.4, 1.8, 5.2, 1.2, 0.6, suitLit);
    rr(g, 5.5, 2.6, 4, 1.6, 0.8, visor);
    px(g, 6.5, 2.6, 2, 0.9, visorLit);
    rr(g, 0.6, 12, 4.4, 2, 0.8, boot);
    rr(g, 7, 12, 4.4, 2, 0.8, boot);
  } else {
    /* legs — capsule thighs and shins with a real run cycle */
    var swing = p.onGround ? Math.sin(p.runPhase * Math.PI * 2) : 0.55;
    var lift = p.onGround ? Math.max(0, Math.cos(p.runPhase * Math.PI * 2)) : 0;
    var backX = 5 - swing * 2.2, frontX = 7 + swing * 2.2;
    var backLift = Math.max(0, -swing) * 2.4, frontLift = Math.max(0, swing) * 2.4;

    limb(g, 5, 15, backX, 20 - backLift, 3.2, suitDark);
    limb(g, 7, 15, frontX, 20 - frontLift, 3.2, suit);
    rr(g, backX - 2, 19 - backLift, 4.2, 2.2, 0.9, boot);
    rr(g, frontX - 1.4, 19 - frontLift, 4.6, 2.2, 0.9, boot);

    /* backpack */
    rr(g, 0.2, 9, 2.2, 5.4, 1, suitDark);

    /* torso */
    rr(g, 1.4, 8, 9.2, 7.4, 2.6, armour);
    rr(g, 1.4, 8, 9.2, 2.6, 1.6, armourLit);
    rr(g, 3.4, 11.4, 5.4, 1.4, 0.7, suit);
    rr(g, 1.6, 13.4, 8.8, 1.2, 0.6, armourDark);

    /* shoulder pad */
    rr(g, 1, 8, 3.4, 3.2, 1.5, armour);
    px(g, 1.8, 8.6, 1.8, 0.9, armourLit);

    /* neck + helmet */
    rr(g, 4.2, 6.2, 3.6, 2, 0.9, suitDark);
    circ(g, 6, 3.6, 3.5, suit);
    rr(g, 3.2, 1.2, 6.2, 4.4, 2, suit);
    rr(g, 3.8, 1.4, 5, 1.2, 0.6, suitLit);
    /* crest */
    rr(g, 5.4, 0.2, 2.4, 1.4, 0.7, armour);

    /* visor, angled with the aim */
    var vis = clamp(p.aimAngle, -1.1, 1.1);
    g.save();
    g.translate(6.4, 3.4);
    g.rotate(vis * 0.22);
    rr(g, -1.4, -1.1, 5, 2.2, 1.1, visor);
    px(g, 0.2, -0.9, 2.2, 0.8, visorLit);
    g.restore();
  }
  g.restore();

  /* arm + weapon in world space, because the aim angle already has facing in it */
  var shoulderX = f > 0 ? x + 8 : x + 4;
  var shoulderY = y + (duck ? 8 : 10.5);
  var handX = shoulderX + Math.cos(p.aimAngle) * 5.5;
  var handY = shoulderY + Math.sin(p.aimAngle) * 5.5;
  limb(g, shoulderX, shoulderY, handX, handY, 2.6, hurt ? '#ffffff' : SUIT.suit);

  g.save();
  g.translate(handX, handY);
  g.rotate(p.aimAngle);
  rr(g, -1, -1.4, 8.4, 2.8, 1.2, SUIT.outline);
  rr(g, -0.4, -0.9, 7.4, 1.8, 0.8, hurt ? '#ffffff' : SUIT.gun);
  px(g, -0.4, -0.9, 7, 0.7, hurt ? '#ffffff' : '#d6e2ec');
  rr(g, 3.4, -1.8, 4.4, 3.4, 1.2, SUIT.outline);
  rr(g, 3.8, -1.3, 3.4, 2.4, 0.9, SUIT.gunDark);
  if (p.muzzle > 0) {
    glow(g, 9, 0, 7, '#ffb545', 0.55);
    rr(g, 8, -1.6, 4, 3.2, 1.4, '#ffe9a8');
    rr(g, 9.4, -0.9, 3, 1.8, 0.9, '#fff8e0');
  }
  g.restore();
}

/* ---- enemies ------------------------------------------------------------ */
function drawGrunt(g, e) {
  var P = palFor(e), OL = '#120810';
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var s = e.scale || 1;

  g.save();
  g.translate(f > 0 ? x + 6 : x + 6, y + e.h);
  g.scale(f * s, s);
  g.translate(-6, -18);

  /* legs */
  var swing = Math.sin(e.walkPhase * Math.PI * 2) * 1.8;
  limb(g, 5, 13, 4.4 - swing * 0.4, 17 + swing * 0.3, 2.6, C(P.bodyDark));
  limb(g, 7, 13, 7.6 + swing * 0.4, 17 - swing * 0.3, 2.6, C(P.bodyDark));

  /* body */
  rr(g, 1.6, 5, 8.8, 8.6, 2.8, C(P.body));
  rr(g, 1.6, 5, 8.8, 2.4, 1.4, C(P.bodyLit));
  rr(g, 3, 8.6, 6, 1.2, 0.6, C(P.bodyDark));

  /* rifle */
  limb(g, 8, 10, 14, 9.4, 1.8, C(P.metal));
  px(g, 12.4, 8.6, 1.6, 2, C(P.metalLit));

  /* arms */
  limb(g, 8.2, 8, 10.4, 9.6, 2, C(P.body));

  /* helmet + eye */
  circ(g, 6, 3.2, 3.2, C(P.metal));
  rr(g, 2.9, 0.6, 6.2, 3.4, 1.7, C(P.metal));
  rr(g, 3.3, 0.8, 5.4, 1, 0.5, C(P.metalLit));
  rr(g, 4.4, 2.4, 3.6, 1.6, 0.8, C(P.eye));
  px(g, 5.2, 2.4, 1.6, 0.8, C(P.eyeLit));
  if (e.elite) {
    rr(g, 2.6, -0.4, 1.4, 1.6, 0.6, '#ffe08a');
    rr(g, 8, -0.4, 1.4, 1.6, 0.6, '#ffe08a');
  }
  g.restore();
}

function drawRunner(g, e) {
  var P = palFor(e), OL = '#120810';
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var s = e.scale || 1;
  var s2 = Math.sin(e.walkPhase * Math.PI * 4) * 2;

  g.save();
  g.translate(x + 7, y + e.h);
  g.scale(f * s, s);
  g.translate(-7, -15);

  /* hind legs */
  limb(g, 5, 11, 3.6, 14 + s2 * 0.4, 2.2, C(P.bodyDark));
  limb(g, 9, 11, 10.4, 14 - s2 * 0.4, 2.2, C(P.bodyDark));

  /* streamlined body */
  el(g, 7, 7.6, 5.6, 3.6, C(P.body));
  el(g, 6.2, 6.4, 4.4, 2.2, C(P.bodyLit));
  /* head */
  el(g, 11, 5.4, 3, 2.6, C(P.body));
  el(g, 11.6, 4.6, 2, 1.4, C(P.bodyLit));
  rr(g, 12.2, 4.6, 2.6, 1.6, 0.8, '#ffd257');
  px(g, 13.4, 4.8, 1.2, 0.8, '#fff6d0');
  /* claws */
  limb(g, 13, 6.6, 15, 7.4, 1.2, C(P.bodyDark));
  g.restore();
}

function drawDrone(g, e) {
  var P = palFor(e);
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(e.x), y = Math.round(e.y);
  var bob = Math.sin(e.age * 0.12) * 1.4;
  var cx = x + 8, cy = y + 5 + bob;
  var s = e.scale || 1;

  glow(g, cx, cy, 13, C(P.eye), 0.16);

  g.save();
  g.translate(cx, cy);
  g.scale(s, s);

  /* rotor arms */
  limb(g, -9, -2, -4, -1, 1.2, C(P.metal));
  limb(g, 9, -2, 4, -1, 1.2, C(P.metal));
  var spin = Math.floor(e.age / 3) % 2 === 0 ? 4.4 : 2.6;
  el(g, -9, -2.6, spin, 0.9, '#8fa4b8');
  el(g, 9, -2.6, spin, 0.9, '#8fa4b8');

  /* hull */
  el(g, 0, 0, 8, 4.6, C(P.metal));
  el(g, 0, -1.2, 6.4, 2.6, C(P.metalLit));
  rr(g, -3, -4.4, 6, 2.4, 1.2, C(P.metal));

  /* eye */
  circ(g, 0, 0.8, 2.4, C(P.eye));
  circ(g, -0.4, 0.2, 1.1, C(P.eyeLit));
  g.restore();
}

function drawTurret(g, e) {
  var P = palFor(e);
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(e.x), y = Math.round(e.y);
  var cx = x + 8, base = y + 14;

  /* base */
  el(g, cx, base, 8, 2.6, C(P.bodyDark));
  rr(g, x + 1, base - 5, 14, 5, 2.2, C(P.metal));
  rr(g, x + 1, base - 5, 14, 1.4, 0.7, C(P.metalLit));

  /* dome */
  circ(g, cx, y + 6.4, 5.2, C(P.metal));
  rr(g, cx - 5.2, y + 4, 10.4, 4, 2, C(P.metal));
  el(g, cx, y + 4.4, 4, 1.4, C(P.metalLit));

  /* eye */
  circ(g, cx, y + 6, 1.8, C(P.eye));
  circ(g, cx - 0.3, y + 5.6, 0.8, C(P.eyeLit));

  /* barrel */
  g.save();
  g.translate(cx, y + 7);
  g.rotate(e.aimAngle || 0);
  rr(g, 0, -1.6, 11, 3.2, 1.4, C(P.metal));
  rr(g, 0, -1, 10, 1.2, 0.6, C(P.metalLit));
  rr(g, 9, -1.9, 3, 3.8, 1.2, C(P.bodyDark));
  g.restore();
}

function drawJumper(g, e) {
  var P = palFor(e);
  var flash = e.flash > 0 && (Math.floor(e.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(e.x), y = Math.round(e.y);
  var f = e.facing >= 0 ? 1 : -1;
  var squash = e.onGround ? 1 : 0;
  var s = e.scale || 1;

  g.save();
  g.translate(x + 7, y + e.h);
  g.scale(f * s, s);
  g.translate(-7, -12);

  /* legs, coiled when grounded */
  limb(g, 5, 8, 2.6, 11 + squash, 2.2, C(P.bodyDark));
  limb(g, 9, 8, 11.4, 11 + squash, 2.2, C(P.bodyDark));

  /* body */
  el(g, 7, 6.4 - squash * 0.6, 6, 3.4 - squash * 0.4, C(P.body));
  el(g, 6.2, 5.4 - squash * 0.6, 4.6, 2, C(P.bodyLit));

  /* eyes */
  circ(g, 9.6, 4.6, 1.5, C(P.eye));
  px(g, 10.1, 4.2, 0.8, 0.8, C(P.eyeLit));
  circ(g, 5.4, 4.8, 1.2, C(P.eye));
  g.restore();
}

/* ---- pickups ------------------------------------------------------------ */
function drawCapsule(g, c) {
  var x = Math.round(c.x), y = Math.round(c.y);
  var bob = Math.sin(c.age * 0.1) * 2;
  y += bob;
  var col = c.kind === 'health' ? '#54ffa8' : (c.kind === 'coin' ? '#ffd257' : '#54e0ff');

  glow(g, x + 7, y + 7, 15, col, 0.22);
  rr(g, x - 0.5, y - 0.5, 15, 15, 5, 'rgba(8,14,22,0.85)');
  rr(g, x + 0.5, y + 0.5, 13, 13, 4.4, col);
  rr(g, x + 2, y + 2, 10, 3.4, 1.6, 'rgba(255,255,255,0.75)');

  if (c.kind === 'health') {
    rr(g, x + 6, y + 4, 2.4, 6.4, 1, '#08301c');
    rr(g, x + 4, y + 6, 6.4, 2.4, 1, '#08301c');
  } else if (c.kind === 'coin') {
    circ(g, x + 7, y + 7, 3.2, '#7a5400');
    circ(g, x + 7, y + 7, 2.2, '#fff0b8');
  } else {
    drawText(g, c.label || 'W', x + 4.4, y + 3.6, 1, '#062231');
  }
}

/* ---- bosses ------------------------------------------------------------- */
function drawWarden(g, b) {
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(b.x), y = Math.round(b.y);
  var w = b.w, h = b.h;
  var step = Math.sin(b.age * 0.08) * 3;
  var plate = C('#4a5568'), plateLit = C('#7c8a9e'), plateDark = C('#2c3444');
  var accent = C('#c0392b');

  /* legs — rounded joints, heavy stance */
  limb(g, x + 16, y + h - 30 + step, x + 15, y + h - 4 + step, 11, plateDark);
  limb(g, x + w - 16, y + h - 30 - step, x + w - 15, y + h - 4 - step, 11, plateDark);
  rr(g, x + 6, y + h - 8 + step, 19, 7, 3, plate);
  rr(g, x + w - 25, y + h - 8 - step, 19, 7, 3, plate);

  /* hips + torso */
  rr(g, x + 6, y + 24, w - 12, h - 46, 9, plate);
  rr(g, x + 6, y + 24, w - 12, 8, 4, plateLit);
  rr(g, x + 11, y + 34, w - 22, 9, 4, plateDark);
  rr(g, x + 11, y + 50, w - 22, 4, 2, accent);

  /* shoulder cannons */
  rr(g, x - 6, y + 26, 15, 15, 5, plateLit);
  circ(g, x - 7, y + 33, 3.4, plateDark);
  rr(g, x + w - 9, y + 26, 15, 15, 5, plateLit);
  circ(g, x + w + 7, y + 33, 3.4, plateDark);

  /* head */
  rr(g, x + w / 2 - 12, y + 5, 24, 19, 7, plateLit);
  rr(g, x + w / 2 - 12, y + 5, 24, 6, 3, C('#a9b6c6'));
  rr(g, x + w / 2 - 8, y + 12, 16, 7, 3, '#0a0e16');
  rr(g, x + w / 2 - 7, y + 13, 14, 5, 2.4, accent);
  rr(g, x + w / 2 - 4, y + 14, 8, 3, 1.4, C('#ffe9a8'));
  limb(g, x + w / 2 - 14, y + 2, x + w / 2 - 14, y + 8, 2.4, plateDark);
  limb(g, x + w / 2 + 14, y + 2, x + w / 2 + 14, y + 8, 2.4, plateDark);

  /* core */
  var coreY = y + h - 42, cx = x + w / 2;
  circ(g, cx, coreY + 8, 11, '#0a0e16');
  glow(g, cx, coreY + 8, 20, b.phase === 2 ? '#ff5c3c' : '#ffb545', 0.5);
  circ(g, cx, coreY + 8, 7.4, b.phase === 2 ? '#ff5c3c' : '#ffb545');
  circ(g, cx, coreY + 8, 4, '#fff3c4');
}

function drawWraith(g, b) {
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(b.x), y = Math.round(b.y);
  var w = b.w, h = b.h;
  var flap = Math.sin(b.age * 0.14) * 6;
  var shell = C('#2b6f8f'), shellLit = C('#7fe3ff'), dark = '#08131c';
  var cx = x + w / 2, cy = y + h / 2;

  /* wings — bezier membranes */
  g.save();
  g.fillStyle = shell;
  g.beginPath();
  g.moveTo(cx - 12, cy - 2);
  g.quadraticCurveTo(cx - 34, cy - 16 + flap, cx - 46, cy - 2 + flap);
  g.quadraticCurveTo(cx - 30, cy + 2 + flap, cx - 12, cy + 8);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(cx + 12, cy - 2);
  g.quadraticCurveTo(cx + 34, cy - 16 - flap, cx + 46, cy - 2 - flap);
  g.quadraticCurveTo(cx + 30, cy + 2 - flap, cx + 12, cy + 8);
  g.closePath();
  g.fill();
  g.restore();
  limb(g, cx - 14, cy - 1, cx - 42, cy - 4 + flap, 1.6, shellLit);
  limb(g, cx + 14, cy - 1, cx + 42, cy - 4 - flap, 1.6, shellLit);

  /* body */
  el(g, cx, cy, w / 2 - 6, h / 2 - 6, dark);
  el(g, cx, cy, w / 2 - 8, h / 2 - 8, shell);
  el(g, cx, cy - 6, w / 2 - 12, 4, shellLit);

  /* crystal core */
  glow(g, cx, cy + 4, 24, b.phase === 2 ? '#ff5c3c' : '#bff4ff', 0.45);
  circ(g, cx, cy + 4, 8, dark);
  circ(g, cx, cy + 4, 6, b.phase === 2 ? '#ff5c3c' : '#bff4ff');
  circ(g, cx, cy + 4, 2.6, '#ffffff');

  /* eyes */
  circ(g, cx - 13, cy - 8, 2.4, dark);
  circ(g, cx + 13, cy - 8, 2.4, dark);
  circ(g, cx - 13, cy - 8, 1.3, '#ff4d6d');
  circ(g, cx + 13, cy - 8, 1.3, '#ff4d6d');
}

function drawHeart(g, b) {
  var flash = b.flash > 0 && (Math.floor(b.flash / 2) % 2 === 0);
  function C(c) { return flash ? '#ffffff' : c; }
  var x = Math.round(b.x), y = Math.round(b.y);
  var cx = x + b.w / 2, cy = y + b.h / 2;
  var spin = b.age * 0.04;
  var pulse = 1 + Math.sin(b.age * 0.16) * 0.08;

  /* orbiting nodes */
  for (var i = 0; i < 3; i++) {
    var a = spin + i * Math.PI * 2 / 3;
    var ox = cx + Math.cos(a) * (b.w / 2 - 5);
    var oy = cy + Math.sin(a) * (b.h / 4);
    circ(g, ox, oy, 4.4, '#0a0e16');
    circ(g, ox, oy, 3.4, C('#c9a227'));
    circ(g, ox, oy, 1.6, '#ffe9a8');
  }

  /* shell */
  circ(g, cx, cy, 26, '#0a0e16');
  circ(g, cx, cy, 24, C('#3a1030'));
  el(g, cx, cy - 12, 20, 8, C('#6b1d4f'));

  /* the heart */
  glow(g, cx, cy, 34, b.phase === 2 ? '#ff3b2f' : '#ff2d95', 0.5);
  circ(g, cx, cy, 15 * pulse, b.phase === 2 ? '#ff5c3c' : '#ff2d95');
  circ(g, cx, cy, 9 * pulse, '#ffd0e4');
  circ(g, cx, cy, 4.4 * pulse, '#ffffff');
}
