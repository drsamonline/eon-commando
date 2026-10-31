/* ===========================================================================
   EON COMMANDO — 50 content
   Weapons, enemy statistics, and the three eras of the campaign.
   =========================================================================== */

var WEAPONS = {
  rifle:   { name: 'RIFLE',   cd: 9,  dmg: 1, speed: 6.4, color: '#ffd257', glow: '#fff3c4', sfx: 'rifle',   shots: 1, spread: 0,    pierce: 0, life: 70, w: 4, h: 2, jitter: 0.01 },
  spread:  { name: 'SPREAD',  cd: 15, dmg: 1, speed: 5.6, color: '#ff8a3c', glow: '#ffd9a8', sfx: 'spread',  shots: 3, spread: 0.20, pierce: 0, life: 60, w: 4, h: 3, jitter: 0.02 },
  machine: { name: 'MACHINE', cd: 4,  dmg: 1, speed: 7.4, color: '#9ef0ff', glow: '#e6fbff', sfx: 'machine', shots: 1, spread: 0,    pierce: 0, life: 70, w: 3, h: 2, jitter: 0.07 },
  laser:   { name: 'LASER',   cd: 14, dmg: 3, speed: 11,  color: '#54e0ff', glow: '#d8f8ff', sfx: 'laser',   shots: 1, spread: 0,    pierce: 3, life: 70, w: 9, h: 2, jitter: 0 },
  flame:   { name: 'FLAME',   cd: 3,  dmg: 1, speed: 3.4, color: '#ff5c3c', glow: '#ffd0a8', sfx: 'flame',   shots: 1, spread: 0.09, pierce: 2, life: 15, w: 7, h: 7, jitter: 0.12 }
};

var WEAPON_ORDER = ['rifle', 'spread', 'machine', 'laser', 'flame'];

var ENEMIES = {
  grunt:  { w: 12, h: 18, hp: 2, score: 100, gravity: true,  speed: 0.62, shootEvery: 118, bulletSpeed: 2.5, drop: 0.12 },
  runner: { w: 14, h: 15, hp: 2, score: 150, gravity: true,  speed: 1.75, shootEvery: 0,   bulletSpeed: 0,   drop: 0.10 },
  drone:  { w: 16, h: 10, hp: 2, score: 200, gravity: false, speed: 0.95, shootEvery: 96,  bulletSpeed: 2.2, drop: 0.18 },
  turret: { w: 16, h: 14, hp: 5, score: 250, gravity: true,  speed: 0,    shootEvery: 92,  bulletSpeed: 2.7, drop: 0.25 },
  jumper: { w: 14, h: 12, hp: 3, score: 200, gravity: true,  speed: 0.85, shootEvery: 130, bulletSpeed: 2.0, drop: 0.15 }
};

var BOSSES = {
  warden: {
    name: 'THE WARDEN', hp: 90, w: 58, h: 74, score: 3000,
    draw: 'warden', music: 'boss'
  },
  wraith: {
    name: 'GLACIER WRAITH', hp: 110, w: 64, h: 46, score: 4000,
    draw: 'wraith', music: 'boss'
  },
  heart: {
    name: 'THE EON HEART', hp: 150, w: 76, h: 76, score: 6000,
    draw: 'heart', music: 'boss'
  }
};

/* helper: ground enemy, y derived from its height */
function onGround(type, x) { return { t: type, x: x, y: GROUND_Y - ENEMIES[type].h }; }
function at(type, x, y) { return { t: type, x: x, y: y }; }

