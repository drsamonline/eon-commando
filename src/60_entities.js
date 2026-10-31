/* ===========================================================================
   EON COMMANDO — 60 entities
   The commando, five enemy archetypes, three bosses, bullets and debris.
   =========================================================================== */

var PHYS = {
  grav: 0.52, maxFall: 11.5,
  runAcc: 0.58, runMax: 2.55, friction: 0.62, airAcc: 0.42,
  jumpV: -7.7, jumpCut: -3.2, coyote: 6, buffer: 7
};

/* ---- world collision ---------------------------------------------------- */
function groundRects() {
  var segs = Game.stage.groundSegs, out = [], i;
  for (i = 0; i < segs.length; i++) {
    out.push({ x: segs[i][0], y: GROUND_Y, w: segs[i][1], h: H - GROUND_Y + 60 });
  }
  if (Game.gate) out.push(Game.gate);
  return out;
}
function platformRects() {
  var plats = Game.stage.platforms, out = [], i;
  for (i = 0; i < plats.length; i++) {
    out.push({ x: plats[i].x, y: plats[i].y, w: plats[i].w, h: 8 });
  }
  return out;
}
function supportedAt(x, y) {
  var i, segs = Game.stage.groundSegs;
  if (y >= GROUND_Y - 2 && y <= GROUND_Y + 6) {
    for (i = 0; i < segs.length; i++) if (x >= segs[i][0] && x <= segs[i][0] + segs[i][1]) return true;
  }
  var plats = Game.stage.platforms;
  for (i = 0; i < plats.length; i++) {
    if (Math.abs(plats[i].y - (y - 2)) < 8 && x >= plats[i].x && x <= plats[i].x + plats[i].w) return true;
  }
  return false;
}

/* move an entity, resolving against solids and one-way platforms */
function moveEntity(e, solids, oneways) {
  var i, r;
  e.x += e.vx;
  for (i = 0; i < solids.length; i++) {
    r = solids[i];
    if (aabb(e, r)) {
      if (e.vx > 0) e.x = r.x - e.w;
      else if (e.vx < 0) e.x = r.x + r.w;
      e.vx = 0;
    }
  }

  var prevBottom = e.y + e.h;
  e.y += e.vy;
  e.onGround = false;
  for (i = 0; i < solids.length; i++) {
    r = solids[i];
    if (aabb(e, r)) {
      if (e.vy > 0) { e.y = r.y - e.h; e.onGround = true; }
      else if (e.vy < 0) { e.y = r.y + r.h; }
      e.vy = 0;
    }
  }
  if (e.vy >= 0 && oneways) {
    for (i = 0; i < oneways.length; i++) {
      r = oneways[i];
      if (e.x + e.w > r.x + 1 && e.x < r.x + r.w - 1 &&
          prevBottom <= r.y + 1 && e.y + e.h >= r.y) {
        e.y = r.y - e.h;
        e.vy = 0;
        e.onGround = true;
      }
    }
  }
}

/* ---- the commando ------------------------------------------------------- */
function makePlayer(x, y) {
  return {
    x: x, y: y, w: 12, h: 22,
    vx: 0, vy: 0, facing: 1,
    onGround: false, ducking: false, runPhase: 0,
    aimAngle: 0, muzzle: 0,
    hp: 4, maxHp: 4,
    invuln: 90, hurtFlash: 0,
    coyote: 0, jumpBuffer: 0, jumpHeld: false,
    weapon: 'rifle', cd: 0,
    dead: false, deadTimer: 0,
    spawnX: x, spawnY: y
  };
}

function setDuck(p, want) {
  if (want === p.ducking) return;
  if (want) {
    p.y += p.h - 14;
    p.h = 14;
  } else {
    /* only stand up when there is room */
    var test = { x: p.x, y: p.y - 8, w: p.w, h: 22 };
    var solids = groundRects();
    for (var i = 0; i < solids.length; i++) if (aabb(test, solids[i])) return;
    p.y -= 8;
    p.h = 22;
  }
  p.ducking = want;
}

