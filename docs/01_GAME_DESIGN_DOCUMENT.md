# /loop — Game Design Document (GDD)
**Version:** 2.0
**Status:** Active — source of truth for game design
**Last updated:** March 2026

---

## 1. What /loop Is

/loop is a top-down pixel art life and career RPG. It is the evolved form of SYD /terminal. Where /terminal was a browser-based directive system, /loop is a world you inhabit. A place you live in, work in, fight through, and grow within.

The game runs on a single premise: **the things you do in /loop train you to do them better in real life.** Not through instruction. Through repetition, pattern recognition, and the specific feeling of having navigated a situation before. You play it enough times that when the real version arrives, something fires. You know what to do. You remember how it played out in the game.

/loop is not a self-improvement app with a pixel art skin. It is a game that happens to make you better at life and work. The learning is invisible. The play is real.

---

## 2. Design Pillars

**Play first.** The learning is baked into the game. The player never feels like they are being taught. They feel like they are playing.

**The world reacts to who you are.** Stats, rank, and choices change what is accessible, how NPCs speak to you, what enemies appear, and what the world looks like. Growth is visible and felt.

**Stakes are real.** You can lose fights. HP costs something. Choices have consequences in the world. Without stakes, there is no tension. Without tension, there is no fun.

**Power is earned, not given.** The Solo Leveling arc. The player starts at the bottom. Every ability, every rank, every unlock is earned through execution. By the time a player reaches the top rank of their class, they are visibly, obviously, unreasonably powerful. That journey is the game.

**Mirror reality.** The Life Track reflects real behaviour. The Career Track mirrors real career progression. The game world is fictional but the systems inside it are grounded in how growth actually works.

---

## 3. Genre and Feel

- Top-down pixel art RPG — early Zelda feel, tile-based, explorable
- Life sim layer — your flat, your neighbourhood, your daily existence
- Career RPG layer — jobs, promotions, rank progression, workplace dynamics
- Combat layer — turn-based fights against Faction operatives with real stakes
- Solo Leveling growth arc — start at the bottom, become genuinely powerful

The world is fictional. Not tied to any real city or country. Familiar but unnamed. The protagonist's skin tone is warm medium-dark, defined by the pixel art palette.

**Platform:** Web browser, mobile-first, desktop-responsive. Playable on any device with a browser. Designed first for touch (mobile) and scaled up for keyboard and mouse (desktop/gaming PC).

---

## 4. The Two Tracks

/loop runs two tracks simultaneously. They share one stat system. They reinforce each other.

### Track One — The Life Track
Real-world behaviours feed in-game stats. The player logs daily actions — movement, learning, rest, social interaction. These map to the five universal stats and cause them to rise. Neglect causes decay. The world responds to stat levels — the flat upgrades, new areas open, NPCs become accessible, combat becomes easier.

### Track Two — The Career Track
The player starts unemployed. They apply for jobs, get hired, work, face career encounters, receive Skill Scrolls, rank up, and get promoted. Career progression requires completing Career Directives and passing Encounters at the current rank level.

**The two tracks compound.** Strength built on the Life Track makes the player more resilient in combat. Intelligence raised through Life Directives gives advantages in career Encounters. Charisma opened through social Directives unlocks NPC relationships that give career quests. They are not separate — they are one system with two input sources.

---

## 5. The Three Classes

Every player chooses a class based on their real-world career. Classes are not just job labels — they are power identities. Each class has a distinct encounter style, combat ability set, and visual identity that evolves with rank.

### ARCHITECT
*The technical class. Precision, systems, structure.*

Architects see the underlying structure of situations. At high rank they literally perceive things others cannot — hidden flaws in systems, optimal paths through problems, weaknesses in enemies that other classes miss. Their power is intelligence expressed as construction and deconstruction.

**Real-world careers:** Engineering, software development, data, technical roles.

**RPG identity:** The Artificer/Engineer archetype. High single-target damage, utility abilities, strong in Encounters requiring pattern recognition.

**Rank ladder:**
Apprentice → Coder → Engineer → Senior Engineer → Staff Engineer → Principal → Architect → Chief Architect

---

### WARLORD
*The command class. People, systems, battlefield control.*

