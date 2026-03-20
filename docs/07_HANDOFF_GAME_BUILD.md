# /loop — Handoff Prompt: Game Build
**Version:** 2.0
**Paste everything below this line into a new chat to begin building /loop.**

---

You are helping me build **/loop** — a top-down pixel art life and career RPG. This is a new project built from scratch. Here is everything you need to know.

---

## What /loop Is

/loop is a top-down pixel art RPG in the style of early Zelda. Mobile-first, browser-based, installable as a PWA. The player walks around a world — their flat, a neighbourhood, a workplace — and progresses through two systems simultaneously:

**The Life Track:** Daily directives feed five universal stats. Real-world behaviours log to in-game progress. Stats decay if neglected. Momentum builds through streaks.

**The Career Track:** Player starts unemployed. Applies for jobs, gets hired, completes Career Directives, faces Encounter mini-games, receives Skill Scrolls, ranks up, gets promoted.

Both tracks share one stat system. Life Directives and Career Encounters both feed the same five stats.

The game also features turn-based combat against Faction operatives — enemies in the world with HP bars, ability systems, and real consequences.

---

## The Three Classes

**ARCHITECT** — Technical class. Precision, systems, pattern recognition.
Ranks: Apprentice → Coder → Engineer → Senior Engineer → Staff Engineer → Principal → Architect → Chief Architect

**WARLORD** — Command class. People, coordination, battlefield control.
Ranks: Intern → Coordinator → Manager → Senior Manager → Director → VP → General → Warlord

**HERALD** — Influence class. Information, persuasion, words as weapons.
Ranks: Intern → Associate → Specialist → Senior Specialist → Lead → Head → Chief → Grand Herald

---

## The Five Stats

**INTELLIGENCE** (`#1A6BFF` blue) — How sharply you read situations and make the right call.
- Life: learning directives, deliberate study
- Career: primary stat for all Encounter types
- Combat: ability reveals, enemy information access

**STRENGTH** (`#E63B2E` red) — How much you actually deliver and follow through.
- Life: physical directives, streak maintenance, HP recovery rate
- Career: completing multi-step Career Directives, promotion thresholds
- Combat: HP total, base defence, healing ability effectiveness

**CHARISMA** (`#9B5DE5` purple) — How well you move and influence people.
- Life: social directives, NPC relationship building, NPC accessibility
- Career: people-management encounters, interview checks
- Combat: influence abilities, Distractor debuff resistance

**DEXTERITY** (`#00A878` green) — How well you adapt and respond to changing situations.
- Life: pattern-breaking directives, Corrupted State recovery speed
- Career: ambiguity encounters, shifting-condition scenarios
- Combat: turn speed, debuff resistance, Anchor operative warning

**LUCK** (`#F4C430` gold) — Derived. Average of the other four. Cannot be targeted directly.

---

## The Stack

- Vanilla HTML, CSS, JavaScript — no frameworks, no bundlers
- HTML5 Canvas (320×180 internal resolution) for game world
- DOM overlay for System Window, dialogue, encounter mini-games
- Firebase Firestore for opt-in cloud save
- localStorage for all local state and API keys (keys NEVER go to Firestore or Git)
- Gemini 2.5 Flash (reasoning) / Gemini 2.5 Flash Lite (classification) — default AI
- Other providers (OpenAI, Anthropic) supported via player key
- Service Worker for offline/PWA
- Web Audio API only — no audio files
- GitHub Pages for hosting
- No external libraries except Firebase

**Always verify Gemini model strings against live Google AI documentation before building. Do not use model names from memory.**

---

## Developer Environment

- Windows 11, VS Code, PowerShell terminal in VS Code
- 4 spaces indentation throughout
- Local dev: VS Code Live Server over `http://localhost` (never `file:///`)

---

## File Structure

```
/loop/
├── index.html
├── manifest.json
├── service-worker.js
├── css/style.css
├── js/
│   ├── main.js               # Game loop, init, global state
│   ├── world.js              # Map rendering, off-screen buffer, tile system
│   ├── player.js             # Movement, collision, animation, stat sync
│   ├── npc.js                # NPC logic, dialogue, memory, quest delivery
│   ├── quests.js             # Quest pool, tracking, completion
│   ├── encounters.js         # Encounter mini-game engine (all 9 types)
│   ├── combat.js             # Turn-based combat engine
│   ├── abilities.js          # Ability definitions, unlock logic, execution
│   ├── scrolls.js            # Skill Scroll library, drops, display
│   ├── stats.js              # Stat calculation, decay, display
│   ├── career.js             # Career track, rank ladder, job applications
│   ├── system-window.js      # System Window overlay
│   ├── behavioural-trace.js  # Seven-day pattern analysis and delivery
│   ├── ai.js                 # AI integration, Gemini routing, prompts
│   ├── audio.js              # Web Audio API synthesiser
│   └── save.js               # localStorage and Firestore persistence
└── data/
    ├── quests.json
    ├── career-quests.json
    ├── encounters.json
    ├── scrolls.json
    ├── abilities.json
    ├── npcs.json
    ├── operatives.json
    └── maps.json
```

