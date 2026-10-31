# EON COMMANDO — Offline Improvement List

Everything here works with **no server, no backend, no accounts, no internet** — the game
opens from a file, or from GitHub Pages, and never talks to anything.

`P0` do first · `P1` high value · `P2` polish  ·  `S` hours · `M` a session · `L` big session · `XL` multi-session
`[x]` shipped in 1.2.0 · `[ ]` still open

---

## 1. Display and device support

This was the biggest gap. The game was a fixed 480×270 box floating in page padding, so on a
390×844 phone it was a 215-pixel band in the middle of a mostly empty screen, with a desktop
keyboard hint underneath.

### 1.1 Fixed in 1.2.0 `[x]`
- [x] Canvas owns the viewport (`position:fixed; inset:0`) — no page furniture, no borders
- [x] Scale computed from the **visual viewport**, so mobile browser chrome is accounted for
- [x] **Portrait layout**: game band at the top, thumbs in the lower third, no dead margins
- [x] **Landscape phones fill the screen edge-to-edge** (667×375 and 844×390 both verified)
- [x] Pause button moved out of the play area (bottom centre in landscape, top strip in portrait)
- [x] Desktop hint auto-fades after nine seconds instead of sitting on the game forever
- [x] Whole-number scale snapping when it costs <12% size, for crisper pixels
- [x] Re-fit on `visualViewport` resize/scroll, not just window resize

### 1.2 Still open
- [ ] **DPR-aware backbuffer** — render at `min(devicePixelRatio, 2)` so pixels are sharp on
      retina screens instead of CSS-upscaled `P0` `M`
- [ ] **Portrait "play anyway" mode** — a taller logical view (H grows to ~400) so portrait
      players get a real view rather than a 219 px band `P1` `L`
- [ ] **Fullscreen API** button on desktop and Android `P1` `S`
- [ ] **Orientation lock** in landscape mode on Android `P2` `S`
- [ ] **Screen Wake Lock** while playing, released on pause `P1` `S`
- [ ] **Safe-area polish** — verify notch, rounded corners and gesture bar on real devices `P1` `S`
- [ ] **Tablet layouts** — 3:2 and 4:3 have their own sweet spot; tune the portrait reserve `P1` `M`
- [ ] **Foldables / split screen** — re-fit on viewport change without losing state `P2` `S`
- [ ] **Ultrawide ceiling** — currently 21:9; consider 32:9 with a clamped play field `P2` `S`
- [ ] **Battery-aware frame cap** — 30 fps option, and drop to 30 when the battery is low `P2` `M`

---

## 2. Graphics

- [ ] **Sprite baking** — render each pose once into an offscreen canvas, then blit `P0` `L`
      (per-frame vector drawing is the main cost on mid-range phones today)
- [ ] **Animation states** — landing squash, skid, wall-slide, dash, hurt, death `P1` `M`
- [ ] **Secondary motion** — crest, strap and antenna lag two frames behind the body `P1` `S`
- [ ] **Directional shading** — one light vector, three tones per material `P1` `M`
- [ ] **Rim light** in the era accent colour on every character edge `P1` `S`
- [ ] **Contact shadows** with soft falloff instead of flat ellipses `P1` `S`
- [ ] **Additive glow pass** for bullets, muzzles, cores, explosions `P1` `M`
- [ ] **Optional bloom** — downscale, blur, add back (one offscreen canvas) `P2` `M`
- [ ] **Organic terrain** — rounded ground edges, cracks, embedded rubble, tufts `P1` `L`
- [ ] **Autotiling** for platform corners and caps `P1` `M`
- [ ] **Depth haze** — desaturate and lighten by parallax layer `P1` `S`
- [ ] **Weather per era** — embers, snow with wind drift, data motes `P1` `M`
- [ ] **Destructible props** — crates, barrels, ice pillars that break into debris `P1` `M`
- [ ] **Background life** — distant walkers, searchlights, drifting airships `P2` `M`
- [ ] **Elite visual language** — a distinct outline plus a spawn flourish, not just gold `P1` `S`
- [ ] **Decals** — scorch marks and corpses that fade over a few seconds `P2` `S`
- [ ] **Boss art pass** — a second form for each boss (broken plates, exposed core) `P1` `L`
- [ ] **Menu art** — era-select strip, weapon icon set, animated title logo `P1` `M`
- [ ] **Photo mode** — freeze, hide HUD, pan, save a PNG via `toDataURL` `P2` `M`