function playerUpdate(p) {
  var solids = groundRects(), oneways = platformRects();

  if (p.dead) {
    p.deadTimer++;
    p.vy = Math.min(p.vy + PHYS.grav, PHYS.maxFall);
    p.y += p.vy;
    p.x += p.vx;
    p.vx *= 0.96;
    return;
  }

  var ax = Input.axis();
  var wantDuck = Input.held('down') && p.onGround;
  setDuck(p, wantDuck);

  /* horizontal */
  if (ax !== 0 && !p.ducking) {
    var acc = p.onGround ? PHYS.runAcc : PHYS.airAcc;
    p.vx = approach(p.vx, ax * PHYS.runMax, acc);
    p.facing = ax;
  } else {
    p.vx = approach(p.vx, 0, p.onGround ? PHYS.friction : PHYS.friction * 0.25);
  }

  /* jump with coyote time + input buffering + variable height */
  if (p.onGround) p.coyote = PHYS.coyote; else if (p.coyote > 0) p.coyote--;
  if (Input.pressed('jump')) p.jumpBuffer = PHYS.buffer; else if (p.jumpBuffer > 0) p.jumpBuffer--;

  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = PHYS.jumpV;
    p.onGround = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.jumpHeld = true;
    Snd.sfx('jump');
    puff(p.x + p.w / 2, p.y + p.h, 5, '#c8d6e2');
  }
  if (p.jumpHeld && !Input.held('jump') && p.vy < PHYS.jumpCut) {
    p.vy = PHYS.jumpCut;
    p.jumpHeld = false;
  }
  if (p.onGround) p.jumpHeld = false;

  /* gravity */
  p.vy = Math.min(p.vy + PHYS.grav, PHYS.maxFall);

  var wasAir = !p.onGround;
  moveEntity(p, solids, oneways);
  if (wasAir && p.onGround) {
    puff(p.x + p.w / 2, p.y + p.h, 3, '#8fa4b8');
    if (p.vy > 6) Snd.sfx('land');
  }

  /* keep the commando inside the level */
  if (p.x < 2) { p.x = 2; if (p.vx < 0) p.vx = 0; }
  var maxX = Game.stage.length - p.w - 2;
  if (p.x > maxX) { p.x = maxX; if (p.vx > 0) p.vx = 0; }

  /* animation */
  if (p.onGround && Math.abs(p.vx) > 0.2) p.runPhase += Math.abs(p.vx) * 0.055;
  else if (p.onGround) p.runPhase = 0;

  /* aim direction */
  var up = Input.held('up'), down = Input.held('down');
  var axAim = 0, ayAim = 0;
  if (up) ayAim = -1;
  else if (down && !p.onGround) ayAim = 1;
  if (up || (down && !p.onGround)) {
    if (Input.held('left')) axAim = -1;
    else if (Input.held('right')) axAim = 1;
  } else {
    axAim = p.facing;
  }
  if (axAim === 0 && ayAim === 0) axAim = p.facing;
  p.aimAngle = Math.atan2(ayAim, axAim);

  /* firing */
  if (p.cd > 0) p.cd--;
  if (p.muzzle > 0) p.muzzle--;
  if (Input.held('fire') && p.cd <= 0) fireWeapon(p);

  /* timers */
  if (p.invuln > 0) p.invuln--;
  if (p.hurtFlash > 0) p.hurtFlash--;

  /* fell into a chasm */
  if (p.y > H + 60) {
    p.hp = 0;
    killPlayer(p);
  }
}

function fireWeapon(p) {
  var w = WEAPONS[p.weapon];
  p.cd = w.cd;
  p.muzzle = 4;
  Snd.sfx(w.sfx);
  var ox = p.x + p.w / 2 + Math.cos(p.aimAngle) * 9;
  var oy = p.y + (p.ducking ? 8 : 10) + Math.sin(p.aimAngle) * 9;

  for (var i = 0; i < w.shots; i++) {
    var a = p.aimAngle;
    if (w.shots > 1) a += (i - (w.shots - 1) / 2) * w.spread;
    a += rnd(-w.jitter, w.jitter);
    spawnBullet({
      x: ox, y: oy, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
      dmg: w.dmg, friendly: true, color: w.color, glow: w.glow,
      w: w.w, h: w.h, pierce: w.pierce, life: w.life, angle: a
    });
  }
  /* recoil shove */
  p.vx -= Math.cos(p.aimAngle) * (w.name === 'LASER' ? 0.6 : 0.14);
}

