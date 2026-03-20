# /loop — Game Requirements Document (GRD)
**Version:** 1.0
**Status:** Active — source of truth for technical requirements, user stories, and build scope
**Last updated:** March 2026

---

## 1. Philosophy

No frameworks. No bundlers. No unnecessary dependencies. Vanilla JS, HTML, and CSS only. The game runs anywhere a browser runs, installs as a PWA, and works offline with pre-built content.

Simple is not a constraint — it is the design. Every dependency added is a dependency that can break, bloat, or lock the project to a third party's decisions. Simple must also mean working well. If a pattern from a reference project (Systema, SYD /terminal) is fragile or incomplete, it is replaced with something better that still respects the philosophy.

**Mobile first.** The game is designed for touch on a mobile phone first. Desktop is a scale-up. Every UI element, every tap target, every layout decision starts from a 390px wide screen and expands upward.

---

## 2. Developer Environment

- **OS:** Windows 11
- **Editor:** VS Code
- **Terminal:** PowerShell (in VS Code)
- **Indentation:** 4 spaces throughout all files
- **Hosting:** GitHub Pages
- **Version control:** Git via PowerShell
- **Local development:** VS Code Live Server (right-click `index.html` → Open with Live Server). Always serve over `http://localhost` — never open as `file:///`. Service Workers and PWA features require a server context.

---

## 3. Tech Stack

| Layer | Implementation | Notes |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript | No frameworks |
| Game rendering | HTML5 Canvas | Game world, sprites, tiles, combat |
| UI layer | DOM overlay | System Window, dialogue, menus |
| Local storage | localStorage | All player state, API keys, settings |
| Cloud storage | Firebase Firestore | Opt-in sync only |
| AI — default | Gemini 2.5 Flash / Flash Lite | Google AI Studio free key |
| AI — alternative | OpenAI, Anthropic | Player-provided key |
| Offline | Service Worker | Network-first for app shell |
| Install | PWA | iOS, Android, desktop |
| Hosting | GitHub Pages | |
| Build tools | None | |
| Audio | Web Audio API | No .mp3 files — all synthesised |

---

## 4. File Structure

```
/loop/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   └── style.css
├── js/
│   ├── main.js               # Game loop, init, global state
│   ├── world.js              # Map rendering, off-screen buffer, tile system
│   ├── player.js             # Movement, collision, animation, stat sync
│   ├── npc.js                # NPC logic, dialogue trees, memory, quest delivery
│   ├── quests.js             # Quest pool, selection, tracking, completion
│   ├── encounters.js         # Encounter mini-game engine (all types)
│   ├── combat.js             # Turn-based combat engine, HP, ability resolution
│   ├── abilities.js          # Ability definitions, unlock logic, execution
│   ├── scrolls.js            # Skill Scroll library, drop logic, display
│   ├── stats.js              # Stat calculation, decay, delta tracking, display
│   ├── career.js             # Career track, rank ladder, job applications, promotion
│   ├── system-window.js      # System Window overlay — all sections
│   ├── behavioural-trace.js  # Seven-day pattern analysis and delivery
│   ├── ai.js                 # AI integration — routing, prompts, fallback
│   ├── audio.js              # Web Audio API synthesiser
│   └── save.js               # localStorage and Firestore persistence
├── data/
│   ├── quests.json           # Life Directive pool (tiered, all stats)
│   ├── career-quests.json    # Career Directive pool (by class and rank)
│   ├── encounters.json       # Encounter definitions (by class, rank, type)
│   ├── scrolls.json          # Skill Scroll library
│   ├── abilities.json        # All ability definitions (all classes, all tiers)
│   ├── npcs.json             # NPC definitions, dialogue, quest assignments
│   ├── operatives.json       # Faction operative definitions, HP, abilities
│   ├── maps.json             # Map grid definitions, tile types, spawn points
│   └── sprite-map.json       # Sprite frame coordinates — REQUIRED before any sprite renders
├── assets/
│   ├── sprites/
│   │   ├── player.png              # Protagonist — all directions, walk cycle
│   │   ├── npc-friendly.png        # Friendly NPC — all directions, idle only
│   │   ├── npc-antagonist.png      # Antagonist NPC + Named Operative base
│   │   ├── operative-drifter.png   # Drifter enemy — all directions
│   │   ├── operative-distractor.png # Distractor enemy — all directions
│   │   ├── operative-anchor.png    # Anchor enemy — all directions
│   │   ├── tileset-interior.png    # Interior tiles — floor, wall, desk, bed, bookshelf, door, window
│   │   ├── tileset-exterior.png    # Exterior tiles — ground, path, wall, window, stall, lamp, plant
│   │   └── items.png               # Items in a row — scroll, coin, potion, laptop, envelope
│   └── icons/
│       ├── icons-ui.png            # 8 icons in a grid — 5 stats + 3 classes
│       └── icon-infinity.png       # App icon — infinity symbol on System Black
└── docs/
    # Place all nine /loop design documents here for reference
```

