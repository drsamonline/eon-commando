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
function moveEntity(e, solids, oneways, corner) {
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
      if (e.vy > 0) { e.y = r.y - e.h; e.onGround = true; e.vy = 0; }
      else if (e.vy < 0) {
        /* corner correction: slide around a ledge instead of bonking your head */
        var pokeL = (e.x + e.w) - r.x;
        var pokeR = (r.x + r.w) - e.x;
        var least = Math.min(pokeL, pokeR);
        if (corner && least > 0 && least <= 4.5) {
          e.x += (pokeL < pokeR) ? -pokeL : pokeR;
        } else {
          e.y = r.y + r.h;
          e.vy = 0;
        }
      }
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

/* ---- player helpers ----------------------------------------------------- */
function livePlayers() {
  var out = [], i;
  for (i = 0; i < Game.players.length; i++) {
    var p = Game.players[i];
    if (p && !p.dead && !p.downed) out.push(p);
  }
  return out.length ? out : (Game.player ? [Game.player] : []);
}

function nearestPlayer(x, y) {
  var list = livePlayers(), best = list[0], bd = Infinity, i;
  for (i = 0; i < list.length; i++) {
    var d = dist2(x, y, list[i].x + list[i].w / 2, list[i].y + list[i].h / 2);
    if (d < bd) { bd = d; best = list[i]; }
  }
  return best;
}

/* smallest signed difference between two angles */
function angDiff(a, b) {
  var d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/* the nearest thing worth shooting, if it is roughly where you are aiming.
   Auto-fire aims for you; it does not decide *what* you are pointing at. */
function autoTarget(p) {
  var best = null, bestD = 210 * 210;
  var ox = p.x + p.w / 2;
  var oy = p.y + (p.ducking ? 8 : 10);
  var list = Game.enemies, i, e;

  for (var pass = 0; pass < 2; pass++) {
    if (pass === 1) {
      if (!Game.boss || Game.boss.dead) break;
      list = [Game.boss];
    }
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (!e || e.dead) continue;
      var cx = e.x + e.w / 2, cy = e.y + e.h / 2;
      var dx = cx - ox, dy = cy - oy;
      var d2 = dx * dx + dy * dy;
      if (d2 > 210 * 210 || d2 > bestD) continue;
      var a = Math.atan2(dy, dx);
      if (SET.autoFire) {
        /* no manual vertical aim: accept anything on the facing side */
        if (dx * p.facing < -12) continue;
      } else if (Math.abs(angDiff(a, p.aimAngle)) > 0.55) {
        continue;   /* ~31 deg, matching 8-way aim */
      }
      bestD = d2;
      best = { angle: a, target: e };
    }
  }
  return best;
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
    dashT: 0, dashCd: 0, dashDir: 1,
    meleeT: 0, meleeCd: 0,
    grenades: 3, maxGrenades: 3,
    ctl: null, downed: false, downTimer: 0, reviveT: 0, autoAiming: false,
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
  var ctl = p.ctl || Input;

  /* downed in co-op: no control, but still subject to gravity and the floor */
  if (p.downed) {
    p.downTimer--;
    p.vx *= 0.9;
    p.vy = Math.min(p.vy + PHYS.grav, PHYS.maxFall);
    moveEntity(p, solids, oneways, false);
    return;
  }

  if (p.dead) {
    p.deadTimer++;
    p.vy = Math.min(p.vy + PHYS.grav, PHYS.maxFall);
    p.y += p.vy;
    p.x += p.vx;
    p.vx *= 0.96;
    return;
  }

  var ax = ctl.axis();
  var wantDuck = ctl.held('down') && p.onGround;
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
  if (ctl.pressed('jump') || (SET.autoFire && ctl.pressed('up'))) p.jumpBuffer = PHYS.buffer;
  else if (p.jumpBuffer > 0) p.jumpBuffer--;

  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = PHYS.jumpV;
    p.onGround = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.jumpHeld = true;
    Snd.sfx('jump');
    puff(p.x + p.w / 2, p.y + p.h, 5, '#c8d6e2');
  }
  if (p.jumpHeld && !(ctl.held('jump') || (SET.autoFire && ctl.held('up'))) && p.vy < PHYS.jumpCut) {
    p.vy = PHYS.jumpCut;
    p.jumpHeld = false;
  }
  if (p.onGround) p.jumpHeld = false;

  /* dash — short, invulnerable, horizontal */
  if (p.dashCd > 0) p.dashCd--;
  if (ctl.pressed('dash') && p.dashCd <= 0 && !p.ducking) {
    p.dashT = 10;
    p.dashCd = 42;
    p.dashDir = p.facing;
    p.vy = 0;
    Snd.sfx('dash');
    Game.shake = Math.max(Game.shake, 2);
  }
  if (p.dashT > 0) {
    p.dashT--;
    p.vx = p.dashDir * 6.4;
    p.vy = Math.min(p.vy, 0.3);
    if (p.dashT % 2 === 0) {
      Game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 10, max: 10 });
    }
  }

  /* melee — a short arc that solves "enemy on top of me" */
  if (p.meleeCd > 0) p.meleeCd--;
  if (ctl.pressed('melee') && p.meleeCd <= 0) {
    p.meleeT = 9;
    p.meleeCd = 26;
    Snd.sfx('melee');
    var reach = 19;
    var box = {
      x: p.facing > 0 ? p.x + p.w - 2 : p.x - reach + 2,
      y: p.y + 3, w: reach, h: p.h - 6
    };
    var struck = false, i;
    for (i = 0; i < Game.enemies.length; i++) {
      var en = Game.enemies[i];
      if (!en.dead && aabb(box, en)) { damageEnemy(en, 3, p.facing * 2); struck = true; }
    }
    if (Game.boss && !Game.boss.dead && aabb(box, Game.boss)) {
      damageBoss(Game.boss, 4); struck = true;
    }
    if (struck) {
      Game.hitStop = 3;
      Game.shake = Math.max(Game.shake, 3);
    }
  }
  if (p.meleeT > 0) p.meleeT--;

  /* grenades */
  if (ctl.pressed('grenade') && p.grenades > 0) {
    p.grenades--;
    spawnGrenade(p);
    Snd.sfx('throw');
  }

  /* gravity */
  p.vy = Math.min(p.vy + PHYS.grav, PHYS.maxFall);

  var wasAir = !p.onGround;
  moveEntity(p, solids, oneways, true);
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
  var up = ctl.held('up'), down = ctl.held('down');
  var axAim = 0, ayAim = 0;
  if (up) ayAim = -1;
  else if (down && !p.onGround) ayAim = 1;
  if (up || (down && !p.onGround)) {
    if (ctl.held('left')) axAim = -1;
    else if (ctl.held('right')) axAim = 1;
  } else {
    axAim = p.facing;
  }
  if (axAim === 0 && ayAim === 0) axAim = p.facing;
  p.aimAngle = Math.atan2(ayAim, axAim);

  /* firing — manual, or automatic when a target sits inside the aim cone */
  if (p.cd > 0) p.cd--;
  if (p.muzzle > 0) p.muzzle--;
  var wantFire = ctl.held('fire');
  var fireAngle = null;
  if (SET.autoFire && !wantFire) {
    var aim = autoTarget(p);
    if (aim) {
      /* the arm swings toward the target for looks; the shot goes where it aims */
      p.aimAngle += angDiff(aim.angle, p.aimAngle) * 0.45;
      fireAngle = aim.angle;
      p.autoAiming = true;
      wantFire = true;
    } else {
      p.autoAiming = false;
    }
  } else {
    p.autoAiming = false;
  }
  if (wantFire && p.cd <= 0) fireWeapon(p, fireAngle);

  /* timers */
  if (p.invuln > 0) p.invuln--;
  if (p.hurtFlash > 0) p.hurtFlash--;

  /* fell into a chasm */
  if (p.y > H + 60) {
    p.hp = 0;
    killPlayer(p);
  }
}