function playerHurt(p, dmg) {
  if (p.invuln > 0 || p.dead) return;
  p.hp -= dmg;
  p.hurtFlash = 24;
  p.invuln = 80;
  Game.shake = Math.max(Game.shake, 5);
  Snd.sfx('hurt');
  if (p.hp <= 0) killPlayer(p);
}

function killPlayer(p) {
  if (p.dead) return;
  p.dead = true;
  p.deadTimer = 0;
  p.hp = 0;
  p.vx = -p.facing * 1.6;
  p.vy = -4.5;
  Snd.sfx('death');
  Game.shake = 9;
  burst(p.x + p.w / 2, p.y + p.h / 2, 26, ['#ff5c3c', '#ffb545', '#ffffff']);
}

/* ---- bullets ------------------------------------------------------------ */
function spawnBullet(o) {
  o.life = o.life || 90;
  o.pierce = o.pierce || 0;
  o.hits = 0;
  Game.bullets.push(o);
  return o;
}

function bulletUpdate(b) {
  b.x += b.vx;
  b.y += b.vy;
  b.life--;
  if (b.life <= 0) { b.dead = true; return; }
  if (b.x < -40 || b.x > Game.stage.length + 40 || b.y < -60 || b.y > H + 60) { b.dead = true; return; }

  var box = { x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h };

  /* terrain */
  var solids = groundRects(), i;
  for (i = 0; i < solids.length; i++) {
    if (aabb(box, solids[i])) {
      b.dead = true;
      spark(b.x, b.y, b.color);
      return;
    }
  }
  if (b.friendly) {
    /* enemy bullets are blocked by platforms; yours pass through thin ones */
    for (i = 0; i < Game.enemies.length; i++) {
      var e = Game.enemies[i];
      if (e.dead) continue;
      if (aabb(box, e)) {
        damageEnemy(e, b.dmg, b.vx);
        b.hits++;
        if (b.hits > b.pierce) { b.dead = true; spark(b.x, b.y, b.color); return; }
      }
    }
    var boss = Game.boss;
    if (boss && !boss.dead && aabb(box, boss)) {
      damageBoss(boss, b.dmg);
      b.hits++;
      if (b.hits > b.pierce) { b.dead = true; spark(b.x, b.y, b.color); return; }
    }
  } else {
    var p = Game.player;
    if (!p.dead && aabb(box, { x: p.x, y: p.y, w: p.w, h: p.h })) {
      playerHurt(p, b.dmg || 1);
      b.dead = true;
      spark(b.x, b.y, b.color);
    }
  }
}

/* ---- particles ---------------------------------------------------------- */
function spawnParticle(o) {
  o.life = o.life || 20;
  o.maxLife = o.life;
  o.grav = o.grav === undefined ? 0.06 : o.grav;
  Game.particles.push(o);
}
function spark(x, y, color) {
  for (var i = 0; i < 4; i++) {
    spawnParticle({
      x: x, y: y, vx: rnd(-1.4, 1.4), vy: rnd(-1.4, 0.6),
      life: rndi(8, 16), color: color, size: 1, grav: 0.04
    });
  }
}
function burst(x, y, n, colors) {
  for (var i = 0; i < n; i++) {
    var a = rnd(0, Math.PI * 2), s = rnd(0.4, 3.2);
    spawnParticle({
      x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6,
      life: rndi(16, 40), color: pick(colors), size: rndi(1, 3), grav: 0.08
    });
  }
}
function puff(x, y, n, color) {
  for (var i = 0; i < n; i++) {
    spawnParticle({
      x: x, y: y, vx: rnd(-0.7, 0.7), vy: rnd(-0.5, 0.2),
      life: rndi(8, 18), color: color, size: 1, grav: 0.02
    });
  }
}
function explosion(x, y, size) {
  burst(x, y, 16 + size * 6, ['#ffb545', '#ff5c3c', '#ffe9a8', '#ffffff']);
  for (var i = 0; i < 3 + size; i++) {
    spawnParticle({
      x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: rnd(-0.4, 0.4), vy: rnd(-1.2, -0.2),
      life: rndi(20, 34), color: '#4a5568', size: rndi(2, 4), grav: -0.02, smoke: true
    });
  }
  Game.shake = Math.max(Game.shake, 3 + size);
}

