/* ===========================================================================
   EON COMMANDO — 80 render
   Parallax eras, the world, the HUD and every screen.
   =========================================================================== */

function makeBackground(stage) {
  var rng = mulberry32(stage.seed);
  var span = stage.length + 1600;
  var startX = -800;
  var i, x;

  var stars = [];
  for (i = 0; i < 120; i++) {
    stars.push({ x: rng() * span, y: rng() * 118, s: rng() > 0.86 ? 2 : 1, tw: rng() * 6.28 });
  }

  function ridge(amp, base, step) {
    var pts = [];
    for (var xx = -W; xx < span; xx += step) {
      pts.push({
        x: xx,
        y: base + Math.sin(xx * 0.004) * amp * 0.6 +
           Math.sin(xx * 0.011) * amp * 0.28 + rng() * amp * 0.4
      });
    }
    return pts;
  }

  var clouds = [];
  for (i = 0; i < 12; i++) {
    clouds.push({
      x: rng() * span, y: 16 + rng() * 86,
      w: 70 + rng() * 160, h: 5 + rng() * 9, a: 0.04 + rng() * 0.07
    });
  }

  var mid = [];
  x = startX;
  while (x < span) {
    var w = 20 + rng() * 40;
    var h = 30 + rng() * 92;
    var wins = [];
    for (var wy = 8; wy < h - 6; wy += 9) {
      for (var wx = 4; wx < w - 4; wx += 8) {
        if (rng() > 0.55) wins.push({ x: wx, y: wy });
      }
    }
    mid.push({ x: x, w: w, h: h, wins: wins, lit: rng() > 0.25 });
    x += w + 14 + rng() * 46;
  }

  var near = [];
  x = startX;
  while (x < span) {
    near.push({ x: x, w: 30 + rng() * 60, h: 12 + rng() * 34 });
    x += 70 + rng() * 110;
  }

  var fore = [];
  x = startX;
  while (x < span) {
    fore.push({ x: x, w: 34 + rng() * 70, h: 6 + rng() * 16 });
    x += 130 + rng() * 190;
  }

  var motes = [];
  for (i = 0; i < 60; i++) {
    motes.push({
      x: rng() * span, y: rng() * (GROUND_Y - 20),
      s: rng() > 0.85 ? 2 : 1, ph: rng() * 6.28, sp: 0.3 + rng() * 0.9
    });
  }

  var speckles = [];
  for (i = 0; i < 1100; i++) {
    var sx = rng() * stage.length;
    speckles.push({
      x: sx, y: GROUND_Y + 2 + rng() * (H - GROUND_Y),
      s: rng() > 0.7 ? 2 : 1, d: rng() > 0.5
    });
  }

  var props = [];
  for (i = 0; i < 52; i++) {
    props.push({ x: rng() * stage.length, h: 6 + rng() * 22, w: 3 + rng() * 6, kind: rng() > 0.62 ? 1 : 0 });
  }

  return {
    span: span, stars: stars, clouds: clouds,
    ridgeFar: ridge(30, 58, 46), ridgeMid: ridge(22, 100, 38),
    mid: mid, near: near, fore: fore,
    motes: motes, speckles: speckles, props: props,
    disc: { x: W * (0.24 + rng() * 0.5), y: 62 + rng() * 22, r: 22 + rng() * 12 },
    colFar: shade(stage.sky[2], 0.55),
    colMid: shade(stage.sky[2], 0.4)
  };
}

function drawSky(g, stage, bg, camX, time, noFill) {
  if (!noFill) {
    var grad = g.createLinearGradient(0, 0, 0, GROUND_Y + 20);
    grad.addColorStop(0, stage.sky[0]);
    grad.addColorStop(0.55, stage.sky[1]);
    grad.addColorStop(1, stage.sky[2]);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
  }

  /* celestial body */
  if (bg && bg.disc) {
    var dx = bg.disc.x - camX * 0.04, dy = bg.disc.y, dr = bg.disc.r;
    var halo = g.createRadialGradient(dx, dy, dr * 0.4, dx, dy, dr * 3.4);
    halo.addColorStop(0, rgba(stage.accent, 0.30));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = halo;
    g.fillRect(dx - dr * 3.4, dy - dr * 3.4, dr * 6.8, dr * 6.8);
    g.fillStyle = rgba(stage.accent, 0.75);
    g.beginPath();
    g.arc(dx, dy, dr, 0, 6.2832);
    g.fill();
    g.fillStyle = rgba('#ffffff', 0.28);
    g.beginPath();
    g.arc(dx - dr * 0.2, dy - dr * 0.2, dr * 0.7, 0, 6.2832);
    g.fill();
  }

  /* stars */
  if (bg && bg.stars) {
    for (var i = 0; i < bg.stars.length; i++) {
      var st = bg.stars[i];
      var sx = st.x - camX * 0.05;
      if (sx < -4 || sx > W + 4) continue;
      var tw = 0.35 + Math.abs(Math.sin(time * 0.02 + st.tw)) * 0.55;
      g.fillStyle = rgba('#ffffff', tw * 0.8);
      g.fillRect(sx, st.y, st.s, st.s);
    }
  }

  /* cloud bands */
  if (bg && bg.clouds) {
    for (var c = 0; c < bg.clouds.length; c++) {
      var cl = bg.clouds[c];
      var span = bg.span;
      var cx2 = cl.x - camX * 0.1 - (time * 0.06) % span;
      if (cx2 < -cl.w) cx2 += span;
      if (cx2 > W + cl.w) continue;
      g.globalAlpha = clamp(cl.a * 1.7, 0, 0.16);
      el(g, cx2 + cl.w / 2, cl.y + cl.h / 2, cl.w / 2, cl.h / 2, stage.accent);
      el(g, cx2 + cl.w * 0.35, cl.y + cl.h * 0.4, cl.w * 0.28, cl.h * 0.42, stage.accent);
      g.globalAlpha = 1;
    }
  }

  /* horizon glow */
  var rg = g.createRadialGradient(W * 0.5, GROUND_Y - 6, 4, W * 0.5, GROUND_Y - 6, 200);
  rg.addColorStop(0, rgba(stage.accent, 0.20));
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
}

function drawBackground(g, stage, bg, camX, time) {
  var i, o, sx;

  function ridgeLine(pts, factor, color) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(-20, H);
    for (var j = 0; j < pts.length; j++) {
      var sxj = pts[j].x - camX * factor;
      if (sxj < -120 || sxj > W + 120) continue;
      g.lineTo(sxj, pts[j].y);
    }
    g.lineTo(W + 20, H);
    g.closePath();
    g.fill();
  }

  ridgeLine(bg.ridgeFar, 0.10, bg.colFar);
  ridgeLine(bg.ridgeMid, 0.18, bg.colMid);

  /* mid skyline */
  for (i = 0; i < bg.mid.length; i++) {
    o = bg.mid[i];
    sx = o.x - camX * 0.34;
    if (sx + o.w < -20 || sx > W + 20) continue;
    var top = GROUND_Y - o.h;
    g.fillStyle = stage.mid;
    g.fillRect(sx, top, o.w, o.h + 40);
    g.fillStyle = rgba('#ffffff', 0.03);
    g.fillRect(sx, top, 2, o.h + 40);
    if (o.lit) {
      g.fillStyle = rgba(stage.accent, 0.55);
      for (var k = 0; k < o.wins.length; k++) {
        g.fillRect(sx + o.wins[k].x, top + o.wins[k].y, 2, 2);
      }
    }
  }

  /* near silhouettes */
  g.fillStyle = stage.near;
  for (i = 0; i < bg.near.length; i++) {
    o = bg.near[i];
    sx = o.x - camX * 0.58;
    if (sx + o.w < -20 || sx > W + 20) continue;
    g.fillRect(sx, GROUND_Y - o.h, o.w, o.h + 30);
    g.fillRect(sx + o.w * 0.25, GROUND_Y - o.h - 6, o.w * 0.5, 6);
  }

  /* drifting motes */
  for (i = 0; i < bg.motes.length; i++) {
    o = bg.motes[i];
    sx = o.x - camX * 0.75 - (time * o.sp * 0.25) % (W + 60);
    if (sx < -20) sx += W + 60;
    var sy = o.y + Math.sin(time * 0.02 + o.ph) * 6;
    g.fillStyle = rgba(stage.accent, 0.35 + Math.sin(time * 0.05 + o.ph) * 0.25);
    g.fillRect(sx, sy, o.s, o.s);
  }
}

/* Ground is static per stage: bake it into 1024px chunks once, then blit.
   Saves ~1100 speckle rects and every prop, every frame. */
var GroundCache = { chunks: [], stage: null, key: '' };