var STAGES = [
  /* ---------------------------------------------------------------- 1 ---- */
  {
    id: 1,
    name: 'ASHEN DAWN',
    tag: 'ERA I · THE BURNING CITY',
    length: 2840,
    arenaStart: 2360,
    checkpoint: 1180,
    checkpoints: [48, 640, 1180, 1700, 2140],
    boss: 'warden',
    music: 'stage1',
    seed: 1337,
    sky: ['#1a0f1e', '#3b1a24', '#6b2a26'],
    far: '#2a1420',
    mid: '#1d1018',
    near: '#120a10',
    ground: '#3a1f24',
    groundLit: '#6d3a34',
    groundDark: '#1d0f13',
    accent: '#ff7a45',
    fog: 'rgba(255,122,69,0.06)',
    groundSegs: [[0, 600], [640, 420], [1120, 380], [1560, 520], [2140, 700]],
    platforms: [
      { x: 250, y: 186, w: 76 }, { x: 420, y: 150, w: 64 },
      { x: 700, y: 190, w: 84 }, { x: 860, y: 152, w: 70 },
      { x: 1180, y: 178, w: 96 }, { x: 1330, y: 136, w: 64 },
      { x: 1620, y: 188, w: 80 }, { x: 1760, y: 148, w: 72 },
      { x: 1900, y: 108, w: 60 }, { x: 2180, y: 180, w: 90 },
      { x: 2300, y: 138, w: 70 }
    ],
    enemies: [
      onGround('grunt', 300), onGround('grunt', 470), at('turret', 452, 150 - 14),
      onGround('runner', 760), onGround('grunt', 900), at('drone', 1000, 90),
      onGround('grunt', 1220), at('jumper', 1290, 178 - 12), onGround('runner', 1420),
      at('drone', 1520, 76), onGround('grunt', 1700), onGround('turret', 1980),
      at('grunt', 1780, 148 - 18), onGround('runner', 2050), at('drone', 2140, 100),
      onGround('grunt', 2260), at('turret', 2320, 138 - 14)
    ],
    pickups: [
      { kind: 'weapon', w: 'spread', x: 300, y: 150 },
      { kind: 'health', x: 880, y: 118 },
      { kind: 'weapon', w: 'machine', x: 1350, y: 100 },
      { kind: 'coin', x: 1930, y: 74 },
      { kind: 'weapon', w: 'laser', x: 2200, y: 144 },
      { kind: 'health', x: 2180, y: 104 },
      { kind: 'coin', x: 640, y: 170 }
    ]
  },
  /* ---------------------------------------------------------------- 2 ---- */
  {
    id: 2,
    name: 'GLACIER EON',
    tag: 'ERA II · THE FROZEN VAULT',
    length: 3000,
    arenaStart: 2520,
    checkpoint: 1250,
    checkpoints: [48, 560, 1200, 1700, 2250],
    boss: 'wraith',
    music: 'stage2',
    seed: 90210,
    sky: ['#06131f', '#0d2b3d', '#1d5568'],
    far: '#12303f',
    mid: '#0b1e2b',
    near: '#06131c',
    ground: '#20404f',
    groundLit: '#5aa7bd',
    groundDark: '#0d2029',
    accent: '#7fe3ff',
    fog: 'rgba(127,227,255,0.06)',
    groundSegs: [[0, 520], [560, 300], [900, 260], [1200, 360], [1600, 240], [1880, 320], [2200, 320], [2520, 480]],
    platforms: [
      { x: 180, y: 184, w: 80 }, { x: 520, y: 150, w: 90 }, { x: 640, y: 110, w: 70 },
      { x: 860, y: 178, w: 80 }, { x: 990, y: 138, w: 76 },
      { x: 1160, y: 186, w: 70 }, { x: 1300, y: 146, w: 84 },
      { x: 1560, y: 176, w: 90 }, { x: 1700, y: 132, w: 66 },
      { x: 1840, y: 96, w: 60 }, { x: 2160, y: 178, w: 80 },
      { x: 2300, y: 138, w: 76 }, { x: 2440, y: 172, w: 70 }
    ],
    enemies: [
      onGround('grunt', 240), at('turret', 190, 184 - 14),
      onGround('runner', 420), at('drone', 520, 84),
      onGround('jumper', 700), onGround('grunt', 800), at('drone', 960, 100),
      onGround('runner', 1050), at('grunt', 1000, 138 - 18),
      onGround('grunt', 1250), at('turret', 1320, 146 - 14),
      onGround('runner', 1450), at('drone', 1560, 80),
      onGround('grunt', 1700), at('jumper', 1720, 132 - 12),
      onGround('turret', 1980), onGround('runner', 2080),
      at('drone', 2200, 96), onGround('grunt', 2320), at('grunt', 2320, 138 - 18),
      onGround('runner', 2450), at('turret', 2470, 172 - 14)
    ],
    pickups: [
      { kind: 'weapon', w: 'laser', x: 210, y: 148 },
      { kind: 'coin', x: 660, y: 74 },
      { kind: 'health', x: 1010, y: 100 },
      { kind: 'weapon', w: 'spread', x: 1320, y: 110 },
      { kind: 'coin', x: 1860, y: 60 },
      { kind: 'weapon', w: 'flame', x: 2180, y: 142 },
      { kind: 'health', x: 2320, y: 100 }
    ]
  },
  /* ---------------------------------------------------------------- 3 ---- */
  {
    id: 3,
    name: 'EON CORE',
    tag: 'ERA III · THE HEART OF TIME',
    length: 2880,
    arenaStart: 2400,
    checkpoint: 1200,
    checkpoints: [48, 520, 1250, 1700, 2000],
    boss: 'heart',
    music: 'stage3',
    seed: 424242,
    sky: ['#12061c', '#2a0a34', '#4b0f4a'],
    far: '#2a0c34',
    mid: '#1a0722',
    near: '#0f0416',
    ground: '#2d1240',
    groundLit: '#8a3fb0',
    groundDark: '#160722',
    accent: '#ff2d95',
    fog: 'rgba(255,45,149,0.07)',
    groundSegs: [[0, 480], [520, 340], [900, 300], [1240, 360], [1640, 280], [1960, 440], [2400, 480]],
    platforms: [
      { x: 200, y: 182, w: 84 }, { x: 400, y: 142, w: 66 },
      { x: 560, y: 176, w: 80 }, { x: 720, y: 132, w: 72 },
      { x: 940, y: 178, w: 76 }, { x: 1080, y: 138, w: 68 },
      { x: 1280, y: 182, w: 88 }, { x: 1440, y: 142, w: 72 },
      { x: 1600, y: 102, w: 60 }, { x: 1680, y: 172, w: 80 },
      { x: 1900, y: 138, w: 74 }, { x: 2050, y: 178, w: 86 },
      { x: 2200, y: 138, w: 70 }, { x: 2300, y: 186, w: 70 }
    ],
    enemies: [
      onGround('runner', 260), at('turret', 210, 182 - 14),
      onGround('grunt', 420), at('drone', 520, 90),
      onGround('jumper', 640), at('grunt', 730, 132 - 18),
      onGround('grunt', 830), at('drone', 940, 84),
      onGround('runner', 1000), at('turret', 1090, 138 - 14),
      onGround('grunt', 1150), onGround('runner', 1330),
      at('drone', 1440, 96), at('jumper', 1460, 142 - 12),
      onGround('grunt', 1560), at('grunt', 1610, 102 - 18),
      onGround('turret', 1800), onGround('runner', 1880),
      at('drone', 1960, 88), onGround('grunt', 2050), onGround('jumper', 2150),
      at('drone', 2260, 100), onGround('runner', 2340), at('turret', 2320, 186 - 14)
    ],
    pickups: [
      { kind: 'weapon', w: 'spread', x: 220, y: 146 },
      { kind: 'coin', x: 420, y: 106 },
      { kind: 'health', x: 740, y: 96 },
      { kind: 'weapon', w: 'machine', x: 1100, y: 102 },
      { kind: 'coin', x: 1620, y: 66 },
      { kind: 'weapon', w: 'laser', x: 2070, y: 142 },
      { kind: 'health', x: 2230, y: 102 },
      { kind: 'coin', x: 2320, y: 150 }
    ]
  }
];
