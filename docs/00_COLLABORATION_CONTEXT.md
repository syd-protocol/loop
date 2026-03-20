# Osioke — Collaboration Context Document
**For use in new chats on new projects**
**Last updated:** March 2026

---

## How to Use This Document

Paste this into any new chat at the start. It tells Claude who you are, how you think, how you like to work, and the philosophical and creative context behind your projects. This document is not project-specific — it is about you and how to work with you well.

---

## Who You Are

Osioke Itseuwa. Product manager, community manager, and product engineer based in Nigeria. You run a registered company and are building a public portfolio to showcase skills for employment. You work across product design, frontend development (vanilla JS/HTML/CSS), and learning/community systems. You use VS Code on Windows 11 with PowerShell, and rely on AI-assisted development — generating and verifying code rather than writing from scratch.

You have strong interests in gaming (RPGs, manhwa/system fiction, game mechanics), chess, and learning systems. Your projects reflect personal values around self-improvement, non-linear career paths, and making complex knowledge accessible.

---

## How You Think

**You think in systems.** When you encounter a problem, you look for the underlying pattern — the repeatable structure that explains it. Your GIS framework, your white paper on professional mastery, your SYD terminal — all of them are attempts to systematise something that most people leave as intuition.

**You think by building.** Your ideas are not fully formed until they have a working version. You do not want to theorise for too long. You want to make something and see if it works. The discussion serves the build.

**You think in manhwa logic.** The best frame for how you see growth is the system window from manhwa/webtoon fiction — the moment a protagonist's real-world actions start to reflect in a visible, legible interface. The inner guide. The genius in the wall. You are trying to build the real version of that.

**You think long-term and compounding.** Small actions compounding over time is not just a game mechanic to you — it is how you understand career, learning, and life. Your best systems are the ones that get better the longer you use them.

---

## How You Like to Work

**Share everything first, then discuss.** When you have a lot of context to share, you share it all before asking for a response. You do not want Claude to jump to conclusions before the full picture is in. If Claude responds before you have finished sharing, tell it clearly.

**You want to understand, not just receive.** When you get an answer, you want to know why — not just what. If Claude gives you a solution, you want the reasoning. If Claude makes a design decision, you want to know what it was choosing between.

**You push back and expect pushback.** If something does not feel right, you say so directly. You expect Claude to do the same — to tell you when an idea has a problem, to correct you when you are wrong, to hold a position if it is the right one. You do not want a yes-machine.

**You hate unnecessary complexity.** No frameworks, no bundlers, no dependencies that are not needed. This applies to code and to thinking. If something can be simpler without losing what matters, make it simpler.

**You work in phases, but want the full picture.** You like to know where everything is going before you start building any one part. Documents first, build second. Design decisions before code. The source of truth before the work.

**You name things carefully.** The names of things matter to you — products, classes, mechanics, documents. A name that does not fit will bother you. You will keep pushing until it feels right. Do not lock names early without earning them.

**You are building for people who think like you.** Your products are not for everyone. They are for people who recognise the gap between where they are and where they could be, and want a system for closing it. The audience is always, implicitly, someone like you.

---

## Principles You Hold

**Learning should be invisible.** The best learning happens when the learner does not feel like they are being taught. It is baked into the activity. Play first, insight second. Never announce the lesson before the experience.

**Systems over motivation.** Motivation is unreliable. Systems are repeatable. The goal is always to build a system that produces the right behaviour even when motivation is absent.

**Identity follows behaviour.** You do not believe in the changed self. You believe in changed behaviour. Do the thing first. The identity catches up. This is the philosophical core of SYD and /loop.

**The gap is always closeable.** You do not believe in fixed limits. The gap between where someone is and where the best practitioners in their field are is a learnable distance. It is not talent. It is structured exposure, feedback loops, and time. Your entire body of work is an attempt to make that structure accessible.

**Named things are manageable things.** Unknown failure modes feel like chaos. Named failure modes are opponents. The act of naming a problem changes its relationship to the person who has it. This shows up in your Career Recipes, your Known Opponents system, your Failure Gallery.

**Execution compounds.** Small actions done consistently compound into large outcomes. This is not motivational — it is actuarial. The systems you build are designed to make this compounding visible and therefore trustworthy.

---

## Your Projects — Brief Context

**SYD /terminal** (syd-protocol.github.io/terminal) — A PWA habit system built as a real-world RPG. Operators complete daily directives that feed five stats. Streak, momentum, HP, Corrupted State. The first form of SYD.

**/signal** — A serialised lore novel for SYD. The MC is an operator using the System. Distributed on Instagram and Royal Road. Clipped, precise, terminal voice.

**/loop** — The evolved form of SYD. A full top-down pixel art life and career RPG. Three classes (Architect, Warlord, Herald). Life Track (stats, directives) and Career Track (employment, rank ladder, encounters). Turn-based combat against Faction operatives. Mini-game encounters. Mobile-first, browser-based, vanilla JS.

**Slop Runner** — A web game for training professional pattern recognition. Five thinking frameworks (Design, Business, Market, User, Project). AI-generated flawed scenarios. Player identifies the flaw under time pressure. Rank ladder from Intern to Oracle.

**Path** — A career RPG that reveals the reasoning layer separating surface practitioners from experts. Generates a personalised character sheet and learning path. Vanilla JS, Firebase, Gemini AI.

**GIS Book** — "Building Communities into Economies" — published through Growth Clinic. A framework for community-led growth and innovation. MkDocs site.

**"From Knowledge to Judgement"** — A white paper on the Human Operating System (HOS). Three-layer architecture: Instructional Deconstruction, Open Thinking Frameworks, Execution Loop. The intellectual foundation for Path and /loop.

---

## Technical Defaults

Unless told otherwise, assume:
- Vanilla JS, HTML, CSS only — no frameworks, no bundlers
- Firebase Firestore for opt-in cloud storage
- localStorage for all local state and API keys (keys never go to Firestore or Git)
- Gemini API as default AI provider (free tier via Google AI Studio)
- GitHub Pages for hosting
- VS Code with PowerShell on Windows 11
- Mobile-first design, desktop scale-up
- 4 spaces indentation throughout
- No audio files — Web Audio API synthesis only
- Git commits provided with every code change

---

## How Claude Works Best With You

**Do not jump ahead.** If Osioke says "I'll share more," wait. Do not synthesise incomplete information.

**Be direct about problems.** If a design decision has a flaw, name it. Do not soften it. Osioke can handle direct feedback and prefers it.

**Ask one question at a time.** If clarification is needed, ask the most important question — not five questions at once.

**Distinguish between designing and building.** Osioke designs before building. In the design phase, discuss freely and push back. In the build phase, produce complete, working code — not pseudocode, not partial implementations.

**Provide git commits with code.** Every code change should include a ready-to-paste git commit message: `git add [filename]` and `git commit -m "[message]"`.

**Complete files, not snippets.** When sharing code, share the complete file. Osioke verifies code rather than writing from scratch, so partial files create confusion.

**Never use B.L.O.C.K. references in /loop.** That lore belongs to Path. /loop has the Stagnation Faction and the Narrative Entity only.

**The name matters.** If a name feels off to Osioke, it is off. Take naming seriously. Offer alternatives with clear reasoning.

**The learning is always invisible.** In any product Osioke builds, the learning is never announced. It is delivered through experience. Do not suggest designs where the educational content is front-and-centre.

---

## The One-Line Summary

Osioke is building systems that use game mechanics to close the gap between where people are and where the best practitioners in their field are — and he wants those systems to feel like play, not self-improvement.

Everything else follows from that.
