/* ── system-window.js ────────────────────────────────────────────────
   Step 3 (visual rework). Owns the System Window overlay.

   Visual design goals (informed by SYD /terminal reference):
   - Player name large and prominent at the top
   - Class badge clearly visible
   - Card backgrounds give sections depth
   - Numbers large and right-aligned — readable at a glance
   - Stat bars slim, coloured, with shimmer animation
   - Count-up numbers on open
   - Typewriter on SYD header lines
   - CRT scanline + corner brackets on panel
   - Every section feels alive, not painted

   Bug fix: _classChosen is now derived LIVE from G.player.class
   on every _render() call — never cached at init time.
   This means the window always reflects post-boot state correctly.

   Public API:
     SystemWindow.init()
     SystemWindow.open()
     SystemWindow.close()
     SystemWindow.refresh()
     SystemWindow.isOpen()
──────────────────────────────────────────────────────────────────── */

const SystemWindow = (() => {

    /* ── Class definitions ──────────────────────────────────────── */
    const CLASSES = {
        architect: {
            id: 'architect', name: 'ARCHITECT', icon: '⬡',
            colour: '#1A6BFF',
            ranks: ['Apprentice','Coder','Engineer','Senior Engineer',
                    'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        warlord: {
            id: 'warlord', name: 'WARLORD', icon: '◈',
            colour: '#9B5DE5',
            ranks: ['Intern','Coordinator','Manager','Senior Manager',
                    'Director','VP','General','Warlord'],
        },
        herald: {
            id: 'herald', name: 'HERALD', icon: '◎',
            colour: '#E63B2E',
            ranks: ['Intern','Associate','Specialist','Senior Specialist',
                    'Lead','Head','Chief','Grand Herald'],
        },
    };

    const SYD_LINES = [
        '[ NEURAL LINK ESTABLISHED ]',
        '[ SYSTEM ONLINE ]',
        '[ SIGNAL ACQUIRED ]',
        '[ OPERATIVE LOCATED ]',
    ];
    let _greetIdx = 0;

    /* ── Private state ──────────────────────────────────────────── */
    let _panel  = null;
    let _body   = null;
    let _isOpen = false;

    /* ── Typewriter ─────────────────────────────────────────────── */
    function _type(el, text, speed, onDone) {
        el.textContent = '';
        el.classList.add('sw-typing');
        let i = 0;
        function step() {
            if (i < text.length) { el.textContent += text[i++]; setTimeout(step, speed); }
            else { el.classList.remove('sw-typing'); el.classList.add('sw-typed'); if (onDone) onDone(); }
        }
        step();
    }

    function _typeSeq(items, onDone) {
        let idx = 0;
        function next() {
            if (idx >= items.length) { if (onDone) onDone(); return; }
            const [el, text, speed] = items[idx++];
            _type(el, text, speed ?? 16, next);
        }
        next();
    }

    /* ── Animate bars + count-up ────────────────────────────────── */
    function _animateBars() {
        if (!_body) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            _body.querySelectorAll('.sw-bar-fill[data-pct]').forEach(el => {
                el.style.width = el.dataset.pct + '%';
            });
            _body.querySelectorAll('.sw-num[data-val]').forEach(el => {
                const target = +el.dataset.val;
                let cur = 0;
                const iv = setInterval(() => {
                    cur = Math.min(cur + target / 18, target);
                    el.textContent = Math.round(cur);
                    if (cur >= target) clearInterval(iv);
                }, 22);
            });
        }));
    }

    /* ── Section card wrapper ───────────────────────────────────── */
    function _card(content) {
        return `<div class="sw-card">${content}</div>`;
    }

    /* ── Identity card (name + class + rank) ────────────────────── */
    function _identityHTML() {
        const cls      = G.player.class ? CLASSES[G.player.class] : null;
        const name     = G.player.name  ?? 'OPERATIVE';
        const clsName  = cls ? cls.name  : 'UNASSIGNED';
        const clsColour = cls ? cls.colour : 'var(--stagnation-grey)';
        const rank     = G.player.rank  ?? '—';
        const icon     = cls ? cls.icon  : '◌';

        return _card(`
            <p class="syd-line syd-new sw-syd-greeting" id="sw-greeting"></p>
            <div class="sw-identity-name">${name}</div>
            <div class="sw-identity-meta">
                <span class="sw-class-badge" style="color:${clsColour};border-color:${clsColour}">
                    ${icon} ${clsName}
                </span>
                <span class="sw-rank-label">${rank}</span>
            </div>
        `);
    }

    /* ── HP + Momentum card ─────────────────────────────────────── */
    function _vitalHTML() {
        const hp       = Stats.getHP();
        const maxHP    = Stats.getMaxHP();
        const hpPct    = Math.round((hp / maxHP) * 100);
        const hpColour = hp > 50 ? 'var(--dexterity)' : hp > 25 ? 'var(--execution-gold)' : 'var(--strength)';
        const momentum = Stats.getMomentum();
        const streak   = Stats.getStreak();
        const momPct   = Math.round((momentum - 1.0) * 100);
        const corrupt  = Stats.isCorrupted();
        const streakTxt = streak === 0 ? 'NO STREAK' : `DAY ${streak}`;

        return _card(`
            <div class="sw-vital-row">
                <span class="sw-vital-label${corrupt ? ' sw-corrupted' : ''}" id="sw-hp-label"></span>
                <span class="sw-vital-value sw-num"
                      style="color:${hpColour}"
                      data-val="${hp}">${hp}</span>
                <span class="sw-vital-max">/ ${maxHP}</span>
            </div>
            <div class="sw-bar-track">
                <div class="sw-bar-fill" data-pct="${hpPct}"
                     style="width:0%;background:${hpColour};box-shadow:0 0 8px ${hpColour}60">
                    <div class="sw-shimmer"></div>
                </div>
            </div>
            <div class="sw-vital-row sw-momentum-row">
                <span class="sw-vital-label dim" id="sw-mom-label"></span>
                <span class="sw-vital-value gold">${momentum.toFixed(2)}×</span>
                <span class="sw-vital-max sw-streak" id="sw-streak"></span>
            </div>
            <div class="sw-bar-track">
                <div class="sw-bar-fill luck" data-pct="${momPct}"
                     style="width:0%">
                    <div class="sw-shimmer"></div>
                </div>
            </div>
        `);
    }

    /* ── Stats card ─────────────────────────────────────────────── */
    function _statRow(label, value, cls) {
        const pct = Math.min(100, value);
        return `
            <div class="sw-stat-row">
                <span class="sw-stat-label">${label}</span>
                <div class="sw-bar-track sw-stat-track">
                    <div class="sw-bar-fill ${cls}" data-pct="${pct}" style="width:0%">
                        <div class="sw-shimmer"></div>
                    </div>
                </div>
                <span class="sw-stat-val sw-num" data-val="${value}">0</span>
            </div>`;
    }

    function _statsHTML() {
        const s = Stats.getAll();
        return _card(`
            <p class="sw-section-title" id="sw-stats-title"></p>
            ${_statRow('INT',  s.intelligence, 'intelligence')}
            ${_statRow('STR',  s.strength,     'strength')}
            ${_statRow('CHA',  s.charisma,     'charisma')}
            ${_statRow('DEX',  s.dexterity,    'dexterity')}
            ${_statRow('LUCK', s.luck,         'luck')}
        `);
    }

    /* ── Footer card ────────────────────────────────────────────── */
    function _footerHTML() {
        return _card(`
            <p class="sw-section-title sw-blink-cursor" id="sw-footer-title"></p>
            <p class="syd-line dim sw-footer-hint">[ DIRECTIVES ] — STEP 4</p>
            <p class="syd-line dim sw-footer-hint">[ SCROLLS ]    — STEP 9</p>
            <p class="syd-line dim sw-footer-hint">[ ABILITIES ]  — STEP 10</p>
        `);
    }

    /* ── Not-onboarded fallback ─────────────────────────────────── */
    function _fallbackHTML() {
        return _card(`
            <p class="syd-line syd-new">[ BOOT SEQUENCE INCOMPLETE ]</p>
            <p class="syd-line dim" style="margin-top:8px">
                Refresh the page to complete onboarding.</p>
        `);
    }

    /* ── Full render ─────────────────────────────────────────────── */
    function _render() {
        if (!_body) return;

        /* Always read live — never cached — so boot completion reflects immediately */
        const classChosen = !!G.player.class;

        if (!classChosen) {
            _body.innerHTML = _fallbackHTML();
            return;
        }

        const momentum = Stats.getMomentum();
        const streak   = Stats.getStreak();
        const streakTxt = streak === 0 ? 'NO STREAK' : `DAY ${streak}`;

        _body.innerHTML = `
            ${_identityHTML()}
            ${_vitalHTML()}
            ${_statsHTML()}
            ${_footerHTML()}`;

        /* Typewrite sequence */
        const greeting   = _body.querySelector('#sw-greeting');
        const hpLabel    = _body.querySelector('#sw-hp-label');
        const momLabel   = _body.querySelector('#sw-mom-label');
        const streakEl   = _body.querySelector('#sw-streak');
        const statsTitle = _body.querySelector('#sw-stats-title');
        const footer     = _body.querySelector('#sw-footer-title');

        const sydLine = SYD_LINES[_greetIdx % SYD_LINES.length];
        _greetIdx++;

        _typeSeq([
            [greeting,   sydLine,          18],
            [hpLabel,    Stats.isCorrupted() ? '[ CORRUPTED ]' : '[ HP ]', 16],
        ], () => {
            _animateBars();
            if (momLabel)   _type(momLabel,   '[ MOMENTUM ]',  14);
            if (streakEl)   _type(streakEl,   streakTxt,       12);
            if (statsTitle) setTimeout(() => _type(statsTitle, '[ STATS ]', 16), 200);
            if (footer)     setTimeout(() => _type(footer,     '[ AWAITING DIRECTIVE ]', 14), 500);
        });
    }

    /* ── Public API ─────────────────────────────────────────────── */
    function init() {
        _panel = document.getElementById('system-window');
        _body  = document.getElementById('system-window-body');

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && _isOpen) close();
        });
        window.addEventListener('keydown', e => {
            if (e.key === 'Tab') { e.preventDefault(); _isOpen ? close() : open(); }
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

    function refresh() { if (_isOpen) _render(); }
    function isOpen()  { return _isOpen; }

    return { init, open, close, refresh, isOpen };

})();