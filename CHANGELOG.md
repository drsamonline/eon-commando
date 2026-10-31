# Changelog

All notable changes to Eon Commando.

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