function fireWeapon(p, angleOverride) {
  var w = WEAPONS[p.weapon];
  var base = (angleOverride === undefined || angleOverride === null) ? p.aimAngle : angleOverride;
  p.cd = Game.fury > 0 ? Math.max(2, Math.round(w.cd * 0.45)) : w.cd;
  p.muzzle = 4;
  Snd.sfx(w.sfx);
  var ox = p.x + p.w / 2 + Math.cos(base) * 9;
  var oy = p.y + (p.ducking ? 8 : 10) + Math.sin(base) * 9;

  for (var i = 0; i < w.shots; i++) {
    var a = base;
    if (w.shots > 1) a += (i - (w.shots - 1) / 2) * w.spread;
    a += RNG.sr(-w.jitter, w.jitter);
    spawnBullet({
      x: ox, y: oy, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
      dmg: w.dmg, friendly: true, color: w.color, glow: w.glow,
      w: w.w, h: w.h, pierce: w.pierce, life: w.life, angle: a
    });
  }
  /* recoil shove */
  p.vx -= Math.cos(base) * (w.name === 'LASER' ? 0.6 : 0.14);
}

function playerHurt(p, dmg) {
  if (p.invuln > 0 || p.dead || p.dashT > 0) return;
  dmg = dmg * diff().dmgTaken;
  p.hp -= dmg;
  p.hurtFlash = 24;
  p.invuln = 80;
  Game.shake = Math.max(Game.shake, 5);
  Snd.sfx('hurt');
  if (p.hp <= 0) killPlayer(p);
}