function bakeGroundChunks(stage, bg) {
  var key = stage.id + ':' + W;
  if (GroundCache.key === key) return;
  GroundCache.key = key;
  GroundCache.stage = stage;
  GroundCache.chunks = [];

  var CHUNK = 1024;
  var total = Math.ceil(stage.length / CHUNK);
  var HEAD = 36;                    /* headroom for props that rise above the ground */
  var h = H - GROUND_Y + HEAD;

  for (var ci = 0; ci < total; ci++) {
    var x0 = ci * CHUNK;
    var cv = document.createElement('canvas');
    cv.width = CHUNK;
    cv.height = h;
    var cg = cv.getContext('2d');

    /* segments overlapping this chunk */
    for (var i = 0; i < stage.groundSegs.length; i++) {
      var seg = stage.groundSegs[i];
      var sx = seg[0] - x0, sw = seg[1];
      if (sx + sw < 0 || sx > CHUNK) continue;
      /* gradient must map GROUND_Y..H, i.e. the chunk's HEAD..h band */
      var grad = cg.createLinearGradient(0, HEAD, 0, h);
      grad.addColorStop(0, stage.ground);
      grad.addColorStop(1, stage.groundDark);
      cg.fillStyle = grad;
      cg.fillRect(sx, HEAD, sw, h - HEAD);
      /* rim light first, exactly as the live path draws it */
      rr(cg, sx, HEAD, sw, 4, 2, stage.groundLit);
      rr(cg, sx, HEAD, sw, 2, 1, rgba(stage.accent, 0.5));
      cg.fillStyle = 'rgba(0,0,0,0.18)';
      cg.fillRect(sx, HEAD + 9, sw, 1);
      cg.fillRect(sx, HEAD + 20, sw, 1);
      cg.fillStyle = 'rgba(0,0,0,0.6)';
      cg.fillRect(sx, HEAD, 2, h - HEAD);
      cg.fillRect(sx + sw - 2, HEAD, 2, h - HEAD);
    }

    /* speckles in this chunk */
    for (var sp2 = 0; sp2 < bg.speckles.length; sp2++) {
      var sk = bg.speckles[sp2];
      var px2 = sk.x - x0;
      if (px2 < -4 || px2 > CHUNK + 4) continue;
      cg.fillStyle = sk.d ? rgba(stage.groundLit, 0.45) : 'rgba(0,0,0,0.3)';
      cg.fillRect(px2, sk.y - GROUND_Y + HEAD, sk.s, sk.s);
    }

    /* props standing on the ground in this chunk */
    for (var pr = 0; pr < bg.props.length; pr++) {
      var pp = bg.props[pr];
      var ppx = pp.x - x0;
      if (ppx < -14 || ppx > CHUNK + 14) continue;
      if (pp.kind === 0) {
        cg.fillStyle = stage.groundDark;
        cg.fillRect(ppx, HEAD - pp.h, pp.w, pp.h);
        cg.fillStyle = rgba(stage.accent, 0.65);
        cg.fillRect(ppx, HEAD - pp.h, pp.w, 2);
      } else {
        cg.fillStyle = rgba(stage.accent, 0.85);
        cg.beginPath();
        cg.moveTo(ppx, HEAD + 1);
        cg.lineTo(ppx + pp.w / 2, HEAD - pp.h);
        cg.lineTo(ppx + pp.w, HEAD + 1);
        cg.closePath();
        cg.fill();
        cg.fillStyle = rgba('#ffffff', 0.35);
        cg.fillRect(ppx + pp.w / 2 - 1, HEAD - pp.h + 3, 1, pp.h * 0.5);
      }
    }

    GroundCache.chunks.push(cv);
  }
}

function drawGround(g, stage, bg, camX) {
  if (PARAMS.legacyground) { drawGroundLegacy(g, stage, bg, camX); return; }
  bakeGroundChunks(stage, bg);
  var CHUNK = 1024;
  var first = Math.max(0, Math.floor(camX / CHUNK));
  var last = Math.min(GroundCache.chunks.length - 1, Math.floor((camX + W) / CHUNK));
  for (var ci = first; ci <= last; ci++) {
    var cv = GroundCache.chunks[ci];
    if (cv) g.drawImage(cv, Math.round(ci * CHUNK - camX), GROUND_Y - 36);
  }
  return;
}

function drawGroundLegacy(g, stage, bg, camX) {
  var i, seg, sx, sw;
  var segs = stage.groundSegs;
  for (i = 0; i < segs.length; i++) {
    seg = segs[i];
    sx = seg[0] - camX;
    sw = seg[1];
    if (sx + sw < -20 || sx > W + 20) continue;

    var grad = g.createLinearGradient(0, GROUND_Y, 0, H);
    grad.addColorStop(0, stage.ground);
    grad.addColorStop(1, stage.groundDark);
    g.fillStyle = grad;
    g.fillRect(sx, GROUND_Y, sw, H - GROUND_Y);

    rr(g, sx, GROUND_Y, sw, 4, 2, stage.groundLit);
    rr(g, sx, GROUND_Y, sw, 2, 1, rgba(stage.accent, 0.5));

    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(sx, GROUND_Y + 9, sw, 1);
    g.fillRect(sx, GROUND_Y + 20, sw, 1);

    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillRect(sx, GROUND_Y, 2, H - GROUND_Y);
    g.fillRect(sx + sw - 2, GROUND_Y, 2, H - GROUND_Y);
  }

  for (i = 0; i < bg.speckles.length; i++) {
    var sp = bg.speckles[i];
    sx = sp.x - camX;
    if (sx < -4 || sx > W + 4) continue;
    g.fillStyle = sp.d ? rgba(stage.groundLit, 0.45) : 'rgba(0,0,0,0.3)';
    g.fillRect(sx, sp.y, sp.s, sp.s);
  }

  for (i = 0; i < bg.props.length; i++) {
    var pr = bg.props[i];
    sx = pr.x - camX;
    if (sx < -14 || sx > W + 14) continue;
    if (pr.kind === 0) {
      g.fillStyle = stage.groundDark;
      g.fillRect(sx, GROUND_Y - pr.h, pr.w, pr.h);
      g.fillStyle = rgba(stage.accent, 0.65);
      g.fillRect(sx, GROUND_Y - pr.h, pr.w, 2);
    } else {
      g.fillStyle = rgba(stage.accent, 0.85);
      g.beginPath();
      g.moveTo(sx, GROUND_Y + 1);
      g.lineTo(sx + pr.w / 2, GROUND_Y - pr.h);
      g.lineTo(sx + pr.w, GROUND_Y + 1);
      g.closePath();
      g.fill();
      g.fillStyle = rgba('#ffffff', 0.35);
      g.fillRect(sx + pr.w / 2 - 1, GROUND_Y - pr.h + 3, 1, pr.h * 0.5);
    }
  }
}

/* silhouettes drawn in front of the action for depth */
function drawForeground(g, stage, bg, camX) {
  /* These sit in front of the ground. At 82% black they read as holes cut out
     of the terrain; a lighter tint plus a rim line reads as a shape in front. */
  for (var i = 0; i < bg.fore.length; i++) {
    var o = bg.fore[i];
    var sx = o.x - camX * 1.22;
    if (sx + o.w < -30 || sx > W + 30) continue;
    var base = H + 2;
    g.beginPath();
    g.moveTo(sx, base);
    g.lineTo(sx + o.w * 0.22, H - o.h);
    g.lineTo(sx + o.w * 0.42, H - o.h * 0.55);
    g.lineTo(sx + o.w * 0.66, H - o.h * 0.9);
    g.lineTo(sx + o.w, base);
    g.closePath();
    g.fillStyle = 'rgba(0,0,0,0.46)';
    g.fill();
    g.strokeStyle = rgba(stage.accent, 0.16);
    g.lineWidth = 1;
    g.stroke();
  }
  /* rubble along the bottom edge */
  g.fillStyle = 'rgba(0,0,0,0.34)';
  for (var j = 0; j < bg.props.length; j++) {
    var p = bg.props[j];
    var px2 = p.x * 1.05 - camX * 1.35;
    if (px2 < -20 || px2 > W + 20) continue;
    g.fillRect(px2, H - 4, p.w + 6, 6);
  }
}

function drawPlatforms(g, stage, camX) {
  var plats = stage.platforms;
  for (var i = 0; i < plats.length; i++) {
    var p = plats[i];
    var sx = p.x - camX;
    if (sx + p.w < -20 || sx > W + 20) continue;
    rr(g, sx, p.y + 2.5, p.w, 8, 3, 'rgba(0,0,0,0.38)');
    rr(g, sx, p.y, p.w, 8, 3, stage.ground);
    rr(g, sx, p.y, p.w, 2.6, 1.3, stage.groundLit);
    rr(g, sx + 3, p.y + 4.4, p.w - 6, 1.4, 0.7, rgba(stage.accent, 0.4));
  }
}

function drawParticles(g, camX) {
  for (var i = 0; i < Game.particles.length; i++) {
    var pt = Game.particles[i];
    var a = clamp(pt.life / pt.maxLife, 0, 1);
    g.globalAlpha = pt.smoke ? a * 0.45 : a;
    g.fillStyle = pt.color;
    g.fillRect(Math.round(pt.x - camX), Math.round(pt.y), pt.size, pt.size);
  }
  g.globalAlpha = 1;
}