Warlords do not fight alone. Their power scales with the people around them — they buff allies, suppress enemies, and command the field. A Warlord at high rank turns every encounter and fight into a coordinated operation where they are always in control of the terms.

**Real-world careers:** Product management, operations, HR, project management, leadership roles, finance.

**RPG identity:** The Tactician/Commander archetype. Moderate damage, high control, excels in multi-element encounters and extended fights.

**Rank ladder:**
Intern → Coordinator → Manager → Senior Manager → Director → VP → General → Warlord

---

### HERALD
*The influence class. Information, persuasion, words as weapons.*

Heralds fight with information and influence. They reveal enemy weaknesses, apply buffs and debuffs across the whole field, and at high rank can resolve encounters and even fights without direct combat. Their power is social and informational leverage made into a weapon.

**Real-world careers:** Marketing, sales, growth, community, content, brand.

**RPG identity:** The Bard/Mage hybrid archetype. Lower direct damage, highest field control, unique non-combat resolution abilities.

**Rank ladder:**
Intern → Associate → Specialist → Senior Specialist → Lead → Head → Chief → Grand Herald

---

## 6. The Stat System

Five universal stats. One system. Feeds both tracks. Full definitions in the Stat Bible (Document 02).

**INTELLIGENCE** — How sharply you read situations and make the right call.
**STRENGTH** — How much you actually deliver and follow through.
**CHARISMA** — How well you move and influence people.
**DEXTERITY** — How well you adapt and respond to changing situations.
**LUCK** — Derived. The aggregate of the other four. Cannot be targeted directly.

Stats run on a 0–100 scale. They rise through Directives and Encounters. They decay slowly without activity. The world responds to their levels — not just through numbers, but through what is accessible, how NPCs behave, and how combat plays out.

---

## 7. The World

### Design Philosophy
The world is tile-based (16×16 tiles), top-down, early Zelda feel. Tile-based is not a constraint — it is the right choice for mobile performance, visual clarity, and the pixel RPG aesthetic. The off-screen buffer technique (pre-render the map once per load, draw as a single image each frame) keeps the game running smoothly on low-end mobile devices.

The world does not announce its secrets. It contains them. Players discover locked areas, hidden NPCs, and world events by exploring and by growing. A door that was closed on day one opens when the player's stats reach a threshold. An NPC who said nothing for two weeks starts talking when Charisma hits 40. The world rewards attention.

### The Starting Flat
Every player begins here. Small. Sparse. A bed, a desk, a window. The flat upgrades visually as stats and rank rise — better furniture, more light, new items that reflect who the player is becoming.

**Interactive objects:**
- **Bed** — restores HP, advances time to morning, triggers save
- **Laptop** — accesses Career Directives, quest log, and Behavioural Trace

### The Neighbourhood
Explorable from day one. Multiple NPCs, a Job Board, a Supply Cache, and discoverable locations. The neighbourhood expands as the player grows — new areas, new buildings, new NPCs.

**Discoverable locations (examples, not exhaustive):**
- A library (unlocks at Intelligence 40) — rare Skill Scrolls not available elsewhere
- A black market trader (unlocks at Career Rank 3, via hidden path behind the market)
- A rooftop (unlocks at Dexterity 50) — fast-travel point, view of the full city
- A faction building (unlocks at Career Rank 5) — leads to a Named Operative encounter

### The Workplace
Unlocked after the player's first successful job application. Three variants:
- **The Workshop** (Architect) — terminals, whiteboards, build stations
- **The Floor** (Warlord) — open plan, meeting rooms, project boards, command centre
- **The Studio** (Herald) — creative space, campaign walls, broadcast setup

The workplace environment changes visually at each promotion. The NPCs there respond differently to each rank. The Career Encounters that happen here become harder and more rewarding as rank rises.

### Day/Night Cycle
The world cycles through morning, afternoon, and night. Time advances through actions — completing a full set of daily Directives advances the day. The player can also sleep early.

**Time-dependent content:**
- Certain NPCs only appear at night
- Faction operatives are more aggressive and more numerous after dark
- Some quests only trigger at specific times of day
- The market has different inventory in the morning vs evening

