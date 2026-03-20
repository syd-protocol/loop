# /loop — Handoff Prompt: Branding
**Version:** 2.0
**Paste everything below this line into a new chat to begin branding work.**

---

You are helping me build the complete visual identity and pixel art assets for **/loop** — a top-down pixel art life and career RPG. Branding is the first phase of work — it informs the game build, the pixel art, the sprites, and all marketing surfaces.

---

## What /loop Is

/loop is a life and career RPG. The player inhabits a game world — their flat, a neighbourhood, a workplace — and progresses through two systems: a Life Track (daily habits feeding five universal stats) and a Career Track (starting unemployed, rising to the top rank of their chosen class through encounters, directives, and combat). The world contains Faction operatives — enemies the player fights in turn-based combat.

Three classes: **Architect** (technical), **Warlord** (command), **Herald** (influence).

The game is the evolved form of SYD /terminal — part of the /terminal → /signal → /loop product family.

---

## The Name and Core Concept

**/loop** — always lowercase, always with the slash.
Full name: **The Loop**.

**The double O as infinity (∞).** The two Os in /loop form an infinity symbol when viewed as a continuous shape. Life as a loop that compounds. A system that keeps running. This is the brand's primary visual hook — it must be present in the logo.

**Brand statement:** *Build your stats. Build your career. Build your life.*
**One-line:** *A life and career RPG. The system is real.*

---

## Fixed Colours — Do Not Change These

These are locked across every context — game, marketing, social, brand.

| Name | Hex | Use |
|---|---|---|
| System Black | `#0A0B10` | All UI, System Window, HUD |
| Deep Navy | `#0D1B2A` | Game world sky, exterior backgrounds |
| Loop Cyan | `#00F2FF` | SYD's colour, primary accent, infinity symbol |
| Execution Gold | `#F4C430` | Achievement, Luck stat, rank events |
| Stagnation Grey | `#4A4D5E` | Locked content, Corrupted State, the Faction |

**Stat colours (fixed, carry through all contexts):**

| Stat | Hex |
|---|---|
| Intelligence | `#1A6BFF` |
| Strength | `#E63B2E` |
| Charisma | `#9B5DE5` |
| Dexterity | `#00A878` |
| Luck | `#F4C430` |

**Class colours:**
Architect = `#1A6BFF`, Warlord = `#9B5DE5`, Herald = `#E63B2E`

**What you design:** Everything else — interior world palette, gradient treatments, UI state colours, background variations. The fixed colours above are anchors. Build around them.

**Important note on System Black vs the game world:**
System Black (`#0A0B10`) is SYD's layer — the terminal, the UI overlays, the System Window. The game world uses Deep Navy (`#0D1B2A`) for exteriors and warmer darks for interiors. The visual contrast between System Black UI and the game world is intentional — the System is a separate layer running on top of reality.

---

## Typography

Design from scratch. No Inter, no Roboto, no Arial, no Space Grotesk. Choose from Google Fonts.

**Display typeface:** For logo, System Window labels, rank displays, combat text, headers.
Requirements: 8-bit adjacent, legible at small sizes, renders the OO in /loop in a way that could evoke an infinity shape. Test Press Start 2P, Silkscreen, VT323.

**Body typeface:** For NPC dialogue, Skill Scrolls, marketing copy.
Requirements: Readable at 14px on mobile, pairs with display font, monospace or mono-adjacent. Test Courier Prime, Source Code Pro.

**Usage rules:**
- System Window labels: UPPERCASE, display typeface
- NPC dialogue: Sentence case, body typeface
- Marketing copy: Body typeface, sentence case, line height 1.6
- Combat text: UPPERCASE, display typeface, short and punchy

---

## Logo Deliverables

**Primary wordmark:**
The word /loop in the display typeface. The double O must reference the infinity symbol — through a connecting stroke, a continuous glow path, overlapping Os with a connector, or another approach that works visually. The slash is always part of the logo.