### Sprite Map — Required Before Any Sprite Renders

Sprites are stored as separate PNG files, each containing multiple frames at varying dimensions. The game cannot render any sprite without knowing the exact pixel coordinates of each frame. These coordinates are stored in `data/sprite-map.json`.

**Before the build chat begins**, open each PNG in Windows Paint and measure:
- Total image width and height
- Width and height of one individual frame
- How frames are arranged (rows, columns, or single row)

Then fill in `data/sprite-map.json` using this structure as a template. Replace all `0` values with actual measured pixel values:

```json
{
    "player": {
        "src": "assets/sprites/player.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "walk-down":  { "row": 0, "frames": 4, "fps": 8 },
            "walk-up":    { "row": 1, "frames": 4, "fps": 8 },
            "walk-left":  { "row": 2, "frames": 4, "fps": 8 },
            "walk-right": { "row": 3, "frames": 4, "fps": 8 },
            "idle-down":  { "row": 0, "frames": 1, "fps": 1 }
        }
    },
    "npc-friendly": {
        "src": "assets/sprites/npc-friendly.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "idle-down":  { "row": 0, "frames": 1, "fps": 1 },
            "idle-up":    { "row": 1, "frames": 1, "fps": 1 },
            "idle-left":  { "row": 2, "frames": 1, "fps": 1 },
            "idle-right": { "row": 3, "frames": 1, "fps": 1 }
        }
    },
    "npc-antagonist": {
        "src": "assets/sprites/npc-antagonist.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "idle-down":  { "row": 0, "frames": 1, "fps": 1 },
            "idle-up":    { "row": 1, "frames": 1, "fps": 1 },
            "idle-left":  { "row": 2, "frames": 1, "fps": 1 },
            "idle-right": { "row": 3, "frames": 1, "fps": 1 }
        }
    },
    "operative-drifter": {
        "src": "assets/sprites/operative-drifter.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "idle-down":  { "row": 0, "frames": 2, "fps": 2 },
            "idle-up":    { "row": 1, "frames": 2, "fps": 2 },
            "idle-left":  { "row": 2, "frames": 2, "fps": 2 },
            "idle-right": { "row": 3, "frames": 2, "fps": 2 }
        }
    },
    "operative-distractor": {
        "src": "assets/sprites/operative-distractor.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "idle-down":  { "row": 0, "frames": 2, "fps": 2 },
            "idle-up":    { "row": 1, "frames": 2, "fps": 2 },
            "idle-left":  { "row": 2, "frames": 2, "fps": 2 },
            "idle-right": { "row": 3, "frames": 2, "fps": 2 }
        }
    },
    "operative-anchor": {
        "src": "assets/sprites/operative-anchor.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "animations": {
            "idle-down":  { "row": 0, "frames": 2, "fps": 2 },
            "idle-up":    { "row": 1, "frames": 2, "fps": 2 },
            "idle-left":  { "row": 2, "frames": 2, "fps": 2 },
            "idle-right": { "row": 3, "frames": 2, "fps": 2 }
        }
    },
    "tileset-interior": {
        "src": "assets/sprites/tileset-interior.png",
        "tileWidth": 0,
        "tileHeight": 0,
        "tiles": {
            "floor":     { "x": 0, "y": 0 },
            "wall":      { "x": 0, "y": 0 },
            "desk":      { "x": 0, "y": 0 },
            "bed":       { "x": 0, "y": 0 },
            "bookshelf": { "x": 0, "y": 0 },
            "door":      { "x": 0, "y": 0 },
            "window":    { "x": 0, "y": 0 }
        }
    },
    "tileset-exterior": {
        "src": "assets/sprites/tileset-exterior.png",
        "tileWidth": 0,
        "tileHeight": 0,
        "tiles": {
            "ground":   { "x": 0, "y": 0 },
            "path":     { "x": 0, "y": 0 },
            "wall":     { "x": 0, "y": 0 },
            "window":   { "x": 0, "y": 0 },
            "stall":    { "x": 0, "y": 0 },
            "lamp":     { "x": 0, "y": 0 },
            "plant":    { "x": 0, "y": 0 }
        }
    },
    "items": {
        "src": "assets/sprites/items.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "frames": {
            "scroll":   { "x": 0, "y": 0 },
            "coin":     { "x": 0, "y": 0 },
            "potion":   { "x": 0, "y": 0 },
            "laptop":   { "x": 0, "y": 0 },
            "envelope": { "x": 0, "y": 0 }
        }
    },
    "icons-ui": {
        "src": "assets/icons/icons-ui.png",
        "frameWidth": 0,
        "frameHeight": 0,
        "frames": {
            "intelligence": { "x": 0, "y": 0 },
            "strength":     { "x": 0, "y": 0 },
            "charisma":     { "x": 0, "y": 0 },
            "dexterity":    { "x": 0, "y": 0 },
            "luck":         { "x": 0, "y": 0 },
            "architect":    { "x": 0, "y": 0 },
            "warlord":      { "x": 0, "y": 0 },
            "herald":       { "x": 0, "y": 0 }
        }
    }
}
```