### World Events
Unannounced events that appear and expire. Discovered by playing. Examples:
- **Market Day** — rare item traders appear in the neighbourhood for one in-game day
- **Faction Incursion** — the neighbourhood is flooded with operatives for 24 hours, higher rewards for each defeated
- **Job Fair** — multiple companies hiring simultaneously at the Job Board
- **Signal Surge** — the Behavioural Trace activates early, delivering an unexpected pattern readout

---

## 8. The Encounter System — Games, Not Forms

Every encounter is a contained playable mini-game. No typing. No multiple-choice forms. Each class has three encounter types. All are tap-based, mobile-first, completable under 90 seconds.

Encounters scale to the player's current career rank — a Junior Architect faces simpler Debug Scans than a Principal Architect. The mechanic is the same. The complexity and speed increase with rank.

**The encounter flow:**
1. Scenario context appears — one or two sentences setting the situation
2. The mini-game begins immediately
3. Outcome plays out — the world responds (NPC reacts, stat bar moves, quest advances)
4. Skill Scroll drops — explains the principle behind what just happened

---

### ARCHITECT Encounters

**The Debug Scan**
A piece of code, a system diagram, or a technical brief fills the screen. Flawed elements are hidden within it — they look almost right but contain an error. The player taps flawed elements before the timer runs out. Correct tap: green pulse, time bonus. Wrong tap: red flash, time penalty. Find all flaws before the timer = success.

*The fun:* The satisfaction of spotting what is wrong. The slight pressure of the timer. The visual feedback of each correct tap.

**The Build Sequence**
A system must be assembled. Components appear and must be connected in the correct logical order — drag and snap, mobile-friendly. The correct sequence can be reasoned out. Getting it right produces a satisfying assembly animation and a completion sound.

*The fun:* The puzzle satisfaction. The assembly payoff. The moment it all clicks into place.

**Overload Mode** *(high-rank Architect encounter)*
A system is under attack while a build must be completed simultaneously. The player taps incoming threats with one hand while dragging build components with the other. 45 seconds maximum. Escalating speed. Intense and short.

*The fun:* Controlled chaos. The feeling of competence under real pressure.

---

### WARLORD Encounters

**The Allocation Board**
A project board with tasks and team members. Each team member has a visible strength icon. Each task has a requirement icon. The player drags team members to matching tasks before the timer runs out. Wrong allocations fail visibly. Perfect allocation produces a multiplier bonus on XP.

*The fun:* The spatial matching puzzle. The visible consequence of each placement. The bonus for getting it exactly right.

**The Pressure Room**
A negotiation plays out between two characters on screen. A conversation rhythm plays — beats that the player must tap at the right moment (rhythm-adjacent mechanic). Miss a beat: conversation shifts against the player. Hit every beat: the NPC becomes an ally, the outcome flips.

*The fun:* The rhythm mechanic. The satisfaction of landing each beat. The dramatic shift when it works.

**Field Command** *(high-rank Warlord encounter)*
Three simultaneous situations unfold in three panels. The player taps between panels, makes quick decisions in each, keeps all three from failing. Impossible to perfect on first attempt. Mastered through recognising the patterns across multiple plays.

*The fun:* The overwhelming-then-manageable arc. The feeling of being in command when it finally clicks.

---

### HERALD Encounters

**The Signal Read**
A crowd of NPCs with visible emotional states (small icons above heads). The player builds a message by dragging word and image tiles into a message slot. The message must match the emotional state of the majority of the crowd. Wrong match: crowd turns away. Right match: crowd responds, cascading visual reaction, XP bonus.

*The fun:* The reading-the-room mechanic. The visual crowd response. The cascade when it works.

**The Negotiation**
An NPC wants something, the player has something. A deal meter shows the current state. The player plays offer cards — each shifts the meter. The goal: land the meter in the green zone without overshooting. Too generous: you lose value. Too aggressive: the NPC walks. The meter reacts in real time.

*The fun:* The push-and-pull tension. The uncertainty of each card. The relief when it lands.

**The Broadcast** *(high-rank Herald encounter)*
A campaign launches across multiple channels simultaneously. Each channel has a different audience with visible needs. The player routes message components to the right channels under time pressure. One wrong route: that channel reacts negatively. All correct: cascade effect, XP multiplied across all channels.