function killPlayer(p) {
  if (p.dead || p.downed) return;

  /* with a partner still standing, go down instead of dying */
  var partnerUp = false;
  for (var i = 0; i < Game.players.length; i++) {
    var q = Game.players[i];
    if (q !== p && q && !q.dead && !q.downed) partnerUp = true;
  }
  if (Game.coop && partnerUp) {
    p.downed = true;
    p.downTimer = 360;
    p.reviveT = 0;
    p.hp = 0;
    p.vx = 0;
    p.vy = -2.4;
    Game.shake = 6;
    Snd.sfx('death');
    floatText(p.x, p.y - 8, 'DOWN', '#ff4d6d');
    return;
  }

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
      /* broad phase: skip anything the bullet cannot possibly touch */
      if (e.x > b.x + 40 || e.x + e.w < b.x - 40) continue;
      if (aabb(box, e)) {
        damageEnemy(e, b.dmg, b.vx);
        b.hits++;
        if (b.hits > b.pierce) { b.dead = true; spark(b.x, b.y, b.color); return; }
      }
    }
    var boss = Game.boss;
    if (boss && !boss.dead && aabb(box, boss)) {
      damageBoss(boss, b.dmg, b.x, b.y);
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
  var p = null, pi;
  for (pi = 0; pi < Game.players.length; pi++) {
    var cand = Game.players[pi];
    if (cand && !cand.dead && !cand.downed &&
        aabb({ x: c.x - 2, y: c.y - 2, w: 18, h: 18 }, { x: cand.x, y: cand.y, w: cand.w, h: cand.h })) {
      p = cand;
      break;
    }
  }
  if (p) {
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
    homeX: spec.x, homeY: spec.y, aimAngle: 0,
    /* one rig, many looks: era palette, scale jitter, occasional elite */
    pal: (typeof Game !== 'undefined' && Game.stageIndex) || 0,
    scale: 0.94 + RNG.s() * 0.12,
    elite: RNG.sChance(0.12),
    wind: 0, chargeCd: 0
  });
  var last = Game.enemies[Game.enemies.length - 1];
  if (last) {
    last.hp = Math.max(1, Math.round(last.hp * diff().enemyHp * (last.elite ? 1.8 : 1)));
    last.maxHp = last.hp;
    if (last.elite) last.w += 2;
  }
}