---

## 3. Mechanics

- [ ] **Dash / slide** with i-frames and cooldown `P0` `M` — the single biggest change to boss fights
- [ ] **Melee** with a short arc, so an enemy on top of you is not a death sentence `P1` `M`
- [ ] **Grenades** on their own button, arc throw, bounce, fuse `P1` `M`
- [ ] **Secondary fire** per weapon (charge shot, burst, lance) `P1` `M`
- [ ] **Two-weapon carry** with a quick swap `P1` `M`
- [ ] **Ledge grab** and climb-up `P1` `M`
- [ ] **Wall slide / wall jump** `P1` `M`
- [ ] **Moving platforms** — horizontal, vertical, crumbling `P1` `M`
- [ ] **Drop-through** one-way platforms (down + jump) `P1` `S`
- [ ] **Ladders and ropes** `P2` `M`
- [ ] **Water / slow zones** with a swim state `P2` `L`
- [ ] **New archetypes** — Shielder, Sapper, Sniper (laser sight), Swarm, Brute `P1` `L`
- [ ] **Squad behaviour** — one flanks while another suppresses `P2` `L`
- [ ] **Spawn director** — weights spawns by player health and screen position `P1` `M`
- [ ] **Telegraph standard** — 8–12 frames of wind-up with a per-attack colour cue `P0` `M`
- [ ] **Boss phase graphs** — attack choice weighted by distance and recent damage `P1` `L`
- [ ] **Arena hazards** — closing walls, rising floor, collapsing ground `P1` `L`
- [ ] **Weak points** that only take damage from certain angles `P1` `M`
- [ ] **Hit-stop** — 2–4 frozen frames on melee and boss hits `P1` `S`
- [ ] **Difficulty tiers** — Recruit / Commando / Eon `P1` `M`
- [ ] **Perks** — pick 1 of 3 between eras `P1` `M`
- [ ] **Endless mode** with an escalating multiplier `P1` `L`
- [ ] **Daily seed run** — deterministic from the date, no server needed `P1` `M`
- [ ] **Boss rush and time attack** `P2` `M`
- [ ] **Combo multiplier** that decays on idle `P2` `S`
- [ ] **No-hit and no-miss bonuses, medals per era** `P2` `S`
- [ ] **Revive in co-op** instead of instant death `P1` `S`

---

## 4. Controls and input

- [ ] **Floating virtual stick** — spawns under the thumb instead of a fixed d-pad `P0` `M`
- [ ] **Drag-to-aim** on the right side, tap to fire `P0` `M`
- [ ] **Auto-fire mode** for players who cannot manage two thumbs `P1` `S`
- [ ] **Touch layout editor** — drag buttons anywhere, saved per device `P1` `M`
- [ ] **Button size / opacity sliders** `P1` `S`
- [ ] **Left-handed mode** — mirror the pads `P1` `S`
- [ ] **Multi-touch verification** — 3+ simultaneous pointers `P0` `S`
- [ ] **Gestures** — swipe down to duck, up to jump, double-tap to dash `P2` `M`
- [ ] **Haptics** on hit, land, boss phase `P2` `S`
- [ ] **Full remapping** — keyboard and gamepad, persisted `P1` `M`
- [ ] **Gamepad** — radial dead zones, response curve, rumble, hot-plug toast `P1` `M`
- [ ] **Aim models** — 8-way / free 360° / auto-face, plus an aim assist slider `P1` `M`
- [ ] **Input buffering** — raise to 8 frames, coyote to 7 `P0` `S`
- [ ] **Landing lag** of 2 frames on big falls, preserving input `P2` `S`
- [ ] **One-handed mode** and hold-to-toggle for every hold action `P1` `M`