*The fun:* The routing puzzle. The cascade payoff. The visual explosion when all channels fire correctly.

---

## 9. The Combat System

### Overview
Faction operatives are enemies that exist in the world. They are visible — the player can see them and choose to engage or avoid. At certain story points, combat is unavoidable.

Combat is turn-based. Fast turns (10 seconds maximum per turn). Both sides have visible HP bars. The player chooses an ability card from their current hand, executes it, sees the result, the operative responds. This repeats until one side reaches zero HP.

**Turn-based rationale:** Mobile-friendly, readable, strategic without complexity, works on slow connections because each turn is a discrete action not a continuous stream.

### HP and Consequences
The player's HP bar persists between fights. Taking damage costs real HP. HP recovers by sleeping (bed in flat) or using items from the Supply Cache. Running out of HP triggers Weakened State: stats temporarily reduced by 20%, all encounters harder, NPC dialogue shifts to reflect the player's degraded condition. This creates real stakes. Players cannot fight carelessly.

### Faction Operative Types

**The Drifter** *(low-level)*
Common. Found throughout the neighbourhood, more frequently at night. Basic attacks, predictable patterns. Drops common items and small gold. The tutorial enemy — teaches the combat system through repetition.

**The Distractor** *(mid-level)*
Does not deal HP damage directly. Instead applies debuffs: reduces a stat temporarily, scrambles the player's ability hand, places a time limit on the next encounter. More dangerous than it looks because the debuffs compound. Requires Dexterity to counter effectively.

**The Anchor** *(high-level)*
Heavy HP damage. Has its own ability cards that mirror the player's class mechanics — a corrupted Architect Anchor uses Debug Scan-like attacks to find weaknesses in the player's defences. Rare, always telegraphed by a shift in the world's visual tone before it appears. Significant drops on defeat.

**The Named Operative** *(boss-level)*
One per major story arc. Full HP bar, multiple phases, unique abilities not seen in standard combat. Defeating a Named Operative advances the main story and produces a major reward. Rare enough that each one feels significant.

### Combat Abilities

Each class has twelve abilities across three tiers. Tier 1 unlocks at game start. Tier 2 requires Career Rank 3 and stat threshold. Tier 3 requires Career Rank 6 and demonstrated mastery of Tier 2 abilities.

**Abilities are not given — they are earned.** The relevant Skill Scroll must have been read AND the relevant encounter type must have been completed successfully at least once. You cannot use an ability you have only read about.

---

#### ARCHITECT Abilities

**Tier 1**
- *Exploit* — deals bonus damage to an identified weakness (Intelligence check reveals weakness first)
- *Patch* — restores a portion of HP mid-combat
- *Firewall* — blocks the next enemy ability entirely
- *Scan* — reveals the enemy's current HP total and one ability in their hand

**Tier 2**
- *Overload* — deals triple damage, Architect cannot act next turn (cooldown cost)
- *Redundancy* — creates a backup: if HP would hit zero this turn, HP is restored to 20% instead (one use per combat)
- *Deep Trace* — reveals the enemy's full ability hand and all remaining HP
- *Patch v2* — restores HP and removes one active debuff simultaneously

**Tier 3**
- *Root Access* — for two turns, all Architect abilities cost no action and deal double damage. After: Architect is stunned for one turn.
- *System Override* — the enemy's next ability is turned against them at full damage
- *Architecture* — builds a defensive structure that absorbs the next three hits before breaking
- *Full Rebuild* — restores HP to full. Long cooldown. One use per day.

---

#### WARLORD Abilities

**Tier 1**
- *Rally* — calls an NPC ally who fights alongside for three turns
- *Suppress* — reduces enemy damage output by 40% for two turns
- *Counter* — the next enemy attack reflects back at half damage
- *Assess* — reveals enemy type, weakness, and remaining turn count before their next ability fires

**Tier 2**
- *Field Command* — all effects on player (buffs and debuffs) doubled for two turns. High risk, high reward.
- *Coordinate* — next ally action deals double damage
- *Fortify* — ally NPC takes no damage for one turn
- *Suppress v2* — reduces enemy damage AND slows their turn speed for three turns

