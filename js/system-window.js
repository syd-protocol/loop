/* ── system-window.js ────────────────────────────────────────────────
   Step 3. Owns the System Window overlay — /loop's primary UI panel.

   Sections rendered:
   1. Header      — SYD transmission, map name, class/rank
   2. HP bar      — player health with Corrupted State indicator
   3. Momentum    — streak multiplier bar
   4. Stats       — five stat bars with icons and values
   5. Class select — first-run class picker (Architect / Warlord / Herald)

   SYD voice rules (from handoff):
   - Bracket headers ALL CAPS: [ DIRECTIVE ISSUED ]
   - No em dashes — full stops instead
   - No warmth, no filler. Clipped sentences.
   - No B.L.O.C.K. references. Stagnation Faction only.

   Public API:
     SystemWindow.init()    — call once after Stats.init()
     SystemWindow.open()    — show the panel
     SystemWindow.close()   — hide the panel
     SystemWindow.refresh() — re-render current data into panel
     SystemWindow.isOpen()  — returns boolean
──────────────────────────────────────────────────────────────────── */

const SystemWindow = (() => {

    /* ── Class definitions ──────────────────────────────────────── */
    const CLASSES = {
        architect: {
            id:    'architect',
            name:  'ARCHITECT',
            desc:  'Technical class. Precision. Systems. Pattern recognition.',
            colour: '#1A6BFF',
            ranks: ['Apprentice','Coder','Engineer','Senior Engineer',
                    'Staff Engineer','Principal','Architect','Chief Architect'],
        },
        warlord: {
            id:    'warlord',
            name:  'WARLORD',
            desc:  'Command class. People. Coordination. Battlefield control.',
            colour: '#9B5DE5',
            ranks: ['Intern','Coordinator','Manager','Senior Manager',
                    'Director','VP','General','Warlord'],
        },
        herald: {
            id:    'herald',
            name:  'HERALD',
            desc:  'Influence class. Information. Persuasion. Words as weapons.',
            colour: '#E63B2E',
            ranks: ['Intern','Associate','Specialist','Senior Specialist',
                    'Lead','Head','Chief','Grand Herald'],
        },
    };

    /* ── Private state ──────────────────────────────────────────── */
    let _panel      = null;
    let _body       = null;
    let _isOpen     = false;
    let _classChosen = false;

    /* ── SYD transmission lines (shown at top on open) ─────────── */
    const SYD_GREETINGS = [
        '[ SYSTEM ONLINE ]',
        '[ NEURAL LINK ESTABLISHED ]',
        '[ SIGNAL ACQUIRED ]',
        '[ READING CONFIRMED ]',
    ];

    let _greetingIndex = 0;

    function _nextGreeting() {
        const g = SYD_GREETINGS[_greetingIndex % SYD_GREETINGS.length];
        _greetingIndex++;
        return g;
    }

    /* ── Render helpers ─────────────────────────────────────────── */

    function _statBarHTML(label, value, cls) {
        const pct = Math.max(0, Math.min(100, value));
        return `
            <div class="stat-row">
                <span class="stat-label">${label}</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill ${cls} sw-bar-animate"
                         style="width:0%"
                         data-target="${pct}"></div>
                </div>
                <span class="stat-value">${value}</span>
            </div>`;
    }

    function _hpBarHTML(hp, maxHP) {
        const pct = Math.max(0, Math.min(100, (hp / maxHP) * 100));
        const colour = hp > 50 ? '#00A878' : hp > 25 ? '#F4C430' : '#E63B2E';
        const label  = Stats.isCorrupted() ? '[ CORRUPTED ]' : '[ HP ]';
        return `
            <div class="sw-section">
                <p class="syd-line${Stats.isCorrupted() ? ' strength' : ''}">${label}</p>
                <div class="sw-hp-row">
                    <div class="stat-bar-track sw-hp-track">
                        <div class="sw-hp-fill sw-bar-animate"
                             style="width:0%; background:${colour}"
                             data-target="${pct.toFixed(1)}"></div>
                    </div>
                    <span class="stat-value">${hp}/${maxHP}</span>
                </div>
            </div>`;
    }

    function _momentumHTML(momentum, streak) {
        const pct = ((momentum - 1.0) / 1.0) * 100;  // 0–100% of the 1×–2× range
        const streakLabel = streak === 0
            ? 'no streak'
            : `day ${streak} streak`;
        return `
            <div class="sw-section">
                <p class="syd-line dim">[ MOMENTUM ] <span class="gold">${momentum.toFixed(2)}×</span> — ${streakLabel}</p>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill luck sw-bar-animate"
                         style="width:0%"
                         data-target="${pct.toFixed(1)}"></div>
                </div>
            </div>`;
    }

    function _statsHTML(stats) {
        return `
            <div class="sw-section">
                <p class="syd-line">[ STATS ]</p>
                ${_statBarHTML('INTELLIGENCE', stats.intelligence, 'intelligence')}
                ${_statBarHTML('STRENGTH',     stats.strength,     'strength')}
                ${_statBarHTML('CHARISMA',     stats.charisma,     'charisma')}
                ${_statBarHTML('DEXTERITY',    stats.dexterity,    'dexterity')}
                ${_statBarHTML('LUCK',         stats.luck,         'luck')}
            </div>`;
    }

    function _headerHTML() {
        const mapName  = G.mapId.toUpperCase().replace(/-/g, ' ');
        const cls      = G.player.class
            ? CLASSES[G.player.class]
            : null;
        const rankLine = cls
            ? `<p class="syd-line dim">CLASS: <span style="color:${cls.colour}">${cls.name}</span>. RANK: ${G.player.rank ?? cls.ranks[0]}.</p>`
            : `<p class="syd-line dim">CLASS: <span class="gold">UNASSIGNED</span></p>`;

        return `
            <p class="syd-line syd-new">${_nextGreeting()}</p>
            <p class="syd-line dim">LOCATION: ${mapName}</p>
            ${rankLine}`;
    }

    /* ── Class selection screen (first-run only) ─────────────────── */
    function _classSelectHTML() {
        return `
            <div class="sw-section">
                <p class="syd-line syd-new">[ FIRST CONTACT ]</p>
                <p class="syd-line dim">Select your class. This determines your career track,
                encounter types, and ability set. Choose once.</p>
            </div>
            <div class="sw-class-grid">
                ${Object.values(CLASSES).map(cls => `
                    <button class="sw-class-btn" data-class="${cls.id}"
                            style="--cls-colour:${cls.colour}">
                        <span class="sw-class-name">${cls.name}</span>
                        <span class="sw-class-desc">${cls.desc}</span>
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
            _bindClassButtons();
            return;
        }

        _body.innerHTML = `
            <div class="sw-section sw-header">
                ${_headerHTML()}
            </div>
            ${_hpBarHTML(hp, maxHP)}
            ${_momentumHTML(momentum, streak)}
            ${_statsHTML(stats)}
            <div class="sw-section sw-footer">
                <p class="syd-line dim">[ DIRECTIVES ] — Step 4</p>
                <p class="syd-line dim">[ SCROLLS ]    — Step 9</p>
                <p class="syd-line dim">[ ABILITIES ]  — Step 10</p>
            </div>`;

        /* Animate bars in after a short delay */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                _body.querySelectorAll('.sw-bar-animate').forEach(el => {
                    el.style.width = `${el.dataset.target}%`;
                });
            });
        });
    }

    /* ── Class button binding ────────────────────────────────────── */
    function _bindClassButtons() {
        _body.querySelectorAll('.sw-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cls = btn.dataset.class;
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

        /* Check if class was previously chosen (later: from save) */
        _classChosen = !!G.player.class;

        /* Close on Escape key */
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && _isOpen) close();
        });

        /* Close on Tab key (as per handoff) */
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