function damageEnemy(e, dmg, knock) {
  /* a shielder's plate stops anything coming from the front */
  if (e.t === 'shielder' && knock && sign(knock) === e.facing) {
    e.flash = 5;
    spark(e.x + e.w / 2, e.y + e.h / 2, '#c8d6e2');
    Snd.sfx('hit');
    return;
  }
  e.hp -= dmg;
  e.flash = 8;
  if (knock) e.vx += sign(knock) * 0.5;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    var def = ENEMIES[e.t];
    Game.combo++;
    Game.comboT = 160;
    Game.power = Math.min(100, Game.power + 8 + Math.min(Game.combo, 12));
    var gained = Math.round(def.score * (Game.scoreMul || 1) * (1 + Math.min(Game.combo, 20) * 0.05));
    Game.score += gained;
    floatText(e.x, e.y - 6, '+' + gained, '#ffd257');
    explosion(e.x + e.w / 2, e.y + e.h / 2, 1);
    Snd.sfx('explode');
    if (RNG.sChance(def.drop * diff().drop)) {
      spawnPickup({ kind: RNG.sChance(0.35) ? 'health' : 'coin', x: e.x, y: e.y });
    }
  } else {
    Snd.sfx('hit');
  }
}

function enemyShootAt(e, speed, count, spreadArc, offsetY) {
  var p = nearestPlayer(e.x + e.w / 2, e.y + e.h / 2) || Game.player;
  var ox = e.x + e.w / 2, oy = e.y + (offsetY === undefined ? e.h / 2 : offsetY);
  var base = Math.atan2((p.y + p.h / 2) - oy, (p.x + p.w / 2) - ox);
  count = count || 1;
  for (var i = 0; i < count; i++) {
    var a = base + (count > 1 ? (i - (count - 1) / 2) * (spreadArc || 0.2) : 0);
    spawnBullet({
      x: ox, y: oy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      dmg: 1, friendly: false, color: scheme().hostile, glow: scheme().hostileGlow,
      w: 4, h: 4, pierce: 0, life: 160, angle: a
    });
  }
  Snd.sfx('enemyShot');
}

function enemyUpdate(e) {
  var def = ENEMIES[e.t];
  var p = nearestPlayer(e.x + e.w / 2, e.y + e.h / 2) || Game.player;
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
        if (e.wind > 0) {
          e.wind--;
          if (e.wind === 0) enemyShootAt(e, def.bulletSpeed, 1, 0, 8);
        } else if (e.shootT-- <= 0) {
          e.wind = 16;
          e.shootT = def.shootEvery / diff().fireRate;
        }
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
            dmg: 1, friendly: false, color: scheme().hostile, glow: scheme().hostileGlow,
            w: 4, h: 5, pierce: 0, life: 180, angle: Math.PI / 2
          });
          Snd.sfx('enemyShot');
        }
        e.shootT = def.shootEvery;
      }
      break;

    case 'turret':
      e.aimAngle = Math.atan2(dy, dx);
      if (e.wind > 0) {
        e.wind--;
        if (e.wind === 0) enemyShootAt(e, def.bulletSpeed, 1, 0, 5);
      } else if (adx < 300 && e.shootT-- <= 0) {
        e.wind = 18;
        e.shootT = def.shootEvery / diff().fireRate;
      }
      break;

    case 'sniper':
      e.facing = sign(dx) || e.facing;
      if (e.wind > 0) {
        e.wind--;
        if (e.wind === 0) enemyShootAt(e, def.bulletSpeed, 1, 0, 6);
      } else if (adx < 340 && e.shootT-- <= 0) {
        e.wind = 42;                      /* long, readable laser sight */
        e.shootT = def.shootEvery / diff().fireRate;
      }
      break;

    case 'swarm':
      e.vx = approach(e.vx, sign(dx) * def.speed, 0.08);
      e.vy = approach(e.vy, clamp(dy * 0.02, -1.4, 1.4), 0.08);
      e.x += e.vx;
      e.y += e.vy;
      if (e.y < 20) e.y = 20;
      if (e.y > GROUND_Y - e.h) e.y = GROUND_Y - e.h;
      break;

    case 'brute':
      if (e.chargeCd > 0) e.chargeCd--;
      if (adx < 220) {
        e.facing = sign(dx) || e.facing;
        e.vx = e.facing * def.speed;
        if (e.onGround && adx < 90 && e.chargeCd <= 0) {
          e.wind = 14;              /* telegraphed shoulder charge */
          e.chargeCd = 150;
        }
        if (e.wind > 0) {
          e.wind--;
          e.vx = 0;
          if (e.wind === 0) { e.vy = -4.6; e.vx = e.facing * 3.2; Snd.sfx('jump'); }
        }
      } else {
        e.vx = e.facing * def.speed * 0.4;
        if (!supportedAt(e.x + (e.facing > 0 ? e.w + 2 : -2), e.y + e.h + 2)) e.facing *= -1;
      }
      break;

    case 'shielder':
      if (engaged) {
        e.facing = sign(dx) || e.facing;
        if (adx > 60) e.vx = e.facing * def.speed;
        else e.vx = 0;
        if (e.wind > 0) {
          e.wind--;
          if (e.wind === 0) enemyShootAt(e, def.bulletSpeed, 1, 0, 8);
        } else if (e.shootT-- <= 0) {
          e.wind = 20;
          e.shootT = def.shootEvery / diff().fireRate;
        }
      } else {
        e.vx = e.facing * def.speed * 0.6;
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

  if (e.t === 'swarm') {
    /* handled in its own case above */
  } else if (def.gravity) {
    e.vy = Math.min(e.vy + PHYS.grav, PHYS.maxFall);
    moveEntity(e, solids, oneways);
  } else {
    e.x += e.vx;
    e.y = e.homeY + Math.sin(e.age * 0.045) * 8;
  }

  if (e.t === 'grunt' || e.t === 'runner' || e.t === 'jumper') {
    if (Math.abs(e.vx) > 0.1) e.walkPhase += Math.abs(e.vx) * 0.09;
  }

  /* contact damage, against every commando on screen */
  for (var ci = 0; ci < Game.players.length; ci++) {
    var cp = Game.players[ci];
    if (cp && !cp.dead && !cp.downed &&
        aabb(e, { x: cp.x + 1, y: cp.y + 1, w: cp.w - 2, h: cp.h - 2 })) {
      playerHurt(cp, 1);
    }
  }

  /* cull enemies far behind the camera */
  if (e.x < Game.camX - 320 || e.y > H + 120) e.dead = true;
}