/* ---- weather ------------------------------------------------------------
   Screen-space particles per era. Cheap: a handful of rects a frame, and the
   whole thing reads as place. */
var Weather = { parts: [], kind: null, wind: 0, flash: 0, t: 0 };

var WEATHER_KINDS = {
  1: { kind: 'ember',  n: 70,  color: '#ff9a5a', glow: '#ffd257', vy: -0.35, wind: 0.10, sway: 0.9 },
  2: { kind: 'snow',   n: 90,  color: '#dff2ff', glow: '#ffffff', vy: 0.55,  wind: 0.14, sway: 1.1 },
  3: { kind: 'motes',  n: 60,  color: '#c08bff', glow: '#ffd0e4', vy: -0.12, wind: 0.20, sway: 0.7 },
  4: { kind: 'rain',   n: 110, color: '#9fe8d6', glow: '#d8fff4', vy: 5.2,   wind: 1.5,  sway: 0.15 },
  5: { kind: 'debris', n: 55,  color: '#a9b6ff', glow: '#e6e9ff', vy: 0.9,   wind: 2.6,  sway: 0.5 },
  6: { kind: 'ash',    n: 80,  color: '#e8c987', glow: '#fff3c4', vy: 0.30,  wind: 0.12, sway: 0.8 }
};

function setWeather(stageId) {
  var cfg = WEATHER_KINDS[stageId] || WEATHER_KINDS[1];
  Weather.kind = cfg.kind;
  Weather.wind = cfg.wind;
  Weather.parts = [];
  Weather.flash = 0;
  Weather.t = 0;
  for (var i = 0; i < cfg.n; i++) {
    Weather.parts.push({
      x: RNG.fr(0, W + 80) - 40,
      y: RNG.fr(0, H + 40) - 20,
      v: cfg.vy * RNG.fr(0.6, 1.5),
      s: cfg.kind === 'rain' ? 1 : (RNG.fr() > 0.75 ? 2 : 1),
      ph: RNG.fr(0, Math.PI * 2),
      a: RNG.fr(0.25, 0.85)
    });
  }
  Weather.cfg = cfg;
}

function updateWeather() {
  if (!Weather.cfg) return;
  var cfg = Weather.cfg;
  Weather.t++;
  var i, p;
  for (i = 0; i < Weather.parts.length; i++) {
    p = Weather.parts[i];
    p.y += p.v;
    p.x += cfg.wind + Math.sin(Weather.t * 0.02 + p.ph) * cfg.sway * 0.4;
    if (p.y < -12) { p.y = H + 8; p.x = RNG.fr(0, W + 80) - 40; }
    if (p.y > H + 12) { p.y = -8; p.x = RNG.fr(0, W + 80) - 40; }
    if (p.x < -14) p.x = W + 8;
    if (p.x > W + 14) p.x = -8;
  }
  /* a rare storm flash, for the rain eras only */
  if (Weather.kind === 'rain') {
    if (RNG.fChance && RNG.fChance(0.0025)) { Weather.flash = 8; Snd.sfx('hit'); }
    if (Weather.flash > 0) Weather.flash--;
  }
}

function drawWeather(g) {
  if (!Weather.cfg) return;
  var cfg = Weather.cfg, i, p;

  if (Weather.flash > 0) {
    g.fillStyle = 'rgba(200,240,255,' + (Weather.flash / 8 * 0.18) + ')';
    g.fillRect(0, 0, W, H);
  }

  if (Weather.kind === 'rain') {
    g.strokeStyle = rgba(cfg.color, 0.55);
    g.lineWidth = 1;
    g.beginPath();
    for (i = 0; i < Weather.parts.length; i++) {
      p = Weather.parts[i];
      g.moveTo(p.x, p.y);
      g.lineTo(p.x - cfg.wind * 1.6, p.y - 7);
    }
    g.stroke();
    return;
  }

  for (i = 0; i < Weather.parts.length; i++) {
    p = Weather.parts[i];
    g.globalAlpha = p.a * (Weather.kind === 'ember' ? (0.55 + Math.sin(Weather.t * 0.08 + p.ph) * 0.45) : 1);
    g.fillStyle = cfg.color;
    if (Weather.kind === 'debris') g.fillRect(p.x, p.y, p.s + 3, 1);
    else if (Weather.kind === 'snow') g.fillRect(p.x, p.y, p.s, p.s);
    else g.fillRect(p.x, p.y, p.s, p.s);
  }
  g.globalAlpha = 1;
}

/* ---- arena hazards ------------------------------------------------------ */
function drawHazards(g, camX) {
  var i, hz;
  for (i = 0; i < Game.hazards.length; i++) {
    hz = Game.hazards[i];
    var sx = hz.x - camX;

    if (hz.kind === 'debris') {
      if (hz.telegraph > 0) {
        /* ground shadow tells you exactly where it will land */
        var t = 1 - hz.telegraph / 60;
        g.globalAlpha = 0.25 + t * 0.5;
        el(g, sx, GROUND_Y + 1, 10, 3, scheme().hostile);
        g.globalAlpha = 0.5 + Math.sin(Game.time * 0.5) * 0.3;
        g.fillStyle = scheme().hostile;
        g.fillRect(sx - 0.5, GROUND_Y - 90, 1, 86);
        g.globalAlpha = 1;
      } else {
        el(g, sx, GROUND_Y + 1, 7, 2, 'rgba(0,0,0,0.45)');
        g.save();
        g.translate(sx, hz.y);
        g.rotate(hz.y * 0.06);
        rr(g, -hz.w / 2, -hz.h / 2, hz.w, hz.h, 3, '#3a2a2a');
        rr(g, -hz.w / 2 + 1, -hz.h / 2 + 1, hz.w - 2, 3, 1.5, '#6d4a3a');
        g.restore();
      }
      continue;
    }

    if (hz.kind === 'beam') {
      var cx = hz.cx - camX, cy = hz.cy;
      var ex = cx + Math.cos(hz.angle) * hz.len;
      var ey = cy + Math.sin(hz.angle) * hz.len;
      if (hz.telegraph > 0) {
        g.globalAlpha = 0.28 + Math.sin(Game.time * 0.4) * 0.18;
        g.strokeStyle = scheme().hostile;
        g.lineWidth = 1.5;
        g.setLineDash([5, 5]);
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
        g.setLineDash([]);
        g.globalAlpha = 1;
      } else {
        g.globalAlpha = 0.35;
        g.strokeStyle = scheme().hostileGlow;
        g.lineWidth = hz.w + 5;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
        g.globalAlpha = 1;
        g.strokeStyle = scheme().hostile;
        g.lineWidth = hz.w;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
        g.strokeStyle = '#ffffff';
        g.lineWidth = Math.max(1, hz.w * 0.35);
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
      }
    }
  }
}

function drawBullets(g, camX) {
  var i, b, x, y;
  /* trails first so cores always sit on top */
  g.lineCap = 'round';
  for (i = 0; i < Game.bullets.length; i++) {
    b = Game.bullets[i];
    x = b.x - camX; y = b.y;
    var tl = b.friendly ? 5 : 6.5;
    g.globalAlpha = b.friendly ? 0.30 : 0.42;
    g.strokeStyle = b.color;
    g.lineWidth = Math.max(1.4, b.w * 0.55);
    g.beginPath();
    g.moveTo(x - b.vx * tl * 0.16, y - b.vy * tl * 0.16);
    g.lineTo(x, y);
    g.stroke();
  }
  g.globalAlpha = 1;

  for (i = 0; i < Game.bullets.length; i++) {
    b = Game.bullets[i];
    x = Math.round(b.x - camX); y = Math.round(b.y);
    /* dark rim so a bullet never vanishes against a bright wall */
    g.globalAlpha = 0.5;
    g.fillStyle = '#05070d';
    g.fillRect(x - b.w / 2 - 1.5, y - b.h / 2 - 1.5, b.w + 3, b.h + 3);
    g.globalAlpha = 0.4;
    g.fillStyle = b.glow;
    g.fillRect(x - b.w / 2 - 1, y - b.h / 2 - 1, b.w + 2, b.h + 2);
    g.globalAlpha = 1;
    g.fillStyle = b.color;
    g.fillRect(x - b.w / 2, y - b.h / 2, b.w, b.h);
    g.fillStyle = '#ffffff';
    g.fillRect(x - b.w / 4, y - b.h / 4, Math.max(1, b.w / 2), Math.max(1, b.h / 2));
  }
}

