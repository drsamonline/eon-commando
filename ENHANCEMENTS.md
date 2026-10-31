# EON COMMANDO — Enhancement Programme

An exhaustive, prioritised list of everything worth doing to take the current v1.0.0
and turn it into a proper graphics-and-mechanics game: better art, real curves,
mobile *and* desktop parity, widescreen, better controls, better readability, and
LAN play with no internet.

**Tags:** `P0` do first (unblocks everything else) · `P1` high value · `P2` polish/nice-to-have
**Size:** `S` hours · `M` a session or two · `L` a big session · `XL` multi-session

Read this as a menu, not a mandate. Section 13 is the recommended order; section 14 is
what I need from you to start.

---

## 0. The three decisions that shape everything else

Everything below is downstream of these. Making them first saves weeks.

### 0.1 Renderer: stay on Canvas2D, or move to WebGL?

| Option | What you get | What it costs |
| :-- | :-- | :-- |
| **A. Canvas2D, pre-baked sprites** (recommended) | Curves, gradients, soft shadows — baked once into offscreen canvases, then blitted. Keeps the whole current codebase. No new dependencies. | Sprite memory; baking time at load; less headroom for dynamic lighting |
| **B. Canvas2D, vector-per-frame** | Unlimited smoothness, live IK, no baking | CPU per sprite per frame; will not survive 40 enemies + lights on a mid phone |
| **C. WebGL / WebGPU** | Thousands of sprites, real lighting, shaders, bloom | A rewrite of the render layer; harder to debug; needs a fallback path |

**Recommendation: A now, C only if you later want 200+ entities or real 2D lighting.**
A is a genuine visual leap for a fraction of the risk.

### 0.2 Art direction: pixel-pure, or neo-retro?

The current game is 480×270 with hard rectangles — that is the "pixel-pure" look.
Curves and variation pull in the other direction: a **neo-retro** look at a higher
internal resolution (960×540) with smooth vector silhouettes, gradients and rim light.

- **Pixel-pure + curves** — curves are quantised to the 480×270 grid. Cheap, keeps the
  charm, but curves read as "rounded steps" and variation is limited by the grid.
- **Neo-retro at 960×540** (recommended) — 4× the pixels, smooth limbs, real shading,
  and the game still looks like a 16-bit game at a glance. This is the only route that
  gives you genuinely curved, varied sprites.

This choice affects every sprite, every screenshot, and the design resolution in §2.

### 0.3 LAN architecture

Covered fully in §9, but the headline: **do local co-op first, then a bundled LAN relay
script.** WebRTC-only pairing sounds cleaner but fights the browser in ways that will
eat a week.

---

## 1. Graphics overhaul — from boxes to characters

The current art is built from `px(g,x,y,w,h,color)` calls in `src/40_art.js`. Every
character is a stack of rectangles. This section is how that becomes real art.

### 1.1 Sprite production pipeline `P0` `L`
- [ ] Replace `drawPlayer/drawGrunt/…` rect stacks with **vector rigs**: capsules, rounded
      rects, bezier limbs, ellipse joints, defined as data
- [ ] Build a **baker**: render each rig to an offscreen canvas at 2× and store frames
- [ ] Frame set per character: 8 aim angles × (idle, run×4, jump, fall, land, duck,
      duck-fire, hurt, death) — roughly 90 frames per character, baked once at load
- [ ] Cache by `character + palette + pose` so palette variants cost no extra draw calls
- [ ] Keep the baker output deterministic so screenshots and LAN stay reproducible

### 1.2 Curves, weight and silhouette `P0` `M`
- [ ] Bezier/quadratic limbs with rounded caps instead of rect arms and legs
- [ ] **Squash & stretch**: scale x/y on takeoff, landing, dash, hit (2–3 frames each)
- [ ] **Secondary motion**: helmet crest, backpack strap, scarf/antenna lagging 2 frames
      behind the body — this is the single biggest "feels alive" upgrade