**Important:** All `0` values are placeholders. Measure each sprite in Paint before the build chat. Claude in the build chat reads this file directly and uses the values to render sprites — leaving them as zero will cause nothing to render.

---

## 5. Rendering Architecture

### Canvas + DOM Hybrid

The game world renders on an HTML5 Canvas. The System Window, dialogue boxes, encounter mini-games, and all overlay UI render as DOM elements positioned absolutely over the canvas.

**Why:** Canvas handles the pixel art game world with full rendering control. DOM handles text-heavy, interactive UI (stat bars, dialogue, quest lists, encounter mini-games) where HTML/CSS is more efficient and accessible.

### Off-Screen Buffer

Maps pre-render to an off-screen canvas on load. Each frame, the main loop draws the buffer as a single `drawImage()` call. No per-frame tile iteration. This keeps the game smooth on low-end mobile devices and slow networks.

```javascript
// world.js pattern
const bgCanvas = document.createElement('canvas');
const bgCtx = bgCanvas.getContext('2d');

function loadMap(mapID) {
    // Draw all tiles to bgCanvas once
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            drawTile(bgCtx, grid[y][x], x * TILE_SIZE, y * TILE_SIZE);
        }
    }
}

function draw(mainCtx) {
    mainCtx.drawImage(bgCanvas, 0, 0); // Single call per frame
}
```

### Internal Resolution

Canvas internal resolution: 320×180 (16:9). Scaled to fill the viewport via CSS `image-rendering: pixelated`. Clean pixel art at any screen size. No anti-aliasing.

### Responsive Scaling