function particleUpdate(pt) {
  pt.x += pt.vx;
  pt.y += pt.vy;
  pt.vy += pt.grav;
  pt.vx *= 0.985;
  pt.life--;
  if (pt.life <= 0) pt.dead = true;
}

/* ---- pickups ------------------------------------------------------------ */
function spawnPickup(o) {
  Game.pickups.push({
    kind: o.kind, w: o.w, label: o.label, x: o.x, y: o.y,
    baseY: o.y, age: rnd(0, 60), vy: 0, dead: false
  });
}
function pickupUpdate(c) {
  c.age++;
  c.y = c.baseY + Math.sin(c.age * 0.06) * 3;
  var p = Game.player;
  if (!p.dead && aabb({ x: c.x - 2, y: c.y - 2, w: 18, h: 18 }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
    c.dead = true;
    if (c.kind === 'weapon') {
      p.weapon = c.w;
      Snd.sfx('pickup');
      floatText(c.x, c.y, WEAPONS[c.w].name + '!', WEAPONS[c.w].color);
      burst(c.x + 7, c.y + 7, 10, [WEAPONS[c.w].color, '#ffffff']);
      Game.score += 250;
    } else if (c.kind === 'health') {
      p.hp = Math.min(p.maxHp, p.hp + 2);
      Snd.sfx('health');
      floatText(c.x, c.y, 'REPAIR', '#54ffa8');
      burst(c.x + 7, c.y + 7, 10, ['#54ffa8', '#ffffff']);
      Game.score += 100;
    } else {
      Snd.sfx('coin');
      floatText(c.x, c.y, '+500', '#ffd257');
      burst(c.x + 7, c.y + 7, 8, ['#ffd257', '#ffffff']);
      Game.score += 500;
    }
  }
}

function floatText(x, y, text, color) {
  Game.floaters.push({ x: x, y: y, text: text, color: color || '#fff', life: 50 });
}

/* ---- enemies ------------------------------------------------------------ */
function spawnEnemy(spec) {
  var def = ENEMIES[spec.t];
  if (!def) return;
  Game.enemies.push({
    t: spec.t, x: spec.x, y: spec.y, w: def.w, h: def.h,
    hp: def.hp, maxHp: def.hp, vx: 0, vy: 0,
    facing: -1, onGround: false, walkPhase: 0, age: rnd(0, 120),
    shootT: rndi(40, 120), flash: 0, dead: false,
    homeX: spec.x, homeY: spec.y, aimAngle: 0
  });
}

function damageEnemy(e, dmg, knock) {
  e.hp -= dmg;
  e.flash = 8;
  if (knock) e.vx += sign(knock) * 0.5;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    var def = ENEMIES[e.t];
    Game.score += def.score;
    floatText(e.x, e.y - 6, '+' + def.score, '#ffd257');
    explosion(e.x + e.w / 2, e.y + e.h / 2, 1);
    Snd.sfx('explode');
    if (chance(def.drop)) {
      spawnPickup({ kind: chance(0.35) ? 'health' : 'coin', x: e.x, y: e.y });
    }
  } else {
    Snd.sfx('hit');
  }
}

