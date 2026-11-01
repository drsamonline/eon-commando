<div align="center">

# EON COMMANDO

<!-- shot:start -->

![Gameplay](docs/shots/gameplay.png)

<!-- shot:end -->

**A retro run-and-gun platformer — one self-contained HTML file. No install, works offline, PolyForm Noncommercial licensed.**

[![Stars](https://img.shields.io/github/stars/drsamonline/eon-commando?style=for-the-badge&labelColor=05070d&color=ffb545)](https://github.com/drsamonline/eon-commando/stargazers)
[![Forks](https://img.shields.io/github/forks/drsamonline/eon-commando?style=for-the-badge&labelColor=05070d&color=54e0ff)](https://github.com/drsamonline/eon-commando/network/members)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-2e7d32?style=for-the-badge&labelColor=05070d&color=ff2d95)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/drsamonline/eon-commando?style=for-the-badge&labelColor=05070d&color=54e0ff)](https://github.com/drsamonline/eon-commando/commits/main)

### ▶&nbsp; <a href="https://drsamonline.github.io/eon-commando/play/"><b>PLAY NOW</b></a> &nbsp;·&nbsp; <a href="https://drsamonline.github.io/eon-commando/">Landing page</a> &nbsp;·&nbsp; <a href="https://drsamonline.github.io/">All projects</a>

</div>

---

<div align="center">

<br>

[![Play now](https://img.shields.io/static/v1?label=EON%20COMMANDO&message=%E2%96%B6%20PLAY%20NOW&color=ffb545&labelColor=05070d&style=for-the-badge)](https://drsamonline.github.io/eon-commando/play/)
[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Fdrsamonline.github.io%2Feon-commando%2Fplay%2F&label=live%20demo&up_message=online&down_message=offline&up_color=54ffa8&labelColor=05070d&style=for-the-badge)](https://drsamonline.github.io/eon-commando/play/)

<sub>Runs in the browser · nothing to install · works offline once loaded</sub>

<br>

[![Hosted on GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-222222?logo=githubpages&logoColor=white&style=for-the-badge&labelColor=05070d)](https://drsamonline.github.io/eon-commando/)
[![Version](https://img.shields.io/badge/version-3.0.0-ffd257.svg?style=for-the-badge&labelColor=05070d)](CHANGELOG.md)
[![Dependencies](https://img.shields.io/badge/dependencies-0-54ffa8.svg?style=for-the-badge&labelColor=05070d)](#-zero-dependencies)
[![Network calls](https://img.shields.io/badge/network%20calls-none-54ffa8.svg?style=for-the-badge&labelColor=05070d)](#-zero-dependencies)

[![Single file](https://img.shields.io/badge/build-single%20HTML%20file-ffd257.svg?style=for-the-badge&labelColor=05070d)](#-quick-start)
[![Size](https://img.shields.io/badge/minified-109%20KB-54e0ff.svg?style=for-the-badge&labelColor=05070d)](#-quick-start)
[![Gzipped](https://img.shields.io/badge/gzipped-49%20KB-54e0ff.svg?style=for-the-badge&labelColor=05070d)](#-quick-start)
[![Made with](https://img.shields.io/badge/made%20with-vanilla%20JS%20%2B%20canvas-ffd257.svg?style=for-the-badge&labelColor=05070d)](#-how-it-works)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge&labelColor=05070d)](#-contributing)

</div>

---

## ▶ Play it

<table>
<tr>
<td width="50%" valign="top">

### 🌐 Play online

**[drsamonline.github.io/eon-commando/play/](https://drsamonline.github.io/eon-commando/play/)**

Nothing to install. Opens in any modern browser — desktop or phone. Once loaded it runs entirely offline.

</td>
<td width="50%" valign="top">

### 💾 Run it locally

**[Download `index.html`](https://github.com/drsamonline/eon-commando/raw/main/index.html)** — or clone the repo:

```bash
git clone https://github.com/drsamonline/eon-commando.git
cd eon-commando
open index.html    # macOS
                   # xdg-open on Linux, start on Windows
```

</td>
</tr>
</table>

**No install. No build. No server. One file.** Open `index.html` in any modern browser — double-click it, or drag it into a tab. That is the whole setup.

Works identically from `file://` and from a web server. Works offline. Works on a phone.

| | |
| :-- | :-- |
| **Source** | [github.com/drsamonline/eon-commando](https://github.com/drsamonline/eon-commando) |
| **Download** | [index.html](https://github.com/drsamonline/eon-commando/raw/main/index.html) (109 KB, self-contained) |
| **Landing page** | [drsamonline.github.io/eon-commando](https://drsamonline.github.io/eon-commando/) |

---

## 📸 Screenshots

<div align="center">

**Title** — three eras, one commando

<img src="docs/shots/title.png" alt="Title screen: EON COMMANDO over a burning dusk skyline" width="820">

<br><br>

**Era I · Ashen Dawn** — the burning city, turrets on the rooftops

<img src="docs/shots/gameplay.png" alt="Gameplay: the commando firing at enemy soldiers under a setting sun" width="820">

<br><br>

**Era II · Glacier Eon** — ice shelves over open air

<img src="docs/shots/stage2.png" alt="Era II: icy ledges, a pale moon and enemy drones" width="820">

<br><br>

**Boss — The Warden** — spread fire, shoulder cannons, ground shockwave

<img src="docs/shots/boss1.png" alt="The Warden boss firing spread shots at the commando" width="820">

<br><br>

**Boss — The Eon Heart** — a spiral that closes from every angle

<img src="docs/shots/boss3.png" alt="The Eon Heart boss throwing a spiral of bullets" width="820">

<br><br>

**Widescreen** — the view widens from 16:9 to 21:9 instead of letterboxing

<img src="docs/shots/widescreen.png" alt="Ultrawide 21:9 view: the level reveals more world either side" width="820">

</div>

---

## 🆕 What's new in 2.3

**74% fewer draw operations per frame** — 2,210 down to 573, measured by counting canvas
calls rather than trusting a stopwatch. Same pixels, a quarter of the work.

- **Ground is baked, not redrawn.** Each stage's floor, speckles and props are rendered once
  into 1024 px chunks and blitted from there. The live path is still in the file behind
  `?legacyground=1` so the two can be compared — the baked version matches it to within one
  pixel on 0.24% of pixels (sub-pixel rounding at chunk edges).
- **Text is cached.** Every HUD string used to be drawn as dozens of `fillRect` glyphs each
  frame; now each unique string is rendered once into a tiny canvas and blitted. That alone
  was 1,400 of the 2,210 operations.
- **Broad-phase bullets** skip enemies they cannot reach before doing box maths.
- **A seed you can pin.** `?seed=4242` makes a run reproducible end to end — cosmetic
  randomness now routes through the seeded stream too, which is the groundwork for replays.
- **A frame meter.** `?fps=1` overlays fps, frame ms and entity counts; `?bench=600` times
  600 update+render pairs and prints the average into the title bar.

---

## 🆕 What's new in 2.2

**Bosses fight back with three attacks each, on their own clocks** — not one scripted loop.

<div align="center">
<img src="docs/shots/boss-hazard-debris.png" alt="The Warden's ceiling debris: three ground shadows marking exactly where it will land" width="820">
</div>

- **The Warden** now drops **ceiling debris** on your position — three rocks (five in phase 2),
  each telegraphed for 42 frames by a shadow on the ground and a falling marker line, so you
  always know exactly where not to stand.
- **The Glacier Wraith** summons **swarm darts** on its own timer, separate from its ice-shard
  fan. Kill them or eat them.
- **The Eon Heart** fires **rotating beams** — a 70-frame dashed telegraph, then a live beam
  that sweeps across the arena for 150 frames. Phase 2 sends two, counter-rotating.

<div align="center">
<img src="docs/shots/boss-hazard-beam.png" alt="The Eon Heart's rotating beam sweeping across the arena" width="820">
</div>

**A weak point that rewards aiming.** The Warden's core takes **double damage** — a body shot
does 4, a core shot does 8, with a `CORE` popup when you find it. Bosses are no longer a
matter of holding fire at the biggest rectangle on screen.

Every hazard is a real entity with its own telegraph, damage box and lifetime, so they work
in co-op too and can be dodged with the dash's i-frames.

---

## 🆕 What's new in 2.1

**Two players, one screen.** Press **2** on the title screen. Player one takes the arrows and
`Space`/`Z`; player two takes `WASD` and `,` `.` `/` `;` `'`. Two gamepads also work — the
second pad becomes player two automatically.

<div align="center">
<img src="docs/shots/coop.png" alt="Two commandos fighting side by side, with player two's hearts in cyan" width="820">
</div>

- **Shared camera** frames both players and follows their midpoint.
- **Soft leash** — wander too far and you are nudged back toward your partner at 3 px a frame.
  No teleporting, no rubber-banding snap.
- **Revive instead of death.** Go down and you have six seconds; a partner standing close for
  about a second brings you back at one heart. If nobody reaches you, you bleed out.
- **A life is only lost when nobody is left standing** — both down means the run restarts at
  the last checkpoint together.
- Enemies, turrets and bosses all target **whichever commando is nearest**, and contact damage
  is checked against both.

Also in this release: the **brute's shoulder charge** is now telegraphed and on a 150-frame
cooldown instead of firing whenever it is close, and **downed players no longer fall through
the floor** (they were unreachable, so revive could never trigger).

---

## 🆕 What's new in 2.0

**New verbs.** **Dash** (Shift) with i-frames and a 42-frame cooldown, **melee** (V) — a short
arc that finally solves "enemy standing on top of me" — and **grenades** (G), three per life,
thrown with an arc, bouncing, five-damage in a 42-pixel radius. All three have touch buttons.

**Four new enemy archetypes.** **Sniper** paints a laser sight on you for 42 frames before
firing. **Swarm** darts fly straight at you. **Brute** is armoured, heavy and shoulder-charges.
**Shielder** carries a front plate that stops your fire dead — you have to flank or jump it.

**Telegraphs.** Every shooter now winds up for 16–42 frames before it fires, with a visible
cue, so a death is something you could have read.

**Hit-stop.** Three frames of frozen world on melee and grenade hits — the world stops, you
do not, so a press during the freeze is never swallowed.

**Difficulty tiers.** Recruit (6 hearts, 5 lives, half damage), Commando (as before), Eon
(2 hearts, 1 life, 1.5× damage taken, tougher enemies).

**A settings screen** (O or from pause): difficulty, colour scheme, reduce motion, flash
intensity, HUD size, music, sound effects, auto-fire. Every option persists.

**Accessibility.** Three colour schemes including deuteranopia and high contrast, which
recolour hostile fire — the thing that actually matters in a bullet-hell moment. Reduce-motion
kills shake, flashes and scanlines. Flash intensity is a slider, for photosensitivity.

**Local leaderboard and lifetime stats** — top five runs on the title screen, runs/kills/time
kept in `localStorage`.

**Installable.** A service worker and manifest ship alongside the game: install it once and it
launches with the network off. Sharp pixels on retina via a DPR-aware backbuffer, plus
fullscreen (F) and a screen Wake Lock while you play.

---

## 📱 On a phone

<div align="center">
<img src="docs/shots/mobile.png" alt="Portrait phone: square play area at the top, earth below, thumb controls over it" width="290">
&nbsp;&nbsp;
<img src="docs/shots/mobile-landscape.png" alt="Landscape phone: the game fills the screen edge to edge" width="560">
</div>

**The canvas fills 100% of the screen in both orientations**, measured at 390×844, 360×640,
412×915, 768×1024, 844×390, 640×360 and 1440×810.

Landscape keeps the 16:9-to-21:9 view and fills the screen edge to edge. Portrait switches to
a **square logical view (270×270)** — a 16:9 band on a phone held upright is only a quarter of
the screen and the sprites end up tiny. The canvas then takes the full screen height, the play
area sits at the top where your eyes are, the earth continues below it with strata and grit,
and the thumb pads overlay that lower band so nothing is wasted. The play area is 78% larger
than it was in 1.2 (219 px tall → 390 px on an iPhone), and the title and settings screens
reflow for the narrow view instead of overflowing.

If you want the widest possible view, rotate: landscape shows 584 world pixels of width
against portrait's 270.

---

## 🆕 What's new in 1.2

- **Phone support, properly.** The canvas is now `position:fixed; inset:0` and owns the
  viewport. On a 390×844 phone the game used to be a 215-pixel band floating in page padding
  with a desktop keyboard hint beneath it; it now fills the screen in landscape and lays out
  as band-plus-thumbs in portrait.
- **Pause moved out of the play area** — bottom centre in landscape, a thin strip at the top
  in portrait, so it never covers the game.
- **Visual-viewport sizing** — the layout listens to `visualViewport` resize and scroll, so
  the address bar collapsing no longer leaves the game mis-scaled.
- **Whole-number scale snapping** when it costs less than 12% size, for crisper pixels.
- Desktop keyboard hint now fades after nine seconds instead of sitting over the game.

---

## 🆕 What's new in 1.1

- **Curved, hand-drawn sprites.** Every character was rebuilt from stacked rectangles into
  rounded caps, arcs, ellipses and bezier limbs — helmets, visors, shoulders, knees and
  boots all have real silhouettes now, while the game stays pixel-pure on the 480×270 grid.
- **Enemy variation.** One rig, many looks: each era reskins the same enemy silhouette
  (ember → frost → core), spawns get ±6% scale jitter, and roughly one in eight is an
  **elite** in gold with ~1.8× health.
- **Widescreen.** The logical viewport follows your window's aspect ratio from 16:9 up to
  21:9, so ultrawide and 16:10 screens fill properly instead of letterboxing. Boss arenas
  keep a fixed 16:9 footprint and the camera centres them, so a wide screen sees the walls
  rather than the void.
- **Readability pass.** Enemy bullets got dark rims, glow and motion trails; screen-edge
  arrows point at enemies you cannot see; the background dims 18% during boss fights.
- **Better feel.** Corner correction — you now slide around a ledge instead of bonking your
  head on it — plus rounded platforms and ground edges that no longer read as knife cuts.

---

## Contents

- [Play it](#-play-it) — **[live demo](https://drsamonline.github.io/eon-commando/play/)**
- [Screenshots](#-screenshots)
- [Why it is interesting](#-why-it-is-interesting)
- [Controls](#-controls)
- [The three eras](#-the-three-eras)
- [Weapons](#-weapons)
- [Enemies and bosses](#-enemies-and-bosses)
- [How it works](#-how-it-works)
- [Project layout](#-project-layout)
- [Build and test](#-build-and-test)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Why it is interesting

- **One file, no network.** `index.html` is the game. No CDN, no fetch, no `localStorage` requirement — high scores simply save if storage is available.
- **No assets at all.** Every sprite is drawn from rectangles and paths at runtime. Every sound is synthesised from oscillators and noise buffers. The HUD font is a 5×7 bitmap defined as strings.
- **Manual fire, classic rules.** No auto-aim, no regenerating health. Four hearts, three lives, and you lose your weapon when you die — back to the rifle.
- **Coyote time and jump buffering.** Six frames of coyote time, seven of buffered input, variable jump height. It feels like a 16-bit game, not a web demo.
- **Three stages, three bosses, two phases each.** Half health changes the fight: wider spreads, summoned drones, faster spirals.
- **Fixed 60 Hz simulation.** An accumulator drives physics, so a 144 Hz monitor does not make the commando run faster.
- **Touch and keyboard, same code.** On-screen pads appear only on touch devices; gamepads work through the Gamepad API.

---

## 🎮 Controls

| Action | Keyboard | Touch | Gamepad |
| :-- | :-- | :-- | :-- |
| Move | `←` `→` / `A` `D` | Left D-pad | D-pad / left stick |
| Aim up | `↑` / `W` | D-pad up | D-pad up |
| Aim down (mid-air) | `↓` / `S` | D-pad down | D-pad down |
| Duck | `↓` while standing | D-pad down | D-pad down |
| Jump | `Space` `X` `K` | **A** | A / cross |
| Fire | `Z` `J` `Ctrl` | **B** | X / square |
| Dash | `Shift` `L` | **»** | RB / R1 |
| Melee | `V` `C` | **M** | X / square |
| Grenade | `G` `B` | **G** | B / circle |
| Settings | `O` | from pause | — |
| Daily run | `D` (title) | — | — |
| Rebind keys | `O` → Controls | — | — |
| Watch last run | `R` (title) | — | — |
| Fullscreen | `F` | — | — |
| Pause / menu | `P` `Esc` | ❙❙ button | Start |
| **Player 2** | `WASD` + `,` `.` `/` `;` `'` | — | second pad |
| Mute | `M` | — | — |

Hold jump for the full arc, tap it for a short hop. Aiming is eight-directional: hold a direction while firing.

---

## 🕰 The three eras

| # | Era | Setting | Boss |
| :-: | :-- | :-- | :-- |
| I | **ASHEN DAWN** | The burning city at dusk — long sightlines, chasms, rooftop turrets | **THE WARDEN** |
| II | **GLACIER EON** | The frozen vault — narrow ledges, more air than ground, drone swarms | **GLACIER WRAITH** |
| III | **EON CORE** | The heart of time — tight platforms, dense fire | **THE EON HEART** |

Each stage is hand-laid: ground segments with real chasms, one-way platforms, checkpointed respawns, and an arena at the end where the camera locks and the gate shuts behind you.

---

## 🔫 Weapons

| Weapon | Cadence | Damage | Behaviour |
| :-- | :-- | :-- | :-- |
| **RIFLE** | medium | 1 | Default. Always with you, always reliable. |
| **SPREAD** | slow | 1 ×3 | Three pellets in a fan. |
| **MACHINE** | very fast | 1 | Jittery, forgiving, melts anything static. |
| **LASER** | slow | 3 | Punches through three targets. |
| **FLAME** | fastest | 1 | Short reach, wide cloud, burns through crowds. |

Pickups float in capsules: **weapons**, **repair** (2 hearts) and **Eon shards** (+500). A fatal hit drops you back to the rifle — the classic run-and-gun tax.

---

## 👾 Enemies and bosses

| Enemy | Behaviour |
| :-- | :-- |
| **Grunt** | Patrols, stops to shoot, reverses at ledges |
| **Runner** | Charges when it sees you, leaps the gaps |
| **Drone** | Hovers on a sine wave, drifts over your head, drops bombs |
| **Turret** | Fixed, tracks you, fires aimed shots |
| **Jumper** | Hops toward you, shoots mid-leap |

| Boss | Phase 1 | Phase 2 (below half health) |
| :-- | :-- | :-- |
| **The Warden** | Walks the arena, 3-way spread, ground shockwave | 5-way spread, faster cadence, quicker stomps |
| **Glacier Wraith** | Flies, aimed bursts, fan of ice shards | Calls in drones, wider shard fan |
| **The Eon Heart** | Four-armed spiral, aimed volley | Six-armed spiral, faster, summons runners |

---

## ⚙ How it works

| System | Implementation |
| :-- | :-- |
| **Loop** | Fixed 1/60 s step with an accumulator; render once per animation frame |
| **Rendering** | One 480×270 canvas, integer-scaled with `image-rendering: pixelated` |
| **Art** | Rectangles and paths — the commando, enemies, bosses, skylines, props |
| **Text** | A 5×7 bitmap font defined as `#`/`.` strings, drawn pixel by pixel |
| **Audio** | Web Audio: square/saw/triangle oscillators, noise buffers, a look-ahead sequencer |
| **Music** | Per-era tracks — bass, lead and noise drums — scheduled against the audio clock |
| **Input** | One action set merged from keyboard, pointer pads and the Gamepad API |
| **Camera** | Lerped horizontal follow, clamped to the stage, locked during boss fights |
| **Save** | `localStorage` for high score and mute, wrapped so private mode never throws |

### Zero dependencies

There is no `package.json` to install, no bundler, no framework, and no asset pipeline. The shipped `index.html` makes **no network requests of any kind** — not for fonts, not for images, not for analytics. Load it once, unplug the network, keep playing.

---

## 🗂 Project layout

```
eon-commando/
├── index.html            ← the game (built, self-contained, ~100 KB)
├── build.py              ← src/ → index.html
├── src/
│   ├── 00_head.html      ← document, CSS, touch pad markup
│   ├── 10_core.js        ← constants, maths, storage, URL params
│   ├── 20_audio.js       ← chiptune synth + the era tracks
│   ├── 30_input.js       ← keyboard / touch / gamepad, canvas scaling
│   ├── 40_art.js         ← 5×7 font, the commando, enemies, bosses
│   ├── 50_content.js     ← weapons, enemy stats, the three stages
│   ├── 60_entities.js    ← physics, AI, bullets, particles, boss patterns
│   ├── 70_game.js        ← state machine, stage flow, camera, scoring
│   ├── 80_render.js      ← parallax eras, world, HUD, screens
│   ├── 90_main.js        ← canvas setup, fixed-step loop, demo harness
│   └── 99_tail.html
└── docs/                 ← GitHub Pages root
    ├── index.html        ← landing page
    ├── play/index.html   ← the game, served live
    └── shots/*.png       ← screenshots
```

---

## 🛠 Build and test

The build is a concatenation — no toolchain, no dependencies, Python 3 only:

```bash
python3 build.py        # src/ -> index.html
```

That is the entire build. To check a change without opening a browser, the game exposes a deterministic demo harness through URL parameters:

```bash
# 400 simulated frames of era I, then freeze the frame
index.html?shot=1&stage=1&demo=400

# drop straight into a boss fight
index.html?shot=1&stage=3&warp=2520&demo=320&right=0
```

`?demo=N` runs N fixed steps with scripted input, `?warp=X` teleports the commando, `?shot=1` strips the page chrome for screenshots, and `?debug=1` writes the game state into the document title. Every screenshot in this README was captured with those flags in headless Chromium.

---

## 🗺 Roadmap

### Shipped
- [x] Three eras with distinct palettes, hazards and parallax
- [x] Five weapons, nine enemy archetypes, three bosses with second phases and arena hazards
- [x] Dash, melee and grenades; hit-stop; attack telegraphs
- [x] Chiptune music and sound effects, synthesised at runtime
- [x] Keyboard, touch pads and gamepad, with rebindable keys per player
- [x] Two-player local co-op with revive
- [x] Difficulty tiers, settings, colour schemes, reduce-motion, HUD scaling
- [x] Curved sprite art, per-era palettes, scale jitter, elite variants
- [x] Widescreen 16:9 → 21:9; portrait fills the screen with a closer view
- [x] Readability pass: bullet rims and trails, threat arrows, background dimming
- [x] Performance: 573 draw ops/frame, down from 2,210
- [x] Replays (196 chars for 900 frames) and a daily seed
- [x] Auto-fire with a ±31° assist, on by default on touch
- [x] Installable PWA, offline, zero dependencies

### Next, in order
- [x] **Endless mode** — escalating waves, boss every fifth wave, rising multiplier
- [ ] **Touch pad layout editor** — drag the pads anywhere, per device. The last real mobile gap.
- [ ] **Perks between eras** — pick 1 of 3, now that difficulty tiers exist to hang them on.
- [ ] **Android APK / Windows EXE** via [`app-builder`](https://github.com/drsamonline/app-builder)
- [ ] **LAN co-op** via [`lan-kit`](https://github.com/drsamonline/lan-kit) (SSE + POST, local host)
- [ ] Optional CRT shader toggle

---

## 🤝 Contributing

Issues and pull requests are welcome. The source is deliberately plain: no framework, no transpiler, no minifier. Edit a file under `src/`, run `python3 build.py`, reload `index.html`. If you add a stage, add it to `STAGES` in `src/50_content.js` and it will appear in the campaign.

---

## 📜 License

[PolyForm Noncommercial License 1.0.0](LICENSE) — free to use, modify and share for any noncommercial purpose. Commercial use requires a separate licence.

Game design, code and art: **Dr Sohil Momin**. Everything in this repository is original work; no third-party assets are used, because there are no assets.

<div align="center">
<br>
<sub>Built with vanilla JavaScript, one canvas, and a lot of rectangles.</sub>
</div>
