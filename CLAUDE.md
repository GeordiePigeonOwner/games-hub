# GamesCreation — Session Log

## Latest session: Blockbusters Live (multiplayer rebuild)

Replaced `blockbusters/index.html` with a faithful 1983–93 ITV-rules **online multiplayer** version (Jackbox-style: host screen + players join on phones via 5-char room code).

### Architecture
- PeerJS / WebRTC, host's browser = authoritative game server (`new Peer('bbhx26-<code>')`, players `peer.connect`). CDN: cdnjs peerjs 1.5.4 with unpkg fallback. State broadcast as JSON on every change; answers never broadcast (kept host-side in `secret`).
- Two host modes: **quizmaster** (host sees Q+A, reads aloud, judges spoken answers with ✓/✗) and **computer** (SpeechSynthesis TTS reads, buzzed team gets a case-insensitive fuzzy-matched text box — normalise + strip articles + Levenshtein ≤1/≤2 by length). Host always has overrule judge buttons.
- Page supports `#CODE` hash to prefill join code.

### Show-accurate mechanics
- 20 hexes, 5 cols × 4 rows, odd columns shifted down. Blue team (2 players) connects left→right (5 hexes); solo White connects top→bottom (4). No ties possible (verified).
- Toss-up first question; correct answer claims hex (+£5) and that team picks the next letter. Wrong buzz → automatic steal offer to the other side; both wrong → fresh question, same letter. One-away hexes flash.
- Best-of-3 match → winner's nominated player (host picks for Blue) does the **Gold Run**: 5×4 board of multi-word initials ("TOL" = Tower of London), 60s, left→right, correct = gold, **pass = black blocked hex**, wrong answers don't block; timeout horn, £10/gold consolation, £200 + fanfare on completion.
- Buzzers: giant fixed button (space bar works), first message to host wins, team-colour banner + WebAudio sounds on all devices.

### Question banks (inline)
`QBANK` — 24 letters (no X/Z) × 14 = 336 "What B is…" questions. `GOLDBANK` — 73 initials clues. Per-letter shuffled pools, no repeats until exhausted.

### Verification
Headless tests (`/tmp/test.js` pattern: eval the `/* ===LOGIC=== */` block): adjacency symmetric, win-path BFS both axes, 2000 random full boards → 0 ties / 0 winner-less, one-away detection, gold-run clickability & blocking, fuzzy matcher. `node --check` passes on full assembled script.
Note: file was assembled in the sandbox (`cat part1.html qbank.js part2.js`) and `cp`'d onto the mount — bash→Windows writes synced fine this session (the earlier mount-lag quirk didn't appear; Read confirmed true state).

### Hub
Updated the `blockbusters` GAMES entry description (kept id/illo). Not playable file:// — needs serving over HTTPS (e.g. GitHub Pages) for PeerJS + remote players.

---

## Previous session: The Wall (BBC, Danny Dyer)

Added a Plinko-style clone of *The Wall* to the games hub.

### Files touched
- `the-wall/index.html` — new, self-contained game (~22 KB JS + HTML/CSS).
- `index.html` — hub registry: added SVG `illo` entry and a `GAMES` array row under the `bonus` zone.

### Game design
Three rounds, single player, single page, canvas physics.

- **Round 1 — Free Fall**: 3 free balls. Slot values `£1 / £10 / £100 / £1K / £10K / £1K / £100 / £10 / £1`. All add to the pot.
- **Round 2 — Trivia**: 5 questions (4-option MCQ, ~34-item shuffled bank). Correct → green ball (added), wrong → red ball (subtracted). Slot values up to £250K.
- **Round 3 — The Final**: 2 last drops. Slot values up to **£1,000,000**. Trivia gate as in R2.

### Mechanics
- 600×760 canvas. 13 offset peg rows (alternating 9 / 8 pegs) = 111 pegs.
- 9 slot columns of width 600/9.
- Physics: gravity 0.32, elasticity 0.55, friction 0.995, peg random-nudge 0.6 (Plinko feel).
- Aim: mouse-move or `←/→`, click or `space/enter` to drop. Snap-clamped to wall edges.
- Pegs glow + decay on hit. WebAudio tick on peg, sweep on land. Money readout flashes green/red on swing.
- Question panel disables after answer, highlights correct (green) and wrong-pick (red).

### Verification
Headless physics sim (`/tmp/sim.js`): 500 random drops → 0 failures, 0 NaN, all 9 slots reachable, avg ~196 physics steps to settle (~3 s at 60 fps). Slight edge bias (slots 0/8 ~85 each, middles ~45 each) is fine because edges hold the lowest values — the £1M middle slot stays hard to hit.

JS syntax: `node --check` passes on the extracted `<script>` block.

### Hub integration notes
- New game id: `'the-wall'`, zone: `'bonus'`, href: `the-wall/index.html`.
- SVG `illo` uses three gradients (`tw-bg`, `tw-peg`, `tw-green`) and shows a mini wall with pegs, slot dividers, value labels, and a glowing green ball.
- Placed between `blockbusters` and the end of the `GAMES` array.

### Known mount quirk
The Linux mount under `/sessions/.../mnt/GamesCreation/` lags behind file-tool writes — `bash`'s `ls`/`grep` showed the file at its pre-edit size/mtime even after successful `Edit`s. The `Read` tool reflects the true state. Use `Read` (or re-mount) to verify; don't trust bash for post-edit checks.

---

## Project context

Hub at `GamesCreation/index.html` indexes per-game folders. Each game is a standalone single-file `index.html`. Zones: `futuristic`, `industrial`, `aztec`, `eastern`, `medieval`, `bonus`. Wins/records tracked in `localStorage` (rendered as hub stats).

### Game roster (as of 2026-06-11)
mastermind, planet-order, countdown, stop-clock, symbol-wheels, number-tower, numeral-grid, tube-spectrum, synonym-dominoes, word-chain, pipework, block-grid, blockbusters, **the-wall** (new).

### Shared visual language
- Palette: deep navy backgrounds (`#0b0f1e` → `#050812`), neon accent `#6ac9ff`, gold `#ffd77a`, success green `#3ed598`, danger `#ff6b6b`.
- Fonts: Inter (body), Syncopate (display kickers), JetBrains Mono (numerics).
- The Wall uses a tightened variant: wall-deep `#050b1d`, wall-mid `#0a1f4a`, neon `#5ec8ff` (slightly cooler than hub).

### Conventions for adding a new game
1. Create `<game-id>/index.html` — single file, self-contained, back-link to `../index.html`.
2. Add an `ILLO[<game-id>]` SVG to the hub.
3. Add a `GAMES` array entry with `id`, `zone`, `title`, `description`, `href`, `available`.
4. Keep `available: false` until playable; the hub renders it as a "coming soon" non-link card.