---

## The World

**Tile-based, 16×16 tiles, top-down.** Off-screen buffer renders maps once on load, drawn as a single `drawImage()` per frame. Keeps performance solid on low-end mobile.

**Maps:** home flat → neighbourhood → workplace (class-specific: Workshop/Floor/Studio).

**Day/night cycle:** Time advances through action completion. Different NPCs and operative density at different times. More operatives at night.

**World events:** Unannounced. Market Day, Faction Incursion, Job Fair, Signal Surge. Discovered by playing.

**Unlockable areas:** Library (Intelligence 40), black market (Career Rank 3), rooftop (Dexterity 50), Faction building (Career Rank 5). Not announced — discovered through exploring and growing.

---

## Encounter Mini-Games (9 types, 3 per class)

All tap-based, mobile-first, under 90 seconds, DOM overlay on Canvas.

**ARCHITECT:**
- Debug Scan — tap flawed elements before timer
- Build Sequence — drag components into correct logical order
- Overload Mode (high rank) — defend + build simultaneously

**WARLORD:**
- Allocation Board — drag team members to matching task requirements
- Pressure Room — rhythm-based tap to land conversation beats
- Field Command (high rank) — manage three simultaneous situations

**HERALD:**
- Signal Read — build matching message for crowd emotional state
- Negotiation — play offer cards to land deal meter in green zone
- Broadcast (high rank) — route messages to correct channels under pressure

**Encounter flow:** Scenario context → mini-game → outcome in world → Skill Scroll drops.
**Encounters scale with career rank** — same mechanic, higher complexity and speed.

---

## Combat System

Turn-based. 10 seconds per turn. Both sides have HP bars.

**Player action each turn:** Select ability card from current hand → execute → operative responds.

**HP persists between fights.** Losing costs real HP. Running out = Weakened State (stats -20%, encounters harder).

**Operative types:**
- Drifter (low) — basic, common, tutorial enemy
- Distractor (mid) — applies debuffs not HP damage, requires Dexterity to counter
- Anchor (high) — mirrors player's class mechanics, heavy damage, rare
- Named Operative (boss) — one per story arc, multiple phases, major drops

---

## Abilities (12 per class, 3 tiers)

Tier 1: unlocks at game start
Tier 2: requires Career Rank 3 + stat threshold
Tier 3: requires Career Rank 6 + Tier 2 mastery

**Unlock condition:** Relevant Skill Scroll read AND relevant encounter type completed successfully at least once. Cannot use an ability only read about.

**ARCHITECT Tier 1:** Exploit, Patch, Firewall, Scan
**ARCHITECT Tier 2:** Overload, Redundancy, Deep Trace, Patch v2
**ARCHITECT Tier 3:** Root Access, System Override, Architecture, Full Rebuild

**WARLORD Tier 1:** Rally, Suppress, Counter, Assess
**WARLORD Tier 2:** Field Command, Coordinate, Fortify, Suppress v2
**WARLORD Tier 3:** Total Suppression, Rally v2, Warfield, Command Override

**HERALD Tier 1:** Disinform, Amplify, Signal, Deflect
**HERALD Tier 2:** Broadcast, Counter-Narrative, Signal v2, The Mark
**HERALD Tier 3:** The Pitch, Full Broadcast, Information Cascade, Grand Herald's Word

---

## Momentum, HP, and Corrupted State

- Streak → Momentum multiplier (max 2x at day 14)
- Missed day → Momentum decays
- Multiple missed days → HP drops
- HP zero → Corrupted State: XP halved, visual corruption (scanlines, colour shift), operatives more aggressive
- Recovery: complete Directives, win combat, rest at bed

---

## The Behavioural Trace

Every 7 in-game days, SYD delivers a short, cold, accurate pattern readout based on observed in-game behaviour. No player input required — the System watches what the player does and reflects it back. Delivered via System Window in SYD's bracketed voice.

---

## SYD's Voice

All System transmissions follow this format exactly:
- Bracket headers ALL CAPS: `[ DIRECTIVE ISSUED ]`, `[ RANK UPDATED ]`
- No em dashes — full stops instead
- No warmth, no encouragement, no filler
- Clipped sentences

**No B.L.O.C.K. references.** That is from a different project. /loop has the Stagnation Faction and the Narrative Entity only.

---

## Mobile-First Requirements

- Touch input primary: virtual D-pad (bottom-left), action button (bottom-right), System Window button (top-right)
- Keyboard/mouse secondary: WASD/arrows, E/Space, Tab
- Minimum tap target: 44×44px
- Canvas scales responsively via CSS — 320×180 fills viewport while maintaining aspect ratio
- All data loaded once at startup, cached by Service Worker
- AI calls non-blocking — game continues with pre-built content if AI is slow
- First load under 3 seconds on 4G — all assets under 500KB initial load
- Offline playable after first load

---

## AI Integration

