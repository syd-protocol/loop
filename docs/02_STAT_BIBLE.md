# /loop — Stat Bible
**Version:** 2.0
**Status:** Active — source of truth for all stat definitions and mappings
**Last updated:** March 2026

---

## Overview

/loop uses five universal stats. One system across both tracks. The same numbers reflect the whole player — their life habits and their career capacity simultaneously.

Stats are displayed in the System Window as numeric values (0–100) with animated fill bars. Colour-coded by stat. Delta indicators show recent change direction.

The player learns how each stat affects their life and career through play — through NPC reactions, encounter outcomes, combat results, and the world opening or closing around their numbers. This document is the design source of truth.

**LUCK is derived.** It is the aggregate of the other four stats. It cannot be targeted directly. It rises as the others rise. It represents the compound effect of a well-developed character — what looks like luck to others is built capacity. This is stated in-game by the System directly, early in play.

---

## Stat Display

Each stat in the System Window shows:
- Stat name (tap/click to see in-world explanation)
- Numeric value (0–100)
- Animated fill bar (stat colour)
- Delta indicator (arrow showing recent change direction)

**Colour coding by level:**
- 0–25: Grey (Early)
- 26–50: Blue (Developing)
- 51–75: Green (Solid)
- 76–100: Gold (Advanced)

Luck displays separately below the four main stats. Notation: *derived — build the others.*

---

## The Five Stats

---

### INTELLIGENCE
*How sharply you read situations and make the right call.*
**Stat colour:** `#1A6BFF` (blue)

**What it measures:**
The ability to process information from people, situations, and problems and produce an accurate assessment quickly. Not raw knowledge — judgement. The gap between knowing what to do and knowing what to do right now, in this situation, under this pressure.

**How it rises:**
Life Track: deliberate learning directives, reading, applying concepts to real situations, curiosity-driven exploration, completing intelligence-class Directives.
Career Track: passing Encounters that require accurate diagnosis, completing Intelligence-tagged Skill Scrolls, identifying correct flaws in scenarios, defeating Architect-type Faction operatives.

**How it affects the Life Track:**
Higher Intelligence means Life Directives requiring reflection yield more XP. The Behavioural Trace (seven-day pattern readout) becomes more precise and actionable at higher Intelligence — the System can make sharper observations when it has more to work with. Curiosity-class Directives unlock at higher Intelligence thresholds, opening new types of learning actions.

**How it affects the Career Track:**
Intelligence is the primary stat for all Encounter types. Debug Scan encounters, Signal Read encounters, and Allocation Board encounters all have Intelligence checks that determine difficulty and available options. Higher Intelligence reduces time pressure in encounters — the player processes the scenario faster. At Intelligence 60+, Exploit (Architect ability) reveals enemy weaknesses automatically. Job applications at Principal rank and above have Intelligence thresholds.

**How it affects combat:**
Intelligence determines ability to reveal enemy information. *Scan*, *Deep Trace*, and *Signal* abilities all have Intelligence checks. Higher Intelligence means more information available before committing to a move.

**NPC delivery line (early game):**
*"Intelligence isn't about knowing more. It's about seeing faster. You want to be the one who already knows what's happening before anyone else has finished speaking."*

---

### STRENGTH
*How much you actually deliver and follow through.*
**Stat colour:** `#E63B2E` (red)

**What it measures:**
Conscientiousness and will. The drive to finish what is started. The capacity to produce output under pressure, across the days when it costs more than it returns. Not physical strength alone — execution strength. The ability to do the thing when it would be easier not to.

**How it rises:**
Life Track: completing physical directives, finishing tasks started, maintaining streaks, Momentum counter compounding over time, Strength-class Directives.
Career Track: completing Career Directives without abandoning, delivering on multi-step project quests, hitting deadlines in encounter sequences, defeating Anchor-type Faction operatives.