function enemyShootAt(e, speed, count, spreadArc, offsetY) {
  var p = Game.player;
  var ox = e.x + e.w / 2, oy = e.y + (offsetY === undefined ? e.h / 2 : offsetY);
  var base = Math.atan2((p.y + p.h / 2) - oy, (p.x + p.w / 2) - ox);
  count = count || 1;
  for (var i = 0; i < count; i++) {
    var a = base + (count > 1 ? (i - (count - 1) / 2) * (spreadArc || 0.2) : 0);
    spawnBullet({
      x: ox, y: oy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      dmg: 1, friendly: false, color: '#ff4d6d', glow: '#ffd0d8',
      w: 4, h: 4, pierce: 0, life: 160, angle: a
    });
  }
  Snd.sfx('enemyShot');
}

function enemyUpdate(e) {
  var def = ENEMIES[e.t];
  var p = Game.player;
  var solids = groundRects(), oneways = platformRects();
  e.age++;
  if (e.flash > 0) e.flash--;

  var pcx = p.x + p.w / 2, ecx = e.x + e.w / 2;
  var dx = pcx - ecx;
  var adx = Math.abs(dx);
  var dy = (p.y + p.h / 2) - (e.y + e.h / 2);
  var engaged = adx < 240 && Math.abs(dy) < 140;

  switch (e.t) {
    case 'grunt':
      if (engaged) {
        e.facing = sign(dx) || e.facing;
        if (adx > 46) e.vx = e.facing * def.speed;
        else e.vx = 0;
        if (e.shootT-- <= 0) { enemyShootAt(e, def.bulletSpeed, 1, 0, 8); e.shootT = def.shootEvery; }
      } else {
        e.vx = e.facing * def.speed * 0.6;
        if (!supportedAt(e.x + (e.facing > 0 ? e.w + 2 : -2), e.y + e.h + 2)) e.facing *= -1;
      }
      break;

    case 'runner':
      if (adx < 260) {
        e.facing = sign(dx) || e.facing;
        e.vx = e.facing * def.speed;
        if (!supportedAt(e.x + (e.facing > 0 ? e.w + 2 : -2), e.y + e.h + 2) && e.onGround) {
          e.vy = -6.2;
        }
      } else {
        e.vx = e.facing * 0.4;
      }
      break;

    case 'drone':
      e.vx = approach(e.vx, clamp(dx * 0.02, -def.speed, def.speed), 0.05);
      if (e.shootT-- <= 0) {
        if (adx < 220) {
          spawnBullet({
            x: e.x + e.w / 2, y: e.y + e.h, vx: rnd(-0.4, 0.4), vy: 1.9,
            dmg: 1, friendly: false, color: '#ff4d6d', glow: '#ffd0d8',
            w: 4, h: 5, pierce: 0, life: 180, angle: Math.PI / 2
          });
          Snd.sfx('enemyShot');
        }
        e.shootT = def.shootEvery;
      }
      break;

    case 'turret':
      e.aimAngle = Math.atan2(dy, dx);
      if (adx < 300 && e.shootT-- <= 0) {
        enemyShootAt(e, def.bulletSpeed, 1, 0, 5);
        e.shootT = def.shootEvery;
      }
      break;

    case 'jumper':
      if (e.onGround && e.shootT-- <= 0) {
        e.facing = sign(dx) || e.facing;
        e.vy = -6.4;
        e.vx = e.facing * (adx < 200 ? 1.7 : 0.8);
        e.shootT = def.shootEvery;
      }
      break;
  }

  if (def.gravity) {
    e.vy = Math.min(e.vy + PHYS.grav, PHYS.maxFall);
    moveEntity(e, solids, oneways);
  } else {
    e.x += e.vx;
    e.y = e.homeY + Math.sin(e.age * 0.045) * 8;
  }

  if (e.t === 'grunt' || e.t === 'runner' || e.t === 'jumper') {
    if (Math.abs(e.vx) > 0.1) e.walkPhase += Math.abs(e.vx) * 0.09;
  }

  /* contact damage */
  if (!p.dead && aabb(e, { x: p.x + 1, y: p.y + 1, w: p.w - 2, h: p.h - 2 })) {
    playerHurt(p, 1);
  }

  /* cull enemies far behind the camera */
  if (e.x < Game.camX - 320 || e.y > H + 120) e.dead = true;
}

