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
  jumper: { w: 14, h: 12, hp: 3, score: 200, gravity: true,  speed: 0.85, shootEvery: 130, bulletSpeed: 2.0, drop: 0.15 },
  sniper: { w: 12, h: 18, hp: 2, score: 300, gravity: true,  speed: 0,    shootEvery: 165, bulletSpeed: 4.8, drop: 0.22 },
  swarm:  { w: 8,  h: 8,  hp: 1, score: 80,  gravity: false, speed: 1.7,  shootEvery: 0,   bulletSpeed: 0,   drop: 0.05 },
  brute:  { w: 18, h: 22, hp: 9, score: 400, gravity: true,  speed: 0.95, shootEvery: 0,   bulletSpeed: 0,   drop: 0.4 },
  shielder:{ w: 14, h: 18, hp: 4, score: 300, gravity: true, speed: 0.5,  shootEvery: 150, bulletSpeed: 2.4, drop: 0.28 }
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
  },
  relay: {
    name: 'THE DROWNED RELAY', hp: 130, w: 46, h: 96, score: 5000,
    draw: 'relay', music: 'boss'
  },
  orbit: {
    name: 'ORBIT WRECK', hp: 160, w: 56, h: 56, score: 6500,
    draw: 'orbit', music: 'boss'
  },
  clock: {
    name: 'THE LAST SECOND', hp: 200, w: 84, h: 84, score: 9000,
    draw: 'clock', music: 'boss'
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
    length: 3000,
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
    groundSegs: [[0, 600], [640, 420], [1120, 380], [1560, 520], [2140, 860]],
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
      onGround('grunt', 2260), at('turret', 2320, 138 - 14),
      onGround('sniper', 1640), onGround('shielder', 1860), at('swarm', 1080, 120)
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
    length: 3160,
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
    groundSegs: [[0, 520], [560, 300], [900, 260], [1200, 360], [1600, 240], [1880, 320], [2200, 320], [2520, 640]],
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
      onGround('runner', 2450), at('turret', 2470, 172 - 14),
      onGround('sniper', 1760), onGround('brute', 2040), at('swarm', 1180, 110)
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
    length: 3040,
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
    groundSegs: [[0, 480], [520, 340], [900, 300], [1240, 360], [1640, 280], [1960, 440], [2400, 640]],
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
      at('drone', 2260, 100), onGround('runner', 2340), at('turret', 2320, 186 - 14),
      onGround('shielder', 1500), onGround('brute', 1750), onGround('sniper', 2100), at('swarm', 960, 100)
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


/* ===========================================================================
   ERAS IV–VI — the campaign doubles. New palettes, new ground, harder mixes.
   =========================================================================== */
STAGES.push(
  {
    id: 4,
    name: 'SUNKEN RELAY',
    tag: 'ERA IV · THE DROWNED SIGNAL',
    length: 3000,
    arenaStart: 2360,
    checkpoint: 1200,
    checkpoints: [48, 620, 1200, 1750, 2180],
    boss: 'relay',
    music: 'stage2',
    seed: 5150,
    sky: ['#04140f', '#0b2b22', '#12503c'],
    far: '#0d2a24',
    mid: '#081c18',
    near: '#04100e',
    ground: '#1a3a30',
    groundLit: '#3f8f74',
    groundDark: '#0b1d18',
    accent: '#3fe0a0',
    fog: 'rgba(63,224,160,0.06)',
    groundSegs: [[0, 520], [560, 360], [960, 300], [1300, 380], [1720, 300], [2060, 940]],
    platforms: [
      { x: 210, y: 184, w: 70 }, { x: 380, y: 146, w: 66 },
      { x: 660, y: 176, w: 88 }, { x: 830, y: 138, w: 60 },
      { x: 1060, y: 182, w: 78 }, { x: 1200, y: 140, w: 64 },
      { x: 1400, y: 188, w: 84 }, { x: 1560, y: 146, w: 70 },
      { x: 1800, y: 180, w: 76 }, { x: 1960, y: 132, w: 62 },
      { x: 2160, y: 176, w: 88 }, { x: 2300, y: 136, w: 68 }
    ],
    enemies: [
      onGround('grunt', 280), onGround('runner', 420), at('turret', 400, 146 - 14),
      at('sniper', 700, 176 - 18), onGround('shielder', 900), at('drone', 1010, 84),
      onGround('jumper', 1120), onGround('grunt', 1250), at('swarm', 1340, 110),
      onGround('runner', 1450), onGround('brute', 1600), at('drone', 1700, 78),
      at('sniper', 1820, 180 - 18), onGround('shielder', 1900), onGround('grunt', 2000),
      at('turret', 2120, 176 - 14), onGround('brute', 2200), onGround('runner', 2280),
      at('swarm', 1980, 96)
    ],
    pickups: [
      { kind: 'weapon', w: 'spread', x: 380, y: 116 },
      { kind: 'health', x: 830, y: 108 },
      { kind: 'weapon', w: 'flame', x: 1200, y: 110 },
      { kind: 'coin', x: 1560, y: 116 },
      { kind: 'weapon', w: 'machine', x: 1960, y: 102 },
      { kind: 'health', x: 2300, y: 106 }
    ]
  },
  {
    id: 5,
    name: 'ORBITAL WOUND',
    tag: 'ERA V · THE BROKEN ORBIT',
    length: 3160,
    arenaStart: 2520,
    checkpoint: 1260,
    checkpoints: [48, 580, 1260, 1800, 2260],
    boss: 'orbit',
    music: 'stage3',
    seed: 8080,
    sky: ['#080a18', '#141a3a', '#2a2a6b'],
    far: '#1a1d45',
    mid: '#0f1230',
    near: '#080a1c',
    ground: '#22244e',
    groundLit: '#5b5fbd',
    groundDark: '#101128',
    accent: '#8a7bff',
    fog: 'rgba(138,123,255,0.07)',
    groundSegs: [[0, 480], [520, 340], [900, 280], [1220, 360], [1620, 300], [1960, 260], [2260, 900]],
    platforms: [
      { x: 180, y: 182, w: 72 }, { x: 340, y: 140, w: 60 },
      { x: 600, y: 174, w: 80 }, { x: 760, y: 132, w: 62 },
      { x: 980, y: 186, w: 74 }, { x: 1130, y: 142, w: 66 },
      { x: 1300, y: 180, w: 86 }, { x: 1470, y: 136, w: 60 },
      { x: 1700, y: 178, w: 78 }, { x: 1860, y: 130, w: 64 },
      { x: 2060, y: 184, w: 82 }, { x: 2220, y: 138, w: 70 },
      { x: 2400, y: 176, w: 76 }
    ],
    enemies: [
      onGround('grunt', 260), at('sniper', 360, 140 - 18), onGround('runner', 440),
      onGround('shielder', 620), at('drone', 720, 86), onGround('brute', 820),
      at('swarm', 960, 108), onGround('jumper', 1040), at('turret', 1150, 142 - 14),
      onGround('grunt', 1300), at('sniper', 1480, 136 - 18), onGround('runner', 1560),
      onGround('shielder', 1700), at('drone', 1800, 74), onGround('brute', 1900),
      at('swarm', 2040, 96), onGround('grunt', 2120), at('turret', 2240, 138 - 14),
      onGround('jumper', 2320), onGround('runner', 2420)
    ],
    pickups: [
      { kind: 'weapon', w: 'laser', x: 340, y: 110 },
      { kind: 'health', x: 760, y: 102 },
      { kind: 'weapon', w: 'spread', x: 1130, y: 112 },
      { kind: 'coin', x: 1470, y: 106 },
      { kind: 'weapon', w: 'flame', x: 1860, y: 100 },
      { kind: 'health', x: 2220, y: 108 }
    ]
  },
  {
    id: 6,
    name: 'THE LAST SECOND',
    tag: 'ERA VI · WHERE TIME ENDS',
    length: 3040,
    arenaStart: 2400,
    checkpoint: 1220,
    checkpoints: [48, 600, 1220, 1760, 2200],
    boss: 'clock',
    music: 'boss',
    seed: 12001,
    sky: ['#0a0a0a', '#2a2418', '#6b5320'],
    far: '#241d12',
    mid: '#171208',
    near: '#0b0906',
    ground: '#2e2414',
    groundLit: '#b08a3a',
    groundDark: '#140f08',
    accent: '#ffd257',
    fog: 'rgba(255,210,87,0.06)',
    groundSegs: [[0, 500], [540, 320], [920, 300], [1280, 340], [1680, 300], [2040, 1000]],
    platforms: [
      { x: 200, y: 180, w: 68 }, { x: 360, y: 138, w: 58 },
      { x: 620, y: 176, w: 76 }, { x: 780, y: 134, w: 60 },
      { x: 1000, y: 184, w: 72 }, { x: 1160, y: 140, w: 62 },
      { x: 1340, y: 178, w: 84 }, { x: 1500, y: 134, w: 58 },
      { x: 1740, y: 176, w: 76 }, { x: 1900, y: 128, w: 62 },
      { x: 2100, y: 182, w: 80 }, { x: 2260, y: 136, w: 66 }
    ],
    enemies: [
      onGround('shielder', 260), at('sniper', 380, 138 - 18), onGround('brute', 470),
      onGround('runner', 640), at('drone', 760, 80), at('swarm', 860, 104),
      onGround('grunt', 1000), onGround('brute', 1120), at('turret', 1180, 140 - 14),
      onGround('shielder', 1360), at('sniper', 1520, 134 - 18), onGround('jumper', 1600),
      at('swarm', 1720, 92), onGround('brute', 1800), at('drone', 1900, 72),
      onGround('shielder', 2020), onGround('grunt', 2120), at('turret', 2280, 136 - 14),
      onGround('runner', 2340)
    ],
    pickups: [
      { kind: 'weapon', w: 'machine', x: 360, y: 108 },
      { kind: 'health', x: 780, y: 104 },
      { kind: 'weapon', w: 'laser', x: 1160, y: 110 },
      { kind: 'coin', x: 1500, y: 104 },
      { kind: 'weapon', w: 'spread', x: 1900, y: 98 },
      { kind: 'health', x: 2260, y: 106 }
    ]
  }
);

/* ===========================================================================
   STORY — every mission opens and closes on a line of it.
   =========================================================================== */
var STORY = {
  1: {
    intro: [
      { who: 'CONTROL', text: 'COMMANDO. THE EON HAS TAKEN THE FIRST ERA.' },
      { who: 'CONTROL', text: 'ASHEN DAWN IS BURNING FROM THE INSIDE OUT.' },
      { who: 'YOU', text: 'THEN I GO IN WHILE IT IS STILL STANDING.' }
    ],
    outro: [
      { who: 'WARDEN', text: 'YOU CUT ONE THREAD. THERE ARE SIX.' },
      { who: 'CONTROL', text: 'ERA ONE HOLDS. THE SIGNAL PULLS US DEEPER.' }
    ]
  },
  2: {
    intro: [
      { who: 'CONTROL', text: 'GLACIER EON. EVERYTHING HERE STOPPED AT ONCE.' },
      { who: 'CONTROL', text: 'SOMETHING IS STILL MOVING UNDER THE ICE.' }
    ],
    outro: [
      { who: 'CONTROL', text: 'THE WRAITH IS DOWN. THE COLD DOES NOT LIFT.' },
      { who: 'YOU', text: 'IT IS NOT COLD. IT IS WAITING.' }
    ]
  },
  3: {
    intro: [
      { who: 'CONTROL', text: 'THE CORE. THIS IS WHERE THE EON KEEPS ITS HEART.' },
      { who: 'CONTROL', text: 'IT KNOWS YOU ARE COMING. IT IS ALREADY AWAKE.' }
    ],
    outro: [
      { who: 'EON HEART', text: 'YOU HAVE NOT WON. YOU HAVE ONLY COME CLOSER.' },
      { who: 'CONTROL', text: 'THREE ERAS HELD. THE PULL GOES ON.' }
    ]
  },
  4: {
    intro: [
      { who: 'CONTROL', text: 'ERA FOUR. A RELAY THAT DROWNED MID-SIGNAL.' },
      { who: 'YOU', text: 'WHO WAS IT TALKING TO?' },
      { who: 'CONTROL', text: 'US. FORTY YEARS FROM NOW.' }
    ],
    outro: [
      { who: 'CONTROL', text: 'THE RELAY IS QUIET. THE MESSAGE IS NOT.' },
      { who: 'CONTROL', text: 'IT SAYS: DO NOT LET IT REACH THE LAST SECOND.' }
    ]
  },
  5: {
    intro: [
      { who: 'CONTROL', text: 'THE ORBIT BROKE HERE. THE SKY IS STILL FALLING.' },
      { who: 'CONTROL', text: 'NO GROUND UNDER YOU THAT TIME AGREES ON.' }
    ],
    outro: [
      { who: 'EON HEART', text: 'EVERY ERA YOU SAVE IS ONE I HAVE ALREADY SPENT.' },
      { who: 'YOU', text: 'THEN I WILL COME AND TAKE THEM BACK.' }
    ]
  },
  6: {
    intro: [
      { who: 'CONTROL', text: 'LAST SECOND. THE END OF THE CLOCK.' },
      { who: 'CONTROL', text: 'WHATEVER YOU DO HERE, IT HAS ALREADY HAPPENED.' },
      { who: 'YOU', text: 'THEN LET IT HAPPEN TO THEM.' }
    ],
    outro: [
      { who: 'CONTROL', text: 'ALL SIX ERAS HELD. THE EON IS CLOSED.' },
      { who: 'CONTROL', text: 'COMMANDO — COME HOME.' }
    ]
  }
};

STAGES.forEach(function (st) {
  var s = STORY[st.id];
  if (s) { st.storyIn = s.intro; st.storyOut = s.outro; }
});