/* ---- grenades ----------------------------------------------------------- */
function spawnGrenade(p) {
  Game.grenades.push({
    x: p.x + p.w / 2, y: p.y + 8,
    vx: p.facing * 3.2 + p.vx * 0.4, vy: -3.4,
    fuse: 74, dead: false
  });
}

function grenadeUpdate(n) {
  n.vy = Math.min(n.vy + 0.34, 9);
  n.x += n.vx;
  n.y += n.vy;
  n.fuse--;

  /* bounce off the ground */
  if (n.y > GROUND_Y - 3) {
    n.y = GROUND_Y - 3;
    n.vy *= -0.42;
    n.vx *= 0.72;
    if (Math.abs(n.vy) < 0.6) n.vy = 0;
  }

  if (n.fuse <= 0) {
    n.dead = true;
    var R = 42, i;
    explosion(n.x, n.y, 3);
    Snd.sfx('explode');
    Game.shake = Math.max(Game.shake, 7);
    for (i = 0; i < Game.enemies.length; i++) {
      var e = Game.enemies[i];
      if (e.dead) continue;
      var d2 = dist2(n.x, n.y, e.x + e.w / 2, e.y + e.h / 2);
      if (d2 < R * R) damageEnemy(e, 5, sign(e.x - n.x));
    }
    if (Game.boss && !Game.boss.dead) {
      var bd2 = dist2(n.x, n.y, Game.boss.x + Game.boss.w / 2, Game.boss.y + Game.boss.h / 2);
      if (bd2 < (R + 24) * (R + 24)) damageBoss(Game.boss, 7);
    }
    for (i = 0; i < Game.particles.length; i++) { /* cosmetic only */ }
  }
}

/* ---- arena hazards ------------------------------------------------------ */
function spawnDebris(x, count, delay) {
  for (var i = 0; i < count; i++) {
    Game.hazards.push({
      kind: 'debris',
      x: x + (i - (count - 1) / 2) * 26,
      y: -20,
      vy: 0,
      w: 12, h: 14,
      telegraph: 42 + (delay || 0),
      life: 240,
      dead: false
    });
  }
}

