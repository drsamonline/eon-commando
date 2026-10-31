# Changelog

All notable changes to Eon Commando.

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
