/* ── boot.js ─────────────────────────────────────────────────────────
   Full onboarding terminal. Runs once on first visit (sessionStorage).
   Skipped on return visits if class is already set.

   Flow:
     Opening cursor blink (1.2s)
     → Phase 1: Boot lines auto-type → [ CONTINUE ]
     → Phase 2: Name input (confirmed by button / Enter)
                → identity confirmed lines → [ CONTINUE ]
     → Phase 3: Class select (clear screen, user taps card)
                → class confirmed lines → [ CONTINUE ]
     → Phase 4: Briefing lines auto-type → [ CONTINUE ]
     → Fade out → world

   [ CONTINUE ] gates use _waitForContinue() — tap overlay or press Enter.
   Name input and class selection have their own confirm actions.

   Public API:
     Boot.play(onComplete)
     Boot.skip()
──────────────────────────────────────────────────────────────────── */

const Boot = (() => {

    /* ── Timing constants ───────────────────────────────────────── */
    const CHAR_FAST  = 14;
    const CHAR_SLOW  = 24;
    const CHAR_TITLE = 65;
    const LINE_GAP   = 260;

    /* ── Class definitions ──────────────────────────────────────── */
    const CLASSES = {
        A: {
            id: 'architect', key: 'A', name: 'ARCHITECT',
            desc: 'Engineers. Developers. Builders. Technical founders. You solve with systems.',
            colour: '#1A6BFF',
            ranks: ['Apprentice','Coder','Engineer','Senior Engineer',
                    'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        W: {
            id: 'warlord', key: 'W', name: 'WARLORD',
            desc: 'Managers. Directors. Ops leads. Team builders. You win through people.',
            colour: '#9B5DE5',
            ranks: ['Intern','Coordinator','Manager','Senior Manager',
                    'Director','VP','General','Warlord'],
        },
        H: {
            id: 'herald', key: 'H', name: 'HERALD',
            desc: 'Marketers. Strategists. Writers. Communicators. You win through words.',
            colour: '#E63B2E',
            ranks: ['Intern','Associate','Specialist','Senior Specialist',
                    'Lead','Head','Chief','Grand Herald'],
        },
    };

    /* ── Runtime state ──────────────────────────────────────────── */
    let _overlay    = null;
    let _inner      = null;
    let _lines      = null;
    let _onComplete = null;
    let _locked     = false;    /* true while text is typing */
    let _advanceKey = null;     /* keydown listener for current gate */
    let _advanceTap = null;     /* pointerdown listener for current gate */

    /* ── Build overlay DOM ──────────────────────────────────────── */
    function _build() {
        _overlay = document.createElement('div');
        _overlay.id = 'boot-overlay';
        _overlay.innerHTML = `
            <div id="boot-inner">
                <div id="boot-lines"></div>
                <div id="boot-input-area"></div>
            </div>`;
        document.body.appendChild(_overlay);
        _inner = _overlay.querySelector('#boot-inner');
        _lines = _overlay.querySelector('#boot-lines');
    }

    /* ── Scroll to bottom ───────────────────────────────────────── */
    function _scroll() {
        _lines.scrollTop = _lines.scrollHeight;
    }

    /* ── Clear input area ───────────────────────────────────────── */
    function _clearInput() {
        const a = _overlay.querySelector('#boot-input-area');
        if (a) a.innerHTML = '';
    }

    /* ── Smooth screen transition ───────────────────────────────── */
    /*
       Fades the inner content to opacity 0, clears it,
       then fades back in. Used between screens so there's
       no jarring cut.
    */
    function _clearScreen(onDone) {
        _inner.style.transition = 'opacity 0.28s ease';
        _inner.style.opacity    = '0';
        setTimeout(() => {
            _lines.innerHTML = '';
            _clearInput();
            _inner.style.opacity = '1';
            setTimeout(() => {
                _inner.style.transition = '';
                if (onDone) onDone();
            }, 220);
        }, 290);
    }

    /* ── Add a single line with typewriter effect ───────────────── */
    function _addLine(text, cls, speed, onDone) {
        const p = document.createElement('p');
        p.className = `boot-line ${cls || ''}`;
        _lines.appendChild(p);
        _scroll();

        if (!text) {
            p.innerHTML = '&nbsp;';
            if (onDone) setTimeout(onDone, 40);
            return p;
        }

        _locked = true;
        let i = 0;
        function step() {
            if (i < text.length) {
                p.textContent += text[i++];
                _scroll();
                setTimeout(step, speed || CHAR_FAST);
            } else {
                _locked = false;
                if (onDone) onDone();
            }
        }
        step();
        return p;
    }

    /* ── Add multiple lines in sequence ────────────────────────── */
    function _addLines(items, onAllDone) {
        let idx = 0;
        function next() {
            if (idx >= items.length) { if (onAllDone) onAllDone(); return; }
            const item = items[idx++];
            _addLine(item.text, item.cls, item.speed, () => {
                setTimeout(next, item.gap ?? LINE_GAP);
            });
        }
        next();
    }

    /* ── Wait for tap or Enter to continue ─────────────────────── */
    /*
       Shows the [ CONTINUE ] prompt.
       Listens for tap on overlay (not on inputs/buttons) or Enter/Space.
       Removes listeners and prompt when triggered, then calls onContinue.
    */
    function _waitForContinue(onContinue) {
        /* Don't show prompt until typing is done */
        const tryShow = () => {
            if (_locked) { setTimeout(tryShow, 80); return; }
            _showContinuePrompt(onContinue);
        };
        tryShow();
    }

    function _showContinuePrompt(onContinue) {
        const p = document.createElement('p');
        p.className  = 'boot-line boot-prompt';
        p.textContent = '[ PRESS ENTER OR TAP TO CONTINUE ▮ ]';
        _lines.appendChild(p);
        _scroll();

        function _cleanup() {
            window.removeEventListener('keydown', _advanceKey);
            _overlay.removeEventListener('pointerdown', _advanceTap);
            _advanceKey = null;
            _advanceTap = null;
            p.remove();
        }

        _advanceKey = (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            _cleanup();
            onContinue();
        };

        _advanceTap = (e) => {
            /* Don't fire on interactive elements */
            if (e.target.tagName === 'INPUT'  ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('#boot-input-area')) return;
            _cleanup();
            onContinue();
        };

        window.addEventListener('keydown', _advanceKey);
        _overlay.addEventListener('pointerdown', _advanceTap);
    }

    /* ── Opening cursor blink ───────────────────────────────────── */
    function _openingCursor(onDone) {
        const cursor = document.createElement('div');
        cursor.id = 'boot-opening-cursor';
        cursor.textContent = '▮';
        _lines.appendChild(cursor);

        setTimeout(() => {
            cursor.style.transition = 'opacity 0.2s ease';
            cursor.style.opacity    = '0';
            setTimeout(() => {
                cursor.remove();
                if (onDone) onDone();
            }, 220);
        }, 1200);
    }

    /* ── PHASE 1: BOOT ──────────────────────────────────────────── */
    function _phaseBoot() {
        _addLines([
            { text: '',                                  cls: 'boot-blank',         speed: 0,          gap: 0   },
            { text: '/loop  v0.1.0',                     cls: 'boot-title',         speed: CHAR_TITLE,  gap: 420 },
            { text: '',                                  cls: 'boot-blank',         speed: 0,          gap: 0   },
            { text: '[ INITIALISING NEURAL LINK ]',      cls: 'boot-cyan',          speed: CHAR_FAST,   gap: 280 },
            { text: '[ SCANNING OPERATIVE PROFILE... ]', cls: 'boot-dim',           speed: CHAR_FAST,   gap: 480 },
            { text: '[ STAGNATION FACTION: DETECTED ]',  cls: 'boot-warning',       speed: CHAR_FAST,   gap: 260 },
            { text: '[ THREAT LEVEL: ELEVATED ]',        cls: 'boot-warning',       speed: CHAR_FAST,   gap: 480 },
            { text: '',                                  cls: 'boot-blank',         speed: 0,          gap: 0   },
            { text: '[ LIFE TRACK: LOADING ]',           cls: 'boot-dim',           speed: CHAR_FAST,   gap: 160 },
            { text: '[ CAREER TRACK: LOADING ]',         cls: 'boot-dim',           speed: CHAR_FAST,   gap: 160 },
            { text: '[ DIRECTIVE ENGINE: STANDBY ]',     cls: 'boot-dim',           speed: CHAR_FAST,   gap: 380 },
            { text: '',                                  cls: 'boot-blank',         speed: 0,          gap: 0   },
            { text: '[ SYSTEM READY ]',                  cls: 'boot-cyan boot-large', speed: CHAR_SLOW, gap: 0   },
        ], () => {
            _waitForContinue(() => _phaseIdentity());
        });
    }

    /* ── PHASE 2: IDENTITY ──────────────────────────────────────── */
    function _phaseIdentity() {
        _addLines([
            { text: '',                                    cls: 'boot-blank', speed: 0,         gap: 0   },
            { text: '[ OPERATIVE IDENTIFICATION REQUIRED ]', cls: 'boot-cyan',  speed: CHAR_SLOW, gap: 280 },
            { text: 'ENTER YOUR OPERATIVE DESIGNATION.',   cls: 'boot-dim',   speed: CHAR_FAST, gap: 0   },
        ], () => {
            setTimeout(() => _showNameInput(), 180);
        });
    }

    function _showNameInput() {
        const area = _overlay.querySelector('#boot-input-area');
        area.innerHTML = `
            <div class="boot-input-row">
                <span class="boot-input-prefix">DESIGNATION:</span>
                <input id="boot-name-input" class="boot-name-input"
                       type="text" maxlength="20"
                       autocomplete="off" autocorrect="off"
                       spellcheck="false" placeholder="TYPE YOUR NAME"
                       aria-label="Enter operative name" />
                <button id="boot-name-confirm" class="boot-confirm-btn">CONFIRM ▶</button>
            </div>`;

        const input   = area.querySelector('#boot-name-input');
        const confirm = area.querySelector('#boot-name-confirm');
        setTimeout(() => input.focus(), 50);

        function _submit() {
            const name = input.value.trim().toUpperCase();
            if (!name) {
                input.classList.add('boot-input-error');
                setTimeout(() => input.classList.remove('boot-input-error'), 600);
                return;
            }
            _clearInput();
            _confirmIdentity(name);
        }

        confirm.addEventListener('click', _submit);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') _submit(); });
    }

    function _confirmIdentity(name) {
        if (typeof G !== 'undefined') G.player.name = name;

        _addLines([
            { text: `DESIGNATION: ${name}`,     cls: 'boot-input-echo',      speed: CHAR_FAST,  gap: 200 },
            { text: '[ IDENTITY CONFIRMED ]',   cls: 'boot-cyan',            speed: CHAR_SLOW,  gap: 180 },
            { text: `WELCOME, ${name}.`,        cls: 'boot-gold boot-large', speed: CHAR_SLOW,  gap: 0   },
        ], () => {
            _waitForContinue(() => {
                _clearScreen(() => _phaseClass(name));
            });
        });
    }

    /* ── PHASE 3: CLASS ─────────────────────────────────────────── */
    function _phaseClass(name) {
        _addLines([
            { text: '[ CLASS ASSIGNMENT ]',              cls: 'boot-cyan',    speed: CHAR_SLOW,  gap: 200 },
            { text: 'CHOOSE YOUR OPERATIVE CLASS.',      cls: 'boot-dim',     speed: CHAR_FAST,  gap: 100 },
            { text: 'ONE CHOICE. PERMANENT.',            cls: 'boot-warning', speed: CHAR_SLOW,  gap: 0   },
        ], () => {
            setTimeout(() => _showClassSelect(name), 240);
        });
    }

    function _showClassSelect(name) {
        const area = _overlay.querySelector('#boot-input-area');
        area.innerHTML = `
            <div class="boot-class-grid">
                ${Object.values(CLASSES).map(cls => `
                    <button class="boot-class-btn" data-class="${cls.key}"
                            style="--cls-colour:${cls.colour}">
                        <span class="boot-class-key">[ ${cls.key} ]</span>
                        <span class="boot-class-name">${cls.name}</span>
                        <span class="boot-class-desc">${cls.desc}</span>
                    </button>
                `).join('')}
            </div>`;

        function _pick(key) {
            window.removeEventListener('keydown', _onKey);
            _clearInput();
            _confirmClass(CLASSES[key], name);
        }

        function _onKey(e) {
            const k = e.key.toUpperCase();
            if (CLASSES[k]) _pick(k);
        }
        window.addEventListener('keydown', _onKey);

        area.querySelectorAll('.boot-class-btn').forEach(btn => {
            btn.addEventListener('click', () => _pick(btn.dataset.class));
        });
    }

    function _confirmClass(cls, name) {
        if (typeof G !== 'undefined') {
            G.player.class = cls.id;
            G.player.rank  = cls.ranks[0];
        }

        _addLines([
            { text: `[ ${cls.name} ] CONFIRMED.`, cls: 'boot-large',  speed: CHAR_SLOW, gap: 180 },
            { text: `RANK: ${cls.ranks[0]}`,      cls: 'boot-dim',    speed: CHAR_FAST, gap: 160 },
            { text: 'CLASS ABILITIES UNLOCK AT RANK 2.', cls: 'boot-dim', speed: CHAR_FAST, gap: 0 },
        ], () => {
            /* Colour the class confirmed line */
            const all  = _lines.querySelectorAll('.boot-line');
            const line = all[all.length - 3];
            if (line) line.style.color = cls.colour;

            _waitForContinue(() => {
                _clearScreen(() => _phaseBrief(name, cls));
            });
        });
    }

    /* ── PHASE 4: BRIEFING ──────────────────────────────────────── */
    function _phaseBrief(name, cls) {
        _addLines([
            { text: '[ SITUATION REPORT ]',                           cls: 'boot-cyan',    speed: CHAR_SLOW,  gap: 240 },
            { text: '',                                               cls: 'boot-blank',   speed: 0,          gap: 0   },
            { text: 'THE LOOP IS A WORLD RUNNING IN PARALLEL.',       cls: 'boot-dim',     speed: CHAR_FAST,  gap: 130 },
            { text: 'EVERY PERSON IN IT IS BUILDING SOMETHING.',      cls: 'boot-dim',     speed: CHAR_FAST,  gap: 130 },
            { text: 'MOST NEVER FINISH. THE STAGNATION FACTION',      cls: 'boot-dim',     speed: CHAR_FAST,  gap: 80  },
            { text: 'ENSURES THAT. IT FEEDS ON INACTION.',            cls: 'boot-dim',     speed: CHAR_FAST,  gap: 240 },
            { text: 'YOU ARE NOT MOST PEOPLE.',                       cls: 'boot-gold',    speed: CHAR_SLOW,  gap: 260 },
            { text: '',                                               cls: 'boot-blank',   speed: 0,          gap: 0   },
            { text: '[ RULES OF ENGAGEMENT ]',                        cls: 'boot-cyan',    speed: CHAR_SLOW,  gap: 200 },
            { text: 'COMPLETE DAILY DIRECTIVES. YOUR STATS GROW.',    cls: 'boot-dim',     speed: CHAR_FAST,  gap: 120 },
            { text: 'WIN ENCOUNTERS. YOUR CAREER ADVANCES.',          cls: 'boot-dim',     speed: CHAR_FAST,  gap: 120 },
            { text: 'MISS DAYS. HP DROPS. MOMENTUM BREAKS.',          cls: 'boot-dim',     speed: CHAR_FAST,  gap: 120 },
            { text: 'HP HITS ZERO. CORRUPTED STATE. EVERYTHING COSTS MORE.', cls: 'boot-warning', speed: CHAR_FAST, gap: 260 },
            { text: '',                                               cls: 'boot-blank',   speed: 0,          gap: 0   },
            { text: '[ FIELD GUIDE ]',                                cls: 'boot-cyan',    speed: CHAR_SLOW,  gap: 180 },
            { text: 'TAP ANYWHERE TO MOVE.',                          cls: 'boot-dim',     speed: CHAR_FAST,  gap: 100 },
            { text: 'TAP AN NPC TO TALK. THEY REMEMBER YOU.',         cls: 'boot-dim',     speed: CHAR_FAST,  gap: 100 },
            { text: 'TAP THE LAPTOP. ACCESS YOUR CAREER BOARD.',      cls: 'boot-dim',     speed: CHAR_FAST,  gap: 100 },
            { text: 'FIND SKILL SCROLLS. READ THEM. UNLOCK POWER.',   cls: 'boot-dim',     speed: CHAR_FAST,  gap: 100 },
            { text: 'DRIFTERS PATROL AT NIGHT. ENGAGE OR SLIP PAST.', cls: 'boot-dim',     speed: CHAR_FAST,  gap: 240 },
            { text: '',                                               cls: 'boot-blank',   speed: 0,          gap: 0   },
            { text: '[ SYSTEM WINDOW: TAP ⊞  TOP RIGHT ]',           cls: 'boot-gold',    speed: CHAR_SLOW,  gap: 130 },
            { text: 'YOUR STATS. HP. DIRECTIVES. ALL OF IT.',         cls: 'boot-gold',    speed: CHAR_FAST,  gap: 0   },
        ], () => {
            _waitForContinue(() => {
                _addLines([
                    { text: '',                               cls: 'boot-blank',         speed: 0,         gap: 0 },
                    { text: `[ ENTERING THE LOOP, ${name}. ]`, cls: 'boot-cyan boot-large', speed: CHAR_SLOW, gap: 0 },
                ], () => {
                    setTimeout(() => _fadeOut(), 800);
                });
            });
        });
    }

    /* ── Fade out ───────────────────────────────────────────────── */
    function _fadeOut() {
        _overlay.classList.add('boot-fade-out');
        _overlay.addEventListener('transitionend', () => {
            _overlay.remove();
            sessionStorage.setItem('boot-played', '1');
            if (_onComplete) _onComplete();
        }, { once: true });
    }

    /* ── Public API ─────────────────────────────────────────────── */
    function play(onComplete) {
        _onComplete = onComplete;

        const alreadyPlayed = sessionStorage.getItem('boot-played');
        const hasClass      = typeof G !== 'undefined' && G.player.class;
        if (alreadyPlayed && hasClass) { if (onComplete) onComplete(); return; }

        _build();

        /* Opening cursor blink → then boot phase */
        _openingCursor(() => _phaseBoot());
    }

    function skip() {
        if (_overlay) _overlay.remove();
        sessionStorage.setItem('boot-played', '1');
        if (_onComplete) _onComplete();
    }

    return { play, skip };

})();