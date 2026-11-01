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

function drawSky(g, stage, bg, camX, time) {
  var grad = g.createLinearGradient(0, 0, 0, GROUND_Y + 20);
  grad.addColorStop(0, stage.sky[0]);
  grad.addColorStop(0.55, stage.sky[1]);
  grad.addColorStop(1, stage.sky[2]);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

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
  g.fillStyle = 'rgba(0,0,0,0.82)';
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
    g.fill();
  }
  /* rubble along the bottom edge */
  g.fillStyle = 'rgba(0,0,0,0.55)';
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
  drawSky(g, stage, bg, camX, Game.time);
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
  var c = full ? (tint || '#ff4d6d') : '#31161f';
  var c2 = full ? (tint ? '#d8f8ff' : '#ffd0d8') : '#20101a';
  px(g, x + 1, y, 2, 1, c); px(g, x + 4, y, 2, 1, c);
  px(g, x, y + 1, 7, 2, c);
  px(g, x + 1, y + 3, 5, 1, c);
  px(g, x + 2, y + 4, 3, 1, c);
  px(g, x + 3, y + 5, 1, 1, c);
  px(g, x + 1, y + 1, 1, 1, c2);
}

var HUDS = { score: '', hi: '', lives: '', weapon: '' };

function drawHUD(g) {
  var p = Game.player;
  var stage = Game.stage;
  var k = clamp(SET.hudScale || 1, 0.85, 1.3);

  /* top bar */
  var grad = g.createLinearGradient(0, 0, 0, 26 * k);
  grad.addColorStop(0, 'rgba(3,5,10,0.82)');
  grad.addColorStop(1, 'rgba(3,5,10,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, 26 * k);

  var i;
  /* left cluster */
  g.save();
  g.scale(k, k);
  for (i = 0; i < p.maxHp; i++) drawHeartIcon(g, 7 + i * 10, 6, i < p.hp);
  drawText(g, 'X' + Math.max(0, Game.lives), 7, 16, 1, '#9fb2c6');
  px(g, 21, 15, 7, 2, '#0b0f18');
  px(g, 22, 15, 5, 4, '#3f6b8c');
  px(g, 23, 17, 3, 1, '#ffb545');
  px(g, 21, 19, 7, 2, '#2c4a63');
  /* grenade pips */
  for (i = 0; i < p.maxGrenades; i++) {
    px(g, 34 + i * 6, 16, 4, 4, i < p.grenades ? '#9ef0ff' : '#20303f');
  }
  g.restore();

  /* player two's hearts, tinted, under player one's */
  if (Game.coop && Game.players[1]) {
    var p2h = Game.players[1];
    g.save();
    g.scale(k, k);
    for (i = 0; i < p2h.maxHp; i++) drawHeartIcon(g, 7 + i * 10, 27, i < p2h.hp, '#54e0ff');
    drawText(g, 'P2', 7 + p2h.maxHp * 10 + 3, 28, 1, p2h.downed ? '#ff4d6d' : '#54e0ff');
    g.restore();
  }

  /* right cluster, anchored to the far edge */
  g.save();
  g.translate(W, 0);
  g.scale(k, k);
  var sc = 'SCORE ' + String(Game.score).padStart(7, '0');
  var hi = 'HI ' + String(Math.max(Game.hiScore, Game.score)).padStart(7, '0');
  if (sc !== HUDS.score) { HUDS.score = sc; HUDS.scoreW = textWidth(sc, 1); }
  if (hi !== HUDS.hi) { HUDS.hi = hi; }
  drawText(g, HUDS.score, -7, 6, 1, '#ffffff', 'right', 'rgba(0,0,0,0.7)');
  drawText(g, HUDS.hi, -7, 16, 1, rgba(stage.accent, 0.9), 'right', 'rgba(0,0,0,0.7)');
  g.restore();

  /* weapon chip */
  var w = WEAPONS[p.weapon];
  g.save();
  g.scale(k, k);
  var chipW = textWidth(w.name, 1) + 14;
  px(g, 6, H / k - 18, chipW, 12, 'rgba(3,5,10,0.7)');
  px(g, 6, H / k - 18, 2, 12, w.color);
  drawText(g, w.name, 12, H / k - 15, 1, w.color);
  g.restore();

  /* boss bar */
  var b = Game.boss;
  if (b && !b.dead) {
    var bw = 250, bx = (W - bw) / 2, by = 30;
    drawText(g, b.name, W / 2, by - 9, 1, '#ff4d6d', 'center', 'rgba(0,0,0,0.8)');
    px(g, bx - 1, by - 1, bw + 2, 8, 'rgba(0,0,0,0.7)');
    px(g, bx, by, bw, 6, '#2a0d16');
    var frac = clamp(b.hp / b.maxHp, 0, 1);
    px(g, bx, by, bw * frac, 6, b.phase === 2 ? '#ff5c3c' : '#ff2d95');
    px(g, bx, by, bw * frac, 2, '#ffd0e4');
    for (var t = 1; t < 10; t++) px(g, bx + (bw / 10) * t, by, 1, 6, 'rgba(0,0,0,0.4)');
  }

  /* banner */
  if (Game.banner) {
    var bn = Game.banner;
    var life = bn.life;
    var alpha = life > 110 ? (130 - life) / 20 : clamp(life / 30, 0, 1);
    g.globalAlpha = clamp(alpha, 0, 1);
    drawText(g, bn.text, W / 2, 96, 3, bn.color || '#ffffff', 'center', 'rgba(0,0,0,0.85)');
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
  /* drifting background of era one */
  Game.camX = (t * 0.35) % (STAGES[0].length - W);
  drawSky(g, STAGES[0], Game.bg, Game.camX, t);
  drawBackground(g, STAGES[0], Game.bg, Game.camX, t);
  drawGround(g, STAGES[0], Game.bg, Game.camX);
  dim(g, 0.55);

  /* title */
  var bob = Math.sin(t * 0.03) * 2;
  g.globalAlpha = 0.25;
  drawText(g, 'EON', W / 2 + 2, 42 + bob, 5, '#ff5c3c', 'center');
  drawText(g, 'COMMANDO', W / 2 + 2, 82 + bob, 5, '#ff5c3c', 'center');
  g.globalAlpha = 1;
  drawText(g, 'EON', W / 2, 40 + bob, 5, '#ffd257', 'center', '#3a1f24');
  drawText(g, 'COMMANDO', W / 2, 80 + bob, 5, '#ffb545', 'center', '#3a1f24');

  drawText(g, 'THREE ERAS. ONE COMMANDO. NO MERCY.', W / 2, 124, 1, '#9fb2c6', 'center');

  /* blinking prompt */
  if (Math.floor(t / 30) % 2 === 0) {
    drawText(g, 'PRESS ENTER  ·  TAP TO START', W / 2, 152, 2, '#54e0ff', 'center', 'rgba(0,0,0,0.8)');
  }

  drawText(g, 'ARROWS / WASD MOVE   SPACE JUMP   Z FIRE', W / 2, 190, 1, '#7f8fa6', 'center');
  drawText(g, 'SHIFT DASH   V MELEE   G GRENADE   O SETTINGS', W / 2, 202, 1, '#7f8fa6', 'center');
  drawText(g, 'DIFFICULTY ' + DIFFICULTY[clamp(SET.difficulty, 0, 2)].name, W / 2, 216, 1, '#54e0ff', 'center');
  drawText(g, 'PRESS 2 FOR TWO PLAYERS', W / 2, 176, 1, '#54ffa8', 'center');
  drawText(g, 'HI SCORE ' + String(Game.hiScore).padStart(7, '0'), W / 2, 232, 1, '#ffd257', 'center');
  var runs = Scores.all().slice(0, 3);
  for (var li = 0; li < runs.length; li++) {
    drawText(g, (li + 1) + '. ' + String(runs[li].score).padStart(7, '0') + '  ' + (runs[li].result || ''),
             W / 2, 242 + li * 9, 1, '#54637a', 'center');
  }
  drawText(g, 'V' + VERSION + '  ·  ONE HTML FILE  ·  ZERO DEPENDENCIES', W / 2, 250, 1, '#3f4d61', 'center');
}

function drawPause(g) {
  dim(g, 0.62);
  drawText(g, 'PAUSED', W / 2, 100, 4, '#54e0ff', 'center', 'rgba(0,0,0,0.8)');
  drawText(g, 'P OR ESC TO RESUME', W / 2, 140, 1, '#cfd8e3', 'center');
  drawText(g, 'M MUTES AUDIO', W / 2, 154, 1, '#7f8fa6', 'center');
}

function drawSettings(g) {
  dim(g, 0.82);
  drawText(g, 'SETTINGS', W / 2, 26, 3, '#54e0ff', 'center', 'rgba(0,0,0,0.85)');
  var rows = [
    ['DIFFICULTY', DIFFICULTY[clamp(SET.difficulty, 0, 2)].name],
    ['COLOUR SCHEME', SCHEMES[clamp(SET.palette, 0, 2)].name],
    ['REDUCE MOTION', SET.reduceMotion ? 'ON' : 'OFF'],
    ['FLASH', Math.round(SET.flash * 100) + '%'],
    ['HUD SIZE', Math.round(SET.hudScale * 100) + '%'],
    ['MUSIC', Math.round(SET.music * 100) + '%'],
    ['SOUND FX', Math.round(SET.sfx * 100) + '%'],
    ['AUTO FIRE', SET.autoFire ? 'ON' : 'OFF']
  ];
  var y = 64;
  for (var i = 0; i < rows.length; i++) {
    var sel = i === Game.settingsIndex;
    if (sel) {
      px(g, 60, y - 4, W - 120, 14, 'rgba(84,224,255,0.14)');
      drawText(g, '>', 64, y, 1, '#54e0ff');
    }
    drawText(g, rows[i][0], 76, y, 1, sel ? '#ffffff' : '#9fb2c6');
    drawText(g, rows[i][1], W - 76, y, 1, sel ? '#ffd257' : '#7f8fa6', 'right');
    y += 17;
  }
  drawText(g, 'UP / DOWN TO CHOOSE   LEFT / RIGHT TO CHANGE', W / 2, H - 34, 1, '#54637a', 'center');
  drawText(g, 'P OR ESC TO RESUME', W / 2, H - 22, 1, '#54637a', 'center');
}

function drawStageClear(g) {
  dim(g, 0.6);
  var t = Game.stateTimer;
  drawText(g, 'ERA CLEARED', W / 2, 78, 4, '#54ffa8', 'center', 'rgba(0,0,0,0.85)');
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
  drawText(g, 'GAME OVER', W / 2, 88, 4, '#ff4d6d', 'center', 'rgba(0,0,0,0.85)');
  drawText(g, 'THE EON ENDURES WITHOUT YOU', W / 2, 126, 1, '#9fb2c6', 'center');
  drawText(g, 'SCORE ' + String(Game.score).padStart(7, '0'), W / 2, 150, 2, '#ffffff', 'center', 'rgba(0,0,0,0.8)');
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
  drawText(g, 'EON SECURED', W / 2, 74, 4, '#ffd257', 'center', 'rgba(0,0,0,0.85)');
  drawText(g, 'ALL THREE ERAS CLEARED', W / 2, 112, 1, '#cfd8e3', 'center');
  drawText(g, 'FINAL SCORE ' + String(Game.score).padStart(7, '0'), W / 2, 140, 2, '#ffffff', 'center', 'rgba(0,0,0,0.8)');
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
  c.width = W; c.height = H;
  var g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.16)';
  for (var y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
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
  g.clearRect(0, 0, W, H);

  if (Game.state === 'title') {
    drawTitle(g);
  } else {
    g.save();
    g.translate(Math.round(shakeX), Math.round(shakeY));
    drawWorld(g);
    g.restore();
    drawHUD(g);

    if (Game.state === 'paused') drawPause(g);
    else if (Game.state === 'settings') drawSettings(g);
    else if (Game.state === 'stageclear') drawStageClear(g);
    else if (Game.state === 'gameover') drawGameOver(g);
    else if (Game.state === 'victory') drawVictory(g);
  }

  /* hit flash, scaled by the photosensitivity setting */
  if (Game.flash > 0.01 && !SET.reduceMotion && SET.flash > 0) {
    g.fillStyle = 'rgba(255,255,255,' + (Game.flash * 0.5 * SET.flash) + ')';
    g.fillRect(0, 0, W, H);
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
    g.drawImage(Scan.canvas, 0, 0);
    g.globalAlpha = 1;
  }

  /* vignette */
  var vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
}
