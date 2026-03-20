# /loop — Branding Document
**Version:** 2.0
**Status:** Active — source of truth for all visual and brand identity
**Last updated:** March 2026

---

## 1. The Name

**/loop**

Full name: **The Loop** — long-form contexts, marketing copy, introductions.
Short name: **/loop** — all digital contexts, consistent with /terminal and /signal.
Stylised: always lowercase, always with the slash. Never "Loop" or "LOOP" without the slash.

---

## 2. The Core Identity Concept

**The double O as infinity.**

The two Os in /loop form an infinity symbol (∞) when viewed as a continuous shape. This is inherent in the word — not forced onto it. Life as a loop that compounds. A system that keeps running. The infinity of possible outcomes from consistent execution.

This symbol is the brand's single most distinctive visual asset. Everything in the identity flows from it.

**The brand statement:**
*Build your stats. Build your career. Build your life.*

**The one-line description:**
*A life and career RPG. The system is real.*

---

## 3. Colour Palette

/loop is a pixel RPG world. The palette needs range, warmth, and expressiveness — not just a single accent on black. The SYD /terminal cyan-on-black is the starting reference but this world is richer than a terminal.

### Fixed Colours — Non-Negotiable

These colours are fixed across all contexts — game, marketing, social, brand.

**Deep Navy** — `#0D1B2A`
The world's sky. The outdoor background of the neighbourhood and the city. Cooler and more spatial than black — the world feels like it has air in it.

**System Black** — `#0A0B10`
SYD's layer. The System Window, the HUD, all UI overlays. This is the terminal — the same dark from /terminal. The visual contrast between System Black UI and the Deep Navy world reinforces that the System is a layer running on top of reality, not part of it.

**Loop Cyan** — `#00F2FF`
The System's colour. Primary accent. SYD's signature, inherited from /terminal. Stat bars, System transmissions, the infinity symbol, primary interactive elements.

**Execution Gold** — `#F4C430`
Rank, achievement, Luck stat, the highest moments. Used sparingly — it marks achievement, not decoration. When Gold appears, something significant happened.

**Stagnation Grey** — `#4A4D5E`
Inaction, locked content, Corrupted State UI, the Faction's visual language. The colour of everything that has not been built yet.

### Stat Colours — Fixed

These carry through every context — game UI, marketing posts, stat explainers, everything. Consistency is recognition.

| Stat | Colour | Hex |
|---|---|---|
| Intelligence | Blue | `#1A6BFF` |
| Strength | Red | `#E63B2E` |
| Charisma | Purple | `#9B5DE5` |
| Dexterity | Green | `#00A878` |
| Luck | Gold | `#F4C430` |

### Class Colours — Fixed

| Class | Colour | Hex |
|---|---|---|
| Architect | Blue | `#1A6BFF` |
| Warlord | Purple | `#9B5DE5` |
| Herald | Red | `#E63B2E` |

### World Palette — Design Decision

The interior environment palette (flat, workplace) uses warmer darks — deep browns and taupes that feel lived-in. `#1A1410` for interior floors. `#2A1F1A` for interior walls.

The exterior palette uses the Deep Navy sky with cooler mid-tones for sidewalks, roads, and building exteriors — `#1A2535` for concrete surfaces, `#0F1C2E` for shadowed exterior walls.

These are starting points. The pixel art design phase refines the exact palette. The rule: the world feels warm inside, cooler outside. The System Window feels like a different visual layer entirely.

---

## 4. Typography

Two typefaces. Display and body. Both must work on mobile at small sizes. Both must render well in pixel contexts and in clean marketing contexts.

### Display Typeface — For headers, logo, System Window labels, rank displays
Must feel 8-bit adjacent without being illegible. Options to evaluate:
- **Press Start 2P** — authentic pixel font, high recognition, works for game UI
- **Silkscreen** — cleaner pixel bitmap, slightly more readable at small sizes
- **VT323** — softer pixel feel, strong for terminal-style text

Selection criterion: the chosen font must render the wordmark **/loop** in a way where the OO reads as a potential infinity shape. Test this before committing.