```css
#gameCanvas {
    image-rendering: pixelated;
    width: 100vw;
    height: 100vh;
    max-width: calc(100vh * 16 / 9);
    max-height: calc(100vw * 9 / 16);
}
```

Desktop scales up cleanly. Mobile fills the screen. The game feels native on both.

---

## 6. Game Loop

```javascript
// main.js
function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);  // Logic: movement, collision, NPC state, combat turns, quest tracking
    render();    // Draw: world buffer, player, NPCs, operatives, UI overlays

    requestAnimationFrame(gameLoop);
}
```

Target: 60 FPS. Delta time (`dt`) passed to all movement and animation calculations. Game speed is frame-rate independent.

---

## 7. Input System

### Mobile (Primary) — Tap-to-Move

No virtual D-pad. Tap-to-move with tile pathfinding is the primary mobile input. This is more natural on touchscreen, removes screen clutter, and is consistent with how successful mobile RPGs handle navigation.

- **Tap a destination tile** — character pathfinds to it
- **Tap an NPC** — character moves to NPC, initiates dialogue automatically
- **Tap an interactive object** — character moves to it, interaction triggers
- **Tap the screen edge** — character moves continuously in that direction while held
- **System Window button** — top-right corner, always accessible, 44×44px minimum
- **All encounter mini-games** — tap targets, drag interactions, fully touch-optimised
- **Combat** — tap ability card to select, tap confirm to execute

Minimum tap target size: 44×44px on all interactive elements.

### Desktop (Scale-up)
- **WASD / Arrow keys** — movement
- **E / Space** — interact / confirm
- **Tab** — System Window toggle
- **Mouse click** — responds to all tap targets identically

No input mode switching. Both input systems active simultaneously. A desktop player can use mouse clicks for all touch interactions or keyboard for movement.

---

## 8. Player State Object

```javascript
const PlayerState = {
    // Identity
    operativeName: string,
    sessionId: string,
    playerClass: "architect" | "warlord" | "herald" | null,

    // Stats (0–100 each)
    stats: {
        intelligence: number,
        strength: number,
        charisma: number,
        dexterity: number
        // luck is computed: average of above four
    },

    // Life Track
    streak: number,
    momentum: number,          // XP multiplier, max 2.0 at day 14
    hp: number,
    maxHP: number,
    xp: number,
    level: number,
    completedDirectives: [string],

    // Career Track
    careerRank: number,        // 0 = unemployed, 1–8 = rank ladder
    currentJob: string | null,
    careerXP: number,
    completedEncounters: [string],

    // Progression
    knownOpponents: [string],  // named failure modes logged
    unlockedAbilities: [string],
    collectedScrolls: [string],
    abilityTiers: {
        architect: number,     // 0, 1, 2, or 3
        warlord: number,
        herald: number
    },

    // World
    worldBoss: {
        name: string,
        hp: number,
        maxHP: number,
        primaryStat: string
    } | null,
    unlockedAreas: [string],
    npcRelationships: { [npcId]: number },  // 0–100 relationship score per NPC

    // AI
    aiProvider: "gemini" | "openai" | "anthropic" | null,
    aiKeyStored: boolean,      // key in localStorage only, never Firestore

    // Behavioural Trace
    lastTraceDate: string,
    executionHistory: [{ date: string, directivesCompleted: number, encountersPassed: number, combatWon: number }],

    // Meta
    lastActiveDate: string,
    createdAt: timestamp,
    offlineMode: boolean,
    corruptedState: boolean
}
```

---

## 9. Map System

```json
{
    "maps": {
        "home": {
            "id": "MAP_HOME_01",
            "name": "The Starting Room",
            "width": 20,
            "height": 12,
            "grid": [[1,1,1...],[1,0,0...]],
            "spawnPoint": { "x": 160, "y": 100 },
            "exits": [
                {
                    "tile": { "x": 8, "y": 11 },
                    "destination": "neighbourhood_01",
                    "spawnPoint": { "x": 160, "y": 20 }
                }
            ],
            "objects": [
                { "type": "bed", "tile": { "x": 2, "y": 2 }, "interaction": "rest_and_save" },
                { "type": "laptop", "tile": { "x": 5, "y": 4 }, "interaction": "career_access" }
            ],
            "npcs": [],
            "operatives": []
        }
    }
}
```

