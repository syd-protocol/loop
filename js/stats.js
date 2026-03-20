/* ── stats.js ────────────────────────────────────────────────────────
   Step 3. Owns the stat model for /loop.

   The Five Stats:
   - INTELLIGENCE  (#1A6BFF)  — learning, reading situations
   - STRENGTH      (#E63B2E)  — delivery, follow-through, HP
   - CHARISMA      (#9B5DE5)  — influence, social, NPC access
   - DEXTERITY     (#00A878)  — adaptability, debuff resistance
   - LUCK          (#F4C430)  — derived: average of the other four

   HP and Momentum:
   - HP starts at 100. Losing combat or missing days costs HP.
   - Momentum multiplier: 1.0–2.0, builds through streaks.
   - Corrupted State: HP ≤ 0 → XP halved, visual scanlines.

   Public API:
     Stats.init()             — called once at game start
     Stats.get(key)           — returns current value (0–100)
     Stats.set(key, val)      — sets a stat (clamped 0–100)
     Stats.delta(key, amount) — adds/subtracts, returns new value
     Stats.getAll()           — returns full snapshot object
     Stats.getHP()            — current HP (0–100)
     Stats.deltaHP(amount)    — modify HP
     Stats.getMomentum()      — current multiplier (1.0–2.0)
     Stats.getStreak()        — current day streak
     Stats.isCorrupted()      — true if HP ≤ 0
     Stats.recalcLuck()       — recalculate luck from other four
     Stats.onStatChange(fn)   — register listener for stat changes
──────────────────────────────────────────────────────────────────── */

const Stats = (() => {

    /* ── Default starting values ────────────────────────────────── */
    const DEFAULTS = {
        intelligence: 30,
        strength:     25,
        charisma:     20,
        dexterity:    15,
        luck:         0,    // always derived
    };

    /* ── Private state ──────────────────────────────────────────── */
    let _stats = { ...DEFAULTS };
    let _hp         = 100;
    let _maxHP      = 100;
    let _momentum   = 1.0;   // 1.0 – 2.0
    let _streak     = 0;     // consecutive days directives completed
    let _corrupted  = false;

    const _listeners = [];

    /* ── Luck derivation ─────────────────────────────────────────── */
    function _calcLuck() {
        const { intelligence, strength, charisma, dexterity } = _stats;
        return Math.round((intelligence + strength + charisma + dexterity) / 4);
    }

    /* ── Notify listeners ───────────────────────────────────────── */
    function _notify(key, oldVal, newVal) {
        for (const fn of _listeners) {
            try { fn(key, oldVal, newVal, _stats); } catch (e) {}
        }
    }

    /* ── Momentum from streak ────────────────────────────────────── */
    function _updateMomentum() {
        /* Momentum caps at 2.0× at day 14 streak */
        _momentum = Math.min(2.0, 1.0 + (_streak / 14));
    }

    /* ── Corrupted State ─────────────────────────────────────────── */
    function _updateCorruptedState() {
        const wasCorrupted = _corrupted;
        _corrupted = _hp <= 0;

        if (_corrupted && !wasCorrupted) {
            /* Just entered Corrupted State */
            document.body.classList.add('corrupted');
            console.log('[Stats] Corrupted State activated');
        } else if (!_corrupted && wasCorrupted) {
            /* Recovered */
            document.body.classList.remove('corrupted');
            console.log('[Stats] Corrupted State cleared');
        }
    }

    /* ── Public API ─────────────────────────────────────────────── */

    function init() {
        _stats      = { ...DEFAULTS };
        _stats.luck = _calcLuck();
        _hp         = 100;
        _maxHP      = 100;
        _momentum   = 1.0;
        _streak     = 0;
        _corrupted  = false;
        console.log('[Stats] Initialised:', _stats);
    }

    function get(key) {
        return _stats[key] ?? 0;
    }

    function set(key, val) {
        if (!(key in _stats)) return;
        const old = _stats[key];
        _stats[key] = Math.max(0, Math.min(100, Math.round(val)));
        _stats.luck = _calcLuck();
        _notify(key, old, _stats[key]);
    }

    function delta(key, amount) {
        if (!(key in _stats) || key === 'luck') return _stats[key];
        set(key, _stats[key] + amount);
        return _stats[key];
    }

    function getAll() {
        return { ..._stats };
    }

    function recalcLuck() {
        const old = _stats.luck;
        _stats.luck = _calcLuck();
        if (_stats.luck !== old) _notify('luck', old, _stats.luck);
        return _stats.luck;
    }

    function getHP() { return _hp; }
    function getMaxHP() { return _maxHP; }

    function deltaHP(amount) {
        const old = _hp;
        _hp = Math.max(0, Math.min(_maxHP, _hp + amount));
        _updateCorruptedState();
        _notify('hp', old, _hp);
        return _hp;
    }

    function getMomentum() { return _momentum; }
    function getStreak()   { return _streak; }

    function addStreak() {
        _streak++;
        _updateMomentum();
        _notify('streak', _streak - 1, _streak);
    }

    function breakStreak() {
        _streak = 0;
        _momentum = 1.0;
        _notify('streak', _streak, 0);
    }

    function isCorrupted() { return _corrupted; }

    function onStatChange(fn) {
        _listeners.push(fn);
    }

    return {
        init,
        get, set, delta, getAll, recalcLuck,
        getHP, getMaxHP, deltaHP,
        getMomentum, getStreak, addStreak, breakStreak,
        isCorrupted,
        onStatChange,
    };

})();