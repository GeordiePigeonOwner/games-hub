# GamesCreation — Project Context & Handoff

> **READ THIS FIRST.** This file is the single source of truth for project state. It was written
> 2026-06-12 when Jon migrated the project from his laptop to his main PC. Update it as you work.

## What this project is

A hub of browser games (`index.html` at root) with each game a **self-contained single-file**
`<game-id>/index.html`. Built entirely with Claude in Cowork mode. Jon experiments here; the flagship
games are faithful clones of TV game shows, playable online with workmates (team socials).

- **Live site:** https://geordiepigeonowner.github.io/games-hub/ (GitHub Pages)
- **Repo:** github.com/GeordiePigeonOwner/games-hub (public, main branch, Pages from root)
- Hub zones: futuristic, industrial, aztec, eastern, medieval, bonus. Wins/records in localStorage.

## Conventions for adding a game

1. Create `<game-id>/index.html` — single file, self-contained, back-link to `../index.html`.
2. Add an `ILLO[<game-id>]` SVG and a `GAMES` array entry (`id, zone, title, description, href, available`) in the hub.
3. Shared visual language: deep navy bg (`#0b0f1e`→`#050812`), neon `#6ac9ff`, gold `#ffd77a`,
   success `#3ed598`, danger `#ff6b6b`. Fonts: Inter / Syncopate (display) / JetBrains Mono (numbers).
4. Multiplayer games use PeerJS (WebRTC), host's browser = authoritative server, 5-char room codes,
   answers kept host-side only. See `blockbusters/index.html` as the reference implementation.

## Deploy workflow (IMPORTANT QUIRKS)

- **`.git` must NOT live in this folder** when working via Cowork's mounted-drive (lock-file
  unlink/stale-read failures). Instead, in the sandbox:
  `rsync -a --delete --exclude='.git' <mount>/GamesCreation/ ~/repo/` → commit there → push.
- Commits MUST use Jon's noreply email `9678614+GeordiePigeonOwner@users.noreply.github.com`
  (GitHub email-privacy enforcement rejects his real address).
- Jon pastes a `repo`-scope classic PAT into chat each session for pushing. NEVER commit a token.
- `market-research-puzzle-app.md` is gitignored (private). This CLAUDE.md is committed deliberately.
- After pushing, Pages redeploys automatically (~1 min).

## Game roster & state (2026-06-12)

| Game | State |
|---|---|
| **blockbusters** | ✅ Rebuilt as **Blockbusters Live** — online multiplayer (PeerJS), 1983–93 ITV rules. Deployed & live. |
| **the-wall** | ✅ Rebuilt 2026-06-12 as **The Wall Live** — show-accurate UK rules, solo practice + online pair co-op (PeerJS, prefix `twhx26-`). Logic verified headlessly (3000 sim games + deterministic edge tests). Deployed. **Needs a 2-device smoke test.** Spec kept below for reference. |
| **countdown** | ✅ Rebuilt 2026-06-12 as the real TV Countdown — letters/numbers/conundrum, solo + same-screen 2P (hidden inputs, simultaneous reveal). Logic verified headlessly (see below). Deployed. **Needs an in-browser smoke test.** |
| **number-rush** | ✅ The old click-1-to-100 game, kept under its own id. Hub ILLO + GAMES entry added 2026-06-12 (futuristic zone; countdown moved to bonus zone with the other TV games). |
| mastermind, planet-order, stop-clock, symbol-wheels, number-tower, numeral-grid, tube-spectrum, synonym-dominoes, word-chain, pipework, block-grid | ✅ Working. Bug-fix + content pass verified (`node --check` all script blocks + synonym-dominoes dup check) and **pushed 2026-06-12**. |

### Bug/content pass (verified + pushed 2026-06-12)

