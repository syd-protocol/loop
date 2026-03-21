/* ── quests.js ───────────────────────────────────────────────────────
   Step 4. Life Directive system.

   Day tracking: uses the device's real calendar date via localStorage.
   On init and on app focus (visibilitychange), the current date is
   compared to 'loop-last-day'. If a new calendar day has started,
   endDay() fires automatically. No button needed.

   Public API:
     Quests.init()              — async, loads pool + generates today's directives
     Quests.getActive()         — [{quest, completed}, ...]
     Quests.complete(id)        — mark complete, apply rewards
     Quests.getCompletedCount() — number done today
     Quests.getTotalCount()     — always 12
     Quests.getDayCount()       — current day number
     Quests.isReady()           — true after init
     Quests.onUpdate(fn)        — register listener (event, data)
──────────────────────────────────────────────────────────────────── */

const Quests = (() => {

    /* ── Constants ──────────────────────────────────────────────── */
    const DIRECTIVES_PER_STAT = 3;
    const STATS      = ['intelligence', 'strength', 'charisma', 'dexterity'];
    const HP_PENALTY = -10;
    const DAY_KEY    = 'loop-last-day';
    const DONE_KEY   = 'loop-done-ids';
    const DAYNUM_KEY = 'loop-day-count';

    /* ── Helpers ────────────────────────────────────────────────── */
    function _today()    { return new Date().toDateString(); }
    function _lastDay()  { return localStorage.getItem(DAY_KEY) || ''; }
    function _saveDay()  { localStorage.setItem(DAY_KEY, _today()); }

    function _tierForStat(v) {
        if (v >= 80) return 3;
        if (v >= 60) return 2;
        if (v >= 30) return 1;
        return 0;
    }

    /* ── Private state ──────────────────────────────────────────── */
    let _pool      = [];
    let _active    = [];
    let _completed = new Set();
    let _dayCount  = 1;
    let _listeners = [];
    let _ready     = false;

    /* ── Notify ─────────────────────────────────────────────────── */
    function _notify(event, data) {
        _listeners.forEach(fn => { try { fn(event, data); } catch(e) {} });
    }

    /* ── Select 3 directives per stat ──────────────────────────── */
    function _selectDirectives() {
        const active = [];
        for (const stat of STATS) {
            const tier       = _tierForStat(Stats.get(stat));
            let candidates   = _pool.filter(q => q.stat === stat && q.tier === tier);
            if (!candidates.length)
                candidates   = _pool.filter(q => q.stat === stat && q.tier === 0);
            const shuffled   = [...candidates].sort(() => Math.random() - 0.5);
            shuffled.slice(0, DIRECTIVES_PER_STAT)
                    .forEach(quest => active.push({ quest, completed: false }));
        }
        return active;
    }

    /* ── Complete a directive ───────────────────────────────────── */
    function complete(id) {
        if (!_ready) return;
        const entry = _active.find(e => e.quest.id === id);
        if (!entry || entry.completed) return;

        entry.completed = true;
        _completed.add(id);

        /* Persist completed IDs */
        localStorage.setItem(DONE_KEY, JSON.stringify([..._completed]));

        const delta = Math.round(entry.quest.statDelta * Stats.getMomentum());
        Stats.delta(entry.quest.stat, delta);
        _notify('complete', { quest: entry.quest, delta });

        if (_completed.size === _active.length) {
            Stats.addStreak();
            _notify('all-complete', { dayCount: _dayCount });
        }

        if (typeof SystemWindow !== 'undefined') SystemWindow.refresh();
    }

    /* ── End of day (called automatically on date change) ──────── */
    function endDay() {
        if (!_ready) return;

        const missed = _active.length - _completed.size;
        if (missed > 0) {
            Stats.deltaHP(HP_PENALTY);
            Stats.breakStreak();
            _notify('day-missed', { missed, hpDelta: HP_PENALTY });
        } else {
            _notify('day-complete', { dayCount: _dayCount });
        }

        _dayCount++;
        localStorage.setItem(DAYNUM_KEY, _dayCount);
        _completed.clear();
        localStorage.removeItem(DONE_KEY);
        _active = _selectDirectives();
        _saveDay();

        _notify('new-day', { dayCount: _dayCount });
        if (typeof SystemWindow !== 'undefined') SystemWindow.refresh();
    }

    /* ── Check if a new calendar day has started ────────────────── */
    function _checkDayRollover() {
        if (!_ready) return;
        if (_today() !== _lastDay()) {
            console.log('[Quests] New day detected — advancing.');
            endDay();
        }
    }

    /* ── Public API ─────────────────────────────────────────────── */

    async function init() {
        try {
            const res  = await fetch('data/quests.json');
            if (!res.ok) throw new Error(`quests.json: ${res.status}`);
            const data = await res.json();
            _pool      = data.quests;
        } catch (err) {
            console.error('[Quests] Pool load failed:', err);
            _pool = [];
        }

        /* Restore day count from storage */
        const saved = parseInt(localStorage.getItem(DAYNUM_KEY), 10);
        if (!isNaN(saved) && saved > 0) _dayCount = saved;

        /* Restore completed IDs from storage */
        try {
            const ids = JSON.parse(localStorage.getItem(DONE_KEY) || '[]');
            ids.forEach(id => _completed.add(id));
        } catch(e) {}

        _active  = _selectDirectives();
        _ready   = true;

        /* Mark already-completed items from storage */
        _active.forEach(entry => {
            if (_completed.has(entry.quest.id)) entry.completed = true;
        });

        /* If this is the very first session, save today's date */
        if (!_lastDay()) _saveDay();

        /* Check for day rollover (e.g. returning after midnight) */
        _checkDayRollover();

        /* Listen for tab/app returning to foreground */
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) _checkDayRollover();
        });

        console.log(`[Quests] Ready. Day ${_dayCount}. ${_active.length} directives.`);
    }

    function getActive()         { return [..._active]; }
    function getCompletedCount() { return _completed.size; }
    function getTotalCount()     { return _active.length; }
    function getDayCount()       { return _dayCount; }
    function isReady()           { return _ready; }
    function onUpdate(fn)        { _listeners.push(fn); }

    return { init, getActive, complete, getCompletedCount,
             getTotalCount, getDayCount, isReady, onUpdate };

})();