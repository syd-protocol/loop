/* ── sprite-painter.js ───────────────────────────────────────────────
   Canvas-drawn character sprites. No PNG loading, no transparency
   artifacts, fully consistent with the TilePainter tile aesthetic.

   Each painter draws a character at (px, py) at size (w, h).
   Direction: 'down' | 'up' | 'left' | 'right'
   Frame: 0-7 for player walk cycle, 0-1 for NPCs/operatives

   Public API:
     SpritePainter.player(ctx, px, py, w, h, direction, frame)
     SpritePainter.npcFriendly(ctx, px, py, w, h, direction)
     SpritePainter.npcAntagonist(ctx, px, py, w, h, direction)
     SpritePainter.operativeDrifter(ctx, px, py, w, h, direction, frame)
     SpritePainter.operativeDistractor(ctx, px, py, w, h, direction, frame)
     SpritePainter.operativeAnchor(ctx, px, py, w, h, direction, frame)
──────────────────────────────────────────────────────────────────── */

const SpritePainter = (() => {

    /* ── Palette ────────────────────────────────────────────────── */
    const C = {
        /* Player — dark suit, cyan accent, warm skin */
        playerSkin:     '#c8845a',
        playerSkinDark: '#a86840',
        playerSuit:     '#1a1f2e',
        playerSuitMid:  '#252d40',
        playerCyan:     '#00f2ff',
        playerCyanDim:  '#008898',
        playerHair:     '#1a0a00',
        playerShadow:   'rgba(0,0,0,0.25)',

        /* NPC Friendly — gold-trim navy coat */
        npcSkin:        '#c8845a',
        npcCoat:        '#1a2540',
        npcGold:        '#f4c430',
        npcHair:        '#1a0a00',

        /* NPC Antagonist — grey hoodie, glowing eyes */
        antHood:        '#2a3040',
        antBody:        '#1a2030',
        antEyes:        '#00f2ff',
        antShadow:      '#0a1020',

        /* Operative Drifter — dark robes, gold buckle */
        drifterRobe:    '#0a0f1a',
        drifterRobeMid: '#141e30',
        drifterGold:    '#c8a030',
        drifterEyes:    'rgba(0,242,255,0.7)',

        /* Operative Distractor — dark athletic wear */
        distractBody:   '#1a1f2e',
        distractAccent: '#9b5de5',
        distractSkin:   '#c8845a',

        /* Operative Anchor — grey battle armour, red visor */
        anchorArmour:   '#4a4f5a',
        anchorDark:     '#2a2f3a',
        anchorRed:      '#e63b2e',
        anchorRedGlow:  'rgba(230,59,46,0.5)',
    };

    /* ── Drawing helpers ────────────────────────────────────────── */
    function r(ctx, x, y, w, h, col) {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    function circ(ctx, cx, cy, rad, col) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(Math.round(cx), Math.round(cy), rad, 0, Math.PI * 2);
        ctx.fill();
    }

    /* Walk bob offset — gives life to the movement */
    function _bob(frame) {
        /* frames 0,4 = neutral; 2,6 = slight down; 1,3,5,7 = slight up */
        if (frame === 2 || frame === 6) return 1;
        if (frame === 0 || frame === 4) return 0;
        return -1;
    }

    /* Leg swing offset per frame for walk animation */
    function _legSwing(frame) {
        const swings = [0, 1, 2, 1, 0, -1, -2, -1];
        return swings[frame % 8] ?? 0;
    }

    /* ── PLAYER ─────────────────────────────────────────────────── */
    function paintPlayer(ctx, px, py, w, h, dir, frame) {
        const bob  = _bob(frame);
        const swing = _legSwing(frame);

        /* Proportions based on w×h */
        const headR = Math.floor(w * 0.22);
        const cx    = px + w / 2;

        /* Head vertical position */
        const headCY = py + Math.floor(h * 0.22) + bob;

        /* Shadow */
        ctx.globalAlpha = 0.2;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        if (dir === 'down') {
            /* Body */
            r(ctx, cx - w*0.22, headCY + headR, w*0.44, h*0.38, C.playerSuit);
            /* Cyan collar accent */
            r(ctx, cx - w*0.1, headCY + headR, w*0.2, h*0.06, C.playerCyan);
            /* Legs */
            r(ctx, cx - w*0.2, headCY + headR + h*0.38, w*0.17, h*0.28, C.playerSuit);
            r(ctx, cx + w*0.03, headCY + headR + h*0.38, w*0.17, h*0.28, C.playerSuit);
            /* Leg swing hint */
            r(ctx, cx - w*0.2, headCY + headR + h*0.52, w*0.17, h*0.06, C.playerCyanDim);
            /* Arms */
            r(ctx, cx - w*0.38, headCY + headR + h*0.04, w*0.14, h*0.3, C.playerSuit);
            r(ctx, cx + w*0.24, headCY + headR + h*0.04, w*0.14, h*0.3, C.playerSuit);
            /* Head */
            circ(ctx, cx, headCY, headR, C.playerSkin);
            /* Hair */
            r(ctx, cx - headR, headCY - headR, headR*2, headR*0.7, C.playerHair);
            /* Eyes */
            r(ctx, cx - headR*0.45, headCY - headR*0.1, headR*0.3, headR*0.3, '#1a0a00');
            r(ctx, cx + headR*0.15, headCY - headR*0.1, headR*0.3, headR*0.3, '#1a0a00');

        } else if (dir === 'up') {
            /* Body back view */
            r(ctx, cx - w*0.22, headCY + headR, w*0.44, h*0.38, C.playerSuitMid);
            /* Legs */
            r(ctx, cx - w*0.2,  headCY + headR + h*0.38, w*0.17, h*0.28, C.playerSuit);
            r(ctx, cx + w*0.03, headCY + headR + h*0.38, w*0.17, h*0.28, C.playerSuit);
            /* Arms */
            r(ctx, cx - w*0.38, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            r(ctx, cx + w*0.24, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            /* Head (back — just hair) */
            circ(ctx, cx, headCY, headR, C.playerSkin);
            r(ctx, cx - headR, headCY - headR, headR*2, headR*1.3, C.playerHair);

        } else if (dir === 'left') {
            /* Body side */
            r(ctx, cx - w*0.18, headCY + headR, w*0.36, h*0.38, C.playerSuit);
            /* Cyan side stripe */
            r(ctx, cx - w*0.18, headCY + headR + h*0.06, w*0.07, h*0.25, C.playerCyanDim);
            /* Near leg / far leg */
            r(ctx, cx - w*0.15, headCY + headR + h*0.38, w*0.14, h*0.28 - swing, C.playerSuit);
            r(ctx, cx + w*0.02, headCY + headR + h*0.38, w*0.12, h*0.28 + swing, C.playerSuit);
            /* Arm forward */
            r(ctx, cx + w*0.12, headCY + headR + h*0.04, w*0.12, h*0.3 + swing*0.5, C.playerSkin);
            /* Head */
            circ(ctx, cx - w*0.04, headCY, headR, C.playerSkin);
            r(ctx, cx - headR*1.1, headCY - headR, headR*2, headR*0.8, C.playerHair);

        } else { /* right */
            r(ctx, cx - w*0.18, headCY + headR, w*0.36, h*0.38, C.playerSuit);
            r(ctx, cx + w*0.11, headCY + headR + h*0.06, w*0.07, h*0.25, C.playerCyanDim);
            r(ctx, cx - w*0.01, headCY + headR + h*0.38, w*0.14, h*0.28 - swing, C.playerSuit);
            r(ctx, cx - w*0.15, headCY + headR + h*0.38, w*0.12, h*0.28 + swing, C.playerSuit);
            r(ctx, cx - w*0.24, headCY + headR + h*0.04, w*0.12, h*0.3 + swing*0.5, C.playerSkin);
            circ(ctx, cx + w*0.04, headCY, headR, C.playerSkin);
            r(ctx, cx - headR*0.9, headCY - headR, headR*2, headR*0.8, C.playerHair);
        }
    }

    /* ── NPC FRIENDLY ───────────────────────────────────────────── */
    function paintNpcFriendly(ctx, px, py, w, h, dir) {
        const headR = Math.floor(w * 0.22);
        const cx    = px + w / 2;
        const headCY = py + Math.floor(h * 0.22);

        ctx.globalAlpha = 0.2;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        const facing = (dir === 'up') ? -1 : 1;

        /* Coat body */
        r(ctx, cx - w*0.24, headCY + headR, w*0.48, h*0.45, C.npcCoat);
        /* Gold trim */
        r(ctx, cx - w*0.24, headCY + headR, w*0.06, h*0.45, C.npcGold);
        r(ctx, cx + w*0.18, headCY + headR, w*0.06, h*0.45, C.npcGold);
        /* Legs */
        r(ctx, cx - w*0.2,  headCY + headR + h*0.45, w*0.16, h*0.25, C.npcCoat);
        r(ctx, cx + w*0.04, headCY + headR + h*0.45, w*0.16, h*0.25, C.npcCoat);
        /* Head */
        circ(ctx, cx, headCY, headR, C.npcSkin);
        r(ctx, cx - headR, headCY - headR, headR*2, headR*0.8, C.npcHair);
        if (dir !== 'up') {
            r(ctx, cx - headR*0.45, headCY, headR*0.3, headR*0.3, '#1a0a00');
            r(ctx, cx + headR*0.15, headCY, headR*0.3, headR*0.3, '#1a0a00');
        }
    }

    /* ── NPC ANTAGONIST ─────────────────────────────────────────── */
    function paintNpcAntagonist(ctx, px, py, w, h, dir) {
        const cx = px + w / 2;
        const cy = py + h / 2;

        ctx.globalAlpha = 0.2;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        /* Hooded robe body */
        r(ctx, cx - w*0.28, py + h*0.2, w*0.56, h*0.75, C.antBody);
        /* Hood */
        circ(ctx, cx, py + h*0.26, Math.floor(w*0.26), C.antHood);
        r(ctx, cx - w*0.26, py + h*0.15, w*0.52, h*0.22, C.antHood);
        /* Face shadow */
        r(ctx, cx - w*0.14, py + h*0.2, w*0.28, h*0.18, C.antShadow);
        /* Glowing eyes */
        if (dir !== 'up') {
            circ(ctx, cx - w*0.1, py + h*0.28, 2, C.antEyes);
            circ(ctx, cx + w*0.1, py + h*0.28, 2, C.antEyes);
        }
    }

    /* ── OPERATIVE DRIFTER ──────────────────────────────────────── */
    function paintOperativeDrifter(ctx, px, py, w, h, dir, frame) {
        const cx  = px + w / 2;
        const bob = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.25;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.32), '#000');
        ctx.globalAlpha = 1.0;

        /* Large flowing robe */
        r(ctx, cx - w*0.32, py + h*0.22 + bob, w*0.64, h*0.72, C.drifterRobe);
        /* Robe mid highlight */
        r(ctx, cx - w*0.08, py + h*0.28 + bob, w*0.16, h*0.6, C.drifterRobeMid);
        /* Hood */
        circ(ctx, cx, py + h*0.2 + bob, Math.floor(w*0.28), C.drifterRobe);
        /* Gold buckle */
        r(ctx, cx - w*0.06, py + h*0.44 + bob, w*0.12, h*0.06, C.drifterGold);
        /* Eye glow */
        if (dir !== 'up') {
            ctx.globalAlpha = 0.8;
            circ(ctx, cx - w*0.09, py + h*0.25 + bob, 2, C.drifterEyes);
            circ(ctx, cx + w*0.09, py + h*0.25 + bob, 2, C.drifterEyes);
            ctx.globalAlpha = 1.0;
        }
    }

    /* ── OPERATIVE DISTRACTOR ───────────────────────────────────── */
    function paintOperativeDistractor(ctx, px, py, w, h, dir, frame) {
        const headR = Math.floor(w * 0.2);
        const cx    = px + w / 2;
        const headCY = py + Math.floor(h * 0.22);
        const bob   = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.2;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        r(ctx, cx - w*0.22, headCY + headR + bob, w*0.44, h*0.4, C.distractBody);
        /* Purple accent stripe */
        r(ctx, cx - w*0.06, headCY + headR + bob, w*0.12, h*0.4, C.distractAccent);
        r(ctx, cx - w*0.18, headCY + headR + h*0.4 + bob, w*0.15, h*0.26, C.distractBody);
        r(ctx, cx + w*0.03, headCY + headR + h*0.4 + bob, w*0.15, h*0.26, C.distractBody);
        circ(ctx, cx, headCY + bob, headR, C.distractSkin);
        r(ctx, cx - headR, headCY - headR + bob, headR*2, headR*0.8, '#1a0a00');
    }

    /* ── OPERATIVE ANCHOR ───────────────────────────────────────── */
    function paintOperativeAnchor(ctx, px, py, w, h, dir, frame) {
        const cx  = px + w / 2;
        const bob = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.3;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.38), '#000');
        ctx.globalAlpha = 1.0;

        /* Armour body — wider, blockier */
        r(ctx, cx - w*0.32, py + h*0.28 + bob, w*0.64, h*0.42, C.anchorArmour);
        /* Chest plate detail */
        r(ctx, cx - w*0.18, py + h*0.3 + bob,  w*0.36, h*0.2,  C.anchorDark);
        /* Pauldrons */
        r(ctx, cx - w*0.42, py + h*0.26 + bob, w*0.16, h*0.22, C.anchorArmour);
        r(ctx, cx + w*0.26, py + h*0.26 + bob, w*0.16, h*0.22, C.anchorArmour);
        /* Legs */
        r(ctx, cx - w*0.26, py + h*0.7 + bob,  w*0.22, h*0.25, C.anchorArmour);
        r(ctx, cx + w*0.04, py + h*0.7 + bob,  w*0.22, h*0.25, C.anchorArmour);
        /* Helmet */
        r(ctx, cx - w*0.24, py + h*0.1 + bob,  w*0.48, h*0.2,  C.anchorArmour);
        /* Red visor */
        r(ctx, cx - w*0.18, py + h*0.14 + bob, w*0.36, h*0.1,  C.anchorRed);
        ctx.globalAlpha = 0.4;
        r(ctx, cx - w*0.18, py + h*0.14 + bob, w*0.36, h*0.1,  C.anchorRedGlow);
        ctx.globalAlpha = 1.0;
        /* Red chest indicator */
        circ(ctx, cx, py + h*0.42 + bob, 3, C.anchorRed);
    }

    /* ── Public API ─────────────────────────────────────────────── */
    return {
        player:              paintPlayer,
        npcFriendly:         paintNpcFriendly,
        npcAntagonist:       paintNpcAntagonist,
        operativeDrifter:    paintOperativeDrifter,
        operativeDistractor: paintOperativeDistractor,
        operativeAnchor:     paintOperativeAnchor,
    };

})();
