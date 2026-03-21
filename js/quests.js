/* ── quests.js ───────────────────────────────────────────────────────
   Step 4. Life Directive system.

   Owns:
   - Loading quests.json pool on init
   - Selecting 3 directives per stat per day (12 active total)
   - Tier selection based on current stat level
   - Directive completion: applies stat delta × momentum, feeds streak
   - Day rollover: HP penalty and streak break if directives missed
   - Notifying listeners on complete / day-end events

   Tier selection thresholds:
     stat  0-29  → tier 0
     stat 30-59  → tier 1
     stat 60-79  → tier 2
     stat 80-100 → tier 3

   Day system note:
     Days are currently manual (tap [ END DAY ] in System Window).
     Step 12 (save.js) will tie this to real-world date via localStorage.
     The TODO comment below marks where that hook belongs.

   Public API:
     Quests.init()              — async, loads pool + generates day 1
     Quests.getActive()         — [{quest, completed}, ...]
     Quests.complete(id)        — mark complete, apply rewards
     Quests.endDay()            — advance day (HP/streak penalty if needed)
     Quests.getCompletedCount() — number done today
     Quests.getTotalCount()     — always 12
     Quests.getDayCount()       — current day number
     Quests.onUpdate(fn)        — register listener for any state change
──────────────────────────────────────────────────────────────────── */

const Quests = (() => {

    /* ── Constants ──────────────────────────────────────────────── */
    const DIRECTIVES_PER_STAT = 3;
    const STATS = ['intelligence', 'strength', 'charisma', 'dexterity'];
    const HP_MISS_PENALTY = -10;   /* HP lost when day ends with incomplete directives */

    /* Stat value → tier */
    function _tierForStat(statValue) {
        if (statValue >= 80) return 3;
        if (statValue >= 60) return 2;
        if (statValue >= 30) return 1;
        return 0;
    }

    /* ── Private state ──────────────────────────────────────────── */
    let _pool      = [];       /* all quests from quests.json */
    let _active    = [];       /* [{quest, completed}, ...] — today's 12 */
    let _completed = new Set();/* ids completed today */
    let _dayCount  = 1;
    let _listeners = [];
    let _ready     = false;

    /* ── Notify listeners ───────────────────────────────────────── */
    function _notify(event, data) {
        for (const fn of _listeners) {
            try { fn(event, data); } catch (e) {}
        }
    }

    /* ── Select 3 directives per stat ──────────────────────────── */
    /*
       For each stat, pick the correct tier based on current stat value,
       then randomly select DIRECTIVES_PER_STAT quests from that pool.
       Shuffles to avoid always showing the same quests.
    */
    function _selectDirectives() {
        const active = [];

        for (const stat of STATS) {
            const statValue = Stats.get(stat);
            const tier      = _tierForStat(statValue);

            /* Get all quests for this stat at this tier */
            const pool = _pool.filter(q => q.stat === stat && q.tier === tier);

            /* Fallback to tier 0 if somehow empty (shouldn't happen) */
            const candidates = pool.length > 0
                ? pool
                : _pool.filter(q => q.stat === stat && q.tier === 0);

            /* Shuffle and take 3 */
            const shuffled = [...candidates].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, DIRECTIVES_PER_STAT);

            for (const quest of selected) {
                active.push({ quest, completed: false });
            }
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

        const quest     = entry.quest;
        const momentum  = Stats.getMomentum();

        /* Apply stat delta scaled by momentum multiplier */
        const delta = Math.round(quest.statDelta * momentum);
        Stats.delta(quest.stat, delta);

        /* If all 12 complete — register as a full day streak */
        if (_completed.size === _active.length) {
            Stats.addStreak();
            console.log(`[Quests] All directives complete. Streak: ${Stats.getStreak()}`);
            _notify('all-complete', { dayCount: _dayCount });
        }

        console.log(`[Quests] Completed: ${quest.title} (+${delta} ${quest.stat})`);
        _notify('complete', { quest, delta });

        /* Refresh System Window if open */
        if (typeof SystemWindow !== 'undefined') SystemWindow.refresh();
    }

    /* ── End of day ─────────────────────────────────────────────── */
    /*
       TODO (Step 12): This should be called automatically when the
       real-world date changes (detected via localStorage lastActiveDate).
       For now it's manually triggered via the System Window button.
    */
    function endDay() {
        if (!_ready) return;

        const totalDone = _completed.size;
        const total     = _active.length;

        if (totalDone < total) {
            /* Missed directives — HP penalty and streak break */
            const missed = total - totalDone;
            Stats.deltaHP(HP_MISS_PENALTY);
            Stats.breakStreak();
            console.log(`[Quests] Day ended. ${missed} missed. HP -${Math.abs(HP_MISS_PENALTY)}.`);
            _notify('day-missed', { missed, hpDelta: HP_MISS_PENALTY });
        } else {
            _notify('day-complete', { dayCount: _dayCount });
        }

        /* Advance day */
        _dayCount++;
        _completed.clear();
        _active = _selectDirectives();

        console.log(`[Quests] Day ${_dayCount} directives generated.`);
        _notify('new-day', { dayCount: _dayCount });

        if (typeof SystemWindow !== 'undefined') SystemWindow.refresh();
    }

    /* ── Public API ─────────────────────────────────────────────── */

    async function init() {
        try {
            const res = await fetch('data/quests.json');
            if (!res.ok) throw new Error(`quests.json: ${res.status}`);
            const data = await res.json();
            _pool = data.quests;
            console.log(`[Quests] Pool loaded: ${_pool.length} directives`);
        } catch (err) {
            console.error('[Quests] Failed to load pool:', err);
            _pool = [];
        }

        _active   = _selectDirectives();
        _dayCount = 1;
        _ready    = true;
        console.log(`[Quests] Day 1 directives generated (${_active.length} total)`);
    }

    function getActive()         { return [..._active]; }
    function getCompletedCount() { return _completed.size; }
    function getTotalCount()     { return _active.length; }
    function getDayCount()       { return _dayCount; }
    function isReady()           { return _ready; }

    function onUpdate(fn) {
        _listeners.push(fn);
    }

    return {
        init,
        getActive,
        complete,
        endDay,
        getCompletedCount,
        getTotalCount,
        getDayCount,
        isReady,
        onUpdate,
    };

})();