**Symbol mark:**
A standalone pixel-art infinity symbol (∞) in Loop Cyan on System Black. Blocky, 8-bit, subtle glow. Used as app icon, favicon, and standalone brand mark.

**Versions needed:**
- Primary: wordmark on System Black
- Secondary: wordmark on Deep Navy
- Reversed: wordmark on white/light (for LinkedIn)
- Symbol only: multiple sizes (512px, 192px, 64px, 32px)

---

## Pixel Art — Game Assets

The branding phase produces all sprite assets before the game is built. Everything below is required.

### Technical Specs
- Tile size: 16×16 pixels
- Character sprites: 16×48 pixels (in-world), 64×64 or 128×128 (dialogue portraits)
- Canvas resolution: 320×180
- Scaling: `image-rendering: pixelated` — never anti-aliased
- Deliver as single organised spritesheets

### Protagonist Sprites

Warm medium-dark skin tone — not a specific real-world reference, readable at 16×48. Design the character to read clearly at tiny scale.

For each class (Architect, Warlord, Herald), produce sprites at these rank stages:
- Rank 0 (Unemployed): plain, unremarkable
- Rank 2 (Junior): slight improvement, cleaner
- Rank 4 (Senior): class visual identity beginning
- Rank 6 (Principal/Lead): distinct class aesthetic
- Rank 8 (Top): definitive visual — recognisable as highest tier

Each rank stage needs: 4 directions × 4-frame walk cycle + 1 idle frame = 17 frames per direction set.

**Class visual languages:**
- Architect: technical aesthetic, clean lines, tool indicators, subtle cyan glow at high rank
- Warlord: command aesthetic, structured, posture shifts in idle animation at high rank
- Herald: expressive aesthetic, speech bubble aura at high rank

### NPC Sprites (16×48, 4-direction, idle frame)

- Mentor NPC (×3, one per class) — distinct appearance per class
- Colleague NPC — office environment feel
- Recruiter NPC — professional, slightly formal
- Neighbourhood NPC (×4 variants) — varied, everyday
- Merchant NPC — distinctive, market feel
- Antagonist NPC — visually unsettling, not overtly threatening

### Faction Operative Sprites (16×48, 4-direction, combat idle)

- Drifter — common enemy, aimless feel in design
- Distractor — mid-level, slightly more intentional
- Anchor — high-level, mirrors player's class, more armoured/structured
- Named Operative — distinct silhouette, boss energy, one design

### Environment Tiles (16×16)

**Interior set (warm darks — `#1A1410` floor, `#2A1F1A` walls):**
Floor, wall, desk/laptop, bed, door, bookshelf, noticeboard, office chair, meeting table, window

**Exterior set (cool — Deep Navy sky, `#1A2535` concrete):**
Sidewalk, road, building wall, building window, market stall, street light, tree/plant

**Deliver tilesets as single tileset sheets with clear grid alignment.**

### Object Sprites (16×16 or 32×32)

Laptop (interactive), Skill Scroll item (drop animation: falling + landing), gold coin, HP recovery item, job offer document, World Boss marker, locked door indicator

### UI Icon Sheet (ui-icons.png)

- Stat icons (one per stat, colour-matched to stat colour)
- Quest status icons (active, complete, failed, locked)
- Class icons (Architect, Warlord, Herald)
- Rank insignia (one per rank, per class — 8 per class, 24 total)
- Ability icons (one per ability — 36 total)
- System Window section icons

---

## System Window UI Design

Design a full mockup of the System Window overlay.

Requirements:
- System Black background, Loop Cyan borders
- Angular corner cuts (clip-path polygon — angular, not rounded)
- Five stat bars with stat colours, numeric values (0–100), animated fill indication
- Career rank label (e.g. COORDINATOR — WARLORD) and progress to next rank
- Active quests section
- Skill Scroll library section (shows collected count, browsable)
- Known Opponents section
- Abilities section (by tier, unlock status visible)
- Behavioural Trace section (last readout preview)
- World Boss HP bar