**How it affects the Life Track:**
Strength governs HP recovery rate — higher Strength means HP recovers faster after missed days. The Momentum streak decays more slowly at high Strength. A high-Strength character who enters Corrupted State climbs out faster. Physical Directives yield bonus XP above Strength 50.

**How it affects the Career Track:**
Strength is the primary stat for completing Career Directives. Multi-step quests, long encounter chains, and quest sequences that span multiple in-game days all scale with Strength. Promotion thresholds at every rank require minimum Strength — no rank promotes a character who cannot deliver consistently. The Allocation Board encounter (Warlord) and Build Sequence encounter (Architect) are both partially Strength checks on completion quality.

**How it affects combat:**
Strength determines HP total and base defence. Higher Strength means more HP available in combat and reduced damage taken from standard attacks. *Patch* and *Full Rebuild* (Architect abilities) restore more HP at higher Strength. *Fortify* (Warlord ability) lasts longer at higher Strength.

**NPC delivery line (early game):**
*"Everyone starts with good intentions. Strength is what's left when the intention runs out and the work still needs to happen."*

---

### CHARISMA
*How well you move and influence people.*
**Stat colour:** `#9B5DE5` (purple)

**What it measures:**
Social effectiveness. The ability to create alignment, communicate clearly, build trust, and navigate relationships with precision. Not performance or likability — functional social leverage. The kind that gets things done, opens doors, and makes other people want to help.

**How it rises:**
Life Track: social Directives (initiating conversations, maintaining relationships, active listening, giving genuine value), completing difficult social tasks, building NPC relationship networks.
Career Track: NPC interactions at the Workplace, Encounter types involving stakeholder management or communication, Pressure Room encounters, Signal Read encounters, defeating Distractor-type Faction operatives.

**How it affects the Life Track:**
Charisma directly gates NPC availability. Many Neighbourhood NPCs only become talkative above certain Charisma thresholds. Higher Charisma means more nuanced NPC dialogue — more information, better quests, deeper Skill Scrolls. At Charisma 60+, certain NPCs approach the player rather than waiting to be approached. Social-class Directives yield bonus XP above Charisma 50.

**How it affects the Career Track:**
Charisma is the primary stat for people-management Encounters and client-facing situations. For the Warlord class, most Senior-rank Encounters are fundamentally Charisma tests. For the Herald class, Charisma gates the most powerful abilities — *The Pitch* requires Charisma 70+. Job interview encounters at all ranks have a Charisma check component. Colleague NPC relationships build faster at higher Charisma.

**How it affects combat:**
Charisma determines the effectiveness of influence-based abilities. *Disinform*, *Deflect*, *Counter-Narrative*, and *The Pitch* all scale with Charisma. Higher Charisma means Distractor operatives are less effective at applying social debuffs. At Charisma 70+, *The Pitch* becomes a reliable combat-ending option against standard operatives.

**NPC delivery line (early game):**
*"Charisma is just competence with a signal. You have to be good. But if no one knows you're good, it doesn't matter in this world."*

---

### DEXTERITY
*How well you adapt and respond to changing situations.*
**Stat colour:** `#00A878` (green)

**What it measures:**
Adaptability under disruption. The ability to change course without losing momentum. Resilience in the face of the unexpected — not predicting disruption, but remaining functional when it arrives. Emotional stability as a performance asset.

**How it rises:**
Life Track: Directives that break established patterns, trying new approaches when old ones fail, completing Agility-class Directives, recovering from missed days and re-engaging rather than abandoning.
Career Track: Encounters where conditions shift mid-scenario, Overload Mode encounters, Field Command encounters, recovering from failed encounters and completing the quest anyway, defeating Anchor-type Faction operatives.

**How it affects the Life Track:**
Dexterity governs the response to disruption. A high-Dexterity character entering Corrupted State loses HP more slowly and exits more quickly. When Life Directives tier up (new directive types unlocking), a high-Dexterity player adapts faster — full XP from day one of the new tier rather than a calibration penalty. Low Dexterity means temporary XP reduction when routine is disrupted. Agility-class Directives yield bonus XP above Dexterity 50.