---

## 5. Readability and accessibility

- [ ] **Contrast ladder** per era — background ≤35%, enemies 60–80%, player 85–100% `P0` `M`
- [ ] **Automated contrast check** in the debug overlay `P2` `S`
- [ ] **Colourblind palettes** — deuteranopia, protanopia, tritanopia `P1` `M`
- [ ] **Shape coding** alongside colour for every threat type `P1` `S`
- [ ] **High-contrast mode** — black background, white outlines `P1` `S`
- [ ] **Reduce motion** — no shake, no flashes, no parallax drift `P1` `S`
- [ ] **Flash intensity slider** (photosensitivity) `P0` `S`
- [ ] **HUD scale** 80–150% and a declutter mode `P1` `S`
- [ ] **Health as bar or hearts**, player's choice `P2` `S`
- [ ] **Damage numbers** toggle `P2` `S`
- [ ] **Off-screen threat arrows** `[x]` shipped — extend to incoming projectiles `P1` `S`
- [ ] **Bullet visibility at small sizes** — scale bullets with display size `P1` `S`
- [ ] **Text size and dyslexia-friendly menu font** `P2` `M`
- [ ] **Visual cues for important audio** (captions) `P1` `M`
- [ ] **Tutorial** — 20 diegetic seconds in Era I: a wall, a pit, one grunt, one capsule `P1` `M`
- [ ] **Moves screen** in the pause menu showing the actual animations `P2` `S`

---

## 6. Audio

- [ ] **Mixer** — master / music / SFX sliders, persisted `P1` `S`
- [ ] **Adaptive layers** — percussion and lead come in as enemy density rises `P1` `M`
- [ ] **Ducking** — music drops 6 dB under boss roars and clear stings `P1` `S`
- [ ] **Stereo panning** by world x `P1` `S`
- [ ] **Cheap reverb** for the Eon Core via a feedback delay `P2` `S`
- [ ] **Voice cap and rate limit** so a bullet storm cannot clip `P1` `S`
- [ ] **iOS unlock flow** — tap-to-start gate that resumes the AudioContext `[x]` partly, verify `P0` `S`
- [ ] **Jukebox** with every track, unlocked as you clear eras `P2` `M`
- [ ] **Offline OST export** — render the sequencer to a WAV in-browser `P2` `M`

---

## 7. Performance and battery

- [ ] **Object pools** for bullets, particles, floaters `P0` `M`
- [ ] **In-place compaction** instead of `array.filter` each frame `P0` `S`
- [ ] **Spatial hash** for enemy/bullet queries `P1` `M`
- [ ] **Broad-phase by camera slice** before precise tests `P1` `S`
- [ ] **Bake static parallax layers** to offscreen canvases `P1` `M`
- [ ] **Cache HUD strings** — the score currently rebuilds a string every frame `P0` `S`
- [ ] **Adaptive quality** — drop particles, then lights, then resolution if frame time > 18 ms `P1` `M`
- [ ] **Frame-time graph** in a debug overlay `P2` `S`
- [ ] **Render interpolation** between fixed steps for >60 Hz displays `P1` `M`
- [ ] **Battery API** — cap to 30 fps when the battery is low or unplugged `P2` `M`
- [ ] **Memory soak test** — 30 minutes of play, watch heap growth `P1` `M`

---

## 8. Persistence and meta (all local)

- [ ] **Versioned save schema** with migration `P1` `S`
- [ ] **Settings object** — audio, controls, accessibility, difficulty, aim mode `P1` `S`
- [ ] **Settings export/import** as a string (share a config without a server) `P2` `S`
- [ ] **Local leaderboard** — top 10 runs in `localStorage` with per-era splits `P1` `M`
- [ ] **Shareable result string** — base64 of seed + score + time, verified by replay `P2` `M`
- [ ] **Replays** — record input frames, replay deterministically, export as a file `P1` `L`
- [ ] **Unlocks** — skins, sprite gallery, jukebox `P2` `M`
- [ ] **Stats page** — kills, deaths, favourite weapon, time played `P2` `S`
- [ ] **Seeded runs** — a seed field on the title screen `P1` `M`
- [ ] **Reset / wipe data** with confirmation `P2` `S`