/* small arrows at the screen edge for enemies you cannot see yet */
function drawThreatArrows(g, camX) {
  var shown = 0;
  for (var i = 0; i < Game.enemies.length && shown < 4; i++) {
    var e = Game.enemies[i];
    var sx = e.x - camX + e.w / 2;
    if (sx > -30 && sx < W + 30) continue;
    if (Math.abs(sx - W / 2) > W * 1.2) continue;
    var side = sx < 0 ? -1 : 1;
    var ax = side < 0 ? 6 : W - 6;
    var ay = clamp(e.y - camX * 0 + e.h / 2, 40, H - 30);
    var col = e.elite ? '#ffe08a' : '#ff4d6d';
    g.globalAlpha = 0.55 + Math.sin(Game.time * 0.15) * 0.2;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(ax + side * 5, ay);
    g.lineTo(ax - side * 3, ay - 4);
    g.lineTo(ax - side * 3, ay + 4);
    g.closePath();
    g.fill();
    g.globalAlpha = 1;
    shown++;
  }
}

function drawWorld(g) {
  var stage = Game.stage, camX = Game.camX;
  var bg = Game.bg;
  drawSky(g, stage, bg, camX, Game.time, VIEW_H !== H);
  g.globalAlpha = Game.boss ? 0.82 : 1;
  drawBackground(g, stage, bg, camX, Game.time);
  g.globalAlpha = 1;
  drawGround(g, stage, bg, camX);
  drawPlatforms(g, stage, camX);

  var i;
  /* contact shadows */
  g.fillStyle = 'rgba(0,0,0,0.35)';
  for (i = 0; i < Game.enemies.length; i++) {
    var en = Game.enemies[i];
    if (en.y + en.h > GROUND_Y - 4) {
      g.beginPath();
      g.ellipse(en.x - camX + en.w / 2, GROUND_Y + 1, en.w * 0.5, 2, 0, 0, 6.2832);
      g.fill();
    }
  }
  var pl = Game.player;
  if (pl && pl.onGround) {
    g.beginPath();
    g.ellipse(pl.x - camX + pl.w / 2, pl.y + pl.h + 1, pl.w * 0.55, 2, 0, 0, 6.2832);
    g.fill();
  }

  for (i = 0; i < Game.pickups.length; i++) drawCapsule(g, Game.pickups[i]);

  for (i = 0; i < Game.enemies.length; i++) {
    var e = Game.enemies[i];
    var ex = e.x - camX;
    if (ex < -40 || ex > W + 40) continue;
    g.save();
    g.translate(-camX, 0);
    if (e.t === 'grunt') drawGrunt(g, e);
    else if (e.t === 'runner') drawRunner(g, e);
    else if (e.t === 'drone') drawDrone(g, e);
    else if (e.t === 'turret') drawTurret(g, e);
    else if (e.t === 'jumper') drawJumper(g, e);
    else if (e.t === 'sniper') drawSniper(g, e);
    else if (e.t === 'swarm') drawSwarm(g, e);
    else if (e.t === 'brute') drawBrute(g, e);
    else if (e.t === 'shielder') drawShielder(g, e);
    g.restore();
  }

  if (Game.boss) {
    g.save();
    g.translate(-camX, 0);
    drawBoss(g, Game.boss);
    g.restore();
  }

  var p = Game.player;
  var plist = (Game.players && Game.players.length) ? Game.players : (p ? [p] : []);
  for (var pj = 0; pj < plist.length; pj++) {
    var pp = plist[pj];
    if (!pp || (pp.dead && Math.floor(pp.deadTimer / 4) % 2 === 1)) continue;
    g.save();
    g.translate(-camX, 0);
    if (pp.downed) {
      /* downed: greyed out, pulsing, with a revive ring */
      g.globalAlpha = 0.55 + Math.sin(Game.time * 0.2) * 0.15;
      drawPlayer(g, pp);
      g.globalAlpha = 1;
      var prx = pp.x + pp.w / 2 - camX, pry = pp.y - 10;
      g.strokeStyle = 'rgba(84,255,168,0.8)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(prx, pry, 7, -1.57, -1.57 + 6.2832 * clamp(pp.reviveT / 55, 0, 1));
      g.stroke();
      drawText(g, 'DOWN', prx, pry - 12, 1, '#ff4d6d', 'center', 'rgba(0,0,0,0.8)');
    } else {
      if (pp.invuln > 0 && !pp.dead && Math.floor(pp.invuln / 4) % 2 === 1) g.globalAlpha = 0.45;
      drawPlayer(g, pp);
      g.globalAlpha = 1;
    }
    g.restore();
  }

  /* dash afterimages */
  for (i = 0; i < Game.ghosts.length; i++) drawDashGhost(g, Game.ghosts[i], camX);

  g.save();
  g.translate(-camX, 0);
  for (i = 0; i < Game.grenades.length; i++) drawGrenade(g, Game.grenades[i]);
  g.restore();

  for (var mi = 0; mi < plist.length; mi++) {
    if (plist[mi] && plist[mi].meleeT > 0) drawMeleeArc(g, plist[mi], camX);
  }

  drawWeather(g);
  drawHazards(g, camX);
  drawBullets(g, camX);
  drawParticles(g, camX);
  drawThreatArrows(g, camX);
  drawForeground(g, stage, bg, camX);

  /* floating score text */
  for (i = 0; i < Game.floaters.length; i++) {
    var f = Game.floaters[i];
    g.globalAlpha = clamp(f.life / 30, 0, 1);
    drawText(g, f.text, f.x - camX, f.y, 1, f.color, 'center', 'rgba(0,0,0,0.7)');
    g.globalAlpha = 1;
  }
}

/* ---- HUD ---------------------------------------------------------------- */
function drawHeartIcon(g, x, y, full, tint) {
  /* an empty heart is a hollow outline, not a dark blob: you should be able to
     count what you have lost at a glance */
  var c = full ? (tint || '#ff5470') : 'rgba(255,84,112,0.18)';
  var c2 = full ? (tint ? '#d8f8ff' : '#ffd6de') : 'rgba(255,84,112,0.28)';
  var edge = full ? (tint ? '#0b3b4a' : '#5c1220') : 'rgba(255,84,112,0.30)';

  /* solid silhouette first, then a one-pixel dark seat so it reads as a shape
     rather than an outline */
  px(g, x + 1, y, 2, 1, c); px(g, x + 4, y, 2, 1, c);
  px(g, x, y + 1, 7, 2, c);
  px(g, x + 1, y + 3, 5, 1, c);
  px(g, x + 2, y + 4, 3, 1, c);
  px(g, x + 3, y + 5, 1, 1, c);
  px(g, x + 1, y + 2, 5, 1, edge);   /* seam between the lobes */
  if (full) px(g, x + 1, y + 1, 1, 1, c2);
}

var HUDS = { score: '', hi: '', lives: '', weapon: '' };