**How it affects the Career Track:**
Dexterity is the primary stat for Encounters involving ambiguity, incomplete information, and shifting conditions. All high-rank Encounters across all three classes have a Dexterity component — the situations become less predictable as rank rises. Dexterity also affects NPC relationship resilience — a high-Dexterity player recovers NPC trust faster after a failed Encounter. The Overload Mode and Field Command encounters are primarily Dexterity checks.

**How it affects combat:**
Dexterity determines turn speed and debuff resistance. Higher Dexterity means the player's turns resolve before the enemy's at equal-tier encounters. Distractor debuffs are less effective — duration reduced, effects weakened. *Counter* (Warlord ability) and *Deflect* (Herald ability) both have higher trigger rates at higher Dexterity. At Dexterity 60+, the player receives a one-turn warning before an Anchor operative uses a major ability.

**NPC delivery line (early game):**
*"The world doesn't hold still. Dexterity is what keeps you moving when it shifts. Anyone can perform when the plan holds. This stat is for when it doesn't."*

---

### LUCK
*The aggregate. The compound effect. The thing others call luck.*
**Stat colour:** `#F4C430` (gold)

**What it measures:**
Luck is not random. It is the visible output of all four other stats operating together. High Intelligence means spotting opportunities others miss. High Strength means capitalising on them. High Charisma means the right people want to help. High Dexterity means adapting when things do not go as planned. The combination — expressed as a single number — is what the world calls luck.

**How it rises:**
Cannot be targeted. It is computed as the average of Intelligence, Strength, Charisma, and Dexterity. Displayed as a separate stat.

**How it affects both tracks:**
Luck governs positive random events in the world. Higher Luck means:
- Better Skill Scroll quality in post-combat drops
- Unexpected NPC quests from characters who had previously said nothing
- Hidden areas discovered slightly earlier than the stated stat threshold
- World events (Market Day, Signal Surge) appearing more frequently
- Encounters occasionally having an additional resolution path not visible at lower Luck
- Rare item appearances in the Supply Cache

These events do not feel random to the player. They feel like things are going their way. Because they are. Because they built that.

**System delivery line (early game, via System Window):**
```
[ STAT: LUCK ]

LUCK IS NOT A STAT YOU BUILD.
IT IS A STAT YOU EARN.

BUILD THE OTHERS.
WATCH THIS ONE FOLLOW.

[ DERIVED VALUE — NO DIRECT DIRECTIVE AVAILABLE ]
```

---

## Stat Decay

Stats do not hold indefinitely without activity.

- **Strength** decays fastest — physical capacity requires consistent maintenance
- **Intelligence** decays moderately — without deliberate learning, pattern recognition dulls
- **Charisma** decays slowly — social skills persist longer but atrophy without use
- **Dexterity** decays moderately — adaptability requires regular disruption and recovery cycles
- **Luck** follows its inputs — as any of the four decay, Luck follows

Decay is not punishment. It is an accurate model of how these capacities work in real life. The game makes it visible. The player decides what to maintain.

---

## Stat Thresholds — World Unlocks

The following are design-level references. Not exhaustive — additional thresholds defined during build.

| Threshold | Unlock |
|---|---|
| Intelligence 40 | Library location accessible |
| Intelligence 60 | Exploit reveals enemy weakness automatically |
| Charisma 35 | Certain Neighbourhood NPCs become talkative |
| Charisma 60 | NPCs approach player rather than waiting |
| Charisma 70 | The Pitch becomes reliable combat-ender |
| Dexterity 50 | Rooftop location accessible |
| Dexterity 60 | One-turn warning before Anchor major ability |
| Career Rank 3 | Black market trader accessible |
| Career Rank 5 | Faction building accessible |
| Career Rank 6 | Tier 3 abilities unlock (class-specific) |