### Body Typeface — For dialogue, Skill Scrolls, marketing copy
Must be readable at 14px on a mobile screen. Pairs with the display font without competing.
- **Courier Prime** — readable, slightly warm, terminal-adjacent
- **Source Code Pro** — clean, technical, slightly cooler

### Usage Rules
- System Window labels: UPPERCASE, display typeface
- NPC dialogue: Sentence case, body typeface
- Skill Scroll text: Sentence case, body typeface, slightly smaller
- Marketing copy: Body typeface, sentence case, generous line height (1.6)
- Combat text: UPPERCASE, display typeface, short
- Never mix more than two typefaces in any single context

---

## 5. Logo

### Primary Wordmark
The word **/loop** set in the display typeface. The double O treated to evoke or connect to the infinity symbol. Approaches to explore in the design phase:
- A connecting stroke between the two Os forming a continuous loop path
- A subtle underline that forms the infinity curve
- The Os slightly overlapping with a thin connector
- The Os given a glow treatment that reads as continuous light

The slash is part of the logo always. Never separate.

### Symbol Mark
A standalone pixel-art infinity symbol (∞) rendered in Loop Cyan (`#00F2FF`) on System Black (`#0A0B10`). Blocky, 8-bit, with a subtle cyan glow consistent with the SYD aesthetic. This is the app icon, favicon, and standalone brand mark.

### Versions Required
- Primary: wordmark on System Black (dark background)
- Secondary: wordmark on Deep Navy (world background)
- Reversed: wordmark on white or light (for LinkedIn header, press contexts)
- Symbol only: the infinity mark, multiple sizes

### Rules
- Minimum reproduction size: logo remains legible — test at 32px height
- Never reproduce the OO separated from the slash
- Never use a smooth vector infinity symbol — must be pixel-rendered

---

## 6. Pixel Art Style Guide

This section covers the game's visual world. The branding phase produces all sprite assets before the build phase begins.

### Technical Specifications
- Tile size: 16×16 pixels
- Character sprites: 16×48 pixels (walking), 64×64 or 128×128 (portrait view in dialogue)
- Internal canvas resolution: 320×180
- Scaling: CSS `image-rendering: pixelated` — never anti-aliased or smoothed
- Colour depth: 32-colour palette maximum per spritesheet section (keeps file size minimal)

### Protagonist Design
Warm medium-dark skin tone — not a specific real-world reference, not cartoonishly dark. A tone that exists naturally in a considered pixel palette, readable at 16×48 pixel size. The character should read clearly at small scale.

**Visual rank progression** — clothes and accessories change at:
- Rank 0 (Unemployed): plain, unremarkable clothes
- Rank 2 (Junior): slight improvement — cleaner, slightly more intentional
- Rank 4 (Senior): class-specific visual identity beginning to show
- Rank 6 (Principal/Lead): distinct class aesthetic established
- Rank 8 (Top rank): definitive visual identity — recognisable as the highest tier at a glance

### Class Visual Languages

**Architect:** Technical aesthetic. Clean lines. Tool indicators. At high rank: a subtle cyan glow around technical elements — as if the Architect can see the underlying layer of the world.

**Warlord:** Command aesthetic. Structured. At mid-rank: posture changes in idle animation — the sprite holds differently. At high rank: NPCs in the world visibly defer in proximity.

**Herald:** Influence aesthetic. Expressive. At mid-rank: distinctive style beginning to show. At high rank: speech bubbles carry a visible aura in the world.

### Environment Design

**Interior spaces (flat, workplace):**
- Warm dark backgrounds (`#1A1410` floor, `#2A1F1A` walls)
- Detailed — furniture, objects, light sources
- The flat upgrades visually as stats rise — better furniture, more light, new items

**Exterior spaces (neighbourhood, city streets):**
- Cooler — Deep Navy sky (`#0D1B2A`), concrete surfaces (`#1A2535`)
- More open — more negative space than interiors
- Lit areas and shadow areas — street lights create pools of light at night