Default: Gemini (free key from https://aistudio.google.com/app/apikey)
Alternative: OpenAI, Anthropic

Gemini routing:
- 2.5 Flash: encounter generation, encounter review, directive generation, Behavioural Trace
- 2.5 Flash Lite: class mapping, rank assessment, scroll categorisation

Pre-built content pool covers full game experience without any AI calls. AI is enhancement, not requirement.

When AI unavailable — SYD-voiced modal (never browser alert):
```
[ NEURAL LINK: DISRUPTED ]
[ SWITCHING TO LOCAL DIRECTIVE POOL ]
[ PRECISION REDUCED. EXECUTION CONTINUES. ]
```

---

## Save System

- localStorage: all player state, API keys (immediate, offline)
- Firestore: opt-in cloud sync via 8-character Save Frequency code
- API keys: localStorage ONLY. Never Firestore. Never Git.
- Pull on foreground: check Firestore for newer state on app focus

---

## Colour Palette Reference

| Name | Hex | Use |
|---|---|---|
| System Black | `#0A0B10` | All UI backgrounds |
| Deep Navy | `#0D1B2A` | World sky/exterior |
| Loop Cyan | `#00F2FF` | Primary accent, SYD |
| Execution Gold | `#F4C430` | Achievement, Luck |
| Stagnation Grey | `#4A4D5E` | Locked, degraded |
| Intelligence | `#1A6BFF` | Stat + Architect class |
| Strength | `#E63B2E` | Stat + Herald class |
| Charisma | `#9B5DE5` | Stat + Warlord class |
| Dexterity | `#00A878` | Stat only |

---

## Input System — Mobile First

**No virtual D-pad.** Use tap-to-move with tile pathfinding as the primary mobile input.

- Player taps a destination tile → character pathfinds to it
- Player taps an NPC → character moves to NPC and initiates dialogue
- Player taps an object → character moves to it and interacts
- Player taps the edge of the screen → character moves continuously in that direction
- All encounter and combat interactions are tap-based (tap target, tap ability card, drag component)

Desktop: WASD / Arrow keys for movement, E / Space to interact, Tab for System Window. Mouse click responds to all tap targets.

No input mode switching required — both active simultaneously.

Minimum tap target: 44×44px on all interactive elements.

---

## Git Commits

Claude provides a ready-to-paste git commit with every code change:

```
git add js/world.js
git commit -m "feat: add off-screen buffer map rendering"
```

For new files:
```
git add js/world.js css/style.css
git commit -m "feat: add world renderer and base styles"
```

Claude also states clearly whether each change is a new file or an edit to an existing file, and which file it belongs to.

---

## What to Share When Starting This Chat

Paste this handoff prompt and share the following files from the repo:

**Sprite files** (all confirmed complete):
- `assets/sprites/player.png`
- `assets/sprites/npc-friendly.png`
- `assets/sprites/npc-antagonist.png`
- `assets/sprites/operative-drifter.png`
- `assets/sprites/operative-distractor.png`
- `assets/sprites/operative-anchor.png`
- `assets/sprites/tileset-interior.png`
- `assets/sprites/tileset-exterior.png`
- `assets/sprites/items.png`
- `assets/icons/icons-ui.png`
- `assets/icons/icon-infinity.png`

**Sprite map** (fill in before sharing):
- `data/sprite-map.json` — must have all `0` placeholder values replaced with actual measured pixel dimensions before sharing. Open each PNG in Windows Paint to measure frame sizes.

**Nothing else is needed.** This prompt contains all design context. The sprite map contains all rendering coordinates.

---

## Completion Status — What Is Done

**Branding / assets — COMPLETE**
- All sprite images generated and approved
- App icon (infinity symbol) ready
- Colour palette locked
- Sprite filenames confirmed
- Folder structure created in repo

**Sprite map — PENDING**
- Template exists in `data/sprite-map.json`
- All values currently `0` — measure each PNG in Paint and fill in before the build chat

**Design documents — COMPLETE**
- All nine /loop documents written and in `docs/` folder
- GDD, Stat Bible, GRD, Lore, Series Bible Update, Branding, and three handoff prompts

**Code — NOT STARTED**
- All JS files exist as empty files
- All data JSON files exist as empty files
- Build starts in the game build chat

---

---

## When You Are Ready

Start by asking: **"Should we begin with the world shell and player movement, or the System Window overlay first?"**

Build in this sequence:
1. Canvas setup, game loop, world tile rendering with off-screen buffer
2. Player tap-to-move, tile pathfinding, collision, map transitions
3. System Window overlay with stat display
4. Life Directive system (3 directives per stat)
5. NPC interaction and dialogue
6. Encounter mini-game engine (Debug Scan first — simplest to build and test)
7. Combat engine (basic turn-based loop with Drifter operative)
8. Career track (job application, first Career Directive, first career Encounter)
9. Skill Scroll drop system
10. Ability unlock system (Tier 1 only)
11. Audio (synthesised sounds)
12. Save/load (localStorage)
13. PWA manifest and Service Worker
14. AI integration (Gemini)
15. Firestore sync (opt-in)
