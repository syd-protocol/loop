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

    /* Viewport size in internal (canvas) pixels — updated by resizeCanvas() */
    viewW: 320,
    viewH: 180,

    /* Flags */
    ready:    false,    // True after all assets loaded
    paused:   false,
};

/* ── CANVAS SETUP ────────────────────────────────────────────────── */
function resizeCanvas() {
    const canvas = G.canvas;

    const winW = document.documentElement.clientWidth;
    const winH = document.documentElement.clientHeight;

    /*
       The game canvas fills the FULL viewport.
       On portrait mobile this means the internal resolution is taller
       than 320×180 — we scale 320px wide and let the height be whatever
       the viewport gives us. The world camera handles what is visible.
       This removes all black bars on any screen shape.

       Internal resolution: always 320px wide.
       Height: derived from viewport aspect ratio so pixels stay square.
    */
    const scale   = winW / CANVAS_W;               // fit width exactly
    const cssW    = winW;
    const cssH    = winH;
    const internalH = Math.ceil(winH / scale);     // internal px height

    /* Update internal constants so camera and rendering use correct size */
    G.viewW = CANVAS_W;
    G.viewH = internalH;

    canvas.width  = CANVAS_W;
    canvas.height = internalH;
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    G.scale = scale;

    console.log(
        `[resize] viewport=${winW}×${winH} ` +
        `canvas=${CANVAS_W}×${internalH} internal ` +
        `css=${cssW}×${cssH}px scale=${scale.toFixed(3)}`
    );
}

/* ── CAMERA ──────────────────────────────────────────────────────── */
function updateCamera() {
    const world = World.worldSize();
    if (!world.width) return;

    /* Centre camera on player — use live viewport size */
    const targetX = G.player.x + G.player.width  / 2 - G.viewW / 2;
    const targetY = G.player.y + G.player.height / 2 - G.viewH / 2;

    /* Clamp camera so it never shows outside the map.
       If the world is smaller than the viewport on an axis, centre it. */
    const maxCamX = Math.max(0, world.width  - G.viewW);
    const maxCamY = Math.max(0, world.height - G.viewH);
    G.camera.x = Math.max(0, Math.min(targetX, maxCamX));
    G.camera.y = Math.max(0, Math.min(targetY, maxCamY));
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

/* Player drawing handled by Player.draw() in player.js */

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
    Player.update(dt);       // movement, animation, transitions
    /* Step 5 will add: NPC.update(dt) */

    updateCamera();
    updateDevTile();
}

function render() {
    const ctx = G.ctx;
    ctx.imageSmoothingEnabled = false;

    /* Clear full internal canvas (height varies with viewport) */
    ctx.fillStyle = '#0D1B2A';
    ctx.fillRect(0, 0, G.viewW, G.viewH);

    /* World tiles */
    World.draw(ctx, G.camera);

    /* Player sprite */
    Player.draw(ctx, G.camera);
}

/* Keyboard and tap-to-move handled by player.js (Step 2) */

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
        console.log('[init] Loading data...');
        const [spriteMap, mapsData] = await Promise.all([
            loadJSON('data/sprite-map.json'),
            loadJSON('data/maps.json'),
        ]);
        console.log('[init] sprite-map.json loaded. Entries:', Object.keys(spriteMap));
        console.log('[init] maps.json loaded. Maps:', Object.keys(mapsData));

        /* Initialise world */
        World.init(spriteMap, mapsData);
        console.log('[init] Loading map:', G.mapId);
        await World.loadMap(G.mapId);
        console.log('[init] Map loaded. Size:', World.worldSize());

        /* Initialise player sprite and input */
        await Player.init(spriteMap);

        /* Set player to spawn point */
        const spawn = World.currentMap.playerSpawn;
        Player.setSpawn(spawn.col, spawn.row);
        console.log(`[init] Player spawn: col=${spawn.col} row=${spawn.row} px=(${G.player.x},${G.player.y})`);
        console.log(`[init] Viewport: ${G.viewW}×${G.viewH} internal, scale=${G.scale.toFixed(3)}`);

        G.ready    = true;
        G.lastTime = performance.now();

        console.log('[init] ✓ Ready. Game loop starting.');
        requestAnimationFrame(tick);

    } catch (err) {
        console.error('[init] ✗ Failed:', err);
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