- [ ] Anticipation poses: 2 frames of crouch before a jump, 2 frames of wind-up before a shot
- [ ] Aim-dependent torso rotation (currently only the gun rotates)
- [ ] Walk/run cycles with contact, down, pass, up poses — not a sine wave on two sticks

### 1.3 Shading and lighting `P1` `M`
- [ ] 3-tone shading per material (base, lit, shadow) driven by a single light direction
- [ ] Rim light on the facing edge of every character, tinted by the era's accent colour
- [ ] Soft contact shadows (radial gradient ellipse, not a flat rect)
- [ ] Additive glow pass for bullets, muzzles, explosions, boss cores
- [ ] Optional cheap 2D light: radial gradient sprites in `lighter` blend mode around
      muzzle flashes, explosions and the Eon Heart
- [ ] Optional bloom: downscale the frame, blur, add back — one offscreen canvas

### 1.4 Environments `P1` `L`
- [ ] Replace hard rectangles for ground with **organic terrain**: rounded edges, cracks,
      embedded rubble, grass/ice/crystal tufts drawn from a seeded set
- [ ] **Autotiling** for platform edges (corner, cap, side, inner corner variants)
- [ ] 4–5 parallax layers per era with **depth haze** (far layers desaturated + lightened)
- [ ] Per-era weather: embers rising (I), snow with wind drift (II), data motes and
      chromatic flicker (III)
- [ ] Destructible props: crates, barrels, ice pillars that break into debris
- [ ] Animated background life: distant walkers, searchlights, drifting airships

### 1.5 Sprite variation (cheap variety) `P1` `M`
- [ ] **Palette swaps** per era for the same enemy rig (one rig, three looks)
- [ ] Gear variants: helmet/no helmet, shield, jetpack, sniper scope — 3–4 per archetype
- [ ] Scale variance (±8%) and slight hue jitter per spawn so no two read identical
- [ ] **Elite variants** with a distinct colour, extra health and one extra attack
- [ ] Procedural decals: scars, insignia, grime placed by seeded RNG per instance
- [ ] Corpse/impact decals that persist a few seconds

### 1.6 FX upgrade `P1` `M`
- [ ] Particles as **streaks and puffs** with rotation, drag and fade curves — not squares
- [ ] Muzzle flash with light spill on the character and ground
- [ ] Impact rings, ricochet sparks, shell casings with bounce
- [ ] Explosion: flash frame → fireball → smoke → embers (4 stages, not one burst)
- [ ] Trails for the laser and dash
- [ ] Screen-space effects: radial blur on dash, chromatic offset on boss hits (off by default)

### 1.7 UI and typography `P1` `M`
- [ ] Keep the 5×7 bitmap font for retro numerals; add a **larger 8×12 variant** for menus
- [ ] Proper icon set for hearts, lives, weapons, pickups (drawn, not letter-coded)
- [ ] Animated HUD: hearts pulse when low, weapon chip slides in on pickup
- [ ] Boss health bar with phase notches and a damage "ghost" bar that drains late
- [ ] Title screen: animated logo, character silhouette, era-select strip

---

## 2. Resolution, aspect ratio and widescreen

Current state: one 480×270 backbuffer, CSS-scaled to fit. Every aspect ratio is
letterboxed into 16:9, so ultrawide and tablets waste space.

### 2.1 Variable viewport `P0` `M`
- [ ] Keep logical **height** fixed (270 or 540), make **width dynamic**:
      `viewW = clamp(round(viewH * aspect), 400, 800)`
- [ ] Camera, parallax, HUD and spawn culling all read `viewW` instead of the constant `W`
- [ ] Policy: **expand up to 21:9**, then pillarbox; never crop below 16:9
- [ ] Decide whether extra width is an advantage (more world visible) or clamped —
      recommended: advantage in single-player, clamped to 16:9 equivalent in LAN/co-op

