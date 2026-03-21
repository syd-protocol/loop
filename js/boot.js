/* ── boot.js ─────────────────────────────────────────────────────────
   Boot sequence overlay. Plays once on first load before the game
   is visible. SYD terminal transmission — types line by line,
   then fades away to reveal the world.

   TODO (Step 3b — boot sequence):
   After the boot sequence completes, if no class has been chosen,
   auto-open the System Window to the class selection screen.
   Options discussed: boot sequence → class select (chosen approach),
   pulsing button, blocking prompt, NPC trigger.
   Currently: boot plays, then game starts. Class select on first
   System Window open. Connect the two when onboarding flow is finalised.

   Public API:
     Boot.play(onComplete)  — plays the sequence, calls onComplete when done
     Boot.skip()            — immediately completes (for dev / returning users)
──────────────────────────────────────────────────────────────────── */

const Boot = (() => {

    /* ── Sequence lines ─────────────────────────────────────────── */
    /*
       Each entry: [text, delayAfter_ms, className]
       className controls colour/style of the line.
    */
    const LINES = [
        ['',                                          0,    'boot-blank'],
        ['/loop  v0.1.0',                             300,  'boot-title'],
        ['',                                          0,    'boot-blank'],
        ['[ INITIALISING NEURAL LINK ]',              400,  'boot-cyan'],
        ['[ SCANNING OPERATIVE PROFILE... ]',         600,  'boot-dim'],
        ['[ STAGNATION FACTION: DETECTED ]',          500,  'boot-warning'],
        ['[ THREAT LEVEL: ELEVATED ]',                400,  'boot-warning'],
        ['',                                          0,    'boot-blank'],
        ['[ LIFE TRACK: LOADING ]',                   300,  'boot-dim'],
        ['[ CAREER TRACK: LOADING ]',                 300,  'boot-dim'],
        ['[ DIRECTIVE ENGINE: STANDBY ]',             400,  'boot-dim'],
        ['',                                          0,    'boot-blank'],
        ['[ YOUR WORLD. YOUR STATS. YOUR CAREER. ]',  700,  'boot-gold'],
        ['',                                          0,    'boot-blank'],
        ['[ SYSTEM READY ]',                          800,  'boot-cyan boot-large'],
    ];

    const CHAR_SPEED  = 16;   /* ms per character */
    const FADE_DELAY  = 600;  /* ms after last line before fade */

    /* ── Build overlay DOM ──────────────────────────────────────── */
    function _buildOverlay() {
        const el = document.createElement('div');
        el.id = 'boot-overlay';
        el.innerHTML = `
            <div id="boot-inner">
                <div id="boot-lines"></div>
                <span id="boot-cursor">▮</span>
            </div>`;
        document.body.appendChild(el);
        return el;
    }

    /* ── Typewriter for one line ────────────────────────────────── */
    function _typeLine(container, text, cls, speed, onDone) {
        const p = document.createElement('p');
        p.className = `boot-line ${cls}`;
        container.appendChild(p);

        if (!text) {
            if (onDone) onDone();
            return;
        }

        let i = 0;
        function step() {
            if (i < text.length) {
                p.textContent += text[i++];
                setTimeout(step, speed);
            } else {
                if (onDone) onDone();
            }
        }
        step();
    }

    /* ── Play the full sequence ─────────────────────────────────── */
    function play(onComplete) {
        /* Check if already played this session */
        if (sessionStorage.getItem('boot-played')) {
            if (onComplete) onComplete();
            return;
        }

        const overlay   = _buildOverlay();
        const container = overlay.querySelector('#boot-lines');
        let   lineIdx   = 0;

        function nextLine() {
            if (lineIdx >= LINES.length) {
                /* All lines done — wait then fade out */
                setTimeout(() => {
                    overlay.classList.add('boot-fade-out');
                    overlay.addEventListener('transitionend', () => {
                        overlay.remove();
                        sessionStorage.setItem('boot-played', '1');
                        if (onComplete) onComplete();
                    }, { once: true });
                }, FADE_DELAY);
                return;
            }

            const [text, delay, cls] = LINES[lineIdx++];
            _typeLine(container, text, cls, CHAR_SPEED, () => {
                /* Scroll to bottom */
                container.scrollTop = container.scrollHeight;
                setTimeout(nextLine, delay);
            });
        }

        nextLine();
    }

    /* ── Skip (dev mode / returning user) ───────────────────────── */
    function skip() {
        const overlay = document.getElementById('boot-overlay');
        if (overlay) overlay.remove();
        sessionStorage.setItem('boot-played', '1');
    }

    return { play, skip };

})();