function spawnBeamAt(cx, cy, angle, spin, telegraph, active, len, w) {
  Game.hazards.push({
    kind: 'beam', cx: cx, cy: cy, angle: angle, spin: spin,
    telegraph: telegraph, active: active, len: len, w: w, dead: false
  });
}

function spawnBeam(b, count) {
  for (var i = 0; i < count; i++) {
    Game.hazards.push({
      kind: 'beam',
      cx: b.x + b.w / 2,
      cy: b.y + b.h / 2,
      angle: (i * Math.PI) + 0.4,
      spin: (i % 2 === 0 ? 1 : -1) * 0.012,
      telegraph: 70,
      active: 150,
      len: 420,
      w: 5,
      dead: false
    });
  }
}

function hazardUpdate(hz) {
  var pi, p;
  if (hz.kind === 'debris') {
    if (hz.telegraph > 0) { hz.telegraph--; return; }
    hz.vy = Math.min(hz.vy + 0.6, 13);
    hz.y += hz.vy;
    for (pi = 0; pi < Game.players.length; pi++) {
      p = Game.players[pi];
      if (!p || p.dead || p.downed) continue;
      if (aabb({ x: hz.x - hz.w / 2, y: hz.y - hz.h / 2, w: hz.w, h: hz.h },
               { x: p.x + 1, y: p.y + 1, w: p.w - 2, h: p.h - 2 })) {
        playerHurt(p, 1);
      }
    }
    if (hz.y > GROUND_Y) {
      hz.dead = true;
      explosion(hz.x, GROUND_Y - 4, 1);
      Game.shake = Math.max(Game.shake, 3);
      for (pi = 0; pi < Game.players.length; pi++) {
        p = Game.players[pi];
        if (!p || p.dead || p.downed) continue;
        if (Math.abs((p.x + p.w / 2) - hz.x) < 16 && Math.abs((p.y + p.h) - GROUND_Y) < 26) {
          playerHurt(p, 1);
        }
      }
    }
    return;
  }

  if (hz.kind === 'beam') {
    if (hz.telegraph > 0) { hz.telegraph--; return; }
    hz.active--;
    hz.angle += hz.spin;
    if (hz.active <= 0) { hz.dead = true; return; }

    /* damage anything crossing the beam */
    for (pi = 0; pi < Game.players.length; pi++) {
      p = Game.players[pi];
      if (!p || p.dead || p.downed) continue;
      var px2 = p.x + p.w / 2 - hz.cx;
      var py2 = p.y + p.h / 2 - hz.cy;
      var proj = px2 * Math.cos(hz.angle) + py2 * Math.sin(hz.angle);
      if (proj < 0 || proj > hz.len) continue;
      var perp = Math.abs(-px2 * Math.sin(hz.angle) + py2 * Math.cos(hz.angle));
      if (perp < hz.w / 2 + 4) playerHurt(p, 1);
    }
  }
}

/* ---- bosses ------------------------------------------------------------- */
function makeBoss(kind) {
  var def = BOSSES[kind];
  var arenaStart = Game.stage.arenaStart;
  return {
    kind: kind, def: def, name: def.name,
    x: arenaStart + ARENA_W - def.w - 20, y: GROUND_Y - def.h,
    w: def.w, h: def.h,
    hp: def.hp, maxHp: def.hp,
    age: 0, flash: 0, phase: 1, dir: -1,
    shootT: 100, specialT: 240, angle: 0, angle2: Math.PI,
    dead: false, dying: 0, active: false, introT: 90
  };
}

