/* ===========================================================================
   LAN CO-OP — two players on the same Wi-Fi, no internet, no accounts.

   Lockstep input relay. Both machines run the same seeded simulation and only
   exchange 9-bit input masks per frame; each side refuses to advance frame N
   until it has both players' masks for N. That keeps them in perfect sync
   without ever sending world state.

   The simulation was already deterministic (seeded RNG, fixed 60 Hz step), and
   replays already proved masks are enough to reproduce a run — this reuses
   exactly that machinery.
   =========================================================================== */

var LAN = {
  active: false,
  role: null,          /* 'host' | 'client' */
  port: 8081,
  frame: 0,
  seed: 0,
  conn: null,
  status: 'idle',
  peerMasks: {},
  myMasks: {},
  outq: [],
  batch: 4,            /* send one message per 4 frames instead of per frame */
  delay: 12,           /* frames of input delay (~200 ms): absorbs the round trip */
  id: 'p' + Math.floor(Math.random() * 1e9),
  waitT: 0,
  stalls: 0,
  steps: 0,
  sentFrame: -1,
  started: false,

  available: function () { return typeof window !== 'undefined' && !!(window.Lan && window.Lan.client); },

  portFromUrl: function () {
    var m = /[?&]lanport=(\d+)/.exec(location.search || '');
    return m ? parseInt(m[1], 10) : 8081;
  },

  connect: function (role) {
    if (!this.available()) { this.status = 'LAN NEEDS THE HOST SERVER'; return false; }
    if (this.conn) return true;
    this.role = role;
    this.port = this.portFromUrl();
    this.status = role === 'host' ? 'WAITING FOR PLAYER 2' : 'CONNECTING...';
    var self = this;
    try {
      this.conn = window.Lan.client({
        url: window.Lan.hostUrl(this.port),
        onOpen: function () {
          self.status = role === 'host' ? 'WAITING FOR PLAYER 2' : 'CONNECTED, ASKING TO JOIN';
          if (role === 'client') self.send({ t: 'join' });
        },
        onMessage: function (m) { self.onMessage(m); },
        onError: function () { self.status = 'CONNECTION LOST'; }
      });
    } catch (e) {
      this.status = 'CANNOT REACH THE HOST';
      return false;
    }
    return true;
  },

  send: function (msg) {
    if (!this.conn) return;
    msg.from = this.id;
    try { this.conn.send(msg); } catch (e) {}
  },

  onMessage: function (m) {
    if (!m || !m.t) return;
    /* the room broadcasts to everyone, including the sender — without this the
       client reads its own input back as the other player's */
    if (m.from && m.from === this.id) return;
    if (m.t === 'join' && this.role === 'host') {
      this.seed = ((Date.now() ^ 0x5f3759df) >>> 0);
      this.send({ t: 'start', seed: this.seed });
      this.begin(this.seed);
    } else if (m.t === 'start' && this.role === 'client') {
      this.begin(m.seed >>> 0);
    } else if (m.t === 'in') {
      if (m.arr) { for (var i = 0; i < m.arr.length; i++) this.peerMasks[m.arr[i][0]] = m.arr[i][1]; }
      else this.peerMasks[m.f] = m.m;
    } else if (m.t === 'bye') {
      this.status = 'PLAYER 2 LEFT';
      this.stop();
    }
  },

  begin: function (seed) {
    this.active = true;
    this.started = true;
    this.frame = 0;
    this.seed = seed;
    this.myMasks = {};
    this.peerMasks = {};
    this.sentFrame = -1;
    this.waitT = 0; this.stalls = 0; this.steps = 0;
    this.outq = [];
    /* Prime the delay line so the first frames have neutral input rather than
       stalling while the buffer fills. This must come AFTER the two maps are
       reset — resetting them afterwards was what kept the session on frame 0. */
    for (var i = 0; i < this.delay; i++) { this.myMasks[i] = 0; this.peerMasks[i] = 0; }
    this.status = 'PLAYING';
    Snd.setMuted(false);
    Game.startGame(true, seed);
    /* a cutscene needs both players to press in sync, which lockstep cannot
       guarantee — a LAN run skips the story and starts on the field */
    Game.story = null;
    Game.state = 'playing';
    Game.lanSession = true;
  },

  stop: function () {
    this.active = false;
    this.started = false;
    Game.lanSession = false;
    if (this.conn) { try { this.conn.close(); } catch (e) {} }
    this.conn = null;
  },

  /* Called once per fixed step. Returns true when the frame may advance.
     Input is delayed by `delay` frames: what you press now is applied a few
     frames later, which gives the network that many frames to deliver it. That
     is the difference between playing and stuttering — without it every single
     frame waits on a round trip. */
  step: function () {
    var f = this.frame;

    /* refresh the live keyboard/touch/gamepad state first */
    Input.frame();

    var live = this.role === 'host' ? maskOf(Input.cur) : maskOf(Input.cur2);
    var ahead = f + this.delay;
    if (this.myMasks[ahead] === undefined) {
      this.myMasks[ahead] = live;
      this.outq.push([ahead, live]);
      /* One POST per frame is what cost the most: on a 2-core box it dragged a
         30 fps session to 6. The delay line means a small batch adds no input
         latency, so flush every few frames instead. */
      if (this.outq.length >= this.batch) {
        this.send({ t: 'in', arr: this.outq });
        this.outq = [];
      }
    }

    var mine = this.myMasks[f];
    var theirs = this.peerMasks[f];
    if (mine === undefined || theirs === undefined) {
      this.waitT++; this.stalls++;
      if (this.waitT > 600) this.status = 'WAITING FOR PLAYER 2';
      return false;
    }
    delete this.myMasks[f];
    delete this.peerMasks[f];
    this.waitT = 0;

    var m1 = this.role === 'host' ? mine : theirs;
    var m2 = this.role === 'host' ? theirs : mine;

    Input.prev = Input.cur;
    Input.cur = actionsFromMask(m1 & 511);
    Input.prev2 = Input.cur2;
    Input.cur2 = actionsFromMask(m2 & 511);

    this.frame++; this.steps++;
    return true;
  }
};
