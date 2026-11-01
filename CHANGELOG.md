# Changelog

All notable changes to Eon Commando.

## [2.3.0] — 2026-11-01

Performance release.

### Changed
- **Draw operations per frame: 2,210 → 573 (−74%)**, counted by instrumenting the canvas
  context rather than by stopwatch.
- **Ground baked into 1024 px chunks** per stage — floor gradient, strata, rim light, 1,100
  speckles and every prop are rendered once and blitted. The old path remains behind
  `?legacyground=1` for comparison; the two match to within 1 px on 0.24% of pixels.
- **HUD text cached** into small offscreen canvases keyed by string, scale, colour and shadow.
  Text was 1,400 of the 2,210 operations.
- **Broad-phase** in bullet collision: enemies outside a 40 px band are skipped before any
  box maths.

### Added
- `?seed=N` pins the run seed. Cosmetic randomness (`rnd`, `rndi`, `pick`, `chance`) now uses
  the seeded `fx` stream, so a run is reproducible end to end — the groundwork for replays.
- `?fps=1` debug overlay (fps, frame ms, entity counts) and `?bench=N` timing harness.
- A single `VERSION` constant drives the title screen.

### Fixed
- Props taller than the ground line were clipped out of the baked chunks.
- The chunk gradient was mapped across the wrong band, tinting the whole floor.

## [2.2.0] — 2026-11-01

Boss depth release.

### Added
- **Arena hazards** as first-class entities with telegraphs, damage boxes and lifetimes:
  - **Debris** (Warden) — 3 rocks (5 in phase 2) dropped on the player's position, each
    telegraphed for 42 frames by a ground shadow and a falling marker line.
  - **Rotating beams** (Eon Heart) — 70-frame dashed telegraph, then 150 frames of live beam
    sweeping the arena. Phase 2 sends two counter-rotating.
  - **Swarm summons** (Glacier Wraith) — two darts per wave on their own timer.
- **Weak points.** The Warden's core takes double damage (4 → 8), with a `CORE` popup.
- Hazards respect co-op: they damage every player and can be dodged with dash i-frames.

### Fixed
- The Wraith's summon timer and the Heart's beam timer were nested inside another attack's
  handler, so they only ticked when that attack fired — the beams in particular almost never
  appeared. Both now run on their own clocks.

## [2.1.0] — 2026-11-01

Local co-op release.

### Added
- **Two-player local co-op** — press `2` on the title screen. Player one uses the arrows
  and `Space`/`Z`; player two uses `WASD` and `,` `.` `/` `;` `'`. A second gamepad is
  picked up automatically as player two.
- **Shared camera** framing both players from their midpoint, with a soft 3 px/frame leash
  that nudges a straggler back into view instead of teleporting them.
- **Downed state and revive** — a player at zero health goes down for six seconds; a partner
  standing within 26 px for about a second revives them at one heart, with a progress ring.
- **A life is lost only when nobody is left standing**; both players respawn together at the
  last checkpoint.
- Enemies, turrets and bosses now target the **nearest** commando; contact damage is checked
  against every player; pickups go to whichever player touches them first.
- Player two's hearts render under player one's in cyan, with a `P2` label.

### Fixed
- **Downed players fell through the floor**, which made them unreachable and meant revive
  could never trigger.
- **The co-op leash teleported players** instead of pushing them.
- The brute's shoulder charge fired whenever it was within 70 px, which read as relentless;
  it now telegraphs for 14 frames and sits on a 150-frame cooldown.

## [2.0.0] — 2026-11-01

The combat, enemies and accessibility release.

### Added
- **Dash** — 10 frames, i-frames, 42-frame cooldown, with afterimages.
- **Melee** — a 19 px arc in front of the commando, 3 damage, 3 frames of hit-stop.
- **Grenades** — three per life, arced throw, bounce, 5 damage in a 42 px radius.
- **Four enemy archetypes**: Sniper (laser-sight wind-up), Swarm (fast flier), Brute
  (armoured, shoulder-charges) and Shielder (front plate blocks fire; flank it).
- **Attack telegraphs** — 16–42 frames of wind-up before every shot.
- **Hit-stop** on melee and grenade hits. The world freezes; the player does not, so
  inputs during the freeze are never dropped.
- **Difficulty tiers** — Recruit / Commando / Eon, affecting hearts, lives, damage taken,
  enemy health, fire rate and drop rate.
- **Settings screen** (`O` or from pause) — difficulty, colour scheme, reduce motion,
  flash intensity, HUD size, music, SFX, auto-fire. Persisted.
- **Colour schemes** — default, deuteranopia and high contrast, recolouring hostile fire.
- **Local leaderboard** (top 5) on the title and game-over screens, plus lifetime stats.
- **Seeded RNG** split into `sim` and `fx` streams — gameplay randomness is now reproducible.
- **DPR-aware backbuffer** (capped at 2×), fullscreen (`F`) and a screen Wake Lock.
- **PWA** — `manifest.json` and `sw.js` ship beside the game; install once, play offline.