**Tier 3**
- *Total Suppression* — enemy cannot act for two full turns
- *Rally v2* — calls two NPC allies simultaneously, both fight for four turns
- *Warfield* — all enemies on the field take passive damage each turn for three turns (effective in multi-operative encounters)
- *Command Override* — redirect an enemy's attack to hit another enemy instead

---

#### HERALD Abilities

**Tier 1**
- *Disinform* — enemy skips their next turn
- *Amplify* — next ability deals double damage
- *Signal* — reveals enemy's full ability hand
- *Deflect* — redirects next enemy attack to miss entirely

**Tier 2**
- *Broadcast* — applies a buff to the player that lasts three turns and increases all stat checks
- *Counter-Narrative* — removes an enemy debuff applied to the player and reflects it back
- *Signal v2* — reveals enemy full ability hand AND weakens their next ability by 50%
- *The Mark* — tags an enemy: all damage dealt to them is increased by 30% for three turns

**Tier 3**
- *The Pitch* — non-combat resolution attempt. If Charisma is above 70, the operative is neutralised without further combat. If below 70, ability fails and costs one turn.
- *Full Broadcast* — all player stats are boosted by 25% for three turns
- *Information Cascade* — triggers a chain: Signal → Amplify → Disinform in sequence, one per turn, automatically
- *Grand Herald's Word* — the most powerful Herald ability. One use per combat. Deals damage equal to 50% of the enemy's current HP, regardless of defence.

---

## 10. The Skill Scroll System

Skill Scrolls are the learning delivery mechanism. They are short, specific, and grounded in one concrete idea. The player never studies before playing — they encounter first, then the Scroll explains what just happened.

**Delivery methods:**
- **Post-encounter drop** — most common. Appears after an encounter resolves.
- **Post-combat drop** — appears after defeating an operative. Faction-specific Scrolls only available this way.
- **NPC gift** — a Mentor or Neighbourhood NPC gives a Scroll at a relationship threshold.
- **Environment find** — on a bookshelf in the flat, on a noticeboard at the workplace, in a discoverable location.
- **Purchasable** — via the Bookshelf in the Supply Cache, using gold.

**Scroll structure:**
- Title (short, memorable)
- Core idea (two sentences maximum)
- The mechanic it references (the underlying principle)
- Stat tag (which stat this Scroll feeds)

**Collecting Scrolls** gives a small stat boost for each new Scroll read. The System Window's Scroll Library holds all collected Scrolls, reviewable at any time. Over hundreds of Scrolls, the library becomes a genuine reference — built through play, not study.

---

## 11. NPC System

NPCs are not decoration. They are the world's delivery mechanism for quests, Scrolls, combat context, and story.

**NPC types:**

**Mentor NPCs** — one per class. Give the most important career quests, highest-tier Skill Scrolls, and deeper dialogue at higher ranks. They remember the player's history.

**Colleague NPCs** — appear at the Workplace. React to rank and stats. Give day-to-day career quests. Their dialogue changes based on how the player has performed in recent encounters.

**Neighbourhood NPCs** — give life quests, unlock areas, drop life-relevant Skill Scrolls. Some are friendly from the start. Others require Charisma thresholds.

**Recruiter NPCs** — at the Job Board. Manage job applications and interview encounters. Different Recruiters represent different career tiers — the Recruiter who gave the player their first job is not the same one who handles Director-level applications.

**Faction Operatives** — enemies in the world. Visible, engageable, avoidable. Scale to player level. More aggressive at night.

**Merchant NPCs** — at the Supply Cache and discoverable locations. Sell items, rare Scrolls, and combat consumables for gold.

**NPC memory:** NPCs remember. A completed quest changes dialogue. A failed encounter in front of a Colleague NPC changes how they speak to you. Relationships are assets that build and degrade over time.

---

## 12. The Gold Economy

Gold is earned by completing Directives, winning combat, and completing quests. It is spent at:

**The Supply Cache** — performance buffs, HP recovery items, stat-boost consumables, cosmetic flat upgrades.

**The Bookshelf** — purchasable Skill Scrolls. Scrolls here are available before the player would encounter them naturally. Spending gold to learn something early is a valid strategy.

**The Wardrobe** — character cosmetics. Visual upgrades that reflect class and rank. Some cosmetics are only available at certain rank levels — they cannot be bought earlier regardless of gold.

