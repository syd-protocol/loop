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
            desc: 'Engineers. Developers. Builders. Technical founders. You solve the world with systems.',
            ranks: ['Apprentice','Coder','Engineer','Senior Engineer',
                    'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        warlord: {
            id: 'warlord', name: 'WARLORD', icon: '◈',
            colour: '#9B5DE5',
            desc: 'Managers. Directors. Ops leads. Team builders. You win through people and coordination.',
            ranks: ['Intern','Coordinator','Manager','Senior Manager',
                    'Director','VP','General','Warlord'],
        },
        herald: {
            id: 'herald', name: 'HERALD', icon: '◎',
            colour: '#E63B2E',
            desc: 'Marketers. Strategists. Writers. Communicators. You win through words and influence.',
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

    /* ── Stat / vital tooltips ─────────────────────────────────── */
    const TIPS = {
        'INT':  { label: 'INTELLIGENCE', text: 'How sharply you read situations. Primary stat for all career encounters.' },
        'STR':  { label: 'STRENGTH',     text: 'Delivery and follow-through. Governs HP max and recovery rate.' },
        'CHA':  { label: 'CHARISMA',     text: 'Influence and social reach. Unlocks NPC access at higher levels.' },
        'DEX':  { label: 'DEXTERITY',    text: 'Adaptability. Resists debuffs. Speeds Corrupted State recovery.' },
        'LUCK': { label: 'LUCK',         text: 'Derived stat. Average of the other four. Cannot be trained directly.' },
        'HP':   { label: 'HP',           text: 'Your resilience. Drops when you miss days. Zero = Corrupted State.' },
        'MOM':  { label: 'MOMENTUM',     text: 'Streak multiplier. Builds through consecutive days. Caps at 2× on day 14.' },
    };

    let _tipTimer = null;

    function _showTip(key) {
        const tip = TIPS[key];
        if (!tip) return;

        let el = document.getElementById('sw-tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'sw-tooltip';
            document.body.appendChild(el);
        }

        el.innerHTML = `<span class="tip-label">${tip.label}</span>${tip.text}`;
        el.classList.add('visible');

        clearTimeout(_tipTimer);
        _tipTimer = setTimeout(() => el.classList.remove('visible'), 2500);
    }

    function _bindTips() {
        if (!_body) return;
        _body.querySelectorAll('.sw-stat-label[data-tip]').forEach(el => {
            el.addEventListener('pointerdown', () => _showTip(el.dataset.tip));
        });
        _body.querySelectorAll('.sw-vital-label[data-tip]').forEach(el => {
            el.addEventListener('pointerdown', () => _showTip(el.dataset.tip));
        });
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
                <span class="sw-vital-label${corrupt ? ' sw-corrupted' : ''}" id="sw-hp-label" data-tip="HP"></span>
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
                <span class="sw-vital-label dim" id="sw-mom-label" data-tip="MOM"></span>
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
                <span class="sw-stat-label" data-tip="${label}">${label}</span>
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

    /* ── Directives section ─────────────────────────────────────── */
    function _directivesHTML() {
        if (typeof Quests === 'undefined' || !Quests.isReady()) {
            return _card(`<p class="syd-line dim">[ DIRECTIVES LOADING ]</p>`);
        }

        const active    = Quests.getActive();
        const done      = Quests.getCompletedCount();
        const total     = Quests.getTotalCount();
        const dayCount  = Quests.getDayCount();

        /* Group by stat */
        const STAT_LABELS = {
            intelligence: 'INT', strength: 'STR',
            charisma: 'CHA',     dexterity: 'DEX'
        };
        const STAT_ORDER = ['intelligence', 'strength', 'charisma', 'dexterity'];

        const groups = {};
        for (const entry of active) {
            const s = entry.quest.stat;
            if (!groups[s]) groups[s] = [];
            groups[s].push(entry);
        }

        const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

        let html = `
            <div class="sw-dir-header">
                <span class="sw-section-title" id="sw-dir-title"></span>
                <span class="sw-dir-count">${done}/${total}</span>
            </div>
            <div class="sw-bar-track sw-dir-progress">
                <div class="sw-bar-fill dexterity" data-pct="${progressPct}"
                     style="width:0%"><div class="sw-shimmer"></div></div>
            </div>
            <div class="sw-dir-day">DAY ${dayCount}</div>`;

        for (const stat of STAT_ORDER) {
            const entries = groups[stat] || [];
            if (!entries.length) continue;

            html += `<div class="sw-dir-group">
                <span class="sw-dir-stat-label">${STAT_LABELS[stat]}</span>`;

            for (const entry of entries) {
                const q    = entry.quest;
                const done = entry.completed;
                html += `
                <div class="sw-dir-card${done ? ' sw-dir-done' : ''}"
                     data-quest-id="${q.id}"
                     ${done ? '' : 'role="button" tabindex="0"'}>
                    <div class="sw-dir-card-top">
                        <span class="sw-dir-title">${q.title}</span>
                        ${done
                            ? `<span class="sw-dir-reward">+${q.statDelta} ${STAT_LABELS[q.stat]}</span>`
                            : `<span class="sw-dir-tier">T${q.tier}</span>`}
                    </div>
                    <p class="sw-dir-desc">${q.desc.substring(0, 90)}${q.desc.length > 90 ? '…' : ''}</p>
                    ${!done ? `<button class="sw-dir-complete-btn" data-quest-id="${q.id}">COMPLETE ✓</button>` : ''}
                </div>`;
            }

            html += `</div>`;
        }

        html += `<button class="sw-end-day-btn" id="sw-end-day">[ END DAY ]</button>`;

        return _card(html);
    }

    /* ── Footer card ────────────────────────────────────────────── */
    function _footerHTML() {
        return _card(`
            <p class="sw-section-title" id="sw-footer-title"></p>
            <p class="syd-line dim sw-footer-hint">[ DIRECTIVES ] — COMING SOON</p>
            <p class="syd-line dim sw-footer-hint">[ SCROLLS ]    — COMING SOON</p>
            <p class="syd-line dim sw-footer-hint">[ ABILITIES ]  — COMING SOON</p>
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
            ${_directivesHTML()}
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
            _bindTips();
            _bindDirectives();
            if (momLabel)   _type(momLabel,   '[ MOMENTUM ]',  14);
            if (streakEl)   _type(streakEl,   streakTxt,       12);
            if (statsTitle) setTimeout(() => _type(statsTitle, '[ STATS ]', 16), 200);
            if (footer)     setTimeout(() => _type(footer,     '[ SYSTEM STANDING BY ]', 14), 500);
        });
    }

    /* ── Bind directive buttons ────────────────────────────────── */
    function _bindDirectives() {
        if (!_body) return;

        /* Typewrite the directives header */
        const dirTitle = _body.querySelector('#sw-dir-title');
        if (dirTitle) _type(dirTitle, '[ DIRECTIVES ]', 14);

        /* Complete buttons */
        _body.querySelectorAll('.sw-dir-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.questId;
                if (typeof Quests !== 'undefined') {
                    Quests.complete(id);
                    _render();   /* re-render to show updated state */
                }
            });
        });

        /* End day button */
        const endDayBtn = _body.querySelector('#sw-end-day');
        if (endDayBtn) {
            endDayBtn.addEventListener('click', () => {
                if (typeof Quests !== 'undefined') Quests.endDay();
                _render();
            });
        }
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