function drawHUD(g) {
  var p = Game.player;
  var stage = Game.stage;
  var k = clamp(SET.hudScale || 1, 0.85, 1.3);
  var i;

  g.save();
  g.scale(k, k);

  /* ---- the left cluster lives in one panel, sized to its content ---- */
  var livesTxt = 'X' + Math.max(0, Game.lives);
  var wpn = WEAPONS[p.weapon];
  var row1w = (p.maxHp * 9 - 2) + 22;                    /* hearts + reserved combo slot */
  var row2w = 44 + 5 + p.maxGrenades * 6;                /* gauge + grenades */
  /* AUTO is redundant on a phone, where the fire button is hidden anyway */
  var showAuto = SET.autoFire && W >= 380;
  var row3w = 8 + textWidth(livesTxt, 1) + 8 + 10 + 4 + textWidth(wpn.name, 1) +
              (showAuto ? 3 + textWidth('AUTO', 1) : 0);
  var panelW = Math.max(row1w, row2w, row3w) + 10;
  var panelH = 40;

  Game.debugRects = Game.debugRects || {};
  Game.debugRects.left = { x: 4, y: 4, w: panelW, h: panelH };
  rr(g, 4, 4, panelW, panelH, 4, 'rgba(4,8,14,0.62)');
  rr(g, 4, 4, panelW, panelH, 4, 'rgba(255,255,255,0.05)');
  px(g, 5, 4.5, panelW - 2, 1, 'rgba(255,255,255,0.10)');

  /* row 1 — hearts, and the combo in the reserved slot on the right */
  for (i = 0; i < p.maxHp; i++) drawHeartIcon(g, 9 + i * 9, 8, i < p.hp);
  if (Game.combo > 1) {
    drawText(g, 'X' + Game.combo, 4 + panelW - 6, 8, 1,
             Game.comboT > 40 ? '#ffb545' : '#7f8fa6', 'right');
  }

  /* row 2 — power gauge, then grenades */
  var gw = 44, gy = 18;
  px(g, 9, gy, gw, 3, '#0d1622');
  var fill = Math.round(gw * clamp(Game.power, 0, 100) / 100);
  if (fill > 0) px(g, 9, gy, fill, 3, Game.power >= 100 ? '#ffd257' : '#54e0ff');
  px(g, 9, gy, gw, 1, 'rgba(255,255,255,0.14)');
  if (Game.power >= 100 && Math.floor(Game.time / 12) % 2 === 0) {
    px(g, 8, gy - 1, gw + 2, 5, 'rgba(255,210,87,0.22)');
  }
  for (i = 0; i < p.maxGrenades; i++) {
    var gx = 58 + i * 6;
    var live = i < p.grenades;
    rr(g, gx, 17.5, 4, 4.5, 1.4, live ? '#8fe3f5' : '#1b2836');
    if (live) px(g, gx + 1.5, 16.5, 1, 1.4, '#c9f4ff');
  }

  /* row 3 — lives, weapon icon, weapon name */
  /* a tiny commando bust marks the life count, so it is never confused with
     the combo counter on the row above */
  px(g, 10, 26, 4, 3, '#9fb2c6');
  px(g, 9, 29, 6, 5, '#9fb2c6');
  px(g, 11, 27, 1, 1, '#0a0e16');
  drawText(g, livesTxt, 17, 27, 1, '#9fb2c6');
  var ix = 17 + textWidth(livesTxt, 1) + 8;
  drawWeaponIcon(g, p.weapon, ix + 4.5, 31, 10, wpn.color);
  drawText(g, wpn.name, ix + 14, 27, 1, wpn.color);
  if (showAuto) {
    drawText(g, 'AUTO', ix + 14 + textWidth(wpn.name, 1) + 3, 27, 1,
             p.autoAiming ? '#54ffa8' : '#3f5d6b');
  }

  /* player two's hearts, in their own panel */
  if (Game.coop && Game.players[1]) {
    var p2h = Game.players[1];
    var py = 46;
    var p2w = Math.max(52, p2h.maxHp * 9 + 8);
    rr(g, 4, py, p2w, 16, 4, 'rgba(4,8,14,0.62)');
    rr(g, 4, py, p2w, 16, 4, 'rgba(84,224,255,0.10)');
    for (i = 0; i < p2h.maxHp; i++) drawHeartIcon(g, 9 + i * 9, py + 4, i < p2h.hp, '#54e0ff');
    drawText(g, p2h.downed ? 'DOWN' : 'P2', p2w + 8, py + 5, 1,
             p2h.downed ? '#ff4d6d' : '#54e0ff');
  }

  g.restore();

  /* ---- score, right aligned, in its own panel ---- */
  g.save();
  g.translate(W, 0);
  g.scale(k, k);
  /* on a phone the words cost more than they explain */
  var sc = (W < 380 ? '' : 'SCORE ') + String(Game.score).padStart(7, '0');
  var hi = (W < 380 ? '' : 'HI ') + String(Math.max(Game.hiScore, Game.score)).padStart(7, '0');
  var sw = Math.max(textWidth(sc, 1), textWidth(hi, 1)) + 12;
  Game.debugRects = Game.debugRects || {};
  Game.debugRects.score = { x: W - sw - 4, y: 4, w: sw, h: 24 };
  rr(g, -sw - 4, 4, sw, 24, 4, 'rgba(4,8,14,0.62)');
  rr(g, -sw - 4, 4, sw, 24, 4, 'rgba(255,255,255,0.05)');
  drawText(g, sc, -10, 9, 1, '#ffffff', 'right');
  drawText(g, hi, -10, 18, 1, rgba(stage.accent, 0.9), 'right');
  g.restore();

  /* ---- boss bar: never wider than the view ---- */
  var b = Game.boss;
  if (b && !b.dead) {
    var bw = Math.min(250, W - 30), bx = (W - bw) / 2, by = 32;
    drawText(g, b.name, W / 2, by - 9, 1, '#ff4d6d', 'center', 'rgba(0,0,0,0.8)');
    px(g, bx - 1, by - 1, bw + 2, 8, 'rgba(0,0,0,0.7)');
    px(g, bx, by, bw, 6, '#2a0d16');
    var frac = clamp(b.hp / b.maxHp, 0, 1);
    px(g, bx, by, bw * frac, 6, b.phase === 2 ? '#ff5c3c' : '#ff2d95');
    px(g, bx, by, bw * frac, 2, '#ffd0e4');
    for (var t = 1; t < 10; t++) px(g, bx + (bw / 10) * t, by, 1, 6, 'rgba(0,0,0,0.4)');
  }

  /* endless wave readout */
  if (Game.mode === 'endless') {
    g.save();
    g.scale(k, k);
    drawText(g, 'WAVE ' + Math.max(1, Game.wave) + (Game.waveActive ? '' : '  NEXT...'),
             7, 38, 1, '#ff2d95');
    drawText(g, 'x' + (Game.scoreMul || 1).toFixed(2), 7, 47, 1, '#ffd257');
    g.restore();
  }

  /* replay watermark */
  if (Game.replayMode) {
    var on = Math.floor(Game.time / 40) % 2 === 0;
    g.globalAlpha = on ? 0.9 : 0.55;
    drawText(g, 'REPLAY', W - 8, H - 16, 1, '#ff2d95', 'right', 'rgba(0,0,0,0.8)');
    g.globalAlpha = 1;
  }

  /* banner */
  if (Game.banner) {
    var bn = Game.banner;
    var life = bn.life;
    var alpha = life > 110 ? (130 - life) / 20 : clamp(life / 30, 0, 1);
    g.globalAlpha = clamp(alpha, 0, 1);
    drawFit(g, bn.text, 96, 3, bn.color || '#ffffff', 'rgba(0,0,0,0.85)', W - 16);
    drawText(g, bn.sub, W / 2, 124, 1, '#cfd8e3', 'center', 'rgba(0,0,0,0.85)');
    g.globalAlpha = 1;
  }
}

/* ---- screens ------------------------------------------------------------ */
function dim(g, a) {
  g.fillStyle = 'rgba(3,5,10,' + a + ')';
  g.fillRect(0, 0, W, H);
}

function drawTitle(g) {
  var t = PARAMS.shot ? 12 : Game.stateTimer;
  Game.hitRows = [];
  /* drifting background of era one */
  Game.camX = (t * 0.35) % (STAGES[0].length - W);
  drawSky(g, STAGES[0], Game.bg, Game.camX, t);
  drawBackground(g, STAGES[0], Game.bg, Game.camX, t);
  drawGround(g, STAGES[0], Game.bg, Game.camX);
  dim(g, 0.55);

  /* title */
  var bob = Math.sin(t * 0.03) * 2;
  g.globalAlpha = 0.25;
  drawFit(g, 'EON', 42 + bob, 5, '#ff5c3c', null, W - 14);
  drawFit(g, 'COMMANDO', 82 + bob, 5, '#ff5c3c', null, W - 14);
  g.globalAlpha = 1;
  drawFit(g, 'EON', 40 + bob, 5, '#ffd257', '#3a1f24', W - 14);
  drawFit(g, 'COMMANDO', 80 + bob, 5, '#ffb545', '#3a1f24', W - 14);

  drawText(g, narrow ? 'THREE ERAS. NO MERCY.' : 'THREE ERAS. ONE COMMANDO. NO MERCY.',
           W / 2, 122, 1, '#9fb2c6', 'center');

  /* mode menu — tappable, and arrow-key navigable */
  var rows = Game.titleRows();
  var step = narrow ? 19 : 17;
  var y = narrow ? 138 : 140;
  for (var ri = 0; ri < rows.length; ri++) {
    var sel = ri === Game.titleIndex;
    if (sel) px(g, W / 2 - 74, y - 5, 148, step - 3, 'rgba(84,224,255,0.14)');
    drawText(g, (sel ? '> ' : '') + rows[ri].label, W / 2, y, 1,
             sel ? '#ffffff' : '#9fb2c6', 'center');
    Game.hitRows.push({ y0: y - 6, y1: y + 9, i: ri });
    y += step;
  }

  /* blinking prompt */
  var narrow = W < 380;
  if (SET.autoFire) drawText(g, 'AUTO-FIRE ON', W / 2, 116, 1, '#54ffa8', 'center');
  drawText(g, (Game.dailyRun ? 'DAILY RUN ' + Daily.label() + '  ·  ' : 'DIFFICULTY ') +
              (Game.dailyRun ? DIFFICULTY[clamp(SET.difficulty, 0, 2)].name : DIFFICULTY[clamp(SET.difficulty, 0, 2)].name),
           W / 2, 216, 1, '#54e0ff', 'center');

  drawText(g, 'HI SCORE ' + String(Game.hiScore).padStart(7, '0'), W / 2, 232, 1, '#ffd257', 'center');
  var runs = Scores.all().slice(0, 3);
  for (var li = 0; li < runs.length; li++) {
    drawText(g, (li + 1) + '. ' + String(runs[li].score).padStart(7, '0') + '  ' + (runs[li].result || ''),
             W / 2, 242 + li * 9, 1, '#54637a', 'center');
  }
  drawText(g, narrow ? ('V' + VERSION + '  ·  ONE FILE')
                     : ('V' + VERSION + '  ·  ONE HTML FILE  ·  ZERO DEPENDENCIES'),
           W / 2, 250, 1, '#3f4d61', 'center');
}