**Tile IDs:**
- `0` — Floor (walkable)
- `1` — Wall (solid)
- `2` — Interactive: desk/laptop
- `3` — Interactive: bed
- `4` — Exit/door
- `5` — Decorative (walkable, no interaction)
- `6` — NPC spawn point
- `7` — Operative spawn point (night only)

---

## 10. Collision System

AABB (Axis-Aligned Bounding Box). Player bounding box is 2px smaller than sprite on each side — natural movement near walls and objects. Horizontal and vertical collision checked separately — player slides along walls rather than stopping dead.

```javascript
// player.js pattern
applyMovement() {
    if (!checkCollision(this.x + this.vx, this.y)) {
        this.x += this.vx;
    }
    if (!checkCollision(this.x, this.y + this.vy)) {
        this.y += this.vy;
    }
}
```

---

## 11. Combat Engine

Turn-based. Each turn: player selects ability card → executes → operative responds → repeat.

```javascript
// combat.js structure
const CombatState = {
    active: boolean,
    playerHP: number,
    enemyHP: number,
    enemyMaxHP: number,
    enemyType: string,
    playerHand: [abilityId],     // current available abilities (3–4 per turn)
    enemyHand: [abilityId],      // enemy abilities for this combat
    turnNumber: number,
    turnTimer: number,           // 10 seconds per turn
    statusEffects: {
        player: [effect],
        enemy: [effect]
    },
    combatLog: [string]          // for post-combat Skill Scroll delivery
}
```

Turn timer is 10 seconds. If player does not select an ability before timer expires, the turn passes — the operative acts without player response. This maintains mobile-appropriate pacing and creates genuine pressure.

---

## 12. Encounter Engine

All encounter mini-games run as DOM overlays over the Canvas. Each encounter type has its own renderer within `encounters.js`.

```javascript
// encounters.js structure
const EncounterTypes = {
    DEBUG_SCAN: "debug_scan",           // Architect
    BUILD_SEQUENCE: "build_sequence",   // Architect
    OVERLOAD_MODE: "overload_mode",     // Architect (high rank)
    ALLOCATION_BOARD: "allocation_board", // Warlord
    PRESSURE_ROOM: "pressure_room",     // Warlord
    FIELD_COMMAND: "field_command",     // Warlord (high rank)
    SIGNAL_READ: "signal_read",         // Herald
    NEGOTIATION: "negotiation",         // Herald
    BROADCAST: "broadcast"              // Herald (high rank)
}
```

Each encounter:
1. Receives context (class, rank, stat levels, scenario text)
2. Renders its mini-game UI
3. Runs its internal timer (max 90 seconds)
4. Returns a result object: `{ passed: boolean, score: number, statDelta: string }`
5. Triggers Skill Scroll drop based on result

---

## 13. AI Integration

### Provider Selection

```javascript
const AI_CONFIG = {
    gemini: {
        isDefault: true,
        hasFreeOption: true,
        setupLink: "https://aistudio.google.com/app/apikey",
        models: {
            reasoning: "gemini-2.5-flash",
            classification: "gemini-2.5-flash-lite"
        }
    },
    openai: {
        isDefault: false,
        hasFreeOption: false
    },
    anthropic: {
        isDefault: false,
        hasFreeOption: false
    }
}
```

**Important:** Always verify exact model strings against live provider documentation before building. Do not use model names from memory.

### Call Routing

