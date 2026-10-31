/* ===========================================================================
   EON COMMANDO — 70 game
   State machine, stage flow, camera, spawning, scoring, save.
   =========================================================================== */

var Game = {
  state: 'title',
  stageIndex: 0,
  stage: null,
  bg: null,
  player: null,
  enemies: [],
  bullets: [],
  particles: [],
  pickups: [],
  grenades: [],
  ghosts: [],
  hitStop: 0,
  settingsIndex: 0,
  lastEntry: null,
  floaters: [],
  pending: [],
  boss: null,
  gate: null,
  camX: 0,
  score: 0,
  lives: 3,
  hiScore: 0,
  shake: 0,
  flash: 0,
  time: 0,
  frames: 0,
  stateTimer: 0,
  banner: null,
  arenaLocked: false,
  bossTriggered: false,
  stageTime: 0,
  lastRun: null,
  errors: [],

  init: function () {
    this.hiScore = Store.get('hiScore', 0) || 0;
    this.state = 'title';
    this.stateTimer = 0;
    this.stage = STAGES[0];
    this.bg = makeBackground(STAGES[0]);
    this.camX = 0;
    this.time = 0;
  },

  startGame: function () {
    var d = diff();
    this.score = 0;
    this.lives = d.lives;
    this.stageIndex = 0;
    RNG.seed((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    Stats.bump('runs');
    this.stateTimer = 0;
    Snd.resume();
    Snd.sfx('start');
    this.loadStage(0);
    this.state = 'playing';
  },

  loadStage: function (i) {
    this.stageIndex = i;
    this.stage = STAGES[i];
    this.bg = makeBackground(this.stage);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.pickups = [];
    this.floaters = [];
    this.boss = null;
    this.gate = null;
    this.camX = 0;
    this.arenaLocked = false;
    this.bossTriggered = false;
    this.stageTime = 0;
    this.shake = 0;
    this.flash = 0;

    this.player = makePlayer(48, GROUND_Y - 22);
    this.player.invuln = 60;
    this.player.maxHp = diff().hp;
    this.player.hp = diff().hp;
    this.player.grenades = 3;
    this.player.maxGrenades = 3;
    this.grenades = [];
    this.ghosts = [];
    this.hitStop = 0;

    this.pending = this.stage.enemies.slice().sort(function (a, b) { return a.x - b.x; });
    for (var k = 0; k < this.stage.pickups.length; k++) {
      var pk = this.stage.pickups[k];
      spawnPickup({
        kind: pk.kind, w: pk.w, x: pk.x, y: pk.y,
        label: pk.w ? WEAPONS[pk.w].name.charAt(0) : 'W'
      });
    }
    this.banner = { text: 'ERA ' + (i + 1), sub: this.stage.name, life: 130, color: this.stage.accent };
    Snd.playMusic(TRACKS[this.stage.music]);
  },

  checkpointX: function () {
    if (this.arenaLocked) return this.stage.arenaStart + 40;
    var cps = this.stage.checkpoints || [48];
    var best = cps[0];
    var px = this.player ? this.player.x : 0;
    for (var i = 0; i < cps.length; i++) if (px >= cps[i]) best = cps[i];
    return best;
  },

  respawn: function () {
    var x = this.checkpointX();
    this.player = makePlayer(x, GROUND_Y - 22);
    this.player.maxHp = diff().hp;
    this.player.hp = diff().hp;
    this.player.invuln = 110;
    this.player.weapon = 'rifle';
    this.player.grenades = 2;
    this.grenades = [];
    if (this.arenaLocked) {
      this.bullets = this.bullets.filter(function (b) { return b.friendly; });
    }
    Snd.playMusic(TRACKS[this.stage.music]);
  },

  triggerBoss: function () {
    this.bossTriggered = true;
    this.arenaLocked = true;
    this.gate = { x: this.stage.arenaStart - 4, y: 0, w: 4, h: GROUND_Y + 60 };
    this.boss = makeBoss(this.stage.boss);
    this.banner = { text: 'WARNING', sub: this.boss.name, life: 150, color: '#ff4d6d' };
    this.flash = 0.4;
    Snd.sfx('bossWarn');
    Snd.playMusic(TRACKS.boss);
  },

  onBossDead: function () {
    this.state = 'stageclear';
    this.stateTimer = 0;
    var bonus = 1500 + this.player.hp * 250 + this.lives * 500;
    this.lastRun = {
      stage: this.stage.name,
      bonus: bonus,
      hp: this.player.hp,
      lives: this.lives
    };
    this.score += bonus;
    Snd.sfx('stageClear');
    Snd.stopMusic();
  },

  gameOver: function () {
    this.state = 'gameover';
    this.stateTimer = 0;
    Snd.sfx('gameOver');
    Snd.stopMusic();
    this.saveHi();
    this.recordRun('GAME OVER');
  },

  recordRun: function (result) {
    this.lastEntry = {
      score: this.score,
      stage: this.stage ? this.stage.name : '—',
      result: result,
      date: new Date().toISOString().slice(0, 10)
    };
    Scores.add(this.lastEntry);
    Stats.bump('best', 0);
    var st = Stats.get();
    if (this.score > (st.best || 0)) Stats.bump('best', this.score - (st.best || 0));
    Stats.bump('time', Math.round(this.frames / 60));
  },

  victory: function () {
    this.state = 'victory';
    this.stateTimer = 0;
    Snd.sfx('stageClear');
    Snd.stopMusic();
    this.saveHi();
    this.recordRun('EON SECURED');
  },

  saveHi: function () {
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      Store.set('hiScore', this.hiScore);
    }
  },

  /* ---- per-frame ------------------------------------------------------- */
  update: function () {
    this.time++;
    this.frames++;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - 0.55);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - 0.045);

    if (this.banner) {
      this.banner.life--;
      if (this.banner.life <= 0) this.banner = null;
    }

    if (Input.pressed('mute')) {
      Snd.setMuted(!Snd.muted);
      Store.set('muted', Snd.muted);
    }

    switch (this.state) {
      case 'title':
        this.updateTitle();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'paused':
        if (Input.pressed('settings') || Input.pressed('down') && Input.held('settings')) {
          this.state = 'settings';
          this.settingsIndex = 0;
          Snd.sfx('select');
        } else if (Input.pressed('pause') || Input.pressed('start')) {
          this.state = 'playing';
          Snd.sfx('select');
        }
        break;
      case 'settings':
        this.updateSettings();
        break;
      case 'stageclear':
        this.updateStageClear();
        break;
      case 'gameover':
      case 'victory':
        this.stateTimer++;
        this.updateParticles();
        if (this.stateTimer > 60 && (Input.pressed('start') || Input.pressed('restart'))) {
          this.startGame();
        }
        break;
    }
  },

  updateTitle: function () {
    if (!Snd.track) Snd.playMusic(TRACKS.title);
    this.stateTimer++;
    if (Input.pressed('start') || Input.pressed('jump') || Input.pressed('fire')) {
      this.startGame();
    }
  },

  updateSettings: function () {
    var rows = 8;
    if (Input.pressed('up')) { this.settingsIndex = (this.settingsIndex + rows - 1) % rows; Snd.sfx('select'); }
    if (Input.pressed('down')) { this.settingsIndex = (this.settingsIndex + 1) % rows; Snd.sfx('select'); }
    var dir = (Input.pressed('right') ? 1 : 0) - (Input.pressed('left') ? 1 : 0);
    if (dir) {
      var i = this.settingsIndex;
      if (i === 0) SET.difficulty = clamp(SET.difficulty + dir, 0, 2);
      else if (i === 1) SET.palette = clamp(SET.palette + dir, 0, 2);
      else if (i === 2) SET.reduceMotion = SET.reduceMotion ? 0 : 1;
      else if (i === 3) SET.flash = clamp(Math.round((SET.flash + dir * 0.25) * 100) / 100, 0, 1);
      else if (i === 4) SET.hudScale = clamp(Math.round((SET.hudScale + dir * 0.15) * 100) / 100, 0.85, 1.3);
      else if (i === 5) SET.music = clamp(Math.round((SET.music + dir * 0.2) * 100) / 100, 0, 1);
      else if (i === 6) SET.sfx = clamp(Math.round((SET.sfx + dir * 0.2) * 100) / 100, 0, 1);
      else if (i === 7) SET.autoFire = SET.autoFire ? 0 : 1;
      saveSettings();
      Snd.applyVolumes();
      Snd.sfx('coin');
    }
    if (Input.pressed('pause') || Input.pressed('start') || Input.pressed('settings')) {
      this.state = 'paused';
      Snd.sfx('select');
    }
  },

  updatePlaying: function () {
    this.stageTime++;

    var p = this.player;

    /* Hit-stop freezes the world for a few frames so impacts land — but the
       commando keeps running, otherwise a press during the freeze is swallowed. */
    var frozen = this.hitStop > 0;
    if (frozen) this.hitStop--;

    if (Input.pressed('pause')) {
      this.state = 'paused';
      Snd.sfx('select');
      return;
    }

    playerUpdate(p);

    /* spawn enemies as the camera approaches */
    while (this.pending.length && this.pending[0].x < this.camX + W + 80) {
      spawnEnemy(this.pending.shift());
    }

    var i;
    if (!frozen) {
      for (i = 0; i < this.enemies.length; i++) if (!this.enemies[i].dead) enemyUpdate(this.enemies[i]);
      for (i = 0; i < this.bullets.length; i++) if (!this.bullets[i].dead) bulletUpdate(this.bullets[i]);
    }
    this.updateParticles();
    for (i = 0; i < this.pickups.length; i++) if (!this.pickups[i].dead) pickupUpdate(this.pickups[i]);
    if (!frozen) {
      for (i = 0; i < this.grenades.length; i++) if (!this.grenades[i].dead) grenadeUpdate(this.grenades[i]);
    }
    for (i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].life--;
      if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
    }

    for (i = this.floaters.length - 1; i >= 0; i--) {
      var f = this.floaters[i];
      f.y -= 0.45;
      f.life--;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }

    if (!frozen) {
      if (this.boss && !this.boss.dead) bossUpdate(this.boss);
      else if (this.boss && this.boss.dead) bossUpdate(this.boss);
    }

    /* boss trigger */
    if (!this.bossTriggered && p.x + p.w / 2 > this.stage.arenaStart + 70) {
      this.triggerBoss();
    }

    /* camera */
    var target;
    if (this.arenaLocked) {
      /* centre the fixed-width arena, letting a wide screen see the walls */
      target = this.stage.arenaStart + ARENA_W / 2 - W / 2;
    } else {
      target = p.x + p.w / 2 - W * 0.42;
    }
    target = clamp(target, 0, this.stage.length - W);
    this.camX = lerp(this.camX, target, 0.14);
    if (Math.abs(this.camX - target) < 0.4) this.camX = target;

    /* death handling */
    if (p.dead && p.deadTimer > 90) {
      this.lives--;
      if (this.lives < 0) {
        this.gameOver();
      } else {
        this.respawn();
      }
    }

    /* housekeeping */
    this.enemies = this.enemies.filter(function (e) { return !e.dead; });
    this.bullets = this.bullets.filter(function (b) { return !b.dead; });
    this.particles = this.particles.filter(function (pt) { return !pt.dead; });
    this.pickups = this.pickups.filter(function (c) { return !c.dead; });
    this.grenades = this.grenades.filter(function (n) { return !n.dead; });
  },

  updateParticles: function () {
    for (var i = 0; i < this.particles.length; i++) {
      if (!this.particles[i].dead) particleUpdate(this.particles[i]);
    }
    this.particles = this.particles.filter(function (pt) { return !pt.dead; });
  },

  updateStageClear: function () {
    this.stateTimer++;
    this.updateParticles();
    if (this.stateTimer > 160) {
      if (this.stageIndex + 1 < STAGES.length) {
        this.loadStage(this.stageIndex + 1);
        this.state = 'playing';
      } else {
        this.victory();
      }
    }
  },

  /* ---- input from the page --------------------------------------------- */
  pressStart: function () {
    if (this.state === 'title' || this.state === 'gameover' || this.state === 'victory') {
      if (this.state !== 'title') this.stateTimer = 999;
      this.startGame();
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }
};