function drawPause(g) {
  dim(g, 0.78);
  drawFit(g, 'PAUSED', 22, 3, '#54e0ff', 'rgba(0,0,0,0.85)', W - 16);
  var rows = Game.pauseRows();
  Game.hitRows = [];
  var narrow = W < 380;
  var step = narrow ? 25 : 18;
  var band = narrow ? 11 : 6;
  var y = narrow ? 60 : 64, i;
  for (i = 0; i < rows.length; i++) {
    var sel = i === Game.pauseIndex;
    if (sel) px(g, narrow ? 20 : 40, y - band, W - (narrow ? 40 : 80), band * 2, 'rgba(84,224,255,0.16)');
    drawText(g, rows[i].label, W / 2, y, 1, sel ? '#ffffff' : '#9fb2c6', 'center');
    Game.hitRows.push({ y0: y - band, y1: y + band, i: i });
    y += step;
  }
  drawText(g, 'TAP A ROW  ·  P TO RESUME', W / 2, H - 16, 1, '#54637a', 'center');
}

function drawSettings(g) {
  dim(g, 0.82);
  Game.hitRows = [];
  drawText(g, 'SETTINGS', W / 2, 26, 3, '#54e0ff', 'center', 'rgba(0,0,0,0.85)');
  var rows = [
    ['DIFFICULTY', DIFFICULTY[clamp(SET.difficulty, 0, 2)].name],
    ['COLOURS', SCHEMES[clamp(SET.palette, 0, 2)].name],
    ['REDUCE MOTION', SET.reduceMotion ? 'ON' : 'OFF'],
    ['FLASH', Math.round(SET.flash * 100) + '%'],
    ['HUD SIZE', Math.round(SET.hudScale * 100) + '%'],
    ['MUSIC', Math.round(SET.music * 100) + '%'],
    ['SOUND FX', Math.round(SET.sfx * 100) + '%'],
    ['AUTO FIRE', SET.autoFire ? 'ON' : 'OFF'],
    ['CONTROLS', 'OPEN >'],
    ['PADS', 'OPEN >']
  ];
  var narrow = W < 380;
  var padX = narrow ? 26 : 76;
  var y = narrow ? 60 : 64;
  for (var i = 0; i < rows.length; i++) {
    var sel = i === Game.settingsIndex;
    if (sel) {
      px(g, padX - 16, y - 4, W - (padX - 16) * 2, 14, 'rgba(84,224,255,0.14)');
      drawText(g, '>', padX - 12, y, 1, '#54e0ff');
    }
    drawText(g, rows[i][0], padX, y, 1, sel ? '#ffffff' : '#9fb2c6');
    drawText(g, rows[i][1], W - padX, y, 1, sel ? '#ffd257' : '#7f8fa6', 'right');
    Game.hitRows.push({ y0: y - 7, y1: y + 10, i: i });
    y += narrow ? 16 : 17;
  }
  if (narrow) {
    drawText(g, 'UP/DOWN CHOOSE  LEFT/RIGHT SET', W / 2, H - 32, 1, '#54637a', 'center');
    drawText(g, 'P OR ESC TO RESUME', W / 2, H - 20, 1, '#54637a', 'center');
  } else {
    drawText(g, 'UP / DOWN TO CHOOSE   LEFT / RIGHT TO CHANGE', W / 2, H - 34, 1, '#54637a', 'center');
    drawText(g, 'P OR ESC TO RESUME', W / 2, H - 22, 1, '#54637a', 'center');
  }
}

function keyLabel(code) {
  if (!code) return '---';
  if (code.indexOf('Key') === 0) return code.slice(3);
  if (code.indexOf('Digit') === 0) return code.slice(5);
  var m = {
    ArrowLeft: '\u25C0', ArrowRight: '\u25B6', ArrowUp: '\u25B2', ArrowDown: '\u25BC',
    Space: 'SPACE', Enter: 'ENTER', Escape: 'ESC', Backspace: 'BKSP', Tab: 'TAB',
    ShiftLeft: 'L-SHIFT', ShiftRight: 'R-SHIFT', ControlLeft: 'L-CTRL',
    ControlRight: 'R-CTRL', Period: 'PERIOD', Comma: 'COMMA', Slash: 'SLASH',
    Semicolon: 'SEMI', Quote: 'QUOTE', NumpadEnter: 'NP-ENTER'
  };
  return m[code] || code.toUpperCase();
}

function drawRemap(g) {
  dim(g, 0.85);
  Game.hitRows = [];
  var narrow = W < 380;
  drawFit(g, 'CONTROLS', 20, 3, '#54e0ff', 'rgba(0,0,0,0.85)', W - 16);

  var who = Game.remapPlayer === 'p1' ? 'PLAYER 1' : 'PLAYER 2';
  drawText(g, '< ' + who + ' >', W / 2, 44, 1, '#ffd257', 'center');

  var acts = Game.REMAP_ACTIONS;
  var y = 62;
  var padX = narrow ? 26 : 60;
  for (var i = 0; i < acts.length; i++) {
    var sel = i === Game.remapIndex;
    var act = acts[i];
    var bound = (Input.BINDINGS[Game.remapPlayer][act] || [])[0];
    if (sel) {
      px(g, padX - 14, y - 4, W - (padX - 14) * 2, 13, 'rgba(84,224,255,0.14)');
      drawText(g, '>', padX - 10, y, 1, '#54e0ff');
    }
    drawText(g, act.toUpperCase(), padX, y, 1, sel ? '#ffffff' : '#9fb2c6');
    var listening = Input.listening && Input.listening.action === act &&
                    Input.listening.player === Game.remapPlayer;
    drawText(g, listening ? 'PRESS A KEY' : keyLabel(bound),
             W - padX, y, 1, listening ? '#ff4d6d' : (sel ? '#ffd257' : '#7f8fa6'), 'right');
    Game.hitRows.push({ y0: y - 7, y1: y + 9, i: i });
    y += narrow ? 15 : 16;
  }

  drawText(g, 'ENTER REBIND   R RESET', W / 2, H - 30, 1, '#54637a', 'center');
  drawText(g, 'LEFT/RIGHT SWITCH PLAYER   P BACK', W / 2, H - 19, 1, '#54637a', 'center');
}

/* ---- story panel -------------------------------------------------------- */
/* wrap by measured width, not character count — a character-count wrap is only
   correct for one font size and one panel width, which is how cutscene text
   ended up outside its box on a phone */