### 2.2 Device pixel ratio `P0` `S`
- [ ] Backbuffer at CSS size × `min(devicePixelRatio, 2)`
- [ ] Render in logical units via a transform, so game code never sees DPR
- [ ] Integer-scale snapping only when it stays within 8% of the exact fit (already partly done)

### 2.3 Layout matrix `P1` `M`
- [ ] Test and tune: 16:9, 16:10, 21:9, 4:3, 3:2 tablets, portrait phones
- [ ] Portrait: either a designed portrait layout (taller view, pads at bottom) or a
      clear "rotate your device" gate — recommend a real portrait layout
- [ ] Safe areas: notch, rounded corners, gesture bar (`env(safe-area-inset-*)`)
- [ ] Fullscreen API + orientation lock on mobile

### 2.4 Camera `P1` `M`
- [ ] Look-ahead in the direction of movement (already 0.42; make it velocity-driven)
- [ ] Vertical follow with dead zone (for multi-level platforms)
- [ ] Boss arenas zoom out slightly so the whole boss is framed on small screens
- [ ] Camera shake as a curve with decay, capped, and a "reduce motion" toggle

---

## 3. Mobile and desktop parity

### 3.1 Touch controls redesign `P0` `L`
- [ ] Replace the fixed D-pad with a **floating virtual stick** that spawns where the
      thumb lands (left half of the screen)
- [ ] Right side: jump and fire as large hit targets, with a **drag-aim** zone —
      drag on the right to aim freely, tap to fire
- [ ] Alternative scheme: **auto-fire toggle** (aim with stick, gun fires itself) for
      players who cannot manage two thumbs
- [ ] Visible dead zone, adjustable stick radius, sensitivity slider
- [ ] Layout editor: drag buttons anywhere, saved per device
- [ ] Multi-touch correctness: currently one pointer per button; verify 3+ simultaneous

### 3.2 Gestures `P2` `M`
- [ ] Swipe down to duck, swipe up to jump, double-tap to dash
- [ ] Two-finger tap to pause
- [ ] Optional: tilt to aim (gyro), off by default

### 3.3 Haptics `P2` `S`
- [ ] `navigator.vibrate` on hit, land, boss phase change; toggle in settings

### 3.4 Lifecycle `P0` `S`
- [ ] Auto-pause on `visibilitychange` / blur
- [ ] Screen Wake Lock during play
- [ ] Resume audio context on first gesture (already partly handled)
- [ ] Handle iOS Safari: no autoplay audio, viewport unit quirks, no fullscreen on iPhone

### 3.5 Performance budget `P0` `M`
- [ ] Target: 60 fps on a 2019 mid-range Android; 30 fps floor elsewhere
- [ ] Adaptive quality: if average frame time > 18 ms for 2 s, drop particles, then lights,
      then sprite resolution
- [ ] Draw-call budget per frame, measured and logged in a debug overlay
- [ ] Avoid per-frame allocation in the hot loop (see §7)

### 3.6 Install and offline `P1` `M`
- [ ] `manifest.json` + service worker → installable PWA on Android/desktop
- [ ] Precache the single HTML so it launches with no network
- [ ] Note: PWA install and Wake Lock both require HTTPS — Pages gives you that

### 3.7 Desktop niceties `P1` `S`
- [ ] Window-resize handling without a hitch (already there, verify)
- [ ] Fullscreen toggle (F11-style key)
- [ ] Optional: "focus mode" — dim everything outside the play area on ultrawide

---

## 4. Controls and input feel

### 4.1 Remapping `P1` `M`
- [ ] Every action rebindable, keyboard and gamepad, persisted to `localStorage`
- [ ] Presets: Classic (Z/X), WASD+JK, Arrows+Space, Gamepad, Touch
- [ ] Conflict detection and a reset-to-default button

### 4.2 Gamepad `P1` `M`
- [ ] Dead zones (radial, 0.18 default) and response curve (exponential option)
- [ ] Rumble on hit/land/boss events
- [ ] Correct button glyphs per platform
- [ ] Hot-plug detection with an on-screen toast

