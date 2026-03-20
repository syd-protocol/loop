/* ── main.js ─────────────────────────────────────────────────────────
   Entry point. Owns:
   - Canvas setup and responsive scaling (resizeCanvas)
   - Asset loading (sprite-map.json, maps.json)
   - Global state object (G)
   - requestAnimationFrame game loop
   - Camera calculation (follows player, clamped to map bounds)
   - Input: keyboard and tap-to-move stub (full input in player.js Step 2)
   - Dev overlay update (fps, tile coords)

   Load order: world.js → player.js → npc.js → stats.js →
               system-window.js → save.js → main.js
──────────────────────────────────────────────────────────────────── */

/* ── CONSTANTS ───────────────────────────────────────────────────── */
const CANVAS_W  = 320;   // Internal resolution width
const CANVAS_H  = 180;   // Internal resolution height
const TARGET_FPS = 60;
const FRAME_MS   = 1000 / TARGET_FPS;

/* ── GLOBAL STATE ────────────────────────────────────────────────── */
/*
   G is the single source of truth for all runtime state.
   Persistent state is written to localStorage by save.js.
   Nothing outside main.js should modify G.camera directly.
*/
const G = {
    /* Canvas */
    canvas:  null,
    ctx:     null,
    scale:   1,         // CSS pixel scale factor (real px / canvas px)

    /* Camera — top-left corner of viewport in world pixels */
    camera: { x: 0, y: 0 },

    /* Timing */
    lastTime:   0,
    fps:        0,
    frameCount: 0,
    fpsAccum:   0,
    fpsTimer:   0,

    /* Current map */
    mapId: 'home-flat',

    /* Player position (world pixels) — placeholder until player.js */
    player: {
        x: 48,          // col 3 × 16
        y: 112,         // row 7 × 16
        width:  16,
        height: 16,
        speed:  60,     // pixels per second
    },

    /* Stats — placeholder values until stats.js */
    stats: {
        intelligence: 30,
        strength:     25,
        charisma:     20,
        dexterity:    15,
        luck:         0    // Derived: avg of above four
    },

    /* Flags */
    ready:    false,    // True after all assets loaded
    paused:   false,
};

/* ── CANVAS SETUP ────────────────────────────────────────────────── */
function resizeCanvas() {
    const canvas = G.canvas;

    /*
       clientWidth/Height on the documentElement is the most reliable
       cross-browser measurement of the actual visible viewport, correctly
       excluding browser chrome (address bar, navigation) on mobile.
       window.innerHeight is unreliable on iOS Safari and some Android
       browsers — it includes or excludes the browser UI inconsistently.
    */
    const winW = document.documentElement.clientWidth;
    const winH = document.documentElement.clientHeight;

    /*
       Scale the 320×180 canvas to fill the window while preserving
       the 16:9 aspect ratio. Math.min ensures neither axis overflows.
    */
    const scaleX = winW / CANVAS_W;
    const scaleY = winH / CANVAS_H;
    const scale  = Math.min(scaleX, scaleY);

    const cssW = Math.floor(CANVAS_W * scale);
    const cssH = Math.floor(CANVAS_H * scale);

    /* Set the internal drawing resolution (must set attributes, not style) */
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;

    /*
       Set CSS display size on BOTH axes explicitly.
       The browser applies intrinsic aspect-ratio from the canvas
       width/height attributes — if we only set one CSS dimension, the
       browser computes the other via that ratio, which conflicts with
       our JS calculation and produces the wrong size.
       Setting both locks out the browser's intrinsic sizing entirely.
    */
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    G.scale = scale;
}

/* ── CAMERA ──────────────────────────────────────────────────────── */
function updateCamera() {
    const world = World.worldSize();
    if (!world.width) return;

    /* Centre camera on player */
    const targetX = G.player.x + G.player.width  / 2 - CANVAS_W / 2;
    const targetY = G.player.y + G.player.height / 2 - CANVAS_H / 2;

    /* Clamp so camera never shows outside map bounds */
    G.camera.x = Math.max(0, Math.min(targetX, world.width  - CANVAS_W));
    G.camera.y = Math.max(0, Math.min(targetY, world.height - CANVAS_H));
}

