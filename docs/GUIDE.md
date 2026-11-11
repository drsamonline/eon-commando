# EON COMMANDO — player's guide

**Version 4.6.2 · PolyForm Noncommercial 1.0.0 · one self-contained HTML file**

A retro run-and-gun platformer. No install, no server, no build step: the game is a single
HTML file that runs from `file://` and works offline.

- Play online: <https://drsamonline.github.io/eon-commando/play/>
- Download: [`index.html`](../index.html) — double-click it, or drag it into a tab.

## Controls

Read out of `src/30_input.js`, which is the same map the game uses. Both players are
bound at once; player one is the arrow-key side, player two the WASD side.

| Action | Player one | Player two |
|---|---|---|
| Move | arrow keys | `W` `A` `S` `D` |
| Jump | `Space`, `X`, `K` | `.` (period) |
| Fire | `Z`, `J`, `Ctrl` | `,` (comma) |
| Dash | `Shift`, `L` | `/` (slash) |
| Melee | `V`, `C` | `;` (semicolon) |

Controls are rebindable per player and the binding is persisted — that landed in 2.6 and is
the reason there are three keys for jump and two for melee: the extra keys are for players
whose keyboard or hands make one of them awkward.

## What the game is

- **Endless mode** (since 3.0): escalating waves, a **boss every fifth wave**, and a score
  multiplier that rises as you go.
- **Auto-fire** (since 2.8): on by default on touch, so a phone needs one thumb.
- **Melee** has invulnerability frames and a 42-frame cooldown — it is a commitment, not a
  button you hold.
- **Off-screen enemies** are marked by arrows at the edge of the view rather than firing at
  you from nowhere.

## Playing on a phone

Open the play URL. Auto-fire is on, the layout is portrait-first, and the menus are
tappable. The game runs entirely offline once loaded, so a flaky connection after the first
load does not interrupt it.

## Running it locally

```bash
git clone https://github.com/drsamonline/eon-commando.git
cd eon-commando
open index.html      # macOS — xdg-open on Linux, start on Windows
```

It works identically from `file://` and from a web server, which is worth saying because
most canvas games do not: anything that fetches an asset breaks under `file://`, and this
one inlines everything.

## When something looks wrong

- **Nothing happens on load** — the file is self-contained, so a blank page usually means a
  browser old enough to lack the canvas features it uses. Any current Chrome, Firefox,
  Safari or Edge works.
- **Keys do nothing** — the page needs focus once: click the play area.
- **Controls feel wrong for your hands** — rebind them; the binding persists per player.

## Licence

PolyForm Noncommercial 1.0.0. Free for any noncommercial use, including playing it, copying
it and sharing it with the notice kept. Commercial use needs a licence. See
[LICENSE](../LICENSE).

The full version history is in [CHANGELOG.md](../CHANGELOG.md).
