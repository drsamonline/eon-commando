/* ===========================================================================
   EON COMMANDO — 20 audio
   A tiny chiptune engine: two-pulse leads, a triangle bass and a noise kit.
   Everything is synthesised at runtime — the game ships zero audio files.
   =========================================================================== */

var Snd = {
  ctx: null, master: null, musicBus: null, sfxBus: null,
  muted: false, started: false,
  track: null, step: 0, nextTime: 0, timer: null, stepDur: 0.125,

  init: function () {
    if (this.ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch (e) { return; }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.85;
    this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.42;
    this.musicBus.connect(this.master);
    this.started = true;
  },

  resume: function () {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (e) {}
    }
  },

  setMuted: function (m) {
    this.muted = !!m;
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
  },

  /* ---- primitives -------------------------------------------------------- */
  blip: function (o) {
    if (!this.ctx || this.muted) return;
    var t0 = this.ctx.currentTime + (o.delay || 0);
    var dur = o.dur || 0.08;
    var osc = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.freq || 440, t0);
    if (o.slide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.freq * o.slide), t0 + dur);
    }
    var vol = (o.vol === undefined ? 0.2 : o.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(o.bus || this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  noise: function (o) {
    if (!this.ctx || this.muted) return;
    var t0 = this.ctx.currentTime + (o.delay || 0);
    var dur = o.dur || 0.1;
    var len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = this.ctx.createBufferSource();
    src.buffer = buf;
    var filt = this.ctx.createBiquadFilter();
    filt.type = o.filter || 'bandpass';
    filt.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.sweep) filt.frequency.exponentialRampToValueAtTime(Math.max(60, o.freq * o.sweep), t0 + dur);
    filt.Q.value = o.q === undefined ? 0.9 : o.q;
    var g = this.ctx.createGain();
    var vol = (o.vol === undefined ? 0.2 : o.vol);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(o.bus || this.sfxBus);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  },

  /* ---- named effects ----------------------------------------------------- */
  sfx: function (name) {
    if (!this.started) return;
    var B = this.blip.bind(this), N = this.noise.bind(this);
    switch (name) {
      case 'rifle':
        B({ freq: 720, slide: 0.45, dur: 0.06, type: 'square', vol: 0.14 });
        N({ freq: 2600, dur: 0.05, vol: 0.09, filter: 'highpass' });
        break;
      case 'machine':
        B({ freq: 880, slide: 0.5, dur: 0.04, type: 'square', vol: 0.1 });
        break;
      case 'spread':
        B({ freq: 520, slide: 0.35, dur: 0.09, type: 'sawtooth', vol: 0.13 });
        N({ freq: 1500, dur: 0.08, vol: 0.1 });
        break;
      case 'laser':
        B({ freq: 1500, slide: 0.25, dur: 0.12, type: 'sawtooth', vol: 0.12 });
        B({ freq: 2100, slide: 0.3, dur: 0.09, type: 'square', vol: 0.06, delay: 0.01 });
        break;
      case 'flame':
        N({ freq: 900, sweep: 0.4, dur: 0.12, vol: 0.11, filter: 'lowpass', q: 1.2 });
        break;
      case 'enemyShot':
        B({ freq: 300, slide: 0.6, dur: 0.08, type: 'square', vol: 0.07 });
        break;
      case 'jump':
        B({ freq: 300, slide: 2.2, dur: 0.11, type: 'square', vol: 0.12 });
        break;
      case 'land':
        N({ freq: 420, dur: 0.06, vol: 0.08, filter: 'lowpass' });
        break;
      case 'hit':
        N({ freq: 1800, dur: 0.05, vol: 0.14, filter: 'bandpass', q: 2 });
        B({ freq: 240, slide: 0.6, dur: 0.05, type: 'square', vol: 0.07 });
        break;
      case 'hurt':
        B({ freq: 200, slide: 0.3, dur: 0.28, type: 'sawtooth', vol: 0.2 });
        N({ freq: 700, sweep: 0.3, dur: 0.3, vol: 0.16 });
        break;
      case 'explode':
        N({ freq: 1200, sweep: 0.12, dur: 0.42, vol: 0.26, filter: 'lowpass', q: 0.6 });
        B({ freq: 130, slide: 0.25, dur: 0.3, type: 'square', vol: 0.12 });
        break;
      case 'bigExplode':
        N({ freq: 1600, sweep: 0.08, dur: 0.9, vol: 0.32, filter: 'lowpass', q: 0.5 });
        B({ freq: 90, slide: 0.2, dur: 0.7, type: 'sawtooth', vol: 0.18 });
        break;
      case 'pickup':
        B({ freq: 660, dur: 0.06, type: 'square', vol: 0.13 });
        B({ freq: 990, dur: 0.09, type: 'square', vol: 0.13, delay: 0.06 });
        B({ freq: 1320, dur: 0.1, type: 'square', vol: 0.1, delay: 0.12 });
        break;
      case 'health':
        B({ freq: 520, dur: 0.07, type: 'triangle', vol: 0.16 });
        B({ freq: 780, dur: 0.12, type: 'triangle', vol: 0.14, delay: 0.07 });
        break;
      case 'coin':
        B({ freq: 1180, dur: 0.05, type: 'square', vol: 0.09 });
        B({ freq: 1560, dur: 0.07, type: 'square', vol: 0.07, delay: 0.05 });
        break;
      case 'select':
        B({ freq: 880, dur: 0.04, type: 'square', vol: 0.12 });
        break;
      case 'start':
        B({ freq: 440, dur: 0.08, type: 'square', vol: 0.16 });
        B({ freq: 660, dur: 0.08, type: 'square', vol: 0.16, delay: 0.08 });
        B({ freq: 880, dur: 0.16, type: 'square', vol: 0.16, delay: 0.16 });
        break;
      case 'death':
        B({ freq: 420, slide: 0.12, dur: 0.7, type: 'sawtooth', vol: 0.22 });
        N({ freq: 900, sweep: 0.1, dur: 0.7, vol: 0.16 });
        break;
      case 'stageClear':
        [523, 659, 784, 1046].forEach(function (f, i) {
          B({ freq: f, dur: 0.14, type: 'square', vol: 0.15, delay: i * 0.11 });
        });
        break;
      case 'gameOver':
        [392, 330, 262, 196].forEach(function (f, i) {
          B({ freq: f, dur: 0.3, type: 'triangle', vol: 0.18, delay: i * 0.22 });
        });
        break;
      case 'bossWarn':
        B({ freq: 180, dur: 0.25, type: 'sawtooth', vol: 0.2 });
        B({ freq: 180, dur: 0.25, type: 'sawtooth', vol: 0.2, delay: 0.35 });
        break;
      case 'bossHit':
        N({ freq: 500, sweep: 0.5, dur: 0.12, vol: 0.18, filter: 'bandpass', q: 1.5 });
        B({ freq: 160, slide: 0.7, dur: 0.1, type: 'square', vol: 0.1 });
        break;
    }
  },

  /* ---- music ------------------------------------------------------------- */
  playMusic: function (track) {
    this.init();
    if (!this.ctx) return;
    if (this.track === track) return;
    this.track = track;
    this.step = 0;
    this.stepDur = 60 / track.bpm / 4;              // 16th notes
    this.nextTime = this.ctx.currentTime + 0.08;
    if (this.timer) return;
    var self = this;
    this.timer = setInterval(function () { self.schedule(); }, 40);
  },

  stopMusic: function () {
    this.track = null;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  schedule: function () {
    if (!this.ctx || !this.track) return;
    var lookahead = this.ctx.currentTime + 0.25;
    var guard = 0;
    while (this.nextTime < lookahead && guard++ < 64) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += this.stepDur;
      this.step = (this.step + 1) % 16;
    }
  },

  midi: function (n) { return 440 * Math.pow(2, (n - 69) / 12); },

  playStep: function (step, time) {
    var tr = this.track;
    if (!tr || this.muted) return;
    var delay = Math.max(0, time - this.ctx.currentTime);

    var bass = tr.bass[step];
    if (bass !== null && bass !== undefined) {
      this.blip({ freq: this.midi(tr.root + bass), dur: this.stepDur * 1.7,
                  type: 'triangle', vol: 0.3, delay: delay, bus: this.musicBus });
    }
    var lead = tr.lead[step];
    if (lead !== null && lead !== undefined) {
      this.blip({ freq: this.midi(tr.root + 24 + lead), dur: this.stepDur * 1.1,
                  type: 'square', vol: 0.1, delay: delay, bus: this.musicBus });
    }
    var drum = tr.drums.charAt(step);
    if (drum === 'k') {
      this.noise({ freq: 140, dur: 0.1, vol: 0.22, filter: 'lowpass', delay: delay, bus: this.musicBus });
    } else if (drum === 's') {
      this.noise({ freq: 2000, dur: 0.09, vol: 0.13, filter: 'highpass', delay: delay, bus: this.musicBus });
    } else if (drum === 'h') {
      this.noise({ freq: 7000, dur: 0.03, vol: 0.05, filter: 'highpass', delay: delay, bus: this.musicBus });
    }
  }
};