Deliver as a full mockup with all sections populated with example data.

---

## Instagram Templates

Four content type templates. All use System Black background, Loop Cyan and Gold accents.

**1. Chapter carousel slide:**
System aesthetic. Chapter number + title on Slide 1. Text slides: body typeface, high contrast. Final slide: CTA — *the system the MC uses is real.*

**2. Skill Scroll drop:**
Single image. Scroll item pixel art prominent. Insight in body typeface. Stat tag colour-coded. Dark background, item glow.

**3. Stat explainer:**
One stat. Stat colour as accent. Stat bar visual. One real-life application. Clean, readable on mobile.

**4. World preview:**
Pixel art environment glimpse. Minimal text. The world speaks.

---

## LinkedIn Templates

**Banner (1584×396px):**
Pixel world glimpse left side. Wordmark centred. Brand statement right side. Deep Navy base.

**Profile image:**
Symbol mark on System Black. 400×400px.

**Three post templates:**
1. Career insight (Skill Scroll reformatted for professional context)
2. Stat-career mapping (how one stat affects real career progression)
3. Chapter excerpt (career-relevant section, professional framing)

---

## Branding Voice

Not SYD's System voice. What /loop says to the world.

Direct. No filler. Confident without being loud. The game is the lead — the learning is what happens when you play it.

**Good:** *You start unemployed. The world is small. Your stats are low. That's the starting coordinate. Everything after that is execution.*

**Bad:** *Unlock your potential with gamified learning! Build the skills you need to succeed in today's competitive job market!*

---

## Deliverables — Priority Order

1. Logo (wordmark + symbol mark, all versions)
2. Colour palette (complete, including design decisions around fixed colours)
3. Typography selection (display + body, with usage examples)
4. Protagonist sprites (all three classes, key rank stages)
5. System Window mockup (full, with example data)
6. NPC and operative sprites
7. Environment tilesets
8. Object and UI icon sheets
9. Instagram template set (4 types)
10. LinkedIn template set (banner + profile + 3 post types)

---

## Image Generation Prompts

**Nine assets to generate.** Each prompt produces a sprite that is usable immediately as the default — no post-processing or colour swapping required. Class and rank variants come later when resources allow.

**Tool:** Leonardo.ai with a pixel art LoRA model. Search "pixel art" in model options and select one. Free tier gives enough generations for this set if you are selective.

**Negative prompt to use on every generation:**
```
anti-aliasing, smooth, blurry, 3D, realistic, gradient, photographic,
rounded edges, soft shading, painterly, watercolour
```

**Tip:** Generate 3–4 variations of each asset and pick the best one. Do not use the first result automatically.

---

### 1. Protagonist — Base Sprite

```
Pixel art RPG character sprite sheet, top-down view, 16x48 pixels per frame,
warm medium-dark skin tone, dark casual jacket with cyan accent #00F2FF on collar
and cuffs, dark trousers, plain shoes, 4 directional walking animations
(down, up, left, right), 4 frames per direction plus 1 idle frame per direction,
all frames arranged as a sprite sheet, transparent background,
no anti-aliasing, crisp hard pixel edges, early SNES Zelda style,
32-colour palette maximum
```

The cyan accent ties the protagonist visually to the SYD system from the start. This works as the default for all three classes until class-specific variants are made later.

---

### 2. NPC Base — Friendly Characters

```
Pixel art NPC character sprite, top-down view, 16x48 pixels,
adult figure, calm professional appearance, upright posture,
dark outfit with gold accent #F4C430 on collar or trim,
4-direction facing sprites, 1 idle frame per direction, no walk cycle,
transparent background, no anti-aliasing, crisp hard pixel edges, SNES RPG style
```

The gold accent visually distinguishes friendly NPCs from the player and from enemies. One sprite, used for Mentor, Colleague, Recruiter, and Neighbourhood NPCs — differentiated by name tags in dialogue, not by sprite.

