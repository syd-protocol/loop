/* ── world.js ────────────────────────────────────────────────────────
   Tile-based world renderer.

   Architecture:
   - Each map is rendered ONCE into an off-screen OffscreenCanvas buffer
     when loaded. Every subsequent frame draws that buffer as a single
     drawImage() call — keeps the per-frame cost near zero.
   - The camera follows the player with sub-tile smoothing.
   - Collision data is derived from the tile grid at load time.
   - Map transitions are registered as interactable zones.

   Public API (called by main.js):
     World.init(spriteMap)          — call once after assets load
     World.loadMap(mapId)           — load and buffer a map
     World.draw(ctx, camera)        — draw buffered map to game canvas
     World.isSolid(col, row)        — collision check
     World.getTransition(col, row)  — returns transition def or null
     World.currentMap               — active map definition object
──────────────────────────────────────────────────────────────────── */

/* ── MAP REDESIGN TODO ───────────────────────────────────────────────
   home-flat exit door currently leads from the Study (bottom of map).
   It should exit from the Entrance Hall (top). The interior wall at
   col=20 blocks the bottom-centre tile, so the door was moved to col=10
   as a workaround. Proper fix: redesign the map so the front door is at
   the top outer wall (row=0), with the entrance hall naturally leading to it.
   See maps.json "_todo" field for full details.
──────────────────────────────────────────────────────────────────── */

