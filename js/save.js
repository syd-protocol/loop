/* ── save.js ─────────────────────────────────────────────────────────
   Step 4 — lightweight localStorage persistence.
   Full Firestore cloud sync comes in Step 15.

   Saves: player identity, stats, HP, streak, momentum, boot flag.
   Loads: before anything renders, so the world is always restored.
   Resets: clears all loop-* keys + sessionStorage, reloads page.

   Public API:
     Save.load()    — restores state into G and Stats (call before init)
     Save.save()    — writes current state to localStorage
     Save.reset()   — wipes all saved data and reloads
     Save.hasData() — true if a save exists
──────────────────────────────────────────────────────────────────── */

const Save = (() => {

    const KEYS = {
        player:   'loop-player',
        stats:    'loop-stats',
        vitals:   'loop-vitals',
        boot:     'loop-boot-played',
    };

    /* ── Load ───────────────────────────────────────────────────── */
    function load() {
        try {
            /* Player identity */
            const playerRaw = localStorage.getItem(KEYS.player);
            if (playerRaw) {
                const p = JSON.parse(playerRaw);
                if (p.name)  G.player.name  = p.name;
                if (p.class) G.player.class = p.class;
                if (p.rank)  G.player.rank  = p.rank;
                console.log(`[Save] Loaded player: ${p.name} (${p.class})`);
            }

            /* Stats */
            const statsRaw = localStorage.getItem(KEYS.stats);
            if (statsRaw && typeof Stats !== 'undefined') {
                const s = JSON.parse(statsRaw);
                ['intelligence','strength','charisma','dexterity'].forEach(k => {
                    if (typeof s[k] === 'number') Stats.set(k, s[k]);
                });
            }

            /* Vitals — HP, streak, momentum */
            const vitalsRaw = localStorage.getItem(KEYS.vitals);
            if (vitalsRaw && typeof Stats !== 'undefined') {
                const v = JSON.parse(vitalsRaw);
                if (typeof v.hp === 'number') {
                    const delta = v.hp - Stats.getHP();
                    if (delta !== 0) Stats.deltaHP(delta);
                }
                if (typeof v.streak === 'number') {
                    for (let i = 0; i < v.streak; i++) Stats.addStreak();
                }
            }

            /* Sync boot played flag so boot doesn't re-run */
            const bootPlayed = localStorage.getItem(KEYS.boot);
            if (bootPlayed) sessionStorage.setItem('boot-played', '1');

        } catch (err) {
            console.warn('[Save] Load failed:', err);
        }
    }

    /* ── Save ───────────────────────────────────────────────────── */
    function save() {
        try {
            /* Player */
            localStorage.setItem(KEYS.player, JSON.stringify({
                name:  G.player.name,
                class: G.player.class,
                rank:  G.player.rank,
            }));

            /* Stats */
            if (typeof Stats !== 'undefined') {
                localStorage.setItem(KEYS.stats, JSON.stringify(Stats.getAll()));
                localStorage.setItem(KEYS.vitals, JSON.stringify({
                    hp:      Stats.getHP(),
                    streak:  Stats.getStreak(),
                    momentum: Stats.getMomentum(),
                }));
            }

            /* Boot flag */
            if (sessionStorage.getItem('boot-played')) {
                localStorage.setItem(KEYS.boot, '1');
            }

        } catch (err) {
            console.warn('[Save] Save failed:', err);
        }
    }

    /* ── Reset ──────────────────────────────────────────────────── */
    function reset() {
        /* Clear all loop-* keys */
        Object.keys(localStorage)
            .filter(k => k.startsWith('loop-'))
            .forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem('boot-played');
        console.log('[Save] Reset complete. Reloading...');
        window.location.reload();
    }

    /* ── Has data ───────────────────────────────────────────────── */
    function hasData() {
        return !!localStorage.getItem(KEYS.player);
    }

    return { load, save, reset, hasData };

})();