For reference — modified `shared/framework.js` + 11 game files:
- number-tower: bounded the rotation-scramble loop (was potentially infinite).
- tube-spectrum: count-only vs positional feedback now actually differ; added 4 colour themes (Spectrum, Warm→Cool, Ocean, Sunset) in settings.
- word-chain: CHAINS grown 20→70 (manually validated).
- synonym-dominoes: groups 30→87 (no cross-group duplicate words — that breaks the game, validate if editing).
- block-grid: Density setting (0.40/0.50/0.60) wired into generation.
- All 11 games + framework: `GameFramework.sfx` WebAudio win/lose sounds (lazy AudioContext, fail-silent). NOTE: games inline their own GameFramework copy — shared/framework.js is NOT actually loaded by them; the sfx snippet was appended per-file.
- Audit claims checked and found NOT to be bugs (don't "re-fix"): hub getBestAcrossConfigs logic; mastermind unique-mode feedback; word-chain selection off-by-one.

### New-PC mount quirk (discovered 2026-06-12)

The sandbox's FUSE view of the mounted drive can serve **stale file attributes** after Claude's
file tools modify an existing file: size/mtime stay cached, so sandbox reads come back truncated
at the old length. New files sync fine. **Fix:** in the sandbox, `mv file tmp && mv tmp file`
(rename invalidates the cache), then re-read. Check `wc -c` against expectations before trusting
a freshly edited file in the sandbox. `.git` directly on the mount remains untested on this PC.
Also: the sandbox cannot `rm` files on the mount (Operation not permitted) — use rsync excludes
or delete from the Windows side.

## The Wall Live — how it works (reference)

- `the-wall/index.html` single file. Landing offers: **Solo practice** (one screen, both roles, no
  isolation), **Host a wall** (host screen = the wall, shared on TV/call), **Join** (phone, 5-char code,
  `#CODE` URL prefill). Roles in lobby: **At the Wall** (picks drop zones) and **In the Booth**
  (answers; isolated from R2 — their client is never *sent* bank/results/zones: enforcement is
  host-side in `viewFor()`, not CSS). Seat reclaim on rejoin by name, like Blockbusters.
- Pure game flow lives between `/* ===LOGIC=== */` markers (`newFlow` + `Flow` event machine: no
  DOM/timers/network) — extractable for headless tests. Test harness used: 3000 random full games
  (bank-floor, bank-math recompute, ball counts, termination) + deterministic reds-skip/contract test.
- Physics: multi-ball canvas plinko (W=900, 7 zones, 15 slots, per-ball gravity — R1 balls fall
  slower, g=0.13, + 1.6s reading delay before release so there's time to answer).
- Rules implemented: R1 Free Fall 5×2-choice (3 auto balls zones 1/4/7, lock before first landing
  or red); R2 2 free greens → 3×3-choice (zone picked blind seeing only choices, Double Up Q2,
  Triple Up Q3) → 2 mandatory reds from green zones (skip if bank < £3); R3 3 free greens (one at a
  time) → 3×4-choice → contract (booth signs/rips BLIND before reds; sign = R1 total + £2,500 ×
  correct R2/R3 answers) → 3 reds → reveal. Bank floors at £0. Banks: QB2×30, QB3×27, QB4×30 inline.

## Blockbusters Live — how it works (reference)

- Host screen (shared on TV/call) creates room; players join on phones via 5-char code (`#CODE` in URL prefills). Blue team = 2 players, connects left→right (5 hexes); White = solo, top→bottom (4). Caps enforced in lobby.
- Two host modes: **quizmaster** (host reads Q aloud, sees answer, judges ✓/✗) and **computer** (TTS reads; buzzed team gets fuzzy-matched text box — so Jon can play as a contestant).
- First buzz locks the question to that team only; wrong → automatic steal offer; both wrong → new Q same letter. £5/correct. Best-of-3 match (Jon confirmed keeping this) → winner nominated to **Gold Run**: 60s, initials clues, pass = black blocking hex, £10/gold consolation, £200 on completion. Host has override judge buttons + "End match → Gold Run".
- Question banks inline: QBANK 24 letters × 14 = 336; GOLDBANK 73. Logic block between `/* ===LOGIC=== */` markers is extractable for headless tests (adjacency, BFS win-path, no-tie verified over 2000 random boards, fuzzy matcher).

## The Wall — original commissioned spec (DONE 2026-06-12, kept for reference)

Jon's ask: show-accurate, **online pair co-op + solo practice mode** (chosen via AskUserQuestion).
Keep the existing canvas physics (they're good); replace the game flow. PeerJS like Blockbusters
(suggest prefix `twhx26-`). Roles: host screen = the wall display; Player A "at the wall" (picks drop
zones from phone); Player B **isolated** from Round 2 (their screen shows ONLY questions — never bank,
ball results, or partner's choices). Solo mode = one player does both roles locally, no isolation.

Researched rules (Wikipedia UK + UKGameshows):
- Wall: 15 slots bottom, 7 numbered drop zones top. Green adds, red subtracts, bank floors at £0.
- **R1 "Free Fall"**: played together. 5 questions, 2 choices each. Per question 3 balls auto-release from zones 1, 4, 7; answer must lock before first ball lands. Correct → balls green (add); wrong/no-lock → red (subtract). Slots L→R: £1, £500, £100, £2,000, £10, £1,000, £1, £2,500, £1, £1,000, £10, £2,000, £100, £500, £1.
- **R2**: opens with 2 free green balls, zones chosen by wall-player, dropped simultaneously. Then 3 questions (3 choices each). Per question: wall-player sees ONLY the answer choices and picks a drop zone BEFORE the isolated partner hears the question; partner locks an answer; ball drops, turns green if right / red if wrong on landing. Q2 offers "Double Up" (2 balls from chosen zone), Q3 "Triple Up" (3). Round ends with 2 MANDATORY red balls from the same zones as the opening greens (skip if bank < £3). Slots: £1, £500, £100, £1,000, £10, £2,500, £1, £5,000, £1, £10,000, £10, £15,000, £100, £25,000, £1.
- **R3**: same as R2 but 3 free greens (dropped one at a time), 4-choice questions, 3 closing reds. Slots: £1, £2,500, £100, £5,000, £10, £10,000, £1, £15,000, £1, £20,000, £10, £25,000, £100, £50,000, £1.
- **Contract**: after R3 Q3, BEFORE the closing reds and blind to everything, the isolated player signs or rips a contract. Sign = guaranteed R1 winnings + £2,500 × correct answers across the 6 R2/R3 questions. Rip = take the final bank. Reveal happens after the reds settle.
- Skipping series-4 extras (Doubler/SuperDrop) — agreed.
- Needs an MCQ trivia bank (~80+ questions: 2-choice, 3-choice, 4-choice pools).
- Hub: update the-wall GAMES description after rebuild (do not change id/illo).

## Countdown — how it works (built 2026-06-12, reference)

- `countdown/index.html` + `shared/words.js` (156,674 words, 2–9 letters, SCOWL via `word-list` npm
  pkg, UK+US spellings; exposes `WORDS` array + `WORDSET` set; loaded via `<script src>` — the one
  deliberate exception to the single-file convention).
- Formats: Quick 9 rounds (6L/2N/C) and Full 15 (10L/4N/C). Modes: solo (score vs running
  "best possible") and same-screen 2P (password inputs, lock buttons, simultaneous reveal;
  pick control alternates; conundrum buzzers on Q / P keys, buzz pauses clock, 10s to answer,
  wrong = locked out and clock resumes).
- Official rules: letter bags A15 E21 I13 O13 U5 / B2 C3 D6 F2 G3 H2 J1 K1 L5 M4 N8 P4 Q1 R9 S9 T9
  V1 W1 X1 Y1 Z1, racks forced to 3–5 vowels; 9-letter word = 18 pts, longest-only scoring with
  ties shared; numbers 10/7/5 for exact/≤5/≤10 (closest only, ties shared), expression parser
  enforces tiles-once + every intermediate a positive integer + exact division; conundrum accepts
  any valid 9-letter anagram from the dictionary.
- Pure logic between `/* ===LOGIC=== */` markers. Test harness verified: all 80 conundrums valid,
  2000 rack sims, parser accept/reject suite, solver expressions re-parse to their claimed values
  over 300 random boards (280/300 exact), scoring + format shapes.

## Misc / pending odds & ends

- Sponsor button: `.github/FUNDING.yml` pushed (PayPal donate link for minigpo@gmail.com). Button
  only appears once Jon ticks Settings → Features → **Sponsorships** on the repo (no API for this).
  If Jon makes a PayPal.Me handle, swap the link in FUNDING.yml.
- Blockbusters AND The Wall need 2-device smoke tests before the team social (untested over real WebRTC).
- Jon's preferences: concise replies; he's a senior software engineer; ask before big scope changes
  (AskUserQuestion), show-accuracy matters a lot to him on the TV-show games.

## Suggested next-session order

1. Smoke-test on the live site: Countdown (in-browser, solo + 2P), Blockbusters + The Wall (2 devices).
2. Whatever Jon fancies next — roster is otherwise green.
