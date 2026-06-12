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
| **the-wall** | ⚠️ Single-player plinko, NOT show-accurate. **Rebuild commissioned — full spec below. Not started.** |
| **countdown** | ⚠️ Misnamed: it's a "click 1–100 in order" game, not the TV show. **Rebuild commissioned — spec below. Not started.** |
| mastermind, planet-order, stop-clock, symbol-wheels, number-tower, numeral-grid, tube-spectrum, synonym-dominoes, word-chain, pipework, block-grid | ✅ Working. Just received a bug-fix + content pass (see below) — **changes are local-only, NOT yet pushed or fully syntax-verified.** |

### Just-completed work (UNPUSHED, needs verification before deploy)

A bug/content pass modified `shared/framework.js` + 11 game files:
- number-tower: bounded the rotation-scramble loop (was potentially infinite).
- tube-spectrum: count-only vs positional feedback now actually differ; added 4 colour themes (Spectrum, Warm→Cool, Ocean, Sunset) in settings.
- word-chain: CHAINS grown 20→70 (manually validated).
- synonym-dominoes: groups 30→87 (no cross-group duplicate words — that breaks the game, validate if editing).
- block-grid: Density setting (0.40/0.50/0.60) wired into generation.
- All 11 games + framework: `GameFramework.sfx` WebAudio win/lose sounds (lazy AudioContext, fail-silent). NOTE: games inline their own GameFramework copy — shared/framework.js is NOT actually loaded by them; the sfx snippet was appended per-file.
- Audit claims checked and found NOT to be bugs (don't "re-fix"): hub getBestAcrossConfigs logic; mastermind unique-mode feedback; word-chain selection off-by-one.

**First job on the new PC:** run `node --check` on every modified file's script blocks (the laptop's
sandbox ran out of disk before verification), then commit + push everything.

## Blockbusters Live — how it works (reference)

- Host screen (shared on TV/call) creates room; players join on phones via 5-char code (`#CODE` in URL prefills). Blue team = 2 players, connects left→right (5 hexes); White = solo, top→bottom (4). Caps enforced in lobby.
- Two host modes: **quizmaster** (host reads Q aloud, sees answer, judges ✓/✗) and **computer** (TTS reads; buzzed team gets fuzzy-matched text box — so Jon can play as a contestant).
- First buzz locks the question to that team only; wrong → automatic steal offer; both wrong → new Q same letter. £5/correct. Best-of-3 match (Jon confirmed keeping this) → winner nominated to **Gold Run**: 60s, initials clues, pass = black blocking hex, £10/gold consolation, £200 on completion. Host has override judge buttons + "End match → Gold Run".
- Question banks inline: QBANK 24 letters × 14 = 336; GOLDBANK 73. Logic block between `/* ===LOGIC=== */` markers is extractable for headless tests (adjacency, BFS win-path, no-tie verified over 2000 random boards, fuzzy matcher).

## COMMISSIONED: The Wall rebuild (full spec, researched from UK BBC show)

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

## COMMISSIONED: Countdown rebuild (decisions made)

- Build the REAL TV Countdown in `countdown/`: letters rounds (9 letters, vowel/consonant picks with
  weighted distribution, 30s clock, dictionary validation, score = word length, 18 for nine-letter),
  numbers rounds (6 tiles large/small pick, target 101–999, 30s, expression input validated by
  arithmetic, 10/7/5 points for exact/≤5/≤10 away, include a solver to show best possible),
  and the Conundrum (9-letter anagram, 30s, buzz + type).
- Modes: solo practice + same-screen 2-player (both type hidden answers, simultaneous reveal).
- Dictionary: ship a word list in the repo (e.g. `shared/words.js`) — needed for validation + solver.
- **Rename the existing click-1-to-100 game to "Number Rush"** (`number-rush/` folder) and KEEP it:
  new hub ILLO + GAMES entry for number-rush; countdown entry stays pointing at the new TV game.

## Misc / pending odds & ends

- Sponsor button: `.github/FUNDING.yml` pushed (PayPal donate link for minigpo@gmail.com). Button
  only appears once Jon ticks Settings → Features → **Sponsorships** on the repo (no API for this).
  If Jon makes a PayPal.Me handle, swap the link in FUNDING.yml.
- Blockbusters needs a 2-device smoke test before the team social (untested over real WebRTC).
- Jon's preferences: concise replies; he's a senior software engineer; ask before big scope changes
  (AskUserQuestion), show-accuracy matters a lot to him on the TV-show games.

## Suggested next-session order

1. Verify the unpushed bug/content pass (`node --check` script blocks), fix anything broken.
2. Commit + push everything (get fresh PAT from Jon; remember rsync workflow + noreply email if the
   .git-on-mount problem recurs on the new PC — test `git init` directly first, it may just work there).
3. Rebuild The Wall per spec above.
4. Rebuild Countdown + Number Rush per spec above.
5. Update hub entries, deploy, smoke-test on the live site.