---

### 3. Antagonist NPC

```
Pixel art NPC character sprite, top-down view, 16x48 pixels,
adult figure, slightly unsettling appearance, arms loosely away from body,
posture subtly off, muted dark outfit, no warm accents,
stagnation grey tones #4A4D5E dominant throughout,
4-direction facing sprites, 1 idle frame per direction,
transparent background, no anti-aliasing, crisp hard pixel edges, SNES RPG style
```

---

### 4. Faction Operative — Drifter

```
Pixel art enemy character sprite, top-down view, 16x48 pixels,
aimless unfocused posture, slightly hunched, worn dark clothes,
stagnation grey #4A4D5E dominant, no bright accents, listless hostile energy,
4-direction facing sprites, 2-frame idle animation per direction,
transparent background, no anti-aliasing, crisp hard pixel edges, SNES RPG style
```

---

### 5. Faction Operative — Distractor

```
Pixel art enemy character sprite, top-down view, 16x48 pixels,
deliberately unremarkable appearance, mid-level threat energy,
more intentional posture than Drifter, dark grey outfit with subtle red tint,
muted red #8B2020 visible in outfit details,
4-direction facing sprites, 2-frame idle animation per direction,
transparent background, no anti-aliasing, crisp hard pixel edges, SNES RPG style
```

---

### 6. Faction Operative — Anchor

```
Pixel art enemy character sprite, top-down view, 16x48 pixels,
heavy structured reinforced appearance, imposing broader silhouette,
dark armoured outfit, red warning accent #E63B2E clearly visible on chest or shoulders,
4-direction facing sprites, 2-frame idle animation per direction,
transparent background, no anti-aliasing, crisp hard pixel edges, SNES RPG style
```

---

### 7. Interior Environment Tileset

```
Pixel art interior tileset, 16x16 pixels per tile, top-down RPG view,
warm dark interior palette, floor colour #1A1410, wall colour #2A1F1A,
cyan highlight #00F2FF on interactive objects like desk and laptop,
include all on one sheet with clear 16x16 grid alignment:
plain floor tile, plain wall tile, wall corner tile,
desk with glowing laptop screen, single bed with dark sheets,
bookshelf with visible books, closed door, window with faint light,
no anti-aliasing, crisp hard pixel edges, SNES Zelda interior style
```

---

### 8. Exterior Environment Tileset

```
Pixel art exterior tileset, 16x16 pixels per tile, top-down RPG view,
cool dark exterior palette, deep navy #0D1B2A for open ground,
concrete path colour #1A2535, cyan streetlight glow #00F2FF,
include all on one sheet with clear 16x16 grid alignment:
open ground tile, concrete path tile, building wall tile,
building window tile with faint interior light, market stall with awning,
street light with cyan glow radius, small plant or shrub tile,
no anti-aliasing, crisp hard pixel edges, SNES Zelda exterior style
```

---

### 9. Item Sprite Sheet

```
Pixel art item sprites, 16x16 pixels each, all on one sheet in a single row,
top-down RPG view, transparent background:
rolled scroll with cyan glow accent #00F2FF,
gold coin #F4C430 with shine pixel,
small red health vial or potion,
glowing laptop or screen icon with cyan #00F2FF screen,
folded document or envelope,
no anti-aliasing, crisp hard pixel edges, RPG item style, SNES era
```

---

### Portrait Versions (optional, for dialogue boxes)

If you have generations to spare, add this to any character prompt:
```
...also produce a portrait version at 64x64 pixels,
character facing slightly toward viewer, same colour scheme and style,
transparent background
```

If not, the game uses the small in-world sprite scaled up in the dialogue box — it looks pixelated but fits the aesthetic.

---

## When You Are Ready

Ask: **"Should we start with the logo and wordmark, or establish the colour palette and typography first?"**

Palette first, then sprites. Lock the colours before generating anything.