**Corrupted State visual:**
- Scanlines intensify — a visible overlay effect
- Colour temperature shifts toward grey and desaturated red
- The world looks degraded — the same world, but wrong
- System Window borders shift from cyan to a muted, pulsing warning red

### Spritesheet Organisation

**sprites.png (game world):**
- Section 1: Protagonist — all ranks, all four directions, 4-frame walk cycle, idle frame
- Section 2: NPCs — Mentor (×3, one per class), Colleague, Recruiter, Neighbourhood residents (×4), Merchant
- Section 3: Antagonist NPCs and Faction Operatives — Drifter, Distractor, Anchor, Named Operative silhouette
- Section 4: Environment tiles — floor (interior), floor (exterior), wall (interior), wall (exterior), desk, bed, door, bookshelf, notice board, market stall
- Section 5: Interactive objects — laptop, skill scroll item, gold coin, HP item, job offer document, world boss marker

**ui-icons.png (interface):**
- Stat icons (one per stat, colour-matched)
- Quest status icons (active, complete, failed)
- Class icons (Architect, Warlord, Herald)
- Rank insignia (one per rank level, per class)
- Ability icons (one per ability, grouped by class and tier)
- System Window section icons

---

## 7. Motion and Animation

### In-Game
- Player walk cycle: 4 frames per direction, 150ms per frame
- NPC idle: 2-frame subtle movement at 800ms interval
- Skill Scroll drop: item descends from top of screen, landing impact particle
- Stat bar fill: animated on change, number ticks up/down over 600ms
- Rank up: screen flash in Execution Gold, stat bars overfill briefly, System transmission appears
- Corrupted State onset: gradual scanline intensification over 3 seconds
- Combat hit: brief sprite flash (white flash, 100ms), screen shake (2px, 200ms)
- Ability activation: class-specific particle effect (cyan for Architect, purple for Warlord, red for Herald)

### System Window
- Opens: slides in from right, 200ms ease-out
- Closes: slides out to right, 150ms ease-in
- Stat delta indicator: animates on open if stats changed since last view

### Marketing

**Instagram:**
- Carousels: each slide holds 2 seconds in stories auto-advance format
- The infinity symbol in static posts: subtle glow pulse animation (CSS, 2-second loop)

---

## 8. Brand Voice

The /loop brand voice is what speaks to the world — Instagram captions, LinkedIn posts, the app description, any external communication. It is distinct from SYD's System voice.

**Characteristics:**
- Direct. No filler.
- Confident without being loud.
- Treats the audience as capable adults.
- The game is the lead. The learning is what happens when you play it.
- Never corporate. Never wellness-adjacent. Never productivity-guru.

**Good copy:**
*You start unemployed. The world is small. Your stats are low. That's the starting coordinate. Everything after that is execution.*

**Bad copy:**
*Unlock your potential with gamified learning! Build the skills you need to succeed in today's competitive job market!*

### Platform-Specific Tone

**Instagram:** Short, visual-first. The SYD bracket header aesthetic can appear in captions — it reads as native to the world. One strong line, then the detail. The link in bio or first comment.

**LinkedIn:** Slightly longer. Career angle leads. The game is the method, the real-world insight is the value. Bracket headers used sparingly — once per post at most. The insight must stand alone even if the reader has never heard of /loop.

---

## 9. Brand Applications Summary

| Surface | Primary Background | Primary Accent | Typeface |
|---|---|---|---|
| App / Game UI | System Black `#0A0B10` | Loop Cyan `#00F2FF` | Display |
| System Window | System Black `#0A0B10` | Loop Cyan `#00F2FF` | Display + Body |
| Game World | Deep Navy `#0D1B2A` | World palette | — |
| App Icon | System Black `#0A0B10` | Loop Cyan `#00F2FF` | Symbol only |
| Instagram grid | System Black `#0A0B10` | Cyan + Gold | Body |
| LinkedIn banner | Deep Navy `#0D1B2A` | Cyan + Gold | Display + Body |
| LinkedIn posts | White or light | Stat colours | Body |
| Loading screen | System Black `#0A0B10` | Loop Cyan `#00F2FF` | Display |