**Reasoning calls (Gemini 2.5 Flash):**
- Personalised Career Directive generation (based on class and rank)
- Custom Encounter scenario generation (based on player's real situation)
- Behavioural Trace generation (pattern analysis from execution history)
- World Boss generation (translating a real goal into a threat profile)

**Classification calls (Gemini 2.5 Flash Lite):**
- Career class mapping (classifying player's real job into Architect/Warlord/Herald)
- Rank assessment (estimating current career rank from player input)
- Skill Scroll categorisation (tagging a generated Scroll to correct stat)

### Offline Fallback

Without an AI key, or when rate limits are hit, the game runs entirely on pre-built content. Pre-built pools must be large enough for a complete full-game experience:
- Minimum 50 Life Directives per stat per tier
- Minimum 30 Career Directives per class per rank level
- Minimum 20 Encounters per class
- Minimum 100 Skill Scrolls across all stats

When AI is unavailable, a SYD-voiced modal appears (never a browser alert):
```
[ NEURAL LINK: DISRUPTED ]
[ EXTERNAL COGNITIVE PROCESSOR: UNREACHABLE ]
[ SWITCHING TO LOCAL DIRECTIVE POOL ]
[ PRECISION REDUCED. EXECUTION CONTINUES. ]
```

---

## 14. Save System

### Local (Always Active)
localStorage stores all player state. Immediate writes. Works offline. API keys stored here only — never transmitted.

### Cloud (Opt-in)
Firebase Firestore. Player generates an 8-character Save Frequency code. Syncing is a deliberate choice, not automatic.

**Pull on foreground:** When the app returns to focus, it checks Firestore for a newer state and reloads silently if one exists.

**Manual pull:** Settings → Sync → Force Pull. Recommended on iOS PWA.

**What is never synced:** API keys. These are localStorage only, permanently.

---

## 15. Audio System

Web Audio API only. No audio files. All sounds synthesised at runtime via oscillators. Audio context initialised on first user interaction to comply with browser autoplay policies.

```javascript
// audio.js sound catalogue
const SOUNDS = {
    directiveComplete: () => playArpeggio([523, 659], 'square', 0.2),
    rankUp: () => playArpeggio([523, 659, 784, 1047], 'sawtooth', 0.4),
    encounterPass: () => playTone(783, 'sine', 0.3, 0.1),
    encounterFail: () => playTone(220, 'sawtooth', 0.4, 0.1),
    scrollDrop: () => playArpeggio([880, 1047, 1319], 'triangle', 0.3),
    combatHit: () => playTone(150, 'square', 0.1, 0.15),
    combatVictory: () => playArpeggio([523, 659, 784, 1047, 1319], 'sawtooth', 0.5),
    npcInteract: () => playTone(659, 'square', 0.15, 0.08),
    mapTransition: () => playSweep(200, 800, 0.3),
    corruptedWarning: () => playTone(110, 'sawtooth', 0.6, 0.12),
    systemWindowOpen: () => playTone(1047, 'square', 0.08, 0.05)
}
```

---

## 16. PWA Configuration

```json
{
    "name": "/loop",
    "short_name": "loop",
    "description": "A life and career RPG. The system is real.",
    "start_url": "/loop/",
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#0A0B10",
    "theme_color": "#0A0B10",
    "icons": [
        { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

**Service Worker strategy:**
- HTML, CSS, JS → network-first (always try network, cache as fallback)
- Images, JSON data → cache-first (serve fast, update on cache version bump)
- Cache version constant bumped on every deploy

---

## 17. Performance Requirements

Given mobile-first design and 4G/slow network target:

- **First load under 3 seconds on 4G** — all assets combined under 500KB initial load
- **60 FPS on mid-range mobile** — off-screen buffer ensures this for the game world
- **Offline playable after first load** — Service Worker caches all required assets
- **Touch targets minimum 44×44px** — all interactive elements
- **Single spritesheet** — no multiple image loads. One sprites.png, one ui-icons.png.
- **JSON data loaded once** — all data files loaded at startup, stored in memory. No repeated fetches.
- **AI calls are non-blocking** — the game does not wait for AI responses. Loading states are shown. The game continues with pre-built content if AI is slow.

---

## 18. User Stories

### Onboarding

**US-001** — As a new player, I can enter my operative name so the game feels personal from the start.

**US-002** — As a new player, I can select my career class (Architect, Warlord, Herald) so the game reflects my real-world work.

**US-003** — As a new player, I can specify my current career rank so my character starts at the right level.

**US-004** — As a new player, I can connect a Gemini API key so I receive personalised directives and encounters, or skip this and use pre-built content.

**US-005** — As a new player, I can start playing immediately after naming myself and selecting a class, with no lengthy tutorial blocking me.

---

### Life Track

**US-010** — As a player, I can receive daily Life Directives mapped to my five stats so I have something concrete to do each day.

**US-011** — As a player, I can complete a Life Directive and see my relevant stat bar rise with a satisfying animation so progress feels immediate.

**US-012** — As a player, I can see my current streak and Momentum multiplier so I am aware of the compounding effect of consistency.

**US-013** — As a player, I can see my HP bar drop when I miss days so I understand the cost of inaction.

**US-014** — As a player, I experience Corrupted State (visual corruption, halved XP) when HP reaches zero so there are real consequences for extended inaction.

**US-015** — As a player, I can recover from Corrupted State by completing Directives and winning combat so the game never permanently punishes me.

---

### Career Track

**US-020** — As a player, I can visit the Job Board NPC and apply for in-game jobs matching my class so career progression starts immediately.

**US-021** — As a player, I experience a job interview as a career Encounter mini-game so getting a job feels earned, not automatic.

**US-022** — As a player, once employed I can receive Career Directives at my workplace so career progression has daily actions just like the Life Track.

**US-023** — As a player, I can see my career rank and progress toward the next rank so I always know where I am and what I am working toward.

**US-024** — As a player, I experience promotion as a meaningful game event (environment changes, new NPC dialogue, new encounters unlock) so advancement feels rewarding.

**US-025** — As a player, I can designate a World Boss (a named career or life obstacle) so the System gives me a concrete HP-bar representation of my biggest challenge.

---

### Exploration

**US-030** — As a player, I can walk around the neighbourhood and discover NPCs and locations so the world feels alive and worth exploring.

**US-031** — As a player, I notice locked areas and buildings I cannot enter yet so I have visible goals tied to my stat and rank progression.

**US-032** — As a player, I discover that locked areas open when my stats reach thresholds so growth has tangible world rewards, not just number increases.

**US-033** — As a player, I occasionally encounter world events (Market Day, Faction Incursion, Job Fair) that were not announced so the world feels dynamic and worth checking daily.

**US-034** — As a player, I experience the world looking and feeling different at night so the day/night cycle adds variety and strategic choice.

---

### Combat

**US-040** — As a player, I can see Faction operatives in the world and choose to engage or avoid so combat is always my decision except at story-forced points.

**US-041** — As a player, I engage in turn-based combat with a visible HP bar for both sides so fights feel real and consequential.

**US-042** — As a player, I select ability cards from my unlocked ability hand each turn so combat is strategic, not random.

**US-043** — As a player, I see the enemy's HP drop with each successful ability so feedback is immediate and satisfying.

**US-044** — As a player, losing a fight costs me HP that persists after combat so I cannot fight carelessly.

**US-045** — As a player, I receive gold and sometimes a Skill Scroll after winning combat so winning feels rewarding beyond just clearing the threat.

**US-046** — As a player, I face Named Operative boss enemies at story arc points so the game has dramatic high-stakes combat moments.

---

### Abilities and Skill Scrolls

**US-050** — As a player, I receive Skill Scrolls after encounters and combat so learning is delivered through play, not through a tutorial screen.

**US-051** — As a player, I unlock abilities by reading the relevant Skill Scroll AND completing the relevant encounter type successfully so abilities are earned through demonstrated understanding.

**US-052** — As a player, I can view all my unlocked abilities in the System Window and understand what each one does so I can make informed decisions in combat.

**US-053** — As a player, I experience my abilities becoming more powerful as I reach higher ability tiers so the power fantasy compounds over time.

**US-054** — As a player, I can purchase Skill Scrolls from the Bookshelf using gold so I can choose to learn something early at a cost.

---

### System Window

**US-060** — As a player, I can open the System Window at any time and see all five stat bars with current values so I always know my current state.

**US-061** — As a player, I can see my full Skill Scroll library in the System Window so I can review what I have learned at any time.

**US-062** — As a player, I can see my Known Opponents (named failure modes) so I can recognise them when they appear in encounters.

**US-063** — As a player, I receive a Behavioural Trace every seven in-game days so the System reflects my patterns back to me accurately.

**US-064** — As a player, I can see my World Boss HP bar in the System Window so my biggest obstacle always has visible, attackable dimensions.

---

### NPC Interaction

**US-070** — As a player, I can talk to NPCs in the world and receive different dialogue based on my current stats and rank so the world feels responsive to who I am.

**US-071** — As a player, I receive quests from NPCs that lead to encounters and Skill Scroll drops so NPC interaction is worth engaging with, not just cosmetic.

**US-072** — As a player, I notice that NPCs I have completed quests for remember this and speak differently to me so my history in the world has lasting effects.

**US-073** — As a player, I find that certain NPCs only become accessible above certain Charisma thresholds so social growth has tangible world rewards.

---

### Progression and Power Fantasy

**US-080** — As a player, I see my character sprite update at key rank thresholds so visual progression is part of the reward.

**US-081** — As a player, I notice Faction operatives scale in difficulty as my rank rises so the challenge always matches my capability.

**US-082** — As a player, I experience becoming visibly, obviously powerful at high ranks so the Solo Leveling growth arc is felt, not just numbered.

**US-083** — As a player, I discover things in the world at high rank that were invisible or inaccessible at low rank so the game rewards deep play.

---

### AI and Personalisation

**US-090** — As a player with a connected AI key, I receive Career Directives specific to my real-world role and rank so the game feels like it knows me.

**US-091** — As a player with a connected AI key, I can describe a real situation and have it converted into a game encounter so my real life enters the game world.

**US-092** — As a player without a connected AI key, I still have a complete and enjoyable game experience using the pre-built content pool so the AI key is an enhancement, not a requirement.

---

### Save and Persistence

**US-100** — As a player, my progress is saved automatically to localStorage so I never lose progress due to closing the browser.

**US-101** — As a player, I can opt into cloud sync by generating a Save Frequency code so I can continue on different devices.

**US-102** — As a player, I can install /loop as a PWA on my phone's home screen so it feels like a native game.

**US-103** — As a player on a slow network, the game loads once and then works fully offline so network quality does not interrupt my play.

---

## 19. GitHub Setup

- New GitHub organisation created at project start, named to match the /loop brand
- Repository named `loop` under the organisation
- GitHub Pages enabled from the `main` branch root
- `.gitignore` excludes all files containing API keys
- API keys are never committed. They live in localStorage only, permanently.
- No CI/CD pipeline — manual deploy via `git push`

---

## 20. Known Constraints

- **Resolution:** Native 320×180. Scaled via `image-rendering: pixelated`. No smoothing.
- **Touch input:** Virtual D-pad primary on mobile. Keyboard secondary on desktop.
- **AI keys:** localStorage only. Never Firestore. Never Git. Never transmitted.
- **Rate limits:** Gemini free tier limits apply. Pre-built content pool must cover the full game without any AI calls.
- **iOS PWA:** Manual sync recommended — background sync unreliable on iOS.
- **Audio:** Web Audio API requires user interaction before initialising. First keydown or touchstart triggers init.
- **No B.L.O.C.K. references** — that lore belongs to Path, not /loop. /loop has the Stagnation Faction and the Narrative Entity only.
