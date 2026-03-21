/* ── boot.js ─────────────────────────────────────────────────────────
   Full onboarding terminal. Runs once on first visit (sessionStorage).
   Skipped on return visits unless class is missing.

   Four phases — state machine:
     PHASE_BOOT     — auto-types system lines, waits for tap/Enter
     PHASE_IDENTITY — user enters their operative name
     PHASE_CLASS    — user selects Architect / Warlord / Herald
     PHASE_BRIEF    — key game info types out, then fades to world

   Public API:
     Boot.play(onComplete)  — runs the sequence, calls onComplete when done
     Boot.skip()            — clears state, calls onComplete immediately
──────────────────────────────────────────────────────────────────── */

const Boot = (() => {

    /* ── Constants ──────────────────────────────────────────────── */
    const CHAR_FAST   = 14;   /* ms/char — SYD lines */
    const CHAR_SLOW   = 22;   /* ms/char — important lines */
    const CHAR_TITLE  = 60;   /* ms/char — title, dramatic */
    const LINE_GAP    = 320;  /* ms pause between line groups */

    const CLASSES = {
        A: {
            id:     'architect',
            key:    'A',
            name:   'ARCHITECT',
            desc:   'Technical. Precision. Systems. Pattern recognition.',
            colour: '#1A6BFF',
            ranks:  ['Apprentice','Coder','Engineer','Senior Engineer',
                     'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        W: {
            id:     'warlord',
            key:    'W',
            name:   'WARLORD',
            desc:   'Command. People. Coordination. Battlefield control.',
            colour: '#9B5DE5',
            ranks:  ['Intern','Coordinator','Manager','Senior Manager',
                     'Director','VP','General','Warlord'],
        },
        H: {
            id:     'herald',
            key:    'H',
            name:   'HERALD',
            desc:   'Influence. Information. Persuasion. Words as weapons.',
            colour: '#E63B2E',
            ranks:  ['Intern','Associate','Specialist','Senior Specialist',
                     'Lead','Head','Chief','Grand Herald'],
        },
    };

    /* ── State ──────────────────────────────────────────────────── */
    let _overlay    = null;
    let _lines      = null;
    let _onComplete = null;
    let _phase      = 'boot';
    let _locked     = false;   /* true while typing — blocks advance */

    /* ── DOM helpers ─────────────────────────────────────────────── */
    function _buildOverlay() {
        _overlay = document.createElement('div');
        _overlay.id = 'boot-overlay';
        _overlay.innerHTML = `
            <div id="boot-inner">
                <div id="boot-lines"></div>
                <div id="boot-input-area"></div>
            </div>`;
        document.body.appendChild(_overlay);
        _lines = _overlay.querySelector('#boot-lines');
    }

    function _addLine(text, cls, speed, onDone) {
        const p = document.createElement('p');
        p.className = `boot-line ${cls || ''}`;
        _lines.appendChild(p);
        _scrollBottom();

        if (!text) {
            p.innerHTML = '&nbsp;';
            if (onDone) setTimeout(onDone, 60);
            return p;
        }

        _locked = true;
        let i = 0;
        function step() {
            if (i < text.length) {
                p.textContent += text[i++];
                _scrollBottom();
                setTimeout(step, speed || CHAR_FAST);
            } else {
                _locked = false;
                if (onDone) onDone();
            }
        }
        step();
        return p;
    }

    function _addLines(items, onAllDone) {
        /* items: [{text, cls, speed, gap}] */
        let idx = 0;
        function next() {
            if (idx >= items.length) {
                if (onAllDone) onAllDone();
                return;
            }
            const item = items[idx++];
            const gap  = item.gap ?? LINE_GAP;
            _addLine(item.text, item.cls, item.speed, () => {
                setTimeout(next, gap);
            });
        }
        next();
    }

    function _addPrompt(text) {
        /* Blinking continue prompt */
        const p = document.createElement('p');
        p.className  = 'boot-line boot-prompt';
        p.id         = 'boot-continue-prompt';
        p.textContent = text;
        _lines.appendChild(p);
        _scrollBottom();
        return p;
    }

    function _scrollBottom() {
        _lines.scrollTop = _lines.scrollHeight;
    }

    function _clearInputArea() {
        const area = _overlay.querySelector('#boot-input-area');
        if (area) area.innerHTML = '';
    }

    /* ── Phase 1: BOOT ───────────────────────────────────────────── */
    function _phaseBoot() {
        _phase = 'boot';

        _addLines([
            { text: '',                                    cls: 'boot-blank',   speed: 0,          gap: 0 },
            { text: '/loop  v0.1.0',                       cls: 'boot-title',   speed: CHAR_TITLE,  gap: 400 },
            { text: '',                                    cls: 'boot-blank',   speed: 0,          gap: 0 },
            { text: '[ INITIALISING NEURAL LINK ]',        cls: 'boot-cyan',    speed: CHAR_FAST,   gap: 300 },
            { text: '[ SCANNING OPERATIVE PROFILE... ]',   cls: 'boot-dim',     speed: CHAR_FAST,   gap: 500 },
            { text: '[ STAGNATION FACTION: DETECTED ]',    cls: 'boot-warning', speed: CHAR_FAST,   gap: 280 },
            { text: '[ THREAT LEVEL: ELEVATED ]',          cls: 'boot-warning', speed: CHAR_FAST,   gap: 500 },
            { text: '',                                    cls: 'boot-blank',   speed: 0,          gap: 0 },
            { text: '[ LIFE TRACK: LOADING ]',             cls: 'boot-dim',     speed: CHAR_FAST,   gap: 180 },
            { text: '[ CAREER TRACK: LOADING ]',           cls: 'boot-dim',     speed: CHAR_FAST,   gap: 180 },
            { text: '[ DIRECTIVE ENGINE: STANDBY ]',       cls: 'boot-dim',     speed: CHAR_FAST,   gap: 400 },
            { text: '',                                    cls: 'boot-blank',   speed: 0,          gap: 0 },
            { text: '[ SYSTEM READY ]',                    cls: 'boot-cyan boot-large', speed: CHAR_SLOW, gap: 0 },
        ], () => {
            setTimeout(() => {
                _addPrompt('[ PRESS ENTER OR TAP TO CONTINUE ▮ ]');
                _phase = 'waiting-boot';
            }, 500);
        });
    }

    /* ── Phase 2: IDENTITY ───────────────────────────────────────── */
    function _phaseIdentity() {
        _phase = 'identity';

        /* Remove the continue prompt */
        const prompt = document.getElementById('boot-continue-prompt');
        if (prompt) prompt.remove();

        _addLines([
            { text: '',                                       cls: 'boot-blank',  speed: 0,         gap: 0 },
            { text: '[ OPERATIVE IDENTIFICATION REQUIRED ]',  cls: 'boot-cyan',   speed: CHAR_SLOW, gap: 300 },
            { text: 'ENTER YOUR OPERATIVE DESIGNATION.',      cls: 'boot-dim',    speed: CHAR_FAST, gap: 0 },
        ], () => {
            setTimeout(() => _showNameInput(), 200);
        });
    }

    function _showNameInput() {
        const area = _overlay.querySelector('#boot-input-area');
        area.innerHTML = `
            <div class="boot-input-row">
                <span class="boot-input-prefix">DESIGNATION: </span>
                <input id="boot-name-input"
                       class="boot-name-input"
                       type="text"
                       maxlength="20"
                       autocomplete="off"
                       autocorrect="off"
                       spellcheck="false"
                       placeholder="TYPE YOUR NAME"
                       aria-label="Enter your operative name" />
                <button id="boot-name-confirm" class="boot-confirm-btn">CONFIRM ▶</button>
            </div>`;

        const input   = area.querySelector('#boot-name-input');
        const confirm = area.querySelector('#boot-name-confirm');

        /* Focus the input */
        setTimeout(() => input.focus(), 50);

        function _confirmName() {
            const name = input.value.trim().toUpperCase();
            if (!name) {
                input.classList.add('boot-input-error');
                setTimeout(() => input.classList.remove('boot-input-error'), 600);
                return;
            }
            _clearInputArea();
            _confirmIdentity(name);
        }

        confirm.addEventListener('click', _confirmName);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') _confirmName();
        });
    }

    function _confirmIdentity(name) {
        /* Store name */
        if (typeof G !== 'undefined') G.player.name = name;

        _addLines([
            { text: `DESIGNATION: ${name}`,              cls: 'boot-input-echo', speed: CHAR_FAST,  gap: 200 },
            { text: '[ IDENTITY CONFIRMED ]',            cls: 'boot-cyan',       speed: CHAR_SLOW,  gap: 200 },
            { text: `WELCOME, ${name}.`,                 cls: 'boot-gold boot-large', speed: CHAR_SLOW, gap: 0 },
        ], () => {
            setTimeout(() => _phaseClass(name), 500);
        });
    }

    /* ── Phase 3: CLASS ──────────────────────────────────────────── */
    function _phaseClass(name) {
        _phase = 'class';

        _addLines([
            { text: '',                                   cls: 'boot-blank',  speed: 0,         gap: 0 },
            { text: '[ CLASS ASSIGNMENT ]',               cls: 'boot-cyan',   speed: CHAR_SLOW, gap: 200 },
            { text: 'SELECT YOUR OPERATIVE CLASS.',       cls: 'boot-dim',    speed: CHAR_FAST, gap: 200 },
            { text: 'THIS DETERMINES YOUR CAREER TRACK,', cls: 'boot-dim',   speed: CHAR_FAST, gap: 80 },
            { text: 'ENCOUNTER TYPES, AND ABILITIES.',    cls: 'boot-dim',    speed: CHAR_FAST, gap: 300 },
            { text: 'CHOOSE ONCE.',                       cls: 'boot-warning',speed: CHAR_SLOW, gap: 0 },
        ], () => {
            setTimeout(() => _showClassSelect(name), 300);
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

        /* Keyboard shortcuts */
        function _onKey(e) {
            const key = e.key.toUpperCase();
            if (CLASSES[key]) {
                window.removeEventListener('keydown', _onKey);
                _clearInputArea();
                _confirmClass(CLASSES[key], name);
            }
        }
        window.addEventListener('keydown', _onKey);

        /* Tap/click */
        area.querySelectorAll('.boot-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.class;
                window.removeEventListener('keydown', _onKey);
                _clearInputArea();
                _confirmClass(CLASSES[key], name);
            });
        });
    }

    function _confirmClass(cls, name) {
        /* Store class */
        if (typeof G !== 'undefined') {
            G.player.class = cls.id;
            G.player.rank  = cls.ranks[0];
        }

        _addLines([
            { text: `[ ${cls.name} ] SELECTED.`,          cls: 'boot-large',  speed: CHAR_SLOW,  gap: 200,
              style: `color:${cls.colour}` },
            { text: `RANK: ${cls.ranks[0]}`,              cls: 'boot-dim',    speed: CHAR_FAST,  gap: 200 },
            { text: `CLASS ABILITIES: UNLOCK AT RANK 2.`, cls: 'boot-dim',    speed: CHAR_FAST,  gap: 0 },
        ], () => {
            /* Apply colour to class line */
            const lines = _lines.querySelectorAll('.boot-line');
            const classLine = lines[lines.length - 3];
            if (classLine) classLine.style.color = cls.colour;
            setTimeout(() => _phaseBrief(name, cls), 500);
        });
    }

    /* ── Phase 4: BRIEFING ───────────────────────────────────────── */
    function _phaseBrief(name, cls) {
        _phase = 'brief';

        _addLines([
            { text: '',                                        cls: 'boot-blank',   speed: 0,         gap: 0 },
            { text: '[ MISSION BRIEFING ]',                    cls: 'boot-cyan',    speed: CHAR_SLOW,  gap: 300 },
            { text: 'THE STAGNATION FACTION FEEDS ON INACTION.', cls: 'boot-dim',   speed: CHAR_FAST,  gap: 200 },
            { text: 'COMPLETE DAILY DIRECTIVES. BUILD YOUR STATS.', cls: 'boot-dim', speed: CHAR_FAST, gap: 200 },
            { text: 'WIN ENCOUNTERS. RANK UP YOUR CAREER.',    cls: 'boot-dim',     speed: CHAR_FAST,  gap: 200 },
            { text: 'LET HP REACH ZERO. YOU ENTER CORRUPTED STATE.', cls: 'boot-warning', speed: CHAR_FAST, gap: 300 },
            { text: '',                                        cls: 'boot-blank',   speed: 0,         gap: 0 },
            { text: '[ YOUR SYSTEM WINDOW TRACKS ALL PROGRESS. ]', cls: 'boot-gold', speed: CHAR_SLOW, gap: 200 },
            { text: '[ TAP ⊞ — TOP RIGHT — TO ACCESS IT ANY TIME. ]', cls: 'boot-gold', speed: CHAR_SLOW, gap: 500 },
            { text: '',                                        cls: 'boot-blank',   speed: 0,         gap: 0 },
            { text: `[ ENTERING THE LOOP, ${name}. ]`,        cls: 'boot-cyan boot-large', speed: CHAR_SLOW, gap: 0 },
        ], () => {
            setTimeout(() => _fadeOut(), 900);
        });
    }

    /* ── Fade out and complete ───────────────────────────────────── */
    function _fadeOut() {
        _overlay.classList.add('boot-fade-out');
        _overlay.addEventListener('transitionend', () => {
            _overlay.remove();
            sessionStorage.setItem('boot-played', '1');
            if (_onComplete) _onComplete();
        }, { once: true });
    }

    /* ── Advance on tap / Enter ─────────────────────────────────── */
    function _bindAdvance() {
        function _onAdvance(e) {
            /* Only advance when waiting for input, not during typing */
            if (_phase !== 'waiting-boot') return;
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (_locked) return;

            /* Consume event */
            e.preventDefault();
            window.removeEventListener('keydown', _onAdvance);
            _overlay.removeEventListener('pointerdown', _onAdvance);

            _phaseIdentity();
        }

        window.addEventListener('keydown', _onAdvance);
        _overlay.addEventListener('pointerdown', e => {
            /* Don't trigger advance when tapping input fields or buttons */
            if (e.target.tagName === 'INPUT'  ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('.boot-class-grid') ||
                e.target.closest('.boot-input-row')) return;
            _onAdvance(e);
        });
    }

    /* ── Public API ─────────────────────────────────────────────── */
    function play(onComplete) {
        _onComplete = onComplete;

        /* Skip if already played AND class is chosen */
        const alreadyPlayed = sessionStorage.getItem('boot-played');
        const hasClass      = typeof G !== 'undefined' && G.player.class;
        if (alreadyPlayed && hasClass) {
            if (onComplete) onComplete();
            return;
        }

        _buildOverlay();
        _bindAdvance();
        _phaseBoot();
    }

    function skip() {
        if (_overlay) _overlay.remove();
        sessionStorage.setItem('boot-played', '1');
        if (_onComplete) _onComplete();
    }

    return { play, skip };

})();