/* ── FPS COUNTER ─────────────────────────────────────────────────── */
function updateFPS(dt) {
    G.fpsTimer += dt;
    G.frameCount++;
    if (G.fpsTimer >= 1000) {
        G.fps       = G.frameCount;
        G.frameCount = 0;
        G.fpsTimer  -= 1000;
        const el = document.getElementById('dev-fps');
        if (el) el.textContent = `${G.fps}fps`;
    }
}

/* ── DEV TILE DISPLAY ────────────────────────────────────────────── */
function updateDevTile() {
    const ts  = World.tileSize();
    if (!ts) return;
    const col = Math.floor((G.player.x + G.player.width  / 2) / ts);
    const row = Math.floor((G.player.y + G.player.height / 2) / ts);
    const el  = document.getElementById('dev-tile');
    if (el) el.textContent = `${col},${row}`;
}

/* ── DRAW PLAYER PLACEHOLDER ─────────────────────────────────────── */
/*
   Step 1 placeholder — draws a coloured rectangle where the player is.
   Replaced by full sprite rendering in Step 2 (player.js).
*/
function drawPlayerPlaceholder(ctx) {
    const px = Math.round(G.player.x - G.camera.x);
    const py = Math.round(G.player.y - G.camera.y);

    ctx.fillStyle = '#00F2FF';
    ctx.fillRect(px, py, G.player.width, G.player.height);

    /* Facing indicator — small dot at top */
    ctx.fillStyle = '#0A0B10';
    ctx.fillRect(px + 6, py + 2, 4, 4);
}

/* ── GAME LOOP ───────────────────────────────────────────────────── */
function tick(timestamp) {
    if (!G.ready) {
        requestAnimationFrame(tick);
        return;
    }

    const dt = Math.min(timestamp - G.lastTime, 100); // cap delta at 100ms
    G.lastTime = timestamp;

    if (!G.paused) {
        update(dt);
        render();
    }

    updateFPS(dt);
    requestAnimationFrame(tick);
}

function update(dt) {
    /* Step 2 will add: Player.update(dt) */
    /* Step 5 will add: NPC.update(dt) */

    updateCamera();
    updateDevTile();
}

function render() {
    const ctx = G.ctx;
    ctx.imageSmoothingEnabled = false;

    /* Clear */
    ctx.fillStyle = '#0D1B2A';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    /* World tiles */
    World.draw(ctx, G.camera);

    /* Player placeholder (replaced in Step 2) */
    drawPlayerPlaceholder(ctx);
}

/* ── BASIC KEYBOARD MOVEMENT (Step 1 stub) ───────────────────────── */
/*
   Minimal WASD/arrow key movement so the world is navigable immediately.
   Step 2 (player.js) replaces this with full collision + animation.
*/
const _keys = {};
window.addEventListener('keydown', e => { _keys[e.key] = true; });
window.addEventListener('keyup',   e => { _keys[e.key] = false; });

function _applyKeyboardMovement(dt) {
    const speed  = G.player.speed * (dt / 1000);
    const ts     = World.tileSize();
    let { x, y } = G.player;

    if (_keys['ArrowUp']    || _keys['w'] || _keys['W']) y -= speed;
    if (_keys['ArrowDown']  || _keys['s'] || _keys['S']) y += speed;
    if (_keys['ArrowLeft']  || _keys['a'] || _keys['A']) x -= speed;
    if (_keys['ArrowRight'] || _keys['d'] || _keys['D']) x += speed;

    /* Simple tile collision check */
    const hw = G.player.width / 2;
    const hh = G.player.height / 2;

    /* Check horizontal */
    const newCol = Math.floor((x + hw) / ts);
    const curRow = Math.floor((G.player.y + hh) / ts);
    if (!World.isSolid(newCol, curRow)) {
        G.player.x = x;
    }

    /* Check vertical */
    const newRow = Math.floor((G.player.y + hh + (y - G.player.y)) / ts);
    const curCol = Math.floor((G.player.x + hw) / ts);
    if (!World.isSolid(curCol, newRow)) {
        G.player.y = y;
    }

    /* Clamp to world bounds */
    const world = World.worldSize();
    G.player.x = Math.max(ts, Math.min(G.player.x, world.width  - ts - G.player.width));
    G.player.y = Math.max(ts, Math.min(G.player.y, world.height - ts - G.player.height));
}

