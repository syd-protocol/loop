/* ── player.js ───────────────────────────────────────────────────────
   Step 2. Owns:
   - Sprite rendering from player.png using sprite-map.json
   - Walk animation (8-frame cycle, direction-aware)
   - Tap-to-move: BFS pathfinding on the tile grid
   - Mouse click movement (same as tap — uses pointerdown)
   - Keyboard movement (WASD / arrow keys) — replaces main.js stub
   - Collision detection (axis-separated, tile-based)
   - Map transition detection and execution

   Public API (called by main.js):
     Player.init(spriteMap)   — call once after assets load
     Player.update(dt)        — call every frame before render
     Player.draw(ctx, camera) — call every frame during render
     Player.setSpawn(col,row) — position player on map load
──────────────────────────────────────────────────────────────────── */

const Player = (() => {

    /* ── Sprite constants ───────────────────────────────────────── */
    /*
       player.png layout: default (frames left-to-right, directions top-to-bottom)
       frameWidth: 176, frameHeight: 192
       8 frames per direction — full smooth walk cycle
       Row 0: walk-down (front)  Row 1: walk-up (back)
       Row 2: walk-left          Row 3: walk-right
       Rendered at 16×16px in the world (one tile)
    */
    const SPRITE_KEY  = 'player';
    const RENDER_W    = 16;
    const RENDER_H    = 16;
    const WALK_FRAMES = 8;
    const WALK_FPS    = 8;
    const WALK_MS     = 1000 / WALK_FPS;   // ms per animation frame

    const DIR_ROW = { down: 0, up: 1, left: 2, right: 3 };

    /* ── Private state ──────────────────────────────────────────── */
    let _img    = null;
    let _fw     = 176;
    let _fh     = 192;
    let _ready  = false;

    let _x      = 0;     // world pixel position (top-left of sprite)
    let _y      = 0;
    let _facing = 'down';
    let _moving = false;

    let _frameIndex = 0;
    let _frameTimer = 0;

    let _path       = [];   // [{col,row}, ...] waypoints remaining
    let _pathTarget = null; // final destination for visual indicator

    const _keys = {};

    let _transitionCooldown = 0;  // ms — prevents instant re-trigger
    let _keyboardLoggedOnce = false;

    /* ── Image loader ───────────────────────────────────────────── */
    function _loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload  = () => resolve(img);
            img.onerror = () => reject(new Error(`Player: cannot load ${src}`));
            img.src = src;
        });
    }

    /* ── BFS Pathfinder ─────────────────────────────────────────── */
    /*
       Breadth-first search — guarantees shortest path on a uniform grid.
       Returns array of {col, row} from start (exclusive) to end (inclusive).
       Returns [] if no path or start === end.
       Capped at MAX_NODES to prevent freezes on very long paths.
    */
    function _bfs(sc, sr, ec, er) {
        if (sc === ec && sr === er) return [];
        if (World.isSolid(ec, er)) return [];

        const MAX_NODES = 3000;
        const visited   = new Set([`${sc},${sr}`]);
        const queue     = [{ c: sc, r: sr, path: [] }];
        const DIRS      = [{dc:0,dr:-1},{dc:0,dr:1},{dc:-1,dr:0},{dc:1,dr:0}];

        let n = 0;
        while (queue.length && n++ < MAX_NODES) {
            const { c, r, path } = queue.shift();
            for (const { dc, dr } of DIRS) {
                const nc = c + dc, nr = r + dr;
                const key = `${nc},${nr}`;
                if (visited.has(key) || World.isSolid(nc, nr)) continue;
                visited.add(key);
                const np = [...path, { col: nc, row: nr }];
                if (nc === ec && nr === er) return np;
                queue.push({ c: nc, r: nr, path: np });
            }
        }
        return [];
    }

    /* ── Input setup ────────────────────────────────────────────── */
    function _initInput() {
        const MOVE_KEYS = new Set([
            'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
            'w','a','s','d','W','A','S','D'
        ]);

        window.addEventListener('keydown', e => {
            _keys[e.key] = true;
            if (MOVE_KEYS.has(e.key)) {
                /* Keyboard cancels active path */
                _path = [];
                _pathTarget = null;
            }
        });
        window.addEventListener('keyup', e => { _keys[e.key] = false; });

        /* Tap / click to move */
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('pointerdown', e => {
            /* Ignore if the pointer is over a UI element */
            if (e.target !== canvas) return;
            e.preventDefault();

            /* CSS pixel → world pixel */
            const rect   = canvas.getBoundingClientRect();
            const worldX = (e.clientX - rect.left)  / G.scale + G.camera.x;
            const worldY = (e.clientY - rect.top)   / G.scale + G.camera.y;

            const ts  = World.tileSize();
            const dc  = Math.floor(worldX / ts);
            const dr  = Math.floor(worldY / ts);

            const solid = World.isSolid(dc, dr);
            const sc = Math.floor((_x + RENDER_W / 2) / ts);
            const sr = Math.floor((_y + RENDER_H / 2) / ts);

            console.log(`[tap] dest=(${dc},${dr}) solid=${solid} player=(${sc},${sr}) px=(${_x.toFixed(0)},${_y.toFixed(0)}) cam=(${G.camera.x.toFixed(0)},${G.camera.y.toFixed(0)}) scale=${G.scale.toFixed(2)}`);

            if (solid) return;

            const path = _bfs(sc, sr, dc, dr);
            console.log(`[tap] BFS → ${path.length} steps`);

            if (path.length > 0) {
                _path = path;
                _pathTarget = { col: dc, row: dr };
            }
        });
    }

    /* ── Collision ──────────────────────────────────────────────── */
    const HIT_MARGIN = 2;   // inset hitbox by 2px on each side

    function _solidAt(wx, wy) {
        const ts = World.tileSize();
        return World.isSolid(Math.floor(wx / ts), Math.floor(wy / ts));
    }

    /* Returns true if placing the player at (nx, ny) would overlap a solid tile */
    function _collidesAt(nx, ny) {
        const x0 = nx + HIT_MARGIN,        y0 = ny + HIT_MARGIN;
        const x1 = nx + RENDER_W - HIT_MARGIN - 1;
        const y1 = ny + RENDER_H - HIT_MARGIN - 1;
        return _solidAt(x0, y0) || _solidAt(x1, y0) ||
               _solidAt(x0, y1) || _solidAt(x1, y1);
    }

    /* ── Keyboard movement ───────────────────────────────────────── */
    function _applyKeyboard(dt) {
        let dx = 0, dy = 0;
        if (_keys['ArrowUp']    || _keys['w'] || _keys['W']) dy -= 1;
        if (_keys['ArrowDown']  || _keys['s'] || _keys['S']) dy += 1;
        if (_keys['ArrowLeft']  || _keys['a'] || _keys['A']) dx -= 1;
        if (_keys['ArrowRight'] || _keys['d'] || _keys['D']) dx += 1;
        if (dx === 0 && dy === 0) return false;
        if (!_keyboardLoggedOnce) {
            _keyboardLoggedOnce = true;
            const ts = World.tileSize();
            const col = Math.floor((_x + RENDER_W/2) / ts);
            const row = Math.floor((_y + RENDER_H/2) / ts);
            const ws = World.worldSize();
            console.log(`[key] first move: dx=${dx} dy=${dy} tile=(${col},${row}) px=(${_x.toFixed(0)},${_y.toFixed(0)}) world=${ws.width}x${ws.height} isSolid=${World.isSolid(col,row)}`);
        }

        /* Normalise diagonal */
        const len = Math.sqrt(dx * dx + dy * dy);
        const spd = (80 * dt) / (1000 * len);
        dx *= spd; dy *= spd;

        const nx = _x + dx, ny = _y + dy;
        if (!_collidesAt(nx, _y)) _x = nx;
        if (!_collidesAt(_x, ny)) _y = ny;

        /* Clamp to world bounds */
        const ws = World.worldSize();
        _x = Math.max(0, Math.min(_x, ws.width  - RENDER_W));
        _y = Math.max(0, Math.min(_y, ws.height - RENDER_H));

        /* Facing from dominant axis */
        if (Math.abs(dx) >= Math.abs(dy)) _facing = dx > 0 ? 'right' : 'left';
        else                               _facing = dy > 0 ? 'down'  : 'up';
        return true;
    }

    /* ── Path following ─────────────────────────────────────────── */
    function _followPath(dt) {
        if (_path.length === 0) return false;

        const ts      = World.tileSize();
        const next    = _path[0];
        const tx      = next.col * ts;
        const ty      = next.row * ts;
        const spd     = (80 * dt) / 1000;
        const dx      = tx - _x, dy = ty - _y;
        const dist    = Math.sqrt(dx * dx + dy * dy);

        if (dist <= spd) {
            /* Snap to waypoint and advance */
            _x = tx; _y = ty;
            _path.shift();
            if (_path.length === 0) _pathTarget = null;
        } else {
            /* Move toward waypoint with collision */
            const nx = _x + (dx / dist) * spd;
            const ny = _y + (dy / dist) * spd;
            if (!_collidesAt(nx, _y)) _x = nx;
            if (!_collidesAt(_x, ny)) _y = ny;

            if (Math.abs(dx) >= Math.abs(dy)) _facing = dx > 0 ? 'right' : 'left';
            else                               _facing = dy > 0 ? 'down'  : 'up';
        }
        return true;
    }

    /* ── Animation ───────────────────────────────────────────────── */
    function _animate(dt, moving) {
        if (!moving) { _frameIndex = 0; _frameTimer = 0; return; }
        _frameTimer += dt;
        if (_frameTimer >= WALK_MS) {
            _frameTimer -= WALK_MS;
            _frameIndex  = (_frameIndex + 1) % WALK_FRAMES;
        }
    }

    /* ── Transition check ────────────────────────────────────────── */
    function _checkTransition() {
        if (_transitionCooldown > 0) return;

        const ts  = World.tileSize();
        const col = Math.floor((_x + RENDER_W / 2) / ts);
        const row = Math.floor((_y + RENDER_H / 2) / ts);

        const t = World.getTransition(col, row);
        if (!t) return;

        _transitionCooldown = 1500;
        _path = []; _pathTarget = null;
        _keyboardLoggedOnce = false;
        console.log(`[Player] → ${t.toMap} (${t.label})`);
        _doTransition(t);
    }

    async function _doTransition(t) {
        const overlay = document.getElementById('transition-overlay');

        /* Fade out */
        if (overlay) { overlay.style.opacity = '1'; }
        await new Promise(r => setTimeout(r, 300));

        /* Load map */
        await World.loadMap(t.toMap);
        G.mapId = t.toMap;

        /* Reposition player */
        const ts = World.tileSize();
        _x = t.toSpawn.col * ts;
        _y = t.toSpawn.row * ts;
        _facing = 'down';
        _frameIndex = 0;
        _frameTimer = 0;
        _moving = false;

        /* Sync G.player immediately so updateCamera has correct values */
        G.player.x = _x;
        G.player.y = _y;
        G.player.width  = RENDER_W;
        G.player.height = RENDER_H;

        /* Force camera to centre on player before first frame renders.
           Without this, G.camera stays at {0,0} for one frame, causing
           the player to render off-screen and pointerdown to calculate
           wrong world coordinates on the first tap. */
        const world = World.worldSize();
        G.camera.x = Math.max(0, Math.min(
            _x + RENDER_W / 2 - G.viewW / 2,
            Math.max(0, world.width  - G.viewW)
        ));
        G.camera.y = Math.max(0, Math.min(
            _y + RENDER_H / 2 - G.viewH / 2,
            Math.max(0, world.height - G.viewH)
        ));

        /* Fade in */
        if (overlay) { overlay.style.opacity = '0'; }
        console.log(`[Player] Loaded ${t.toMap}`);
    }

    /* ── Public API ─────────────────────────────────────────────── */

    async function init(spriteMap) {
        const entry = spriteMap[SPRITE_KEY];
        if (!entry) throw new Error('Player: missing sprite-map entry for "player"');
        _fw  = entry.frameWidth;
        _fh  = entry.frameHeight;
        _img = await _loadImage(entry.src);
        _initInput();
        _ready = true;
        console.log(`[Player] Ready — ${entry.src} (frame ${_fw}×${_fh})`);
    }

    function setSpawn(col, row) {
        const ts = World.tileSize();
        _x = col * ts; _y = row * ts;
        _facing = 'down'; _frameIndex = 0;
        _path = []; _pathTarget = null;
        G.player.x = _x; G.player.y = _y;
        G.player.width  = RENDER_W;
        G.player.height = RENDER_H;
    }

    function update(dt) {
        if (!_ready) return;
        if (_transitionCooldown > 0) _transitionCooldown -= dt;

        const byKey  = _applyKeyboard(dt);
        const byPath = !byKey && _followPath(dt);
        _moving = byKey || byPath;

        _animate(dt, _moving);
        _checkTransition();

        G.player.x = _x;
        G.player.y = _y;
    }

    function draw(ctx, camera) {
        if (!_ready || !_img) return;

        const srcX  = _frameIndex * _fw;
        const srcY  = (DIR_ROW[_facing] ?? 0) * _fh;
        const destX = Math.round(_x - camera.x);
        const destY = Math.round(_y - camera.y);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(_img, srcX, srcY, _fw, _fh, destX, destY, RENDER_W, RENDER_H);

        /* Tap destination indicator — cyan tile outline */
        if (_pathTarget) {
            const ts = World.tileSize();
            const tx = Math.round(_pathTarget.col * ts - camera.x);
            const ty = Math.round(_pathTarget.row * ts - camera.y);
            ctx.strokeStyle = 'rgba(0,242,255,0.6)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(tx + 0.5, ty + 0.5, ts - 1, ts - 1);
        }
    }

    return { init, update, draw, setSpawn };

})();