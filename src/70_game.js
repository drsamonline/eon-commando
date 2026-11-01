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
  players: [],
  coop: false,
  enemies: [],
  bullets: [],
  particles: [],
  pickups: [],
  grenades: [],
  ghosts: [],
  hazards: [],
  hitStop: 0,
  settingsIndex: 0,
  remapPlayer: 'p1',
  remapIndex: 0,
  REMAP_ACTIONS: ['left', 'right', 'up', 'down', 'jump', 'fire', 'dash', 'melee', 'grenade'],
  pauseIndex: 0,
  hitRows: [],
  titleIndex: 0,
  mode: 'campaign',
  wave: 0, waveTimer: 0, waveActive: false, scoreMul: 1,
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

  startGame: function (coop, forcedSeed) {
    this.coop = !!coop;
    this.dailyRun = false;
    if (this.mode !== 'endless') this.mode = 'campaign';
    var d = diff();
    this.score = 0;
    this.lives = d.lives;
    this.stageIndex = 0;
    /* a fixed ?seed= or a replay makes a run reproducible; otherwise pick one */
    if (forcedSeed !== undefined && forcedSeed !== null) this.seed = forcedSeed >>> 0;
    else if (PARAMS.seed) this.seed = parseInt(PARAMS.seed, 10) >>> 0;
    else this.seed = ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    RNG.seed(this.seed);
    if (!this.replayMode) Rec.start(this.seed, this.coop);
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

    this.spawnPlayers();
    this.grenades = [];
    this.ghosts = [];
    this.hazards = [];
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

  spawnPlayers: function () {
    var d = diff();
    var p1 = makePlayer(48, GROUND_Y - 22);
    p1.invuln = 60;
    p1.maxHp = d.hp;
    p1.hp = d.hp;
    p1.grenades = 3;
    p1.maxGrenades = 3;
    this.players = [p1];
    if (this.coop) {
      var p2 = makePlayer(72, GROUND_Y - 22);
      p2.invuln = 60;
      p2.maxHp = d.hp;
      p2.hp = d.hp;
      p2.grenades = 3;
      p2.maxGrenades = 3;
      p2.ctl = Input.ctl2;
      p2.facing = 1;
      this.players.push(p2);
    }
    this.player = p1;
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
    this.spawnPlayers();
    var i;
    for (i = 0; i < this.players.length; i++) {
      var q = this.players[i];
      q.x = x + i * 24;
      q.y = GROUND_Y - 22;
      q.invuln = 110;
      q.weapon = 'rifle';
      q.grenades = 2;
    }
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
    this.hazards = [];
    this.banner = { text: 'WARNING', sub: this.boss.name, life: 150, color: '#ff4d6d' };
    this.flash = 0.4;
    Snd.sfx('bossWarn');
    Snd.playMusic(TRACKS.boss);
  },

  onBossDead: function () {
    if (this.mode === 'endless') {
      this.waveActive = false;
      this.waveTimer = 140;
      this.banner = { text: 'WAVE CLEAR', sub: 'KEEP GOING', life: 90, color: '#54ffa8' };
      return;
    }
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

  /* play back a recorded run: the sim is deterministic, so only inputs replay */
  /* ---- endless: waves in one arena, no traversal ---- */
  startEndless: function (coop) {
    this.mode = 'endless';
    this.startGame(coop, undefined);
    this.mode = 'endless';
    this.wave = 0;
    this.waveActive = false;
    this.waveTimer = 150;
    this.scoreMul = 1;
    this.pending = [];
    this.enemies = [];
    this.boss = null;

    /* lock the camera to the arena and shut the gate */
    var arena = this.stage.arenaStart;
    this.arenaLocked = true;
    this.bossTriggered = true;
    this.gate = { x: arena - 4, y: 0, w: 4, h: GROUND_Y + 60 };
    this.camX = clamp(arena + ARENA_W / 2 - W / 2, 0, Math.max(0, this.stage.length - W));
    for (var ei = 0; ei < this.players.length; ei++) {
      this.players[ei].x = arena + ARENA_W / 2 - 40 + ei * 26;
      this.players[ei].y = GROUND_Y - 22;
      this.players[ei].invuln = 90;
    }
    this.banner = { text: 'ENDLESS', sub: 'SURVIVE THE WAVES', life: 120, color: '#ff2d95' };
    Snd.playMusic(TRACKS.boss);
  },

  endlessSpawnWave: function () {
    this.wave++;
    this.waveActive = true;
    this.scoreMul = 1 + (this.wave - 1) * 0.15;

    var arena = this.stage.arenaStart;
    var left = arena + 30, right = arena + ARENA_W - 50;
    var count = Math.min(10, 2 + Math.floor(this.wave * 0.8));
    var pool = ['grunt', 'runner'];
    if (this.wave >= 2) pool.push('drone');
    if (this.wave >= 3) pool.push('jumper', 'sniper');
    if (this.wave >= 4) pool.push('swarm', 'shielder');
    if (this.wave >= 6) pool.push('turret', 'brute');

    var i;
    for (i = 0; i < count; i++) {
      var t = RNG.sPick(pool);
      var def = ENEMIES[t];
      var x = (i % 2 === 0) ? left + RNG.sr(0, 40) : right - RNG.sr(0, 40);
      var y = def.gravity ? GROUND_Y - def.h : GROUND_Y - 90 - RNG.sr(0, 40);
      spawnEnemy({ t: t, x: x, y: y });
    }

    /* a boss every fifth wave, on top of the crowd */
    if (this.wave % 5 === 0) {
      var kinds = ['warden', 'wraith', 'heart'];
      this.boss = makeBoss(kinds[Math.floor(this.wave / 5 - 1) % 3]);
      this.boss.introT = 60;
      this.banner = { text: 'WAVE ' + this.wave, sub: this.boss.name, life: 110, color: '#ff4d6d' };
      Snd.sfx('bossWarn');
    } else {
      this.banner = { text: 'WAVE ' + this.wave, sub: count + ' HOSTILES', life: 90, color: this.stage.accent };
      Snd.sfx('bossWarn');
    }
  },

  updateEndless: function () {
    if (!this.waveActive) {
      this.waveTimer--;
      if (this.waveTimer <= 0) this.endlessSpawnWave();
      return;
    }
    if (this.enemies.length === 0 && !this.boss) {
      this.waveActive = false;
      this.waveTimer = 130;
      var bonus = Math.round(250 * this.wave * this.scoreMul);
      this.score += bonus;
      floatText(this.player.x + 6, this.player.y - 12, '+' + bonus, '#ffd257');
      if (this.player) this.player.grenades = Math.min(this.player.maxGrenades, this.player.grenades + 1);
    }
  },

  startReplay: function (rec) {
    if (!rec) return false;
    this.replayMode = true;
    this.replayMasks = Rec.expand(rec);
    this.replayFrame = 0;
    Rec.recording = false;
    this.startGame(rec.coop, rec.seed);
    this.replayMode = true;
    this.state = 'playing';
    Snd.sfx('start');
    return true;
  },

  stopReplay: function () {
    this.replayMode = false;
    this.replayMasks = null;
    this.state = 'title';
    this.stateTimer = 0;
    Snd.stopMusic();
  },

  recordRun: function (result) {
    this.lastEntry = {
      score: this.score,
      stage: this.stage ? this.stage.name : '—',
      result: result,
      date: new Date().toISOString().slice(0, 10)
    };
    Scores.add(this.lastEntry);
    if (!this.replayMode) {
      var rec = Rec.stop();
      if (rec && rec.total > 30) Rec.save(rec);
    }
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

    /* a finished replay goes back to the title on any start press */
    if (this.replayMode && (this.state === 'gameover' || this.state === 'victory')) {
      this.stateTimer++;
      if (this.stateTimer > 40 && (Input.pressed('start') || Input.pressed('restart') ||
                                   Input.pressed('pause') || Input.pressed('fire'))) {
        this.stopReplay();
      }
      return;
    }

    switch (this.state) {
      case 'title':
        this.updateTitle();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'paused':
        this.updatePause();
        break;
      case 'settings':
        this.updateSettings();
        break;
      case 'remap':
        this.updateRemap();
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

  titleRows: function () {
    var rows = [
      { id: 'campaign', label: 'CAMPAIGN' },
      { id: 'endless', label: 'ENDLESS' },
      { id: 'daily', label: 'DAILY RUN' }
    ];
    if (Rec.has()) rows.push({ id: 'replay', label: 'WATCH LAST RUN' });
    rows.push({ id: 'coop', label: 'TWO PLAYERS: ' + (this.coop ? 'ON' : 'OFF') });
    return rows;
  },

  activateTitleRow: function (i) {
    var rows = this.titleRows();
    if (!rows[i]) return;
    var id = rows[i].id;
    Snd.sfx('select');
    if (id === 'campaign') this.startGame(this.coop);
    else if (id === 'endless') this.startEndless(this.coop);
    else if (id === 'daily') { this.startGame(this.coop, Daily.seed()); this.dailyRun = true; }
    else if (id === 'replay') this.startReplay(Rec.load());
    else if (id === 'coop') { this.coop = !this.coop; this.titleIndex = i; }
  },

  updateTitle: function () {
    if (!Snd.track) Snd.playMusic(TRACKS.title);
    this.stateTimer++;
    var n = this.titleRows().length;
    if (Input.pressed('up')) { this.titleIndex = (this.titleIndex + n - 1) % n; Snd.sfx('select'); }
    if (Input.pressed('down')) { this.titleIndex = (this.titleIndex + 1) % n; Snd.sfx('select'); }
    if (Input.pressed('start')) { this.activateTitleRow(this.titleIndex); return; }
    /* shortcuts that still work for muscle memory */
    if (Input.pressed('start2')) { this.startGame(true); return; }
    if (Input.pressed('daily')) { this.startGame(this.coop, Daily.seed()); this.dailyRun = true; return; }
    if (Input.pressed('replay') && Rec.has()) { this.startReplay(Rec.load()); return; }
  },

  pauseRows: function () {
    return [
      { id: 'resume', label: 'RESUME' },
      { id: 'settings', label: 'SETTINGS' },
      { id: 'controls', label: 'CONTROLS' },
      { id: 'restart', label: 'RESTART RUN' },
      { id: 'quit', label: 'QUIT TO TITLE' }
    ];
  },

  activatePauseRow: function (i) {
    var rows = this.pauseRows();
    if (!rows[i]) return;
    var id = rows[i].id;
    Snd.sfx('select');
    if (id === 'resume') this.state = 'playing';
    else if (id === 'settings') { this.state = 'settings'; this.settingsIndex = 0; }
    else if (id === 'controls') { this.state = 'remap'; this.remapIndex = 0; }
    else if (id === 'restart') { this.startGame(this.coop); }
    else if (id === 'quit') { this.state = 'title'; this.stateTimer = 0; Snd.stopMusic(); }
  },

  updatePause: function () {
    var n = this.pauseRows().length;
    if (Input.pressed('up')) { this.pauseIndex = (this.pauseIndex + n - 1) % n; Snd.sfx('select'); }
    if (Input.pressed('down')) { this.pauseIndex = (this.pauseIndex + 1) % n; Snd.sfx('select'); }
    if (Input.pressed('start')) { this.activatePauseRow(this.pauseIndex); return; }
    if (Input.pressed('settings')) { this.state = 'settings'; this.settingsIndex = 0; Snd.sfx('select'); return; }
    if (Input.pressed('pause')) { this.state = 'playing'; Snd.sfx('select'); }
  },

  /* a tap in logical canvas coordinates, dispatched by the current screen */
  tap: function (mx, my) {
    var i, r;
    if (this.state === 'title') {
      for (i = 0; i < this.hitRows.length; i++) {
        r = this.hitRows[i];
        if (my >= r.y0 && my <= r.y1) { this.titleIndex = r.i; this.activateTitleRow(r.i); return; }
      }
      return;
    }
    if (this.state === 'paused') {
      for (i = 0; i < this.hitRows.length; i++) {
        r = this.hitRows[i];
        if (my >= r.y0 && my <= r.y1) { this.pauseIndex = r.i; this.activatePauseRow(r.i); return; }
      }
      return;
    }
    if (this.state === 'settings') {
      for (i = 0; i < this.hitRows.length; i++) {
        r = this.hitRows[i];
        if (my >= r.y0 && my <= r.y1) {
          this.settingsIndex = r.i;
          if (r.i === 8) { this.state = 'remap'; this.remapIndex = 0; Snd.sfx('select'); return; }
          /* tap the right half to increase, the left half to decrease */
          var dir = (mx > W / 2) ? 1 : -1;
          this.nudgeSetting(r.i, dir);
          return;
        }
      }
      return;
    }
    if (this.state === 'remap') {
      for (i = 0; i < this.hitRows.length; i++) {
        r = this.hitRows[i];
        if (my >= r.y0 && my <= r.y1) { this.remapIndex = r.i; Snd.sfx('select'); return; }
      }
      if (my < this.hitRows.length ? false : false) return;
      /* tapping the header switches player */
      if (my > 36 && my < 52) {
        this.remapPlayer = this.remapPlayer === 'p1' ? 'p2' : 'p1';
        Snd.sfx('select');
      }
      return;
    }
    if (this.state === 'gameover' || this.state === 'victory') {
      this.stateTimer = 999;
      this.startGame(this.coop);
      return;
    }
    if (this.state === 'stageclear') return;
  },

  /* shared by keyboard and tap so the two cannot drift apart */
  nudgeSetting: function (i, dir) {
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
  },

  updateRemap: function () {
    var n = this.REMAP_ACTIONS.length;
    if (Input.listening) return;   /* a key press is being captured */

    if (Input.pressed('up')) { this.remapIndex = (this.remapIndex + n - 1) % n; Snd.sfx('select'); }
    if (Input.pressed('down')) { this.remapIndex = (this.remapIndex + 1) % n; Snd.sfx('select'); }
    if (Input.pressed('left') || Input.pressed('right')) {
      this.remapPlayer = this.remapPlayer === 'p1' ? 'p2' : 'p1';
      Snd.sfx('select');
    }
    if (Input.pressed('start')) {
      Input.listening = { player: this.remapPlayer, action: this.REMAP_ACTIONS[this.remapIndex] };
      Snd.sfx('select');
    }
    if (Input.pressed('restart')) {
      Input.resetBindings(this.remapPlayer);
      Snd.sfx('coin');
    }
    if (Input.pressed('pause')) {
      this.state = 'settings';
      Snd.sfx('select');
    }
  },

  updateSettings: function () {
    var rows = 9;
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
    if (this.settingsIndex === 8 && Input.pressed('start')) {
      this.state = 'remap';
      this.remapIndex = 0;
      Snd.sfx('select');
      return;
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

    var pi;
    for (pi = 0; pi < this.players.length; pi++) playerUpdate(this.players[pi]);

    /* co-op revive: stand near a downed partner to bring them back */
    for (pi = 0; pi < this.players.length; pi++) {
      var dp = this.players[pi];
      if (!dp.downed) continue;
      dp.downTimer--;
      var helper = null, hi;
      for (hi = 0; hi < this.players.length; hi++) {
        var other = this.players[hi];
        if (other === dp || other.dead || other.downed) continue;
        if (dist2(other.x, other.y, dp.x, dp.y) < 26 * 26) { helper = other; break; }
      }
      if (helper) {
        dp.reviveT++;
        if (dp.reviveT > 55) {
          dp.downed = false;
          dp.hp = 1;
          dp.invuln = 100;
          dp.reviveT = 0;
          floatText(dp.x, dp.y - 8, 'REVIVED', '#54ffa8');
          Snd.sfx('health');
        }
      } else {
        dp.reviveT = Math.max(0, dp.reviveT - 2);
      }
      if (dp.downTimer <= 0) {
        dp.downed = false;
        dp.dead = true;
        dp.deadTimer = 0;
        Snd.sfx('death');
      }
    }

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
      for (i = 0; i < this.hazards.length; i++) if (!this.hazards[i].dead) hazardUpdate(this.hazards[i]);
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

    if (this.mode === 'endless') {
      this.updateEndless();
    } else if (!this.bossTriggered && p.x + p.w / 2 > this.stage.arenaStart + 70) {
      /* boss trigger */
      this.triggerBoss();
    }

    /* camera — frames every live player */
    var target;
    if (this.arenaLocked) {
      /* centre the fixed-width arena, letting a wide screen see the walls */
      target = this.stage.arenaStart + ARENA_W / 2 - W / 2;
    } else {
      var sumX = 0, n = 0, ci;
      for (ci = 0; ci < this.players.length; ci++) {
        var cp2 = this.players[ci];
        if (cp2.dead) continue;
        sumX += cp2.x + cp2.w / 2;
        n++;
      }
      var midX = n ? sumX / n : (p.x + p.w / 2);
      target = midX - W * 0.42;
    }
    target = clamp(target, 0, this.stage.length - W);
    this.camX = lerp(this.camX, target, 0.14);
    if (Math.abs(this.camX - target) < 0.4) this.camX = target;

    /* keep co-op partners from walking off the shared screen */
    if (this.players.length > 1) {
      for (var li = 0; li < this.players.length; li++) {
        var lp = this.players[li];
        if (lp.dead || lp.downed) continue;
        /* soft leash: push back toward the view, never teleport */
        var lo = this.camX + 6, hiX = this.camX + W - lp.w - 6;
        if (lp.x < lo) { lp.x = Math.min(lo, lp.x + 3); if (lp.vx < 0) lp.vx = 0; }
        else if (lp.x > hiX) { lp.x = Math.max(hiX, lp.x - 3); if (lp.vx > 0) lp.vx = 0; }
      }
    }

    /* death handling — a life is lost only when nobody is left standing */
    var live = 0, downed = 0, settled = true, di;
    for (di = 0; di < this.players.length; di++) {
      var qp = this.players[di];
      if (!qp.dead && !qp.downed) live++;
      if (qp.downed) downed++;
      if (!(qp.dead && qp.deadTimer > 90)) settled = false;
    }
    if (live === 0 && downed === 0 && settled) {
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
    this.hazards = this.hazards.filter(function (hz) { return !hz.dead; });
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