### Changed
- The HUD scales from 85% to 130%, anchored per corner, and shows grenade pips.
- Screen shake, flashes, scanlines and parallax respect the reduce-motion setting.
- Flash intensity is a slider rather than a constant.

## [1.2.0] — 2026-11-01

Phone and layout release.

### Fixed
- **The game did not support phone screens.** The canvas was a fixed 480×270 box centred in
  page padding; on a 390×844 phone it rendered as a ~215 px band with large empty margins and
  a desktop keyboard hint underneath. The canvas is now `position:fixed; inset:0` and owns the
  viewport.
- **Portrait layout.** Play area at the top, thumb controls in the lower third, rotate hint in
  the gap — instead of a small band centred in dead space.
- **Landscape phones** now fill the screen edge to edge (verified at 667×375 and 844×390).
- **Pause button** no longer overlaps the play area: bottom centre in landscape, thin top strip
  in portrait.
- **Address-bar collapse** left the game mis-scaled; sizing now follows `visualViewport` and
  re-fits on resize and scroll.

### Changed
- Scale snaps to a whole number when it costs less than 12% of the size, for crisper pixels.
- The desktop keyboard hint fades out after nine seconds.
- Title screen version string updated.

### Added
- `OFFLINE-ENHANCEMENTS.md` — every improvement that needs no server, backend or internet.

## [1.1.0] — 2026-11-01

The art and readability release.

### Added
- **Curved sprite art.** All characters redrawn with rounded caps, arcs, ellipses and
  bezier limbs instead of stacked rectangles: shaped helmets, angled visors, shoulder
  pads, capsule limbs, knee bends and rounded boots. Still pixel-pure on the 480×270 grid.
- **Enemy variation.** Per-era palettes (ember / frost / core) applied to one rig, ±6%
  scale jitter per spawn, and gold **elite** variants at ~12% frequency with 1.8× health.
- **Widescreen viewport.** Logical width follows the window aspect ratio from 16:9 to 21:9
  (`W_MIN`/`W_MAX`), with the backbuffer and canvas resized on every window change.
- **Fixed-footprint boss arenas.** Arenas stay 480 wide and the camera centres them, so a
  wide screen shows the arena walls instead of void. Stages extended by 160 px of ground
  to cover the widest view.
- **Readability pass.** Dark rims and motion trails on every bullet, off-screen threat
  arrows for unseen enemies, background dimmed 18% during boss fights.
- **Corner correction.** The commando now slides around a ledge edge (up to 4.5 px) instead
  of stopping dead when clipping it with their head.
- **Rounded platforms and ground edges**, soft elliptical cloud bands.

### Changed
- `W` is now a live variable rather than a constant; camera, culling, HUD, parallax and
  every screen read it at draw time.
- Parallax layer spans are generated with a fixed margin so they survive a viewport change.

### Fixed
- Camera could drift out of bounds after a window resize mid-stage.

## [1.0.0] — 2026-11-01

First playable release.

### Added
- **Three eras** — Ashen Dawn, Glacier Eon, Eon Core — each with its own palette,
  parallax layers, ground layout, platform set, enemy mix and boss.
- **Five weapons** — Rifle, Spread, Machine, Laser, Flame — with distinct cadence,
  spread, piercing and reach. Weapon drops are lost on death.
- **Three bosses** — The Warden, Glacier Wraith, The Eon Heart — each with a
  second phase triggered below half health.
- **Five enemy archetypes** — Grunt, Runner, Drone, Turret, Jumper.
- **Movement** — run, variable-height jump, coyote time (6 frames), jump buffering
  (7 frames), duck, eight-directional aiming.
- **Chiptune audio** — synthesised at runtime: per-era tracks plus 20 sound effects,
  with a look-ahead sequencer. Mute persists.
- **Input** — keyboard, on-screen touch pads (touch devices only) and the Gamepad API.
- **HUD and screens** — hearts, lives, score, high score, weapon chip, boss health
  bar, title, pause, era clear, game over and victory screens.
- **Persistence** — high score and mute setting in `localStorage`, wrapped so it
  never throws in private mode or from `file://`.
- **Deterministic demo harness** — `?demo=N`, `?warp=X`, `?shot=1`, `?debug=1` for
  reproducible screenshots and smoke tests.

### Fixed
- Commando could walk off the left edge of a stage into empty space; both level
  bounds are now clamped.
- Boss arenas could be entered before the gate closed, letting the player walk back
  out mid-fight.

### Notes
- The shipped game is a single self-contained `index.html` (~100 KB, ~27 KB gzipped)
  with no dependencies and no network requests.