const World = (() => {

    /* ── Private state ──────────────────────────────────────────── */
    let _spriteMap   = null;    // Full sprite-map.json data
    let _mapsData    = null;    // Full maps.json data
    let _mapDef      = null;    // Active map definition
    let _buffer      = null;    // OffscreenCanvas (or regular Canvas fallback)
    let _bufferCtx   = null;
    let _tilesetImg  = null;    // Loaded tileset image for active map
    let _solidGrid   = [];      // 2D boolean array — true = impassable
    let _transitions = new Map(); // "col,row" → transition definition

    /* Tiles that block movement */
    const SOLID_TILES = new Set(['wall', 'w', 'W', 'desk', 'D', 'bed', 'B', 'bookshelf', 'K', 'lamp', 'l', 'stall', 'S', 's', 'plant', 'n']);

    /* ── Tile image cache ───────────────────────────────────────── */
    const _imageCache = new Map();

    function _loadImage(src) {
        if (_imageCache.has(src)) return Promise.resolve(_imageCache.get(src));
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload  = () => { _imageCache.set(src, img); resolve(img); };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    /* ── Resolve a tile letter → tileset frame name ─────────────── */
    function _resolveTileName(letter, tileKey) {
        return tileKey[letter] ?? 'floor'; // unknown tiles default to floor
    }

    /* ── Tile colour map — base colours per tile type ──────────── */
    /*
       At the game's 16px tile size, tileset PNG textures (352×384 source)
       scale down to near-solid colours. These base fills give each tile
       type a clear, readable identity at small scale. The PNG is then
       composited on top at reduced opacity for texture detail.
    */
    /* ── Tile rendering strategy ────────────────────────────────────
       FLOOR TILES (floor, ground, path, wall) render as SOLID COLOUR ONLY.
       The tileset PNG has transparent cell gaps that show the base fill as
       a dark grid when composited. Solid colour = clean seamless floors.

       OBJECT TILES (desk, bed, bookshelf, door, window, stall, lamp, plant)
       render as PNG ONLY. These are individual objects — transparent gaps
       around them are fine and expected.
    ── */
    const TILE_COLOURS = {
        // Interior — warm, lived-in
        'floor':      '#d4a855',   // warm honey wood — solid, seamless
        'wall':       '#6a7a90',   // cool blue-grey stone — solid boundary
        'desk':       null,        // object — PNG only
        'bed':        null,        // object — PNG only
        'bookshelf':  null,        // object — PNG only
        'door':       '#c89040',   // warm gold base + PNG overlay
        'window':     null,        // object — PNG only
        // Exterior — bright, peaceful daytime
        'ground':     '#5ab832',   // Zelda bright grass — solid, seamless
        'path':       '#c8a050',   // warm sandstone — solid, seamless
        'stall':      null,        // object — PNG only
        'lamp':       null,        // object — PNG only
        'plant':      null,        // object — PNG only
        // Fallback
        'default':    '#5ab832',
    };

    /* Tiles that render as solid colour only — no PNG composite */
    const SOLID_COLOUR_TILES = new Set([
        'floor', 'ground', 'path', 'wall'
    ]);

    function _tileColour(tileName) {
        return TILE_COLOURS[tileName] ?? TILE_COLOURS['default'];
    }

    function _isSolidColourTile(tileName) {
        return SOLID_COLOUR_TILES.has(tileName);
    }

    /* ── Build the off-screen buffer for a loaded map ───────────── */
    function _buildBuffer(mapDef, tilesetImg, spriteMapEntry) {
        const tileSize = mapDef.tileSize;   // 16
        const cols     = mapDef.cols;
        const rows     = mapDef.rows;
        const pw       = cols * tileSize;   // pixel width of full map
        const ph       = rows * tileSize;   // pixel height of full map

        /* Create buffer — prefer OffscreenCanvas for performance */
        let buf, bCtx;
        if (typeof OffscreenCanvas !== 'undefined') {
            buf  = new OffscreenCanvas(pw, ph);
            bCtx = buf.getContext('2d');
        } else {
            buf  = document.createElement('canvas');
            buf.width  = pw;
            buf.height = ph;
            bCtx = buf.getContext('2d');
        }

        bCtx.imageSmoothingEnabled = false;

        const tw = spriteMapEntry.tileWidth;
        const th = spriteMapEntry.tileHeight;

        /* Draw every tile */
        for (let r = 0; r < rows; r++) {
            const rowStr = mapDef.tiles[r];
            const cells  = rowStr.trim().split(/\s+/);
            for (let c = 0; c < cols; c++) {
                const letter   = cells[c] ?? 'f';
                const tileName = _resolveTileName(letter, mapDef.tileKey);
                const tileCoords = spriteMapEntry.tiles[tileName];

                if (!tileCoords) {
                    /* Unknown tile — draw a magenta error square */
                    bCtx.fillStyle = '#FF00FF';
                    bCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                    continue;
                }

                if (_isSolidColourTile(tileName)) {
                    /* ── FLOOR / GROUND / PATH / WALL ───────────────────────
                       Pure solid colour. No PNG composite.
                       The tileset PNG has transparent cell gaps that render
                       as a dark grid when composited at small scale.
                       Solid flat colour gives clean seamless surfaces —
                       exactly how Zelda's floors and grass work. */
                    bCtx.fillStyle = _tileColour(tileName);
                    bCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);

                } else {
                    /* ── OBJECT TILES ────────────────────────────────────────
                       PNG only. These are furniture, doors, windows, stalls —
                       individual objects where transparent edges are expected.
                       Draw the PNG source at full alpha, no base fill needed. */
                    bCtx.globalAlpha = 1.0;
                    bCtx.drawImage(
                        tilesetImg,
                        tileCoords.x, tileCoords.y, tw, th,
                        c * tileSize, r * tileSize, tileSize, tileSize
                    );
                    bCtx.globalAlpha = 1.0;

                    /* Door: add warm gold highlight so exits read as inviting */
                    if (tileName === 'door') {
                        bCtx.fillStyle = 'rgba(220, 170, 40, 0.45)';
                        bCtx.fillRect(
                            c * tileSize + 4, r * tileSize,
                            tileSize - 8, tileSize - 2
                        );
                    }
                }
            }
        }

        return { buf, bCtx, pw, ph };
    }

    /* ── Build collision and transition lookup tables ────────────── */
    function _buildGridData(mapDef) {
        const rows = mapDef.rows;
        const cols = mapDef.cols;
        _solidGrid   = [];
        _transitions = new Map();

        for (let r = 0; r < rows; r++) {
            _solidGrid[r] = [];
            const cells = mapDef.tiles[r].trim().split(/\s+/);
            for (let c = 0; c < cols; c++) {
                const letter   = cells[c] ?? 'f';
                const tileName = _resolveTileName(letter, mapDef.tileKey);
                _solidGrid[r][c] = SOLID_TILES.has(tileName) || SOLID_TILES.has(letter);
            }
        }

        /* Register transition tiles */
        if (mapDef.transitions) {
            for (const t of mapDef.transitions) {
                _transitions.set(`${t.col},${t.row}`, t);
            }
        }
    }

    /* ── Public API ─────────────────────────────────────────────── */

    /**
     * init(spriteMap, mapsData)
     * Must be called once after both JSON files have loaded.
     */
    function init(spriteMap, mapsData) {
        _spriteMap = spriteMap;
        _mapsData  = mapsData;
    }

    /**
     * loadMap(mapId) → Promise<void>
     * Loads the tileset image and builds the off-screen buffer for mapId.
     * Resolves when the map is ready to render.
     */
    async function loadMap(mapId) {
        const mapDef = _mapsData[mapId];
        if (!mapDef) throw new Error(`Unknown map: ${mapId}`);

        const tilesetKey = mapDef.tileset;       // e.g. "tileset-interior"
        const spriteEntry = _spriteMap[tilesetKey];
        if (!spriteEntry) throw new Error(`No sprite-map entry for tileset: ${tilesetKey}`);

        /* Load tileset image */
        const img = await _loadImage(spriteEntry.src);

        /* Build buffer and grid data */
        const { buf, bCtx, pw, ph } = _buildBuffer(mapDef, img, spriteEntry);

        _mapDef     = mapDef;
        _tilesetImg = img;
        _buffer     = buf;
        _bufferCtx  = bCtx;

        _buildGridData(mapDef);

        console.log(`[World] Loaded map: ${mapId} (${mapDef.cols}×${mapDef.rows} tiles, ${pw}×${ph}px buffer)`);
    }

    /**
     * draw(ctx, camera)
     * Draws the buffered map to the game canvas, offset by camera.
     * camera = { x, y } in pixels (top-left of viewport into the world).
     *
     * Called every frame — should be a single drawImage() call.
     */
    function draw(ctx, camera) {
        if (!_buffer) return;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            _buffer,
            Math.round(-camera.x),
            Math.round(-camera.y)
        );
    }

    /**
     * isSolid(col, row) → boolean
     * Returns true if the tile at (col, row) blocks movement.
     * Out-of-bounds tiles are treated as solid.
     */
    function isSolid(col, row) {
        if (!_mapDef) return true;
        if (row < 0 || row >= _mapDef.rows) return true;
        if (col < 0 || col >= _mapDef.cols) return true;
        return _solidGrid[row]?.[col] ?? true;
    }

    /**
     * getTransition(col, row) → transition object | null
     * Returns the transition definition if the tile is a map exit.
     */
    function getTransition(col, row) {
        return _transitions.get(`${col},${row}`) ?? null;
    }

    /**
     * worldSize() → { width, height } in pixels
     * Pixel dimensions of the full current map.
     */
    function worldSize() {
        if (!_mapDef) return { width: 0, height: 0 };
        return {
            width:  _mapDef.cols * _mapDef.tileSize,
            height: _mapDef.rows * _mapDef.tileSize
        };
    }

    /**
     * tileSize() → number
     * Returns the tile size in world pixels for the active map.
     */
    function tileSize() {
        return _mapDef?.tileSize ?? 16;
    }

    return {
        init,
        loadMap,
        draw,
        isSolid,
        getTransition,
        worldSize,
        tileSize,
        get currentMap() { return _mapDef; }
    };

})();