/* ---- tracks ------------------------------------------------------------- */
var TRACKS = {
  title: {
    bpm: 96, root: 45,
    bass: [0, null, null, null, 0, null, -2, null, -4, null, null, null, -5, null, null, null],
    lead: [null, 12, null, 15, null, 12, null, 10, null, 7, null, 10, null, 12, null, null],
    drums: 'k.......s.......'
  },
  stage1: {
    bpm: 132, root: 45,
    bass: [0, 0, null, 0, 7, null, 0, null, 3, null, 3, null, 5, null, 7, null],
    lead: [12, null, 15, null, 19, null, 15, null, 12, null, 10, null, 12, null, 15, null],
    drums: 'k..h.s..k.kh.s.h'
  },
  stage2: {
    bpm: 124, root: 43,
    bass: [0, null, 0, null, -2, null, 3, null, 5, null, 3, null, 0, null, -2, null],
    lead: [null, 12, 14, null, 15, null, 14, 12, null, 10, 12, null, 14, null, null, 12],
    drums: 'k...s..hk...s.hh'
  },
  stage3: {
    bpm: 144, root: 41,
    bass: [0, 0, 12, 0, 0, 0, 10, 0, 0, 0, 8, 0, 7, 7, 6, 6],
    lead: [19, null, 18, null, 15, null, 18, null, 19, null, 22, null, 19, null, 15, null],
    drums: 'k.hks.hkk.hks.hk'
  },
  boss: {
    bpm: 152, root: 40,
    bass: [0, 0, 0, 0, 1, 1, 0, 0, -2, -2, -2, -2, 3, 3, 1, 1],
    lead: [12, 13, 12, 10, 12, 15, 12, 10, 12, 13, 12, 10, 7, 8, 10, 12],
    drums: 'k.hks.hkk.hks.hk'
  }
};
