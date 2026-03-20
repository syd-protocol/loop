/* ── tile-painter.js — Canvas-drawn tile functions ───────────────────
   Each function paints one 32×32 tile at (px, py) onto ctx.
   No PNG loading. No grid artifacts. Full palette control.
   Called from world.js _buildBuffer() instead of drawImage().
──────────────────────────────────────────────────────────────────── */

const TilePainter = (() => {

    /* ── Palette ────────────────────────────────────────────────── */
    const C = {
        /* Interior */
        floorBase:      '#d4a855',
        floorGrain:     '#c49840',
        floorGrainDark: '#b88830',
        wallBase:       '#7a8fa8',
        wallBrick:      '#6a7f98',
        wallMortar:     '#8a9fb8',
        deskBase:       '#1a2a3a',
        deskScreen:     '#00c8e0',
        deskScreenGlow: '#004858',
        deskLeg:        '#0a1a28',
        bedBase:        '#2a3a5a',
        bedSheet:       '#3a4a6a',
        bedPillow:      '#c8d0e0',
        bedFrame:       '#1a2a40',
        shelfBase:      '#1a1a1a',
        shelfBoard:     '#2a1a0a',
        shelfBooks:     ['#e63b2e','#1a6bff','#9b5de5','#00a878','#f4c430','#e07030','#30a0e0','#d04080'],
        doorBase:       '#8a5a20',
        doorFrame:      '#5a3a10',
        doorPanel:      '#a06828',
        doorHandle:     '#f4c430',
        windowBase:     '#90c8e8',
        windowFrame:    '#4a6a80',
        windowGlow:     '#c0e8ff',
        /* Exterior */
        groundBase:     '#5ab832',
        groundBlade:    '#48a028',
        groundBlade2:   '#68d040',
        pathBase:       '#c8a050',
        pathStone:      '#b89040',
        pathCrack:      '#a88030',
        extWallBase:    '#8090a8',
        extWallBrick:   '#707f97',
        extWallMortar:  '#909fb8',
        stallBase:      '#2a1a08',
        stallAwning1:   '#e8c020',
        stallAwning2:   '#1a1a1a',
        stallCounter:   '#3a2a10',
        stallGoods:     ['#e63b2e','#1a6bff','#f4c430'],
        lampPost:       '#4a4a4a',
        lampHead:       '#3a3a3a',
        lampGlow:       '#00f2ff',
        lampGlowFade:   'rgba(0,242,255,0.15)',
        plantBase:      '#30a020',
        plantDark:      '#208010',
        plantLight:     '#50c030',
    };

    /* ── Helpers ────────────────────────────────────────────────── */
    function rect(ctx, x, y, w, h, colour) {
        ctx.fillStyle = colour;
        ctx.fillRect(x, y, w, h);
    }

    function line(ctx, x1, y1, x2, y2, colour, width = 1) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function circle(ctx, cx, cy, r, colour) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ── Interior tiles ─────────────────────────────────────────── */

    function paintFloor(ctx, px, py, s) {
        /* Warm honey wood — solid base + subtle horizontal grain lines */
        rect(ctx, px, py, s, s, C.floorBase);
        /* Wood grain — 3 subtle horizontal lines at irregular spacing */
        ctx.globalAlpha = 0.35;
        line(ctx, px, py + Math.floor(s * 0.28), px + s, py + Math.floor(s * 0.28), C.floorGrainDark, 1);
        line(ctx, px, py + Math.floor(s * 0.55), px + s, py + Math.floor(s * 0.55), C.floorGrain, 1);
        line(ctx, px, py + Math.floor(s * 0.78), px + s, py + Math.floor(s * 0.78), C.floorGrainDark, 1);
        ctx.globalAlpha = 1.0;
    }

    function paintWallInterior(ctx, px, py, s) {
        /* Soft blue-grey stone — brick pattern */
        rect(ctx, px, py, s, s, C.wallBase);
        const bh = Math.floor(s / 4);   // brick row height
        ctx.globalAlpha = 0.3;
        for (let row = 0; row < 4; row++) {
            const y = py + row * bh;
            const offset = (row % 2 === 0) ? 0 : Math.floor(s / 2);
            /* horizontal mortar line */
            line(ctx, px, y, px + s, y, C.wallMortar, 1);
            /* vertical mortar — staggered */
            line(ctx, px + offset + Math.floor(s / 2), y, px + offset + Math.floor(s / 2), y + bh, C.wallMortar, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    function paintDesk(ctx, px, py, s) {
        /* Dark desk base with glowing cyan monitor */
        rect(ctx, px, py, s, s, C.deskBase);
        /* Desk surface */
        rect(ctx, px + 2, py + Math.floor(s * 0.45), s - 4, Math.floor(s * 0.12), C.deskLeg);
        /* Monitor screen — bright cyan glow */
        const sw = Math.floor(s * 0.65);
        const sh = Math.floor(s * 0.38);
        const sx = px + Math.floor((s - sw) / 2);
        const sy = py + Math.floor(s * 0.06);
        rect(ctx, sx - 1, sy - 1, sw + 2, sh + 2, C.deskLeg);  /* frame */
        rect(ctx, sx, sy, sw, sh, C.deskScreen);                 /* screen */
        /* Screen glow gradient effect — lighter centre */
        ctx.globalAlpha = 0.4;
        rect(ctx, sx + 2, sy + 2, sw - 4, Math.floor(sh * 0.4), C.windowGlow);
        ctx.globalAlpha = 1.0;
        /* Keyboard */
        rect(ctx, sx, sy + sh + 3, sw, 3, C.wallBase);
    }

    function paintBed(ctx, px, py, s) {
        /* Bed frame + pillow + blanket */
        rect(ctx, px, py, s, s, C.bedFrame);
        /* Mattress */
        rect(ctx, px + 2, py + 2, s - 4, s - 4, C.bedBase);
        /* Pillow */
        rect(ctx, px + 3, py + 3, s - 6, Math.floor(s * 0.28), C.bedPillow);
        /* Blanket */
        rect(ctx, px + 3, py + Math.floor(s * 0.38), s - 6, Math.floor(s * 0.55), C.bedSheet);
        /* Blanket fold line */
        ctx.globalAlpha = 0.4;
        line(ctx, px + 3, py + Math.floor(s * 0.42), px + s - 3, py + Math.floor(s * 0.42), C.bedPillow, 1);
        ctx.globalAlpha = 1.0;
    }

    function paintBookshelf(ctx, px, py, s) {
        /* Dark shelving unit + colourful book spines */
        rect(ctx, px, py, s, s, C.shelfBase);
        /* Shelf boards */
        const shelfY = [
            py + Math.floor(s * 0.28),
            py + Math.floor(s * 0.56),
            py + Math.floor(s * 0.84),
        ];
        for (const sy of shelfY) {
            rect(ctx, px + 1, sy, s - 2, 2, C.shelfBoard);
        }
        /* Book spines — packed vertical rectangles in rows */
        const bookW = Math.floor(s / 8);
        for (let row = 0; row < 3; row++) {
            const bookH = Math.floor(s * 0.22);
            const by    = shelfY[row] - bookH;
            for (let i = 0; i < 7; i++) {
                const bx    = px + 2 + i * bookW;
                const colour = C.shelfBooks[(row * 3 + i) % C.shelfBooks.length];
                rect(ctx, bx, by, bookW - 1, bookH, colour);
            }
        }
    }

    function paintDoor(ctx, px, py, s) {
        /* Warm wooden door — frame, panels, handle */
        rect(ctx, px, py, s, s, C.doorFrame);
        /* Door body */
        rect(ctx, px + 2, py + 1, s - 4, s - 1, C.doorBase);
        /* Upper panel */
        rect(ctx, px + 5, py + 3, s - 10, Math.floor(s * 0.38), C.doorPanel);
        /* Lower panel */
        rect(ctx, px + 5, py + Math.floor(s * 0.48), s - 10, Math.floor(s * 0.42), C.doorPanel);
        /* Handle */
        circle(ctx, px + Math.floor(s * 0.72), py + Math.floor(s * 0.55), 2, C.doorHandle);
        /* Top light strip */
        ctx.globalAlpha = 0.5;
        rect(ctx, px + 2, py + 1, s - 4, 2, C.floorBase);
        ctx.globalAlpha = 1.0;
    }

    function paintWindow(ctx, px, py, s) {
        /* Sky blue window with frame cross */
        rect(ctx, px, py, s, s, C.windowFrame);
        rect(ctx, px + 2, py + 2, s - 4, s - 4, C.windowBase);
        /* Cross frame */
        rect(ctx, px + Math.floor(s / 2) - 1, py + 2, 2, s - 4, C.windowFrame);
        rect(ctx, px + 2, py + Math.floor(s / 2) - 1, s - 4, 2, C.windowFrame);
        /* Glow */
        ctx.globalAlpha = 0.35;
        rect(ctx, px + 3, py + 3, Math.floor((s - 6) / 2), Math.floor((s - 6) / 2), C.windowGlow);
        ctx.globalAlpha = 1.0;
    }

    /* ── Exterior tiles ─────────────────────────────────────────── */

    function paintGround(ctx, px, py, s) {
        /* Zelda-style bright grass — solid base + subtle blade hints */
        rect(ctx, px, py, s, s, C.groundBase);
        ctx.globalAlpha = 0.3;
        /* A few diagonal blade strokes for texture */
        const bladeX = [4, 10, 18, 24, 8, 20, 14, 28];
        const bladeY = [6, 14, 4,  20, 24, 10, 28, 18];
        for (let i = 0; i < bladeX.length; i++) {
            const bx = px + bladeX[i];
            const by = py + bladeY[i];
            line(ctx, bx, by, bx + 2, by - 3, C.groundBlade2, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    function paintPath(ctx, px, py, s) {
        /* Warm sandstone path — base + subtle stone block lines */
        rect(ctx, px, py, s, s, C.pathBase);
        ctx.globalAlpha = 0.25;
        /* Horizontal crack */
        line(ctx, px + 2, py + Math.floor(s * 0.5), px + s - 2, py + Math.floor(s * 0.5), C.pathCrack, 1);
        /* Vertical crack — offset */
        line(ctx, px + Math.floor(s * 0.35), py + 2, px + Math.floor(s * 0.35), py + Math.floor(s * 0.5), C.pathCrack, 1);
        line(ctx, px + Math.floor(s * 0.7), py + Math.floor(s * 0.5), px + Math.floor(s * 0.7), py + s - 2, C.pathCrack, 1);
        ctx.globalAlpha = 1.0;
    }

    function paintExtWall(ctx, px, py, s) {
        /* Exterior building wall — brick pattern */
        rect(ctx, px, py, s, s, C.extWallBase);
        const bh = Math.floor(s / 4);
        ctx.globalAlpha = 0.35;
        for (let row = 0; row < 4; row++) {
            const y = py + row * bh;
            const offset = (row % 2 === 0) ? 0 : Math.floor(s / 2);
            line(ctx, px, y, px + s, y, C.extWallMortar, 1);
            line(ctx, px + offset + Math.floor(s / 2), y, px + offset + Math.floor(s / 2), y + bh, C.extWallMortar, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    function paintStall(ctx, px, py, s) {
        /* Market stall — striped awning + counter + goods */
        rect(ctx, px, py, s, s, C.stallBase);
        /* Awning stripes — yellow and dark */
        const stripeW = Math.floor(s / 5);
        for (let i = 0; i < 5; i++) {
            rect(ctx, px + i * stripeW, py, stripeW, Math.floor(s * 0.38),
                i % 2 === 0 ? C.stallAwning1 : C.stallAwning2);
        }
        /* Awning scalloped edge hint */
        ctx.globalAlpha = 0.5;
        line(ctx, px, py + Math.floor(s * 0.38), px + s, py + Math.floor(s * 0.38), C.stallAwning1, 2);
        ctx.globalAlpha = 1.0;
        /* Counter */
        rect(ctx, px + 2, py + Math.floor(s * 0.5), s - 4, Math.floor(s * 0.22), C.stallCounter);
        /* Goods on counter */
        for (let i = 0; i < 3; i++) {
            circle(ctx,
                px + Math.floor(s * 0.22) + i * Math.floor(s * 0.28),
                py + Math.floor(s * 0.58),
                3, C.stallGoods[i]);
        }
    }

    function paintLamp(ctx, px, py, s) {
        /* Street lamp — post + head + cyan glow halo */
        rect(ctx, px, py, s, s, C.groundBase);   /* transparent to grass */
        /* Glow halo */
        ctx.globalAlpha = 0.35;
        circle(ctx, px + Math.floor(s / 2), py + Math.floor(s * 0.28), Math.floor(s * 0.45), C.lampGlow);
        ctx.globalAlpha = 1.0;
        /* Post */
        rect(ctx, px + Math.floor(s / 2) - 1, py + Math.floor(s * 0.28), 2, Math.floor(s * 0.72), C.lampPost);
        /* Head */
        rect(ctx, px + Math.floor(s * 0.3), py + Math.floor(s * 0.12), Math.floor(s * 0.4), Math.floor(s * 0.18), C.lampHead);
        /* Glow core */
        circle(ctx, px + Math.floor(s / 2), py + Math.floor(s * 0.22), 3, C.lampGlow);
    }

    function paintPlant(ctx, px, py, s) {
        /* Green bush — layered leaf circles */
        rect(ctx, px, py, s, s, C.groundBase);   /* transparent to grass */
        /* Dark shadow base */
        circle(ctx, px + Math.floor(s / 2), py + Math.floor(s * 0.65), Math.floor(s * 0.3), C.plantDark);
        /* Main leaf clusters */
        circle(ctx, px + Math.floor(s * 0.35), py + Math.floor(s * 0.45), Math.floor(s * 0.28), C.plantBase);
        circle(ctx, px + Math.floor(s * 0.65), py + Math.floor(s * 0.5),  Math.floor(s * 0.25), C.plantBase);
        circle(ctx, px + Math.floor(s * 0.5),  py + Math.floor(s * 0.35), Math.floor(s * 0.3),  C.plantBase);
        /* Highlight */
        circle(ctx, px + Math.floor(s * 0.45), py + Math.floor(s * 0.32), Math.floor(s * 0.14), C.plantLight);
    }

    /* ── Dispatch ────────────────────────────────────────────────── */
    const PAINTERS = {
        /* Interior */
        'floor':     paintFloor,
        'wall':      paintWallInterior,
        'desk':      paintDesk,
        'bed':       paintBed,
        'bookshelf': paintBookshelf,
        'door':      paintDoor,
        'window':    paintWindow,
        /* Exterior */
        'ground':    paintGround,
        'path':      paintPath,
        'stall':     paintStall,
        'lamp':      paintLamp,
        'plant':     paintPlant,
    };

    /* Exterior wall uses the same painter as interior wall */
    PAINTERS['extwall'] = paintExtWall;

    function paint(ctx, tileName, px, py, tileSize) {
        const fn = PAINTERS[tileName];
        if (fn) {
            fn(ctx, px, py, tileSize);
        } else {
            /* Fallback — bright grass so unknowns are visible not black */
            ctx.fillStyle = '#5ab832';
            ctx.fillRect(px, py, tileSize, tileSize);
        }
    }

    return { paint };

})();
