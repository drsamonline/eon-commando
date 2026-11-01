# Changelog

All notable changes to Eon Commando.

## [4.5.0] — 2026-11-01

LAN co-op.

### Added
- **`server.js`** — serves the game on the LAN and gives it a room, built on
  [`lan-kit`](https://github.com/drsamonline/lan-kit). Prints the address to open.
- **LAN menu**: Host / Join, tappable or `H` / `J`.
- **Lockstep input relay** in `src/95_lan.js`: both machines run the same seeded simulation and
  exchange 9-bit masks per frame with a 12-frame delay line, batched four frames per message.
- `lan-kit.js` is inlined into the build, so the single file still works standalone.

### Fixed
- The room broadcasts to everyone including the sender, so each client read its own input back
  as the other player's. Messages now carry a sender id and are ignored by their origin.
- The delay line was primed before the maps were reset, which left the session stuck on frame 0.

### Known limits
- Pause is disabled during a LAN session (it would desync), and cutscenes are skipped.
- Measured in a 2-core sandbox: 30 fps with two browsers and no LAN, ~8-17 fps with LAN. The
  sync is exact; the throughput under load is not yet good, and it is unmeasured on real hardware.

## [4.4.0] — 2026-11-01

Perks between eras.

### Added
- **Eight perks**, offered three at a time after every era is cleared: Overcharge (+25% damage),
  Rapid (−20% cooldown), Vitality (+1 max HP and a full heal), Scavenger (+1 grenade capacity,
  +2 in hand), Momentum (+35% gauge gain), Phantom (−35% dash cooldown), Aegis (−20% damage
  taken), Reserve (+1 life).
- Perks stack, are never re-offered, and persist for the whole run.
- A card screen after each outro, navigable by arrows or tappable.
- `Game.perks`, `recalcPerks()` and the multipliers `dmgMul`, `cdMul`, `powerMul`, `dashMul`,
  `takenMul` wired into weapons, power gain, dash and incoming damage.

### Fixed
- **`makePlayer` lost its `return`.** A patch anchored on text that had drifted replaced the
  function tail without the return, so every player was `undefined`. Valid JavaScript, so the
  syntax check passed; only the runtime test caught it.
- **Perk bonuses were wiped on the next era.** They were applied once to the live player, but
  `spawnPlayers` rebuilds players from the difficulty table at every stage. Bonuses are now
  applied there, after the difficulty values, so they survive.

## [4.3.0] — 2026-11-01

The pad layout editor.

### Added
- **Settings → Pads**: an editor overlay where both control clusters are outlined and draggable.
  `−`/`+` resize them (0.7×–1.5×), `RESET` restores defaults, `DONE` saves.
- Positions persist as **percentages of the viewport**, so they survive rotation, resize and
  mobile browser chrome.
- `SET.pads` ({lx, ly, rx, ry, scale}) with `applyPadLayout()`, re-applied on resize.

### Fixed
- Opening the editor on a desktop forced the touch pads visible and left them there. The editor
  now remembers whether it added the `touch` class and removes it on close, so a mouse user's
  screen is unchanged.

## [4.2.0] — 2026-11-01

Three new bosses — eras IV–VI stop reusing the campaign fights.

### Added
- **The Drowned Relay** (era IV, 130 HP): a rooted pylon. Aimed volleys from its eye, a beam
  sweeping across the floor from the mast, and shielder summons. Phase 2 adds a second beam.
- **Orbit Wreck** (era V, 160 HP): circles the arena on an elliptical path, radial bursts, and
  mines dropped on the player's position. Phase 2 tightens the orbit and doubles the arms.
- **The Last Second** (era VI, 200 HP): a clock face whose two hands fire along their length,
  so shot angles change every frame. Phase 2 reverses the second hand and adds ceiling debris.
- `spawnBeamAt()` so a beam can originate anywhere, not just a boss centre.
- `angle2` on bosses for the clock's second hand.

### Changed
- Eras IV–VI now field `relay`, `orbit` and `clock` instead of `wraith`/`heart`/`warden` with a
  `bossHpMul`. The multipliers are gone.

## [4.1.0] — 2026-11-01

Weather, control cleanup, and a text-overflow audit.

### Added
- **Per-era weather**, screen-space, no assets: embers (I), snow (II), motes (III), rain with
  occasional storm flashes (IV), wind-blown debris (V), gold ash (VI).
- `drawFit()` — draws a heading at the largest scale that still fits the view.

### Changed
- **The d-pad no longer has a jump button.** With auto-fire on, up and `A` both jumped; the
  d-pad now keeps left / duck / right and jump lives on `A` alone. `up` still jumps on a keyboard.

### Fixed
- **Text running off screen.** An audit instrumented `drawText`, mapped every string through the
  live canvas transform and flagged anything outside the viewport. It found the title wordmark,
  the era banner, "ERA CLEARED", "GAME OVER", "EON SECURED", "FINAL SCORE" and "SCORE" all
  overflowing at 220 px logical width. All now auto-fit; the audit reports clean at 220, 320,
  480 and 640 across every screen.
- The victory screen still said "ALL THREE ERAS CLEARED".

## [4.0.0] — 2026-11-01

Six eras, story cutscenes, power gauge and combo.

### Added
- **Eras IV–VI**: Sunken Relay, Orbital Wound, The Last Second — new palettes, ground layouts,
  platform sets and enemy mixes, with bosses at 1.25×, 1.5× and 1.9× health.
- **Story system**: every stage has an intro and an outro, played as in-engine cutscenes —
  a typewriter panel with a portrait plate and a speaker. No assets; the game renderer draws it.
- **Credits roll** after the final outro, scrolling in-engine.
- **Power gauge**: kills fill it (8 + combo, capped). At 100, **unleash** wipes enemy bullets,
  damages every enemy on screen (25) and the boss (40), grants ~1.8 s invulnerability and
  cuts weapon cooldown to 45%.
- **Combo**: every kill extends it; it multiplies score by up to 2× and speeds gauge gain.
  Decays after 160 frames without a kill.
- Power bound to `E`/`Q`, gamepad Y/LB, and a ⚡ touch button that appears when the gauge is full.

### Changed
- **Controls rebuilt around auto-fire**: up is jump, down is duck, the fire button is removed
  from the touch pad, and aim is fully automatic. With auto-fire off, up/down aim as before.
- Auto-fire target search widens to the whole facing side when aiming is automatic.

### Fixed
- The touch-pad markup had drifted from the CSS; the fire button now hides correctly in
  auto-fire mode and the power button appears only when ready.
- Credits lines drew past the bottom edge and overlapped.
- The screenshot harness left an intro cutscene on screen when jumping to a stage.

## [3.1.0] — 2026-11-01

Distribution release: binaries, a redesigned site, a separate demo.

### Added
- **Windows EXE and Android APK builds** via the shared
  [`app-builder`](https://github.com/drsamonline/app-builder) kit. A consuming repo adds one
  workflow file; the kit builds both, publishes them to a release, and inherits its own fixes.
- **A dedicated live-demo page** at `docs/demo/` — the game in a framed viewport with a thin
  chrome bar (back to site, bare game, source, fullscreen). `docs/play/` stays the bare game
  and is what the EXE/APK wrap.
- **Redesigned landing page** as an arcade flyer rather than a card grid: marquee strip,
  outlined display type, a spec plate, colour-coded era bands, a filmstrip and a downloads
  panel.

### Audited
- Every internal `src`/`href` across the three pages resolves; no missing screenshots.
- No page-level console errors on load for the landing page, the demo page or the game.
- 18-point functional audit across campaign, boss flow, co-op, endless, replays, menus,
  settings, auto-fire, narrow viewports and persistence — all pass.

## [3.0.0] — 2026-11-01

Endless mode, and a real title menu.

### Added
- **Endless mode**: the camera locks to an arena, the gate shuts, and waves arrive from both
  sides and from above. Wave count scales with the wave number (2 + wave×0.8, capped at 10),
  and the enemy pool widens as you go — grunts and runners, then drones, jumpers, snipers,
  swarms, shielders, turrets and brutes.
- **A boss every fifth wave**, drawn from the three campaign bosses in rotation, on top of the
  wave's crowd. A boss death ends the wave rather than the stage.
- **Rising score multiplier**: +0.15 per wave, applied to kills, boss kills and wave bonuses.
- **One grenade back per cleared wave.**
- **Title menu**: Campaign / Endless / Daily Run / Watch Last Run / Two Players. Navigable with
  the arrow keys and tappable, replacing the old "press enter" prompt.

### Changed
- `Game.mode` distinguishes `campaign` from `endless`; boss death and stage flow respect it.
- The title screen drops the control hint lines — they live in Controls now.

## [2.8.0] — 2026-11-01

Auto-fire.

### Added
- **Auto-fire**, wired to the existing `autoFire` setting (which was in the menu but did
  nothing). The gun fires by itself at a target within ~31° of the current aim and 210 px.
- **Aim assist**: the shot is fired at the acquired angle while the arm swings toward it, so
  the assist corrects precision rather than intent. A target behind you or outside the cone is
  ignored; manual fire on `Z`/`B` still overrides it.
- **Default on for touch devices, off for keyboard**, decided on first run.
- `AUTO` indicator next to the weapon chip, brightening when a target is locked.
- `?autofire=1` / `?autofire=0` URL override.

### Changed
- **Portrait view tightened from 270 to 220 world pixels wide.** With aiming handled, the
  closer camera is viable: the commando is 21 px wide instead of 17 and the play area covers
  57% of the screen height instead of 46%.
- Earth strata and grit below the play area are denser so the lower band reads as ground.

## [2.7.0] — 2026-11-01

Touch-accessible menus.

### Added
- **Pause is a menu**: Resume / Settings / Controls / Restart Run / Quit to Title, reachable
  from the ❙❙ button and navigable by tap or arrow keys.
- **Every menu is tappable.** Pause, Settings and Controls build a hit-map as they draw, so the
  drawn layout and the touch targets cannot drift apart. Settings rows respond to the right half
  (increase) and left half (decrease).
- Touch-sized targets: pause rows step 25 px in portrait (~36 px on screen) rather than 18, and
  every menu's hit band is wider than its text.
- `Game.nudgeSetting()` shared by keyboard and tap so the two paths cannot diverge.

### Fixed
- **`fitCanvas` computed the portrait view height after the screenshot early-return**, so
  `?shot=1` on a phone rendered the 16:9 layout. The view height is now resolved first.
- The HUD is hidden on the pause screen, where its era banner overlapped the menu.

## [2.6.0] — 2026-11-01

Rebindable controls.

### Added
- **Controls screen** (Settings → Controls, or `O` then Enter): nine actions per player,
  up/down to pick, Enter to listen, next key press binds, `R` resets to defaults,
  left/right switches player.
- **Bindings are data**, not code: a `BINDINGS` table per player persisted in `localStorage`,
  with a reverse keycode map rebuilt on change. Keyboard and gamepad both flow through it.
- **Key stealing**: binding a key removes it from any other action, which falls back to its
  default rather than becoming unbound.
- Player two's keys are now defaults rather than a hardcoded second map, so co-op is
  rebindable too.

### Changed
- Arrow keys render as glyphs on the controls screen instead of the words LEFT/RIGHT.
- The HUD is hidden behind the settings and controls screens.

### Known gap
- On-screen touch buttons are fixed-position; rebinding covers keyboard and gamepad only.

## [2.5.0] — 2026-11-01

Replays and daily runs.

### Added
- **Replay recording.** Every run records its seed and input stream, run-length encoded into
  `localStorage` — 900 frames of play compress to 196 characters. Nothing is recorded from
  the game state, because the simulation is deterministic.
- **Replay playback** — `R` on the title screen replays the last run, with a `REPLAY`
  watermark. Verified identical: a recorded run ending at score 1380 / x=861 reproduced
  frame for frame on playback.
- **Daily run** — `D` on the title starts a run seeded from today's local date, so everyone
  gets the same run on the same day. No server involved.
- `startGame(coop, forcedSeed)` accepts an explicit seed, which replays and daily runs use.
- Any key exits a finished replay.

## [2.4.0] — 2026-11-01

Portrait and phone layout release.

### Fixed
- **Portrait phones only used a quarter of the screen.** The view was forced to 16:9, so on a
  390×844 phone the canvas was 390×219 — 26% of the height. Portrait now uses a square
  logical view (270×270) and the canvas takes the full screen height: 390×390, 46% of the
  height and 78% larger than before.
- **The canvas now fills 100% of both axes** in every orientation, verified at 390×844,
  360×640, 412×915, 768×1024, 844×390, 640×360 and 1440×810.
- **The title screen overflowed** a 270-wide view — the control lines, the start prompt and the
  version string ran off both edges. They now use shorter copy below 380 px wide.
- **The settings screen overflowed** the same way; rows and the footer reflow for narrow views.
- **Bosses could leave the screen** in a narrow view, because the arena is a fixed 480 wide.
  Boss movement is now clamped to the visible window.

### Added
- `VIEW_H` / `Y0`: a logical canvas taller than the 270 px world, with the play area anchored
  at the top, sky above and textured earth below, and the thumb pads over the earth.
- Earth strata and seeded grit fill the space below the play area in portrait.

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