/* Patch update() to include keyboard movement */
const _originalUpdate = update;
function update(dt) {
    _applyKeyboardMovement(dt);
    updateCamera();
    updateDevTile();
}

/* ── SYSTEM WINDOW TOGGLE ────────────────────────────────────────── */
function initSystemWindowToggle() {
    const btn    = document.getElementById('btn-system');
    const panel  = document.getElementById('system-window');
    const close  = document.getElementById('btn-system-close');

    btn.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) {
            /* Step 3 will call SystemWindow.render() here */
            renderSystemWindowPlaceholder();
        }
    });

    close.addEventListener('click', () => {
        panel.hidden = true;
    });
}

function renderSystemWindowPlaceholder() {
    const body = document.getElementById('system-window-body');
    const s = G.stats;
    s.luck = Math.round((s.intelligence + s.strength + s.charisma + s.dexterity) / 4);

    body.innerHTML = `
        <p class="syd-line syd-new">[ SYSTEM ONLINE ]</p>
        <p class="syd-line dim">MAP: ${G.mapId.toUpperCase()}</p>
        <br>
        <p class="syd-line">[ STATS ]</p>
        ${statBar('INTELLIGENCE', s.intelligence, 'intelligence')}
        ${statBar('STRENGTH',     s.strength,     'strength')}
        ${statBar('CHARISMA',     s.charisma,     'charisma')}
        ${statBar('DEXTERITY',    s.dexterity,    'dexterity')}
        ${statBar('LUCK',         s.luck,         'luck')}
    `;
}

function statBar(label, value, cls) {
    return `
        <div class="stat-row">
            <span class="stat-label">${label}</span>
            <div class="stat-bar-track">
                <div class="stat-bar-fill ${cls}" style="width:${value}%"></div>
            </div>
            <span class="stat-value">${value}</span>
        </div>
    `;
}

/* ── ASSET LOADING ───────────────────────────────────────────────── */
async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
}

async function init() {
    /* Canvas */
    G.canvas = document.getElementById('game-canvas');
    G.ctx    = G.canvas.getContext('2d');
    G.ctx.imageSmoothingEnabled = false;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* UI */
    initSystemWindowToggle();

    try {
        /* Load data */
        const [spriteMap, mapsData] = await Promise.all([
            loadJSON('data/sprite-map.json'),
            loadJSON('data/maps.json'),
        ]);

        /* Initialise world */
        World.init(spriteMap, mapsData);
        await World.loadMap(G.mapId);

        /* Set player to spawn point */
        const spawn = World.currentMap.playerSpawn;
        const ts    = World.tileSize();
        G.player.x  = spawn.col * ts;
        G.player.y  = spawn.row * ts;

        G.ready    = true;
        G.lastTime = performance.now();

        console.log('[/loop] Initialised. Starting game loop.');
        requestAnimationFrame(tick);

    } catch (err) {
        console.error('[/loop] Init failed:', err);
        showFatalError(err.message);
    }
}

function showFatalError(msg) {
    document.body.innerHTML = `
        <div style="
            position:fixed; inset:0; display:flex;
            align-items:center; justify-content:center;
            background:#0A0B10; font-family:monospace;
            flex-direction:column; gap:16px; padding:24px;
        ">
            <p style="color:#00F2FF; letter-spacing:3px; font-size:12px">[ SYSTEM ERROR ]</p>
            <p style="color:#E63B2E; font-size:11px; max-width:320px; text-align:center">${msg}</p>
            <p style="color:#4A4D5E; font-size:10px">Check console for details. Ensure Live Server is running.</p>
        </div>
    `;
}

/* ── BOOT ────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', init);