/* ---- bosses ------------------------------------------------------------- */
function makeBoss(kind) {
  var def = BOSSES[kind];
  var arenaStart = Game.stage.arenaStart;
  return {
    kind: kind, def: def, name: def.name,
    x: arenaStart + W - def.w - 20, y: GROUND_Y - def.h,
    w: def.w, h: def.h,
    hp: def.hp, maxHp: def.hp,
    age: 0, flash: 0, phase: 1, dir: -1,
    shootT: 100, specialT: 240, angle: 0,
    dead: false, dying: 0, active: false, introT: 90
  };
}

function damageBoss(b, dmg) {
  if (b.dead) return;
  b.hp -= dmg;
  b.flash = 6;
  Snd.sfx('bossHit');
  if (b.hp <= 0) {
    b.hp = 0;
    b.dead = true;
    b.dying = 120;
    Game.score += b.def.score;
    floatText(b.x + b.w / 2, b.y, '+' + b.def.score, '#ffd257');
    Snd.sfx('bigExplode');
    Game.shake = 12;
  }
  if (b.phase === 1 && b.hp < b.maxHp * 0.5) {
    b.phase = 2;
    Game.flash = 0.55;
    Snd.sfx('bossWarn');
    floatText(b.x + b.w / 2, b.y - 14, 'OVERDRIVE', '#ff4d6d');
  }
}