function wrapTextPx(str, maxPx, scale) {
  scale = scale || 1;
  var words = String(str).toUpperCase().split(' '), lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (textWidth(t, scale) > maxPx && cur) { lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function wrapText(str, max) {
  var words = String(str).split(' '), lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (t.length > max) { if (cur) lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* draw a heading at the largest scale that still fits the view */
function drawFit(g, str, y, preferred, color, shadow, maxW) {
  str = String(str).toUpperCase();
  var limit = maxW || (W - 16);
  var sc = preferred || 3;
  while (sc > 1 && textWidth(str, sc) > limit) sc--;
  drawText(g, str, W / 2, y, sc, color, 'center', shadow);
  return sc;
}

function drawStory(g) {
  var st = Game.story;
  if (!st || !st[Game.storyIndex]) return;
  var line = st[Game.storyIndex];
  var narrow = W < 380;

  dim(g, 0.82);

  /* The panel belongs inside the play band, not floating over the letterboxed
     ground on a portrait phone. */
  var bandH = Math.min(H, GROUND_Y + 26);
  var padX = narrow ? 10 : 34;
  var boxW = W - padX * 2;
  var pw = narrow ? 30 : 44;
  var tx = padX + pw + 16;
  var textW = padX + boxW - 8 - tx;          /* the column the text may use */

  var lines = wrapTextPx(line.text, textW, 1);
  var lineH = narrow ? 11 : 12;
  var boxH = Math.max(narrow ? 74 : 76, 44 + lines.length * lineH);
  var boxY = clamp(bandH - boxH - 8, 6, H - boxH - 6);
  Game.debugRects = { story: { x: padX, y: boxY, w: boxW, h: boxH, tx: tx, textW: textW } };

  px(g, padX, boxY, boxW, boxH, 'rgba(6,9,14,0.94)');
  g.strokeStyle = '#22344a';
  g.lineWidth = 1;
  g.strokeRect(padX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
  px(g, padX, boxY, boxW, 2, line.who === 'YOU' ? '#54e0ff' : '#ff2d95');

  /* portrait plate */
  px(g, padX + 8, boxY + 10, pw, pw, '#0b1220');
  g.strokeStyle = '#1b2839';
  g.strokeRect(padX + 8.5, boxY + 10.5, pw - 1, pw - 1);
  if (line.who === 'YOU') {
    var ghost = { x: padX + 8 + pw / 2 - 6, y: boxY + 12, w: 12, h: 22, facing: 1, aimAngle: 0,
                  onGround: true, ducking: false, runPhase: 0, invuln: 0, hurtFlash: 0, vx: 0 };
    g.save();
    g.translate(0, 6);
    drawPlayer(g, ghost);
    g.restore();
  } else {
    g.fillStyle = line.who === 'CONTROL' ? '#54e0ff' : '#ff2d95';
    g.beginPath();
    var cx0 = padX + 8 + pw / 2, cy0 = boxY + 10 + pw / 2;
    g.moveTo(cx0, cy0 - pw * 0.3);
    g.lineTo(cx0 + pw * 0.3, cy0);
    g.lineTo(cx0, cy0 + pw * 0.3);
    g.lineTo(cx0 - pw * 0.3, cy0);
    g.closePath();
    g.fill();
  }

  drawText(g, line.who, tx, boxY + 10, 1, line.who === 'YOU' ? '#54e0ff' : '#ff2d95');

  var budget = Math.floor(Game.storyChars);
  var ty = boxY + 26;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    var part = l.length <= budget ? l : l.slice(0, Math.max(0, budget));
    budget -= l.length + 1;
    if (part.length) drawText(g, part, tx, ty, 1, '#e6edf5');
    ty += lineH;
  }

  if (Game.storyChars >= line.text.length && Math.floor(Game.time / 20) % 2 === 0) {
    drawText(g, narrow ? 'TAP' : 'ENTER / TAP', padX + boxW - 10, boxY + boxH - 12, 1, '#54637a', 'right');
  }
  drawText(g, (Game.storyIndex + 1) + '/' + st.length, padX + 10, boxY + boxH - 12, 1, '#38465a');
}

/* ---- credits ------------------------------------------------------------ */
var CREDIT_LINES = [
  'EON COMMANDO',
  '',
  'A RUN-AND-GUN IN ONE HTML FILE',
  '',
  '',
  'DESIGN AND CODE',
  'DR SOHIL MOMIN',
  '',
  'ART',
  'DRAWN AT RUNTIME FROM PATHS',
  'NO IMAGE FILES',
  '',
  'AUDIO',
  'TWO PULSE LEADS, A TRIANGLE BASS',
  'AND A NOISE KIT, SYNTHESISED LIVE',
  '',
  'ENGINEERING',
  'FIXED 60 HZ STEP',
  'SEEDED DETERMINISTIC SIMULATION',
  '573 DRAW CALLS PER FRAME',
  '',
  'TESTING',
  'HEADLESS CHROMIUM HARNESS',
  'PIXEL DIFFS, REPLAY VERIFICATION',
  '',
  '',
  'THANK YOU FOR PLAYING',
  '',
  'POLYFORM NONCOMMERCIAL 1.0.0',
  '',
  'DRSAMONLINE.GITHUB.IO'
];

function drawCredits(g) {
  px(g, 0, 0, W, H, '#05070d');
  var narrow = W < 380;
  var y = H - Game.creditsY;
  for (var i = 0; i < CREDIT_LINES.length; i++) {
    var line = CREDIT_LINES[i];
    var ly = y + i * (narrow ? 12 : 14);
    if (ly > -12 && ly < H - 12 && line.length) {
      var big = (i === 0);
      drawText(g, line, W / 2, ly, big ? 3 : 1,
               big ? '#ffb545' : (line === line.toUpperCase() && line.length > 2 && i % 2 === 0 ? '#54e0ff' : '#9fb2c6'),
               'center');
    }
  }
  drawText(g, 'ENTER TO RETURN', W / 2, H - 12, 1, '#38465a', 'center');
}

function drawLan(g) {
  dim(g, 0.86);
  Game.hitRows = [];
  var narrow = W < 380;

  drawFit(g, 'LAN CO-OP', narrow ? 30 : 34, 3, '#54e0ff', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, 'TWO PLAYERS ON THE SAME WI-FI', W / 2, narrow ? 54 : 58, 1, '#9fb2c6', 'center');

  var y = narrow ? 76 : 80;

  if (LAN.active) {
    drawText(g, 'CONNECTED', W / 2, y, 1, '#54ffa8', 'center');
    drawText(g, 'PLAYER 1 HOSTS  ·  PLAYER 2 JOINS', W / 2, y + 14, 1, '#54637a', 'center');
    return;
  }

  var btnW = narrow ? (W - 36) / 2 : 116;
  var btnH = narrow ? 30 : 26;
  var gap = 10;
  var totalW = btnW * 2 + gap;
  var bx = (W - totalW) / 2;

  px(g, bx, y, btnW, btnH, 'rgba(84,224,255,0.14)');
  g.strokeStyle = '#2f6f8f'; g.lineWidth = 1;
  g.strokeRect(bx + 0.5, y + 0.5, btnW - 1, btnH - 1);
  drawText(g, 'HOST', bx + btnW / 2, y + 9, 1, '#54e0ff', 'center');
  Game.hitRows.push({ x0: bx, x1: bx + btnW, y0: y, y1: y + btnH, i: 0 });

  px(g, bx + btnW + gap, y, btnW, btnH, 'rgba(255,181,69,0.12)');
  g.strokeStyle = '#7a5a2a';
  g.strokeRect(bx + btnW + gap + 0.5, y + 0.5, btnW - 1, btnH - 1);
  drawText(g, 'JOIN', bx + btnW + gap + btnW / 2, y + 9, 1, '#ffb545', 'center');
  Game.hitRows.push({ x0: bx + btnW + gap, x1: bx + btnW * 2 + gap, y0: y, y1: y + btnH, i: 1 });

  drawText(g, LAN.status || 'IDLE', W / 2, y + btnH + 12, 1,
           LAN.conn ? '#54ffa8' : '#7f8fa6', 'center');

  drawText(g, 'START THE HOST WITH  node server.js', W / 2, H - 40, 1, '#54637a', 'center');
  drawText(g, 'THEN OPEN THE ADDRESS IT PRINTS', W / 2, H - 28, 1, '#54637a', 'center');
  drawText(g, 'ESC TO GO BACK', W / 2, H - 14, 1, '#38465a', 'center');
}

function drawPerk(g) {
  dim(g, 0.84);
  Game.hitRows = [];
  var narrow = W < 380;

  drawFit(g, 'CHOOSE A PERK', narrow ? 26 : 30, 3, '#ffd257', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, narrow ? 'TAKE ONE THING WITH YOU' : 'THE ERA IS HELD. TAKE ONE THING WITH YOU.',
           W / 2, narrow ? 48 : 56, 1, '#9fb2c6', 'center');

  var picks = Game.perkChoices;
  var n = picks.length;
  if (!n) return;
  var i;

  if (narrow) {
    /* Three narrow columns leave ~49 px of text on a phone — not enough for a
       single word like OVERCHARGE. Stack them full width instead. */
    var cardW2 = W - 20;
    var cardH2 = 36;
    var gapY = 5;
    var y2 = 62;
    for (i = 0; i < n; i++) {
      var pk2 = picks[i];
      var sel2 = i === Game.perkIndex;
      var cy2 = y2 + i * (cardH2 + gapY);
      px(g, 10, cy2, cardW2, cardH2, sel2 ? 'rgba(30,44,60,0.96)' : 'rgba(12,18,26,0.92)');
      g.strokeStyle = sel2 ? pk2.color : '#22344a';
      g.lineWidth = sel2 ? 2 : 1;
      g.strokeRect(10.5, cy2 + 0.5, cardW2 - 1, cardH2 - 1);
      px(g, 10, cy2, 3, cardH2, pk2.color);

      drawText(g, pk2.name, 18, cy2 + 7, 1, '#ffffff');
      drawText(g, pk2.tag, 10 + cardW2 - 8, cy2 + 7, 1, pk2.color, 'right');
      var dLines = wrapTextPx(pk2.desc, cardW2 - 20, 1);
      for (var d = 0; d < dLines.length && d < 2; d++) {
        drawText(g, dLines[d], 18, cy2 + 19 + d * 9, 1, '#9fb2c6');
      }
      Game.hitRows.push({ x0: 10, x1: 10 + cardW2, y0: cy2, y1: cy2 + cardH2, i: i });
    }
    drawText(g, 'TAP A CARD', W / 2, y2 + n * (cardH2 + gapY) + 10, 1, '#54637a', 'center');
    return;
  }

  var gap = 10;
  var cardW = Math.min(132, (W - 60 - gap * (n - 1)) / n);
  var cardH = 120;
  var totalW = cardW * n + gap * (n - 1);
  var x0 = (W - totalW) / 2;
  var y0 = 74;

  for (i = 0; i < n; i++) {
    var pk = picks[i];
    var sel = i === Game.perkIndex;
    var cx = x0 + i * (cardW + gap);

    px(g, cx, y0, cardW, cardH, sel ? 'rgba(30,44,60,0.96)' : 'rgba(12,18,26,0.92)');
    g.strokeStyle = sel ? pk.color : '#22344a';
    g.lineWidth = sel ? 2 : 1;
    g.strokeRect(cx + 0.5, y0 + 0.5, cardW - 1, cardH - 1);
    px(g, cx, y0, cardW, 2, pk.color);

    var tagLines = wrapTextPx(pk.tag, cardW - 12, 1);
    var ty = y0 + 8;
    for (var tl = 0; tl < tagLines.length && tl < 2; tl++) {
      drawText(g, tagLines[tl], cx + 6, ty, 1, pk.color);
      ty += 9;
    }

    var nameLines = wrapTextPx(pk.name, cardW - 12, 1);
    var ny = ty + 6;
    for (var nl = 0; nl < nameLines.length && nl < 2; nl++) {
      drawText(g, nameLines[nl], cx + 6, ny, 1, '#ffffff');
      ny += 10;
    }

    var descLines = wrapTextPx(pk.desc, cardW - 12, 1);
    var dy = ny + 6;
    var room = Math.floor((y0 + cardH - 16 - dy) / 9);
    for (var dl = 0; dl < descLines.length && dl < room; dl++) {
      drawText(g, descLines[dl], cx + 6, dy, 1, '#9fb2c6');
      dy += 9;
    }

    if (sel) px(g, cx + cardW / 2 - 10, y0 + cardH - 12, 20, 2, pk.color);
    Game.hitRows.push({ x0: cx, x1: cx + cardW, y0: y0, y1: y0 + cardH, i: i });
  }

  drawText(g, '\u25C0 \u25B6  CHOOSE     ENTER  TAKE', W / 2, y0 + cardH + 12, 1, '#54637a', 'center');
}

function drawPads(g) {
  dim(g, 0.72);
  drawFit(g, 'PAD LAYOUT', 40, 3, '#54e0ff', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, 'DRAG EACH CLUSTER WITH YOUR THUMB', W / 2, 74, 1, '#9fb2c6', 'center');
  drawText(g, 'THEN TAP DONE ABOVE', W / 2, 88, 1, '#54637a', 'center');
}

function drawStageClear(g) {
  dim(g, 0.6);
  var t = Game.stateTimer;
  drawFit(g, 'ERA CLEARED', 78, 4, '#54ffa8', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, Game.stage.name, W / 2, 116, 1, '#cfd8e3', 'center');
  var r = Game.lastRun;
  if (r) {
    drawText(g, 'CLEAR BONUS', W / 2, 140, 1, '#9fb2c6', 'center');
    drawText(g, '+' + r.bonus, W / 2, 154, 2, '#ffd257', 'center', 'rgba(0,0,0,0.8)');
  }
  drawText(g, 'SCORE ' + String(Game.score).padStart(7, '0'), W / 2, 184, 1, '#ffffff', 'center');
  if (t > 100 && Math.floor(t / 20) % 2 === 0) {
    drawText(g, Game.stageIndex + 1 < STAGES.length ? 'ADVANCING...' : 'FINAL ERA COMPLETE', W / 2, 212, 1, '#54e0ff', 'center');
  }
}

function drawGameOver(g) {
  dim(g, 0.72);
  drawFit(g, 'GAME OVER', 88, 4, '#ff4d6d', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, 'THE EON ENDURES WITHOUT YOU', W / 2, 126, 1, '#9fb2c6', 'center');
  drawFit(g, 'SCORE ' + String(Game.score).padStart(7, '0'), 150, 2, '#ffffff', 'rgba(0,0,0,0.8)', W - 16);
  drawText(g, 'HI SCORE ' + String(Game.hiScore).padStart(7, '0'), W / 2, 176, 1, '#ffd257', 'center');
  var board = Scores.all().slice(0, 3);
  for (var bi = 0; bi < board.length; bi++) {
    drawText(g, (bi + 1) + '. ' + String(board[bi].score).padStart(7, '0'),
             W / 2, 190 + bi * 9, 1, '#54637a', 'center');
  }
  if (Math.floor(Game.stateTimer / 30) % 2 === 0) {
    drawText(g, 'ENTER / TAP TO REDEPLOY', W / 2, 208, 1, '#54e0ff', 'center');
  }
}

function drawVictory(g) {
  dim(g, 0.68);
  var t = Game.stateTimer;
  drawFit(g, 'EON SECURED', 74, 4, '#ffd257', 'rgba(0,0,0,0.85)', W - 16);
  drawText(g, 'ALL SIX ERAS CLEARED', W / 2, 112, 1, '#cfd8e3', 'center');
  drawFit(g, 'FINAL SCORE ' + String(Game.score).padStart(7, '0'), 140, 2, '#ffffff', 'rgba(0,0,0,0.8)', W - 16);
  if (Game.score >= Game.hiScore) {
    drawText(g, 'NEW HIGH SCORE', W / 2, 168, 1, '#54ffa8', 'center');
  }
  if (Math.floor(t / 30) % 2 === 0) {
    drawText(g, 'ENTER / TAP TO RUN IT AGAIN', W / 2, 200, 1, '#54e0ff', 'center');
  }
}

/* ---- scanlines + vignette ---------------------------------------------- */
var Scan = { canvas: null };
function buildScanlines() {
  var c = document.createElement('canvas');
  c.width = W; c.height = VIEW_H;
  var g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.16)';
  for (var y = 0; y < VIEW_H; y += 3) g.fillRect(0, y, W, 1);
  Scan.canvas = c;
}

/* ---- master draw ------------------------------------------------------- */
function Render(g) {
  var shakeX = 0, shakeY = 0;
  if (Game.shake > 0.2 && !SET.reduceMotion) {
    shakeX = RNG.fr(-Game.shake, Game.shake);
    shakeY = RNG.fr(-Game.shake, Game.shake) * 0.7;
  }

  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, W, VIEW_H);

  /* portrait: fill the whole canvas with the era sky before the band goes down */
  if (VIEW_H !== H) {
    var skg = g.createLinearGradient(0, 0, 0, VIEW_H);
    var st = Game.stage;
    skg.addColorStop(0, st.sky[0]);
    skg.addColorStop(0.55, st.sky[1]);
    skg.addColorStop(1, st.sky[2]);
    g.fillStyle = skg;
    g.fillRect(0, 0, W, VIEW_H);
  }

  if (Game.state === 'title') {
    g.save();
    g.translate(0, Y0);
    drawTitle(g);
    g.restore();
  } else {
    g.save();
    g.translate(0, Y0);
    g.translate(Math.round(shakeX), Math.round(shakeY));
    drawWorld(g);
    g.restore();
    if (Game.state === 'playing' || Game.state === 'stageclear' ||
        Game.state === 'gameover' || Game.state === 'victory' || Game.state === 'story') {
      g.save();
      g.translate(0, Y0);
      drawHUD(g);
      g.restore();
    }

    g.save();
    g.translate(0, Y0);
    if (Game.state === 'paused') drawPause(g);
    else if (Game.state === 'settings') drawSettings(g);
    else if (Game.state === 'remap') drawRemap(g);
    else if (Game.state === 'pads') drawPads(g);
    else if (Game.state === 'perk') drawPerk(g);
    else if (Game.state === 'lan') drawLan(g);
    else if (Game.state === 'story') drawStory(g);
    else if (Game.state === 'credits') drawCredits(g);
    else if (Game.state === 'stageclear') drawStageClear(g);
    else if (Game.state === 'gameover') drawGameOver(g);
    else if (Game.state === 'victory') drawVictory(g);
    g.restore();
  }

  /* hit flash, scaled by the photosensitivity setting */
  if (Game.flash > 0.01 && !SET.reduceMotion && SET.flash > 0) {
    g.fillStyle = 'rgba(255,255,255,' + (Game.flash * 0.5 * SET.flash) + ')';
    g.fillRect(0, 0, W, VIEW_H);
  }

  /* debug overlay */
  if (PARAMS.fps) {
    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillRect(0, H - 26, 118, 24);
    drawText(g, 'FPS ' + Math.round(Perf.fps), 4, H - 23, 1, '#54ffa8');
    drawText(g, 'MS ' + Perf.ms.toFixed(2), 4, H - 14, 1, '#9fb2c6');
    drawText(g, 'E' + Game.enemies.length + ' B' + Game.bullets.length + ' P' + Game.particles.length, 58, H - 23, 1, '#7f8fa6');
    drawText(g, 'H' + Game.hazards.length, 58, H - 14, 1, '#7f8fa6');
  }

  /* scanlines */
  if (Scan.canvas && !SET.reduceMotion) {
    g.globalAlpha = 0.5;
    g.drawImage(Scan.canvas, 0, 0, W, VIEW_H);
    g.globalAlpha = 1;
  }

  /* vignette */
  var vg = g.createRadialGradient(W / 2, VIEW_H / 2, VIEW_H * 0.35, W / 2, VIEW_H / 2, VIEW_H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, VIEW_H);
}