### 4.3 Aiming models `P1` `M`
- [ ] Three modes: **8-way** (current), **free 360° with right stick**, **auto-face nearest**
- [ ] Reticle / aim line, fade out when not aiming
- [ ] "Sticky aim" assist slider for touch (0–100%), default 30%
- [ ] Lock-on for the boss only, optional

### 4.4 Feel tuning `P0` `S`
- [ ] Increase jump buffering to 8 frames, coyote to 7
- [ ] Add corner correction: nudge the player up to 4 px around platform edges instead of
      bonking (the single most-felt fix in any platformer)
- [ ] Landing-lag frames (2) on big falls, with input preserved
- [ ] Fire-and-jump combo: allow firing on the same frame as a jump (verify)

### 4.5 Touch-specific `P1` `M`
- [ ] Fire button held vs tapped: both supported, toggle in settings
- [ ] Auto-fire rate limiter so a sticky finger cannot spam
- [ ] On-screen button opacity slider (default 55%)

---

## 5. Mechanics expansion

Current game: run, jump, duck, 8-way shoot, five weapons, three bosses. Here is the
menu, roughly in order of value-per-effort.

### 5.1 Movement `P1` `L`
- [ ] **Dash / slide** with i-frames and a cooldown (changes everything about boss fights)
- [ ] **Ledge grab** and climb-up
- [ ] **Wall slide** and wall jump
- [ ] **Ladders / ropes**
- [ ] **Moving platforms** (horizontal, vertical, sinking) and platforms that crumble
- [ ] **Water / slow zones** with a swim state
- [ ] One-way platform drop-through (down + jump)

### 5.2 Combat `P1` `L`
- [ ] **Melee** (bayonet/knife) with a short arc — solves "enemy is on top of me"
- [ ] **Grenades** on a separate button, arc throw, bounce, fuse
- [ ] **Secondary fire** per weapon (charge shot, shotgun burst, laser lance)
- [ ] **Weapon wheel / quick swap** between two carried weapons
- [ ] Ammo/reload for heavy weapons, unlimited for the rifle
- [ ] **Charge shot** on the rifle (hold to power up)
- [ ] Destructible cover and shootable barrels

### 5.3 Defence `P1` `M`
- [ ] Dodge roll with i-frames (or dash i-frames — pick one, not both)
- [ ] **Parry** window on a boss melee attack, high skill ceiling
- [ ] Deployable shield or a one-hit barrier pickup

### 5.4 Enemies `P1` `L`
- [ ] New archetypes: **Shielder** (front armour, must be flanked), **Sapper** (places
      mines), **Sniper** (laser sight telegraph), **Swarm** (small, fast, weak),
      **Brute** (armoured, charges, staggers), **Flyer-bomber** (already have drones)
- [ ] **Elite variants** of each (different palette, +50% health, extra attack)
- [ ] Squad behaviour: grunts take cover, one flanks
- [ ] **Spawn director**: picks spawns based on player health and screen position, so the
      game stays tense instead of memorised
- [ ] Clear telegraphs: 8–12 frames of wind-up with a colour cue per attack type

### 5.5 Bosses `P1` `L`
- [ ] Phase **graph** instead of a linear timer: attack selection weighted by player
      distance and recent damage taken