---

## 9. Same-device multiplayer (no network at all)

This is the only multiplayer that needs nothing — and it is the highest fun-per-effort item
on this list.

- [ ] **Two players, one keyboard** — P1 arrows + `Z`/`X`, P2 `WASD` + `,`/`.` `P0` `M`
- [ ] **Two gamepads** — pad 0 and pad 1, each with its own action set `P0` `M`
- [ ] **Two touch zones** — split screen halves on a tablet `P1` `M`
- [ ] **Shared camera** that keeps both players in frame (dynamic zoom) `P0` `M`
- [ ] **Revive** instead of instant death; both down = game over `P1` `S`
- [ ] **Friendly fire off**, shared score with a per-player breakdown `P1` `S`
- [ ] **Difficulty scaling** by player count `P1` `S`
- [ ] **Capsule fairness** — first-come, or split; decide and telegraph it `P1` `S`
- [ ] **Alternating modes** — score attack taking turns on one device `P2` `M`

---

## 10. Packaging and distribution (no backend)

- [ ] **PWA** — manifest plus a service worker that precaches the single file `P1` `M`
      (install prompts need HTTPS once; after that it runs with the network off)
- [ ] **Android APK** via your `app-builder` repo `P1` `M`
- [ ] **Windows EXE** via the same builder `P1` `M`
- [ ] **Attach both to the GitHub release** `P1` `S`
- [ ] **Offline ZIP** with the game plus a README for people who want a folder `P2` `S`
- [ ] **itch.io page** mirroring the landing page `P2` `S`
- [ ] **`file://` verification** — every feature tested with no server and no network `P0` `S`

---

## 11. Content

- [ ] **Era IV: THE LONG DARK** — zero-gravity platforms, no floor `P1` `XL`
- [ ] **Era V: ECHO** — the level replays your own earlier run as a ghost enemy `P2` `XL`
- [ ] **Secret boss** — a mirror of the player with your own loadout `P2` `L`
- [ ] **Codex** — every enemy and boss with stats and a sprite viewer `P1` `M`
- [ ] **Bestiary entries unlock** as you kill them `P2` `S`
- [ ] **New weapons** — ricochet, homing, mine layer `P1` `L`

---

## 12. QA and tooling

- [ ] **Assertion suite** on the existing `?demo` harness — jump height, stage flow, bosses `P1` `M`
- [ ] **Golden-frame test** — same seed, frame 600, compare hashes `P1` `M`
- [ ] **Screenshot matrix** — 16:9, 16:10, 21:9, portrait phone, tablet, small phone `P0` `S`
- [ ] **Real-device pass** — one iPhone, one Android, one desktop, one ultrawide `P1` `M`
- [ ] **Seeded RNG** — split `sim` and `fx` streams (also the prerequisite for replays) `P0` `M`
- [ ] **Debug overlay** — FPS, entity counts, frame time, state `P1` `S`

---

## 13. The boundary — what genuinely needs a server

For clarity, so nobody plans around it:

| Wanted | Needs |
| :-- | :-- |
| Two devices on a LAN | A host process — `lan-kit` (`createHost` + SSE/POST) on one machine |
| Cloud saves / cross-device progress | Backend storage |
| Global leaderboards | Backend |
| Accounts, profiles, friends | Backend |
| Telemetry / analytics | Backend (and should stay off) |
| Remote play over the internet | Backend relay or peer discovery service |
| Updates pushed silently | Backend |

Everything in sections 1–12 runs from `file://` with the network unplugged. Two devices
playing together is the only item that needs a helper process, and that helper is local —
it is not the internet.
