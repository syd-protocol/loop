/* ── system-window.js ────────────────────────────────────────────────
   Step 3 (reworked). Owns the System Window overlay.

   Rework goals:
   - Typewriter effect on all SYD lines
   - Stat bars with animated count-up values
   - CRT scanline texture on panel
   - Pulsing glow on stat bar fills
   - Corner bracket decorations
   - Cursor blink on last SYD line
   - Live, hi-tech feel — not a static painting

   Public API:
     SystemWindow.init()    — call once after Stats.init()
     SystemWindow.open()    — show panel with full animation sequence
     SystemWindow.close()   — hide panel
     SystemWindow.refresh() — re-render current data
     SystemWindow.isOpen()  — returns boolean
──────────────────────────────────────────────────────────────────── */

const SystemWindow = (() => {

    /* ── Class definitions ──────────────────────────────────────── */
    const CLASSES = {
        architect: {
            id:     'architect',
            name:   'ARCHITECT',
            desc:   'Technical class. Precision. Systems. Pattern recognition.',
            colour: '#1A6BFF',
            icon:   '⬡',
            ranks:  ['Apprentice','Coder','Engineer','Senior Engineer',
                     'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        warlord: {
            id:     'warlord',
            name:   'WARLORD',
            desc:   'Command class. People. Coordination. Battlefield control.',
            colour: '#9B5DE5',
            icon:   '◈',
            ranks:  ['Intern','Coordinator','Manager','Senior Manager',
                     'Director','VP','General','Warlord'],
        },
        herald: {
            id:     'herald',
            name:   'HERALD',
            desc:   'Influence class. Information. Persuasion. Words as weapons.',
            colour: '#E63B2E',
            icon:   '◎',
            ranks:  ['Intern','Associate','Specialist','Senior Specialist',
                     'Lead','Head','Chief','Grand Herald'],
        },
    };

    /* ── Private state ──────────────────────────────────────────── */
    let _panel       = null;
    let _body        = null;
    let _isOpen      = false;
    let _classChosen = false;
    let _typeQueue   = [];   // pending typewriter jobs
    let _typing      = false;

    /* ── SYD transmission lines ─────────────────────────────────── */
    const SYD_GREETINGS = [
        '[ SYSTEM ONLINE ]',
        '[ NEURAL LINK ESTABLISHED ]',
        '[ SIGNAL ACQUIRED ]',
        '[ OPERATIVE LOCATED ]',
    ];
    let _greetingIndex = 0;

    function _nextGreeting() {
        const g = SYD_GREETINGS[_greetingIndex % SYD_GREETINGS.length];
        _greetingIndex++;
        return g;
    }

    /* ── Typewriter engine ──────────────────────────────────────── */
    /*
       Queues text to be typed into a DOM element character by character.
       Supports a callback on completion.
       Speed: 18ms per character — fast enough to feel live, not sluggish.
    */
    function _typeInto(el, text, speed, onDone) {
        let i = 0;
        el.textContent = '';
        el.classList.add('sw-typing');

        function step() {
            if (i < text.length) {
                el.textContent += text[i++];
                setTimeout(step, speed);
            } else {
                el.classList.remove('sw-typing');
                el.classList.add('sw-typed');
                if (onDone) onDone();
            }
        }
        step();
    }

    /* Type a sequence of [element, text, speed] tuples in order */
    function _typeSequence(items, onAllDone) {
        let idx = 0;
        function next() {
            if (idx >= items.length) {
                if (onAllDone) onAllDone();
                return;
            }
            const [el, text, speed] = items[idx++];
            _typeInto(el, text, speed ?? 18, next);
        }
        next();
    }

    /* ── Stat bar with count-up value ───────────────────────────── */
    function _statBarHTML(label, value, cls, colour) {
        const pct = Math.max(0, Math.min(100, value));
        return `
            <div class="stat-row">
                <span class="stat-label">${label}</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill ${cls} sw-bar-animate"
                         style="width:0%"
                         data-target="${pct}">
                        <div class="stat-bar-shimmer"></div>
                    </div>
                </div>
                <span class="stat-value sw-countup" data-target="${value}">0</span>
            </div>`;
    }

    /* ── Animate bars + count-up ────────────────────────────────── */
    function _animateBars() {
        if (!_body) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                /* Bar fills */
                _body.querySelectorAll('.sw-bar-animate').forEach(el => {
                    el.style.width = `${el.dataset.target}%`;
                });
                /* Count-up numbers */
                _body.querySelectorAll('.sw-countup').forEach(el => {
                    const target = parseInt(el.dataset.target, 10);
                    let current  = 0;
                    const steps  = 20;
                    const inc    = target / steps;
                    const iv     = setInterval(() => {
                        current = Math.min(current + inc, target);
                        el.textContent = Math.round(current);
                        if (current >= target) clearInterval(iv);
                    }, 20);
                });
            });
        });
    }

    /* ── HP bar ─────────────────────────────────────────────────── */
    function _hpBarHTML(hp, maxHP) {
        const pct    = Math.max(0, Math.min(100, (hp / maxHP) * 100));
        const colour = hp > 50 ? 'var(--dexterity)' : hp > 25 ? 'var(--execution-gold)' : 'var(--strength)';
        const label  = Stats.isCorrupted() ? '[ CORRUPTED ]' : '[ HP ]';
        const cls    = Stats.isCorrupted() ? ' sw-corrupted' : '';
        return `
            <div class="sw-section">
                <div class="sw-row-label">
                    <span class="syd-line${cls}" id="sw-hp-label"></span>
                    <span class="stat-value sw-countup" data-target="${Math.round(hp)}"
                          style="color:${colour}">0</span>
                </div>
                <div class="stat-bar-track sw-hp-track">
                    <div class="sw-hp-fill sw-bar-animate"
                         style="width:0%; background:${colour}"
                         data-target="${pct.toFixed(1)}">
                        <div class="stat-bar-shimmer"></div>
                    </div>
                </div>
            </div>`;
    }

    /* ── Momentum bar ────────────────────────────────────────────── */
    function _momentumHTML(momentum, streak) {
        const pct         = ((momentum - 1.0) / 1.0) * 100;
        const streakLabel = streak === 0 ? 'NO STREAK' : `DAY ${streak} STREAK`;
        return `
            <div class="sw-section">
                <div class="sw-row-label">
                    <span class="syd-line dim" id="sw-momentum-label"></span>
                    <span class="stat-value gold">${momentum.toFixed(2)}×</span>
                </div>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill luck sw-bar-animate"
                         style="width:0%"
                         data-target="${pct.toFixed(1)}">
                        <div class="stat-bar-shimmer"></div>
                    </div>
                </div>
                <span class="sw-streak-label" id="sw-streak-label"></span>
            </div>`;
    }

    /* ── Stats section ───────────────────────────────────────────── */
    function _statsHTML(stats) {
        return `
            <div class="sw-section">
                <p class="syd-line" id="sw-stats-header"></p>
                ${_statBarHTML('INT', stats.intelligence, 'intelligence')}
                ${_statBarHTML('STR', stats.strength,     'strength')}
                ${_statBarHTML('CHA', stats.charisma,     'charisma')}
                ${_statBarHTML('DEX', stats.dexterity,    'dexterity')}
                ${_statBarHTML('LUCK', stats.luck,        'luck')}
            </div>`;
    }

    /* ── Header ──────────────────────────────────────────────────── */
    function _headerHTML() {
        const cls = G.player.class ? CLASSES[G.player.class] : null;
        return `
            <div class="sw-section sw-header">
                <p class="syd-line syd-new" id="sw-greeting"></p>
                <p class="syd-line dim"    id="sw-location"></p>
                <p class="syd-line dim"    id="sw-class-line"></p>
            </div>`;
    }

    /* ── Class selection ─────────────────────────────────────────── */
    function _classSelectHTML() {
        return `
            <div class="sw-section">
                <p class="syd-line syd-new" id="sw-fc-header"></p>
                <p class="syd-line dim"     id="sw-fc-body"></p>
            </div>
            <div class="sw-class-grid">
                ${Object.values(CLASSES).map(cls => `
                    <button class="sw-class-btn" data-class="${cls.id}"
                            style="--cls-colour:${cls.colour}">
                        <span class="sw-class-icon">${cls.icon}</span>
                        <span class="sw-class-name">${cls.name}</span>
                        <span class="sw-class-desc">${cls.desc}</span>
                        <span class="sw-class-select-hint">[ TAP TO SELECT ]</span>
                    </button>
                `).join('')}
            </div>`;
    }

    /* ── Full render ─────────────────────────────────────────────── */
    function _render() {
        if (!_body) return;

        const stats    = Stats.getAll();
        const hp       = Stats.getHP();
        const maxHP    = Stats.getMaxHP();
        const momentum = Stats.getMomentum();
        const streak   = Stats.getStreak();

        if (!_classChosen) {
            _body.innerHTML = _classSelectHTML();
            /* Typewrite the first contact text */
            const fcHeader = _body.querySelector('#sw-fc-header');
            const fcBody   = _body.querySelector('#sw-fc-body');
            if (fcHeader && fcBody) {
                _typeSequence([
                    [fcHeader, '[ FIRST CONTACT ]', 22],
                    [fcBody,   'SELECT YOUR CLASS. ONE CHOICE. PERMANENT.', 14],
                ]);
            }
            _bindClassButtons();
            return;
        }

        const mapName = G.mapId.toUpperCase().replace(/-/g, ' ');
        const cls     = G.player.class ? CLASSES[G.player.class] : null;
        const rankStr = cls
            ? `CLASS: ${cls.name}  |  RANK: ${G.player.rank ?? cls.ranks[0]}`
            : `CLASS: UNASSIGNED`;

        _body.innerHTML = `
            ${_headerHTML()}
            ${_hpBarHTML(hp, maxHP)}
            ${_momentumHTML(momentum, streak)}
            ${_statsHTML(stats)}
            <div class="sw-section sw-footer">
                <p class="syd-line dim sw-blink-cursor" id="sw-footer-line"></p>
            </div>`;

        /* Typewrite header lines in sequence, then animate bars */
        const greeting    = _body.querySelector('#sw-greeting');
        const location    = _body.querySelector('#sw-location');
        const classLine   = _body.querySelector('#sw-class-line');
        const hpLabel     = _body.querySelector('#sw-hp-label');
        const momLabel    = _body.querySelector('#sw-momentum-label');
        const streakLabel = _body.querySelector('#sw-streak-label');
        const statsHdr    = _body.querySelector('#sw-stats-header');
        const footerLine  = _body.querySelector('#sw-footer-line');

        const momentum_s  = Stats.getMomentum();
        const streak_s    = Stats.getStreak();
        const streakTxt   = streak_s === 0 ? 'NO STREAK' : `DAY ${streak_s} STREAK`;

        _typeSequence([
            [greeting,  _nextGreeting(),       20],
            [location,  `LOCATION: ${mapName}`, 14],
            [classLine, rankStr,                12],
            [hpLabel,   Stats.isCorrupted() ? '[ CORRUPTED ]' : '[ HP ]', 16],
        ], () => {
            /* After header types, animate bars and continue typing */
            _animateBars();
            if (momLabel)    _typeInto(momLabel,    '[ MOMENTUM ]', 14);
            if (streakLabel) _typeInto(streakLabel, streakTxt, 12);
            if (statsHdr)    setTimeout(() => _typeInto(statsHdr, '[ STATS ]', 16), 200);
            if (footerLine)  setTimeout(() => _typeInto(footerLine, '[ AWAITING DIRECTIVE ]', 14), 600);
        });
    }

    /* ── Class button binding ────────────────────────────────────── */
    function _bindClassButtons() {
        _body.querySelectorAll('.sw-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cls      = btn.dataset.class;
                G.player.class = cls;
                G.player.rank  = CLASSES[cls].ranks[0];
                _classChosen   = true;
                console.log(`[SystemWindow] Class selected: ${cls}`);
                _render();
            });
        });
    }

    /* ── Public API ─────────────────────────────────────────────── */

    function init() {
        _panel = document.getElementById('system-window');
        _body  = document.getElementById('system-window-body');
        _classChosen = !!G.player.class;

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && _isOpen) close();
        });
        window.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                e.preventDefault();
                _isOpen ? close() : open();
            }
        });
        console.log('[SystemWindow] Initialised');
    }

    function open() {
        if (!_panel) return;
        _render();
        _panel.hidden = false;
        _panel.classList.add('sw-opening');
        setTimeout(() => _panel.classList.remove('sw-opening'), 400);
        _isOpen = true;
    }

    function close() {
        if (!_panel) return;
        _panel.hidden = true;
        _isOpen = false;
    }

    function refresh() {
        if (_isOpen) _render();
    }

    function isOpen() { return _isOpen; }

    return { init, open, close, refresh, isOpen };

})();