function damageBoss(b, dmg, hx, hy) {
  if (b.dead) return;

  /* weak point: the Warden's core takes double damage */
  if (b.kind === 'warden' && hx !== undefined) {
    var coreY = b.y + b.h - 42;
    if (hx > b.x + b.w / 2 - 12 && hx < b.x + b.w / 2 + 12 &&
        hy > coreY - 4 && hy < coreY + 22) {
      dmg *= 2;
      if (RNG.sChance(0.5)) floatText(hx, hy - 6, 'CORE', '#ffd257');
    }
  }

  b.hp -= dmg;
  b.flash = 6;
  Snd.sfx('bossHit');
  if (b.hp <= 0) {
    b.hp = 0;
    b.dead = true;
    b.dying = 120;
    var bgained = Math.round(b.def.score * (Game.scoreMul || 1));
    Game.score += bgained;
    floatText(b.x + b.w / 2, b.y, '+' + bgained, '#ffd257');
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
  var p = nearestPlayer(b.x + b.w / 2, b.y + b.h / 2) || Game.player;
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
  /* the arena is 480 wide but a portrait view can be 270 — keep the boss on screen */
  var leftBound = Math.max(arenaStart + 20, Game.camX + 30);
  var rightBound = Math.min(arenaStart + ARENA_W - b.w - 20, Game.camX + W - b.w - 30);
  if (rightBound < leftBound) rightBound = leftBound;
  var pcx = p.x + p.w / 2;
  var speed = b.phase === 2 ? 1.5 : 1.0;

  if (b.kind === 'warden') {
    b.y = GROUND_Y - b.h;
    if (b.x <= leftBound) b.dir = 1;
    if (b.x >= rightBound) b.dir = -1;
    b.x += b.dir * speed * 0.55;

    /* third attack: ceiling debris telegraphed by falling shadows */
    if (b.debrisT === undefined) b.debrisT = 320;
    if (b.debrisT-- <= 0) {
      var target = nearestPlayer(b.x + b.w / 2, b.y) || p;
      spawnDebris(target.x + target.w / 2, b.phase === 2 ? 5 : 3, 0);
      Snd.sfx('bossWarn');
      Game.shake = Math.max(Game.shake, 4);
      b.debrisT = b.phase === 2 ? 210 : 300;
    }

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

    /* summon darts on their own clock */
    if (b.summonT === undefined) b.summonT = 260;
    if (b.summonT-- <= 0) {
      spawnEnemy({ t: 'swarm', x: b.x + 10, y: b.y + 10 });
      spawnEnemy({ t: 'swarm', x: b.x + b.w - 10, y: b.y + 10 });
      Snd.sfx('bossWarn');
      b.summonT = b.phase === 2 ? 170 : 280;
    }
  }

  if (b.kind === 'heart') {
    b.x = arenaStart + ARENA_W / 2 - b.w / 2;
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

    /* rotating beams on their own clock */
    if (b.beamT === undefined) b.beamT = 300;
    if (b.beamT-- <= 0) {
      spawnBeam(b, b.phase === 2 ? 2 : 1);
      Snd.sfx('bossWarn');
      b.beamT = b.phase === 2 ? 300 : 380;
    }
  }

  /* ---------------------------------------------------------------- relay */
  if (b.kind === 'relay') {
    var rArena = Game.stage.arenaStart;
    b.x = rArena + ARENA_W / 2 - b.w / 2;
    b.y = GROUND_Y - b.h;
    var rp = nearestPlayer(b.x + b.w / 2, b.y) || Game.player;
    var rex = b.x + b.w / 2, rey = b.y + 17;
    b.angle = Math.atan2((rp.y + rp.h / 2) - rey, (rp.x + rp.w / 2) - rex);

    if (b.shootT-- <= 0) {
      var rn = b.phase === 2 ? 5 : 3;
      for (var ri = 0; ri < rn; ri++) {
        var ra = b.angle + (ri - (rn - 1) / 2) * 0.16;
        spawnBullet({
          x: rex, y: rey, vx: Math.cos(ra) * 3.2, vy: Math.sin(ra) * 3.2,
          dmg: 1, friendly: false, color: scheme().hostile, glow: scheme().hostileGlow,
          w: 5, h: 5, life: 200, angle: ra
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 58 : 86;
    }

    /* the mast sweeps a beam across the floor */
    if (b.specialT-- <= 0) {
      spawnBeamAt(rex, rey, Math.PI / 2 - 0.85, 0.017, 62, 140, 320, 4);
      if (b.phase === 2) spawnBeamAt(rex, rey, Math.PI / 2 + 0.85, -0.017, 62, 140, 320, 4);
      Snd.sfx('bossWarn');
      b.specialT = b.phase === 2 ? 250 : 330;
    }

    /* it is a relay: it calls for backup */
    if (b.summonT === undefined) b.summonT = 320;
    if (b.summonT-- <= 0) {
      spawnEnemy({ t: 'shielder', x: rArena + 40, y: GROUND_Y - 18 });
      spawnEnemy({ t: 'shielder', x: rArena + ARENA_W - 66, y: GROUND_Y - 18 });
      Snd.sfx('bossWarn');
      b.summonT = b.phase === 2 ? 250 : 350;
    }
  }

  /* ---------------------------------------------------------------- orbit */
  if (b.kind === 'orbit') {
    var oArena = Game.stage.arenaStart;
    var ocx = oArena + ARENA_W / 2, ocy = GROUND_Y - 96;
    var orad = b.phase === 2 ? 118 : 152;
    b.x = ocx + Math.cos(b.age * 0.014) * orad - b.w / 2;
    b.y = ocy + Math.sin(b.age * 0.014) * orad * 0.42 - b.h / 2;

    if (b.shootT-- <= 0) {
      var oarms = b.phase === 2 ? 8 : 6;
      b.angle += 0.4;
      for (var oi = 0; oi < oarms; oi++) {
        var oa = b.angle + oi * (Math.PI * 2 / oarms);
        spawnBullet({
          x: b.x + b.w / 2, y: b.y + b.h / 2,
          vx: Math.cos(oa) * 2.6, vy: Math.sin(oa) * 2.6,
          dmg: 1, friendly: false, color: '#8a7bff', glow: '#e6e9ff',
          w: 5, h: 5, life: 260, angle: oa
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 56 : 78;
    }

    /* drops mines where you are standing */
    if (b.specialT-- <= 0) {
      var op = nearestPlayer(b.x + b.w / 2, b.y) || Game.player;
      spawnDebris(op.x + op.w / 2, b.phase === 2 ? 4 : 2, 0);
      Snd.sfx('bossWarn');
      b.specialT = b.phase === 2 ? 240 : 320;
    }
  }

  /* ---------------------------------------------------------------- clock */
  if (b.kind === 'clock') {
    var cArena = Game.stage.arenaStart;
    b.x = cArena + ARENA_W / 2 - b.w / 2;
    b.y = GROUND_Y - b.h - 44;
    b.angle += b.phase === 2 ? 0.030 : 0.020;
    b.angle2 -= b.phase === 2 ? 0.044 : 0.028;

    var ccx = b.x + b.w / 2, ccy = b.y + b.h / 2;
    var cr = b.w / 2;

    if (b.shootT-- <= 0) {
      var hands = [b.angle, b.angle2];
      for (var hi2 = 0; hi2 < hands.length; hi2++) {
        var ha = hands[hi2];
        var hl = (hi2 === 0 ? cr - 10 : cr - 20);
        spawnBullet({
          x: ccx + Math.cos(ha) * hl, y: ccy + Math.sin(ha) * hl,
          vx: Math.cos(ha) * 3.4, vy: Math.sin(ha) * 3.4,
          dmg: 1, friendly: false, color: '#ffd257', glow: '#fff3c4',
          w: 5, h: 5, life: 240, angle: ha
        });
      }
      Snd.sfx('enemyShot');
      b.shootT = b.phase === 2 ? 32 : 46;
    }

    if (b.specialT-- <= 0) {
      var cp2b = nearestPlayer(ccx, ccy) || Game.player;
      spawnDebris(cp2b.x + cp2b.w / 2, 3, 0);
      Snd.sfx('bossWarn');
      b.specialT = 280;
    }
  }

  /* contact damage */
  for (var bi = 0; bi < Game.players.length; bi++) {
    var bp = Game.players[bi];
    if (bp && !bp.dead && !bp.downed &&
        aabb(b, { x: bp.x + 1, y: bp.y + 1, w: bp.w - 2, h: bp.h - 2 })) {
      playerHurt(bp, 1);
    }
  }
}

function drawBoss(g, b) {
  if (b.kind === 'warden') drawWarden(g, b);
  else if (b.kind === 'wraith') drawWraith(g, b);
  else if (b.kind === 'relay') drawRelay(g, b);
  else if (b.kind === 'orbit') drawOrbit(g, b);
  else if (b.kind === 'clock') drawClock(g, b);
  else drawHeart(g, b);
}
