/* ── sprite-painter.js ───────────────────────────────────────────────
   Canvas-drawn character sprites. No PNG, no transparency artifacts.

   Improvements over v1:
   - Player: hair is tapered/rounded, not a full black bar
   - Player: slightly larger head, more defined face
   - NPC Friendly: cleaner coat shape, visible face features
   - NPC Antagonist: more defined hood silhouette, menacing presence
   - Operatives: unchanged (already distinctive)

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
        /* Player */
        playerSkin:     '#c8845a',
        playerSkinDark: '#a86840',
        playerSkinLight:'#d89870',
        playerSuit:     '#1a1f2e',
        playerSuitMid:  '#252d40',
        playerSuitLight:'#2e3850',
        playerCyan:     '#00f2ff',
        playerCyanDim:  '#008898',
        playerHair:     '#2a1200',   /* very dark brown — not pure black */
        playerHairMid:  '#3a1a04',

        /* NPC Friendly — gold-trim navy coat */
        npcSkin:        '#c8845a',
        npcCoat:        '#1a2a4a',
        npcCoatMid:     '#243560',
        npcGold:        '#f4c430',
        npcHair:        '#1a0a00',
        npcTie:         '#00f2ff',

        /* NPC Antagonist — dark grey hoodie, glowing eyes */
        antHood:        '#2a3048',
        antHoodDark:    '#1a2038',
        antBody:        '#1e2840',
        antEyes:        '#00f2ff',
        antShadow:      '#080d18',
        antGlow:        'rgba(0,242,255,0.3)',

        /* Operative Drifter */
        drifterRobe:    '#0a0f1a',
        drifterRobeMid: '#141e30',
        drifterGold:    '#c8a030',
        drifterEyes:    'rgba(0,242,255,0.8)',

        /* Operative Distractor */
        distractBody:   '#1a1f2e',
        distractAccent: '#9b5de5',
        distractSkin:   '#c8845a',

        /* Operative Anchor */
        anchorArmour:   '#4a4f5a',
        anchorArmourLight: '#5a606e',
        anchorDark:     '#2a2f3a',
        anchorRed:      '#e63b2e',
        anchorRedGlow:  'rgba(230,59,46,0.5)',
    };

    /* ── Helpers ────────────────────────────────────────────────── */
    function r(ctx, x, y, w, h, col) {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(x), Math.round(y),
                     Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    }

    function circ(ctx, cx, cy, rad, col) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(Math.round(cx), Math.round(cy), Math.max(1, rad), 0, Math.PI * 2);
        ctx.fill();
    }

    /* Draw tapered hair — wider at top, narrower toward the sides.
       Creates a proper hairline rather than a full-width black bar. */
    function _hairFront(ctx, cx, headCY, headR, col) {
        /* Top cap — rounded hair shape */
        const hw = Math.floor(headR * 1.5);   /* hair width, less than head */
        const hh = Math.floor(headR * 0.55);  /* hair height */
        r(ctx, cx - hw * 0.5, headCY - headR, hw, hh, col);
        /* Side taper — smaller rectangles at the sides of the head */
        r(ctx, cx - headR,          headCY - headR + 1, Math.floor(headR * 0.4), Math.floor(hh * 0.7), col);
        r(ctx, cx + headR * 0.6,    headCY - headR + 1, Math.floor(headR * 0.4), Math.floor(hh * 0.7), col);
    }

    function _hairBack(ctx, cx, headCY, headR, col) {
        /* Back view — full width, slightly taller */
        r(ctx, cx - headR + 1, headCY - headR, headR * 2 - 2, Math.floor(headR * 1.1), col);
    }

    function _hairSide(ctx, cx, headCY, headR, col, facingRight) {
        const hw = Math.floor(headR * 1.5);
        r(ctx, cx - hw * 0.5, headCY - headR, hw, Math.floor(headR * 0.6), col);
    }

    /* Walk bob and leg swing */
    function _bob(frame) {
        if (frame === 2 || frame === 6) return 1;
        if (frame === 0 || frame === 4) return 0;
        return -1;
    }
    function _swing(frame) {
        return [0, 1, 2, 1, 0, -1, -2, -1][frame % 8] ?? 0;
    }

    /* ── PLAYER ─────────────────────────────────────────────────── */
    function paintPlayer(ctx, px, py, w, h, dir, frame) {
        const bob   = _bob(frame);
        const swing = _swing(frame);
        const cx    = px + w / 2;

        /* Slightly larger head for readability */
        const headR  = Math.floor(w * 0.25);
        const headCY = py + Math.floor(h * 0.23) + bob;

        /* Ground shadow */
        ctx.globalAlpha = 0.22;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.28), '#000');
        ctx.globalAlpha = 1.0;

        if (dir === 'down') {
            /* Body — layered for depth */
            r(ctx, cx - w*0.22, headCY + headR,          w*0.44, h*0.36, C.playerSuit);
            r(ctx, cx - w*0.22, headCY + headR,          w*0.44, h*0.06, C.playerSuitLight); /* shoulder highlight */
            /* Cyan collar */
            r(ctx, cx - w*0.09, headCY + headR + h*0.02, w*0.18, h*0.08, C.playerCyan);
            /* Arms */
            r(ctx, cx - w*0.38, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            r(ctx, cx + w*0.24, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            /* Hands */
            r(ctx, cx - w*0.38, headCY + headR + h*0.28, w*0.14, h*0.05, C.playerSkin);
            r(ctx, cx + w*0.24, headCY + headR + h*0.28, w*0.14, h*0.05, C.playerSkin);
            /* Legs — animated */
            const lOff = swing * 0.8;
            r(ctx, cx - w*0.2,  headCY + headR + h*0.36, w*0.17, h*0.28 - lOff, C.playerSuit);
            r(ctx, cx + w*0.03, headCY + headR + h*0.36, w*0.17, h*0.28 + lOff, C.playerSuit);
            /* Shoes */
            r(ctx, cx - w*0.22, headCY + headR + h*0.60, w*0.19, h*0.04, '#0a0a0a');
            r(ctx, cx + w*0.01, headCY + headR + h*0.60, w*0.19, h*0.04, '#0a0a0a');
            /* Head */
            circ(ctx, cx, headCY, headR, C.playerSkin);
            /* Chin/jaw slight darkening */
            ctx.globalAlpha = 0.15;
            r(ctx, cx - headR * 0.6, headCY + headR * 0.3, headR * 1.2, headR * 0.5, '#000');
            ctx.globalAlpha = 1.0;
            /* Eyes */
            r(ctx, cx - headR*0.5, headCY - headR*0.05, headR*0.28, headR*0.28, '#1a0800');
            r(ctx, cx + headR*0.22, headCY - headR*0.05, headR*0.28, headR*0.28, '#1a0800');
            /* Nose hint */
            r(ctx, cx - 1, headCY + headR*0.22, 2, 2, C.playerSkinDark);
            /* Hair — tapered, not a bar */
            _hairFront(ctx, cx, headCY, headR, C.playerHair);

        } else if (dir === 'up') {
            r(ctx, cx - w*0.22, headCY + headR,          w*0.44, h*0.36, C.playerSuitMid);
            r(ctx, cx - w*0.38, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            r(ctx, cx + w*0.24, headCY + headR + h*0.04, w*0.14, h*0.28, C.playerSuit);
            const lOff = swing * 0.8;
            r(ctx, cx - w*0.2,  headCY + headR + h*0.36, w*0.17, h*0.28 - lOff, C.playerSuit);
            r(ctx, cx + w*0.03, headCY + headR + h*0.36, w*0.17, h*0.28 + lOff, C.playerSuit);
            circ(ctx, cx, headCY, headR, C.playerSkin);
            _hairBack(ctx, cx, headCY, headR, C.playerHair);

        } else if (dir === 'left') {
            r(ctx, cx - w*0.18, headCY + headR,          w*0.36, h*0.36, C.playerSuit);
            r(ctx, cx - w*0.18, headCY + headR,          w*0.36, h*0.05, C.playerSuitLight);
            r(ctx, cx - w*0.18, headCY + headR + h*0.04, w*0.07, h*0.22, C.playerCyanDim);
            /* Legs */
            r(ctx, cx - w*0.14, headCY + headR + h*0.36, w*0.14, h*0.26 - swing, C.playerSuit);
            r(ctx, cx + w*0.02, headCY + headR + h*0.36, w*0.12, h*0.26 + swing, C.playerSuitMid);
            /* Arm forward */
            r(ctx, cx + w*0.12, headCY + headR + h*0.06, w*0.11, h*0.26 + swing*0.5, C.playerSkin);
            /* Head */
            circ(ctx, cx - w*0.04, headCY, headR, C.playerSkin);
            /* Eye — side view */
            r(ctx, cx - w*0.04 - headR*0.2, headCY - headR*0.1, headR*0.22, headR*0.22, '#1a0800');
            _hairSide(ctx, cx - w*0.04, headCY, headR, C.playerHair, false);

        } else { /* right */
            r(ctx, cx - w*0.18, headCY + headR,          w*0.36, h*0.36, C.playerSuit);
            r(ctx, cx - w*0.18, headCY + headR,          w*0.36, h*0.05, C.playerSuitLight);
            r(ctx, cx + w*0.11, headCY + headR + h*0.04, w*0.07, h*0.22, C.playerCyanDim);
            r(ctx, cx - w*0.01, headCY + headR + h*0.36, w*0.14, h*0.26 - swing, C.playerSuit);
            r(ctx, cx - w*0.15, headCY + headR + h*0.36, w*0.12, h*0.26 + swing, C.playerSuitMid);
            r(ctx, cx - w*0.24, headCY + headR + h*0.06, w*0.11, h*0.26 + swing*0.5, C.playerSkin);
            circ(ctx, cx + w*0.04, headCY, headR, C.playerSkin);
            r(ctx, cx + w*0.04 - headR*0.05, headCY - headR*0.1, headR*0.22, headR*0.22, '#1a0800');
            _hairSide(ctx, cx + w*0.04, headCY, headR, C.playerHair, true);
        }
    }

    /* ── NPC FRIENDLY ───────────────────────────────────────────── */
    /* Distinguished figure — navy coat with gold trim, clearly a 
       friendly guide/quest-giver archetype. Stands upright, formal. */
    function paintNpcFriendly(ctx, px, py, w, h, dir) {
        const headR  = Math.floor(w * 0.23);
        const cx     = px + w / 2;
        const headCY = py + Math.floor(h * 0.22);

        ctx.globalAlpha = 0.18;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.28), '#000');
        ctx.globalAlpha = 1.0;

        /* Coat body — navy with gold trim lines */
        r(ctx, cx - w*0.24, headCY + headR,          w*0.48, h*0.44, C.npcCoat);
        r(ctx, cx - w*0.24, headCY + headR,          w*0.48, h*0.05, C.npcCoatMid); /* shoulder */
        /* Gold lapel trim — left and right vertical stripes */
        r(ctx, cx - w*0.22, headCY + headR + h*0.05, w*0.05, h*0.38, C.npcGold);
        r(ctx, cx + w*0.17, headCY + headR + h*0.05, w*0.05, h*0.38, C.npcGold);
        /* Tie/front detail */
        r(ctx, cx - w*0.03, headCY + headR + h*0.06, w*0.06, h*0.3, C.npcTie);
        /* Arms */
        r(ctx, cx - w*0.38, headCY + headR + h*0.04, w*0.13, h*0.3, C.npcCoat);
        r(ctx, cx + w*0.25, headCY + headR + h*0.04, w*0.13, h*0.3, C.npcCoat);
        /* Hands */
        r(ctx, cx - w*0.38, headCY + headR + h*0.3,  w*0.13, h*0.05, C.npcSkin);
        r(ctx, cx + w*0.25, headCY + headR + h*0.3,  w*0.13, h*0.05, C.npcSkin);
        /* Legs */
        r(ctx, cx - w*0.2,  headCY + headR + h*0.44, w*0.16, h*0.24, '#0e1828');
        r(ctx, cx + w*0.04, headCY + headR + h*0.44, w*0.16, h*0.24, '#0e1828');
        /* Shoes */
        r(ctx, cx - w*0.22, headCY + headR + h*0.64, w*0.18, h*0.04, '#080808');
        r(ctx, cx + w*0.02, headCY + headR + h*0.64, w*0.18, h*0.04, '#080808');

        /* Head */
        circ(ctx, cx, headCY, headR, C.npcSkin);
        if (dir !== 'up') {
            /* Eyes */
            r(ctx, cx - headR*0.48, headCY - headR*0.05, headR*0.26, headR*0.26, '#1a0800');
            r(ctx, cx + headR*0.22, headCY - headR*0.05, headR*0.26, headR*0.26, '#1a0800');
            /* Smile hint */
            ctx.globalAlpha = 0.5;
            r(ctx, cx - headR*0.3, headCY + headR*0.35, headR*0.6, 1, '#1a0800');
            ctx.globalAlpha = 1.0;
        }
        /* Hair */
        if (dir === 'up') {
            _hairBack(ctx, cx, headCY, headR, C.npcHair);
        } else {
            _hairFront(ctx, cx, headCY, headR, C.npcHair);
        }
    }

    /* ── NPC ANTAGONIST ─────────────────────────────────────────── */
    /* Hooded figure — menacing, faceless, watches the player.
       Represents the Stagnation Faction's presence in the world. */
    function paintNpcAntagonist(ctx, px, py, w, h, dir) {
        const cx = px + w / 2;

        ctx.globalAlpha = 0.25;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        /* Robe body — wide at bottom, tapers toward hood */
        /* Draw as a trapezoid-ish shape using two rects */
        r(ctx, cx - w*0.26, py + h*0.32, w*0.52, h*0.62, C.antBody);
        r(ctx, cx - w*0.22, py + h*0.22, w*0.44, h*0.14, C.antBody);
        /* Robe inner shadow — gives depth */
        ctx.globalAlpha = 0.3;
        r(ctx, cx - w*0.08, py + h*0.34, w*0.16, h*0.58, '#000');
        ctx.globalAlpha = 1.0;

        /* Hood — large oval covering the head entirely */
        circ(ctx, cx, py + h*0.22, Math.floor(w * 0.28), C.antHood);
        r(ctx, cx - w*0.28, py + h*0.1, w*0.56, h*0.18, C.antHood);
        /* Hood shadow interior — face hidden in darkness */
        r(ctx, cx - w*0.18, py + h*0.14, w*0.36, h*0.22, C.antShadow);

        /* Glowing eyes — only hint of life inside the hood */
        if (dir !== 'up') {
            /* Glow aura first */
            ctx.globalAlpha = 0.35;
            circ(ctx, cx - w*0.1, py + h*0.24, 5, C.antGlow);
            circ(ctx, cx + w*0.1, py + h*0.24, 5, C.antGlow);
            ctx.globalAlpha = 1.0;
            /* Eye cores */
            circ(ctx, cx - w*0.1, py + h*0.24, 2, C.antEyes);
            circ(ctx, cx + w*0.1, py + h*0.24, 2, C.antEyes);
        }
    }

    /* ── OPERATIVE DRIFTER ──────────────────────────────────────── */
    function paintOperativeDrifter(ctx, px, py, w, h, dir, frame) {
        const cx  = px + w / 2;
        const bob = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.25;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.32), '#000');
        ctx.globalAlpha = 1.0;

        r(ctx, cx - w*0.32, py + h*0.22 + bob, w*0.64, h*0.72, C.drifterRobe);
        r(ctx, cx - w*0.08, py + h*0.28 + bob, w*0.16, h*0.6,  C.drifterRobeMid);
        circ(ctx, cx, py + h*0.2 + bob, Math.floor(w*0.28), C.drifterRobe);
        r(ctx, cx - w*0.06, py + h*0.44 + bob, w*0.12, h*0.06, C.drifterGold);

        if (dir !== 'up') {
            ctx.globalAlpha = 0.8;
            circ(ctx, cx - w*0.09, py + h*0.25 + bob, 2, C.drifterEyes);
            circ(ctx, cx + w*0.09, py + h*0.25 + bob, 2, C.drifterEyes);
            ctx.globalAlpha = 1.0;
        }
    }

    /* ── OPERATIVE DISTRACTOR ───────────────────────────────────── */
    function paintOperativeDistractor(ctx, px, py, w, h, dir, frame) {
        const headR  = Math.floor(w * 0.2);
        const cx     = px + w / 2;
        const headCY = py + Math.floor(h * 0.22);
        const bob    = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.2;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.3), '#000');
        ctx.globalAlpha = 1.0;

        r(ctx, cx - w*0.22, headCY + headR + bob, w*0.44, h*0.4,  C.distractBody);
        r(ctx, cx - w*0.06, headCY + headR + bob, w*0.12, h*0.4,  C.distractAccent);
        r(ctx, cx - w*0.18, headCY + headR + h*0.4 + bob, w*0.15, h*0.26, C.distractBody);
        r(ctx, cx + w*0.03, headCY + headR + h*0.4 + bob, w*0.15, h*0.26, C.distractBody);
        circ(ctx, cx, headCY + bob, headR, C.distractSkin);
        _hairFront(ctx, cx, headCY + bob, headR, '#1a0a00');
    }

    /* ── OPERATIVE ANCHOR ───────────────────────────────────────── */
    function paintOperativeAnchor(ctx, px, py, w, h, dir, frame) {
        const cx  = px + w / 2;
        const bob = frame === 0 ? 0 : 1;

        ctx.globalAlpha = 0.3;
        circ(ctx, cx, py + h - 2, Math.floor(w * 0.38), '#000');
        ctx.globalAlpha = 1.0;

        /* Armour — blockier, more imposing */
        r(ctx, cx - w*0.32, py + h*0.28 + bob, w*0.64, h*0.42, C.anchorArmour);
        r(ctx, cx - w*0.18, py + h*0.3 + bob,  w*0.36, h*0.2,  C.anchorDark);
        /* Chest highlight */
        r(ctx, cx - w*0.16, py + h*0.31 + bob, w*0.32, h*0.04, C.anchorArmourLight);
        /* Pauldrons */
        r(ctx, cx - w*0.44, py + h*0.24 + bob, w*0.18, h*0.24, C.anchorArmour);
        r(ctx, cx + w*0.26, py + h*0.24 + bob, w*0.18, h*0.24, C.anchorArmour);
        /* Pauldron highlight */
        r(ctx, cx - w*0.44, py + h*0.24 + bob, w*0.18, h*0.04, C.anchorArmourLight);
        r(ctx, cx + w*0.26, py + h*0.24 + bob, w*0.18, h*0.04, C.anchorArmourLight);
        /* Legs */
        r(ctx, cx - w*0.26, py + h*0.7 + bob,  w*0.22, h*0.25, C.anchorArmour);
        r(ctx, cx + w*0.04, py + h*0.7 + bob,  w*0.22, h*0.25, C.anchorArmour);
        /* Helmet */
        r(ctx, cx - w*0.24, py + h*0.1 + bob,  w*0.48, h*0.2,  C.anchorArmour);
        r(ctx, cx - w*0.24, py + h*0.1 + bob,  w*0.48, h*0.04, C.anchorArmourLight);
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