**Gold rules:** Gold does not buy rank. Gold does not buy abilities. Gold buys preparation, recovery, early access to knowledge, and cosmetic expression. Rank and abilities are earned through execution only.

---

## 13. Momentum, Streak, and HP

**Streak:** Consecutive days of completing at least one Directive build a streak. Streak multiplies all XP earned.

**Momentum:** Builds over the streak. At 14 consecutive days, Momentum reaches 2x XP. Decays on missed days.

**HP:** Missed days reduce HP. Multiple consecutive missed days push HP toward zero.

**Corrupted State:** HP at zero. XP gain halved. Visual corruption effects in the world — scanlines intensify, colours shift toward grey and red, NPC dialogue reflects the player's degraded state. Faction operatives appear more frequently and are more aggressive.

**Recovery:** Complete Directives, win combat, rest at the flat. HP recovers. Corrupted State lifts. The world returns to normal. The path back is always through execution.

---

## 14. The Behavioural Trace

Every seven in-game days, the System delivers a Behavioural Trace — a short, cold, accurate summary of what it has observed in the player's in-game execution patterns over the past week.

The Trace reads from: Directives completed vs skipped, Encounter pass/fail rates, combat outcomes, which areas explored, time-of-day patterns, stat delta over the period.

The Trace is not encouraging. It is not therapeutic. It is accurate. It shows the player something true about their patterns — patterns they may not have consciously noticed. Delivered via System Window in SYD's voice. Bracketed. Clipped. Precise.

This is the inner guide forming. The System watching what the player does and reflecting it back. The player did not tell the System anything — the System figured it out from observation.

---

## 15. The World Boss

Each player can designate a World Boss — a persistent, named obstacle. In /loop, the World Boss is a career or life obstacle the player names and assigns to a stat. It has an HP bar. Completing Directives and winning combat that targets the Boss's assigned stat deals damage to it.

The World Boss HP readout is visible in the System Window. A problem with visible HP is a problem that can be solved. The Boss does not disappear when defeated — the player designates a new one.

---

## 16. The System Window

Accessible via button tap or key press at any time. An overlay screen — the manhwa status window made navigable.

**Sections:**
- **Stats** — five stat bars with numeric values, colours, and delta indicators
- **Rank** — Life rank and Career rank displayed together, with progress to next rank
- **Active Quests** — current quest list with completion status
- **Skill Scroll Library** — all collected Scrolls, browsable by stat tag
- **Known Opponents** — named failure modes encountered and logged
- **Abilities** — all unlocked abilities by tier, with usage notes
- **Behavioural Trace** — last seven-day readout, always accessible after first delivery
- **World Boss** — current Boss, HP bar, assigned stat

---

## 17. The Visual Power Fantasy

As rank and stats rise, the character sprite changes. This is not cosmetic — it is the visual representation of becoming powerful.

**Architect visual progression:**
- Apprentice: basic work clothes
- Engineer: clean technical gear, a subtle tool indicator
- Principal: precision aesthetic, sharper design lines
- Chief Architect: distinctive visual identity, recognisable at a glance as the highest tier

**Warlord visual progression:**
- Intern: plain clothes, no authority signals
- Manager: formal indicators, posture changes in sprite
- Director: command presence visible in idle animation
- Warlord: commanding visual — other NPC sprites visibly defer in proximity

**Herald visual progression:**
- Intern: plain, unremarkable
- Specialist: distinctive style beginning to show
- Head: confident visual identity, speech bubble aura begins
- Grand Herald: full visual presence — speech effects carry visible weight in the world

These changes are visible to the player and to NPCs in the world. A Chief Architect walking through the neighbourhood is treated differently from an Apprentice. The world knows who you are.

---

## 18. The /signal Connection

/loop is the game world. /signal is the novel that exists inside that world.

The MC in /signal is an operator running /loop's world. The novel never names the game directly. The reader recognises the System, the directives, the Trace, the operatives. Every chapter ends: *the system the MC uses is real.* The link goes to /loop.

/signal is marketing that does not feel like marketing. It is the lore made narrative, distributed on Instagram and LinkedIn as serialised carousels.