function bossUpdate(b) {
  var p = Game.player;
  b.age++;
  if (b.flash > 0) b.flash--;

  if (b.dead) {
    b.dying--;
    if (b.dying % 9 === 0) {
      explosion(b.x + rnd(6, b.w - 6), b.y + rnd(6, b.h - 6), 2);
    }
    if (b.dying <= 0) {
      explosion(b.x + b.w / 2, b.y + b.h / 2, 4);
      Snd.sfx('bigExplode');
      Game.boss = null;
      Game.onBossDead();
    }
    return;
  }

  if (b.introT > 0) {
    b.introT--;
    b.y = GROUND_Y - b.h - Math.sin(b.introT * 0.05) * 4;
    return;
  }

  var arenaStart = Game.stage.arenaStart;
  var leftBound = arenaStart + 20;
  var rightBound = arenaStart + W - b.w - 20;
  var pcx = p.x + p.w / 2;
  var speed = b.phase === 2 ? 1.5 : 1.0;

  if (b.kind === 'warden') {
    b.y = GROUND_Y - b.h;
    if (b.x <= leftBound) b.dir = 1;
    if (b.x >= rightBound) b.dir = -1;
    b.x += b.dir * speed * 0.55;

    if (b.shootT-- <= 0) {
      var n = b.phase === 2 ? 5 : 3;
      var ox = b.x + b.w / 2, oy = b.y + 34;
      var base = Math.atan2((p.y + p.h / 2) - oy, pcx - ox);
      for (var i = 0; i < n; i++) {
        var a = base + (i - (n - 1) / 2) * 0.17;
        spawnBullet({
          x: ox, y: oy, vx: Math.cos(a) * 2.9, vy: Math.sin(a) * 2.9,
          dmg: 1, friendly: false, color: '#ff7a45', glow: '#ffd9a8',
          w: 5, h: 5, life: 200, angle: a
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 62 : 96;
    }
    if (b.specialT-- <= 0) {
      /* ground shockwave */
      for (var s = 0; s < 2; s++) {
        var dirS = s === 0 ? -1 : 1;
        spawnBullet({
          x: b.x + b.w / 2, y: GROUND_Y - 6, vx: dirS * 3.4, vy: 0,
          dmg: 1, friendly: false, color: '#ffb545', glow: '#fff3c4',
          w: 8, h: 8, life: 200, angle: 0
        });
      }
      Game.shake = 8;
      Snd.sfx('explode');
      b.specialT = b.phase === 2 ? 150 : 230;
    }
  }

  if (b.kind === 'wraith') {
    b.x = clamp(b.x + Math.cos(b.age * 0.013) * 0.9, leftBound, rightBound);
    b.y = GROUND_Y - b.h - 62 + Math.sin(b.age * 0.035) * 18;

    if (b.shootT-- <= 0) {
      var ox2 = b.x + b.w / 2, oy2 = b.y + b.h - 4;
      var base2 = Math.atan2((p.y + p.h / 2) - oy2, pcx - ox2);
      for (var j = 0; j < (b.phase === 2 ? 3 : 2); j++) {
        spawnBullet({
          x: ox2, y: oy2, vx: Math.cos(base2 + j * 0.18 - 0.09) * 3.1,
          vy: Math.sin(base2 + j * 0.18 - 0.09) * 3.1,
          dmg: 1, friendly: false, color: '#7fe3ff', glow: '#e6fbff',
          w: 5, h: 5, life: 220, angle: base2
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 58 : 84;
    }
    if (b.specialT-- <= 0) {
      for (var k = 0; k < 7; k++) {
        var aa = Math.PI / 2 + (k - 3) * 0.22;
        spawnBullet({
          x: b.x + b.w / 2, y: b.y + b.h, vx: Math.cos(aa) * 2.2, vy: Math.sin(aa) * 2.2,
          dmg: 1, friendly: false, color: '#bff4ff', glow: '#ffffff',
          w: 4, h: 6, life: 240, angle: aa
        });
      }
      if (b.phase === 2) {
        spawnEnemy({ t: 'drone', x: b.x, y: b.y + 20 });
        spawnEnemy({ t: 'drone', x: b.x + b.w, y: b.y + 20 });
      }
      Snd.sfx('spread');
      b.specialT = b.phase === 2 ? 180 : 260;
    }
  }

  if (b.kind === 'heart') {
    b.x = arenaStart + W / 2 - b.w / 2;
    b.y = GROUND_Y - b.h - 56 + Math.sin(b.age * 0.03) * 8;

    if (b.shootT-- <= 0) {
      var arms = b.phase === 2 ? 6 : 4;
      b.angle += 0.42;
      for (var m = 0; m < arms; m++) {
        var ang = b.angle + m * (Math.PI * 2 / arms);
        spawnBullet({
          x: b.x + b.w / 2, y: b.y + b.h / 2,
          vx: Math.cos(ang) * 2.5, vy: Math.sin(ang) * 2.5,
          dmg: 1, friendly: false, color: '#ff2d95', glow: '#ffd0e4',
          w: 5, h: 5, life: 260, angle: ang
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 40 : 56;
    }
    if (b.specialT-- <= 0) {
      /* aimed volley at the player */
      var ox3 = b.x + b.w / 2, oy3 = b.y + b.h / 2;
      var base3 = Math.atan2((p.y + p.h / 2) - oy3, pcx - ox3);
      for (var q = -2; q <= 2; q++) {
        spawnBullet({
          x: ox3, y: oy3, vx: Math.cos(base3 + q * 0.12) * 3.6,
          vy: Math.sin(base3 + q * 0.12) * 3.6,
          dmg: 1, friendly: false, color: '#ffb545', glow: '#fff3c4',
          w: 5, h: 5, life: 240, angle: base3
        });
      }
      if (b.phase === 2) spawnEnemy({ t: 'runner', x: arenaStart + 40, y: GROUND_Y - 15 });
      Snd.sfx('spread');
      b.specialT = b.phase === 2 ? 140 : 210;
    }
  }

  /* contact damage */
  if (!p.dead && aabb(b, { x: p.x + 1, y: p.y + 1, w: p.w - 2, h: p.h - 2 })) {
    playerHurt(p, 1);
  }
}

function drawBoss(g, b) {
  if (b.kind === 'warden') drawWarden(g, b);
  else if (b.kind === 'wraith') drawWraith(g, b);
  else drawHeart(g, b);
}