- [ ] Arena hazards: closing walls, rising lava, collapsing floor
- [ ] Weak points (the Warden's core) that only take damage from certain angles
- [ ] Adds: summons that must be cleared or ignored as a trade
- [ ] A fourth boss for a hidden era, and a true final form

### 5.6 Progression and modes `P1` `L`
- [ ] **Difficulty tiers**: Recruit (more health, aim assist), Commando (as now),
      Eon (one hit, no checkpoints)
- [ ] **Perks**: pick 1 of 3 between eras (faster reload, +1 heart, dash i-frames)
- [ ] **Endless mode**: escalating waves with a score multiplier
- [ ] **Daily seed run**: same level layout for everyone, score attack
- [ ] Unlockables: skins, a gallery of sprites, a jukebox for the chiptunes
- [ ] Local leaderboard (top 10 runs in `localStorage`), plus a shareable result string

### 5.7 Scoring `P2` `M`
- [ ] Combo multiplier that decays on idle
- [ ] No-hit and no-miss bonuses
- [ ] Medals per era (bronze/silver/gold thresholds)
- [ ] Run timer and per-era splits

### 5.8 Game-feel systems `P1` `M`
- [ ] **Hit-stop**: 2–4 frames of frozen time on melee and boss hits
- [ ] Knockback curves with recovery
- [ ] Damage numbers (toggle)
- [ ] Death → slow-motion 0.3 s before the respawn prompt
- [ ] Revive for co-op instead of instant death

---

## 6. Visibility and readability

This is where a busy 480×270 screen becomes unfair. Worth more to players than any
shader.

### 6.1 Contrast discipline `P0` `M`
- [ ] Define a per-era palette with a **strict luminance ladder**: background ≤ 35%,
      mid ≤ 55%, enemies 60–80%, player 85–100%, bullets 100% + glow
- [ ] Automated check: sample the frame, warn if any enemy overlaps a background patch
      within 15% luminance
- [ ] **Silhouette pass**: every character gets a 1 px dark outline; enemies get a
      coloured rim (hostile = warm, hazard = red)
- [ ] Never place a pickup on a platform edge without a glow halo

### 6.2 Telegraph language `P0` `M`
- [ ] One colour per threat type, used everywhere: **amber = incoming projectile**,
      **red = contact damage**, **cyan = your bullets**, **green = healing**
- [ ] Wind-up flashes on every enemy attack, with the same 2-frame rhythm
- [ ] Boss attack telegraphs drawn on the ground (arcs, cones, rings)

### 6.3 Background suppression `P0` `S`
- [ ] Desaturate and darken background layers by depth (already partly done)
- [ ] Blur the far layer slightly (pre-baked, not per-frame)
- [ ] Cut background particle density by 60% during boss fights
- [ ] Optional "focus vignette" that dims the outer 15% of the screen

### 6.4 Bullet visibility `P0` `S`
- [ ] Every enemy bullet: bright core + dark outline + short trail, minimum 4×4 at 270p
- [ ] Scale bullet size with display size so phone players can see them
- [ ] Screen-edge indicators for off-screen threats (small arrows, capped at 3)
- [ ] Optional "bullet time" assist: slow bullets 15% on first death per era

### 6.5 HUD `P1` `M`
- [ ] Scale HUD independently (80–150%) and anchor to safe areas
- [ ] Declutter mode: hide score during play, show at era end
- [ ] Health as a bar *and* hearts option
- [ ] Off-screen boss indicator during arena transitions

### 6.6 Accessibility `P1` `M`
- [ ] Colourblind palettes (deuteranopia, protanopia, tritanopia) — swap the amber/red
      coding for shape coding as well
- [ ] High-contrast mode: pure black background, white outlines
- [ ] Reduce motion: no shake, no flashes, no parallax drift
- [ ] Flash intensity slider (photosensitivity)
- [ ] Text size and a dyslexia-friendly font option for menus
- [ ] Full remap + one-handed mode + hold-to-toggle for every hold action

### 6.7 Teaching `P1` `M`
- [ ] A 20-second diegetic tutorial in era I: a wall to jump, a pit, one grunt, one capsule
- [ ] Contextual prompts only when a mechanic first matters
- [ ] A pause-menu "moves" screen with the actual animations, not text

---

## 7. Performance and architecture

### 7.1 Hot-loop hygiene `P0` `M`
- [ ] Object pools for bullets, particles, floaters, enemies (no GC spikes on mobile)
- [ ] Replace `array.filter` per frame with in-place compaction
- [ ] Typed arrays for bullet and particle fields
- [ ] Avoid string building in the draw path (score text every frame → cache by value)

### 7.2 Collision `P1` `M`
- [ ] **Spatial hash** for enemy/bullet queries (currently O(n·m))
- [ ] Broad-phase by camera slice: skip anything off-screen before testing
- [ ] Fixed-point or integer collision maths for determinism (see §9.4)

### 7.3 Layer caching `P1` `M`
- [ ] Bake each parallax layer to an offscreen canvas, blit with an offset
- [ ] Bake static ground/props per era chunk (e.g. 480 px tiles), re-blit
- [ ] Pre-render the scanline and vignette overlays (already done for scanlines)

### 7.4 Loop `P1` `S`
- [ ] Render interpolation between fixed steps so motion is smooth above 60 Hz
- [ ] Cap catch-up steps (already 5); log dropped steps
- [ ] Frame-time graph in the debug overlay

### 7.5 Determinism `P0` `M` — **required for LAN**
- [ ] One seeded PRNG (mulberry32, already in the codebase) split into two streams:
      `sim` (gameplay) and `fx` (particles, shake, cosmetic jitter)
- [ ] Remove every `Math.random()` from gameplay paths — bullets, drops, AI, boss patterns
- [ ] Seed travels with the run so replays and LAN peers stay identical
- [ ] Avoid float accumulation in state that must match across peers where possible;
      prefer integers for positions in the netcode layer

### 7.6 Save and settings `P1` `S`
- [ ] Versioned save schema with migration
- [ ] Settings object: audio volumes, control layout, accessibility, difficulty, aim mode
- [ ] Export/import settings as a string (useful for LAN setup)

### 7.7 Tests and CI `P1` `M`
- [ ] Keep the `?demo` harness; extend to an assertion suite (jump height, stage flow,
      boss phases, pickup effects)
- [ ] GitHub Actions: build + headless Chromium smoke test + screenshot diff
- [ ] A "golden frame" test: render a fixed seed at frame 600 and compare hashes

### 7.8 Structure `P1` `M`
- [ ] Split `src/` further as it grows: `src/net/`, `src/ui/`, `src/art/rigs/`
- [ ] A tiny scene system (title / play / pause / results / lobby) instead of the
      state string
- [ ] Config module for tunables (speeds, damages) so balancing does not touch logic

---

## 8. Audio

- [ ] **Adaptive music**: layer in percussion and lead as enemy density rises; drop to
      bass only when health is low `P1` `M`
- [ ] Mixer: master / music / SFX sliders, persisted `P1` `S`
- [ ] Ducking: music drops 6 dB under boss roars and era-clear stings `P1` `S`
- [ ] **Stereo panning** by world x for gunfire and explosions `P1` `S`
- [ ] Reverb send for the Eon Core (a short impulse via convolution or a cheap delay) `P2` `M`
- [ ] Audio-cue accessibility: visual icons for off-screen shots and boss wind-ups `P1` `S`
- [ ] Latency compensation: fire the SFX on the same frame as the bullet `P0` `S`
- [ ] iOS unlock flow: a tap-to-start gate that resumes the AudioContext `P0` `S`
- [ ] Optional: downloadable OST as a rendered WAV from the sequencer `P2` `M`

---

## 9. LAN play (no internet)

### 9.1 What "LAN" actually means here
Two devices on the same network — phone + laptop, two laptops, two phones on a hotspot —
playing together with **no server on the internet and no internet connection required**.
Everything below is designed so the game still works with the router's WAN unplugged.

### 9.2 Transport options, honestly compared

| Option | Works offline? | Needs a helper? | Risk |
| :-- | :-- | :-- | :-- |
| **A. Local co-op, one device** (split keyboard, two gamepads, two touch zones) | Yes | No | **Low** |
| **B. WebSocket relay on the LAN** — ship `lan-relay.py`, host runs `python3 lan-relay.py`, both open the game and enter the host's IP | Yes | Yes, a one-line script | Low-medium |
| **C. WebRTC data channel, manual pairing** — copy/paste or QR the SDP offer/answer | Yes | No | Medium-high |
| **D. BroadcastChannel** — two tabs on the same browser | Yes | No | Low, but same device only |
| **E. Native socket via a wrapper app** (APK/EXE with a local server) | Yes | Build step | Medium |

**Why not lead with WebRTC (C):** `RTCPeerConnection` requires a *secure context* in
Chrome, so serving the game over plain `http://192.168.x.x` blocks it — you would need
HTTPS on the LAN or to stay on the GitHub Pages origin. Chrome also obfuscates local IPs
behind mDNS `.local` candidates, which works on most home networks but fails on some
hotspots and on networks with client isolation. It is a great *optional* mode for a
"no-server" demo, not a foundation.

**Recommended: A → B → (C as a bonus).**
- **A** gives you 80% of the fun for 20% of the work, and it is the fallback when the
  network is hostile.
- **B** is a ~150-line Python script with zero dependencies, works from `file://`, any
  browser, any OS, and is trivially debuggable. It is also how you would test C.

### 9.3 Netcode architecture `P0` `XL`
- [ ] **Host-authoritative** for enemies/bosses (the host simulates, the client sends
      input and receives snapshots), because the alternative needs full determinism
- [ ] Deterministic **lockstep** as the stretch goal: both peers simulate identical state,
      exchanging only inputs. Cheaper on bandwidth, unforgiving of divergence
- [ ] Practical middle ground: host-authoritative with **client-side prediction** for the
      guest's own movement, reconciled on each snapshot
- [ ] Input delay buffer: 2–4 frames (33–66 ms) to absorb jitter
- [ ] Snapshot cadence: 20 Hz with interpolation on the client
- [ ] Delta compression: only send changed entity fields
- [ ] Message format: compact binary (DataView) or short JSON — measure before optimising

### 9.4 Determinism prerequisites
See §7.5. In practice: seeded `sim` PRNG, no `Math.random` in gameplay, fixed 60 Hz step
(already true), and integer positions in the net state. Without this, lockstep drifts
within seconds.

### 9.5 Session UX `P1` `L`
- [ ] **Host / Join** screen with a big friendly "same Wi-Fi?" explainer
- [ ] Host shows: IP:port, a QR code containing `http://<ip>:<port>/#join=<code>`, and a
      4-letter room code
- [ ] Guest: enter IP or scan; auto-discovery via the relay broadcasting on UDP (optional)
- [ ] Lobby: both players ready, era select, difficulty, then a synchronized countdown
- [ ] In-game: connection quality dot, ping ms, "guest disconnected" with 15 s grace and
      a rejoin path
- [ ] Spectator/replay: not needed for v1

### 9.6 Co-op design changes `P1` `L`
- [ ] Two commandos on one screen: shared camera with both players in frame (dynamic zoom)
- [ ] **Revive** instead of instant death; both down = game over
- [ ] Friendly fire off; shared score with per-player breakdown
- [ ] Enemy health and count scaled by player count
- [ ] Boss patterns that split attention (one targets nearest player)
- [ ] Weapon capsules become **first-come or split** — decide and telegraph it

### 9.7 Security and sanity `P1` `S`
- [ ] The relay is LAN-only: bind to the LAN interface, refuse WAN connections, no
      outbound traffic, no telemetry — state this in the README
- [ ] Host validates guest input (rate limits, no teleporting)
- [ ] A visible "LAN session" indicator so nobody thinks it phones home
- [ ] Optional room password for shared/office networks

### 9.8 Testing `P0` `M`
- [ ] Two browser profiles on one machine (localhost) — baseline
- [ ] Phone + laptop on the same Wi-Fi — the real target
- [ ] Latency injection (artificial 80/150/300 ms) and 2% packet loss
- [ ] Guest joins mid-era (late join) — decide: allowed or next era only

---

## 10. Distribution and packaging

- [ ] **PWA**: manifest + service worker, installable, offline-first `P1` `M`
- [ ] **Android APK** via your `app-builder` repo (WebView wrapper) `P1` `M`
- [ ] **Windows EXE** via the same builder (portable single file) `P1` `M`
- [ ] Attach both to the GitHub release `P1` `S`
- [ ] `itch.io` page mirroring the landing page `P2` `S`
- [ ] Release automation: tag → build → attach assets → update changelog `P2` `M`
- [ ] Version string visible in-game and in the title screen `P0` `S`
- [ ] `docs/` gets a "what's new" strip fed by `CHANGELOG.md` `P2` `S`

---

## 11. Content roadmap (post-systems)

- [ ] Era IV: **THE LONG DARK** — zero-gravity platforms, no floor
- [ ] Era V: **ECHO** — the level replays your own earlier run as a ghost enemy
- [ ] Secret boss: a mirror of the player with your own loadout
- [ ] Boss rush mode, time attack, boss practice
- [ ] Codex: every enemy and boss with stats and a sprite viewer
- [ ] Jukebox with all chiptune tracks
- [ ] Photo mode (freeze, hide HUD, pan, save PNG) — great for the README
- [ ] Daily challenge with a fixed seed and a shareable score string

---

## 12. Accessibility checklist (roll-up)

- [ ] Full remapping, keyboard + gamepad + touch
- [ ] Difficulty tiers including a genuinely gentle one
- [ ] Aim assist slider
- [ ] Colourblind palettes + shape coding
- [ ] High-contrast mode
- [ ] Reduce motion, flash intensity, shake toggle, scanline toggle
- [ ] HUD scale, text size, dyslexia-friendly menu font
- [ ] One-handed and hold-to-toggle options
- [ ] Subtitles/visual cues for important audio
- [ ] No timed fail states in the tutorial
- [ ] Pause anywhere; resume instantly

---

## 13. Recommended sequencing

**Sprint 1 — foundation (do these together, they touch the same files)**
1. §0.1/0.2 decisions
2. §2.1 variable viewport + §2.2 DPR (widescreen is cheap and visible)
3. §7.5 determinism (seeded sim RNG) — unblocks LAN and replays
4. §4.4 feel fixes (corner correction, buffers) — biggest felt improvement per line
5. §6.1–6.4 visibility pass — biggest fairness improvement per line

**Sprint 2 — the look**
6. §1.1 sprite pipeline + §1.2 curves/weight (the big one)
7. §1.3 shading/rim light, §1.4 organic terrain, §1.5 variation
8. §1.6 FX, §1.7 HUD art
9. §3.1 touch redesign + §3.4 lifecycle, §3.5 adaptive quality

**Sprint 3 — depth**
10. §5.1 dash/ledge/wall, §5.2 melee/grenade/secondary, §5.4 new archetypes
11. §5.5 boss phase graphs, §5.6 difficulty tiers + perks
12. §8 audio upgrade, §6.6 accessibility, §6.7 tutorial

**Sprint 4 — together**
13. §9.2 option A: local co-op
14. §9.3 netcode + §9.5 session UX + §9.6 co-op rules
15. §9.2 option B: `lan-relay.py`, then optional WebRTC pairing

**Sprint 5 — ship**
16. §10 packaging (PWA, APK, EXE), §7.7 CI, §11 content

---

## 14. Decisions I need from you

1. **Art direction** — neo-retro at 960×540 with smooth curves (recommended), or keep
   pixel-pure 480×270 with curves quantised to the grid?
2. **Widescreen policy** — does a wider screen reveal more world (advantage), or is the
   play field clamped to 16:9 with pillarboxing beyond?
3. **LAN first target** — local co-op on one device, or two devices over the relay?
   (I would do both, in that order.)
4. **Scope of the next build** — Sprint 1 only (foundation, ~visible but subtle), or
   Sprint 1 + the sprite pipeline so the next screenshots look genuinely new?

Everything in this document is additive — none of it requires throwing away the current
engine, the fixed-timestep loop, the content tables or the build script.
